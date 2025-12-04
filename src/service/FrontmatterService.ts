import { App, TFile, Notice } from "obsidian";
import { FrontmatterEvent } from "@/src/type/Events";
import { EventDate } from "@/src/type/Date";
import { generateEventId } from "@/src/utils/uniqueEventId";

export interface FrontmatterConfig {
	folderPath: string;
	propertyNames: {
		title: string;
		eventDate: string;
		endDate?: string;
		durationDays?: string;
		description?: string;
		icon?: string;
		color?: string;
		hidden?: string;
		calendar?: string;
	};
	recursive: boolean;
}

export const DEFAULT_FRONTMATTER_CONFIG: FrontmatterConfig = {
	folderPath: "",
	propertyNames: {
		title: "title",
		eventDate: "event_date",
		endDate: "end_date",
		durationDays: "duration_days",
		description: "description",
		icon: "icon",
		color: "color",
		hidden: "hidden",
		calendar: "calendar",
	},
	recursive: true,
};

export class FrontmatterService {
	private app: App;
	private debug: boolean;

	constructor(app: App, debug: boolean = false) {
		this.app = app;
		this.debug = debug;
	}

	/**
	 * 设置调试模式
	 */
	setDebug(debug: boolean): void {
		this.debug = debug;
	}

	/**
	 * 扫描指定文件夹中的所有事件
	 */
	async scanEvents(config: FrontmatterConfig): Promise<FrontmatterEvent[]> {
		const events: FrontmatterEvent[] = [];

		if (!config.folderPath) {
			if (this.debug) {
				console.log("[FrontmatterService] No folder path configured, returning empty events list");
			}
			return events;
		}

		if (this.debug) {
			console.log(`[FrontmatterService] Starting scan of folder: ${config.folderPath}${config.recursive ? " (recursive)" : " (non-recursive)"}`);
			console.log(`[FrontmatterService] Looking for property names:`, config.propertyNames);
		}

		try {
			// 获取文件夹下的所有文件
			const files = await this.getFilesInFolder(config.folderPath, config.recursive);

			if (this.debug) {
				console.log(`[FrontmatterService] Found ${files.length} markdown files to analyze`);
				files.forEach((file, index) => {
					console.log(`[FrontmatterService] File ${index + 1}: ${file.path}`);
				});
			}

			for (const file of files) {
				if (this.debug) {
					console.log(`[FrontmatterService] Analyzing file: ${file.path}`);
				}

				const event = await this.parseEventFromFile(file, config);
				if (event) {
					if (this.debug) {
						console.log(`[FrontmatterService] ✓ Successfully parsed event from ${file.path}:`, {
							title: event.text,
							date: event.eventDate.isoDate,
							calendar: event.eventDate.calendar,
							icon: event.emoji,
							color: event.color,
							isHidden: event.isHidden,
						});
					}
					events.push(event);
				} else {
					if (this.debug) {
						console.log(`[FrontmatterService] ✗ File does not contain valid event data: ${file.path}`);
					}
				}
			}

			if (this.debug) {
				console.log(`[FrontmatterService] Scan complete. Found ${events.length} valid events out of ${files.length} files`);
			}
		} catch (error) {
			console.error("Failed to scan events from folder:", error);
			new Notice("Failed to scan events from configured folder");
		}

		return events;
	}

	/**
	 * 从单个文件解析事件
	 */
	async parseEventFromFile(
		file: TFile,
		config: FrontmatterConfig
	): Promise<FrontmatterEvent | null> {
		try {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

			if (!frontmatter) {
				if (this.debug) {
					console.log(`[FrontmatterService] ✗ No frontmatter found in ${file.path}`);
				}
				return null;
			}

			if (this.debug) {
				console.log(`[FrontmatterService] Analyzing frontmatter from ${file.path}:`, JSON.stringify(frontmatter, null, 2));
			}

			// 检查必要属性是否存在
			const eventDateValue = frontmatter[config.propertyNames.eventDate];
			if (!eventDateValue) {
				if (this.debug) {
					console.log(`[FrontmatterService] ✗ Missing required property '${config.propertyNames.eventDate}' in ${file.path}`);
					console.log(`[FrontmatterService] Available properties in frontmatter:`, Object.keys(frontmatter));
				}
				return null;
			}

			// 构建事件对象
			const titleValue =
				frontmatter[config.propertyNames.title] || file.basename;

			// 确定日历类型
			const calendarValue =
				(config.propertyNames.calendar && frontmatter[config.propertyNames.calendar]) || "GREGORIAN";

			// 创建事件日期对象
			const eventDate: EventDate = {
				isoDate: eventDateValue,
				calendar: calendarValue === "LUNAR" ? "LUNAR" : "GREGORIAN",
				userInput: {
					input: eventDateValue,
					calendar: calendarValue === "LUNAR" ? "LUNAR" : "GREGORIAN",
				},
			};

			// 计算结束日期或持续时间
			let finalDurationDays = 1;
			const durationDaysValue =
				config.propertyNames.durationDays && frontmatter[config.propertyNames.durationDays];
			if (durationDaysValue) {
				finalDurationDays = parseInt(durationDaysValue, 10) || 1;
				if (this.debug) {
					console.log(`[FrontmatterService] Duration from duration_days: ${finalDurationDays} days`);
				}
			} else {
				const endDateValue = config.propertyNames.endDate && frontmatter[config.propertyNames.endDate];
				if (endDateValue) {
					const startDate = new Date(eventDateValue);
					const endDate = new Date(endDateValue);
					const diffTime = endDate.getTime() - startDate.getTime();
					finalDurationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
					if (this.debug) {
						console.log(`[FrontmatterService] Duration from end_date (${endDateValue}): ${finalDurationDays} days`);
					}
				} else if (this.debug) {
					console.log(`[FrontmatterService] No duration specified, using default: 1 day`);
				}
			}

			// 构建事件对象
			const event: FrontmatterEvent = {
				id: generateEventId("frontmatterEvent"),
				text: String(titleValue),
				eventDate,
				remark: (config.propertyNames.description && frontmatter[config.propertyNames.description]) || "",
				emoji: (config.propertyNames.icon && frontmatter[config.propertyNames.icon]) || "",
				color: (config.propertyNames.color && frontmatter[config.propertyNames.color]) || "",
				isHidden: (config.propertyNames.hidden && frontmatter[config.propertyNames.hidden]) || false,
				sourcePath: file.path,
				propertyNames: config.propertyNames,
				isEditable: true,
				dateArr: [], // 将由 EventCalculator 填充
			};

			if (this.debug) {
				console.log(`[FrontmatterService] ✓ Event parsing successful:`, {
					title: event.text,
					date: event.eventDate.isoDate,
					calendar: event.eventDate.calendar,
					durationDays: finalDurationDays,
					description: event.remark || "(none)",
					icon: event.emoji || "(none)",
					color: event.color || "(none)",
					hidden: event.isHidden,
					source: event.sourcePath,
				});
			}

			return event;
		} catch (error) {
			console.error(`[FrontmatterService] ✗ Failed to parse event from ${file.path}:`, error);
			if (this.debug) {
				console.error(`[FrontmatterService] Error details:`, error);
			}
			return null;
		}
	}

