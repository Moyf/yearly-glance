import { Holiday } from "@/src/core/interfaces/Events";

/**
 * 内置节日数据
 * 内置节日必须设置type为INTERNAT
 * id格式：holi-ydbs0101xx
 * yd：节日拼音缩写
 * b：内置节日
 * s：阳历节日
 * 01：1月
 * 01：1日
 * xx：随机字符串
 */
export const BUILTIN_HOLIDAYS: Holiday[] = [
	// 公历节日
	{
		id: "holi-ydbs0101aa",
		text: "元旦",
		date: "1,1",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🎊",
		remark: "新年的第一天",
	},
	{
		id: "holi-qrbs0214ab",
		text: "情人节",
		date: "2,14",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "💝",
		color: "#ff85c0",
		remark: "浪漫的日子",
	},
	{
		id: "holi-fnbs0308ac",
		text: "妇女节",
		date: "3,8",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "👩",
		remark: "国际劳动妇女节",
	},
	{
		id: "holi-zsbs0312ad",
		text: "植树节",
		date: "3,12",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🌳",
		color: "#52c41a",
		remark: "保护环境，绿化地球",
	},
	{
		id: "holi-yrbs0401ae",
		text: "愚人节",
		date: "4,1",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🃏",
		remark: "别被骗了！",
	},
	{
		id: "holi-ldbs0501af",
		text: "劳动节",
		date: "5,1",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "👷",
		remark: "国际劳动节",
	},
	{
		id: "holi-qnbs0504ag",
		text: "青年节",
		date: "5,4",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "👦",
		remark: "五四青年节",
	},
	{
		id: "holi-etbs0601ah",
		text: "儿童节",
		date: "6,1",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "👶",
		remark: "国际儿童节",
	},
	{
		id: "holi-jdbs0701ai",
		text: "建党节",
		date: "7,1",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🎖️",
		color: "#f5222d",
		remark: "中国共产党成立纪念日",
	},
	{
		id: "holi-jjbs0701aj",
		text: "建军节",
		date: "8,1",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🎖️",
		color: "#f5222d",
		remark: "中国人民解放军成立纪念日",
	},
	{
		id: "holi-jsbs0910ak",
		text: "教师节",
		date: "9,10",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "👨‍🏫",
		remark: "尊师重道",
	},
	{
		id: "holi-gqbs1001al",
		text: "国庆节",
		date: "10,1",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🎉",
		color: "#f5222d",
		remark: "中华人民共和国国庆节",
	},
	{
		id: "holi-wsbs1031am",
		text: "万圣节",
		date: "10,31",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🎃",
		color: "#fa8c16",
		remark: "不给糖就捣蛋",
	},
	{
		id: "holi-sdbs1225an",
		text: "圣诞节",
		date: "12,25",
		dateType: "SOLAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🎄",
		color: "#ff4d4f",
		remark: "圣诞老人要来啦",
	},

	// 农历节日
	{
		id: "holi-cjbl0101za",
		text: "春节",
		date: "1,1",
		dateType: "LUNAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🧨",
		color: "#f5222d",
		remark: "农历新年",
	},
	{
		id: "holi-yxbl0115zb",
		text: "元宵节",
		date: "1,15",
		dateType: "LUNAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🏮",
		color: "#fa8c16",
		remark: "正月十五闹元宵",
	},
	{
		id: "holi-dwbl0505zc",
		text: "端午节",
		date: "5,5",
		dateType: "LUNAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🐉",
		remark: "吃粽子，赛龙舟",
	},
	{
		id: "holi-qxbl0707zd",
		text: "七夕节",
		date: "7,7",
		dateType: "LUNAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🌌",
		color: "#722ed1",
		remark: "牛郎织女相会",
	},
	{
		id: "holi-zybl0715ze",
		text: "中元节",
		date: "7,15",
		dateType: "LUNAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "👻",
		color: "#8c8c8c",
		remark: "鬼节",
	},
	{
		id: "holi-zqbl0815zf",
		text: "中秋节",
		date: "8,15",
		dateType: "LUNAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🥮",
		color: "#faad14",
		remark: "人月两团圆",
	},
	{
		id: "holi-cybl0909zg",
		text: "重阳节",
		date: "9,9",
		dateType: "LUNAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🍊",
		color: "#ffc53d",
		remark: "敬老爱老",
	},
	{
		id: "holi-lbbl1208zh",
		text: "腊八节",
		date: "12,8",
		dateType: "LUNAR",
		type: "INTERNAT",
		isHidden: false,
		emoji: "🥣",
		remark: "腊八粥",
	},
];
