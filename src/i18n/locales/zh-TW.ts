import { BaseMessage } from "../types";

const translations: BaseMessage = {
	setting: {
		title: "年度一覽",
		desc: "查看<a href='https://docs.ravenhogwarts.top/obsidian-yearly-glance/' target='_blank'>wiki文檔</a>了解更多功能",
		general: {
			name: "設置",
			desc: "視圖配置",
			title: {
				name: "標題",
				desc: "自定義時使用{{year}}占位符才會顯示當前年份，留空則使用預設標題",
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
				name: "顯示週幾",
				desc: "在視圖中顯示週幾",
			},
			highlightToday: {
				name: "高亮今天",
				desc: "在視圖中高亮今天",
			},
			highlightWeekends: {
				name: "高亮週末",
				desc: "在視圖中高亮週末",
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
				desc: "在視圖中顯示節假日",
			},
			showBirthdays: {
				name: "顯示生日",
				desc: "在視圖中顯示生日",
			},
			showCustomEvents: {
				name: "顯示自定義事件",
				desc: "在視圖中顯示自定義事件",
			},
			mondayFirst: {
				name: "週一作為一週的第一天",
				desc: "設置週一（而不是週日）作為一週的第一天",
			},
			showTooltips: {
				name: "顯示事件懸浮提示",
				desc: "懸浮事件時顯示完整內容",
			},
			colorful: {
				name: "彩色主題",
				desc: "為每個月使用不同的主題色",
			},
			showLunarDay: {
				name: "顯示農曆日",
				desc: "在視圖中顯示農曆日",
			},
			showDebugInfo: {
				name: "顯示除錯資訊",
				desc: "在控制台中顯示除錯資訊",
			},
			presetColors: {
				name: "預設顏色",
				desc: "各事件的配色預設選項",
				newColor: "新顏色",
			},
		},
		events: {
			name: "事件",
			desc: "各事件的管理",
		},
		group: {
			basic: {
				name: "基本設定",
				desc: "年曆的基礎資訊配置",
			},
			layout: {
				name: "佈局相關",
				desc: "年曆的整體佈局與視圖類型",
			},
			displayContent: {
				name: "樣式設定",
				desc: "年曆外觀相關的內容",
			},
			eventDisplay: {
				name: "事件顯示",
				desc: "事件、節假日、生日等相關顯示設定",
			},
			colorSets: {
				name: "顏色設定",
				desc: "各事件的配色預設選項",
			},
		},
	},
	view: {
		yearlyGlance: {
			name: "年度概覽",
			yearlyCalendar: "年 年曆",
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
				emojiOnTop: "將 emoji 顯示在上方",
				wrapText: "切換文本換行",
				showTooltips: "滑鼠懸浮時顯示完整事件名",
			},
		},
		eventManager: {
			name: "事件管理",
			solar: "公曆",
			lunar: "農曆",
			date: "日期",
			calendar: {
				auto: "自動推斷",
				gregorian: "公曆",
				lunar: "農曆",
				lunar_leap: "農曆閏月",
			},
			actions: {
				add: "添加新事件",
				search: "搜索事件...",
				clearSearch: "清除搜索",
				delete: "刪除事件",
				edit: "編輯",
				yearlyCalendar: "打開年度概覽",
				deleteConfirm: "確認刪除事件",
				location: "在事件管理中打開",
				toggleBuiltinEventHidden: "切換內置節日顯示狀態",
				sort: {
					name: "事件名稱",
					date: "事件日期",
					asc: "升序",
					desc: "降序",
				},
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
				eventHidden: "事件隱藏",
				eventEmoji: "事件圖標",
				eventColor: "事件顏色",
				eventRemark: "事件備註",
				save: "保存",
				cancel: "取消",
				reset: "重置",
				submit: "提交",
				selectPresetColor: "選擇預設",
			},
			dateError: {
				emptyDate: "日期不能為空，請輸入日期",
			},
			help: {
				eventName: "事件的顯示名稱，不能為空",
				eventDate:
					"事件日期，約束使用的日期順序是YMD<br>" +
					"<b>公曆</b>：<br>" +
					"標準格式：2025-01-01, 2025/01/01, 2025.01.01, 01-01, 01/01, 01.01<br>" +
					"舊格式：2025,01,01, 01,01<br>" +
					"中文格式：2025年01月01日, 01月01日<br>" +
					"<b>農曆</b>：<br>" +
					"標準格式：2025-01-01, 2025/01/01, 2025.01.01, 01-01, 01/01, 01.01<br>" +
					"舊格式：2025,6,1  2025,-6,1  6,1  -6,1<br>" +
					"中文格式：2025年正月初一, 正月初一, 閏二月初一, 二〇二五年閏六月初一",
				eventDateType:
					"事件日期類型，自動推斷或手動選擇<br>" +
					"<b>自動推斷</b>：根據輸入日期自動判斷是公曆，農曆或者農曆閏月<br>" +
					"<b>公曆</b>：公曆日期<br>" +
					"<b>農曆</b>：農曆日期<br>" +
					"<b>農曆閏月</b>：農曆閏月日期，若閏月不存在會自動轉換為農曆日期",
				eventEmoji: "事件圖標，目前支援使用emoji",
				eventColor:
					"事件顏色，可以選擇預設顏色或自定義顏色<br>" +
					"預設顏色在外掛設定中新增",
				eventHidden: "事件隱藏，不在年曆中顯示",
				eventRemark: "事件備註",
				customEventRepeat:
					"自定義事件重複，每年都有的事件可以設定為重複",
				holidayFoundDate: "節日起源日期，後續計劃會用於計算節慶週年",
			},
			holiday: {
				name: "節日",
				foundDate: "節日起源時間",
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
				repeat: "事件重複",
			},
		},
	},
	command: {
		openYearlyGlance: "打開年度概覽",
		openEventManager: "打開事件管理",
		addEvent: "添加事件",
		reloadPlugin: "重載外掛",
	},
	common: {
		confirm: "確認",
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
			sun: "週日",
			mon: "週一",
			tue: "週二",
			wed: "週三",
			thu: "週四",
			fri: "週五",
			sat: "週六",
		},
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
			pisces: "雙魚座",
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
			red: "紅色",
			orange: "橙色",
			yellow: "黃色",
			green: "綠色",
			blue: "藍色",
			purple: "紫色",
			brown: "棕色",
		},
	},
};

export default translations;
