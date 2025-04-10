import {
	Lunar,
	LunarMonth,
	LunarYear,
	Solar,
	SolarUtil,
} from "lunar-typescript";

export const LunarMonthMap = [
	"正",
	"二",
	"三",
	"四",
	"五",
	"六",
	"七",
	"八",
	"九",
	"十",
	"冬",
	"腊",
];

export const LunarDayMap = [
	"初一",
	"初二",
	"初三",
	"初四",
	"初五",
	"初六",
	"初七",
	"初八",
	"初九",
	"初十",
	"十一",
	"十二",
	"十三",
	"十四",
	"十五",
	"十六",
	"十七",
	"十八",
	"十九",
	"二十",
	"廿一",
	"廿二",
	"廿三",
	"廿四",
	"廿五",
	"廿六",
	"廿七",
	"廿八",
	"廿九",
	"三十",
];

/**
 * 依据data.json中dateValue和dateType解析出日期对象
 * @param dateValue 日期字符串
 * 对公历类型，可能的格式为`2025,01,01`或`01,01`
 * 对于农历类型，可能的格式为`2025,-06,01`(二〇二五年闰六月初一)或`02,01`(二月初一)
 * @param dateType 日期类型 SOLAR(公历) 或 LUNAR(农历)
 * @returns
 * hasYear: 是否包含年份
 */
export function parseDateValue(dateValue: string, dateType: "SOLAR" | "LUNAR") {
	let year: number | undefined;
	let month: number;
	let day: number;
	let hasYear: boolean = true;

	const parts = dateValue.split(",");
	if (parts.length === 2) {
		// m,d
		hasYear = false;
		month = parseInt(parts[0], 10);
		day = parseInt(parts[1], 10);

		return {
			hasYear,
			year,
			month,
			day,
			...parseDateMD(month, day, dateType),
		};
	} else {
		// y,m,d
		year = parseInt(parts[0], 10);
		month = parseInt(parts[1], 10);
		day = parseInt(parts[2], 10);

		return {
			hasYear,
			year,
			month,
			day,
			...parseDateYMD(year, month, day, dateType),
		};
	}
}

/**
 * YMD格式date解析
 * @param dateYear 年份
 * @param dateMonth 月份
 * @param dateDay 日
 * @param dateType 日期类型 SOLAR(公历) 或 LUNAR(农历)
 * @returns
 * Ld: 农历日期对象, 或公历转换的农历
 * Sd: 公历日期对象，或农历转换的公历
 * LMonthsInYear: dateYear年份的农历月对象数组(LunarMonth[])，包含了月份以及天数信息(number)
 * SDaysInMonth: dateMonth月份的天数(number)
 * YearName: 农历则为年份中文名称，公历则为年份数字
 * MonthName: 农历则为月份中文名称，公历则为月份数字
 * DayName: 农历则为日期中文名称，公历则为日期数字
 */
export function parseDateYMD(
	dateYear: number,
	dateMonth: number,
	dateDay: number,
	dateType: "SOLAR" | "LUNAR"
): {
	Ld: Lunar;
	Sd: Solar;
	LMonthsInYear: LunarMonth[];
	SDaysInMonth: number;
	yearName: string | undefined;
	monthName: string;
	dayName: string;
} {
	if (dateType === "LUNAR") {
		const Ld = Lunar.fromYmd(dateYear, dateMonth, dateDay);
		const Sd = Ld.getSolar();
		const lunarYear = LunarYear.fromYear(dateYear);
		const LMonthsInYear = lunarYear.getMonthsInYear();
		const SDaysInMonth = SolarUtil.getDaysOfMonth(
			Sd.getYear(),
			Sd.getMonth()
		);
		const yearName = Ld.getYearInChinese();
		const monthName = Ld.getMonthInChinese();
		const dayName = Ld.getDayInChinese();

		return {
			Ld,
			Sd,
			LMonthsInYear,
			SDaysInMonth,
			yearName,
			monthName,
			dayName,
		};
	} else {
		const Sd = Solar.fromYmd(dateYear, dateMonth, dateDay);
		const Ld = Sd.getLunar();
		const lunarYear = LunarYear.fromYear(Ld.getYear());
		const LMonthsInYear = lunarYear.getMonthsInYear();
		const SDaysInMonth = SolarUtil.getDaysOfMonth(
			Sd.getYear(),
			Sd.getMonth()
		);
		const yearName = Sd.getYear().toString();
		const monthName = Sd.getMonth().toString();
		const dayName = Sd.getDay().toString();

		return {
			Ld,
			Sd,
			LMonthsInYear,
			SDaysInMonth,
			yearName,
			monthName,
			dayName,
		};
	}
}

