import { Lunar, SolarUtil } from "lunar-typescript";

/**
 * 公历日期验证器
 * 用于验证公历日期的合法性
 */
export class GregorianDateValidator {
	static validDate(
		year: number | undefined,
		month: number,
		day: number
	): boolean {
		if (year !== undefined) {
			return this.validSolarDate(year, month, day);
		}

		// 检查月份范围
		if (month < 1 || month > 12) {
			return false;
		}

		// 检查日期范围
		if (day < 1 || day > 31) {
			return false;
		}

		return true;
	}

	static validSolarDate(year: number, month: number, day: number): boolean {
		// 由于 lunar-typescript 的 Solar.fromYmd 不会对无效日期抛出异常
		// 我们需要自己实现日期有效性验证

		// 检查年份合理性
		if (!Number.isInteger(year) || year < 1 || year > 9999) {
			return false;
		}

		// 检查月份范围
		if (!Number.isInteger(month) || month < 1 || month > 12) {
			return false;
		}

		// 检查日期范围
		if (!Number.isInteger(day) || day < 1) {
			return false;
		}

		// 检查是否超过当月最大天数
		return day <= SolarUtil.getDaysOfMonth(year, month);
	}
}

/**
 * 农历日期验证器
 * 用于验证农历日期的合法性
 */
export class LunarDateValidator {
	static validDate(
		year: number | undefined,
		month: number,
		day: number,
		isLeap: boolean = false
	): boolean {
		if (year !== undefined) {
			return this.validLunarDate(year, month, day, isLeap);
		}

		// 检查月份范围
		if (month < 1 || month > 12) {
			return false;
		}

		// 检查日期范围
		if (day < 1 || day > 30) {
			return false;
		}

		return true;
	}

	static validLunarDate(
		year: number,
		month: number,
		day: number,
		isLeap: boolean = false
	): boolean {
		// 检查输入参数的基本有效性
		if (
			!Number.isInteger(year) ||
			!Number.isInteger(month) ||
			!Number.isInteger(day)
		) {
			return false;
		}

		// 检查年份合理性
		if (year < 1 || year > 9999) {
			return false;
		}

		// 检查月份范围
		if (month < 1 || month > 12) {
			return false;
		}

		// 检查日期范围
		if (day < 1 || day > 30) {
			return false;
		}

		try {
			if (isLeap) {
				// 如果是闰月，月份需要为负数
				Lunar.fromYmd(year, -month, day);
			} else {
				Lunar.fromYmd(year, month, day);
			}
			return true;
		} catch (error) {
			// 农历库会在以下情况抛出异常：
			// 1. 指定年份不存在该闰月
			// 2. 指定月份的天数超出范围（如某月只有29天但传入30天）
			return false;
		}
	}
}
