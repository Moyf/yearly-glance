import { Holiday } from "@/src/core/interfaces/Events";
import { Lunar } from "lunar-typescript";

/**
 * 计算特定年份的节气日期
 * @param year 目标年份
 * @param solarTerm 节气名称
 * @returns 节气对应的阳历日期对象
 */
export function getSolarTermDate(year: number, solarTerm: string) {
	const date = new Date(year, 0, 1); // 以目标年份1月1日为基础日期
	const lunar = Lunar.fromDate(date);
	const jieQiTable = lunar.getJieQiTable();

	return jieQiTable[solarTerm];
}

/**
 * 内置节日数据
 * 内置节日必须设置type为BUILTIN
 * id格式：holi-bsyd0101xx | holi-wbsmq050207xx
 * w: 表示日期不确定的节日，如母亲节是5月的第二个星期日，如农历的节气
 * b：内置节日
 * s：公历节日 / l：农历节日
 * yd：节日拼音缩写
 * 01：1月
 * 01：1日
 * xx：随机字符串
 */
export const BUILTIN_HOLIDAYS: (year: number) => Holiday[] = (year: number) => {
	// 计算当前选择年份的节气日期
	const qingMing = getSolarTermDate(year, "清明");
	const dongZhi = getSolarTermDate(year, "DONG_ZHI");

	return [
		{
			id: "holi-wblqm",
			text: "清明",
			date: `${qingMing.getYear()},${qingMing.getMonth()},${qingMing.getDay()}`,
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🌸",
			color: "#f5222d",
			remark: "清明时节雨纷纷",
		},
		{
			id: "holi-wbldz",
			text: "冬至",
			date: `${dongZhi.getYear()},${dongZhi.getMonth()},${dongZhi.getDay()}`,
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🌙",
			color: "#f5222d",
			remark: "冬至吃饺子",
		},
	];
};
