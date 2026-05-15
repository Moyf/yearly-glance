import { CalendarEvent } from "@/src/type/CalendarEvent";
import { EventPresetType } from "@/src/type/Settings";
import { EVENT_TYPE_DEFAULT } from "@/src/type/Events";

export interface ResolvedEventDisplay {
	emoji: string;
	color: string;
	presetType?: EventPresetType;
}

export function resolveEventDisplay(
	event: CalendarEvent,
	presetTypes: EventPresetType[]
): ResolvedEventDisplay {
	const preset = event.presetTypeId
		? presetTypes.find((p) => p.id === event.presetTypeId)
		: undefined;
	const fallback = EVENT_TYPE_DEFAULT[event.eventType];
	return {
		emoji: event.emoji ?? preset?.emoji ?? fallback.emoji,
		color: event.color ?? preset?.color ?? fallback.color,
		presetType: preset,
	};
}
