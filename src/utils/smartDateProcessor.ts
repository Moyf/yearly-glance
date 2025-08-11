import { t } from "@/src/i18n/i18n";
import {
	CalendarType,
	chineseDigits,
	lunarDays,
	lunarKeywords,
	lunarMonths,
	StandardDate,
} from "@/src/type/Date";
import { GregorianDateValidator, LunarDateValidator } from "./dateValidator";
import { LunarLibrary } from "./lunarLibrary";

/**
 * 智能日期处理器
 * 解析用户输入的各种日期格式，返回标准化的日期对象
 */
export class SmartDateProcessor {
	/**
	 * 解析用户输入的日期字符串
	 * @param input 用户输入的日期字符串
	 * @param calendar 用户指定的日历类型（可选）
	 * @returns StandardDate 标准化日期对象
	 */
	static parseUserInput(
		input: string,
		calendar?: CalendarType
	): StandardDate {
		// 清理输入字符串
		const cleanInput = input.trim();

		// 如果用户指定了日历类型，优先使用
		if (calendar) {
			return this.parseWithCalendarType(cleanInput, calendar);
		}

		// 自动识别日历类型
		const detectedCalendar = this.detectCalendarType(cleanInput);
		return this.parseWithCalendarType(cleanInput, detectedCalendar);
	}

	/**
	 * 自动检测日历类型
	 * @param input 清理后的输入字符串
	 * @returns CalendarType 检测到的日历类型
	 */
	static detectCalendarType(input: string): CalendarType {
		// 检查是否包含农历关键词
		const hasLunarKeywords = lunarKeywords.some((keyword) =>
			input.includes(keyword)
		);

		// 检查是否包含闰月标识
		const hasLeapMonth = input.includes("闰");

		if (hasLeapMonth) {
			return "LUNAR_LEAP";
		} else if (hasLunarKeywords) {
			return "LUNAR";
		} else {
			return "GREGORIAN";
		}
	}

	/**
	 * 根据指定的日历类型解析日期
	 * @param input 清理后的输入字符串
	 * @param calendar 日历类型
	 * @returns StandardDate 标准化日期对象
	 */
	private static parseWithCalendarType(
		input: string,
		calendar: CalendarType
	): StandardDate {
		switch (calendar) {
			case "GREGORIAN":
				return this.parseGregorianDate(input);
			case "LUNAR":
				return this.parseLunarDate(input, false);
			case "LUNAR_LEAP":
				return this.parseLunarDate(input, true);
			default:
				throw new Error(`Unsupported calendar type: ${calendar}`);
		}
	}

	/**
	 * 解析公历日期
	 * @param input 输入字符串
	 * @returns StandardDate 标准化日期对象
	 */
	private static parseGregorianDate(input: string): StandardDate {
		// 支持的公历格式：
		// 约束使用的日期顺序是YMD
		// 标准格式：2025-01-01, 2025/01/01, 2025.01.01, 01-01, 01/01, 01.01
		// 旧格式：2025,01,01, 01,01
		// 中文格式：2025年01月01日, 01月01日
		// 混合格式：2025年1月1日, 2025-1-1 等

		let year: number | undefined;
		let month: number;
		let day: number;

		// 提取数字部分
		const numbers = this.extractNumbers(input);

		// 验证输入的完整性
		if (numbers.length < 2) {
			throw new Error(
				t(`view.eventManager.dateError.insufficientDate`, {
					input: input,
				})
			);
		}
		if (numbers.some((num) => num === 0)) {
			throw new Error(
				t(`view.eventManager.dateError.invalidZeroDate`, {
					input: input,
				})
			);
		}

		if (numbers.length === 2) {
			// 需要验证是 MM-DD 格式，而不是 YYYY-MM 或 YYYY-DD 等错误格式
			const [first, second] = numbers;

			// 如果第一个数字大于12且大于31，很可能是年份，这是错误格式
			// 也有可能年份是公元1年等，但是可能性非常小，先不做考虑
			if (first > 31) {
				throw new Error(
					t(`view.eventManager.dateError.invalidFormatDate`, {
						input: input,
					})
				);
			}

			// 如果第一个数字在合理的月份范围内(1-12)，第二个数字在合理的日期范围内(1-31)
			if (first >= 1 && first <= 12 && second >= 1 && second <= 31) {
				[month, day] = numbers;
			} else {
				throw new Error(
					t(`view.eventManager.dateError.invalidRangeDate`, {
						input: input,
					})
				);
			}
		} else if (numbers.length === 3) {
			// YYYY-MM-DD 格式
			[year, month, day] = numbers;
		} else {
			throw new Error(
				t(`view.eventManager.dateError.unexpectedNumberLength`, {
					length: numbers.length,
				})
			);
		}

		GregorianDateValidator.validDate(year, month, day);

		// 生成ISO日期字符串
		const isoDate: string = this.generateISODateString(year, month, day);

		return {
			isoDate,
			calendar: "GREGORIAN",
		};
	}

