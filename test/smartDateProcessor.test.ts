import {
	parseUserDateInput,
	SmartDateProcessor,
} from "../src/core/utils/smartDateProcessor";

describe("SmartDateProcessor", () => {
	describe("公历日期解析", () => {
		describe("标准格式 (YYYY-MM-DD)", () => {
			test("应该正确解析完整的公历日期 - 连字符", () => {
				const result = SmartDateProcessor.parseUserInput("2025-01-01");
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析完整的公历日期 - 斜杠", () => {
				const result = SmartDateProcessor.parseUserInput("2025/01/01");
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析完整的公历日期 - 点号", () => {
				const result = SmartDateProcessor.parseUserInput("2025.01.01");
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析完整的公历日期 - 逗号", () => {
				const result = SmartDateProcessor.parseUserInput("2025,01,01");
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "GREGORIAN",
				});
			});
		});

		describe("月日格式 (MM-DD)", () => {
			test("应该正确解析月日格式 - 连字符", () => {
				const result = SmartDateProcessor.parseUserInput("01-01");
				expect(result).toEqual({
					isoDate: "01-01",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析月日格式 - 斜杠", () => {
				const result = SmartDateProcessor.parseUserInput("01/01");
				expect(result).toEqual({
					isoDate: "01-01",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析月日格式 - 点号", () => {
				const result = SmartDateProcessor.parseUserInput("01.01");
				expect(result).toEqual({
					isoDate: "01-01",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析月日格式 - 逗号", () => {
				const result = SmartDateProcessor.parseUserInput("01,01");
				expect(result).toEqual({
					isoDate: "01-01",
					calendar: "GREGORIAN",
				});
			});
		});

		describe("中文格式", () => {
			test("应该正确解析中文格式 - 完整年月日", () => {
				const result = SmartDateProcessor.parseUserInput(
					"2025年01月01日",
					"GREGORIAN"
				);
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析中文格式 - 月日", () => {
				const result = SmartDateProcessor.parseUserInput(
					"01月01日",
					"GREGORIAN"
				);
				expect(result).toEqual({
					isoDate: "01-01",
					calendar: "GREGORIAN",
				});
			});
		});

		describe("混合格式", () => {
			test("应该正确解析混合格式 - 年月日无前导零", () => {
				const result = SmartDateProcessor.parseUserInput(
					"2025年1月1日",
					"GREGORIAN"
				);
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析混合格式 - 连字符无前导零", () => {
				const result = SmartDateProcessor.parseUserInput("2025-1-1");
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "GREGORIAN",
				});
			});
		});

		describe("边界值测试", () => {
			test("应该正确解析最大月份和日期", () => {
				const result = SmartDateProcessor.parseUserInput("2025-12-31");
				expect(result).toEqual({
					isoDate: "2025-12-31",
					calendar: "GREGORIAN",
				});
			});

			test("应该正确解析最小月份和日期", () => {
				const result = SmartDateProcessor.parseUserInput("2025-01-01");
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "GREGORIAN",
				});
			});
		});
	});

	describe("农历日期解析", () => {
		describe("数字格式", () => {
			test("应该正确解析数字格式农历 - 完整年月日", () => {
				const result = SmartDateProcessor.parseUserInput(
					"2025,1,1",
					"LUNAR"
				);
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "LUNAR",
				});
			});

			test("应该正确解析数字格式农历 - 月日", () => {
				const result = SmartDateProcessor.parseUserInput(
					"1,1",
					"LUNAR"
				);
				expect(result).toEqual({
					isoDate: "01-01",
					calendar: "LUNAR",
				});
			});

			test("应该正确解析数字格式闰月 - 完整年月日", () => {
				const result = SmartDateProcessor.parseUserInput(
					"2025,-6,1",
					"LUNAR"
				);
				expect(result).toEqual({
					isoDate: "2025-06-01",
					calendar: "LUNAR_LEAP",
				});
			});

			test("应该正确解析数字格式闰月 - 月日", () => {
				const result = SmartDateProcessor.parseUserInput(
					"-6,1",
					"LUNAR"
				);
				expect(result).toEqual({
					isoDate: "06-01",
					calendar: "LUNAR_LEAP",
				});
			});
		});

		describe("中文格式 - 普通农历", () => {
			test("应该正确解析中文农历 - 完整年月日", () => {
				const result =
					SmartDateProcessor.parseUserInput("2025年正月初一");
				expect(result).toEqual({
					isoDate: "2025-01-01",
					calendar: "LUNAR",
				});
			});

			test("应该正确解析中文农历 - 月日", () => {
				const result = SmartDateProcessor.parseUserInput("正月初一");
				expect(result).toEqual({
					isoDate: "01-01",
					calendar: "LUNAR",
				});
			});

			test("应该正确解析中文农历 - 腊月", () => {
				const result = SmartDateProcessor.parseUserInput("腊月三十");
				expect(result).toEqual({
					isoDate: "12-30",
					calendar: "LUNAR",
				});
			});

			test("应该正确解析中文农历 - 冬月", () => {
				const result = SmartDateProcessor.parseUserInput("冬月十五");
				expect(result).toEqual({
					isoDate: "11-15",
					calendar: "LUNAR",
				});
			});

			test("应该正确解析中文农历 - 廿一到廿九", () => {
				const result = SmartDateProcessor.parseUserInput("五月廿五");
				expect(result).toEqual({
					isoDate: "05-25",
					calendar: "LUNAR",
				});
			});
		});

		describe("中文格式 - 闰月", () => {
			test("应该正确解析闰月 - 完整年月日", () => {
				const result =
					SmartDateProcessor.parseUserInput("2025年闰六月初一");
				expect(result).toEqual({
					isoDate: "2025-06-01",
					calendar: "LUNAR_LEAP",
				});
			});

			test("应该正确解析闰月 - 月日", () => {
				const result = SmartDateProcessor.parseUserInput("闰六月初一");
				expect(result).toEqual({
					isoDate: "06-01",
					calendar: "LUNAR_LEAP",
				});
			});

			test("应该正确解析闰月 - 中文数字年份", () => {
				const result =
					SmartDateProcessor.parseUserInput("二〇二五年闰六月初一");
				expect(result).toEqual({
					isoDate: "2025-06-01",
					calendar: "LUNAR_LEAP",
				});
			});
		});

		describe("各月份测试", () => {
			const months = [
				{ name: "正月", num: 1 },
				{ name: "一月", num: 1 },
				{ name: "二月", num: 2 },
				{ name: "三月", num: 3 },
				{ name: "四月", num: 4 },
				{ name: "五月", num: 5 },
				{ name: "六月", num: 6 },
				{ name: "七月", num: 7 },
				{ name: "八月", num: 8 },
				{ name: "九月", num: 9 },
				{ name: "十月", num: 10 },
				{ name: "冬月", num: 11 },
				{ name: "腊月", num: 12 },
			];

			months.forEach(({ name, num }) => {
				test(`应该正确解析农历${name}`, () => {
					const result = SmartDateProcessor.parseUserInput(
						`${name}初一`
					);
					expect(result).toEqual({
						isoDate: `${num.toString().padStart(2, "0")}-01`,
						calendar: "LUNAR",
					});
				});
			});
		});

		describe("各日期测试", () => {
			const days = [
				{ name: "初一", num: 1 },
				{ name: "初五", num: 5 },
				{ name: "初十", num: 10 },
				{ name: "十五", num: 15 },
				{ name: "二十", num: 20 },
				{ name: "廿五", num: 25 },
				{ name: "三十", num: 30 },
			];

			days.forEach(({ name, num }) => {
				test(`应该正确解析农历${name}`, () => {
					const result = SmartDateProcessor.parseUserInput(
						`正月${name}`
					);
					expect(result).toEqual({
						isoDate: `01-${num.toString().padStart(2, "0")}`,
						calendar: "LUNAR",
					});
				});
			});
		});
	});

	describe("日历类型自动检测", () => {
		test("应该自动检测公历格式", () => {
			const result = SmartDateProcessor.parseUserInput("2025-01-01");
			expect(result.calendar).toBe("GREGORIAN");
		});

		test("应该自动检测农历格式", () => {
			const result = SmartDateProcessor.parseUserInput("正月初一");
			expect(result.calendar).toBe("LUNAR");
		});

		test("应该自动检测闰月格式", () => {
			const result = SmartDateProcessor.parseUserInput("闰六月初一");
			expect(result.calendar).toBe("LUNAR_LEAP");
		});

		test("应该优先使用指定的日历类型", () => {
			const result = SmartDateProcessor.parseUserInput("1,1", "LUNAR");
			expect(result.calendar).toBe("LUNAR");
		});
	});

	describe("中文数字转换", () => {
		test("应该正确转换中文数字年份", () => {
			const result =
				SmartDateProcessor.parseUserInput("二〇二五年正月初一");
			expect(result.isoDate).toContain("2025");
		});

		test("应该正确处理零的不同写法", () => {
			const result1 =
				SmartDateProcessor.parseUserInput("二〇二五年正月初一");
			const result2 =
				SmartDateProcessor.parseUserInput("二零二五年正月初一");
			expect(result1.isoDate).toContain("2025");
			expect(result2.isoDate).toContain("2025");
		});
	});

	describe("边界值和异常情况", () => {
		test("应该处理空字符串", () => {
			expect(() => {
				SmartDateProcessor.parseUserInput("");
			}).toThrow();
		});

		test("应该处理只有空格的字符串", () => {
			expect(() => {
				SmartDateProcessor.parseUserInput("   ");
			}).toThrow();
		});

		test("应该处理无效的日期格式", () => {
			expect(() => {
				SmartDateProcessor.parseUserInput("invalid date");
			}).toThrow();
		});

		test("应该处理不完整的数字", () => {
			// "2025-1" 会被解析为有效输入（年-月，缺少日），实际上会抛出异常因为缺少日期
			expect(() => {
				SmartDateProcessor.parseUserInput("2025");
			}).toThrow();
		});

		test("应该处理过多的数字", () => {
			expect(() => {
				SmartDateProcessor.parseUserInput("2025-01-01-15");
			}).toThrow();
		});

		test("应该处理不支持的日历类型", () => {
			expect(() => {
				// @ts-expect-error - 故意传入无效的日历类型来测试错误处理
				SmartDateProcessor.parseUserInput("2025-01-01", "INVALID");
			}).toThrow("Unsupported calendar type: INVALID");
		});

		test("应该处理无法解析的农历格式", () => {
			expect(() => {
				SmartDateProcessor.parseUserInput("不合法的格式", "LUNAR");
			}).toThrow();
		});
	});

	describe("便捷函数测试", () => {
		test("parseUserDateInput 应该与 SmartDateProcessor.parseUserInput 行为一致", () => {
			const input = "2025-01-01";
			const result1 = parseUserDateInput(input);
			const result2 = SmartDateProcessor.parseUserInput(input);
			expect(result1).toEqual(result2);
		});

		test("parseUserDateInput 应该支持指定日历类型", () => {
			const input = "1,1";
			const result = parseUserDateInput(input, "LUNAR");
			expect(result.calendar).toBe("LUNAR");
		});
	});

	describe("ISO日期字符串格式", () => {
		test("月日格式应该正确填充前导零", () => {
			const result = SmartDateProcessor.parseUserInput("1-1");
			expect(result.isoDate).toContain("01-01");
		});

		test("完整格式应该正确填充前导零", () => {
			const result = SmartDateProcessor.parseUserInput("2025-1-1");
			expect(result.isoDate).toContain("2025-01-01");
		});
	});

	describe("复杂用例", () => {
		test("应该处理带有额外空格的输入", () => {
			const result = SmartDateProcessor.parseUserInput("  2025-01-01  ");
			expect(result).toEqual({
				isoDate: "2025-01-01",
				calendar: "GREGORIAN",
			});
		});

		test("应该处理混合分隔符", () => {
			// 虽然不推荐，但应该能够解析出数字，需要指定为公历
			const result = SmartDateProcessor.parseUserInput(
				"2025年1月1",
				"GREGORIAN"
			);
			expect(result.isoDate).toContain("2025-01-01");
		});

		test("应该正确处理农历的所有日期范围", () => {
			// 测试1-30日的所有农历日期
			for (let day = 1; day <= 30; day++) {
				const dayNames = {
					1: "初一",
					2: "初二",
					3: "初三",
					4: "初四",
					5: "初五",
					6: "初六",
					7: "初七",
					8: "初八",
					9: "初九",
					10: "初十",
					11: "十一",
					12: "十二",
					13: "十三",
					14: "十四",
					15: "十五",
					16: "十六",
					17: "十七",
					18: "十八",
					19: "十九",
					20: "二十",
					21: "廿一",
					22: "廿二",
					23: "廿三",
					24: "廿四",
					25: "廿五",
					26: "廿六",
					27: "廿七",
					28: "廿八",
					29: "廿九",
					30: "三十",
				};

				const dayName = dayNames[day as keyof typeof dayNames];
				if (dayName) {
					const result = SmartDateProcessor.parseUserInput(
						`正月${dayName}`
					);
					expect(result.isoDate).toContain(
						`01-${day.toString().padStart(2, "0")}`
					);
				}
			}
		});
	});

	describe("闰月处理和降级", () => {
		test("当指定的闰月无效时，应该降级为普通月并更新日历类型", () => {
			// 2025年没有闰六月，但用户指定了闰月类型
			const result = SmartDateProcessor.parseUserInput(
				"2025-06-15",
				"LUNAR_LEAP"
			);
			expect(result).toEqual({
				isoDate: "2025-06-15",
				calendar: "LUNAR", // 应该降级为普通农历月
			});
		});

		test("当输入文本没有闰字但指定了闰月类型时，如果闰月无效应降级", () => {
			// 2025年没有闰正月，但指定了闰月类型
			const result = SmartDateProcessor.parseUserInput(
				"2025年正月初一",
				"LUNAR_LEAP"
			);
			expect(result).toEqual({
				isoDate: "2025-01-01",
				calendar: "LUNAR", // 应该降级为普通农历月
			});
		});

		test("当输入文本有闰字但该年没有对应闰月时，应该降级为普通月", () => {
			// 2025年没有闰二月
			const result =
				SmartDateProcessor.parseUserInput("2025年闰二月初一");
			expect(result).toEqual({
				isoDate: "2025-02-01",
				calendar: "LUNAR", // 应该降级为普通农历月
			});
		});

		test("当闰月存在且有效时，应保持闰月类型", () => {
			// 假设某年有闰六月（需要根据实际农历数据调整）
			// 这里使用一个已知有闰月的年份，比如2020年有闰四月
			const result =
				SmartDateProcessor.parseUserInput("2020年闰四月初一");
			expect(result.calendar).toBe("LUNAR_LEAP");
			expect(result.isoDate).toBe("2020-04-01");
		});

		test("数字格式的闰月降级测试", () => {
			// 2025年没有闰六月
			const result = SmartDateProcessor.parseUserInput(
				"2025-06-01",
				"LUNAR_LEAP"
			);
			expect(result).toEqual({
				isoDate: "2025-06-01",
				calendar: "LUNAR", // 应该降级为普通农历月
			});
		});
	});
});
