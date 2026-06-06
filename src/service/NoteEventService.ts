import { App, TFile } from "obsidian";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { EventSource } from "@/src/type/Events";
import { EVENT_TYPE_DEFAULT } from "@/src/type/Events";
import { YearlyGlanceSettings } from "@/src/type/Settings";

/**
 * 笔记事件服务
 * 从笔记属性加载事件数据，不依赖 Bases API
 */
export class NoteEventService {
	private app: App;
	private config: YearlyGlanceSettings;

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
		// 获取文件夹中的所有 markdown 文件
		const files = this.app.vault.getMarkdownFiles();
		// 规范化路径：
		//   - 空字符串：调用方不应传入（应在调用前判断），此处防御性返回空
		//   - "/"：全库扫描，等同于无过滤
		//   - 其他路径：只扫描该文件夹下的笔记
		const normalizedPath = folderPath?.replace(/^\/+|\/+$/g, "").trim() || "";
		const filteredFiles = normalizedPath
			? files.filter((f) => f.path.startsWith(normalizedPath + "/") || f.path === normalizedPath)
			: files;

		// 提取属性名配置，避免在每个文件解析时重复读取
		const propConfig = {
			titleProp: this.config.basesEventTitleProp || "title",
			dateProp: this.config.basesEventDateProp || "event_date",
			durationProp: this.config.basesEventDurationProp || "duration",
			iconProp: this.config.basesEventIconProp || "icon",
			colorProp: this.config.basesEventColorProp || "color",
			descriptionProp: this.config.basesEventDescriptionProp || "description",
			presetTypeProp: this.config.basesEventPresetTypeProp || "event_type",
		};

		const events: CalendarEvent[] = [];

		for (const file of filteredFiles) {
			try {
				const event = this.parseEventFromFile(file, propConfig);
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

		return events;
	}

	/**
	 * 从单个笔记文件解析事件
	 */
	private parseEventFromFile(
		file: TFile,
		propConfig: {
			titleProp: string;
			dateProp: string;
			durationProp: string;
			iconProp: string;
			colorProp: string;
			descriptionProp: string;
			presetTypeProp: string;
		}
	): CalendarEvent | null {
		const frontmatter = (this.app.metadataCache.getFileCache(file)?.frontmatter ?? {}) as Record<string, unknown>;

		const { titleProp, dateProp, durationProp, iconProp, colorProp, descriptionProp, presetTypeProp } = propConfig;

		// 读取日期字段（必需）
		const rawDate = frontmatter[dateProp];
		if (!rawDate) {
			return null;
		}

		const isoDate = this.parseDateValue(rawDate);
		if (!isoDate) {
			return null;
		}

		const rawTitle = frontmatter[titleProp];
		const title = typeof rawTitle === "string" ? rawTitle : file.basename;
		const rawDuration = frontmatter[durationProp];
		const duration = typeof rawDuration === "number" ? rawDuration : 1;
		const rawIcon = frontmatter[iconProp];
		const icon = typeof rawIcon === "string" ? rawIcon : null;
		const rawColor = frontmatter[colorProp];
		const color = typeof rawColor === "string" ? rawColor : null;
		const rawDescription = frontmatter[descriptionProp];
		const description = typeof rawDescription === "string" ? rawDescription : "";
		const rawPresetTypeName = frontmatter[presetTypeProp];

		// 按名称匹配预设类型（大小写不敏感）
		let presetTypeId: string | undefined;
		if (typeof rawPresetTypeName === "string" && rawPresetTypeName) {
			const matched = (this.config.eventPresetTypes ?? []).find(
				(pt) => pt.name.trim().toLowerCase() === rawPresetTypeName.trim().toLowerCase()
			);
			presetTypeId = matched?.id;
		}

		// 构建事件 ID
		const filePath = file.path;
		const eventId = this.buildEventId(filePath, isoDate);

		return {
			id: eventId,
			text: title,
			sourceFilePath: file.path,
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
			presetTypeId,
		};
	}

	/**
	 * 解析日期值
	 */
	private parseDateValue(dateValue: unknown): string | null {
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
		} catch {
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
}
