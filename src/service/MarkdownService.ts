import { App, TFile, TFolder } from "obsidian";
import {
	BaseEvent,
	Birthday,
	CustomEvent,
	Events,
	EventType,
	Holiday,
} from "@/src/type/Events";
import {
	MarkdownEvent,
	MarkdownExportConfig,
	MarkdownFieldConfig,
} from "@/src/type/DataPort";
import { FrontMatter } from "@/src/utils/frontMatter";

type FrontmatterValue = string | number | boolean | string[] | null | undefined;

export class MarkdownService {
	private app: App;
	private frontMatterService: FrontMatter;

	constructor(app: App) {
		this.app = app;
		this.frontMatterService = new FrontMatter(app);
	}

	/**
	 * 导出事件数据为Markdown文件
	 * @param eventsData 事件数据
	 * @param config Markdown导出配置
	 */
	async exportMarkdownEvents(
		eventsData: Events,
		config: MarkdownExportConfig
	): Promise<{ success: number; failed: number; errors: string[] }> {
		const results = {
			success: 0,
			failed: 0,
			errors: [] as string[],
		};

		// 导出节假日
		if (eventsData.holidays.length > 0) {
			const holidayResult = await this.exportEventType(
				eventsData.holidays,
				"holiday",
				config.holidayFolder,
				config.holidayFields
			);
			results.success += holidayResult.success;
			results.failed += holidayResult.failed;
			results.errors.push(...holidayResult.errors);
		}

		// 导出生日
		if (eventsData.birthdays.length > 0) {
			const birthdayResult = await this.exportEventType(
				eventsData.birthdays,
				"birthday",
				config.birthdayFolder,
				config.birthdayFields
			);
			results.success += birthdayResult.success;
			results.failed += birthdayResult.failed;
			results.errors.push(...birthdayResult.errors);
		}

		// 导出自定义事件
		if (eventsData.customEvents.length > 0) {
			const customResult = await this.exportEventType(
				eventsData.customEvents,
				"customEvent",
				config.customEventFolder,
				config.customEventFields
			);
			results.success += customResult.success;
			results.failed += customResult.failed;
			results.errors.push(...customResult.errors);
		}

		return results;
	}

	/**
	 * 导出指定类型的事件
	 */
	private async exportEventType(
		events: BaseEvent[],
		eventType: EventType,
		folderPath: string,
		fieldConfig: MarkdownFieldConfig
	): Promise<{ success: number; failed: number; errors: string[] }> {
		const results = {
			success: 0,
			failed: 0,
			errors: [] as string[],
		};

		// 确保文件夹存在
		await this.ensureFolderExists(folderPath);

		for (const event of events) {
			try {
				await this.exportSingleEvent(
					event,
					eventType,
					folderPath,
					fieldConfig
				);
				results.success++;
			} catch (error) {
				results.failed++;
				results.errors.push(
					`导出事件 "${event.text}" 失败: ${
						error instanceof Error ? error.message : String(error)
					}`
				);
			}
		}

		return results;
	}

	/**
	 * 导出单个事件为Markdown文件
	 */
	private async exportSingleEvent(
		event: BaseEvent,
		eventType: EventType,
		folderPath: string,
		fieldConfig: MarkdownFieldConfig
	): Promise<void> {
		// 生成安全的文件名
		const fileName = this.sanitizeFileName(event.text) + ".md";
		// 处理根目录路径，避免双斜杠
		const normalizedFolderPath = normalizePath(folderPath);
		const filePath = normalizedFolderPath
			? `${normalizedFolderPath}/${fileName}`
			: fileName;

		// 构建frontmatter数据
		const frontmatterData = this.buildFrontmatterData(
			event,
			eventType,
			fieldConfig
		);

		// 检查文件是否存在
		const existingFile = this.app.vault.getAbstractFileByPath(filePath);

		if (existingFile instanceof TFile) {
			// 文件存在，更新frontmatter
			await this.frontMatterService.updateFrontMatter(
				existingFile,
				(fm) => {
					Object.assign(fm, frontmatterData);
				}
			);
		} else {
			// 文件不存在，创建新文件
			await this.app.vault.create(filePath, "");
			await this.frontMatterService.updateFrontMatter(
				this.app.vault.getAbstractFileByPath(filePath) as TFile,
				(fm) => {
					Object.assign(fm, frontmatterData);
				}
			);
		}
	}

