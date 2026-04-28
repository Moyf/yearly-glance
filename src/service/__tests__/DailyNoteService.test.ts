import { App, TFile } from 'obsidian';
import { DailyNoteService } from '../DailyNoteService';
import { EVENT_TYPE_DEFAULT, EventSource } from '../../type/Events';
import { CalendarEvent } from '../../type/CalendarEvent';

type MockMomentResult = {
	isValid: () => boolean;
	format: (pattern: string) => string;
	isLeapYear: () => boolean;
	add: (amount: number, unit: string) => MockMomentResult;
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
			isLeapYear: () => false,
			add: () => ({ isValid: () => false, format: () => 'Invalid date', isLeapYear: () => false, add: () => null as unknown as MockMomentResult }),
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

	// 构建 path → file 的映射，供 getAbstractFileByPath 使用
	const fileMap = new Map<string, TFile>();
	files.forEach(f => fileMap.set(f.path, f));

	return {
		vault: {
			getMarkdownFiles: jest.fn(() => files),
			getAbstractFileByPath: jest.fn((path: string) => fileMap.get(path) ?? null),
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

function createWritableAppMock(mockFm: Record<string, unknown>, file: unknown = { path: 'test.md' }): App {
	return {
		vault: {
			getAbstractFileByPath: jest.fn().mockReturnValue(file),
		},
		fileManager: {
			processFrontMatter: jest.fn().mockImplementation((_file, callback) => {
				callback(mockFm);
				return Promise.resolve();
			}),
		},
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
				sourceFilePath: 'Daily/2026-04-27.md',
				dateArr: ['2026-04-27'],
				emoji: EVENT_TYPE_DEFAULT.dailyNoteEvent.emoji,
				color: EVENT_TYPE_DEFAULT.dailyNoteEvent.color,
				isRepeat: false,
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

	describe('getFilePathFromEvent', () => {
		test('returns sourceFilePath when present', () => {
			const event = {
				sourceFilePath: 'Journal/2026-04-27.md',
			} as CalendarEvent;

			expect(DailyNoteService.getFilePathFromEvent(event)).toBe('Journal/2026-04-27.md');
		});

		test('returns file path from dailynote remark', () => {
			const event = {
				remark: 'dailynote:Journal/2026-04-27.md',
			} as CalendarEvent;

			expect(DailyNoteService.getFilePathFromEvent(event)).toBe('Journal/2026-04-27.md');
		});

		test('returns null for non-dailynote remark', () => {
			const event = {
				remark: 'other remark',
			} as CalendarEvent;

			expect(DailyNoteService.getFilePathFromEvent(event)).toBeNull();
		});

		test('returns null for missing or empty remark', () => {
			expect(DailyNoteService.getFilePathFromEvent({} as CalendarEvent)).toBeNull();
			expect(DailyNoteService.getFilePathFromEvent({ remark: '' } as CalendarEvent)).toBeNull();
		});
	});

	describe('assembleTitle', () => {
		test('assembles custom emoji + text', () => {
			expect(DailyNoteService.assembleTitle('🧩', 'Dev work', '📰')).toBe('🧩 Dev work');
		});

		test('does not include default emoji', () => {
			expect(DailyNoteService.assembleTitle('📰', 'No emoji', '📰')).toBe('No emoji');
		});

		test('handles empty emoji', () => {
			expect(DailyNoteService.assembleTitle('', 'Plain text', '📰')).toBe('Plain text');
		});
	});

	describe('updateEventTitle', () => {
		test('replaces matching title in array', async () => {
			const mockFm: Record<string, unknown> = { events: ['A', 'B', 'C'] };
			const app = createWritableAppMock(mockFm);

			await expect(
				DailyNoteService.updateEventTitle(app, 'test.md', 'events', 'B', 'B2')
			).resolves.toBe(true);

			expect(mockFm.events).toEqual(['A', 'B2', 'C']);
		});

		test('does not modify when title is not found', async () => {
			const mockFm: Record<string, unknown> = { events: ['A', 'B', 'C'] };
			const app = createWritableAppMock(mockFm);

			await DailyNoteService.updateEventTitle(app, 'test.md', 'events', 'X', 'X2');

			expect(mockFm.events).toEqual(['A', 'B', 'C']);
		});

		test('does not modify when property is not an array', async () => {
			const mockFm: Record<string, unknown> = { events: 'A' };
			const app = createWritableAppMock(mockFm);

			await DailyNoteService.updateEventTitle(app, 'test.md', 'events', 'A', 'A2');

			expect(mockFm.events).toBe('A');
		});
	});

	describe('addEventToDaily', () => {
		test('appends to existing list', async () => {
			const mockFm: Record<string, unknown> = { events: ['A'] };
			const app = createWritableAppMock(mockFm);

			await expect(
				DailyNoteService.addEventToDaily(app, 'test.md', 'events', 'B')
			).resolves.toBe(true);

			expect(mockFm.events).toEqual(['A', 'B']);
		});

		test('creates a new list when property does not exist', async () => {
			const mockFm: Record<string, unknown> = {};
			const app = createWritableAppMock(mockFm);

			await DailyNoteService.addEventToDaily(app, 'test.md', 'events', 'B');

			expect(mockFm.events).toEqual(['B']);
		});
	});

	describe('removeEventFromDaily', () => {
		test('removes matching title from array', async () => {
			const mockFm: Record<string, unknown> = { events: ['A', 'B', 'C'] };
			const app = createWritableAppMock(mockFm);

			await expect(
				DailyNoteService.removeEventFromDaily(app, 'test.md', 'events', 'B')
			).resolves.toBe(true);

			expect(mockFm.events).toEqual(['A', 'C']);
		});

		test('does not modify when title is not found', async () => {
			const mockFm: Record<string, unknown> = { events: ['A', 'B', 'C'] };
			const app = createWritableAppMock(mockFm);

			await DailyNoteService.removeEventFromDaily(app, 'test.md', 'events', 'X');

			expect(mockFm.events).toEqual(['A', 'B', 'C']);
		});
	});

	describe('loadEventsForYear', () => {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const realMoment = require('moment');

		test('loads events for matching year and folder only', async () => {
			const app = createAppMock({
				files: [
					createFile('Daily/2026-04-27.md'),
				],
				frontmatterByPath: {
					'Daily/2026-04-27.md': { events: ['A', ' B '] },
				},
				dailyNotesOptions: {
					format: 'YYYY-MM-DD',
					folder: 'Daily',
				},
			});

			const events = await DailyNoteService.loadEventsForYear(
				app, 2026, 'daily-notes', 'events', realMoment
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
				DailyNoteService.loadEventsForYear(app, 2026, 'daily-notes', 'events', realMoment)
			).resolves.toEqual([]);
		});

		test('skips dates where file does not exist or frontmatter is invalid', async () => {
			const app = createAppMock({
				files: [
					createFile('Daily/2026-04-28.md'),
				],
				frontmatterByPath: {
					'Daily/2026-04-28.md': { events: ['Keep me'] },
				},
				dailyNotesOptions: {
					format: 'YYYY-MM-DD',
					folder: 'Daily',
				},
			});

			const events = await DailyNoteService.loadEventsForYear(
				app, 2026, 'daily-notes', 'events', realMoment
			);

			expect(events).toHaveLength(1);
			expect(events[0].text).toBe('Keep me');
			expect(events[0].sourceFilePath).toBe('Daily/2026-04-28.md');
		});

		test('supports format with subdirectory (YYYY-MM/YYYY-MM-DD)', async () => {
			const app = createAppMock({
				files: [
					createFile('Journal/2026-04/2026-04-27.md'),
				],
				frontmatterByPath: {
					'Journal/2026-04/2026-04-27.md': { events: ['Subdir event'] },
				},
				dailyNotesOptions: {
					format: 'YYYY-MM/YYYY-MM-DD',
					folder: 'Journal',
				},
			});

			const events = await DailyNoteService.loadEventsForYear(
				app, 2026, 'daily-notes', 'events', realMoment
			);

			expect(events).toHaveLength(1);
			expect(events[0].text).toBe('Subdir event');
		});

		test('extracts emoji from text as event icon, keeps plain text for non-emoji events', async () => {
			const app = createAppMock({
				files: [
					createFile('Daily/2026-04-27.md'),
				],
				frontmatterByPath: {
					'Daily/2026-04-27.md': { events: ['🧩 Dev work', 'No emoji', '🎮 Gaming'] },
				},
				dailyNotesOptions: {
					format: 'YYYY-MM-DD',
					folder: 'Daily',
				},
			});

			const events = await DailyNoteService.loadEventsForYear(
				app, 2026, 'daily-notes', 'events', realMoment
			);

			expect(events).toHaveLength(3);
			// 有 emoji → 提取为图标，文本只保留剩余部分
			expect(events[0].emoji).toBe('🧩');
			expect(events[0].text).toBe('Dev work');
			// 无 emoji → 保留默认 📰
			expect(events[1].emoji).toBe('📰');
			expect(events[1].text).toBe('No emoji');
			// 另一个有 emoji 的
			expect(events[2].emoji).toBe('🎮');
			expect(events[2].text).toBe('Gaming');
		});
	});
});
