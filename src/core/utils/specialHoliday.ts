import { Lunar } from "lunar-typescript";

export class SpecialHoliday {
  /**
   * 获取指定年份的节气日期
   * @param year 年份
   * @param term 节气名称
   * DA_XUE, 冬至, 小寒, 大寒, 
   * 立春, 雨水, 惊蛰, 春分, 清明, 谷雨, 
   * 立夏, 小满, 芒种, 夏至, 小暑, 大暑, 
   * 立秋, 处暑, 白露, 秋分, 寒露, 霜降, 
   * 立冬, 小雪, 大雪, DONG_ZHI, XIAO_HAN, DA_HAN, 
   * LI_CHUN, YU_SHUI, JING_ZHE
   * @returns 节气日期
   */
  static solarTerm(year: number, term: string) {
    const date = new Date(year, 0, 1); // 以目标年份1月1日为基础日期
    const lunar = Lunar.fromDate(date);
    const jieQiTable = lunar.getJieQiTable();

    return jieQiTable[term].toYmd();
  }
}
