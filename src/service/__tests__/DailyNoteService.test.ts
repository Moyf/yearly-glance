import { App, TFile } from 'obsidian';
import { DailyNoteService } from '../DailyNoteService';
import { EVENT_TYPE_DEFAULT, EventSource } from '../../type/Events';

type MockMomentResult = {
	isValid: () => boolean;
	format: (pattern: string) => string;
};

type MockMoment = (
	input: string,
	format: string,
	strict: boolean
) => MockMomentResult;

function createMockMoment(): MockMoment {
	return (input: string, format: string, strict: boolean) => {
		let isoDate: string | null = null;

		if (strict) {
			if (format === 'YYYY-MM-DD') {
				const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
				if (match) {
					const year = Number(match[1]);
					const month = Number(match[2]);
					const day = Number(match[3]);
					const date = new Date(Date.UTC(year, month - 1, day));
					if (
						date.getUTCFullYear() === year &&
						date.getUTCMonth() === month - 1 &&
						date.getUTCDate() === day
					) {
						isoDate = `${match[1]}-${match[2]}-${match[3]}`;
					}
				}
			}

			if (format === 'YYYYMMDD') {
				const match = input.match(/^(\d{4})(\d{2})(\d{2})$/);
				if (match) {
					const year = Number(match[1]);
					const month = Number(match[2]);
					const day = Number(match[3]);
					const date = new Date(Date.UTC(year, month - 1, day));
					if (
						date.getUTCFullYear() === year &&
						date.getUTCMonth() === month - 1 &&
						date.getUTCDate() === day
					) {
						isoDate = `${match[1]}-${match[2]}-${match[3]}`;
					}
				}
			}
		}

		return {
			isValid: () => isoDate !== null,
			format: () => isoDate ?? 'Invalid date',
		};
	};
}

function createFile(path: string): TFile {
	const parts = path.split('/');
	const name = parts[parts.length - 1];
	const basename = name.endsWith('.md') ? name.slice(0, -3) : name;

	return {
		path,
		name,
		basename,
	} as unknown as TFile;
}

function createAppMock(options: {
	files?: TFile[];
	frontmatterByPath?: Record<string, Record<string, unknown> | undefined>;
	dailyNotesOptions?: { format?: unknown; folder?: unknown };
	periodicDailySettings?: { format?: unknown; folder?: unknown };
} = {}): App {
	const files = options.files ?? [];
	const frontmatterByPath = options.frontmatterByPath ?? {};

	return {
		vault: {
			getMarkdownFiles: jest.fn(() => files),
		},
		metadataCache: {
			getFileCache: jest.fn((file: TFile) => ({
				frontmatter: frontmatterByPath[file.path],
			})),
		},
		internalPlugins: options.dailyNotesOptions
			? {
					plugins: {
						'daily-notes': {
							instance: {
								options: options.dailyNotesOptions,
							},
						},
					},
			  }
			: undefined,
		plugins: options.periodicDailySettings
			? {
					plugins: {
						'periodic-notes': {
							settings: {
								daily: options.periodicDailySettings,
							},
						},
					},
			  }
			: undefined,
	} as unknown as App;
}

