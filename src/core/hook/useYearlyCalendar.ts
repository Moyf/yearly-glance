import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import {
	CalendarDay,
	CalendarEvent,
} from "@/src/core/interfaces/CalendarEvent";
import { useYearlyGlanceConfig } from "@/src/core/hook/useYearlyGlanceConfig";
import { t } from "@/src/i18n/i18n";

export const MonthMap: Array<{ name: string; color: string }> = [
	{
		name: t("view.yearlyGlance.month.jan"),
		color: hexToRgb("#e74c3c"), // 红色
	},
	{
		name: t("view.yearlyGlance.month.feb"),
		color: hexToRgb("#e67e22"), // 橙色
	},
	{
		name: t("view.yearlyGlance.month.mar"),
		color: hexToRgb("#f1c40f"), // 黄色
	},
	{
		name: t("view.yearlyGlance.month.apr"),
		color: hexToRgb("#2ecc71"), // 绿色
	},
	{
		name: t("view.yearlyGlance.month.may"),
		color: hexToRgb("#1abc9c"), // 青绿色
	},
	{
		name: t("view.yearlyGlance.month.jun"),
		color: hexToRgb("#3498db"), // 蓝色
	},
	{
		name: t("view.yearlyGlance.month.jul"),
		color: hexToRgb("#9b59b6"), // 紫色
	},
	{
		name: t("view.yearlyGlance.month.aug"),
		color: hexToRgb("#e84393"), // 粉色
	},
	{
		name: t("view.yearlyGlance.month.sep"),
		color: hexToRgb("#fd79a8"), // 浅粉色
	},
	{
		name: t("view.yearlyGlance.month.oct"),
		color: hexToRgb("#fdcb6e"), // 浅黄色
	},
	{
		name: t("view.yearlyGlance.month.nov"),
		color: hexToRgb("#00cec9"), // 青色
	},
	{
		name: t("view.yearlyGlance.month.dec"),
		color: hexToRgb("#6c5ce7"), // 靛蓝色
	},
];

export const WeekMap: Record<string, string[]> = {
	sundayFirst: [
		t("view.yearlyGlance.week.sun"),
		t("view.yearlyGlance.week.mon"),
		t("view.yearlyGlance.week.tue"),
		t("view.yearlyGlance.week.wed"),
		t("view.yearlyGlance.week.thu"),
		t("view.yearlyGlance.week.fri"),
		t("view.yearlyGlance.week.sat"),
	],
	mondayFirst: [
		t("view.yearlyGlance.week.mon"),
		t("view.yearlyGlance.week.tue"),
		t("view.yearlyGlance.week.wed"),
		t("view.yearlyGlance.week.thu"),
		t("view.yearlyGlance.week.fri"),
		t("view.yearlyGlance.week.sat"),
		t("view.yearlyGlance.week.sun"),
	],
};

function hexToRgb(hex: string): string {
	// 移除 # 号
	hex = hex.replace("#", "");

	// 解析RGB值
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `${r}, ${g}, ${b}`;
}

// 判断两个日期是否同一天
function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

// 主要 Hook
export function useYearlyCalendar(plugin: YearlyGlancePlugin) {
	const { config, events } = useYearlyGlanceConfig(plugin);

	const {
		year,
		highlightWeekends,
		highlightToday,
		mondayFirst,
		showHolidays,
		showBirthdays,
		showCustomEvents,
	} = config;

	const { holidays, birthdays, customEvents } = events;

	// 当前日期
	const today = React.useMemo(() => new Date(), []);

	// 处理所有事件
	const allEvents = React.useMemo(() => {
		const events: CalendarEvent[] = [];

		// 处理节假日
		if (showHolidays) {
			holidays.forEach((holiday) => {
				if (!holiday.isHidden) {
					events.push({
						...holiday,
						eventType: "holiday",
					});
				}
			});
		}

		// 处理生日
		if (showBirthdays) {
			birthdays.forEach((birthday) => {
				if (!birthday.isHidden) {
					events.push({
						...birthday,
						eventType: "birthday",
					});
				}
			});
		}

		// 处理自定义事件
		if (showCustomEvents) {
			customEvents.forEach((customEvent) => {
				if (!customEvent.isHidden) {
					events.push({
						...customEvent,
						eventType: "customEvent",
					});
				}
			});
		}

		return events;
	}, [config, events]);

	// 月份数据
	const monthsData = React.useMemo(() => {
		return MonthMap.map((month, monthIndex) => {
			// 当月第一天
			const firstDayOfMonth = new Date(year, monthIndex, 1);
			// 当月天数
			const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
			// 当月第一天是星期几 (0-6, 0是星期日)
			let firstDayWeekday = firstDayOfMonth.getDay();

			// 如果配置了周一为一周的第一天，调整星期几的值
			if (mondayFirst) {
				firstDayWeekday =
					firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
			}

			// 当月所有日期数据
			const days: CalendarDay[] = [];

			// 填充当月日期
			for (let i = 1; i <= daysInMonth; i++) {
				const date = new Date(year, monthIndex, i);
				const isWeekend =
					highlightWeekends &&
					(date.getDay() === 0 || date.getDay() === 6);

				// 查找当天的事件
				const dayEvents = allEvents.filter((event) =>
					event.dateArr?.some((dateStr: string) => {
						const eventDate = new Date(dateStr);
						return (
							eventDate.getFullYear() === year &&
							eventDate.getMonth() === monthIndex &&
							eventDate.getDate() === i
						);
					})
				);

				days.push({
					date,
					dayOfMonth: i,
					isCurrentMonth: true,
					isToday: highlightToday && isSameDay(date, today),
					isWeekend,
					events: dayEvents,
				});
			}

			return {
				name: month.name,
				color: month.color,
				days,
				isCurrentMonth:
					today.getMonth() === monthIndex &&
					today.getFullYear() === year,
				firstDayPosition: firstDayWeekday,
			};
		});
	}, [config, events]);

	// 获取星期几标题
	const weekdays = React.useMemo(() => {
		return mondayFirst ? WeekMap.mondayFirst : WeekMap.sundayFirst;
	}, [mondayFirst]);

	return {
		monthsData,
		weekdays,
		today,
	};
}
