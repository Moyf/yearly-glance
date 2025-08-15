import { CalendarType, UserDateInput } from "./Date";
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

export interface MarkdownEvent {
	id: string;
	text: string;
	isoDate: string;
	calendar: CalendarType;
	dateArr: string[];
	emoji?: string;
	color?: string;
	remark?: string;
	isHidden?: boolean;
	// Holiday 独有字段
	foundDate?: string;
	// Birthday 独有字段
	nextBirthday: string;
	age?: number;
	animal?: string;
	zodiac?: string;
	// CustomEvent 独有字段
	isRepeat?: boolean;
}

// Markdown导出配置
export interface MarkdownExportConfig {
	// 文件夹配置
	holidayFolder: string;
	birthdayFolder: string;
	customEventFolder: string;

	// 字段配置 - 每种事件类型可选择导出哪些字段到frontmatter
	holidayFields: MarkdownFieldConfig;
	birthdayFields: MarkdownFieldConfig;
	customEventFields: MarkdownFieldConfig;
}

export interface MarkdownFieldConfig {
	// 基础字段
	id: boolean;
	isoDate: boolean;
	calendar: boolean;
	dateArr: boolean;
	emoji: boolean;
	color: boolean;
	remark: boolean;
	isHidden: boolean;

	// Holiday 字段
	foundDate?: boolean;

	// Birthday 字段
	nextBirthday?: boolean;
	age?: boolean;
	animal?: boolean;
	zodiac?: boolean;

	// CustomEvent 字段
	isRepeat?: boolean;
}

// 默认Markdown导出配置
export const DEFAULT_MARKDOWN_EXPORT_CONFIG: MarkdownExportConfig = {
	holidayFolder: "Events/Holidays",
	birthdayFolder: "Events/Birthdays",
	customEventFolder: "Events/Custom",

	holidayFields: {
		id: false,
		isoDate: true,
		calendar: true,
		dateArr: true,
		emoji: false,
		color: false,
		remark: true,
		isHidden: false,
		foundDate: true,
	},

	birthdayFields: {
		id: false,
		isoDate: true,
		calendar: true,
		dateArr: true,
		emoji: false,
		color: false,
		remark: true,
		isHidden: false,
		nextBirthday: true,
		age: true,
		animal: true,
		zodiac: true,
	},

	customEventFields: {
		id: false,
		isoDate: true,
		calendar: true,
		dateArr: true,
		emoji: false,
		color: false,
		remark: true,
		isHidden: false,
		isRepeat: true,
	},
};
