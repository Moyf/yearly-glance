import {
	GregorianDateValidator,
	LunarDateValidator,
} from "../src/core/utils/dateValidator";

describe("GregorianDateValidator", () => {
	describe("validDate (无年份)", () => {
		test("有效日期", () => {
			expect(GregorianDateValidator.validDate(undefined, 1, 1)).toBe(
				true
			);
			expect(GregorianDateValidator.validDate(undefined, 6, 15)).toBe(
				true
			);
			expect(GregorianDateValidator.validDate(undefined, 12, 31)).toBe(
				true
			);
		});

		test("无效月", () => {
			expect(GregorianDateValidator.validDate(undefined, 0, 15)).toBe(
				false
			);
			expect(GregorianDateValidator.validDate(undefined, 13, 15)).toBe(
				false
			);
			expect(GregorianDateValidator.validDate(undefined, -1, 15)).toBe(
				false
			);
		});

		test("无效日", () => {
			expect(GregorianDateValidator.validDate(undefined, 6, 0)).toBe(
				false
			);
			expect(GregorianDateValidator.validDate(undefined, 6, 32)).toBe(
				false
			);
			expect(GregorianDateValidator.validDate(undefined, 6, -1)).toBe(
				false
			);
		});
	});

	describe("validSolarDate (有年份)", () => {
		test("有效日期", () => {
			expect(GregorianDateValidator.validSolarDate(2024, 1, 1)).toBe(
				true
			);
			expect(GregorianDateValidator.validSolarDate(2024, 6, 15)).toBe(
				true
			);
			expect(GregorianDateValidator.validSolarDate(2024, 12, 31)).toBe(
				true
			);
		});

		test("2月的闰年处理", () => {
			// 2024 is a leap year
			expect(GregorianDateValidator.validSolarDate(2024, 2, 29)).toBe(
				true
			);
			expect(GregorianDateValidator.validSolarDate(2024, 2, 30)).toBe(
				false
			);

			// 2023 is not a leap year
			expect(GregorianDateValidator.validSolarDate(2023, 2, 28)).toBe(
				true
			);
			expect(GregorianDateValidator.validSolarDate(2023, 2, 29)).toBe(
				false
			);
		});

		test("不同天数的月份", () => {
			// January has 31 days
			expect(GregorianDateValidator.validSolarDate(2024, 1, 31)).toBe(
				true
			);
			expect(GregorianDateValidator.validSolarDate(2024, 1, 32)).toBe(
				false
			);

			// April has 30 days
			expect(GregorianDateValidator.validSolarDate(2024, 4, 30)).toBe(
				true
			);
			expect(GregorianDateValidator.validSolarDate(2024, 4, 31)).toBe(
				false
			);
		});

		test("无效年份", () => {
			expect(GregorianDateValidator.validSolarDate(0, 6, 15)).toBe(false);
			expect(GregorianDateValidator.validSolarDate(-1, 6, 15)).toBe(
				false
			);
			expect(GregorianDateValidator.validSolarDate(10000, 6, 15)).toBe(
				false
			);
			expect(GregorianDateValidator.validSolarDate(1.5, 6, 15)).toBe(
				false
			);
		});

		test("无效月", () => {
			expect(GregorianDateValidator.validSolarDate(2024, 0, 15)).toBe(
				false
			);
			expect(GregorianDateValidator.validSolarDate(2024, 13, 15)).toBe(
				false
			);
			expect(GregorianDateValidator.validSolarDate(2024, 1.5, 15)).toBe(
				false
			);
		});

		test("无效日", () => {
			expect(GregorianDateValidator.validSolarDate(2024, 6, 0)).toBe(
				false
			);
			expect(GregorianDateValidator.validSolarDate(2024, 6, 32)).toBe(
				false
			);
			expect(GregorianDateValidator.validSolarDate(2024, 6, 1.5)).toBe(
				false
			);
		});

		test("年份的边界情况", () => {
			expect(GregorianDateValidator.validSolarDate(1, 1, 1)).toBe(true);
			expect(GregorianDateValidator.validSolarDate(9999, 12, 31)).toBe(
				true
			);
		});
	});
});