	/**
	 * 从输入字符串中提取所有数字
	 * @param input 输入字符串
	 * @returns number[] 提取的数字数组
	 */
	private static extractNumbers(input: string): number[] {
		// 使用正则表达式提取所有数字序列
		const numberMatches = input.match(/\d+/g);

		if (!numberMatches) {
			return [];
		}

		// 转换为数字并过滤无效值
		return numberMatches
			.map((match) => parseInt(match, 10))
			.filter((num) => !isNaN(num));
	}

	/**
	 * 解析农历日期
	 * @param input 输入字符串
	 * @param isLeap 是否为闰月
	 * @returns StandardDate 标准化日期对象
	 */
	private static parseLunarDate(
		input: string,
		isLeap: boolean
	): StandardDate {
		// 支持的农历格式：
		// 标准格式：2025-01-01, 2025/01/01, 2025.01.01, 01-01, 01/01, 01.01
		// 中文格式：2025年正月初一, 正月初一, 闰二月初一, 二〇二五年闰六月初一
		// 旧格式：2025,6,1  2025,-6,1  6,1  -6,1
		const isLeapMonth = isLeap;

		// 首先尝试提取数字（包括负数，用于农历闰月）
		const numbers = this.extractNumbers(input);

		if (numbers.length >= 2) {
			return this.parseNumericLunarDate(input, isLeapMonth);
		}

		// 解析中文格式
		return this.parseChineseLunarDate(input, isLeapMonth);
	}

	/**
	 * 解析数字格式的农历日期
	 * @param numbers 提取的数字数组
	 * @param isLeapMonth 是否为闰月
	 * @returns StandardDate 标准化日期对象
	 */
	private static parseNumericLunarDate(
		input: string,
		isLeapMonth: boolean
	): StandardDate {
		let year: number | undefined;
		let month: number;
		let day: number;

		const numbers = this.extractNumbers(input);

		// 验证输入的完整性
		if (numbers.length < 2) {
			throw new Error(
				t(`view.eventManager.dateError.insufficientDate`, {
					input: input,
				})
			);
		}

		// 检查是否包含0（农历月份不应该为0）
		if (numbers.some((num) => num === 0)) {
			throw new Error(
				t(`view.eventManager.dateError.invalidZeroDate`, {
					input: input,
				})
			);
		}

		if (numbers.length === 2) {
			// 需要验证是 MM-DD 格式，而不是 YYYY-MM 或 YYYY-DD 等错误格式
			const [first, second] = numbers;

			// 如果第一个数字大于12且大于30，很可能是年份，这是错误格式
			// 也有可能年份是公元1年等，但是可能性非常小，先不做考虑
			if (first > 30) {
				throw new Error(
					t(`view.eventManager.dateError.invalidFormatDate`, {
						input: input,
					})
				);
			}

			// 如果第一个数字在合理的月份范围内(1-12)，第二个数字在合理的日期范围内(1-30)
			if (first >= 1 && first <= 12 && second >= 1 && second <= 30) {
				[month, day] = numbers;
			} else {
				throw new Error(
					t(`view.eventManager.dateError.invalidRangeDate`, {
						input: input,
					})
				);
			}
		} else if (numbers.length === 3) {
			// YYYY-MM-DD
			[year, month, day] = numbers;
		} else {
			throw new Error(
				t(`view.eventManager.dateError.unexpectedNumberLength`, {
					length: numbers.length,
				})
			);
		}

		// 使用农历验证器验证日期
		LunarDateValidator.validDate(year, month, day, isLeapMonth);

		// 检查实际的闰月状态：如果指定了闰月但验证失败，可能需要降级为普通月
		let actualIsLeapMonth = isLeapMonth;
		if (isLeapMonth) {
			if (year !== undefined) {
				// 有年份时验证指定年份是否真的有该闰月
				if (!LunarLibrary.isValidLunarDate(year, -month, day)) {
					// 闰月无效，降级为普通月
					actualIsLeapMonth = false;
				}
			} else {
				// 没有年份时，无法验证闰月有效性，默认降级为普通月
				actualIsLeapMonth = false;
			}
		}

		// 生成ISO日期字符串
		const isoDate: string = this.generateISODateString(year, month, day);

		const calendarType = actualIsLeapMonth ? "LUNAR_LEAP" : "LUNAR";

		return {
			isoDate,
			calendar: calendarType,
		};
	}

