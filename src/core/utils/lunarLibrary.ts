import { Lunar } from "lunar-typescript";

export class LunarLibrary {
  /**
   * 构造有效的农历日期Lunar对象
   * @param year 年份
   * @param month 月份
   * @param day 日
   * @returns Lunar对象
   */
  static constructLunar(year: number, month: number, day: number): Lunar {
    if (month < 0) {
      // 农历闰月情况
      if (this.isValidLunarDate(year, month, day)) {
        // 构造正常，直接返回
        return Lunar.fromYmd(year, month, day);
      } else if (this.isValidLunarDate(year, Math.abs(month), day)) {
        // 如果因为当前年份没有该农历闰月，导致构造失败，则使用正常月份
        return Lunar.fromYmd(year, Math.abs(month), day);
      } else {
        // 其他情况是当前月份没有该农历日，一般出现在该月份没有三十，则使用前一天
        return Lunar.fromYmd(year, month, day - 1);
      }
    } else {
      // 农历正常月份情况
      if (this.isValidLunarDate(year, month, day)) {
        return Lunar.fromYmd(year, month, day);
      } else {
        // 其他情况是当前月份没有该农历日，一般出现在该月份没有三十，则使用前一天
        return Lunar.fromYmd(year, month, day - 1);
      }
    }
  }

  /**
   * 验证农历日期是否有效
   * 农历库会在以下情况抛出异常：
   * 1. 指定年份不存在该闰月
   * 2. 指定月份的天数超出范围（如某月只有29天但传入30天）
   * @param year 年份
   * @param month 月份
   * @param day 日
   * @returns 是否有效
   */
  static isValidLunarDate(year: number, month: number, day: number): boolean {
    try {
      Lunar.fromYmd(year, month, day);
      return true;
    } catch (error) {
      return false;
    }
  }
}