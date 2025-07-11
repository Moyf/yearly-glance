/**
 * 日历类型枚举
 */
export type CalendarType = "GREGORIAN" | "LUNAR" | "LUNAR_LEAP";

/**
 * 用户输入的原始日期信息
 */
export interface UserDateInput {
	/** 用户输入的原始字符串 */
	input: string;
	/** 用户指定的日历类型（可选，支持自动识别） */
	calendar?: CalendarType;
}

/**
 * 完整的事件日期信息
 */
export interface EventDate {
	/** ISO 8601扩展格式，支持农历标识 */
	isoDate: string;
	/** 用户原始输入（用于编辑和显示） */
	userInput: UserDateInput;
}

export interface ParseIsoDate {
	date: string;
	year: number | undefined;
	month: number;
	day: number;
	dateType: CalendarType;
}

// 中文数字映射
export const chineseDigits: Record<string, string> = {
	〇: "0",
	零: "0",
	一: "1",
	二: "2",
	三: "3",
	四: "4",
	五: "5",
	六: "6",
	七: "7",
	八: "8",
	九: "9",
};

// 农历月份映射
export const lunarMonths: Record<string, number> = {
	正月: 1,
	一月: 1,
	二月: 2,
	三月: 3,
	四月: 4,
	五月: 5,
	六月: 6,
	七月: 7,
	八月: 8,
	九月: 9,
	十月: 10,
	冬月: 11,
	腊月: 12,
};

// 农历日期映射
export const lunarDays: Record<string, number> = {
	初一: 1,
	初二: 2,
	初三: 3,
	初四: 4,
	初五: 5,
	初六: 6,
	初七: 7,
	初八: 8,
	初九: 9,
	初十: 10,
	十一: 11,
	十二: 12,
	十三: 13,
	十四: 14,
	十五: 15,
	十六: 16,
	十七: 17,
	十八: 18,
	十九: 19,
	二十: 20,
	廿一: 21,
	廿二: 22,
	廿三: 23,
	廿四: 24,
	廿五: 25,
	廿六: 26,
	廿七: 27,
	廿八: 28,
	廿九: 29,
	三十: 30,
};

// 农历关键词检测
export const lunarKeywords: string[] = [
	"正月",
	"二月",
	"三月",
	"四月",
	"五月",
	"六月",
	"七月",
	"八月",
	"九月",
	"十月",
	"冬月",
	"腊月",
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
	"闰",
	"年",
];
