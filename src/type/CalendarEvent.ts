import { Birthday, CustomEvent, EventSource, EventType, Holiday } from "./Events";

// 日历事件接口
export type CalendarEvent = (Holiday | Birthday | CustomEvent) & {
	eventType: EventType; // 事件类型
	eventSource?: EventSource; // 事件来源
	// 多日事件扩展元数据（仅在渲染时使用，不存储）
	_dayIndex?: number; // 当前是第几天（从0开始）
	_totalDays?: number; // 总共多少天
	_isFirstDay?: boolean; // 是否是第一天
	_isLastDay?: boolean; // 是否是最后一天
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
