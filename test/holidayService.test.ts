import { HolidayUtil, Lunar, Solar, SolarUtil } from "lunar-typescript";
import { Holiday } from "../src/type/Events";
import { HOLIDAY_COLOR, HOLIDAY_EMOJI } from "../src/i18n/holidayConfig";

/**
 * 节假日服务类（测试版）
 */
class HolidayServiceTest {
	private static getPublicHolidays(year: number): Holiday[] {
		const results: Holiday[] = [];
		const holidays = HolidayUtil.getHolidays(year);

		console.log(`[getPublicHolidays] ${year}年:`, holidays.length, "条");

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

		return Array.from(seen.values()).sort((a, b) => {
			return a.eventDate.isoDate.localeCompare(b.eventDate.isoDate);
		});
	}

	static getFullYearHolidays(year: number): Holiday[] {
		const results: Holiday[] = [];

		const publicHolidays = this.getPublicHolidays(year);
		results.push(...publicHolidays);

		const solarTerms = this.getSolarTerms(year);
		results.push(...solarTerms);

		const festivals = this.getAllFestivals(year);
		results.push(...festivals);

		const final = this.deduplicate(results);

		console.log(`[HolidayService] ${year}年:`);
		console.log(`  法定节假日: ${publicHolidays.length}条`);
		console.log(`  节气: ${solarTerms.length}条`);
		console.log(`  节日: ${festivals.length}条`);
		console.log(`  去重后: ${final.length}条`);

		return final;
	}

	/**
	 * 解析用户输入的节假日数据
	 */
	static parseFixData(fixData: string, year: number): Holiday[] {
		const results: Holiday[] = [];
		const SIZE = 18;
		const NAMES = [
			"元旦节", "春节", "清明节", "劳动节",
			"端午节", "中秋节", "国庆节", "国庆中秋", "抗战胜利日"
		];

		console.log(`[parseFixData] 解析数据，长度: ${fixData.length}，年份: ${year}`);

		for (let i = 0; i + SIZE <= fixData.length; i += SIZE) {
			const segment = fixData.substring(i, i + SIZE);
			const dateStr = segment.substring(0, 8);
			const nameIndex = parseInt(segment.charAt(8), 10);
			const isWork = segment.charAt(9) === "0";
			const targetDate = segment.substring(10, 18);

			const holidayYear = parseInt(dateStr.substring(0, 4), 10);
			if (holidayYear !== year) {
				continue;
			}

			const day = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
			const target = `${targetDate.substring(0, 4)}-${targetDate.substring(4, 6)}-${targetDate.substring(6, 8)}`;
			const name = NAMES[nameIndex] || "节假日";

			const isFirstDay = day === target;
			let text: string;
			let displayType: "public" | "public-work";

			if (isFirstDay) {
				text = name;
				displayType = "public";
			} else if (isWork) {
				text = "班";
				displayType = "public-work";
			} else {
				text = "休";
				displayType = "public";
			}

			console.log(`  解析: ${day} ${name} (${nameIndex}) ${isWork ? "班" : "休"} -> ${displayType}`);

			results.push({
				id: `holi-fix-${day.replace(/-/g, "")}`,
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

		console.log(`[parseFixData] 解析完成，共 ${results.length} 条`);
		return results;
	}
}

describe("节假日获取测试", () => {
	it("测试1: 获取2025年节假日（库内置数据）", () => {
		const holidays = HolidayServiceTest.getFullYearHolidays(2025);
		expect(holidays.length).toBeGreaterThan(0);

		// 打印法定节假日
		const publicHolidays = holidays.filter(
			h => h.holidayType === "public" || h.holidayType === "public-work"
		);
		console.log("\n2025年法定节假日:");
		publicHolidays.forEach(h => {
			console.log(`  ${h.eventDate.isoDate} ${h.text} emoji=${h.emoji} color=${h.color}`);
		});
	});

	it("测试2: 导入2026年数据后获取节假日", () => {
		const fixData =
			"202601010120260101" +
			"202601020120260101" +
			"202601030120260101" +
			"202601040020260101";

		console.log("\n=== 导入2026年数据 ===");
		HolidayUtil.fix(fixData);

		const holidays = HolidayServiceTest.getFullYearHolidays(2026);

		// 打印法定节假日
		const publicHolidays = holidays.filter(
			h => h.holidayType === "public" || h.holidayType === "public-work"
		);
		console.log("\n2026年法定节假日:");
		publicHolidays.forEach(h => {
			console.log(`  ${h.eventDate.isoDate} ${h.text} emoji=${h.emoji} color=${h.color}`);
		});

		expect(publicHolidays.length).toBeGreaterThan(0);
	});

	it("测试3: 使用parseFixData解析用户数据", () => {
		const fixData =
			"202601010120260101" +
			"202601020120260101" +
			"202601030120260101" +
			"202601040020260101";

		console.log("\n=== parseFixData 测试 ===");
		const holidays = HolidayServiceTest.parseFixData(fixData, 2026);

		expect(holidays.length).toBe(4);

		holidays.forEach(h => {
			console.log(`  ${h.eventDate.isoDate} ${h.text} emoji=${h.emoji} color=${h.color}`);
		});
	});
});