describe("LunarDateValidator", () => {
	describe("validDate (无年份)", () => {
		test("有效日期", () => {
			expect(LunarDateValidator.validDate(undefined, 1, 1)).toBe(true);
			expect(LunarDateValidator.validDate(undefined, 6, 15)).toBe(true);
			expect(LunarDateValidator.validDate(undefined, 12, 30)).toBe(true);
		});

		test("无效月", () => {
			expect(LunarDateValidator.validDate(undefined, 0, 15)).toBe(false);
			expect(LunarDateValidator.validDate(undefined, 13, 15)).toBe(false);
			expect(LunarDateValidator.validDate(undefined, -1, 15)).toBe(false);
		});

		test("无效日", () => {
			expect(LunarDateValidator.validDate(undefined, 6, 0)).toBe(false);
			expect(LunarDateValidator.validDate(undefined, 6, 31)).toBe(false);
			expect(LunarDateValidator.validDate(undefined, 6, -1)).toBe(false);
		});
	});

	describe("validLunarDate (有年份)", () => {
		test("有效农历日期", () => {
			expect(LunarDateValidator.validLunarDate(2024, 1, 1)).toBe(true);
			expect(LunarDateValidator.validLunarDate(2024, 6, 15)).toBe(true);
			expect(LunarDateValidator.validLunarDate(2024, 12, 29)).toBe(true);
		});

		test("处理农历闰月", () => {
			// 2023年有闰二月
			expect(LunarDateValidator.validLunarDate(2023, 2, 15, true)).toBe(
				true
			);
			expect(LunarDateValidator.validLunarDate(2023, 2, 15, false)).toBe(
				true
			);

			// 2024年没有闰二月
			expect(LunarDateValidator.validLunarDate(2024, 2, 15, false)).toBe(
				true
			);
			expect(LunarDateValidator.validLunarDate(2024, 2, 15, true)).toBe(
				false
			);
		});

		test("不同天数的月份", () => {
			// 某些农历月份只有29天
			expect(LunarDateValidator.validLunarDate(2024, 1, 29)).toBe(true);

			// 测试超出范围的日期
			expect(LunarDateValidator.validLunarDate(2024, 1, 30)).toBe(false);
			expect(LunarDateValidator.validLunarDate(2024, 1, 31)).toBe(false);
		});

		test("无效输入类型", () => {
			expect(LunarDateValidator.validLunarDate(2024.5, 1, 15)).toBe(
				false
			);
			expect(LunarDateValidator.validLunarDate(2024, 1.5, 15)).toBe(
				false
			);
			expect(LunarDateValidator.validLunarDate(2024, 1, 15.5)).toBe(
				false
			);
		});

		test("无效年", () => {
			expect(LunarDateValidator.validLunarDate(0, 6, 15)).toBe(false);
			expect(LunarDateValidator.validLunarDate(-1, 6, 15)).toBe(false);
			expect(LunarDateValidator.validLunarDate(10000, 6, 15)).toBe(false);
		});

		test("无效月", () => {
			expect(LunarDateValidator.validLunarDate(2024, 0, 15)).toBe(false);
			expect(LunarDateValidator.validLunarDate(2024, 13, 15)).toBe(false);
			expect(LunarDateValidator.validLunarDate(2024, -1, 15)).toBe(false);
		});

		test("无效日", () => {
			expect(LunarDateValidator.validLunarDate(2024, 6, 0)).toBe(false);
			expect(LunarDateValidator.validLunarDate(2024, 6, 31)).toBe(false);
			expect(LunarDateValidator.validLunarDate(2024, 6, -1)).toBe(false);
		});

		test("边界年份", () => {
			// 测试边界年份
			expect(LunarDateValidator.validLunarDate(1, 1, 1)).toBe(true);
			expect(LunarDateValidator.validLunarDate(9999, 12, 29)).toBe(true);
		});

		test("不存在的农历闰月", () => {
			// 测试不存在的闰月
			expect(LunarDateValidator.validLunarDate(2024, 1, 15, true)).toBe(
				false
			);
			expect(LunarDateValidator.validLunarDate(2024, 12, 15, true)).toBe(
				false
			);
		});
	});

	describe("error handling", () => {
		test("lunar-typescript 库抛出异常", () => {
			// 这些测试确保当 lunar-typescript 库抛出异常时，验证器返回 false
			expect(LunarDateValidator.validLunarDate(1000, 13, 1)).toBe(false);
			expect(LunarDateValidator.validLunarDate(2024, 2, 50)).toBe(false);
		});
	});
});

describe("Integration tests", () => {
	test("常见的日期场景", () => {
		// 测试一些常见的日期场景
		const commonDates = [
			{ year: 2024, month: 1, day: 1 }, // 新年
			{ year: 2024, month: 2, day: 29 }, // 闰年2月29日
			{ year: 2024, month: 12, day: 31 }, // 年末
		];

		commonDates.forEach(({ year, month, day }) => {
			expect(
				GregorianDateValidator.validSolarDate(year, month, day)
			).toBe(true);
		});

		// 测试农历常见日期
		const lunarDates = [
			{ year: 2024, month: 1, day: 1 }, // 农历新年
			{ year: 2024, month: 8, day: 15 }, // 中秋节
			{ year: 2024, month: 12, day: 29 }, // 农历年末
		];

		lunarDates.forEach(({ year, month, day }) => {
			expect(LunarDateValidator.validLunarDate(year, month, day)).toBe(
				true
			);
		});
	});
});
