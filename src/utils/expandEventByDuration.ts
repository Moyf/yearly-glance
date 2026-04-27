import { CalendarEvent } from "@/src/type/CalendarEvent";
import { BaseEvent, EventType } from "@/src/type/Events";
import { IsoUtils } from "@/src/utils/isoUtils";

/**
 * Expands a single event into multiple CalendarEvent objects based on its duration.
 * Only events falling within the given year are included (boundary clipping).
 * Duration is clamped to minimum 1.
 */
export function expandEventByDuration(
	event: BaseEvent,
	eventType: EventType,
	year: number
): CalendarEvent[] {
	const baseDate = event.eventDate?.isoDate;
	if (!baseDate) return [];

	const rawDuration = event.duration ?? 1;
	const duration = Math.max(
		1,
		Number.isFinite(rawDuration) ? Math.floor(rawDuration) : 1
	);

	const results: CalendarEvent[] = [];

	for (let dayIndex = 0; dayIndex < duration; dayIndex++) {
		const currentDate = new Date(baseDate);
		currentDate.setDate(currentDate.getDate() + dayIndex);
		const currentDateISO = IsoUtils.toLocalDateString(currentDate);

		const currentYear = parseInt(currentDateISO.split("-")[0], 10);
		if (currentYear !== year) continue;

		results.push({
			...event,
			eventType,
			_dayIndex: dayIndex,
			_totalDays: duration,
			_isFirstDay: dayIndex === 0,
			_isLastDay: dayIndex === duration - 1,
			eventDate: {
				...event.eventDate,
				isoDate: currentDateISO,
			},
			dateArr: undefined,
		} as CalendarEvent);
	}

	return results;
}
