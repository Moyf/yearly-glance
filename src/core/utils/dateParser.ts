import { Lunar, Solar } from "lunar-typescript";

export const getMonthOptions = (type: "SOLAR" | "LUNAR") => {
	const options = Array.from({ length: 12 }, (_, i) => i + 1).map(
		(month) => ({
			value: month,
			label: displayDateValue(month, type, "month"),
		})
	);
	return options;
};

export const getDayOptions = (type: "SOLAR" | "LUNAR", month: number) => {
	if (type === "SOLAR") {
		// 公历月份对应的天数
		const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
			month - 1
		];
		const options = Array.from(
			{ length: daysInMonth },
			(_, i) => i + 1
		).map((day) => ({
			value: day,
			label: displayDateValue(day, type, "day"),
		}));
		return options;
	} else {
		const options = Array.from({ length: 30 }, (_, i) => i + 1).map(
			(day) => ({
				value: day,
				label: displayDateValue(day, type, "day"),
			})
		);
		return options;
	}
};

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
	yearName: string | undefined;
	monthName: string;
	dayName: string;
} {
	if (dateType === "LUNAR") {
		const Ld = Lunar.fromYmd(dateYear, dateMonth, dateDay);
		const Sd = Ld.getSolar();
		const yearName = Ld.getYearInChinese();
		const monthName = Ld.getMonthInChinese();
		const dayName = Ld.getDayInChinese();

		return {
			Ld,
			Sd,
			yearName,
			monthName,
			dayName,
		};
	} else {
		const Sd = Solar.fromYmd(dateYear, dateMonth, dateDay);
		const Ld = Sd.getLunar();

		const yearName = Sd.getYear().toString();
		const monthName = Sd.getMonth().toString();
		const dayName = Sd.getDay().toString();

		return {
			Ld,
			Sd,
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
	yearName: string | undefined;
	monthName: string;
	dayName: string;
} {
	const Ld = undefined;
	const Sd = undefined;
	const yearName = undefined;

	const monthName = displayDateValue(dateMonth, dateType, "month");
	const dayName = displayDateValue(dateDay, dateType, "day");

	return {
		Ld,
		Sd,
		yearName,
		monthName,
		dayName,
	};
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

/**
 * 构造有效的农历日期Lunar对象
 * @param year 年份
 * @param month 月份
 * @param day 日
 * @returns Lunar对象
 */
export function constructLunar(
	year: number,
	month: number,
	day: number
): Lunar {
	if (month < 0) {
		// 农历闰月情况
		if (isValidLunarDate(year, month, day)) {
			// 构造正常，直接返回
			return Lunar.fromYmd(year, month, day);
		} else if (isValidLunarDate(year, Math.abs(month), day)) {
			// 如果因为当前年份没有该农历闰月，导致构造失败，则使用正常月份
			return Lunar.fromYmd(year, Math.abs(month), day);
		} else {
			// 其他情况是当前月份没有该农历日，一般出现在该月份没有三十，则使用前一天
			return Lunar.fromYmd(year, month, day - 1);
		}
	} else {
		// 农历正常月份情况
		if (isValidLunarDate(year, month, day)) {
			return Lunar.fromYmd(year, month, day);
		} else {
			// 其他情况是当前月份没有该农历日，一般出现在该月份没有三十，则使用前一天
			return Lunar.fromYmd(year, month, day - 1);
		}
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

// (y,m,d) -> (y年m月d日)
export function displayDate(dateValue: string, dateType: "SOLAR" | "LUNAR") {
	const { hasYear, yearName, monthName, dayName } = parseDateValue(
		dateValue,
		dateType
	);

	let displayDate = "";

	if (hasYear) {
		if (dateType === "LUNAR") {
			displayDate = `${yearName}年${monthName}月${dayName}`;
		} else {
			displayDate = `${yearName}年${monthName}月${dayName}日`;
		}
	} else {
		if (dateType === "LUNAR") {
			displayDate = `${monthName}月${dayName}`;
		} else {
			displayDate = `${monthName}月${dayName}日`;
		}
	}

	return displayDate;
}

export function displayDateValue(
	value: number,
	dateType: "SOLAR" | "LUNAR",
	type: "year" | "month" | "day"
): string {
	const LunarMonthMap = [
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

	const LunarDayMap = [
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

	if (dateType === "SOLAR") {
		if (type === "year") {
			return value.toString().padStart(4, "0");
		} else if (type === "month") {
			return value.toString().padStart(2, "0");
		} else if (type === "day") {
			return value.toString().padStart(2, "0");
		} else {
			return "";
		}
	} else if (dateType === "LUNAR") {
		if (type === "year") {
			const Ld = Lunar.fromYmd(value, 1, 1);
			return Ld.getYearInChinese();
		} else if (type === "month") {
			if (value < 0) {
				return "闰" + LunarMonthMap[Math.abs(value) - 1];
			} else {
				return LunarMonthMap[value - 1];
			}
		} else if (type === "day") {
			return LunarDayMap[value - 1];
		} else {
			return "";
		}
	} else {
		return "";
	}
}

export function getDayOfLunarMonth(date: Date) {
	const Sd = Solar.fromDate(date);
	const Ld = Sd.getLunar();
	let dayOfLunarMonth = "";
	if (Ld.getDay() === 1) {
		dayOfLunarMonth = Ld.getMonthInChinese() + "月";
	} else {
		dayOfLunarMonth = Ld.getDayInChinese();
	}
	return dayOfLunarMonth;
}