	/**
	 * 构建frontmatter数据
	 */
	private buildFrontmatterData(
		event: BaseEvent,
		eventType: EventType,
		fieldConfig: MarkdownFieldConfig
	): Record<string, FrontmatterValue> {
		const data: Record<string, FrontmatterValue> = {};

		// 基础字段
		if (fieldConfig.id) data.id = event.id;
		if (fieldConfig.isoDate) data.isoDate = event.eventDate.isoDate;
		if (fieldConfig.calendar) data.calendar = event.eventDate.calendar;
		if (fieldConfig.dateArr && event.dateArr) data.dateArr = event.dateArr;
		if (fieldConfig.emoji && event.emoji) data.emoji = event.emoji;
		if (fieldConfig.color && event.color) data.color = event.color;
		if (fieldConfig.remark && event.remark) data.remark = event.remark;
		if (fieldConfig.isHidden) data.isHidden = event.isHidden;

		// 类型特定字段
		switch (eventType) {
			case "holiday": {
				const holiday = event as Holiday;
				if (fieldConfig.foundDate && holiday.foundDate) {
					data.foundDate = holiday.foundDate;
				}
				break;
			}

			case "birthday": {
				const birthday = event as Birthday;
				if (fieldConfig.nextBirthday)
					data.nextBirthday = birthday.nextBirthday;
				if (fieldConfig.age && birthday.age !== undefined)
					data.age = birthday.age;
				if (fieldConfig.animal && birthday.animal)
					data.animal = birthday.animal;
				if (fieldConfig.zodiac && birthday.zodiac)
					data.zodiac = birthday.zodiac;
				break;
			}

			case "customEvent": {
				const customEvent = event as CustomEvent;
				if (fieldConfig.isRepeat !== undefined)
					data.isRepeat = customEvent.isRepeat;
				break;
			}
		}

		// 添加导出时间戳
		data.exportedAt = new Date().toLocaleString();

		return data;
	}

	/**
	 * 清理文件名，移除不安全字符
	 */
	private sanitizeFileName(filename: string): string {
		// 移除或替换不安全的文件名字符
		return filename
			.replace(/[<>:"/\\|?*]/g, "-") // 替换不安全字符为连字符
			.replace(/\s+/g, " ") // 压缩多个空格
			.trim()
			.substring(0, 200); // 限制长度
	}

	/**
	 * 确保文件夹存在，不存在则创建
	 */
	private async ensureFolderExists(folderPath: string): Promise<void> {
		// 如果是根目录，无需创建
		if (folderPath === "/" || folderPath === "") {
			return;
		}

		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		if (!folder) {
			// 文件夹不存在，递归创建
			await this.app.vault.createFolder(folderPath);
		} else if (!(folder instanceof TFolder)) {
			throw new Error(`路径 "${folderPath}" 存在但不是文件夹`);
		}
	}

	/**
	 * 转换事件数据为MarkdownEvent格式
	 */
	static convertToMarkdownEvent(
		event: BaseEvent,
		eventType: EventType
	): MarkdownEvent {
		const baseMarkdownEvent: MarkdownEvent = {
			id: event.id,
			text: event.text,
			isoDate: event.eventDate.isoDate,
			calendar: event.eventDate.calendar,
			dateArr: event.dateArr || [],
			emoji: event.emoji,
			color: event.color,
			remark: event.remark,
			isHidden: event.isHidden || false,
			nextBirthday: "", // 默认值，对于非birthday类型会被覆盖
		};

		switch (eventType) {
			case "holiday": {
				const holiday = event as Holiday;
				return {
					...baseMarkdownEvent,
					foundDate: holiday.foundDate,
				};
			}

			case "birthday": {
				const birthday = event as Birthday;
				return {
					...baseMarkdownEvent,
					nextBirthday: birthday.nextBirthday,
					age: birthday.age,
					animal: birthday.animal,
					zodiac: birthday.zodiac,
				};
			}

			case "customEvent": {
				const customEvent = event as CustomEvent;
				return {
					...baseMarkdownEvent,
					isRepeat: customEvent.isRepeat,
				};
			}

			default:
				return baseMarkdownEvent;
		}
	}
}