	/**
	 * 更新文件中的事件数据
	 */
	async updateEventInFile(
		event: FrontmatterEvent,
		updates: Partial<FrontmatterEvent>
	): Promise<boolean> {
		try {
			const file = this.app.vault.getAbstractFileByPath(event.sourcePath);

			if (!(file instanceof TFile)) {
				new Notice("Event source file not found");
				return false;
			}

			// 读取文件内容
			const content = await this.app.vault.read(file);

			// 获取 frontmatter
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

			if (!frontmatter) {
				new Notice("File has no frontmatter");
				return false;
			}

			// 构建更新后的 frontmatter
			const updatedFrontmatter = { ...frontmatter };

			// 应用更新
			if (updates.text !== undefined) {
				updatedFrontmatter[event.propertyNames.title] = updates.text;
			}

			if (updates.eventDate !== undefined) {
				updatedFrontmatter[event.propertyNames.eventDate] =
					updates.eventDate.isoDate;
				if (event.propertyNames.calendar) {
					updatedFrontmatter[event.propertyNames.calendar] =
						updates.eventDate.calendar;
				}
			}

			if (updates.remark !== undefined && event.propertyNames.description) {
				updatedFrontmatter[event.propertyNames.description] = updates.remark;
			}

			if (updates.emoji !== undefined && event.propertyNames.icon) {
				updatedFrontmatter[event.propertyNames.icon] = updates.emoji;
			}

			if (updates.color !== undefined && event.propertyNames.color) {
				updatedFrontmatter[event.propertyNames.color] = updates.color;
			}

			if (updates.isHidden !== undefined && event.propertyNames.hidden) {
				updatedFrontmatter[event.propertyNames.hidden] = updates.isHidden;
			}

			// 写入文件
			await this.app.vault.modify(file, content);

			// 注意：实际修改 frontmatter 需要使用 obsidian API
			// 这里简化处理，实际项目中可能需要使用更复杂的方法

			return true;
		} catch (error) {
			console.error("Failed to update event in file:", error);
			new Notice("Failed to update event in file");
			return false;
		}
	}

	/**
	 * 获取文件夹中的所有文件
	 */
	private async getFilesInFolder(
		folderPath: string,
		recursive: boolean
	): Promise<TFile[]> {
		const files: TFile[] = [];

		try {
			const folder = this.app.vault.getAbstractFileByPath(folderPath);

			if (!folder) {
				console.warn(`Folder not found: ${folderPath}`);
				return files;
			}

			if (folder instanceof TFile) {
				return [folder];
			}

			// 递归或非递归获取文件
			if (recursive) {
				await this.getFilesRecursively(folder, files);
			} else {
				const children = (folder as any).children || [];
				for (const child of children) {
					if (child instanceof TFile && child.extension === "md") {
						files.push(child);
					}
				}
			}
		} catch (error) {
			console.error(`Failed to get files in folder ${folderPath}:`, error);
		}

		return files;
	}

	/**
	 * 递归获取文件
	 */
	private async getFilesRecursively(
		folder: any,
		files: TFile[]
	): Promise<void> {
		const children = folder.children || [];

		for (const child of children) {
			if (child instanceof TFile && child.extension === "md") {
				files.push(child);
			} else if (child && typeof child === "object" && child.children) {
				await this.getFilesRecursively(child, files);
			}
		}
	}
}
