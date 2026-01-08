import { App, TFile } from "obsidian";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { EventSource } from "@/src/type/Events";
import { EVENT_TYPE_DEFAULT } from "@/src/type/Events";
import { YearlyGlanceSettings } from "@/src/type/Settings";

/**
 * 笔记事件服务
 * 从笔记 frontmatter 加载事件数据，不依赖 Bases API
 */
export class NoteEventService {
	private app: App;
	private config: YearlyGlanceSettings;
	private cache: Map<string, CalendarEvent[]> = new Map();

	constructor(app: App, config: YearlyGlanceSettings) {
		this.app = app;
		this.config = config;
	}

	/**
	 * 从指定路径加载笔记事件
	 * @param folderPath 笔记文件夹路径
	 * @param year 筛选年份（可选）
	 * @returns CalendarEvent[] 笔记事件数组
	 */
	async loadEventsFromPath(
		folderPath: string,
		year?: number
	): Promise<CalendarEvent[]> {
		// 检查缓存
		const cacheKey = this.getCacheKey(folderPath, year);
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey)!;
		}

		// 获取文件夹中的所有 markdown 文件
		const files = this.app.vault.getMarkdownFiles();
		const filteredFiles = folderPath
			? files.filter((f) => f.path.startsWith(folderPath))
			: files;

		const events: CalendarEvent[] = [];

		for (const file of filteredFiles) {
			try {
				const event = await this.parseEventFromFile(file);
				if (event) {
					// 如果指定了年份，只返回该年份的事件
					if (year) {
						const eventYear = this.extractYearFromIsoDate(
							event.eventDate.isoDate
						);
						if (eventYear === year) {
							events.push(event);
						}
					} else {
						events.push(event);
					}
				}
			} catch (error) {
				// 跳过解析失败的文件
				console.warn(
					`[YearlyGlance] Failed to parse event from ${file.path}:`,
					error
				);
			}
		}

		// 缓存结果
		this.cache.set(cacheKey, events);

		return events;
	}

	/**
	 * 从单个笔记文件解析事件
	 */
	private async parseEventFromFile(
		file: TFile
	): Promise<CalendarEvent | null> {
		const frontmatter = await this.getFrontmatter(file);

		// 获取配置的属性名
		const titleProp =
			this.config.basesEventTitleProp || "title";
		const dateProp =
			this.config.basesEventDateProp || "event_date";
		const durationProp =
			this.config.basesEventDurationProp || "duration_days";
		const iconProp =
			this.config.basesEventIconProp || "icon";
		const colorProp =
			this.config.basesEventColorProp || "color";
		const descriptionProp =
			this.config.basesEventDescriptionProp || "description";

		// 读取日期字段（必需）
		const dateValue = frontmatter[dateProp];
		if (!dateValue) {
			return null; // 没有日期字段，跳过
		}

		// 解析日期
		const isoDate = this.parseDateValue(dateValue);
		if (!isoDate) {
			return null; // 日期解析失败，跳过
		}

		// 读取其他字段
		const title = frontmatter[titleProp] || file.basename;
		const duration = frontmatter[durationProp] || 1;
		const icon = frontmatter[iconProp] || null;
		const color = frontmatter[colorProp] || null;
		const description = frontmatter[descriptionProp] || "";

		// 构建事件 ID
		const filePath = file.path;
		const eventId = this.buildEventId(filePath, isoDate);

		return {
			id: eventId,
			text: title,
			eventDate: {
				isoDate,
				calendar: "GREGORIAN",
				userInput: { input: isoDate, calendar: "GREGORIAN" },
			},
			dateArr: [isoDate],
			duration: duration,
			emoji: icon || EVENT_TYPE_DEFAULT.basesEvent.emoji,
			color: color || EVENT_TYPE_DEFAULT.basesEvent.color,
			isHidden: false,
			remark: description || "",
			eventType: "basesEvent",
			isRepeat: false,
			eventSource: EventSource.BASES,
		} as CalendarEvent;
	}

	/**
	 * 获取文件的 frontmatter
	 */
	private async getFrontmatter(file: TFile): Promise<any> {
		return new Promise((resolve) => {
			this.app.fileManager.processFrontMatter(file, (fm) => {
				resolve(fm);
			});
		});
	}

	/**
	 * 解析日期值
	 */
	private parseDateValue(dateValue: any): string | null {
		try {
			if (typeof dateValue === "string") {
				const date = new Date(dateValue);
				if (isNaN(date.getTime())) return null;
				return date.toISOString().split("T")[0];
			} else if (dateValue instanceof Date) {
				if (isNaN(dateValue.getTime())) return null;
				return dateValue.toISOString().split("T")[0];
			} else {
				const dateStr = String(dateValue);
				const date = new Date(dateStr);
				if (isNaN(date.getTime())) return null;
				return date.toISOString().split("T")[0];
			}
		} catch (error) {
			return null;
		}
	}

	/**
	 * 构建事件 ID（与 Bases 视图保持一致）
	 */
	private buildEventId(filePath: string, isoDate: string): string {
		return `bases-${filePath}-${isoDate}`;
	}

	/**
	 * 从 ISO 日期字符串中提取年份
	 */
	private extractYearFromIsoDate(isoDate: string): number | null {
		const match = isoDate.match(/^(\d{4})-/);
		return match ? parseInt(match[1], 10) : null;
	}

	/**
	 * 获取缓存键
	 */
	private getCacheKey(folderPath: string, year?: number): string {
		return `${folderPath}-${year || "all"}`;
	}

	/**
	 * 使缓存失效
	 */
	invalidateCache(): void {
		this.cache.clear();
	}
}