/**
 * MD格式date解析
 * @param dateMonth 月份
 * @param dateDay 日
 * @param dateType 日期类型 SOLAR(公历) 或 LUNAR(农历)
 * @returns
 * MonthName: 农历则为月份中文名称，公历则为月份数字
 * DayName: 农历则为日期中文名称，公历则为日期数字
 */
export function parseDateMD(
	dateMonth: number,
	dateDay: number,
	dateType: "SOLAR" | "LUNAR"
): {
	Ld: Lunar | undefined;
	Sd: Solar | undefined;
	LMonthsInYear: number[];
	SDaysInMonth: number;
	yearName: string | undefined;
	monthName: string;
	dayName: string;
} {
	const Ld = undefined;
	const Sd = undefined;
	const yearName = undefined;

	const LMonthsInYear = Array.from({ length: 12 }, (_, i) => {
		return i + 1;
	}).filter((month) => month <= 12);

	const SDaysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
		dateMonth - 1
	];

	if (dateType === "LUNAR") {
		let monthName = LunarMonthMap[Math.abs(dateMonth) - 1];
		if (dateMonth < 0) {
			monthName = "闰" + monthName;
		}

		const dayName = LunarDayMap[dateDay - 1];
		return {
			Ld,
			Sd,
			LMonthsInYear,
			SDaysInMonth,
			yearName,
			monthName,
			dayName,
		};
	} else {
		const monthName = dateMonth.toString();
		const dayName = dateDay.toString();
		return {
			Ld,
			Sd,
			LMonthsInYear,
			SDaysInMonth,
			yearName,
			monthName,
			dayName,
		};
	}
}

/**
 * 验证农历日期是否有效
 * @param year 年份
 * @param month 月份
 * @param day 日
 * @returns 是否有效
 */
export function isValidLunarDate(
	year: number,
	month: number,
	day: number
): boolean {
	try {
		Lunar.fromYmd(year, month, day);
		return true;
	} catch (error) {
		return false;
	}
}

// (y-m-d) -> (y,m,d)
export function parseExtendedISO(dateValue: string) {
	// 如果输入为空或undefined，返回空字符串
	if (!dateValue || dateValue.trim() === "") {
		return "";
	}

	// 确保输入格式正确
	if (!dateValue.includes("-")) {
		return dateValue; // 如果没有分隔符，直接返回原值
	}

	const parts = dateValue.split("-");
	let year, month, day, dateStr;

	// 格式验证：确保至少有月和日
	if (parts.length < 2) {
		return dateValue; // 如果格式不对，直接返回原值
	}

	try {
		if (parts.length === 2) {
			[month, day] = parts;
			// 确保month和day都存在且有效
			if (!month || !day) {
				return dateValue;
			}

			// 检查闰月标记 "!"
			if (day && day.endsWith && day.endsWith("!")) {
				month = (-parseInt(month, 10)).toString();
				day = day.replace("!", ""); // 移除闰月标记
			}
			dateStr = `${month},${day}`;
		} else {
			[year, month, day] = parts;
			// 确保year、month和day都存在且有效
			if (!year || !month || !day) {
				return dateValue;
			}

			// 检查闰月标记 "!"
			if (day && day.endsWith && day.endsWith("!")) {
				month = (-parseInt(month, 10)).toString();
				day = day.replace("!", ""); // 移除闰月标记
			}
			dateStr = `${year},${month},${day}`;
		}
		return dateStr;
	} catch (error) {
		console.error("Error parsing date:", error);
		return dateValue; // 出错时返回原始输入
	}
}

// (y,m,d) -> (y-m-d)
export function formatToExtendedISO(dateValue: string) {
	const parts = dateValue.split(",");
	let year, month, day, dateStr;

	if (parts.length === 2) {
		// 无年份，如 "6,1" 或 "-6,1"（闰六月）
		[month, day] = parts.map((part) => part.trim());
		const monthNum = parseInt(month, 10);

		if (monthNum < 0) {
			// 闰月情况
			dateStr = `${Math.abs(monthNum)}-${day}!`;
		} else {
			dateStr = `${month}-${day}`;
		}
	} else {
		// 有年份，如 "2025,6,1" 或 "2025,-6,1"
		[year, month, day] = parts.map((part) => part.trim());
		const monthNum = parseInt(month, 10);

		if (monthNum < 0) {
			// 闰月情况
			dateStr = `${year}-${Math.abs(monthNum)}-${day}!`;
		} else {
			dateStr = `${year}-${month}-${day}`;
		}
	}

	return dateStr;
}
