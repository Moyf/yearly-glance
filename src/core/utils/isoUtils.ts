import { CalendarType, ParseIsoDate } from "../interfaces/Date";
import { LunarLibrary } from "./lunarLibrary";

export class IsoUtils {
	/**
	 * 解析ISO日期字符串
	 * @param isoDate 标准的ISO日期字符串，如 "2023-01-01"
	 * @param calendar 日期类型
	 * @returns ParseIsoDate 对象，包含日期、年、月、日和日历类型
	 */
	static parse(isoDate: string, calendar: CalendarType): ParseIsoDate {
		// 默认值
		let year: number | undefined = undefined;
		let month = 1;
		let day = 1;

		// 确保日历类型有效
		if (
			calendar !== "GREGORIAN" &&
			calendar !== "LUNAR" &&
			calendar !== "LUNAR_LEAP"
		) {
			throw new Error(`Unsupported calendar type: ${calendar}`);
		}

		// 解析日期部分获取年、月、日
		const dateParts = isoDate.split("-");
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

		return {
			isoDate,
			year,
			month,
			day,
			calendar,
		};
	}

	/**
	 * 格式化日期为字符串
	 * @param isoDate ISO日期字符串
	 * @param calendar 日期类型
	 * @returns 格式化后的日期字符串
	 */
	static formatDate(isoDate: string, calendar: CalendarType): string {
		const { year, month, day } = this.parse(isoDate, calendar);

		// TODO：根据设置的显示格式返回不同的日期字符串
		// 目前仅返回标准的ISO格式或中文名称

		if (year !== undefined) {
			if (calendar === "GREGORIAN") {
				return `${year}-${month}-${day}`;
			} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
				const monthL = calendar === "LUNAR_LEAP" ? -month : month;
				return LunarLibrary.getChineseName(year, monthL, day);
			} else {
				throw new Error(`Unsupported calendar type: ${calendar}`);
			}
		} else {
			if (calendar === "GREGORIAN") {
				return `${month}-${day}`;
			} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
				const monthL = calendar === "LUNAR_LEAP" ? -month : month;
				return LunarLibrary.getChineseName(undefined, monthL, day);
			} else {
				throw new Error(`Unsupported calendar type: ${calendar}`);
			}
		}
	}
}
