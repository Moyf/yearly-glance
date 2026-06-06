import {
    BasesView,
    QueryController,
    TFile
} from "obsidian";
import type YearlyGlancePlugin from "@/src/main";
import { YearlyCalendar } from "@/src/components/YearlyCalendar/YearlyCalendar";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { BasesEntry, BasesEventPropertyConfig, BasesValue, BasesViewConfig } from "@/src/type/BasesTypes";
import { YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";
import { EVENT_TYPE_DEFAULT, EventSource } from "@/src/type/Events";
import { syncEventToFrontmatter } from "@/src/service/BasesEventFrontmatterService";
import { DailyNoteService } from "@/src/service/DailyNoteService";
import { logger } from "@/src/utils/logger";

// 定义视图类型
export const VIEW_TYPE_YEARLY_GLANCE_BASES = "yearly-glance-bases-view";

export class YearlyGlanceBasesView extends BasesView {
    readonly type = VIEW_TYPE_YEARLY_GLANCE_BASES;
    scrollEl: HTMLElement;
    private containerEl: HTMLElement;
    glanceEl: HTMLElement;
    plugin: YearlyGlancePlugin;
    private yearlyCalendar: YearlyCalendar | null = null;
    private unsubscribeBus?: () => void;
    private basesEventMap: Map<string, string> = new Map(); // event id -> file path
    private lastConfigSnapshot: string = '';
    private lastDataHash: string = '';
    private updatePending: boolean = false;
    private updateTimer?: number;

    constructor(controller: QueryController, parentEl: HTMLElement, plugin: YearlyGlancePlugin) {
        super(controller);
        this.scrollEl = parentEl.createDiv("yg-bases-view-container");
        this.containerEl = this.scrollEl.createDiv("yg-bases-view-content");
        this.glanceEl = this.containerEl.createDiv("yg-bases-view-glance");
        this.plugin = plugin;

        // 初始化 YearlyCalendar
        this.yearlyCalendar = new YearlyCalendar(this.glanceEl, this.plugin);

        // 仅订阅会影响 Bases 视图的更新
        this.unsubscribeBus = YearlyGlanceBus.subscribeTopics(['bases-data', 'config', 'plugin-data'], () => {
            this.onDataUpdated();
        });
    }

    // onDataUpdated is called by Obsidian whenever there is a configuration
    // or data change in the vault which may affect your view.
    public onDataUpdated(): void {
        // 清除之前的定时器
        if (this.updateTimer !== undefined) {
            window.clearTimeout(this.updateTimer);
        }

        // 防抖：100ms 内只执行一次更新
        this.updateTimer = window.setTimeout(() => {
            this.performUpdate();
        }, 100);
    }

    /**
     * 执行实际的更新操作
     */
    private performUpdate(): void {
        if (this.updatePending) {
            return; // 如果已经有更新在进行，跳过
        }

        this.updatePending = true;

        try {
            // 2. 计算配置快照
            const pluginConfig = this.plugin.getConfig();

            // 1. 读取配置（如果 Bases 配置未设置，回退到插件全局设置）
            const config = {
                inheritPluginData: this.getBooleanConfig('inheritPluginData', false),
                propTitle: this.config.getAsPropertyId('propTitle') || pluginConfig.basesEventTitleProp || null,
                propDate: this.config.getAsPropertyId('propDate') || pluginConfig.basesEventDateProp || null,
                propDuration: this.config.getAsPropertyId('propDuration') || pluginConfig.basesEventDurationProp || null,
                propIcon: this.config.getAsPropertyId('propIcon') || pluginConfig.basesEventIconProp || null,
                propColor: this.config.getAsPropertyId('propColor') || pluginConfig.basesEventColorProp || null,
                propDescription: this.config.getAsPropertyId('propDescription') || pluginConfig.basesEventDescriptionProp || null,
                propPresetType: this.config.getAsPropertyId('propPresetType') || pluginConfig.basesEventPresetTypeProp || null,
                limitHeight: this.getBooleanConfig('limitHeight', false),
                embeddedHeight: this.getNumericConfig('embeddedHeight', 600, 400, 2000),
            };

            const pluginData = this.plugin.getData();

            // 当继承插件数据时，需要包含插件数据的哈希以检测变化
            const pluginDataHash = config.inheritPluginData ? JSON.stringify({
                showHolidays: pluginConfig.showHolidays,
                showBirthdays: pluginConfig.showBirthdays,
                showCustomEvents: pluginConfig.showCustomEvents,
                holidays: pluginData.holidays.map(h => ({
                    id: h.id,
                    text: h.text,
                    emoji: h.emoji,
                    color: h.color,
                    isHidden: h.isHidden,
                    remark: h.remark,
                    isoDate: h.eventDate.isoDate,
                })),
                birthdays: pluginData.birthdays.map(b => ({
                    id: b.id,
                    text: b.text,
                    emoji: b.emoji,
                    color: b.color,
                    isHidden: b.isHidden,
                    remark: b.remark,
                    isoDate: b.eventDate.isoDate,
                })),
                customEvents: pluginData.customEvents.map(c => ({
                    id: c.id,
                    text: c.text,
                    emoji: c.emoji,
                    color: c.color,
                    isHidden: c.isHidden,
                    remark: c.remark,
                    isoDate: c.eventDate.isoDate,
                })),
            }) : null;

            const configSnapshot = JSON.stringify({
                inheritPluginData: config.inheritPluginData,
                propTitle: config.propTitle,
                propDate: config.propDate,
                propDuration: config.propDuration,
                propIcon: config.propIcon,
                propColor: config.propColor,
                propDescription: config.propDescription,
                limitHeight: config.limitHeight,
                embeddedHeight: config.embeddedHeight,
                pluginDataHash,
            });

            // 3. 计算数据哈希
            const entriesToProcess = this.data?.groupedData
                ? this.data.groupedData.flatMap(group => group.entries)
                : this.data?.data || [];
            const dataHash = this.hashData(entriesToProcess, config);

            // 4. 检查是否有实际变化
            const configChanged = this.lastConfigSnapshot !== configSnapshot;
            const dataChanged = this.lastDataHash !== dataHash;

            if (!configChanged && !dataChanged) {
                // 没有实际变化，跳过更新
                this.updatePending = false;
                return;
            }

            // 5. 准备容器（只在首次渲染时）
            if (!this.yearlyCalendar) {
                this.containerEl.empty();
                this.glanceEl = this.containerEl.createDiv("yg-bases-view-glance");
            }

            // 6. 应用高度限制
            if (config.limitHeight && this.isEmbedded()) {
                this.glanceEl.setCssProps({ "--yg-embedded-height": `${config.embeddedHeight}px` });
                this.glanceEl.addClass("yg-height-limited");
            } else {
                this.glanceEl.setCssProps({ "--yg-embedded-height": "" });
                this.glanceEl.removeClass("yg-height-limited");
            }

            // 7. 构建混合数据（同时填充 basesEventMap）
            this.basesEventMap.clear();
            const mixedEvents = this.buildMixedEvents(config);

            // 7.5 如果 inheritPluginData 且 showDailyNoteEvents，异步加载 DailyNote 事件并追加
            if (config.inheritPluginData) {
                const pluginConfig = this.plugin.getConfig();
                if (pluginConfig.showDailyNoteEvents) {
                    DailyNoteService.loadEventsForYear(
                        this.plugin.app,
                        pluginConfig.year,
                        pluginConfig.dailyNoteSource,
                        pluginConfig.dailyNoteEventProp
                    ).then((dailyNoteEvents) => {
                        if (dailyNoteEvents.length > 0) {
                            const allEvents = [...mixedEvents, ...dailyNoteEvents];
                            this.yearlyCalendar?.renderWithEvents(allEvents, config.inheritPluginData);
                        }
                    }).catch((error) => {
                        logger.error("Failed to load daily note events in BasesView", error);
                    });
                }
            }

            // 8. 使用 YearlyCalendar 渲染（复用现有实例，避免闪烁）
            if (!this.yearlyCalendar) {
                this.yearlyCalendar = new YearlyCalendar(this.glanceEl, this.plugin);
            }
            this.yearlyCalendar.renderWithEvents(mixedEvents, config.inheritPluginData);

            // 9. 保存当前快照
            this.lastConfigSnapshot = configSnapshot;
            this.lastDataHash = dataHash;
        } finally {
            this.updatePending = false;
        }
    }

    /**
     * Reads a raw BasesValue for change detection (hashData). Returns null on failure.
     * Uses console.debug (not warn) — this is a high-frequency path for change detection.
     */
    private readRawProp(entry: BasesEntry, propKey: string | null): BasesValue | null {
        if (!propKey) return null;
        try {
            return entry.getValue(propKey);
        } catch (error) {
                    logger.debug(`hashData: failed to read prop for ${entry.file?.name}`, error);
            return null;
        }
    }

    /**
     * Reads an optional Bases property value, returns null if missing, empty, or read fails.
     * Uses console.warn for failures (suitable for buildMixedEvents where we want to know about issues).
     */
    private readOptionalProp(entry: BasesEntry, propKey: string | null, label: string): string | null {
        if (!propKey) return null;
        try {
            const raw = entry.getValue(propKey);
            return raw?.isTruthy() ? raw.toString() : null;
        } catch (error) {
            console.warn(`[YearlyGlance] Failed to read ${label} for ${entry.file.name}:`, error);
            return null;
        }
    }

    /**
     * 计算数据的哈希值，用于检测变化
     */
    private hashData(entries: BasesEntry[], config: BasesViewConfig): string {
        // 只计算影响渲染的关键字段
        const simplifiedEntries = entries.map(entry => {
            const dateValue = this.readRawProp(entry, config.propDate);
            const titleValue = this.readRawProp(entry, config.propTitle);
            const durationValue = this.readRawProp(entry, config.propDuration);
            const iconValue = this.readRawProp(entry, config.propIcon);
            const colorValue = this.readRawProp(entry, config.propColor);
            const descriptionValue = this.readRawProp(entry, config.propDescription);

            return {
                path: entry.file.path,
                date: dateValue ? String(dateValue) : null,
                title: titleValue ? String(titleValue) : null,
                duration: durationValue ? String(durationValue) : null,
                icon: iconValue ? String(iconValue) : null,
                color: colorValue ? String(colorValue) : null,
                description: descriptionValue ? String(descriptionValue) : null,
            };
        });

        // 对数据进行排序以确保顺序不影响哈希
        simplifiedEntries.sort((a, b) => a.path.localeCompare(b.path));

        return JSON.stringify(simplifiedEntries);
    }

    /**
     * 构建混合事件数据：插件数据 + Bases 数据
     */
    private buildMixedEvents(config: BasesViewConfig): CalendarEvent[] {
        const events: CalendarEvent[] = [];

        // 1. 插件数据（如果启用继承）
        if (config.inheritPluginData) {
            const pluginData = this.plugin.getData();
            const pluginConfig = this.plugin.getConfig();

            // 使用插件的全局显示设置
            if (pluginConfig.showHolidays) {
                pluginData.holidays.forEach(h => {
                    if (!h.isHidden) {
                        events.push({ ...h, eventType: 'holiday' });
                    }
                });
            }
            if (pluginConfig.showBirthdays) {
                pluginData.birthdays.forEach(b => {
                    if (!b.isHidden) {
                        events.push({ ...b, eventType: 'birthday' });
                    }
                });
            }
            if (pluginConfig.showCustomEvents) {
                pluginData.customEvents.forEach(c => {
                    if (!c.isHidden) {
                        events.push({ ...c, eventType: 'customEvent' });
                    }
                });
            }
        }

        // 2. Bases 数据
        // 优先使用 groupedData，如果不存在则使用 data
        const entriesToProcess = this.data?.groupedData
            ? this.data.groupedData.flatMap(group => group.entries)
            : this.data?.data || [];

        if (entriesToProcess.length > 0) {
            for (const rawEntry of entriesToProcess) {
                const entry = rawEntry as unknown as BasesEntry;
                // 读取日期（必需字段）
                let dateValue: BasesValue | null = null;
                try {
                    dateValue = config.propDate ? entry.getValue(config.propDate) : null;
                } catch (error) {
                    console.warn(`Failed to read date property for ${entry.file.name}:`, error);
                    continue; // 跳过此条目
                }

                if (!dateValue || !dateValue.isTruthy()) continue;

                // 读取标题（可选字段，回退到文件名）
                const titleFromProp = this.readOptionalProp(entry, config.propTitle, 'title');
                const titleValue = titleFromProp ?? entry.file.name.replace(/\.md$/, '');

                // 读取 duration（可选字段）
                const durationStr = this.readOptionalProp(entry, config.propDuration, 'duration');
                let durationNum = 1;
                if (durationStr) {
                    const parsed = parseInt(durationStr, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                        durationNum = parsed;
                    }
                }

                // 读取拓展属性（图标、颜色、描述）
                const iconValue = this.readOptionalProp(entry, config.propIcon, 'icon');
                const colorValue = this.readOptionalProp(entry, config.propColor, 'color');
                const descriptionValue = this.readOptionalProp(entry, config.propDescription, 'description');

                // 读取预设类型名并反查 presetTypeId
                const presetTypeName = this.readOptionalProp(entry, config.propPresetType, 'event_type');
                const eventPresetTypes = this.plugin.getConfig().eventPresetTypes ?? [];
                let presetTypeId: string | undefined;
                if (presetTypeName) {
                    const matched = eventPresetTypes.find(
                        (pt) => pt.name.trim().toLowerCase() === presetTypeName.trim().toLowerCase()
                    );
                    presetTypeId = matched?.id;
                }

                const event = this.convertBasesEvent(
                    entry,
                    dateValue,
                    titleValue,
                    durationNum,
                    iconValue,
                    colorValue,
                    descriptionValue,
                    entry.file.path,
                    presetTypeId
                );
                if (event) {
                    events.push(event);
                    // 填充 event id 到 file path 的映射，用于 frontmatter 更新
                    this.basesEventMap.set(event.id, entry.file.path);
                }
            }
        }

        return events;
    }

    /**
     * 将 Bases 事件转换为 CalendarEvent 格式
     */
    private convertBasesEvent(
        entry: BasesEntry,
        dateValue: BasesValue | string | Date,
        text: string,
        duration: number,
        icon: string | null,
        color: string | null,
        description: string | null,
        filePath: string,
        presetTypeId?: string
    ): CalendarEvent | null {
        try {
            // 尝试解析日期
            let isoDate: string;

            if (typeof dateValue === 'string') {
                // 如果是字符串，尝试解析为日期
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) return null;
                isoDate = date.toISOString().split('T')[0];
            } else if (dateValue instanceof Date) {
                // 如果已经是 Date 对象
                if (isNaN(dateValue.getTime())) return null;
                isoDate = dateValue.toISOString().split('T')[0];
            } else {
                // 其他类型，尝试转换为字符串再解析
                const dateStr = String(dateValue);
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return null;
                isoDate = date.toISOString().split('T')[0];
            }

            // 使用传入的参数，这些参数已经从配置的属性中读取
            const title = text || entry.file.name;
            const eventDuration = duration || 1;

            // 对于 Bases 数据，我们不限制年份，允许显示所有年份的事件
            // 这样用户可以在 Bases 视图中看到所有数据

            return {
                id: `bases-${filePath}-${isoDate}`,
                text: title,
                sourceFilePath: filePath,
                eventDate: {
                    isoDate,
                    calendar: 'GREGORIAN',
                    userInput: { input: isoDate, calendar: 'GREGORIAN' }
                },
                dateArr: [isoDate],
                duration: eventDuration,
                emoji: icon || EVENT_TYPE_DEFAULT.basesEvent.emoji,
                color: color || EVENT_TYPE_DEFAULT.basesEvent.color,
                isHidden: false,
                remark: description || "",
                eventType: 'basesEvent',
                isRepeat: false,
                eventSource: EventSource.BASES,
                presetTypeId,
            };
        } catch (error) {
            console.warn('Failed to convert Bases event:', error, entry);
            return null;
        }
    }

    /**
     * 获取 Bases 事件对应的文件路径
     */
    getBasesFilePath(eventId: string): string | undefined {
        return this.basesEventMap.get(eventId);
    }

    /**
     * 检查事件是否来自 Bases
     */
    isBasesEvent(eventId: string): boolean {
        return eventId.startsWith('bases-') && this.basesEventMap.has(eventId);
    }

    /**
     * 更新 Bases 事件对应笔记的 frontmatter
     */
    async updateEventFrontmatter(event: CalendarEvent): Promise<void> {
        const filePath = this.getBasesFilePath(event.id);
        if (!filePath) {
            console.warn('No file path found for event:', event.id);
            return;
        }

        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!file || !(file instanceof TFile)) {
            console.warn('File not found or not a TFile:', filePath);
            return;
        }

        const eventDate = event.eventDate?.isoDate;
        if (!eventDate) {
            console.warn('Event has no date:', event.id);
            return;
        }

        const pluginConfig = this.plugin.getConfig();
        const propConfig: BasesEventPropertyConfig = {
            titleProp: this.config.getAsPropertyId('propTitle') || pluginConfig.basesEventTitleProp || "title",
            dateProp: this.config.getAsPropertyId('propDate') || pluginConfig.basesEventDateProp || "event_date",
            durationProp: this.config.getAsPropertyId('propDuration') || pluginConfig.basesEventDurationProp || "duration",
            iconProp: this.config.getAsPropertyId('propIcon') || pluginConfig.basesEventIconProp || "icon",
            colorProp: this.config.getAsPropertyId('propColor') || pluginConfig.basesEventColorProp || "color",
            descriptionProp: this.config.getAsPropertyId('propDescription') || pluginConfig.basesEventDescriptionProp || "description",
            presetTypeProp: pluginConfig.basesEventPresetTypeProp || "event_type",
        };
        const eventPresetTypes = pluginConfig.eventPresetTypes ?? [];

		try {
            await syncEventToFrontmatter(this.app, file, event, propConfig, eventPresetTypes);
            YearlyGlanceBus.publish('bases-data');
        } catch (error) {
            console.error('Failed to update frontmatter:', error);
        }
    }

    /**
     * 获取数字类型配置，带验证和范围限制
     * @param key 配置键
     * @param defaultValue 默认值
     * @param min 最小值（可选）
     * @param max 最大值（可选）
     * @returns 验证后的数字值
     */
    private getNumericConfig(key: string, defaultValue: number, min?: number, max?: number): number {
        const value = this.config.get(key);
        if (value == null || typeof value !== 'number') return defaultValue;

        let result = value;
        if (min !== undefined) result = Math.max(min, result);
        if (max !== undefined) result = Math.min(max, result);
        return result;
    }

    /**
     * 获取布尔类型配置，带默认值
     * @param key 配置键
     * @param defaultValue 默认值
     * @returns 布尔值
     */
    private getBooleanConfig(key: string, defaultValue: boolean): boolean {
        const value = this.config.get(key);
        if (value == null) return defaultValue;
        return value === true;
    }

    /**
     * Check if this view is embedded in a markdown file
     * If embedded, we may want to adjust rendering or behavior
    */
    isEmbedded(): boolean {
            // Check if this map view is embedded in a markdown file rather than opened directly
            // If the scrollEl has a parent with 'bases-embed' class, it's embedded
            let element = this.scrollEl.parentElement;
            while (element) {
                if (element.hasClass('bases-embed') || element.hasClass('block-language-base')) {
                    return true;
                }
                element = element.parentElement;
            }
            return false;
    }

    /**
     * Clean up resources when the view is destroyed
     */
    destroy(): void {
        // 清理总线订阅
        if (this.unsubscribeBus) {
            this.unsubscribeBus();
            this.unsubscribeBus = undefined;
        }

        // 销毁日历实例
        if (this.yearlyCalendar) {
            this.yearlyCalendar.destroy();
            this.yearlyCalendar = null;
        }

        // 清理事件映射
        this.basesEventMap.clear();
    }
}
