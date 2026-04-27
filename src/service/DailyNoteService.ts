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

		const moment = momentImpl ?? getMomentFromWindow();
		if (!moment) {
			return null;
		}

		const parsedDate = moment(basename, format, true);
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
			eventDate: {
				isoDate,
				calendar,
				userInput: { input: isoDate },
			},
			dateArr: [isoDate],
			emoji: EVENT_TYPE_DEFAULT.dailyNoteEvent.emoji,
			color: EVENT_TYPE_DEFAULT.dailyNoteEvent.color,
			isRepeat: false,
			remark: `dailynote:${filePath}`,
		};
	}

	static async loadEventsForYear(
		app: App,
		year: number,
		source: string,
		eventProp: string
	): Promise<CalendarEvent[]> {
		const settings = DailyNoteService.getDailyNoteSettings(app, source);
		if (!settings) {
			return [];
		}

		const normalizedFolder = settings.folder.replace(/\/+$/, '');
		const files = app.vault.getMarkdownFiles();
		const filteredFiles = normalizedFolder
			? files.filter(
				(file) => file.path === normalizedFolder || file.path.startsWith(`${normalizedFolder}/`)
			  )
			: files;

		const events: CalendarEvent[] = [];

		for (const file of filteredFiles) {
			const isoDate = DailyNoteService.extractDateFromFilename(file.name, settings.format);
			if (!isoDate || !isoDate.startsWith(`${year}-`)) {
				continue;
			}

			const frontmatter = DailyNoteService.getFrontmatter(app, file);
			const titles = DailyNoteService.parseEventsFromFrontmatter(frontmatter, eventProp);

			titles.forEach((title, index) => {
				events.push(
					DailyNoteService.buildCalendarEvent(title, isoDate, index, file.path)
				);
			});
		}

		return events;
	}

	private static getFrontmatter(app: App, file: TFile): Record<string, unknown> {
		const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
		return isRecord(frontmatter) ? frontmatter : {};
	}
}
