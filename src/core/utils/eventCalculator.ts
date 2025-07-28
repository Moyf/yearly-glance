import { Lunar, Solar } from "lunar-typescript";
import { Birthday, CustomEvent, Holiday } from "@/src/core/interfaces/Events";
import { getBirthdayTranslation } from "../../i18n/birthday";
import { IsoUtils } from "./isoUtils";
import { LunarLibrary } from "./lunarLibrary";
import { SpecialHoliday } from "./specialHoliday";
import { CalendarType } from "../interfaces/Date";

export class EventCalculator {
	/**
	 * 计算当前选择年份下事件日期数组
	 * @param isoDate ISO日期字符串
	 * @param calendar 日期类型
	 * @param yearSelected 当前选择的年份
	 * @param isRepeat 是否为重复事件，针对customEvent
	 * @returns 日期数组
	 */
	static calculateDateArr(
		isoDate: string,
		calendar: CalendarType,
		yearSelected: number,
		isRepeat?: boolean | undefined
	) {
		if (!isoDate) return [];

		const { year, month, day } = IsoUtils.parse(isoDate, calendar);

		// 自定义事件一般ymd齐全，在事件不重复，且有年份的情况下，只需要计算出公历日期
		if (
			(isRepeat === undefined || isRepeat === false) &&
			year !== undefined
		) {
			if (calendar === "GREGORIAN") {
				return [Solar.fromYmd(year, month, day).toString()];
			} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
				const monthL = calendar === "LUNAR_LEAP" ? -month : month;
				return [Lunar.fromYmd(year, monthL, day).getSolar().toString()];
			} else {
				return [];
			}
		}

		// 对于节日和生日，均忽略date本身的year，而使用yearSelected
		if (calendar === "GREGORIAN") {
			return [Solar.fromYmd(yearSelected, month, day).toString()];
		} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
			const monthL = calendar === "LUNAR_LEAP" ? -month : month;
			const dateArr: string[] = [];

			const lunarCurrent = LunarLibrary.constructLunar(
				yearSelected,
				monthL,
				day
			);
			const lunarLast = LunarLibrary.constructLunar(
				yearSelected - 1,
				monthL,
				day
			);

			if (lunarCurrent.getSolar().getYear() === yearSelected) {
				dateArr.push(lunarCurrent.getSolar().toString());
			}

			if (lunarLast.getSolar().getYear() === yearSelected) {
				dateArr.push(lunarLast.getSolar().toString());
			}

