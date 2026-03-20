import { HolidayUtil, Lunar, Solar, SolarUtil } from "lunar-typescript";
import { Holiday } from "../src/type/Events";
import { HOLIDAY_COLOR, HOLIDAY_EMOJI } from "../src/i18n/holidayConfig";

/**
 * 节假日服务类
 * 负责从 lunar-typescript 库获取全年节假日信息
 * 包括：法定节假日、节气、公历节日、农历节日
 */
class HolidayServiceTest {
	private static getPublicHolidays(year: number): Holiday[] {
		const results: Holiday[] = [];
		const holidays = HolidayUtil.getHolidays(year);

		console.log(`[HolidayService] 获取 ${year} 年法定节假日:`, holidays.length, "条");

		for (const h of holidays) {
			const day = h.getDay();
			const name = h.getName();
			const target = h.getTarget();
			const work = h.isWork();

			const isFirstDay = day === target;

			let text: string;
			let displayType: "public" | "public-work";

			if (isFirstDay) {
				text = name;
				displayType = "public";
			} else if (work) {
				text = "班";
				displayType = "public-work";
			} else {
				text = "休";
				displayType = "public";
			}

			results.push({
				id: `holi-public-${day.replace(/-/g, "")}`,
				text,
				emoji: HOLIDAY_EMOJI[displayType],
				color: HOLIDAY_COLOR[displayType],
				holidayType: displayType,
				eventDate: {
					isoDate: day,
					calendar: "GREGORIAN",
					userInput: {
						input: day,
						calendar: "GREGORIAN",
					},
				},
				foundDate: target,
			});
		}

		return results;
	}

	private static getSolarTerms(year: number): Holiday[] {
		const results: Holiday[] = [];

		const lunar = Lunar.fromYmd(year, 6, 15);
		const jieQiTable = lunar.getJieQiTable();

		for (const [name, solar] of Object.entries(jieQiTable)) {
			if (/^[\u4e00-\u9fa5]+$/.test(name)) {
				const day = solar.toYmd();

				results.push({
					id: `holi-solar-term-${day.replace(/-/g, "")}`,
					text: name,
					emoji: HOLIDAY_EMOJI["solar-term"],
					color: HOLIDAY_COLOR["solar-term"],
					holidayType: "solar-term",
					eventDate: {
						isoDate: day,
						calendar: "GREGORIAN",
						userInput: {
							input: day,
							calendar: "GREGORIAN",
						},
					},
				});
			}
		}

		return results;
	}

	private static getAllFestivals(year: number): Holiday[] {
		const results: Holiday[] = [];

		for (let month = 1; month <= 12; month++) {
			const daysInMonth = SolarUtil.getDaysOfMonth(year, month);

			for (let day = 1; day <= daysInMonth; day++) {
				const solar = Solar.fromYmd(year, month, day);
				const lunar = solar.getLunar();
				const solarDay = solar.toYmd();

				for (const name of solar.getFestivals()) {
					results.push(this.createFestivalHoliday(solarDay, name));
				}

				for (const name of solar.getOtherFestivals()) {
					results.push(this.createFestivalHoliday(solarDay, name));
				}

				for (const name of lunar.getFestivals()) {
					results.push(this.createFestivalHoliday(solarDay, name));
				}

				for (const name of lunar.getOtherFestivals()) {
					results.push(this.createFestivalHoliday(solarDay, name));
				}
			}
		}

		return results;
	}

	private static createFestivalHoliday(solarDay: string, name: string): Holiday {
		return {
			id: `holi-festival-${solarDay.replace(/-/g, "")}-${name}`,
			text: name,
			emoji: HOLIDAY_EMOJI["festival"],
			color: HOLIDAY_COLOR["festival"],
			holidayType: "festival",
			eventDate: {
				isoDate: solarDay,
				calendar: "GREGORIAN",
				userInput: {
					input: solarDay,
					calendar: "GREGORIAN",
				},
			},
		};
	}

	private static deduplicate(holidays: Holiday[]): Holiday[] {
		const seen = new Map<string, Holiday>();

		for (const h of holidays) {
			const key = `${h.eventDate.isoDate}-${h.text.substring(0, 2)}`;

			if (!seen.has(key)) {
				seen.set(key, h);
			} else if (h.holidayType === "public" || h.holidayType === "public-work") {
				seen.set(key, h);
			}
		}

		const stats = {
			public: 0,
			"public-work": 0,
			"solar-term": 0,
			festival: 0,
		};
		for (const h of seen.values()) {
			if (h.holidayType && stats.hasOwnProperty(h.holidayType)) {
				stats[h.holidayType]++;
			}
		}
		console.log(`[HolidayService] ${holidays.length} 条数据去重后:`, seen.size, "条", stats);

		return Array.from(seen.values()).sort((a, b) => {
			return a.eventDate.isoDate.localeCompare(b.eventDate.isoDate);
		});
	}

	static getFullYearHolidays(year: number): Holiday[] {
		const results: Holiday[] = [];

		results.push(...this.getPublicHolidays(year));
		results.push(...this.getSolarTerms(year));
		results.push(...this.getAllFestivals(year));

		return this.deduplicate(results);
	}
}

