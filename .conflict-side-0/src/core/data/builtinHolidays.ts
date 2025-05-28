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
		/** 公历节日 */
		{
			id: "holi-bsyd0101aa",
			text: "元旦",
			date: "1,1",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🎊",
			remark: "新年的第一天",
		},
		{
			id: "holi-bsqr0214ab",
			text: "情人节",
			date: "2,14",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "💝",
			color: "#ff85c0",
			remark: "浪漫的日子",
		},
		{
			id: "holi-bsfn0308ac",
			text: "妇女节",
			date: "3,8",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "👩",
			remark: "国际劳动妇女节",
		},
		{
			id: "holi-bszs0312ad",
			text: "植树节",
			date: "3,12",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🌳",
			color: "#52c41a",
			remark: "保护环境，绿化地球",
		},
		{
			id: "holi-bsyr0401ae",
			text: "愚人节",
			date: "4,1",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🃏",
			remark: "别被骗了！",
		},
		{
			id: "holi-bsld0501af",
			text: "劳动节",
			date: "5,1",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "👷",
			remark: "国际劳动节",
		},
		{
			id: "holi-bsqn0504ag",
			text: "青年节",
			date: "5,4",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "👦",
			remark: "五四青年节",
		},
		{
			id: "holi-bset0601ah",
			text: "儿童节",
			date: "6,1",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "👶",
			remark: "国际儿童节",
		},
		{
			id: "holi-bsjd0701ai",
			text: "建党节",
			date: "7,1",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🎖️",
			color: "#f5222d",
			remark: "中国共产党成立纪念日",
		},
		{
			id: "holi-bsjj0701aj",
			text: "建军节",
			date: "8,1",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🎖️",
			color: "#f5222d",
			remark: "中国人民解放军成立纪念日",
		},
		{
			id: "holi-bsjs0910ak",
			text: "教师节",
			date: "9,10",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "👨‍🏫",
			remark: "尊师重道",
		},
		{
			id: "holi-bsgq1001al",
			text: "国庆节",
			date: "10,1",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🎉",
			color: "#f5222d",
			remark: "中华人民共和国国庆节",
		},
		{
			id: "holi-bsws1031am",
			text: "万圣节",
			date: "10,31",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🎃",
			color: "#fa8c16",
			remark: "不给糖就捣蛋",
		},
		{
			id: "holi-bssd1225an",
			text: "圣诞节",
			date: "12,25",
			dateType: "SOLAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🎄",
			color: "#ff4d4f",
			remark: "圣诞老人要来啦",
		},

		/** 农历节日 */
		{
			id: "holi-blcj0101za",
			text: "春节",
			date: "1,1",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🧨",
			color: "#f5222d",
			remark: "农历新年",
		},
		{
			id: "holi-blyx0115zb",
			text: "元宵节",
			date: "1,15",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🏮",
			color: "#fa8c16",
			remark: "正月十五闹元宵",
		},
		{
			id: "holi-bllt0202zb",
			text: "龙头节",
			date: "2,2",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🐉",
			color: "#52c41a",
			remark: "二月二，龙抬头",
		},
		{
			id: "holi-blss0303zb",
			text: "上巳节",
			date: "3,3",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🌊",
			color: "#1890ff",
			remark: "古代女子祓禊的节日",
		},
		{
			id: "holi-bltd0505zc",
			text: "端午节",
			date: "5,5",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🐉",
			remark: "吃粽子，赛龙舟",
		},
		{
			id: "holi-blqx0707zd",
			text: "七夕节",
			date: "7,7",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🌌",
			color: "#722ed1",
			remark: "牛郎织女相会",
		},
		{
			id: "holi-blzy0715ze",
			text: "中元节",
			date: "7,15",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "👻",
			color: "#8c8c8c",
			remark: "鬼节",
		},
		{
			id: "holi-blzq0815zf",
			text: "中秋节",
			date: "8,15",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🥮",
			color: "#faad14",
			remark: "人月两团圆",
		},
		{
			id: "holi-blcy0909zg",
			text: "重阳节",
			date: "9,9",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🍊",
			color: "#ffc53d",
			remark: "敬老爱老",
		},
		{
			id: "holi-bllb1208zh",
			text: "腊八节",
			date: "12,8",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "🥣",
			remark: "腊八粥",
		},
		{
			id: "holi-blcx1230zi",
			text: "除夕",
			date: "12,30",
			dateType: "LUNAR",
			type: "BUILTIN",
			isHidden: false,
			emoji: "✨",
			color: "#f5222d",
			remark: "辞旧迎新的日子",
		},
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