			return dateArr;
		} else {
			return [];
		}
	}

	/**
	 * 更新节假日信息
	 * @param holidays 节假日数组
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的节假日数组
	 */
	static updateHolidaysInfo(holidays: Holiday[], yearSelected: number) {
		return holidays.map((holiday) =>
			this.updateHolidayInfo(holiday, yearSelected)
		);
	}

	/**
	 * 更新单个节假日信息
	 * @param holiday 节假日对象
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的节假日对象
	 */
	static updateHolidayInfo(holiday: Holiday, yearSelected: number) {
		const { id } = holiday;
		let isoDate: string = holiday.eventDate.isoDate;
		const calendar = holiday.eventDate.calendar;

		// TODO: 完善节气节日的处理
		if (id === "holi-wblqm") {
			// 清明节
			const qingMing = SpecialHoliday.solarTerm(yearSelected, "清明");
			isoDate = qingMing;
		} else if (id === "holi-wbldz") {
			// 冬至
			const dongZhi = SpecialHoliday.solarTerm(yearSelected, "冬至");
			isoDate = dongZhi;
		}

		const dateArr = this.calculateDateArr(isoDate, calendar, yearSelected);

		return {
			...holiday,
			dateArr,
			eventDate: {
				...holiday.eventDate,
				isoDate,
			},
		};
	}

	/**
	 * 更新自定义事件信息
	 * @param customEvents 自定义事件数组
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的自定义事件数组
	 */
	static updateCustomEventsInfo(
		customEvents: CustomEvent[],
		yearSelected: number
	) {
		return customEvents.map((customEvent) =>
			this.updateCustomEventInfo(customEvent, yearSelected)
		);
	}

	/**
	 * 更新单个自定义事件信息
	 * @param customEvent 自定义事件对象
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的自定义事件对象
	 */
	static updateCustomEventInfo(
		customEvent: CustomEvent,
		yearSelected: number
	) {
		const isoDate = customEvent.eventDate.isoDate;
		const calendar = customEvent.eventDate.calendar;
		const dateArr = this.calculateDateArr(
			isoDate,
			calendar,
			yearSelected,
			customEvent.isRepeat
		);

		return {
			...customEvent,
			dateArr,
		};
	}

	/**
	 * 更新所有生日信息
	 * @param birthdays 生日数组
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的生日数组
	 */
	static updateBirthdaysInfo(birthdays: Birthday[], yearSelected: number) {
		return birthdays.map((birthday) =>
			this.updateBirthdayInfo(birthday, yearSelected)
		);
	}

	/**
	 * 更新单个生日信息
	 * @param birthday 生日对象
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的生日对象
	 */
	static updateBirthdayInfo(birthday: Birthday, yearSelected: number) {
		const isoDate = birthday.eventDate.isoDate;
		const calendar = birthday.eventDate.calendar;
		const dateArr = this.calculateDateArr(isoDate, calendar, yearSelected);

		const { year, month, day } = IsoUtils.parse(isoDate, calendar);
		const todaySolar = Solar.fromDate(new Date());

		// 计算下一次生日，
		let nextBirthday, currentYearBirthday, nextYearBirthday;
		// 计算星座，生肖，
		let zodiac, animal;
		if (calendar === "GREGORIAN") {
			currentYearBirthday = Solar.fromYmd(
				todaySolar.getYear(),
				month,
				day
			);
			nextYearBirthday = Solar.fromYmd(
				todaySolar.getYear() + 1,
				month,
				day
			);
			if (todaySolar.isBefore(currentYearBirthday)) {
				// 今年的生日还没到
				nextBirthday = currentYearBirthday.toString();
			} else {
				// 今年的生日已过，计算明年的生日
				nextBirthday = nextYearBirthday.toString();
			}

			if (year !== undefined) {
				const xingzuo = Solar.fromYmd(year, month, day).getXingZuo();
				zodiac = getBirthdayTranslation(xingzuo, "zodiac");

				const ganzhi = Solar.fromYmd(year, month, day)
					.getLunar()
					.getYearInGanZhi();
				const shengxiao = Solar.fromYmd(year, month, day)
					.getLunar()
					.getYearShengXiao();
				// 获取生肖
				animal =
					getBirthdayTranslation(ganzhi, "ganzhi") +
					getBirthdayTranslation(shengxiao, "animal");
			} else {
				const xingzuo = Solar.fromYmd(
					yearSelected,
					month,
					day
				).getXingZuo();
				zodiac = getBirthdayTranslation(xingzuo, "zodiac");
				animal = null;
			}
		} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
			currentYearBirthday = LunarLibrary.constructLunar(
				yearSelected,
				month,
				day
			).getSolar();
			nextYearBirthday = LunarLibrary.constructLunar(
				yearSelected + 1,
				month,
				day
			).getSolar();

			// 判断应该使用哪一个
			if (todaySolar.isBefore(currentYearBirthday)) {
				// 如果今年的农历生日还没到，使用今年的
				nextBirthday = currentYearBirthday.toString();
			} else {
				// 如果今年的农历生日已过，使用明年的
				nextBirthday = nextYearBirthday.toString();
			}

			if (year !== undefined) {
				const xingzuo = Lunar.fromYmd(year, month, day)
					.getSolar()
					.getXingZuo();
				zodiac = getBirthdayTranslation(xingzuo, "zodiac");

				const ganzhi = Lunar.fromYmd(
					year,
					month,
					day
				).getYearInGanZhi();
				const shengxiao = Lunar.fromYmd(
					year,
					month,
					day
				).getYearShengXiao();
				// 获取生肖
				animal =
					getBirthdayTranslation(ganzhi, "ganzhi") +
					getBirthdayTranslation(shengxiao, "animal");
			} else {
				// 对于农历生日，如果没有年份，无法计算星座，生肖和干支
				zodiac = null;
				animal = null;
			}
		}

		// 计算年龄
		let age;
		if (year !== undefined) {
			// 当今天还未过生日时，年龄为当前年份减去出生年份再减1
			age = todaySolar.isBefore(currentYearBirthday)
				? todaySolar.getYear() - year - 1
				: todaySolar.getYear() - year;
		} else {
			age = null;
		}

		return {
			...birthday,
			dateArr,
			nextBirthday,
			age,
			animal,
			zodiac,
		};
	}
}
