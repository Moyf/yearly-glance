import { BaseEvent, EventType } from "./Events";

// 日历事件接口
export interface CalendarEvent extends BaseEvent {
	type: EventType; // 事件类型
}

// 日数据接口
export interface CalendarDay {
	date: Date;
	dayOfMonth: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	isWeekend: boolean;
	events: CalendarEvent[];
}

// 月数据接口
export interface MonthData {
	name: string;
	color: string;
	days: CalendarDay[];
	isCurrentMonth: boolean;
	firstDayPosition: number;
}
