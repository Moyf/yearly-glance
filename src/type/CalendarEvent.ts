import { Birthday, CustomEvent, EventType, Holiday } from "./Events";

// 日历事件接口
export type CalendarEvent = (Holiday | Birthday | CustomEvent) & {
	eventType: EventType; // 事件类型
};

// 日数据接口
export interface CalendarDay {
	date: Date;
	dayOfMonth: number;
	dayOfLunarMonth: string;
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
