import {
    BasesView,
    QueryController,
    TFile
} from "obsidian";
import type YearlyGlancePlugin from "@/src/main";
import { YearlyCalendar } from "@/src/components/YearlyCalendar/YearlyCalendar";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { IsoUtils } from "@/src/utils/isoUtils";
import { YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";
import { EventSource } from "@/src/type/Events";

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
        const { app } = this;
        const isEmbedded = this.isEmbedded();

        // 1. 读取配置
        const config = {
            inheritPluginData: this.config.get('inheritPluginData') === true,
            propTitle: String(this.config.get('propTitle') || 'title'),
            propDate: String(this.config.get('propDate') || 'date')
        };

        // 2. 准备容器
        this.containerEl.empty();
        this.glanceEl = this.containerEl.createDiv("yg-bases-view-glance");
        this.glanceEl.style.height = isEmbedded ? '400px' : '';

        // 3. 销毁旧实例
        if (this.yearlyCalendar) {
            this.yearlyCalendar.destroy();
        }

        // 4. 构建混合数据（同时填充 basesEventMap）
        this.basesEventMap.clear();
        const mixedEvents = this.buildMixedEvents(config);

        // 5. 使用 YearlyCalendar 渲染
        this.yearlyCalendar = new YearlyCalendar(this.glanceEl, this.plugin);

        // 6. 传递混合数据给 YearlyCalendar
        this.yearlyCalendar.renderWithEvents(mixedEvents);
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
                const metadata = this.app.metadataCache.getFileCache(entry.file);
                const dateValue = metadata?.frontmatter?.[config.propDate];

                if (dateValue) {
                    const titleValue = metadata?.frontmatter?.[config.propTitle];
                    const event = this.convertBasesEvent(
                        entry,
                        dateValue,
                        titleValue || entry.file.name,
                        entry.file.path
                    );
                    if (event) {
                        events.push(event);
                        // 填充 event id 到 file path 的映射，用于 frontmatter 更新
                        this.basesEventMap.set(event.id, entry.file.path);
                    }
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
        text: string,
        filePath: string
    ): CalendarEvent | null {
        try {
            // 获取文件的元数据和 frontmatter
            const metadata = this.app.metadataCache.getFileCache(entry.file);
            const frontmatter = metadata?.frontmatter || {};

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

            // 从 frontmatter 读取属性
            const title = frontmatter.title || text;
            const icon = frontmatter.icon;
            const color = frontmatter.color;
            const description = frontmatter.description;
            const duration = frontmatter.duration_days || frontmatter.duration || frontmatter.event_duration || 1;

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
                duration: duration, // 添加 duration 字段
                emoji: icon || '📄',
                color: color || '#52c41a',
                isHidden: false,
                remark: description || `From Bases: ${filePath}`,
                eventType: 'customEvent',
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
                if (event.emoji && event.emoji !== '📄') {
                    fm.icon = event.emoji;
                }

                // 只有当事件有自定义颜色时才更新
                if (event.color && event.color !== '#52c41a') {
                    fm.color = event.color;
                }

                // 只有当 remark 不是默认值且不是来自 Bases 的说明时才更新为 description
                if (event.remark && !event.remark.startsWith('From Bases:')) {
                    fm.description = event.remark;
                }
            });
            console.log('Frontmatter updated successfully for:', filePath);
        } catch (error) {
            console.error('Failed to update frontmatter:', error);
        }
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