	/**
	 * 解析中文格式的农历日期
	 * @param input 输入字符串
	 * @param isLeap 是否为闰月
	 * @returns StandardDate 标准化日期对象
	 */
	private static parseChineseLunarDate(
		input: string,
		isLeap: boolean
	): StandardDate {
		let isLeapMonth = isLeap;

		// 检测闰月
		if (input.includes("闰")) {
			isLeapMonth = true;
		}

		// 提取年份 - 支持阿拉伯数字和中文数字
		const year = this.extractChineseYear(input);
		const month = this.extractChineseMonth(input, lunarMonths);
		const day = this.extractChineseDay(input, lunarDays);

		LunarDateValidator.validDate(year, month, day, isLeapMonth);

		// 检查实际的闰月状态：如果指定了闰月但验证失败，可能需要降级为普通月
		let actualIsLeapMonth = isLeapMonth;
		if (isLeapMonth) {
			if (year !== undefined) {
				// 有年份时验证指定年份是否真的有该闰月
				if (!LunarLibrary.isValidLunarDate(year, -month, day)) {
					// 闰月无效，降级为普通月
					actualIsLeapMonth = false;
				}
			} else {
				// 没有年份时，无法验证闰月有效性，默认降级为普通月
				actualIsLeapMonth = false;
			}
		}

		// 生成ISO日期字符串
		let isoDate: string;

		if (year !== undefined) {
			isoDate = `${year.toString().padStart(4, "0")}-${month
				.toString()
				.padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
		} else {
			isoDate = `${month.toString().padStart(2, "0")}-${day
				.toString()
				.padStart(2, "0")}`;
		}

		const calendarType = actualIsLeapMonth ? "LUNAR_LEAP" : "LUNAR";

		return {
			isoDate,
			calendar: calendarType,
		};
	}

	/**
	 * 提取中文年份
	 * @param input 输入字符串
	 * @returns number | undefined
	 */
	private static extractChineseYear(input: string): number | undefined {
		// 匹配阿拉伯数字年份：2025年
		const arabicYearMatch = input.match(/(\d{4})年/);
		if (arabicYearMatch) {
			return parseInt(arabicYearMatch[1], 10);
		}

		// 匹配中文数字年份：二〇二五年
		const chineseYearMatch = input.match(
			/([一二三四五六七八九〇零]{1,4})年/
		);
		if (chineseYearMatch) {
			return this.convertChineseNumberToArabic(chineseYearMatch[1]);
		}

		return undefined;
	}

	/**
	 * 提取中文月份
	 * @param input 输入字符串
	 * @param lunarMonths 月份映射
	 * @returns number
	 */
	private static extractChineseMonth(
		input: string,
		lunarMonths: Record<string, number>
	): number {
		for (const [monthName, monthNum] of Object.entries(lunarMonths)) {
			if (input.includes(monthName)) {
				return monthNum;
			}
		}
		throw new Error(
			t(`view.eventManager.dateError.invalidLunarDate`, {
				input: input,
			})
		);
	}

	/**
	 * 提取中文日期
	 * @param input 输入字符串
	 * @param lunarDays 日期映射
	 * @returns number
	 */
	private static extractChineseDay(
		input: string,
		lunarDays: Record<string, number>
	): number {
		for (const [dayName, dayNum] of Object.entries(lunarDays)) {
			if (input.includes(dayName)) {
				return dayNum;
			}
		}
		throw new Error(
			t(`view.eventManager.dateError.invalidLunarDate`, {
				input: input,
			})
		);
	}

	/**
	 * 将中文数字转换为阿拉伯数字
	 * @param chineseNumber 中文数字字符串
	 * @returns number
	 */
	private static convertChineseNumberToArabic(chineseNumber: string): number {
		let result = "";
		for (const char of chineseNumber) {
			if (chineseDigits[char]) {
				result += chineseDigits[char];
			} else {
				throw new Error(
					t(`view.eventManager.dateError.unknownChineseDigit`, {
						char: char,
					})
				);
			}
		}

		return parseInt(result, 10);
	}

	/**
	 * 生成ISO日期字符串
	 * @param year 年份（可选）
	 * @param month 月份
	 * @param day 日期
	 * @returns ISO格式的日期字符串
	 */
	private static generateISODateString(
		year?: number,
		month?: number,
		day?: number
	): string {
		if (year !== undefined && month !== undefined && day !== undefined) {
			return `${year.toString().padStart(4, "0")}-${month
				.toString()
				.padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
		} else if (month !== undefined && day !== undefined) {
			return `${month.toString().padStart(2, "0")}-${day
				.toString()
				.padStart(2, "0")}`;
		} else {
			throw new Error("生成ISO日期字符串时参数不足");
		}
	}
}

/**
 * 便捷函数：解析用户输入
 * @param input 用户输入的日期字符串
 * @param calendar 可选的日历类型
 * @returns StandardDate 标准化日期对象
 */
export function parseUserDateInput(
	input: string,
	calendar?: CalendarType
): StandardDate {
	return SmartDateProcessor.parseUserInput(input, calendar);
}
