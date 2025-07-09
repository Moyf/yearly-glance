import { Lunar, Solar } from "lunar-typescript";

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
		let isValid = true;

		// 检查年份范围
		isValid &&= this.validDateConstruction(year, month, day);

		return isValid;
	}

	static validDateConstruction(
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
		try {
			Solar.fromYmd(year, month, day);
			return true;
		} catch (error) {
			return false;
		}
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
		try {
			if (isLeap) {
				// 如果是闰月，月份需要为负数
				Lunar.fromYmd(year, -month, day);
			} else {
				Lunar.fromYmd(year, month, day);
			}
			return true;
		} catch (error) {
			return false;
		}
	}
}
