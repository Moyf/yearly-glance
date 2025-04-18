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
				holiday: "節日",
				birthday: "生日",
				customEvent: "自定義事件",
			},
			viewPreset: {
				yearOverview: "全年一覽",
				classicCalendar: "經典年曆",
				custom: "自定義佈局",
			},
			actions: {
				clickToShow: "點擊顯示",
				clickToHide: "點擊隱藏",
				form: "添加事件",
				manager: "打開事件管理器",
				limitListHeight: "是否限制列表高度",
				hideEmptyDates: "是否隱藏空日期",
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
			solar: "公历",
			lunar: "农历",
			date: "日期",
			actions: {
				add: "添加新事件",
				search: "搜索事件...",
				clearSearch: "清除搜索",
				delete: "刪除事件",
				edit: "編輯",
				yearlyCalendar: "打開年度概覽",
				deleteConfirm: "確認刪除事件",
				location: "在事件管理中打開",
			},
			empty: {
				text: "無事件",
				subtext: "點擊上方「添加新事件」按鈕創建",
			},
			form: {
				edit: "編輯",
				add: "添加",
				eventType: "事件類型",
				eventName: "名稱字段",
				eventDate: "事件日期",
				eventDateType: "事件日期類型",
				optional: "可選",
				eventRepeat: "重複",
				eventHidden: "隱藏",
				eventEmoji: "事件圖標",
				eventColor: "事件顏色",
				eventRemark: "事件備註",
				save: "保存",
				cancel: "取消",
				reset: "重置",
				eventDateHelp:
					"<b>格式：</b><br>" +
					"YYYY-M-D 或 M-D<br>" +
					"<b>公曆：</b><br>" +
					"• 2025-01-01 = 2025年1月1日<br>" +
					"<b>農曆：</b><br>" +
					"• 2025-01-01 = 二〇二五年正月初一<br>" +
					"• 2025-06-01! = 二〇二五年閏六月初一<br>",
			},
			holiday: {
				name: "節日",
				type: "類型",
				foundDate: "節日起源時間",
				internat: "國際",
				custom: "自定義",
			},
			birthday: {
				name: "生日",
				age: "年齡",
				nextBirthday: "下一次生日",
				animal: "生肖",
				zodiac: "星座",
				noYear: "需補全年份數據",
			},
			customEvent: {
				name: "自定義事件",
				repeat: "重複",
			},
		},
	},
	command: {
		openYearlyGlance: "打開年度概覽",
		openEventManager: "打開事件管理",
		addEvent: "添加事件",
	},
	common: {
		confirm: "確認",
		cancel: "取消",
	},
	data: {
		animal: {
			rat: "鼠",
			ox: "牛",
			tiger: "虎",
			rabbit: "兔",
			dragon: "龍",
			snake: "蛇",
			horse: "馬",
			sheep: "羊",
			monkey: "猴",
			rooster: "雞",
			dog: "狗",
			pig: "豬",
		},
		zodiac: {
			aries: "白羊座",
			taurus: "金牛座",
			gemini: "雙子座",
			cancer: "巨蟹座",
			leo: "獅子座",
			virgo: "處女座",
			libra: "天秤座",
			scorpio: "天蝎座",
			sagittarius: "射手座",
			capricorn: "摩羯座",
			aquarius: "水瓶座",
			pi: "雙魚座",
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
	},
};

export default translations;
