import { HolidayUtil } from "lunar-typescript";

describe("HolidayUtil.fix() 测试", () => {
	beforeAll(() => {
		console.log("===== HolidayUtil.fix() 测试开始 =====");
	});

	it("测试 1: 获取修复前各年份节假日数量", () => {
		const holidays2024 = HolidayUtil.getHolidays(2024);
		const holidays2025 = HolidayUtil.getHolidays(2025);
		const holidays2026 = HolidayUtil.getHolidays(2026);

		console.log("修复前:");
		console.log("  2024 年节假日数量:", holidays2024.length);
		console.log("  2025 年节假日数量:", holidays2025.length);
		console.log("  2026 年节假日数量:", holidays2026.length, "(库不支持，应为 0)");

		expect(holidays2024.length).toBeGreaterThan(0);
		expect(holidays2025.length).toBeGreaterThan(0);
		expect(holidays2026.length).toBe(0); // 库不支持 2026 年
	});

	it("测试 2: 调用 fix() 追加 2026 年数据", () => {
		const fixData2026 =
			"202601010120260101" +
			"202601020120260101" +
			"202601030120260101" +
			"202601040020260101";

		console.log("\n调用 HolidayUtil.fix() 追加 2026 年数据...");
		console.log("数据:", fixData2026);
		console.log("长度:", fixData2026.length, "(应为 72，即 4 条 * 18)");

		HolidayUtil.fix(fixData2026);

		console.log("fix() 调用完成");
	});

	it("测试 3: 获取修复后各年份节假日数量", () => {
		const holidays2024 = HolidayUtil.getHolidays(2024);
		const holidays2025 = HolidayUtil.getHolidays(2025);
		const holidays2026 = HolidayUtil.getHolidays(2026);

		console.log("\n修复后:");
		console.log("  2024 年节假日数量:", holidays2024.length);
		console.log("  2025 年节假日数量:", holidays2025.length);
		console.log("  2026 年节假日数量:", holidays2026.length);

		holidays2026.forEach((h) => {
			console.log(`  ${h.getDay()} ${h.getName()} ${h.isWork() ? "班" : "休"}`);
		});

		expect(holidays2026.length).toBeGreaterThan(0);
	});

	it("测试 4: 验证 fix() 是否影响其他年份", () => {
		const holidays2024 = HolidayUtil.getHolidays(2024);
		const holidays2025 = HolidayUtil.getHolidays(2025);

		console.log("\n验证是否影响其他年份:");
		console.log("  2024 年节假日数量:", holidays2024.length, "(应该不变)");
		console.log("  2025 年节假日数量:", holidays2025.length, "(应该不变)");

		expect(holidays2024.length).toBeGreaterThan(0);
		expect(holidays2025.length).toBeGreaterThan(0);
	});

	afterAll(() => {
		console.log("\n===== 测试完成 =====");
	});
});
