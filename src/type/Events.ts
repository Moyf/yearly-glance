import { EventDate } from "./Date";

export interface Events {
	holidays: Holiday[];
	birthdays: Birthday[];
	customEvents: CustomEvent[];
}

// 事件来源类型
export enum EventSource {
	CONFIG = "config",    // 插件配置数据
	BASES = "bases",      // 笔记 frontmatter
	DAILYNOTE = "dailynote", // 日记笔记 frontmatter 列表
	CODEBLOCK = "codeblock" // 代码块（未来支持）
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
	/** 事件持续天数，默认为1（单日事件） */
	duration?: number;
	emoji?: string;
	color?: string;
	remark?: string;
	isHidden?: boolean;
	/** 事件来源 */
	eventSource?: EventSource;
}

/**
 * 节日接口
 * type: 节日类型, 内置节日或自定义添加的节日
 * foundDate?: 节日起源日期, 年月日，年月，年，一般用于计算周年
 */
export interface Holiday extends BaseEvent {
	foundDate?: string;
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
export const EVENT_TYPE_LIST = ["customEvent", "birthday", "holiday", "basesEvent", "dailyNoteEvent"] as const;

// 事件类型默认图标
export const EVENT_TYPE_DEFAULT: Record<
	EventType,
	{ emoji: string; color: string }
> = {
	customEvent: { emoji: "📌", color: "#73d13d" },
	birthday: { emoji: "🎂", color: "#fa8c16" },
	holiday: { emoji: "🎉", color: "#ff7875" },
	basesEvent: { emoji: "📄", color: "#3fabd9" }, // 笔记事件
	dailyNoteEvent: { emoji: "📅", color: "#597ef7" }, // 日记事件
};

export const DEFAULT_EVENTS: Events = {
	holidays: [], // 内置节日将通过验证和合并机制添加
	birthdays: [],
	customEvents: [],
};
