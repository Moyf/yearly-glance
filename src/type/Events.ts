import { EventDate } from "./Date";

export interface Events {
	/** 节假日（持久化） */
	holidays: Holiday[];
	/** 系统节假日（内存生成，不持久化） */
	systemHolidays: Holiday[];
	birthdays: Birthday[];
	customEvents: CustomEvent[];
}

export interface BaseEvent {
	id: string;
	text: string;
	eventDate: EventDate;
	/** @deprecated 使用 eventDate.isoDate 替代 */
	date?: string;
	/** @deprecated 使用 eventDate.calendar 替代 */
	dateType?: "SOLAR" | "LUNAR";
	/** 计算后的公历日期数组（运行时生成） */
	dateArr?: string[];
	emoji?: string;
	color?: string;
	remark?: string;
	isHidden?: boolean;
}

/**
 * 节假日类型
 * - public: 法定节假日（放假）
 * - public-work: 法定节假日（调休上班）
 * - solar-term: 节气
 * - festival: 节日（公历节日、农历节日、纪念日等）
 */
export type HolidayDisplayType =
	| "public"
	| "public-work"
	| "solar-term"
	| "festival";

/**
 * 节日接口
 * foundDate?: 节日起源日期, 年月日，年月，年，一般用于计算周年
 * holidayType?: 节假日显示类型，用于区分颜色和图标
 */
export interface Holiday extends BaseEvent {
	foundDate?: string;
	holidayType?: HolidayDisplayType;
}

/**
 * 生日接口
 * nextBirthday: 存放下一次生日(基于当前时间)的公历日期，年月日
 * age?: 年龄(基于当前时间)
 * animal?: 生肖(年月日信息完整前提下)
 * zodiac?: 星座(年月日信息完整前提下)
 */
export interface Birthday extends BaseEvent {
	nextBirthday: string;
	age?: number;
	animal?: string;
	zodiac?: string;
}

/**
 * 自定义事件接口
 * isRepeat: 是否重复
 */
export interface CustomEvent extends BaseEvent {
	isRepeat: boolean;
}

export type EventData = Holiday | Birthday | CustomEvent;

// 事件类型
export type EventType = (typeof EVENT_TYPE_LIST)[number];
export const EVENT_TYPE_LIST = ["customEvent", "birthday", "holiday"] as const;

// 事件类型默认图标
export const EVENT_TYPE_DEFAULT: Record<
	EventType,
	{ emoji: string; color: string }
> = {
	customEvent: { emoji: "📌", color: "#73d13d" },
	birthday: { emoji: "🎂", color: "#fa8c16" },
	holiday: { emoji: "🎉", color: "#ff7875" },
};

export const DEFAULT_EVENTS: Events = {
	holidays: [],
	systemHolidays: [],
	birthdays: [],
	customEvents: [],
};
