import { Lunar, Solar } from "lunar-typescript";

/**
 * 日期转换工具类
 * 提供公历和农历日期的相互转换功能
 */

/**
 * 根据date、dateType和年份计算dateObj
 * @param date 日期字符串 格式为MM-DD或YYYY-MM-DD
 * @param dateType 日期类型 SOLAR(公历) 或 LUNAR(农历)
 * @param year 年份
 * @returns 公历日期字符串，格式为YYYY-MM-DD
 */
export function calculateDateObj(
	date: string,
	dateType: "SOLAR" | "LUNAR",
	year: number
): string {
	if (!date) {
		return "";
	}

	try {
		// 解析日期部分
		let month: number;
		let day: number;
		let dateYear: number | undefined;

		// 处理两种可能的格式：YYYY-MM-DD 或 MM-DD
		if (date.includes("-")) {
			const parts = date.split("-");
			if (parts.length === 3) {
				// YYYY-MM-DD 格式
				dateYear = parseInt(parts[0], 10);
				month = parseInt(parts[1], 10);
				day = parseInt(parts[2], 10);
			} else if (parts.length === 2) {
				// MM-DD 格式
				month = parseInt(parts[0], 10);
				day = parseInt(parts[1], 10);
			} else {
				// 无效格式
				return "";
			}
		} else {
			// 无效格式
			return "";
		}

		// 如果未提供年份，使用传入的年份
		if (!dateYear) {
			dateYear = year;
		}

		// 检查日期是否有效
		if (
			isNaN(month) ||
			isNaN(day) ||
			isNaN(dateYear) ||
			month < 1 ||
			month > 12 ||
			day < 1 ||
			day > 31
		) {
			return "";
		}

		// 根据日期类型计算dateObj
		if (dateType === "SOLAR") {
			// 公历日期，直接使用
			const solar = Solar.fromYmd(dateYear, month, day);
			return formatDateToString(
				solar.getYear(),
				solar.getMonth(),
				solar.getDay()
			);
		} else {
			// 农历日期，需要转换为公历
			const lunar = Lunar.fromYmd(dateYear, month, day);
			const solar = lunar.getSolar();
			return formatDateToString(
				solar.getYear(),
				solar.getMonth(),
				solar.getDay()
			);
		}
	} catch (error) {
		console.error("Date calculation error:", error);
		return "";
	}
}

/**
 * 格式化日期为字符串
 * @param year 年
 * @param month 月
 * @param day 日
 * @returns 格式化的日期字符串，格式为YYYY-MM-DD
 */
export function formatDateToString(
	year: number,
	month: number,
	day: number
): string {
	return `${year}-${month.toString().padStart(2, "0")}-${day
		.toString()
		.padStart(2, "0")}`;
}

/**
 * 批量更新事件的dateObj字段
 * @param events 事件列表
 * @param year 当前年份
 * @returns 更新后的事件列表
 */
export function updateEventsDateObj<
	T extends { date: string; dateType: "SOLAR" | "LUNAR"; dateObj?: string }
>(events: T[], year: number): T[] {
	return events.map((event) => {
		const dateObj = calculateDateObj(event.date, event.dateType, year);
		return { ...event, dateObj };
	});
}
