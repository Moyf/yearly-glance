export interface Events {
	holidays: Holiday[];
	birthdays: Birthday[];
	customEvents: CustomEvent[];
}

// 基础事件接口
export interface BaseEvent {
	text: string; // 事件名称
	// 对于公历类型，可能的格式为`2025,1,1`或`1,1`
	// 对于农历类型，可能的格式为`2025,-6,1`(二〇二五年闰六月初一)或`2,1`(二月初一)
	date: string; // YYYY,MM,DD
	dateType: "SOLAR" | "LUNAR"; // 公历或农历
	dateObj?: string; // 基于当前选择年份的公历日期，格式为YYYY-MM-DD，由系统根据date和dateType自动计算
	emoji?: string; // 事件图标
	color?: string; // 事件颜色
	remark?: string; // 事件备注
}

// 节日接口
export interface Holiday extends BaseEvent {
	type: "INTERNAT" | "CUSTOM"; // 内置节日或自定义添加的节日
	isShow: boolean; // 是否在年历中显示，
	foundDate?: string; // 节日起源日期, 年月日，年月，年，一般用于计算周年
}

// 生日接口
export interface Birthday extends BaseEvent {
	nextBirthday: string; // 存放下一次生日(基于当前时间)的公历日期，年月日
	age?: number; // 年龄(基于当前时间)
	animal?: string; // 生肖(年月日信息完整前提下)
	zodiac?: string; // 星座(年月日信息完整前提下)
}

// 自定义事件接口
export interface CustomEvent extends BaseEvent {
	isRepeat: boolean; // 是否重复
}

// 事件类型
export type EventType = (typeof EVENT_TYPE_LIST)[number];
export const EVENT_TYPE_LIST = ["holiday", "birthday", "customEvent"] as const;

// 事件类型默认图标
export const EVENT_TYPE_DEFAULT: Record<
	EventType,
	{ emoji: string; color: string }
> = {
	holiday: { emoji: "🎉", color: "#ff7875" },
	birthday: { emoji: "🎂", color: "#fa8c16" },
	customEvent: { emoji: "📌", color: "#73d13d" },
};

export const DEFAULT_EVENTS: Events = {
	holidays: [], // 内置节日将通过验证和合并机制添加
	birthdays: [],
	customEvents: [],
};
