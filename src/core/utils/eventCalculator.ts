import { Lunar, Solar } from "lunar-typescript";
import { Birthday, CustomEvent, Holiday } from "@/src/core/interfaces/Events";
import { getBirthdayTranslation } from "../../i18n/birthday";
import { IsoExtend } from "./isoExtend";
import { LunarLibrary } from "./lunarLibrary";
import { SpecialHoliday } from "./specialHoliday";

export class EventCalculator {
	static calculateDateArr(
		isoDate: string,
		yearSelected: number,
		isRepeat?: boolean
	) {
		if (!isoDate) return [];

		const { year, month, day, dateType } = IsoExtend.parse(isoDate);

		// 自定义事件一般ymd齐全，在事件不重复，且有年份的情况下，只需要计算出公历日期
		if (isRepeat !== true && year !== undefined) {
			if (dateType === "GREGORIAN") {
				return [Solar.fromYmd(year, month, day).toString()];
			} else if (dateType === "LUNAR" || dateType === "LUNAR_LEAP") {
				const monthL = dateType === "LUNAR_LEAP" ? -month : month;
				return [Lunar.fromYmd(year, monthL, day).getSolar().toString()];
			} else {
				return [];
			}
		}

		// 对于节日和生日，均忽略date本身的year，而使用yearSelected
		if (dateType === "GREGORIAN") {
			return [Solar.fromYmd(yearSelected, month, day).toString()];
		} else if (dateType === "LUNAR" || dateType === "LUNAR_LEAP") {
			const monthL = dateType === "LUNAR_LEAP" ? -month : month;
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

	static updateHolidaysInfo(holidays: Holiday[], yearSelected: number) {
		return holidays.map((holiday) =>
			this.updateHolidayInfo(holiday, yearSelected)
		);
	}

	static updateHolidayInfo(holiday: Holiday, yearSelected: number) {
		const { id } = holiday;
		let isoDate: string = holiday.eventDate.core.isoDate;

		// TODO: 完善节气节日的处理
		if (id === "holi-wblqm") {
			// 清明节
			const qingMing = SpecialHoliday.solarTerm(yearSelected, "清明");
			isoDate = IsoExtend.create(qingMing, "GREGORIAN");
		} else if (id === "holi-wbldz") {
			// 冬至
			const dongZhi = SpecialHoliday.solarTerm(yearSelected, "冬至");
			isoDate = IsoExtend.create(dongZhi, "GREGORIAN");
		}

		const dateArr = this.calculateDateArr(isoDate, yearSelected);

		return {
			...holiday,
			dateArr,
			eventDate: {
				...holiday.eventDate,
				core: {
					...holiday.eventDate.core,
					isoDate,
				},
			},
		};
	}

	static updateCustomEventsInfo(
		customEvents: CustomEvent[],
		yearSelected: number
	) {
		return customEvents.map((customEvent) =>
			this.updateCustomEventInfo(customEvent, yearSelected)
		);
	}

	static updateCustomEventInfo(
		customEvent: CustomEvent,
		yearSelected: number
	) {
		const isoDate = customEvent.eventDate.core.isoDate;
		const dateArr = this.calculateDateArr(isoDate, yearSelected);

		return {
			...customEvent,
			dateArr,
		};
	}

	static updateBirthdaysInfo(birthdays: Birthday[], yearSelected: number) {
		return birthdays.map((birthday) =>
			this.updateBirthdayInfo(birthday, yearSelected)
		);
	}

	static updateBirthdayInfo(birthday: Birthday, yearSelected: number) {
		const isoDate = birthday.eventDate.core.isoDate;
		const dateArr = this.calculateDateArr(isoDate, yearSelected);

		const { year, month, day, dateType } = IsoExtend.parse(isoDate);
		const todaySolar = Solar.fromDate(new Date());

		// 计算下一次生日

		let nextBirthday, currentYearBirthday, nextYearBirthday;
		if (dateType === "GREGORIAN") {
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
		} else if (dateType === "LUNAR" || dateType === "LUNAR_LEAP") {
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
		}

		// 计算年龄，生肖，星座
		let age;
		let animal;
		let zodiac;

		if (year !== undefined) {
			// 当今天还未过生日时，年龄为当前年份减去出生年份再减1
			age = todaySolar.isBefore(currentYearBirthday)
				? todaySolar.getYear() - year - 1
				: todaySolar.getYear() - year;

			// 获取干支纪年（新年以正月初一起算）
			const ganzhi = Lunar.fromYmd(year, month, day).getYearInGanZhi();
			const shengxiao = Lunar.fromYmd(
				year,
				month,
				day
			).getYearShengXiao();
			const xingzuo = Solar.fromYmd(year, month, day).getXingZuo();

			// 获取生肖
			animal =
				getBirthdayTranslation(ganzhi, "ganzhi") +
				getBirthdayTranslation(shengxiao, "animal");
			zodiac = getBirthdayTranslation(xingzuo, "zodiac");
		} else {
			const xingzuo = Solar.fromYmd(
				yearSelected,
				month,
				day
			).getXingZuo();

			age = null;
			animal = null;
			zodiac = getBirthdayTranslation(xingzuo, "zodiac");
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