describe('DailyNoteService', () => {
	const mockMoment = createMockMoment();

	beforeEach(() => {
		(globalThis as { window?: { moment?: MockMoment } }).window = {
			moment: mockMoment,
		};
	});

	afterEach(() => {
		delete (globalThis as { window?: { moment?: MockMoment } }).window;
	});

	describe('getDailyNoteSettings', () => {
		test('reads daily-notes internal plugin settings with defaults', () => {
			const app = createAppMock({
				dailyNotesOptions: {},
			});

			expect(DailyNoteService.getDailyNoteSettings(app, 'daily-notes')).toEqual({
				format: 'YYYY-MM-DD',
				folder: '',
			});
		});

		test('reads periodic-notes daily settings', () => {
			const app = createAppMock({
				periodicDailySettings: {
					format: 'YYYYMMDD',
					folder: 'Journal/Daily',
				},
			});

			expect(DailyNoteService.getDailyNoteSettings(app, 'periodic-notes')).toEqual({
				format: 'YYYYMMDD',
				folder: 'Journal/Daily',
			});
		});

		test('returns null when target plugin is unavailable', () => {
			const app = createAppMock();

			expect(DailyNoteService.getDailyNoteSettings(app, 'daily-notes')).toBeNull();
		});
	});

	describe('extractDateFromFilename', () => {
		test('parses YYYY-MM-DD with .md extension', () => {
			expect(
				DailyNoteService.extractDateFromFilename('2026-04-27.md', 'YYYY-MM-DD', mockMoment)
			).toBe('2026-04-27');
		});

		test('parses YYYY-MM-DD without extension', () => {
			expect(
				DailyNoteService.extractDateFromFilename('2026-04-27', 'YYYY-MM-DD', mockMoment)
			).toBe('2026-04-27');
		});

		test('parses YYYYMMDD and returns ISO date', () => {
			expect(
				DailyNoteService.extractDateFromFilename('20260427.md', 'YYYYMMDD', mockMoment)
			).toBe('2026-04-27');
		});

		test('returns null for invalid filename', () => {
			expect(
				DailyNoteService.extractDateFromFilename('invalid.md', 'YYYY-MM-DD', mockMoment)
			).toBeNull();
		});

		test('returns null for empty filename', () => {
			expect(
				DailyNoteService.extractDateFromFilename('', 'YYYY-MM-DD', mockMoment)
			).toBeNull();
		});

		test('returns null for invalid month', () => {
			expect(
				DailyNoteService.extractDateFromFilename('2026-13-01.md', 'YYYY-MM-DD', mockMoment)
			).toBeNull();
		});
	});

	describe('parseEventsFromFrontmatter', () => {
		test('returns string array as-is', () => {
			expect(
				DailyNoteService.parseEventsFromFrontmatter({ events: ['A', 'B'] }, 'events')
			).toEqual(['A', 'B']);
		});

		test('returns empty array for missing prop', () => {
			expect(DailyNoteService.parseEventsFromFrontmatter({}, 'events')).toEqual([]);
		});

		test('returns empty array when prop is not an array', () => {
			expect(
				DailyNoteService.parseEventsFromFrontmatter({ events: 'string' }, 'events')
			).toEqual([]);
		});

		test('filters non-string values', () => {
			expect(
				DailyNoteService.parseEventsFromFrontmatter(
					{ events: [1, 'A', null, 'B'] },
					'events'
				)
			).toEqual(['A', 'B']);
		});

		test('trims values and skips empty strings', () => {
			expect(
				DailyNoteService.parseEventsFromFrontmatter(
					{ events: ['  trimmed  ', '  ', ''] },
					'events'
				)
			).toEqual(['trimmed']);
		});

		test('returns empty array for wrong prop name', () => {
			expect(
				DailyNoteService.parseEventsFromFrontmatter({ other: ['A'] }, 'events')
			).toEqual([]);
		});
	});

	describe('buildEventId', () => {
		test('builds id for first item', () => {
			expect(DailyNoteService.buildEventId('2026-04-27', 0)).toBe('dailynote-2026-04-27-0');
		});

		test('builds id for later item', () => {
			expect(DailyNoteService.buildEventId('2026-04-27', 2)).toBe('dailynote-2026-04-27-2');
		});
	});

	describe('buildCalendarEvent', () => {
		test('builds a daily note calendar event with expected fields', () => {
			const event = DailyNoteService.buildCalendarEvent(
				'Pay rent',
				'2026-04-27',
				1,
				'Daily/2026-04-27.md'
			);

			expect(event).toMatchObject({
				id: 'dailynote-2026-04-27-1',
				text: 'Pay rent',
				eventType: 'dailyNoteEvent',
				eventSource: EventSource.DAILYNOTE,
				dateArr: ['2026-04-27'],
				emoji: EVENT_TYPE_DEFAULT.dailyNoteEvent.emoji,
				color: EVENT_TYPE_DEFAULT.dailyNoteEvent.color,
				isRepeat: false,
				remark: 'dailynote:Daily/2026-04-27.md',
				eventDate: {
					isoDate: '2026-04-27',
					calendar: 'GREGORIAN',
					userInput: {
						input: '2026-04-27',
					},
				},
			});
		});
	});

	describe('loadEventsForYear', () => {
		test('loads events for matching year and folder only', async () => {
			const matchingFile = createFile('Daily/2026-04-27.md');
			const otherFolderFile = createFile('Other/2026-04-28.md');
			const otherYearFile = createFile('Daily/2025-04-27.md');

			const app = createAppMock({
				files: [matchingFile, otherFolderFile, otherYearFile],
				frontmatterByPath: {
					'Daily/2026-04-27.md': { events: ['A', ' B '] },
					'Other/2026-04-28.md': { events: ['Ignored'] },
					'Daily/2025-04-27.md': { events: ['Old'] },
				},
				dailyNotesOptions: {
					format: 'YYYY-MM-DD',
					folder: 'Daily',
				},
			});

			const events = await DailyNoteService.loadEventsForYear(
				app,
				2026,
				'daily-notes',
				'events'
			);

			expect(events).toHaveLength(2);
			expect(events.map((event) => event.text)).toEqual(['A', 'B']);
			expect(events.map((event) => event.id)).toEqual([
				'dailynote-2026-04-27-0',
				'dailynote-2026-04-27-1',
			]);
			expect(events.every((event) => event.eventSource === EventSource.DAILYNOTE)).toBe(true);
		});

		test('returns empty array when settings plugin is unavailable', async () => {
			const app = createAppMock({
				files: [createFile('Daily/2026-04-27.md')],
				frontmatterByPath: {
					'Daily/2026-04-27.md': { events: ['A'] },
				},
			});

			await expect(
				DailyNoteService.loadEventsForYear(app, 2026, 'daily-notes', 'events')
			).resolves.toEqual([]);
		});

		test('skips files with invalid frontmatter lists or invalid filenames', async () => {
			const app = createAppMock({
				files: [
					createFile('Daily/invalid.md'),
					createFile('Daily/2026-04-27.md'),
					createFile('Daily/2026-04-28.md'),
				],
				frontmatterByPath: {
					'Daily/invalid.md': { events: ['Ignored'] },
					'Daily/2026-04-27.md': { events: 'not-array' },
					'Daily/2026-04-28.md': { events: ['Keep me'] },
				},
				dailyNotesOptions: {
					format: 'YYYY-MM-DD',
					folder: 'Daily',
				},
			});

			const events = await DailyNoteService.loadEventsForYear(
				app,
				2026,
				'daily-notes',
				'events'
			);

			expect(events).toHaveLength(1);
			expect(events[0].text).toBe('Keep me');
			expect(events[0].remark).toBe('dailynote:Daily/2026-04-28.md');
		});
	});
});