describe("HolidayService 问题复现测试", () => {
	beforeAll(() => {
		console.log("===== HolidayService 问题复现测试开始 =====");
	});

	it("测试1: 导入2026年节假日数据前，获取各年份节假日", () => {
		console.log("\n=== 导入前 ===");

		const holidays2024 = HolidayServiceTest.getFullYearHolidays(2024);
		const holidays2025 = HolidayServiceTest.getFullYearHolidays(2025);
		const holidays2026 = HolidayServiceTest.getFullYearHolidays(2026);
		const holidays2027 = HolidayServiceTest.getFullYearHolidays(2027);

		console.log("2024年节假日总数:", holidays2024.length);
		console.log("2025年节假日总数:", holidays2025.length);
		console.log("2026年节假日总数:", holidays2026.length);
		console.log("2027年节假日总数:", holidays2027.length);

		// 检查是否有法定节假日
		const public2024 = holidays2024.filter(h => h.holidayType === "public" || h.holidayType === "public-work");
		const public2025 = holidays2025.filter(h => h.holidayType === "public" || h.holidayType === "public-work");
		const public2026 = holidays2026.filter(h => h.holidayType === "public" || h.holidayType === "public-work");
		const public2027 = holidays2027.filter(h => h.holidayType === "public" || h.holidayType === "public-work");

		console.log("2024年法定节假日:", public2024.length, "条");
		console.log("2025年法定节假日:", public2025.length, "条");
		console.log("2026年法定节假日:", public2026.length, "条");
		console.log("2027年法定节假日:", public2027.length, "条");

		// 打印法定节假日详情
		if (public2026.length > 0) {
			console.log("2026年法定节假日详情:");
			public2026.forEach(h => {
				console.log(`  ${h.eventDate.isoDate} ${h.text} ${h.holidayType}`);
			});
		}
	});

	it("测试2: 导入2026年节假日数据", () => {
		const fixData =
			"202601010120260101" +
			"202601020120260101" +
			"202601030120260101" +
			"202601040020260101" +
			"202602141020260217" +
			"202602151120260217" +
			"202602161120260217" +
			"202602171120260217" +
			"202602181120260217" +
			"202602191120260217" +
			"202602201120260217" +
			"202602211120260217" +
			"202602221120260217" +
			"202602231120260217" +
			"202602281020260217" +
			"202604042120260405" +
			"202604052120260405" +
			"202604062120260405" +
			"202605013120260501" +
			"202605023120260501" +
			"202605033120260501" +
			"202605043120260501" +
			"202605053120260501" +
			"202605093020260501" +
			"202606194120260619" +
			"202606204120260619" +
			"202606214120260619" +
			"202609206020261001" +
			"202609255120260925" +
			"202609265120260925" +
			"202609275120260925" +
			"202610016120261001" +
			"202610026120261001" +
			"202610036120261001" +
			"202610046120261001" +
			"202610056120261001" +
			"202610066120261001" +
			"202610076120261001" +
			"202610106020261001";

		console.log("\n=== 调用 HolidayUtil.fix() ===");
		console.log("数据长度:", fixData.length);

		HolidayUtil.fix(fixData);

		console.log("fix() 调用完成");
	});

	it("测试3: 导入2026年节假日数据后，获取各年份节假日", () => {
		console.log("\n=== 导入后 ===");

		const holidays2024 = HolidayServiceTest.getFullYearHolidays(2024);
		const holidays2025 = HolidayServiceTest.getFullYearHolidays(2025);
		const holidays2026 = HolidayServiceTest.getFullYearHolidays(2026);
		const holidays2027 = HolidayServiceTest.getFullYearHolidays(2027);

		console.log("2024年节假日总数:", holidays2024.length);
		console.log("2025年节假日总数:", holidays2025.length);
		console.log("2026年节假日总数:", holidays2026.length);
		console.log("2027年节假日总数:", holidays2027.length);

		// 检查是否有法定节假日
		const public2024 = holidays2024.filter(h => h.holidayType === "public" || h.holidayType === "public-work");
		const public2025 = holidays2025.filter(h => h.holidayType === "public" || h.holidayType === "public-work");
		const public2026 = holidays2026.filter(h => h.holidayType === "public" || h.holidayType === "public-work");
		const public2027 = holidays2027.filter(h => h.holidayType === "public" || h.holidayType === "public-work");

		console.log("2024年法定节假日:", public2024.length, "条");
		console.log("2025年法定节假日:", public2025.length, "条");
		console.log("2026年法定节假日:", public2026.length, "条");
		console.log("2027年法定节假日:", public2027.length, "条");

		// 打印法定节假日详情
		console.log("\n2026年法定节假日详情:");
		public2026.forEach(h => {
			console.log(`  ${h.eventDate.isoDate} ${h.text} ${h.holidayType}`);
		});

		console.log("\n2027年法定节假日详情:");
		public2027.forEach(h => {
			console.log(`  ${h.eventDate.isoDate} ${h.text} ${h.holidayType}`);
		});
	});

	afterAll(() => {
		console.log("\n===== 测试完成 =====");
	});
});
