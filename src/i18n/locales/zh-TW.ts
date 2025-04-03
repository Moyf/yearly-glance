import { BaseMessage } from "../types";

const translations: BaseMessage = {
	setting: {
		title: "年度概覽",
		desc: "定制化管理年度事件",
		general: {
			name: "設置",
			desc: "視圖配置",
			title: {
				name: "標題",
				desc: "自定義年曆標題，留空則使用預設標題",
			},
			layout: {
				name: "布局",
				desc: "布局方式，行x列",
			},
			viewType: {
				name: "視圖類型",
				desc: "選擇年曆的顯示方式",
				options: {
					calendar: "日曆視圖",
					list: "列表視圖",
				},
			},
			showWeekdays: {
				name: "顯示周幾",
				desc: "在日曆視圖中顯示周幾",
			},
			highlightToday: {
				name: "高亮今天",
				desc: "在日曆視圖中高亮今天",
			},
			highlightWeekends: {
				name: "高亮周末",
				desc: "在日曆視圖中高亮周末",
			},
			showLegend: {
				name: "顯示圖例",
				desc: "顯示事件類型圖例",
			},
			limitListHeight: {
				name: "限制列表高度",
				desc: "在列表視圖中限制每個月的列表高度",
			},
			eventFontSize: {
				name: "事件文本大小",
				desc: "設置事件文本的字體大小",
				options: {
					small: "小",
					medium: "中",
					large: "大",
				},
			},
			showHolidays: {
				name: "顯示節假日",
				desc: "在日曆視圖中顯示節假日",
			},
			showBirthdays: {
				name: "顯示生日",
				desc: "在日曆視圖中顯示生日",
			},
			showCustomEvents: {
				name: "顯示自定義事件",
				desc: "在日曆視圖中顯示自定義事件",
			},
			mondayFirst: {
				name: "周一作為一周的第一天",
				desc: "設置周一（而不是周日）作為一周的第一天",
			},
			showTooltips: {
				name: "顯示事件懸浮提示",
				desc: "懸浮事件時顯示完整內容",
			},
			colorful: {
				name: "彩色主題",
				desc: "為每個月使用不同的主題色",
			},
		},
		events: {
			name: "事件",
			desc: "各事件的管理",
		},
	},
	view: {
		yearlyGlance: {
			name: "年度概覽",
			yearlyCalendar: "{year}年 年曆",
			legend: {
				all: "所有",
				holiday: "節日",
				birthday: "生日",
				custom: "自定義事件",
			},
			month: {
				jan: "一月",
				feb: "二月",
				mar: "三月",
				apr: "四月",
				may: "五月",
				jun: "六月",
				jul: "七月",
				aug: "八月",
				sep: "九月",
				oct: "十月",
				nov: "十一月",
				dec: "十二月",
			},
			week: {
				sun: "周日",
				mon: "周一",
				tue: "周二",
				wed: "周三",
				thu: "周四",
				fri: "周五",
				sat: "周六",
			},
		},
		eventManager: {
			name: "事件管理",
		},
	},
	command: {
		openYearlyGlance: "打開年度概覽",
		openEventManager: "打開年度概覽事件管理",
	},
};

export default translations;
