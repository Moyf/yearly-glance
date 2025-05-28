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
				desc: "自定义时使用{{year}}占位符才会显示当前年份，留空则使用默认标题",
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
				desc: "在视图中显示周几",
			},
			highlightToday: {
				name: "高亮今天",
				desc: "在视图中高亮今天",
			},
			highlightWeekends: {
				name: "高亮周末",
				desc: "在视图中高亮周末",
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
				desc: "在视图中显示节假日",
			},
			showBirthdays: {
				name: "显示生日",
				desc: "在视图中显示生日",
			},
			showCustomEvents: {
				name: "显示自定义事件",
				desc: "在视图中显示自定义事件",
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
			showLunarDay: {
				name: "显示农历日",
				desc: "在视图中显示农历日",
			},
			showDebugInfo: {
				name: "显示调试信息",
				desc: "在控制台中显示调试信息",
			},
			presetColors: {
				name: "预设颜色",
				desc: "各事件的配色预设选项",
				newColor: "新颜色",
			},
		},
		events: {
			name: "事件",
			desc: "各事件的管理",
		},
		group: {
			basic: {
				name: "基本设置",
				desc: "年历的基础信息配置",
			},
			layout: {
				name: "布局相关",
				desc: "年历的整体布局与视图类型",
			},
			displayContent: {
				name: "样式设置",
				desc: "年历外观相关的内容",
			},
			eventDisplay: {
				name: "事件显示",
				desc: "事件、节假日、生日等相关显示设置",
			},
			colorSets: {
				name: "颜色设置",
				desc: "颜色配置相关内容",
			},
		},
	},
	view: {
		yearlyGlance: {
			name: "年度概览",
			yearlyCalendar: "年 年历",
			legend: {
				holiday: "节日",
				birthday: "生日",
				customEvent: "自定义事件",
			},
			viewPreset: {
				yearOverview: "全年一览",
				classicCalendar: "经典年历",
				custom: "自定义布局",
			},
			actions: {
				clickToShow: "点击显示",
				clickToHide: "点击隐藏",
				form: "添加事件",
				manager: "打开事件管理器",
				limitListHeight: "是否限制列表高度",
				hideEmptyDates: "是否隐藏空日期",
				// 其他 action
			},
		},
		eventManager: {
			name: "事件管理",
			solar: "公历",
			lunar: "农历",
			date: "日期",
			actions: {
				add: "添加新事件",
				search: "搜索事件...",
				clearSearch: "清除搜索",
				delete: "删除事件",
				edit: "编辑",
				yearlyCalendar: "打开年度概览",
				deleteConfirm: "确认删除事件",
				location: "在事件管理中打开",
				toggleBuiltinEventHidden: "切换内置节日显示状态",
				sort: {
					name: "事件名称",
					date: "事件日期",
					asc: "升序",
					desc: "降序",
				},
			},
			empty: {
				text: "暂无事件",
				subtext: "点击上方“添加新事件”按钮创建",
			},
			form: {
				edit: "编辑",
				add: "添加",
				eventType: "事件类型",
				eventName: "名称字段",
				eventDate: "事件日期",
				eventDateType: "事件日期类型",
				optional: "可选",
				eventRepeat: "重复",
				eventHidden: "隐藏",
				eventEmoji: "事件图标",
				eventColor: "事件颜色",
				eventRemark: "事件备注",
				save: "保存",
				cancel: "取消",
				reset: "重置",
				submit: "提交",
				eventDateHelp:
					"<b>格式：</b><br>" +
					"YYYY-M-D 或 M-D<br>" +
					"<b>公历：</b><br>" +
					"• 2025-01-01 = 2025年1月1日<br>" +
					"<b>农历：</b><br>" +
					"• 2025-01-01 = 二〇二五年正月初一<br>" +
					"• 2025-06-01! = 二〇二五年闰六月初一",
				selectDateType: "选择",
				previousDate: "上一",
				nextDate: "下一",
				year: "年",
				month: "月",
				day: "日",
				selectPresetColor: "选择预设",
			},
			holiday: {
				name: "节日",
				type: "类型",
				foundDate: "节日起源时间",
				builtin: "内置节日",
				custom: "自定义节日",
			},
			birthday: {
				name: "生日",
				age: "年龄",
				nextBirthday: "下一次生日",
				animal: "生肖",
				zodiac: "星座",
				noYear: "需补全年份数据",
			},
			customEvent: {
				name: "自定义事件",
				repeat: "重复",
			},
		},
		importExportManager: {
			import: {
				title: "导入事件",
				tab: "导入",
			},
			export: {
				title: "导出事件",
				tab: "导出",
			},
		},
	},
	command: {
		openYearlyGlance: "打开年度概览",
		openEventManager: "打开事件管理",
		addEvent: "添加事件",
		reloadPlugin: "重载插件",
		importExportEvents: "打开导入导出窗口",
	},
	common: {
		confirm: "确认",
		cancel: "取消",
	},
	data: {
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
		animal: {
			rat: "鼠",
			ox: "牛",
			tiger: "虎",
			rabbit: "兔",
			dragon: "龙",
			snake: "蛇",
			horse: "马",
			sheep: "羊",
			monkey: "猴",
			rooster: "鸡",
			dog: "狗",
			pig: "猪",
		},
		zodiac: {
			aries: "白羊座",
			taurus: "金牛座",
			gemini: "双子座",
			cancer: "巨蟹座",
			leo: "狮子座",
			virgo: "处女座",
			libra: "天秤座",
			scorpio: "天蝎座",
			sagittarius: "射手座",
			capricorn: "摩羯座",
			aquarius: "水瓶座",
			pisces: "双鱼座",
		},
		gan: {
			jia: "甲",
			yi: "乙",
			bing: "丙",
			ding: "丁",
			wu: "戊",
			ji: "己",
			geng: "庚",
			xin: "辛",
			ren: "壬",
			gui: "癸",
		},
		zhi: {
			zi: "子",
			chou: "丑",
			yin: "寅",
			mao: "卯",
			chen: "辰",
			si: "巳",
			wu: "午",
			wei: "未",
			shen: "申",
			you: "酉",
			xu: "戌",
			hai: "亥",
		},
		color: {
			red: "系统-红色",
			orange: "系统-橙色",
			yellow: "系统-黄色",
			green: "系统-绿色",
			blue: "系统-蓝色",
			purple: "系统-紫色",
			brown: "系统-棕色",
		},
	},
};

export default translations;
