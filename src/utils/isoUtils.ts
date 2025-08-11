import { CalendarType, ParseIsoDate } from "@/src/type/Date";
import { LunarLibrary } from "./lunarLibrary";

// 月份名称映射
const MONTH_NAMES = {
	short: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	],
	full: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	],
};

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
	 * @param format 显示格式 (仅对GREGORIAN类型有效)
	 * @returns 格式化后的日期字符串
	 */
	static formatDate(
		isoDate: string,
		calendar: CalendarType,
		format?: string
	): string {
		const { year, month, day } = this.parse(isoDate, calendar);

		if (calendar === "GREGORIAN") {
			return this.formatGregorianDate(
				year,
				month,
				day,
				format || "YYYY-MM-DD"
			);
		} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
			const monthL = calendar === "LUNAR_LEAP" ? -month : month;
			return LunarLibrary.getChineseName(year, monthL, day);
		} else {
			throw new Error(`Unsupported calendar type: ${calendar}`);
		}
	}

	/**
	 * 格式化公历日期
	 * @param year 年份 (可选)
	 * @param month 月份
	 * @param day 日期
	 * @param format 格式字符串
	 * @returns 格式化后的日期字符串
	 */
	private static formatGregorianDate(
		year: number | undefined,
		month: number,
		day: number,
		format: string
	): string {
		// 补零函数
		const pad = (num: number, length: number = 2) =>
			num.toString().padStart(length, "0");

		// 如果没有年份，处理仅月日的格式
		if (year === undefined) {
			switch (format) {
				case "YYYY-MM-DD":
					return `${pad(month)}-${pad(day)}`;
				case "YYYY/MM/DD":
					return `${pad(month)}/${pad(day)}`;
				case "YYYY年MM月DD日":
					return `${pad(month)}月${pad(day)}日`;
				case "MM/DD/YYYY":
					return `${pad(month)}/${pad(day)}`;
				case "DD/MM/YYYY":
					return `${pad(day)}/${pad(month)}`;
				case "DD.MM.YYYY":
					return `${pad(day)}.${pad(month)}`;
				case "MM-DD-YYYY":
					return `${pad(month)}-${pad(day)}`;
				case "DD-MM-YYYY":
					return `${pad(day)}-${pad(month)}`;
				case "MMM DD, YYYY":
					return `${MONTH_NAMES.short[month - 1]} ${pad(day)}`;
				case "DD MMM YYYY":
					return `${pad(day)} ${MONTH_NAMES.short[month - 1]}`;
				case "MMMM DD, YYYY":
					return `${MONTH_NAMES.full[month - 1]} ${pad(day)}`;
				case "DD MMMM YYYY":
					return `${pad(day)} ${MONTH_NAMES.full[month - 1]}`;
				default:
					return `${pad(month)}-${pad(day)}`;
			}
		}

		// 完整日期格式化
		switch (format) {
			case "YYYY-MM-DD":
				return `${year}-${pad(month)}-${pad(day)}`;
			case "MM/DD/YYYY":
				return `${pad(month)}/${pad(day)}/${year}`;
			case "DD/MM/YYYY":
				return `${pad(day)}/${pad(month)}/${year}`;
			case "YYYY/MM/DD":
				return `${year}/${pad(month)}/${pad(day)}`;
			case "DD.MM.YYYY":
				return `${pad(day)}.${pad(month)}.${year}`;
			case "MM-DD-YYYY":
				return `${pad(month)}-${pad(day)}-${year}`;
			case "DD-MM-YYYY":
				return `${pad(day)}-${pad(month)}-${year}`;
			case "YYYY年MM月DD日":
				return `${year}年${pad(month)}月${pad(day)}日`;
			case "MMM DD, YYYY":
				return `${MONTH_NAMES.short[month - 1]} ${pad(day)}, ${year}`;
			case "DD MMM YYYY":
				return `${pad(day)} ${MONTH_NAMES.short[month - 1]} ${year}`;
			case "MMMM DD, YYYY":
				return `${MONTH_NAMES.full[month - 1]} ${pad(day)}, ${year}`;
			case "DD MMMM YYYY":
				return `${pad(day)} ${MONTH_NAMES.full[month - 1]} ${year}`;
			default:
				return `${year}-${pad(month)}-${pad(day)}`;
		}
	}

	/**
	 * 将Date对象格式化为本地的YYYY-MM-DD字符串，避免时区问题
	 * @param date Date对象
	 * @returns 本地日期字符串，格式为YYYY-MM-DD
	 */
	static toLocalDateString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	/**
	 * 创建一个本地日期对象，避免时区偏移
	 * @param year 年份
	 * @param month 月份 (1-12)
	 * @param day 日期
	 * @returns Date对象，表示本地日期的午夜时间
	 */
	static createLocalDate(year: number, month: number, day: number): Date {
		return new Date(year, month - 1, day);
	}

	/**
	 * 获取今天的本地日期字符串，避免时区问题
	 * @returns 本地今天的日期字符串，格式为YYYY-MM-DD
	 */
	static getTodayLocalDateString(): string {
		return this.toLocalDateString(new Date());
	}

	/**
	 * 比较两个Date对象是否为同一天（本地时区）
	 * @param date1 第一个日期
	 * @param date2 第二个日期
	 * @returns 是否为同一天
	 */
	static isSameLocalDay(date1: Date, date2: Date): boolean {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	}

	/**
	 * 从YYYY-MM-DD格式的字符串创建本地Date对象
	 * @param dateString YYYY-MM-DD格式的日期字符串
	 * @returns Date对象，表示本地日期的午夜时间
	 */
	static fromLocalDateString(dateString: string): Date {
		const [year, month, day] = dateString.split("-").map(Number);
		return this.createLocalDate(year, month, day);
	}

	/**
	 * 获取当前年份
	 * @returns 当前年份
	 */
	static getCurrentYear(): number {
		return new Date().getFullYear();
	}
}
