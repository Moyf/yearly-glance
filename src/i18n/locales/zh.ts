import { BaseMessage } from "../types";

const translations: BaseMessage = {
	setting: {
		title: "年度概览",
		desc: "定制化管理年度事件",
		general: {
			name: "常规",
			desc: "视图配置",
			title: {
				name: "标题",
				desc: "自定义年历标题，留空则使用默认标题",
			},
			layout: {
				name: "布局",
				desc: "布局方式，行x列",
			},
			viewType: {
				name: "视图类型",
				desc: "选择年历的显示方式",
				options: {
					calendar: "日历视图",
					list: "列表视图",
				},
			},
			showWeekdays: {
				name: "显示周几",
				desc: "在日历视图中显示周几",
			},
			highlightToday: {
				name: "高亮今天",
				desc: "在日历视图中高亮今天",
			},
			highlightWeekends: {
				name: "高亮周末",
				desc: "在日历视图中高亮周末",
			},
			showLegend: {
				name: "显示图例",
				desc: "显示事件类型图例",
			},
			limitListHeight: {
				name: "限制列表高度",
				desc: "在列表视图中限制每个月的高度",
			},
			eventFontSize: {
				name: "事件文本大小",
				desc: "设置事件文本的字体大小",
				options: {
					small: "小",
					medium: "中",
					large: "大",
				},
			},
			showHolidays: {
				name: "显示节假日",
				desc: "在日历视图中显示节假日",
			},
			showBirthdays: {
				name: "显示生日",
				desc: "在日历视图中显示生日",
			},
			showCustomEvents: {
				name: "显示自定义事件",
				desc: "在日历视图中显示自定义事件",
			},
			mondayFirst: {
				name: "周一作为一周的第一天",
				desc: "设置周一（而不是周日）作为一周的第一天",
			},
			showTooltips: {
				name: "显示事件悬浮提示",
				desc: "鼠标悬停在事件上时显示完整内容",
			},
			colorful: {
				name: "彩色主题",
				desc: "为每个月使用不同的主题色",
			},
		},
		events: {
			name: "事件",
			desc: "各事件的管理",
		},
	},
	view: {
		yearlyGlance: {
			name: "年度概览",
			yearlyCalendar: "{year}年 年历",
			legend: {
				all: "所有",
				holiday: "节日",
				birthday: "生日",
				custom: "自定义事件",
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
		openYearlyGlance: "打开年度概览",
		openEventManager: "打开年度概览事件管理",
	},
};

export default translations;
