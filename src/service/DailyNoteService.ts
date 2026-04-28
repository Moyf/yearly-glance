import { App, TFile } from 'obsidian';
import { CalendarEvent } from '@/src/type/CalendarEvent';
import { CalendarType } from '@/src/type/Date';
import { EVENT_TYPE_DEFAULT, EventSource, EventType } from '@/src/type/Events';

type DailyNoteSettings = {
	format: string;
	folder: string;
};

type MomentLikeResult = {
	isValid(): boolean;
	format(pattern: string): string;
	isLeapYear(): boolean;
	add(amount: number, unit: string): MomentLikeResult;
};

type MomentLike = (
	input: string,
	format: string,
	strict: boolean
) => MomentLikeResult;

type AppWithDailyPlugins = App & {
	internalPlugins?: unknown;
	plugins?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function getRecordProperty(record: Record<string, unknown>, key: string): Record<string, unknown> | null {
	const value = record[key];
	return isRecord(value) ? value : null;
}

function getStringProperty(record: Record<string, unknown>, key: string): string | null {
	const value = record[key];
	return typeof value === 'string' ? value : null;
}

function getMomentFromWindow(): MomentLike | null {
	const globalWindow = globalThis as typeof globalThis & {
		window?: {
			moment?: unknown;
		};
	};

	const momentValue = globalWindow.window?.moment;
	return typeof momentValue === 'function' ? (momentValue as MomentLike) : null;
}

function isFileLike(value: unknown): value is TFile {
	return isRecord(value) && typeof value.path === 'string';
}

export class DailyNoteService {
	static getDailyNoteSettings(app: App, source: string): DailyNoteSettings | null {
		const extendedApp = app as AppWithDailyPlugins;

		if (source === 'daily-notes') {
			const internalPlugins = extendedApp.internalPlugins;
			if (!isRecord(internalPlugins)) {
				return null;
			}

			const plugins = getRecordProperty(internalPlugins, 'plugins');
			const dailyNotesPlugin = plugins ? getRecordProperty(plugins, 'daily-notes') : null;
			const instance = dailyNotesPlugin ? getRecordProperty(dailyNotesPlugin, 'instance') : null;
			const options = instance ? getRecordProperty(instance, 'options') : null;

			if (!options) {
				return null;
			}

			return {
				format: getStringProperty(options, 'format') ?? 'YYYY-MM-DD',
				folder: getStringProperty(options, 'folder') ?? '',
			};
		}

		if (source === 'periodic-notes') {
			const pluginsRoot = extendedApp.plugins;
			if (!isRecord(pluginsRoot)) {
				return null;
			}

			const plugins = getRecordProperty(pluginsRoot, 'plugins');
			const periodicNotesPlugin = plugins ? getRecordProperty(plugins, 'periodic-notes') : null;
			const settings = periodicNotesPlugin ? getRecordProperty(periodicNotesPlugin, 'settings') : null;
			const daily = settings ? getRecordProperty(settings, 'daily') : null;

			if (!daily) {
				return null;
			}

			return {
				format: getStringProperty(daily, 'format') ?? 'YYYY-MM-DD',
				folder: getStringProperty(daily, 'folder') ?? '',
			};
		}

		return null;
	}

	static extractDateFromFilename(
		filename: string,
		format: string,
		momentImpl?: MomentLike
	): string | null {
		const trimmedFilename = filename.trim();
		if (!trimmedFilename) {
			return null;
		}

		const basename = trimmedFilename.endsWith('.md')
			? trimmedFilename.slice(0, -3)
			: trimmedFilename;

		if (!basename) {
			return null;
		}

		// format 可能包含目录部分（如 "YYYY-MM/YYYY-MM-DD"），只取最后一段作为文件名 format
		const filenameFormat = format.includes('/') ? format.split('/').pop()! : format;

		const moment = momentImpl ?? getMomentFromWindow();
		if (!moment) {
			return null;
		}

		const parsedDate = moment(basename, filenameFormat, true);
		if (!parsedDate.isValid()) {
			return null;
		}

		return parsedDate.format('YYYY-MM-DD');
	}

	static parseEventsFromFrontmatter(
		frontmatter: Record<string, unknown>,
		eventProp: string
	): string[] {
		const rawEvents = frontmatter[eventProp];
		if (!Array.isArray(rawEvents)) {
			return [];
		}

		return rawEvents
			.filter((item): item is string => typeof item === 'string')
			.map((item) => item.trim())
			.filter((item) => item.length > 0);
	}

	static buildEventId(isoDate: string, index: number): string {
		return `dailynote-${isoDate}-${index}`;
	}

	static buildCalendarEvent(
		title: string,
		isoDate: string,
		index: number,
		filePath: string
	): CalendarEvent {
		const eventType: EventType = 'dailyNoteEvent';
		const calendar: CalendarType = 'GREGORIAN';

		return {
			id: DailyNoteService.buildEventId(isoDate, index),
			text: title,
			eventType,
			eventSource: EventSource.DAILYNOTE,
			sourceFilePath: filePath, // 运行时字段，不持久化
			eventDate: {
				isoDate,
				calendar,
				userInput: { input: isoDate },
			},
			dateArr: [isoDate],
			emoji: EVENT_TYPE_DEFAULT.dailyNoteEvent.emoji,
			color: EVENT_TYPE_DEFAULT.dailyNoteEvent.color,
			isRepeat: false,
		};
	}

	static getFilePathFromEvent(event: CalendarEvent): string | null {
		// 优先使用 sourceFilePath（运行时字段）
		if (event.sourceFilePath) {
			return event.sourceFilePath;
		}
		// 兼容旧格式：从 remark 解析（向后兼容）
		if (typeof event.remark === 'string' && event.remark.startsWith('dailynote:')) {
			return event.remark.slice('dailynote:'.length) || null;
		}
		return null;
	}

	static async updateEventTitle(
		app: App,
		filePath: string,
		eventProp: string,
		oldTitleOrIndex: string | number,
		newTitle: string
	): Promise<boolean> {
		const file = app.vault.getAbstractFileByPath(filePath);
		if (!isFileLike(file)) {
			return false;
		}

		await app.fileManager.processFrontMatter(file, (fm) => {
			const rawEvents = fm[eventProp];
			if (!Array.isArray(rawEvents)) {
				return;
			}

			// 支持按 index 直接定位（更稳定）或按标题匹配（兼容）
			const targetIndex = typeof oldTitleOrIndex === 'number'
				? oldTitleOrIndex
				: rawEvents.findIndex(
					(item) => typeof item === 'string' && item.trim() === oldTitleOrIndex.trim()
				);

			if (targetIndex >= 0 && targetIndex < rawEvents.length) {
				rawEvents[targetIndex] = newTitle;
			}
		});

		return true;
	}

	static async addEventToDaily(
		app: App,
		filePath: string,
		eventProp: string,
		title: string
	): Promise<boolean> {
		const file = app.vault.getAbstractFileByPath(filePath);
		if (!isFileLike(file)) {
			return false;
		}

		await app.fileManager.processFrontMatter(file, (fm) => {
			if (!Array.isArray(fm[eventProp])) {
				fm[eventProp] = [];
			}

			(fm[eventProp] as unknown[]).push(title);
		});

		return true;
	}

	static async removeEventFromDaily(
		app: App,
		filePath: string,
		eventProp: string,
		title: string
	): Promise<boolean> {
		const file = app.vault.getAbstractFileByPath(filePath);
		if (!isFileLike(file)) {
			return false;
		}

		await app.fileManager.processFrontMatter(file, (fm) => {
			const rawEvents = fm[eventProp];
			if (!Array.isArray(rawEvents)) {
				return;
			}

			const targetIndex = rawEvents.findIndex(
				(item) => typeof item === 'string' && item.trim() === title.trim()
			);

			if (targetIndex >= 0) {
				rawEvents.splice(targetIndex, 1);
			}
		});

		return true;
	}

	// 匹配开头连续的 emoji 字符，包括变体选择符(VS16)、ZWJ序列、肤色修饰符
	private static readonly EMOJI_PREFIX_REGEX = /^((?:[\p{Emoji_Presentation}\p{Extended_Pictographic}][\uFE0F\u200D\u{1F3FB}-\u{1F3FF}]*)+)\s*/u;

	/**
	 * 从文本中提取 emoji 前缀和剩余文本
	 * "🧩 开发插件" → { emoji: "🧩", text: "开发插件" }
	 * "无emoji文本" → { emoji: null, text: "无emoji文本" }
	 */
	static extractEmojiFromText(title: string): { emoji: string | null; text: string } {
		const match = title.match(DailyNoteService.EMOJI_PREFIX_REGEX);
		if (match) {
			const emoji = match[1];
			const text = title.slice(match[0].length).trim() || title; // 如果去掉后为空则保留原文
			return { emoji, text };
		}
		return { emoji: null, text: title };
	}

	/**
	 * 将 emoji 和文本组装成 frontmatter 存储格式
	 * - 默认 emoji（如 📰）不写入，避免冗余
	 * - 有效的自定义 emoji 才拼合到文本前面
	 *
	 * assembleTitle("🧩", "Dev work", "📰") → "🧩 Dev work"
	 * assembleTitle("📰", "No emoji", "📰") → "No emoji"   （默认 emoji，不拼合）
	 * assembleTitle("", "No emoji", "📰")   → "No emoji"
	 */
	static assembleTitle(emoji: string | null | undefined, text: string, defaultEmoji: string): string {
		const effectiveEmoji = emoji && emoji !== defaultEmoji ? emoji : '';
		return effectiveEmoji ? `${effectiveEmoji} ${text}` : text;
	}

	/**
	 * 从 CalendarEvent 中读取 emoji，过滤掉默认图标（默认图标表示原文无 emoji）
	 */
	static getEffectiveEmoji(event: CalendarEvent, defaultEmoji: string): string {
		const emoji = event.emoji || '';
		return emoji !== defaultEmoji ? emoji : '';
	}

	static async loadEventsForYear(
		app: App,
		year: number,
		source: string,
		eventProp: string,
		momentImpl?: MomentLike
	): Promise<CalendarEvent[]> {
		const settings = DailyNoteService.getDailyNoteSettings(app, source);
		if (!settings) {
			return [];
		}

		const moment = momentImpl ?? getMomentFromWindow();
		if (!moment) {
			return [];
		}

		const normalizedFolder = settings.folder.replace(/\/+$/, '');
		const events: CalendarEvent[] = [];

		// 直接构造该年份每一天的文件路径，用 getAbstractFileByPath 查找
		// 365 次 hash lookup 比遍历全量文件列表快得多
		const startDate = moment(`${year}-01-01`, 'YYYY-MM-DD', true);
		if (!startDate.isValid()) return [];

		const daysInYear = startDate.isLeapYear() ? 366 : 365;

		for (let dayOffset = 0; dayOffset < daysInYear; dayOffset++) {
			const currentDate = moment(`${year}-01-01`, 'YYYY-MM-DD', true);
			// moment 的 add 会修改原对象，所以每次重新创建
			const date = dayOffset === 0 ? currentDate : currentDate.add(dayOffset, 'days');

			const formattedPath = date.format(settings.format);
			const filePath = normalizedFolder
				? `${normalizedFolder}/${formattedPath}.md`
				: `${formattedPath}.md`;

			const file = app.vault.getAbstractFileByPath(filePath);
			if (!file || !('basename' in file)) {
				continue;
			}

			const isoDate = date.format('YYYY-MM-DD');
			const frontmatter = DailyNoteService.getFrontmatter(app, file as TFile);
			const titles = DailyNoteService.parseEventsFromFrontmatter(frontmatter, eventProp);

			titles.forEach((title, index) => {
				const event = DailyNoteService.buildCalendarEvent(title, isoDate, index, filePath);
				// 提取文本中的 emoji 作为事件图标显示，剩余部分作为事件文本
				const { emoji, text } = DailyNoteService.extractEmojiFromText(title);
				if (emoji) {
					event.emoji = emoji;
					event.text = text;
				}
				events.push(event);
			});
		}

		return events;
	}

	private static getFrontmatter(app: App, file: TFile): Record<string, unknown> {
		const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
		return isRecord(frontmatter) ? frontmatter : {};
	}
}
