export interface Events {
	holidays: Holiday[];
	birthdays: Birthday[];
	customEvents: CustomEvent[];
}

// 基础事件接口
export interface BaseEvent {
	date: string; // 年月日，月日
	dateType: "SOLAR" | "LUNAR"; // 公历或农历
	text: string; // 事件名称
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
	birthdayInYear: string; // 生日在当前选择年份(config中的year)的公历日期，年月日
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
export const EVENT_TYPE_LIST = ["holiday", "birthday", "custom"] as const;

// 事件类型默认图标
export const EVENT_TYPE_DEFAULT: Record<
	EventType,
	{ emoji: string; color: string }
> = {
	holiday: { emoji: "🎉", color: "#ff7875" },
	birthday: { emoji: "🎂", color: "#fa8c16" },
	custom: { emoji: "📌", color: "#73d13d" },
};

export const DEFAULT_EVENTS: Events = {
	holidays: [
		// TODO: 内置节日数据的添加
		{
			date: "01-01",
			dateType: "SOLAR",
			text: "元旦",
			emoji: EVENT_TYPE_DEFAULT.holiday.emoji,
			color: EVENT_TYPE_DEFAULT.holiday.color,
			type: "INTERNAT",
			isShow: true,
			foundDate: "1949",
		},
	],
	birthdays: [],
	customEvents: [],
};
