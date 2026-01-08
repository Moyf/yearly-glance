import {
    BasesView,
    QueryController,
    TFile
} from "obsidian";
import type YearlyGlancePlugin from "@/src/main";
import { YearlyCalendar } from "@/src/components/YearlyCalendar/YearlyCalendar";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";
import { EVENT_TYPE_DEFAULT, EventSource } from "@/src/type/Events";

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

        // 订阅插件数据更新，实现自动刷新
        this.unsubscribeBus = YearlyGlanceBus.subscribe(() => {
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
                this.glanceEl.style.height = `${config.embeddedHeight}px`;
            } else {
                this.glanceEl.style.height = '';
            }

            // 7. 构建混合数据（同时填充 basesEventMap）
            this.basesEventMap.clear();
            const mixedEvents = this.buildMixedEvents(config);

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
     * 计算数据的哈希值，用于检测变化
     */
    private hashData(entries: any[], config: any): string {
        // 只计算影响渲染的关键字段
        const simplifiedEntries = entries.map(entry => {
            let dateValue = null;
            let titleValue = null;
            let durationValue = null;
            let iconValue = null;
            let colorValue = null;
            let descriptionValue = null;

            try {
                dateValue = config.propDate ? entry.getValue(config.propDate) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

            try {
                titleValue = config.propTitle ? entry.getValue(config.propTitle) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

            try {
                durationValue = config.propDuration ? entry.getValue(config.propDuration) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

            try {
                iconValue = config.propIcon ? entry.getValue(config.propIcon) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

            try {
                colorValue = config.propColor ? entry.getValue(config.propColor) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

            try {
                descriptionValue = config.propDescription ? entry.getValue(config.propDescription) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

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
    private buildMixedEvents(config: any): CalendarEvent[] {
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
            for (const entry of entriesToProcess) {
                // 读取日期（必需字段）
                let dateValue: any = null;
                try {
                    dateValue = config.propDate ? entry.getValue(config.propDate) : null;
                } catch (error) {
                    console.warn(`Failed to read date property for ${entry.file.name}:`, error);
                    continue; // 跳过此条目
                }

                if (!dateValue || !dateValue.isTruthy()) continue;

                // 读取标题（可选字段）
                let titleValue = entry.file.name.replace(/\.md$/, '');
                if (config.propTitle) {
                    try {
                        const rawTitle = entry.getValue(config.propTitle);
                        if (rawTitle && rawTitle.isTruthy()) {
                            titleValue = rawTitle.toString();
                        }
                    } catch (error) {
                        console.warn(`Failed to read title for ${entry.file.name}, using filename:`, error);
                    }
                }

                // 读取 duration（可选字段）
                let durationNum = 1;
                if (config.propDuration) {
                    try {
                        const durationValue = entry.getValue(config.propDuration);
                        if (durationValue && durationValue.isTruthy()) {
                            const durationStr = durationValue.toString();
                            const parsed = parseInt(durationStr, 10);
                            if (!isNaN(parsed) && parsed > 0) {
                                durationNum = parsed;
                            }
                        }
                    } catch (error) {
                        console.warn(`Failed to read duration for ${entry.file.name}, using default (1):`, error);
                    }
                }

                // 读取拓展属性（图标、颜色、描述）
                let iconValue: string | null = null;
                if (config.propIcon) {
                    try {
                        const rawIcon = entry.getValue(config.propIcon);
                        if (rawIcon && rawIcon.isTruthy()) {
                            iconValue = rawIcon.toString();
                        }
                    } catch (error) {
                        console.warn(`Failed to read icon for ${entry.file.name}:`, error);
                    }
                }

                let colorValue: string | null = null;
                if (config.propColor) {
                    try {
                        const rawColor = entry.getValue(config.propColor);
                        if (rawColor && rawColor.isTruthy()) {
                            colorValue = rawColor.toString();
                        }
                    } catch (error) {
                        console.warn(`Failed to read color for ${entry.file.name}:`, error);
                    }
                }

                let descriptionValue: string | null = null;
                if (config.propDescription) {
                    try {
                        const rawDescription = entry.getValue(config.propDescription);
                        if (rawDescription && rawDescription.isTruthy()) {
                            descriptionValue = rawDescription.toString();
                        }
                    } catch (error) {
                        console.warn(`Failed to read description for ${entry.file.name}:`, error);
                    }
                }

                const event = this.convertBasesEvent(
                    entry,
                    dateValue,
                    titleValue,
                    durationNum,
                    iconValue,
                    colorValue,
                    descriptionValue,
                    entry.file.path
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
        entry: any,
        dateValue: any,
        text: any,
        duration: number,
        icon: string | null,
        color: string | null,
        description: string | null,
        filePath: string
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
                eventSource: EventSource.BASES
            } as CalendarEvent;
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

        // 使用 eventDate.isoDate 而不是 dateArr（Bases events 可能没有 dateArr）
        const eventDate = event.eventDate?.isoDate;
        if (!eventDate) {
            console.warn('Event has no date:', event.id);
            return;
        }

        try {
            await this.app.fileManager.processFrontMatter(file, (fm) => {
                // 更新 frontmatter 字段
                fm.title = event.text;
                fm.event_date = eventDate;

                // 同步 duration_days 字段（笔记事件使用 duration_days）
                if (event.duration && event.duration > 1) {
                    fm.duration_days = event.duration;
                } else if (fm.duration_days) {
                    delete fm.duration_days;
                }

                // 只有当事件有自定义图标时才更新
                if (event.emoji && event.emoji !== EVENT_TYPE_DEFAULT.basesEvent.emoji) {
                    fm.icon = event.emoji;
                }

                // 只有当事件有自定义颜色时才更新
                if (event.color && event.color !== EVENT_TYPE_DEFAULT.basesEvent.color) {
                    fm.color = event.color;
                }

                // 同步描述字段
                if (event.remark && typeof event.remark === 'string') {
                    fm.description = event.remark;
                } else if (fm.description) {
                    delete fm.description;
                }
            });
            console.log('Frontmatter updated successfully for:', filePath);

            // 同步成功后触发刷新，通知所有订阅者更新视图
            YearlyGlanceBus.publish();
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
     * 获取数组类型配置，自动过滤空值
     * @param key 配置键
     * @returns 字符串数组
     */
    private getArrayConfig(key: string): string[] {
        const value = this.config.get(key);
        if (!value) return [];

        // 处理数组类型
        if (Array.isArray(value)) {
            return value.filter(item => typeof item === 'string' && item.trim().length > 0);
        }

        // 处理单个字符串类型
        if (typeof value === 'string' && value.trim().length > 0) {
            return [value.trim()];
        }

        return [];
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

