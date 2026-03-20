import { HolidayUtil, Lunar, Solar, SolarUtil } from "lunar-typescript";
import { Holiday, HolidayDisplayType } from "@/src/type/Events";
import { HOLIDAY_COLOR, HOLIDAY_EMOJI } from "./holidayConfig";

/**
 * 节假日服务类
 * 负责从 lunar-typescript 库获取全年节假日信息
 * 包括：法定节假日、节气、公历节日、农历节日
 */
export class HolidayService {
	/**
	 * 获取指定年份的全部节假日信息
	 * @param year 年份
	 * @returns 节假日数组
	 */
		static getFullYearHolidays(year: number): Holiday[] {
		const results: Holiday[] = [];

		const publicHolidays = this.getPublicHolidays(year);
		results.push(...publicHolidays);

		const solarTerms = this.getSolarTerms(year);
		results.push(...solarTerms);

		const festivals = this.getAllFestivals(year);
		results.push(...festivals);

		const final = this.deduplicate(results);
		
		return final;
	}

	/**
	 * 获取法定节假日
	 * 来源：HolidayUtil.getHolidays(year)
	 * 包含：元旦、春节、清明、劳动节、端午、中秋、国庆等
	 * 自动包含调休信息
	 * @param year 年份
	 * @returns 法定节假日数组
	 */
	private static getPublicHolidays(year: number): Holiday[] {
		const results: Holiday[] = [];
		const holidays = HolidayUtil.getHolidays(year);

		for (const h of holidays) {
			const day = h.getDay();
			const name = h.getName();
			const target = h.getTarget();
			const work = h.isWork();

			const isFirstDay = day === target;

			let text: string;
			let displayType: HolidayDisplayType;

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

			const [y, m, d] = day.split("-").map(Number);
			Solar.fromYmd(y, m, d);

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

	/**
	 * 获取24节气
	 * 来源：Lunar.getJieQiTable()
	 * 节气是根据太阳运行规律计算的，传统中国历法
	 * @param year 年份
	 * @returns 节气数组
	 */
	private static getSolarTerms(year: number): Holiday[] {
		const results: Holiday[] = [];

		const lunar = Lunar.fromYmd(year, 6, 15);
		const jieQiTable = lunar.getJieQiTable();

		for (const [name, solar] of Object.entries(jieQiTable)) {
			// 节气名称是纯中文，不包含常量名（如 DA_XUE）
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

	/**
	 * 遍历全年获取所有节日
	 * 包括：
	 * - 公历节日：情人节、愚人节、母亲节、万圣节、圣诞节等
	 * - 公历其他节日/纪念日：建党节，建军节、教师节、护士节等
	 * - 农历节日：春节、元宵、端午、中秋等
	 * - 农历其他节日：寒食、春社，秋社等
	 * @param year 年份
	 * @returns 所有节日数组
	 */
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

	/**
	 * 创建节日 Holiday 对象
	 * @param solarDay 公历日期
	 * @param name 节日名称
	 * @returns Holiday 对象
	 */
	private static createFestivalHoliday(
		solarDay: string,
		name: string
	): Holiday {
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

	/**
	 * 去重处理
	 * 规则：同一天 + 前两字相同 → 只保留一个
	 * 优先级：法定节假日 > 节日
	 * @param holidays 节假日数组
	 * @returns 去重后的节假日数组
	 */
	private static deduplicate(holidays: Holiday[]): Holiday[] {
		const seen = new Map<string, Holiday>();

		for (const h of holidays) {
			const key = `${h.eventDate.isoDate}-${h.text.substring(0, 2)}`;

			if (!seen.has(key)) {
				seen.set(key, h);
			}
			// 法定节假日优先级最高，替换其他类型
			else if (h.holidayType === "public" || h.holidayType === "public-work") {
				seen.set(key, h);
			}
		}

		return Array.from(seen.values()).sort((a, b) => {
			return a.eventDate.isoDate.localeCompare(b.eventDate.isoDate);
		});
	}
}
