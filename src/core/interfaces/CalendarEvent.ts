import { BaseEvent, EventType } from "./Events";

// 日历事件接口
export interface CalendarEvent extends BaseEvent {
	type: EventType;
	dateObj: Date;
}

// 日历日期接口
export interface CalendarDay {
	date: Date;
	dayOfMonth: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	isWeekend: boolean;
	events: CalendarEvent[];
}

// 月份数据接口
export interface MonthData {
	name: string;
	color: string;
	colorRgb: string;
	days: CalendarDay[];
	isCurrentMonth: boolean;
	firstDayPosition: number;
}
