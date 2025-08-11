import { Lunar, Solar } from "lunar-typescript";
import { lunarDays, lunarMonths } from "@/src/type/Date";

export class LunarLibrary {
	/**
	 * 构造有效的农历日期Lunar对象
	 * @param year 年份
	 * @param month 月份
	 * @param day 日
	 * @returns Lunar对象
	 */
	static constructLunar(year: number, month: number, day: number): Lunar {
		if (month < 0) {
			// 农历闰月情况
			if (this.isValidLunarDate(year, month, day)) {
				// 构造正常，直接返回
				return Lunar.fromYmd(year, month, day);
			} else if (this.isValidLunarDate(year, Math.abs(month), day)) {
				// 如果因为当前年份没有该农历闰月，导致构造失败，则使用正常月份
				return Lunar.fromYmd(year, Math.abs(month), day);
			} else {
				// 其他情况是当前月份没有该农历日，一般出现在该月份没有三十，则使用前一天
				return Lunar.fromYmd(year, month, day - 1);
			}
		} else {
			// 农历正常月份情况
			if (this.isValidLunarDate(year, month, day)) {
				return Lunar.fromYmd(year, month, day);
			} else {
				// 其他情况是当前月份没有该农历日，一般出现在该月份没有三十，则使用前一天
				return Lunar.fromYmd(year, month, day - 1);
			}
		}
	}

	/**
	 * 验证农历日期是否有效
	 * 农历库会在以下情况抛出异常：
	 * 1. 指定年份不存在该闰月
	 * 2. 指定月份的天数超出范围（如某月只有29天但传入30天）
	 * @param year 年份
	 * @param month 月份
	 * @param day 日
	 * @returns 是否有效
	 */
	static isValidLunarDate(year: number, month: number, day: number): boolean {
		try {
			Lunar.fromYmd(year, month, day);
			return true;
		} catch (error) {
			return false;
		}
	}

	static getDayOfLunarMonth(date: Date): string {
		const Sd = Solar.fromDate(date);
		const Ld = Sd.getLunar();

		let dayOfLunarMonth = "";
		if (Ld.getDay() === 1) {
			dayOfLunarMonth = Ld.getMonthInChinese() + "月";
		} else {
			dayOfLunarMonth = Ld.getDayInChinese();
		}
		return dayOfLunarMonth;
	}

	static getChineseName(
		year: number | undefined,
		month: number,
		day: number
	): string {
		if (year !== undefined) {
			const d = this.constructLunar(year, month, day);
			return (
				d.getYearInChinese() +
				"年" +
				d.getMonthInChinese() +
				"月" +
				d.getDayInChinese()
			);
		} else {
			// 没有年份时，根据月份和日期数字反向查找对应的中文名称
			const monthName = this.getMonthChineseName(month);
			const dayName = this.getDayChineseName(day);
			return monthName + dayName;
		}
	}

	/**
	 * 根据月份数字获取农历月份中文名称
	 * @param month 月份数字
	 * @returns 农历月份中文名称
	 */
	private static getMonthChineseName(month: number): string {
		// 处理闰月情况
		if (month < 0) {
			const absMonth = Math.abs(month);
			const monthName = this.getMonthChineseName(absMonth);
			return "闰" + monthName;
		}

		// 根据月份数字查找对应的中文名称
		for (const [chineseName, num] of Object.entries(lunarMonths)) {
			if (num === month) {
				return chineseName;
			}
		}

		// 如果没有找到对应的中文名称，返回数字形式
		return month.toString();
	}

	/**
	 * 根据日期数字获取农历日期中文名称
	 * @param day 日期数字
	 * @returns 农历日期中文名称
	 */
	private static getDayChineseName(day: number): string {
		// 根据日期数字查找对应的中文名称
		for (const [chineseName, num] of Object.entries(lunarDays)) {
			if (num === day) {
				return chineseName;
			}
		}

		// 如果没有找到对应的中文名称，返回数字形式
		return day.toString();
	}
}
