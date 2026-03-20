import { Holiday } from "../type/Events";
import { HolidayService } from "../i18n/holidays";
import { EventCalculator } from "../utils/eventCalculator";

/**
 * 生成系统节假日（法定节假日、二十四节气、传统节日）
 * 
 * 流程：
 * 1. HolidayService.getFullYearHolidays(year) - 根据年份从 lunar-typescript 库获取系统节假日的原始数据
 * 2. EventCalculator.updateHolidaysInfo() - 计算每个节假日的 dateArr（公历日期数组）等信息
 * 
 * @param year 年份
 * @returns 包含完整信息（dateArr 等）的系统节假日数组
 */
export function generateSystemHolidays(year: number): Holiday[] {
	const systemHolidays = HolidayService.getFullYearHolidays(year);
	return EventCalculator.updateHolidaysInfo(systemHolidays, year);
}

/**
 * 更新用户节假日的 dateArr 字段
 * 
 * 用户节假日存储时只有原始日期（如 2026-01-01），需要根据年份计算公历日期数组
 * 这个函数与 generateSystemHolidays 流程相同，只是数据来源不同
 * 
 * @param holidays 用户节假日数组
 * @param year 年份
 * @returns 更新后的用户节假日数组（包含 dateArr）
 */
export function updateUserHolidays(holidays: Holiday[], year: number): Holiday[] {
	return EventCalculator.updateHolidaysInfo(holidays, year);
}
