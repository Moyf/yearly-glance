import { ParseIsoDate, CalendarType } from "../interfaces/Date";

export class IsoExtend {
  /**
   * 解析扩展的ISO日期格式（带有日历类型标识）
   * @param isoDate 带有日历类型的ISO日期字符串，如 "2023-01-01#GREGORIAN"
   * @returns ParseIsoDate 对象，包含日期、年、月、日和日历类型
   */
  static parse(isoDate: string): ParseIsoDate {
    // 默认值
    let date = isoDate;
    let dateType: CalendarType = "GREGORIAN";
    let year: number | undefined = undefined;
    let month = 1;
    let day = 1;
    
    // 检查是否包含日历类型标记
    if (isoDate.includes("#")) {
      const [isoDatePart, calendarPart] = isoDate.split("#");
      date = isoDatePart;
      
      // 确保日历类型有效
      if (calendarPart === "GREGORIAN" || calendarPart === "LUNAR" || calendarPart === "LUNAR_LEAP") {
        dateType = calendarPart;
      }
      
      // 解析日期部分获取年、月、日
      const dateParts = isoDatePart.split("-");
      if (dateParts.length === 3) {
        // 完整日期格式: YYYY-MM-DD
        year = parseInt(dateParts[0], 10);
        month = parseInt(dateParts[1], 10);
        day = parseInt(dateParts[2], 10);
      } else if (dateParts.length === 2) {
        // 简短日期格式: MM-DD
        month = parseInt(dateParts[0], 10);
        day = parseInt(dateParts[1], 10);
      }
    }
    
    return {
      date,
      year,
      month,
      day,
      dateType,
    };
  }

  /**
   * 创建扩展的ISO日期字符串
   * @param year 年份（可选）
   * @param month 月份
   * @param day 日期
   * @param calendarType 日历类型
   * @returns 扩展的ISO日期字符串
   */
  static create(month: number, day: number, calendarType: CalendarType, year?: number): string {
    let dateStr: string;
    
    if (year !== undefined) {
      // 格式：YYYY-MM-DD#CalendarType
      dateStr = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } else {
      // 格式：MM-DD#CalendarType
      dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    
    return `${dateStr}#${calendarType}`;
  }

  /**
   * 检查字符串是否是有效的扩展ISO日期格式
   * @param isoDate 需要检查的字符串
   * @returns 是否是有效的扩展ISO日期格式
   */
  static isValid(isoDate: string): boolean {
    if (!isoDate || typeof isoDate !== 'string') {
      return false;
    }

    // 检查是否有日历类型标记
    if (!isoDate.includes('#')) {
      return false;
    }

    const [datePart, calendarPart] = isoDate.split('#');
    
    // 检查日历类型是否有效
    if (calendarPart !== 'GREGORIAN' && calendarPart !== 'LUNAR' && calendarPart !== 'LUNAR_LEAP') {
      return false;
    }

    // 检查日期部分格式是否正确
    // ISO格式: YYYY-MM-DD 或 MM-DD
    const dateFormatRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}-\d{2})$/;
    if (!dateFormatRegex.test(datePart)) {
      return false;
    }
    
    // 验证日期值的合法性
    const parts = datePart.split('-');
    let year: number | undefined;
    let month: number;
    let day: number;
    
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      month = parseInt(parts[0], 10);
      day = parseInt(parts[1], 10);
    }
    
    // 简单验证月份和日期的有效性
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    return true;
  }

  /**
   * 获取扩展ISO日期中的日期部分
   * @param extendedIsoDate 扩展的ISO日期字符串
   * @returns 日期部分
   */
  static getDate(extendedIsoDate: string): string {
    if (extendedIsoDate.includes('#')) {
      return extendedIsoDate.split('#')[0];
    }
    return extendedIsoDate;
  }

  /**
   * 获取扩展ISO日期中的日历类型部分
   * @param extendedIsoDate 扩展的ISO日期字符串
   * @returns 日历类型，默认为GREGORIAN
   */
  static getCalendarType(extendedIsoDate: string): CalendarType {
    if (extendedIsoDate.includes('#')) {
      const calendarPart = extendedIsoDate.split('#')[1];
      if (calendarPart === 'GREGORIAN' || calendarPart === 'LUNAR' || calendarPart === 'LUNAR_LEAP') {
        return calendarPart;
      }
    }
    return 'GREGORIAN';
  }

  /**
   * 更改扩展ISO日期的日历类型
   * @param extendedIsoDate 扩展的ISO日期字符串
   * @param newCalendarType 新的日历类型
   * @returns 更新后的扩展ISO日期字符串
   */
  static changeCalendarType(extendedIsoDate: string, newCalendarType: CalendarType): string {
    const datePart = this.getDate(extendedIsoDate);
    return `${datePart}#${newCalendarType}`;
  }
}