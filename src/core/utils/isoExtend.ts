import { CalendarType, ParseIsoDate } from "../interfaces/Date";
import { LunarLibrary } from "./lunarLibrary";

export class IsoExtend {
	/**
	 * 解析扩展的ISO日期格式（带有日历类型标识）
	 * @param isoDate 带有日历类型的ISO日期字符串，如 "2023-01-01#GREGORIAN"
	 * @returns ParseIsoDate 对象，包含日期、年、月、日和日历类型
	 */
	static parse(isoDate: string): ParseIsoDate {
		// 默认值
		let date = isoDate;
		let dateType: CalendarType = "GREGORIAN";
		let year: number | undefined = undefined;
		let month = 1;
		let day = 1;

		// 检查是否包含日历类型标记
		if (isoDate.includes("#")) {
			const [isoDatePart, calendarPart] = isoDate.split("#");
			date = isoDatePart;

			// 确保日历类型有效
			if (
				calendarPart === "GREGORIAN" ||
				calendarPart === "LUNAR" ||
				calendarPart === "LUNAR_LEAP"
			) {
				dateType = calendarPart;
			}

			// 解析日期部分获取年、月、日
			const dateParts = isoDatePart.split("-");
			if (dateParts.length === 3) {
				// 完整日期格式: YYYY-MM-DD
				year = parseInt(dateParts[0], 10);
				month = parseInt(dateParts[1], 10);
				day = parseInt(dateParts[2], 10);
			} else if (dateParts.length === 2) {
				// 简短日期格式: MM-DD
				month = parseInt(dateParts[0], 10);
				day = parseInt(dateParts[1], 10);
			}
		}

		return {
			date,
			year,
			month,
			day,
			dateType,
		};
	}

	/**
	 * 创建扩展的ISO日期字符串
	 * @param year 年份（可选）
	 * @param month 月份
	 * @param day 日期
	 * @param calendarType 日历类型
	 * @returns 扩展的ISO日期字符串
	 */
	static create(date: string, calendarType: CalendarType): string {
		return `${date}#${calendarType}`;
	}

	/**
	 * 获取扩展ISO日期中的日期部分
	 * @param isoDate 扩展的ISO日期字符串
	 * @returns 日期部分
	 */
	static getDate(isoDate: string): string {
		if (isoDate.includes("#")) {
			return isoDate.split("#")[0];
		}
		return isoDate;
	}

	/**
	 * 获取扩展ISO日期中的日历类型部分
	 * @param isoDate 扩展的ISO日期字符串
	 * @returns 日历类型，默认为GREGORIAN
	 */
	static getCalendarType(isoDate: string): CalendarType {
		if (isoDate.includes("#")) {
			const calendarPart = isoDate.split("#")[1];
			if (
				calendarPart === "GREGORIAN" ||
				calendarPart === "LUNAR" ||
				calendarPart === "LUNAR_LEAP"
			) {
				return calendarPart;
			}
		}
		return "GREGORIAN";
	}

	/**
	 * 更改扩展ISO日期的日历类型
	 * @param extendedIsoDate 扩展的ISO日期字符串
	 * @param newCalendarType 新的日历类型
	 * @returns 更新后的扩展ISO日期字符串
	 */
	static changeCalendarType(
		extendedIsoDate: string,
		newCalendarType: CalendarType
	): string {
		const datePart = this.getDate(extendedIsoDate);
		return `${datePart}#${newCalendarType}`;
	}

	/**
	 * 格式化日期为字符串
	 * @param isoDate 扩展的ISO日期字符串
	 * @returns 格式化后的日期字符串
	 */
	static formatDate(isoDate: string) {
		const { year, month, day, dateType } = this.parse(isoDate);

		if (year !== undefined) {
			if (dateType === "GREGORIAN") {
				return `${year}-${month}-${day}`;
			} else if (dateType === "LUNAR" || dateType === "LUNAR_LEAP") {
				const monthL = dateType === "LUNAR_LEAP" ? -month : month;

				return LunarLibrary.getChineseName(year, monthL, day);
			}
		} else {
			if (dateType === "GREGORIAN") {
				return `${month}-${day}`;
			} else if (dateType === "LUNAR" || dateType === "LUNAR_LEAP") {
				const monthL = dateType === "LUNAR_LEAP" ? -month : month;
				return LunarLibrary.getChineseName(undefined, monthL, day);
			}
		}
	}
}
