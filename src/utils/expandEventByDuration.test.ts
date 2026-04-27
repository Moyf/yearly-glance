import { expandEventByDuration } from './expandEventByDuration';
import { BaseEvent, EventType } from '../type/Events';

function makeEvent(isoDate: string, duration?: number): BaseEvent {
	return {
		id: 'test-1',
		text: 'Test Event',
		eventDate: { isoDate, calendar: 'GREGORIAN', userInput: { input: isoDate, calendar: 'GREGORIAN' } },
		duration,
	};
}

describe('expandEventByDuration', () => {
	const eventType: EventType = 'holiday';

	test('Normal expansion: duration=3, date=2025-06-10, year=2025 → 3 events (Jun 10, 11, 12), all year=2025', () => {
		const results = expandEventByDuration(makeEvent('2025-06-10', 3), eventType, 2025);

		expect(results).toHaveLength(3);
		expect(results.map((event) => event.eventDate.isoDate)).toEqual([
			'2025-06-10',
			'2025-06-11',
			'2025-06-12',
		]);
		expect(results.every((event) => event.eventDate.isoDate.startsWith('2025-'))).toBe(true);
	});

	test('Year overflow: date=2025-12-29, duration=5, year=2025 → 3 events (Dec 29, 30, 31 only)', () => {
		const results = expandEventByDuration(makeEvent('2025-12-29', 5), eventType, 2025);

		expect(results).toHaveLength(3);
		expect(results.map((event) => event.eventDate.isoDate)).toEqual([
			'2025-12-29',
			'2025-12-30',
			'2025-12-31',
		]);
	});

	test('Year underflow: date=2024-12-31, duration=5, year=2025 → 4 events (Jan 1, 2, 3, 4 of 2025)', () => {
		const results = expandEventByDuration(makeEvent('2024-12-31', 5), eventType, 2025);

		expect(results).toHaveLength(4);
		expect(results.map((event) => event.eventDate.isoDate)).toEqual([
			'2025-01-01',
			'2025-01-02',
			'2025-01-03',
			'2025-01-04',
		]);
	});

	test('duration=1: → 1 event, _isFirstDay=true, _isLastDay=true', () => {
		const results = expandEventByDuration(makeEvent('2025-06-10', 1), eventType, 2025);

		expect(results).toHaveLength(1);
		expect(results[0]._isFirstDay).toBe(true);
		expect(results[0]._isLastDay).toBe(true);
	});

	test('duration=0: → treated as 1, returns 1 event', () => {
		const results = expandEventByDuration(makeEvent('2025-06-10', 0), eventType, 2025);

		expect(results).toHaveLength(1);
		expect(results[0]._totalDays).toBe(1);
	});

	test('duration=-3: → treated as 1, returns 1 event', () => {
		const results = expandEventByDuration(makeEvent('2025-06-10', -3), eventType, 2025);

		expect(results).toHaveLength(1);
		expect(results[0]._totalDays).toBe(1);
	});

	test('duration=NaN: → treated as 1, returns 1 event', () => {
		const results = expandEventByDuration(makeEvent('2025-06-10', Number.NaN), eventType, 2025);

		expect(results).toHaveLength(1);
		expect(results[0]._totalDays).toBe(1);
	});

	test('missing isoDate: eventDate: { isoDate: \'\', ... } or eventDate: undefined → returns []', () => {
		const emptyIsoDateResults = expandEventByDuration(makeEvent('', 3), eventType, 2025);
		const missingEventDateResults = expandEventByDuration({
			id: 'test-2',
			text: 'Missing Event Date',
			eventDate: undefined as unknown as BaseEvent['eventDate'],
			duration: 3,
		} as BaseEvent, eventType, 2025);

		expect(emptyIsoDateResults).toEqual([]);
		expect(missingEventDateResults).toEqual([]);
	});

	test('Metadata fields: duration=3, verify _dayIndex=0/1/2, _totalDays=3, _isFirstDay on first, _isLastDay on last', () => {
		const results = expandEventByDuration(makeEvent('2025-06-10', 3), eventType, 2025);

		expect(results.map((event) => event._dayIndex)).toEqual([0, 1, 2]);
		expect(results.map((event) => event._totalDays)).toEqual([3, 3, 3]);
		expect(results[0]._isFirstDay).toBe(true);
		expect(results[0]._isLastDay).toBe(false);
		expect(results[1]._isFirstDay).toBe(false);
		expect(results[1]._isLastDay).toBe(false);
		expect(results[2]._isFirstDay).toBe(false);
		expect(results[2]._isLastDay).toBe(true);
	});
});
