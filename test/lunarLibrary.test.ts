import { Lunar, Solar } from "lunar-typescript";

describe("lunar-typescript库行为测试", () => {
	describe("Solar (公历) 日期行为", () => {
		test("应该了解Solar.fromYmd对无效日期的处理", () => {
			const testCases: [number, number, number, boolean][] = [
				[2025, 2, 29, true], // 非闰年的2月29日 - 库允许
				[2025, 4, 31, true], // 4月31日 - 库允许
				[0, 1, 1, true], // 年份为0 - 库允许
				[-1, 1, 1, true], // 负年份 - 库允许
				[2024, 2, 29, true], // 闰年2月29日 - 有效
				[2025, 12, 31, true], // 有效日期
			];

			testCases.forEach(([year, month, day, shouldSucceed]) => {
				if (shouldSucceed) {
					expect(() => {
						const solar = Solar.fromYmd(year, month, day);
						console.log(`Solar.fromYmd(${year}, ${month}, ${day}): SUCCESS - ${solar.toString()}`);
					}).not.toThrow();
				} else {
					expect(() => {
						Solar.fromYmd(year, month, day);
					}).toThrow();
				}
			});
		});

		test("应该记录Solar库的实际行为", () => {
			// 这些测试记录了库的实际行为，而不是我们期望的行为
			
			// 库允许无效的日期
			expect(() => Solar.fromYmd(2025, 2, 29)).not.toThrow(); // 非闰年2月29日
			expect(() => Solar.fromYmd(2025, 4, 31)).not.toThrow(); // 4月31日
			expect(() => Solar.fromYmd(0, 1, 1)).not.toThrow(); // 年份为0
			expect(() => Solar.fromYmd(-1, 1, 1)).not.toThrow(); // 负年份

			// 库正确处理有效日期
			expect(() => Solar.fromYmd(2024, 2, 29)).not.toThrow(); // 闰年2月29日
			expect(() => Solar.fromYmd(2025, 12, 31)).not.toThrow(); // 有效日期
		});
	});

	describe("Lunar (农历) 日期行为", () => {
		test("应该了解Lunar.fromYmd对无效日期的处理", () => {
			const testCases: [number, number, number, boolean, string][] = [
				[2025, 1, 1, true, "正常农历日期"],
				[2025, 12, 30, false, "农历2025年12月只有29天"],
				[2024, 12, 30, false, "农历2024年12月只有29天"],
				[0, 1, 1, true, "年份为0 - 库允许"],
				[-1, 1, 1, true, "负年份 - 库允许"],
				[2025, 12, 29, true, "农历2025年12月29日 - 有效"],
				[2024, 12, 29, true, "农历2024年12月29日 - 有效"],
			];

			testCases.forEach(([year, month, day, shouldSucceed, description]) => {
				if (shouldSucceed) {
					expect(() => {
						const lunar = Lunar.fromYmd(year, month, day);
						console.log(`${description}: Lunar.fromYmd(${year}, ${month}, ${day}): SUCCESS - ${lunar.toString()}`);
					}).not.toThrow();
				} else {
					expect(() => {
						Lunar.fromYmd(year, month, day);
						console.log(`${description}: 预期失败但成功了`);
					}).toThrow();
				}
			});
		});

		test("应该记录Lunar库的实际行为", () => {
			// 有效的农历日期
			expect(() => Lunar.fromYmd(2025, 1, 1)).not.toThrow();
			expect(() => Lunar.fromYmd(2025, 12, 29)).not.toThrow();
			expect(() => Lunar.fromYmd(2024, 12, 29)).not.toThrow();

			// 无效的农历日期 - 超出当月天数
			expect(() => Lunar.fromYmd(2025, 12, 30)).toThrow();
			expect(() => Lunar.fromYmd(2024, 12, 30)).toThrow();

			// 库允许特殊年份
			expect(() => Lunar.fromYmd(0, 1, 1)).not.toThrow();
			expect(() => Lunar.fromYmd(-1, 1, 1)).not.toThrow();
		});

		test("应该测试闰月行为", () => {
			// 2023年有闰二月
			expect(() => Lunar.fromYmd(2023, -2, 15)).not.toThrow(); // 闰二月
			expect(() => Lunar.fromYmd(2023, 2, 15)).not.toThrow(); // 正常二月

			// 2025年有闰六月
			expect(() => Lunar.fromYmd(2025, -6, 15)).not.toThrow(); // 闰六月
			expect(() => Lunar.fromYmd(2025, 6, 15)).not.toThrow(); // 正常六月

			// 不存在的闰月应该失败
			expect(() => Lunar.fromYmd(2025, -1, 15)).toThrow(); // 2025年没有闰正月
		});
	});

	describe("库的边界条件测试", () => {
		test("应该测试极值情况", () => {
			// 这些测试帮助我们了解库的边界行为
			
			// 测试年份边界
			expect(() => Solar.fromYmd(1, 1, 1)).not.toThrow();
			expect(() => Solar.fromYmd(9999, 12, 31)).not.toThrow();
			
			// 测试月份边界
			expect(() => Solar.fromYmd(2025, 1, 1)).not.toThrow();
			expect(() => Solar.fromYmd(2025, 12, 31)).not.toThrow();
			
			// 无效月份应该如何处理？
			// expect(() => Solar.fromYmd(2025, 0, 1)).toThrow();
			// expect(() => Solar.fromYmd(2025, 13, 1)).toThrow();
		});

		test("应该记录库对异常输入的处理", () => {
			// 这些测试记录库如何处理异常输入
			
			// NaN 和 Infinity 的处理
			// expect(() => Solar.fromYmd(NaN, 1, 1)).toThrow();
			// expect(() => Solar.fromYmd(Infinity, 1, 1)).toThrow();
			// expect(() => Solar.fromYmd(2025, NaN, 1)).toThrow();
			// expect(() => Solar.fromYmd(2025, 1, NaN)).toThrow();
		});
	});
});
