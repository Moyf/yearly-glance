export interface StandardDate {
	isoDate: string;
	type: "SOLAR" | "LUNAR";
	original: SolarDate | LunarDate;
}

export interface SolarDate {
	year: number;
	month: number; // 1-12
	day: number;
}

export interface LunarDate {
	year: number;
	month: number; // 1-12
	day: number;
	/** 是否为闰月 */
	isLeapMonth: boolean;
}

export interface ParsedDate {
	/** 标准化日期 */
	standard: StandardDate;
	/** 显示用的格式化字符串 */
	display: string;
	/** 用于lunar-typescript的格式 */
	lunarFormat?: string;
}

export interface DateUtils {
	/** 解析各种格式的日期字符串 */
	parseDate(dateStr: string, type: "SOLAR" | "LUNAR"): ParsedDate;
	/** 转换为ISO 8601格式 */
	toISO(date: SolarDate | LunarDate, type: "SOLAR" | "LUNAR"): string;
	/** 从ISO格式解析回原始格式 */
	fromISO(
		isoDate: string,
		targetType: "SOLAR" | "LUNAR"
	): SolarDate | LunarDate;
	/** 格式化为lunar-typescript兼容格式 */
	toLunarFormat(date: LunarDate): string;
}
