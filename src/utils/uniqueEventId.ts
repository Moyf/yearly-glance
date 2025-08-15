import { EventType } from "../type/Events";
import { generateUUID } from "./uuid";

export const prefixMap: Record<EventType, string> = {
	birthday: "birth",
	holiday: "holi",
	customEvent: "event",
};

export function generateEventId(eventType?: EventType): string {
	const prefix = eventType ? prefixMap[eventType] : "event";

	return generateUUID({
		prefix: prefix,
	});
}

export function validEventId(eventType?: EventType, id?: string): string {
	const prefix = eventType ? prefixMap[eventType] : "event";

	if (!id) {
		return generateEventId(eventType);
	}

	if (!id.startsWith(`${prefix}-`)) {
		return `${prefix}-${id}`;
	}

	return id;
}
