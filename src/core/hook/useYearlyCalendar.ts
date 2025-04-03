import * as React from "react";
import { t } from "@/src/i18n/i18n";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import {
	CalendarDay,
	CalendarEvent,
} from "@/src/core/interfaces/CalendarEvent";

export const MonthMap: Array<{ name: string; color: string }> = [
	{
		name: t("view.month.jan"),
		color: hexToRgb("#e74c3c"), // 红色
	},
	{
		name: t("view.month.feb"),
		color: hexToRgb("#e67e22"), // 橙色
	},
	{
		name: t("view.month.mar"),
		color: hexToRgb("#f1c40f"), // 黄色
	},
	{
		name: t("view.month.apr"),
		color: hexToRgb("#2ecc71"), // 绿色
	},
	{
		name: t("view.month.may"),
		color: hexToRgb("#1abc9c"), // 青绿色
	},
	{
		name: t("view.month.jun"),
		color: hexToRgb("#3498db"), // 蓝色
	},
	{
		name: t("view.month.jul"),
		color: hexToRgb("#9b59b6"), // 紫色
	},
	{
		name: t("view.month.aug"),
		color: hexToRgb("#e84393"), // 粉色
	},
	{
		name: t("view.month.sep"),
		color: hexToRgb("#fd79a8"), // 浅粉色
	},
	{
		name: t("view.month.oct"),
		color: hexToRgb("#fdcb6e"), // 浅黄色
	},
	{
		name: t("view.month.nov"),
		color: hexToRgb("#00cec9"), // 青色
	},
	{
		name: t("view.month.dec"),
		color: hexToRgb("#6c5ce7"), // 靛蓝色
	},
];

export const WeekMap: Record<string, string[]> = {
	sundayFirst: [
		t("view.week.sun"),
		t("view.week.mon"),
		t("view.week.tue"),
		t("view.week.wed"),
		t("view.week.thu"),
		t("view.week.fri"),
		t("view.week.sat"),
	],
	mondayFirst: [
		t("view.week.mon"),
		t("view.week.tue"),
		t("view.week.wed"),
		t("view.week.thu"),
		t("view.week.fri"),
		t("view.week.sat"),
		t("view.week.sun"),
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

// 日期格式化工具函数
export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	return format
		.replace("YYYY", year.toString())
		.replace("MM", month < 10 ? `0${month}` : month.toString())
		.replace("DD", day < 10 ? `0${day}` : day.toString());
}

// 主要 Hook
export function useYearlyCalendar(config: YearlyGlanceConfig) {
	const {
		config: {
			year,
			mondayFirst,
			highlightToday,
			highlightWeekends,
			showHolidays,
			showBirthdays,
			showCustomEvents,
		},
		data: { holidays, birthdays, customEvents },
	} = config;

	// 当前日期
	const today = React.useMemo(() => new Date(), []);

	// 处理所有事件
	const allEvents = React.useMemo(() => {
		const events: CalendarEvent[] = [];

		// 处理节假日
		if (showHolidays) {
			holidays.forEach((holiday) => {
				if (holiday.isShow) {
					const [month, day] = holiday.date.split("-").map(Number);
					const dateObj = new Date(year, month - 1, day);
					events.push({
						...holiday,
						type: "holiday",
						dateObj,
					});
				}
			});
		}

		// 处理生日
		if (showBirthdays) {
			birthdays.forEach((birthday) => {
				const [month, day] = birthday.date.split("-").map(Number);
				const dateObj = new Date(year, month - 1, day);
				events.push({
					...birthday,
					type: "birthday",
					dateObj,
				});
			});
		}

		// 处理自定义事件
		if (showCustomEvents) {
			customEvents.forEach((event) => {
				const [month, day] = event.date.split("-").map(Number);
				const dateObj = new Date(year, month - 1, day);
				events.push({
					...event,
					type: "custom",
					dateObj,
				});
			});
		}

		return events;
	}, [
		year,
		holidays,
		birthdays,
		customEvents,
		showHolidays,
		showBirthdays,
		showCustomEvents,
	]);

	// 生成月份数据
	const monthsData = React.useMemo(() => {
		return MonthMap.map((month, monthIndex) => {
			// 获取当月第一天
			const firstDayOfMonth = new Date(year, monthIndex, 1);

			// 获取当月天数
			const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

			// 获取当月第一天是星期几 (0-6, 0是星期日)
			let firstDayWeekday = firstDayOfMonth.getDay();

			// 如果配置了周一为一周的第一天，调整星期几的值
			if (mondayFirst) {
				firstDayWeekday =
					firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
			}

			// 生成当月所有日期数据
			const days: CalendarDay[] = [];

			// 只添加当月日期
			for (let i = 1; i <= daysInMonth; i++) {
				const date = new Date(year, monthIndex, i);
				const isWeekend =
					highlightWeekends &&
					(date.getDay() === 0 || date.getDay() === 6);

				// 查找当天的事件
				const dayEvents = allEvents.filter(
					(event) =>
						event.dateObj.getMonth() === monthIndex &&
						event.dateObj.getDate() === i
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
				color: month.color
					.split(",")
					.map((c) => parseInt(c))
					.join(", "),
				colorRgb: month.color,
				days,
				isCurrentMonth:
					today.getMonth() === monthIndex &&
					today.getFullYear() === year,
				firstDayPosition: firstDayWeekday,
			};
		});
	}, [
		year,
		mondayFirst,
		highlightToday,
		highlightWeekends,
		allEvents,
		today,
	]);

	// 获取星期几标题
	const weekdays = React.useMemo(() => {
		return mondayFirst ? WeekMap.mondayFirst : WeekMap.sundayFirst;
	}, [mondayFirst]);

	// 检查两个日期是否是同一天
	function isSameDay(date1: Date, date2: Date): boolean {
		return (
			date1.getDate() === date2.getDate() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear()
		);
	}

	// 获取事件类型样式
	function getEventStyle(event: CalendarEvent) {
		let backgroundColor = "";
		let color = "";
		let emoji = "";

		switch (event.type) {
			case "holiday":
				backgroundColor = "#ff787520";
				color = "#ff7875";
				emoji = event.emoji || "🎉";
				break;
			case "birthday":
				backgroundColor = "#fa8c1620";
				color = "#fa8c16";
				emoji = event.emoji || "🎂";
				break;
			case "custom":
				backgroundColor = "#73d13d20";
				color = "#73d13d";
				emoji = event.emoji || "📌";
				break;
		}

		// 如果事件自定义了颜色，则使用自定义颜色
		if (event.color) {
			color = event.color;
			backgroundColor = `${event.color}20`;
		}

		return {
			backgroundColor,
			color,
			emoji,
		};
	}

	// 获取指定月份的事件
	function getMonthEvents(monthIndex: number) {
		return allEvents.filter(
			(event) => event.dateObj.getMonth() === monthIndex
		);
	}

	// 获取指定日期的事件
	function getDayEvents(date: Date) {
		return allEvents.filter(
			(event) =>
				event.dateObj.getDate() === date.getDate() &&
				event.dateObj.getMonth() === date.getMonth()
		);
	}

	return {
		monthsData,
		weekdays,
		getEventStyle,
		getMonthEvents,
		getDayEvents,
		today,
		formatDate,
	};
}
