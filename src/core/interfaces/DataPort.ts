import { UserDateInput } from "./Date";
import { EventType } from "./Events";

export type ImportFormat = "json";

/**
 * 通过 JSON 导入数据，事件的必需的信息
 */
export interface ImportJsonEvent {
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

export interface ImportJson {
	holidays?: ImportJsonEvent[];
	birthdays?: ImportJsonEvent[];
	customEvents?: ImportJsonEvent[];
}

export interface ImportJsonEventParse extends ImportJsonEvent {
	eventType: EventType;
	warnings?: string[];
}

export interface ImportJsonEventParseResult {
	validEvents: ImportJsonEventParse[];
	invalidEvents: ImportJsonEventParse[];
}

export type ExportFormat = "json" | "ics" | "md";
