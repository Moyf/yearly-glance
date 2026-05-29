import { CalendarEvent } from "@/src/type/CalendarEvent";
import { BaseEvent, EventType } from "@/src/type/Events";
import { IsoUtils } from "@/src/utils/isoUtils";

export interface DurationWarning {
	eventId: string;
	eventText: string;
	originalDuration: number | undefined;
	reason: string;
}

/**
 * Expands a single event into multiple CalendarEvent objects based on its duration.
 * Only events falling within the given year are included (boundary clipping).
 * Duration is clamped to minimum 1.
 * Returns { events, warning } where warning is non-null if duration was invalid.
 */
export function expandEventByDuration(
	event: BaseEvent,
	eventType: EventType,
	year: number
): { events: CalendarEvent[]; warning: DurationWarning | null } {
	// 优先使用 dateArr[0]（当前年份计算的显示日期），eventDate.isoDate 是用户录入的原始日期
	const baseDate = event.dateArr?.[0] ?? event.eventDate?.isoDate;
	if (!baseDate) return { events: [], warning: null };

	const rawDuration = event.duration ?? 1;

	// Detect invalid duration
	let warning: DurationWarning | null = null;
	const isInvalid =
		!Number.isFinite(rawDuration) ||
		rawDuration <= 0 ||
		!Number.isInteger(rawDuration);
	if (isInvalid) {
		let reason: string;
		if (!Number.isFinite(rawDuration)) reason = `NaN or Infinity`;
		else if (rawDuration <= 0) reason = `duration ${rawDuration} ≤ 0`;
		else reason = `non-integer ${rawDuration}`;

		warning = {
			eventId: event.id,
			eventText: event.text,
			originalDuration: event.duration,
			reason,
		};
	}

	const duration = Math.max(
		1,
		Number.isFinite(rawDuration) ? Math.floor(rawDuration) : 1
	);

	const events: CalendarEvent[] = [];

	for (let dayIndex = 0; dayIndex < duration; dayIndex++) {
		const currentDateISO = IsoUtils.addDaysToLocalDateString(
			baseDate,
			dayIndex
		);

		const currentYear = parseInt(currentDateISO.split("-")[0], 10);
		if (currentYear !== year) continue;

		events.push({
			...event,
			eventType,
			_dayIndex: dayIndex,
			_totalDays: duration,
			_isFirstDay: dayIndex === 0,
			_isLastDay: dayIndex === duration - 1,
			dateArr: [currentDateISO],
		} as CalendarEvent);
	}

	return { events, warning };
}
