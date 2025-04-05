import { Lunar, Solar } from "lunar-typescript";
import { calculateDateObj } from "./dateConverter";

/**
 * 生日信息计算工具
 * 提供生日相关信息的计算功能
 */

const ZODIAC_SIGNS = [
	{ name: "水瓶座", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
	{ name: "双鱼座", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
	{ name: "白羊座", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
	{ name: "金牛座", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
	{ name: "双子座", startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
	{ name: "巨蟹座", startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
	{ name: "狮子座", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
	{ name: "处女座", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
	{ name: "天秤座", startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
	{ name: "天蝎座", startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
	{ name: "射手座", startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
	{ name: "摩羯座", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
];

const ZODIAC_ANIMALS = [
	"鼠",
	"牛",
	"虎",
	"兔",
	"龙",
	"蛇",
	"马",
	"羊",
	"猴",
	"鸡",
	"狗",
	"猪",
];

/**
 * 计算星座
 * @param month 月份（1-12）
 * @param day 日（1-31）
 * @returns 星座名称
 */
export function calculateZodiacSign(month: number, day: number): string {
	const zodiac = ZODIAC_SIGNS.find((sign) => {
		if (sign.startMonth === month && day >= sign.startDay) return true;
		if (sign.endMonth === month && day <= sign.endDay) return true;
		return false;
	});

	return zodiac ? zodiac.name : "";
}

/**
 * 计算生肖
 * @param year 年份
 * @returns 生肖名称
 */
export function calculateZodiacAnimal(year: number): string {
	// 计算生肖索引 (2020年为鼠年，索引为0)
	const index = (year - 2020) % 12;
	// 处理负数年份
	const normalizedIndex = index < 0 ? index + 12 : index;
	return ZODIAC_ANIMALS[normalizedIndex];
}

/**
 * 计算年龄
 * @param birthYear 出生年份
 * @param currentYear 当前年份
 * @returns 年龄
 */
export function calculateAge(birthYear: number, currentYear: number): number {
	return currentYear - birthYear;
}

/**
 * 计算下一个生日日期
 * @param date 生日日期字符串，格式为MM-DD或YYYY-MM-DD
 * @param dateType 日期类型，SOLAR或LUNAR
 * @param currentYear 当前年份
 * @returns 下一个生日的公历日期，格式为YYYY-MM-DD
 */
export function calculateNextBirthday(
	date: string,
	dateType: "SOLAR" | "LUNAR",
	currentYear: number
): string {
	// 获取今年的生日日期
	const thisYearBirthday = calculateDateObj(date, dateType, currentYear);

	if (!thisYearBirthday) {
		return "";
	}

	// 解析日期
	const today = new Date();
	const birthdayDate = new Date(thisYearBirthday);

	// 如果今年生日已过，返回明年生日
	if (birthdayDate < today) {
		return calculateDateObj(date, dateType, currentYear + 1);
	}

	// 否则返回今年生日
	return thisYearBirthday;
}

/**
 * 更新生日信息
 * @param birthday 生日对象
 * @param currentYear 当前年份
 * @returns 更新后的生日对象
 */
export function updateBirthdayInfo(birthday: any, currentYear: number): any {
	const { date, dateType } = birthday;

	// 解析生日日期
	let birthYear: number | undefined;
	if (date.includes("-")) {
		const parts = date.split("-");
		if (parts.length === 3) {
			birthYear = parseInt(parts[0], 10);
		}
	}

	// 计算dateObj
	const dateObj = calculateDateObj(date, dateType, currentYear);

	// 如果有出生年份，计算年龄和生肖
	let age, animal, zodiac;

	if (birthYear && !isNaN(birthYear)) {
		age = calculateAge(birthYear, currentYear);
		animal = calculateZodiacAnimal(birthYear);

		// 解析公历生日日期
		const birthdayObj = new Date(dateObj);
		zodiac = calculateZodiacSign(
			birthdayObj.getMonth() + 1,
			birthdayObj.getDate()
		);
	}

	// 计算下一个生日
	const nextBirthday = calculateNextBirthday(date, dateType, currentYear);

	return {
		...birthday,
		dateObj,
		nextBirthday,
		...(age !== undefined && { age }),
		...(animal !== undefined && { animal }),
		...(zodiac !== undefined && { zodiac }),
	};
}

/**
 * 批量更新生日信息
 * @param birthdays 生日对象数组
 * @param currentYear 当前年份
 * @returns 更新后的生日对象数组
 */
export function updateBirthdaysInfo(
	birthdays: any[],
	currentYear: number
): any[] {
	return birthdays.map((birthday) =>
		updateBirthdayInfo(birthday, currentYear)
	);
}
