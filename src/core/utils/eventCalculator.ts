import { Lunar, Solar } from "lunar-typescript";
import { Birthday, CustomEvent, Holiday } from "../interfaces/Events";
import { isValidLunarDate, parseDateValue } from "./dateParser";

// 计算当前选择年份下时间的的公历日期
export function calculateDateObj(
	date: string,
	dateType: "SOLAR" | "LUNAR",
	yearSelected: number,
	isRepeat?: boolean
): string {
	if (!date) {
		return "";
	}

	const { hasYear, year, month, day } = parseDateValue(date, dateType);

	const monthAbs = Math.abs(month);

	// 自定义事件一般ymd齐全，在事件不重复的情况下，使用date本身的year
	if (isRepeat === false && hasYear) {
		if (dateType === "SOLAR") {
			const solar = Solar.fromYmd(year, month, day);
			return solar.toString();
		} else if (dateType === "LUNAR") {
			const lunar = Lunar.fromYmd(year, monthAbs, day);
			return lunar.getSolar().toString();
		} else {
			return "";
		}
	}

	// 对于节日和生日，均忽略date本身的year，而使用yearSelected
	if (dateType === "SOLAR") {
		const solar = Solar.fromYmd(yearSelected, month, day);
		return solar.toString();
	} else if (dateType === "LUNAR") {
		const lunar = Lunar.fromYmd(yearSelected, monthAbs, day);
		return lunar.getSolar().toString();
	} else {
		return "";
	}
}

export function updateHolidaysInfo(holidays: Holiday[], yearSelected: number) {
	return holidays.map((holiday) => updateHolidayInfo(holiday, yearSelected));
}

function updateHolidayInfo(holiday: Holiday, yearSelected: number) {
	const { date, dateType } = holiday;
	const dateObj = calculateDateObj(date, dateType, yearSelected);

	return {
		...holiday,
		dateObj,
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
	const dateObj = calculateDateObj(date, dateType, yearSelected, isRepeat);

	return {
		...customEvent,
		dateObj,
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

	const { Ld, Sd, hasYear, year, month, monthAbs, day } = parseDateValue(
		date,
		dateType
	);

	const dateObj = calculateDateObj(date, dateType, yearSelected);
	// 当前时间
	const todaySolar = Solar.fromDate(new Date());

	let nextBirthday;
	if (dateType === "SOLAR") {
		nextBirthday = Solar.fromYmd(
			todaySolar.getYear() + 1,
			month,
			day
		).toString();
	} else if (dateType === "LUNAR") {
		// 计算当前或下一次农历生日不考虑闰月的情况，以及有时候没有农历三十
		if (isValidLunarDate(todaySolar.getYear() + 1, monthAbs, day)) {
			nextBirthday = Lunar.fromYmd(
				todaySolar.getYear() + 1,
				monthAbs,
				day
			)
				.getSolar()
				.toString();
		} else {
			nextBirthday = Lunar.fromYmd(
				todaySolar.getYear() + 1,
				monthAbs,
				day - 1
			)
				.getSolar()
				.toString();
		}
	}

	let age;
	let animal;
	let zodiac;
	let dateObjSolar;

	if (hasYear) {
		// 当前时间下生日的日期(无关yearSelected)
		if (dateType === "SOLAR") {
			dateObjSolar = Solar.fromYmd(todaySolar.getYear(), month, day);
		} else if (dateType === "LUNAR") {
			if (isValidLunarDate(todaySolar.getYear(), monthAbs, day)) {
				dateObjSolar = Lunar.fromYmd(
					todaySolar.getYear(),
					monthAbs,
					day
				).getSolar();
			} else {
				dateObjSolar = Lunar.fromYmd(
					todaySolar.getYear(),
					monthAbs,
					day - 1
				).getSolar();
			}
		}
		// 当今天还未过生日时，年龄为当前年份减去出生年份再减1
		age = todaySolar.isBefore(dateObjSolar)
			? todaySolar.getYear() - year - 1
			: todaySolar.getYear() - year;

		animal = Ld.getYearShengXiao();
		zodiac = Sd.getXingZuo();
	} else {
		age = "_需补全年份数据_";
		animal = "_需补全年份数据_";
		zodiac = "_需补全年份数据_";
	}

	return {
		...birthday,
		dateObj,
		nextBirthday,
		...(age !== undefined && { age }),
		...(animal !== undefined && { animal }),
		...(zodiac !== undefined && { zodiac }),
	};
}
