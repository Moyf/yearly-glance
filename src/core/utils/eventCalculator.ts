import { Lunar, Solar } from "lunar-typescript";
import { Birthday, CustomEvent, Holiday } from "@/src/core/interfaces/Events";
import { constructLunar, isValidLunarDate, parseDateValue } from "./dateParser";
import { getBirthdayTranslation } from "../data/birthday";
import { IsoExtend } from "./isoExtend";
import { LunarLibrary } from "./lunarLibrary";

export class EventCalculator {
	static calculateDateArr(isoDate: string, yearSelected: number, isRepeat?: boolean) {
		if (!isoDate) return [];

		const { date, year, month, day, dateType } = IsoExtend.parse(isoDate);

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

			const lunarCurrent = LunarLibrary.constructLunar(yearSelected, monthL, day);
			const lunarLast = LunarLibrary.constructLunar(yearSelected - 1, monthL, day);

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
		return holidays.map((holiday) => this.updateHolidayInfo(holiday, yearSelected));
	}

	private static updateHolidayInfo(holiday: Holiday, yearSelected: number) {
		const { id } = holiday;
		const { date, dateType } = IsoExtend.parse(holiday.eventDate.core.isoDate);
	}
}

function updateHolidayInfo(holiday: Holiday, yearSelected: number) {
	let { date } = holiday;
	const { dateType, id } = holiday;

	// 检查是否是需要更新日期的节气节日
	if (id === "holi-wblqm") {
		// 清明节
		const qingMing = getSolarTermDate(yearSelected, "清明");
		date = `${qingMing.getYear()},${qingMing.getMonth()},${qingMing.getDay()}`;
	} else if (id === "holi-wbldz") {
		// 冬至
		const dongZhi = getSolarTermDate(yearSelected, "DONG_ZHI");
		date = `${dongZhi.getYear()},${dongZhi.getMonth()},${dongZhi.getDay()}`;
	}

	// 更新dateArr
	const dateArr = calculateDateObj(date, dateType, yearSelected);

	return {
		...holiday,
		date, // 更新date字段
		dateArr,
	};
}

export function updateCustomEventsInfo(
	customEvents: CustomEvent[],
	yearSelected: number
) {
	return customEvents.map((customEvent) =>
		updateCustomEventInfo(customEvent, yearSelected)
	);
}

function updateCustomEventInfo(customEvent: CustomEvent, yearSelected: number) {
	const { date, dateType, isRepeat } = customEvent;
	const dateArr = calculateDateObj(date, dateType, yearSelected, isRepeat);

	return {
		...customEvent,
		dateArr,
	};
}

export function updateBirthdaysInfo(
	birthdays: Birthday[],
	yearSelected: number
) {
	return birthdays.map((birthday) =>
		updateBirthdayInfo(birthday, yearSelected)
	);
}

export function updateBirthdayInfo(birthday: Birthday, yearSelected: number) {
	const { date, dateType } = birthday;

	const { Ld, Sd, hasYear, year, month, day } = parseDateValue(
		date,
		dateType
	);

	const dateArr = calculateDateObj(date, dateType, yearSelected);
	// 当前时间
	const todaySolar = Solar.fromDate(new Date());

	let nextBirthday;
	if (dateType === "SOLAR") {
		// 计算下一次阳历生日
		const thisBirthday = Solar.fromYmd(todaySolar.getYear(), month, day);
		if (todaySolar.isBefore(thisBirthday)) {
			// 今年的生日还没到
			nextBirthday = thisBirthday.toString();
		} else {
			// 今年的生日已过，计算明年的生日
			nextBirthday = Solar.fromYmd(
				todaySolar.getYear() + 1,
				month,
				day
			).toString();
		}
	} else if (dateType === "LUNAR") {
		// 计算当前阴历年对应的生日
		let thisBirthday;
		if (isValidLunarDate(todaySolar.getYear(), Math.abs(month), day)) {
			thisBirthday = Lunar.fromYmd(
				todaySolar.getYear(),
				Math.abs(month),
				day
			).getSolar();
		} else {
			thisBirthday = Lunar.fromYmd(
				todaySolar.getYear(),
				Math.abs(month),
				day - 1
			).getSolar();
		}

		// 计算下一个阴历年对应的生日
		let nextYearBirthday;
		if (isValidLunarDate(todaySolar.getYear() + 1, Math.abs(month), day)) {
			nextYearBirthday = Lunar.fromYmd(
				todaySolar.getYear() + 1,
				Math.abs(month),
				day
			).getSolar();
		} else {
			nextYearBirthday = Lunar.fromYmd(
				todaySolar.getYear() + 1,
				Math.abs(month),
				day - 1
			).getSolar();
		}

		// 判断应该使用哪一个
		if (todaySolar.isBefore(thisBirthday)) {
			// 如果今年的农历生日还没到，使用今年的
			nextBirthday = thisBirthday.toString();
		} else {
			// 如果今年的农历生日已过，使用明年的
			nextBirthday = nextYearBirthday.toString();
		}
	}

	let age;
	let animal;
	let zodiac;
	let dateArrSolar;

	if (hasYear) {
		// 当前时间下生日的日期(无关yearSelected)
		if (dateType === "SOLAR") {
			dateArrSolar = Solar.fromYmd(todaySolar.getYear(), month, day);
		} else if (dateType === "LUNAR") {
			if (isValidLunarDate(todaySolar.getYear(), Math.abs(month), day)) {
				dateArrSolar = Lunar.fromYmd(
					todaySolar.getYear(),
					Math.abs(month),
					day
				).getSolar();
			} else {
				dateArrSolar = Lunar.fromYmd(
					todaySolar.getYear(),
					Math.abs(month),
					day - 1
				).getSolar();
			}
		}
		// 当今天还未过生日时，年龄为当前年份减去出生年份再减1
		age = todaySolar.isBefore(dateArrSolar)
			? todaySolar.getYear() - year! - 1
			: todaySolar.getYear() - year!;

		// 获取干支纪年（新年以正月初一起算）
		const ganzhi = Ld!.getYearInGanZhi();

		// 使用新的翻译函数，简化代码
		animal =
			getBirthdayTranslation(ganzhi, "ganzhi") +
			getBirthdayTranslation(Ld!.getYearShengXiao(), "animal");
		zodiac = getBirthdayTranslation(Sd!.getXingZuo(), "zodiac");
	} else {
		age = null;
		animal = null;
		zodiac = getBirthdayTranslation(
			Solar.fromYmd(yearSelected, month, day).getXingZuo(),
			"zodiac"
		);
	}

	return {
		...birthday,
		dateArr,
		nextBirthday,
		...(age !== undefined && { age }),
		...(animal !== undefined && { animal }),
		...(zodiac !== undefined && { zodiac }),
	};
}
