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
	isRepeat: boolean; // 是否重复
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
	nextBirthday: string; // 存放下一次生日的公历日期，年月日
	age?: number; // 年龄
	animal?: string; // 生肖
	zodiac?: string; // 星座
}

// 自定义事件接口
export type CustomEvent = BaseEvent;

// 事件类型
export type EventType = (typeof EVENT_TYPE_LIST)[number];
export const EVENT_TYPE_LIST = ["holiday", "birthday", "custom"] as const;

// 事件类型默认图标
export const EVENT_TYPE_DEFAULT_EMOJI: Record<EventType, string> = {
	holiday: "🎉",
	birthday: "🎂",
	custom: "📅",
};

export const DEFAULT_EVENTS: Events = {
	holidays: [
		{
			date: "01-01",
			dateType: "SOLAR",
			text: "元旦",
			isRepeat: true,
			emoji: "🎉",
			color: "#ff7875",
			type: "INTERNAT",
			isShow: true,
			foundDate: "1949",
		},
	],
	birthdays: [],
	customEvents: [],
};
