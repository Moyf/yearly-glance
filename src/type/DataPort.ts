import { UserDateInput } from "./Date";
import { EventType } from "./Events";

export type ImportFormat = "json";

/**
 * json格式的必要的数据结构
 */
export interface JsonEvent {
	id?: string;
	text: string;
	userInput: UserDateInput;
	emoji?: string;
	color?: string;
	remark?: string;
	isHidden?: boolean;
	// Holiday 和 CustomEvent 的两个独特字段
	foundDate?: string;
	isRepeat?: boolean;
}

export interface ImportJsonEvents {
	holidays?: JsonEvent[];
	birthdays?: JsonEvent[];
	customEvents?: JsonEvent[];
}

export interface JsonEventParse extends JsonEvent {
	eventType: EventType;
	warnings?: string[];
}

export interface JsonEventsParseResult {
	validEvents: JsonEventParse[];
	invalidEvents: JsonEventParse[];
}

export type ExportFormat = "json" | "ics" | "md";
