export interface Events {
	holidays: Holiday[];
	birthdays: Birthday[];
	customEvents: CustomEvent[];
}

/**
 * 基础事件接口, 所有事件的基类
 * id: 事件id, 由系统自动生成, 用于唯一标识事件
 * text: 事件名称
 * date: 事件日期, 格式为YYYY,MM,DD
 * 对于公历类型，可能的格式为`2025,1,1`或`1,1`
 * 对于农历类型，可能的格式为`2025,-6,1`(二〇二五年闰六月初一)或`2,1`(二月初一)
 * dateType: 日期类型, 公历或农历
 * dateObj: 基于当前选择年份的公历日期，格式为YYYY-MM-DD，由系统根据date和dateType自动计算
 * emoji: 事件图标
 * color: 事件颜色
 * remark: 事件备注
 */
export interface BaseEvent {
	id: string;
	text: string;
	date: string;
	dateType: "SOLAR" | "LUNAR";
	dateObj?: string;
	emoji?: string;
	color?: string;
	remark?: string;
}

/**
 * 节日接口
 * type: 节日类型, 内置节日或自定义添加的节日
 * isShow: 是否在年历中显示，
 * foundDate?: 节日起源日期, 年月日，年月，年，一般用于计算周年
 */
export interface Holiday extends BaseEvent {
	type: "INTERNAT" | "CUSTOM";
	isShow: boolean;
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
	holidays: [], // 内置节日将通过验证和合并机制添加
	birthdays: [],
	customEvents: [],
};
