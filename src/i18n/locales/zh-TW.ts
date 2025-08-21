import { BaseMessage } from "../types";

const translations: BaseMessage = {
	setting: {
		title: "年度一覽",
		desc: "查看<a href='https://docs.ravenhogwarts.top/obsidian-yearly-glance/' target='_blank'>wiki文件</a>了解更多功能",
		general: {
			name: "常規",
			desc: "視圖配置",
			title: {
				name: "標題",
				desc: "自訂時使用{{year}}占位符才會顯示當前年份，留空則使用預設標題",
			},
			layout: {
				name: "佈局",
				desc: "佈局方式，行x列",
			},
			viewType: {
				name: "視圖類型",
				desc: "選擇年曆的顯示方式",
				options: {
					calendar: "日曆視圖",
					list: "清單視圖",
				},
			},
			showWeekdays: {
				name: "顯示星期",
				desc: "在視圖中顯示星期",
			},
			highlightToday: {
				name: "強調今天",
				desc: "在視圖中強調今天",
			},
			highlightWeekends: {
				name: "強調週末",
				desc: "在視圖中強調週末",
			},
			showLegend: {
				name: "顯示圖例",
				desc: "顯示事件類型圖例",
			},
			limitListHeight: {
				name: "限制清單高度",
				desc: "在清單視圖中限制每個月的清單高度",
			},
			eventFontSize: {
				name: "事件文字大小",
				desc: "設定事件文字的字型大小",
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
				name: "顯示自訂事件",
				desc: "在視圖中顯示自訂事件",
			},
			mondayFirst: {
				name: "週一作為一週的第一天",
				desc: "設定週一（而不是週日）作為一週的第一天",
			},
			showTooltips: {
				name: "顯示事件懸浮提示",
				desc: "滑鼠懸浮事件時顯示完整內容",
			},
			colorful: {
				name: "彩色主題",
				desc: "為每個月使用不同的主題色",
			},
			showLunarDay: {
				name: "顯示農曆日",
				desc: "在視圖中顯示農曆日",
			},
			showEmojiBeforeTabName: {
				name: "顯示標籤名稱前的emoji",
				desc: "在UI中顯示標籤名稱前的emoji",
			},
			showDebugInfo: {
				name: "顯示偵錯資訊",
				desc: "在主控台中顯示偵錯資訊",
			},
			presetColors: {
				name: "預設顏色",
				desc: "各事件的配色預設選項",
				newColor: "新顏色",
			},
			gregorianDisplayFormat: {
				name: "公曆顯示格式",
				desc: "公曆日期的全域顯示格式",
				options: {
					iso: "ISO標準格式(1949-10-01)",
					usSlash: "美式格式(01/10/1949)",
					euSlash: "歐式格式(10/01/1949)",
					jpSlash: "日式格式(1949/10/01)",
					deDot: "德式格式(01.10.1949)",
					usDash: "美式連字符(01-10-1949)",
					euDash: "歐式連字符(10-01-1949)",
					chinese: "中文格式(1949年10月01日)",
					enShortMdy: "英文月日年格式(Oct 01, 1949)",
					enShortDmy: "英文日月年格式(01 Oct 1949)",
					enFullMdy: "完整英文月日年格式(October 1, 1949)",
					enFullDmy: "完整英文日月年格式(1 October 1949)",
				},
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
		glanceManager: {
			name: "概覽管理",
			events: "事件管理",
			settings: "外掛設定",
			dataPort: "數據流轉",
		},
		yearlyGlance: {
			name: "年度概覽",
			yearlyCalendar: "年 年曆",
			legend: {
				holiday: "節日",
				birthday: "生日",
				customEvent: "自訂事件",
			},
			viewPreset: {
				yearOverview: "全年一覽",
				classicCalendar: "經典年曆",
				custom: "自訂佈局",
			},
			actions: {
				clickToShow: "點擊顯示",
				clickToHide: "點擊隱藏",
				form: "新增事件",
				manager: "開啟概覽管理",
				limitListHeight: "是否限制清單高度",
				hideEmptyDates: "是否隱藏空日期",
				emojiOnTop: "將 emoji 顯示在上方",
				wrapText: "切換文字換行",
				showTooltips: "滑鼠懸浮時顯示完整事件名",
				hidePreviousMonths: "隱藏當月之前的月份",
				showPreviousMonths: "顯示當月之前的月份",
				previousMonths: "過往",
				hideFutureMonths: "隱藏當月之後的月份",
				showFutureMonths: "顯示當月之後的月份",
				futureMonths: "未來",
			},
		},
		eventManager: {
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
				add: "新增事件",
				search: "搜尋事件...",
				clearSearch: "清除搜尋",
				delete: "刪除事件",
				edit: "編輯",
				yearlyCalendar: "開啟年度概覽",
				deleteConfirm: "確認刪除事件",
				location: "在事件管理中開啟",
				toggleBuiltinEventHidden: "切換內建節日顯示狀態",
				sort: {
					name: "事件名稱",
					date: "事件日期",
					asc: "升序",
					desc: "降序",
				},
			},
			empty: {
				text: "暫無事件",
				subtext: "點擊上方「新增事件」按鈕建立",
			},
			form: {
				edit: "編輯",
				add: "新增",
				eventType: "事件類型",
				eventName: "事件名稱",
				eventDate: "事件日期",
				eventDateType: "日期類型",
				optional: "可選",
				eventHidden: "隱藏",
				eventEmoji: "圖示",
				eventColor: "顏色",
				eventRemark: "備註",
				save: "儲存",
				cancel: "取消",
				reset: "重設",
				submit: "提交",
				selectPresetColor: "選擇預設",
			},
			dateError: {
				emptyDate: "日期不能為空，請輸入日期",
				invalidZeroDate:
					"日期的年月日不能為零：{{input}}，請檢查日期格式",
				insufficientDate:
					"輸入的日期資訊不完整：{{input}}，至少需要輸入月和日",
				invalidFormatDate:
					"日期格式不正確：{{input}}，期望格式為<b>月日</b>，但輸入可能是<b>年月</b>或<b>年日</b>格式",
				invalidRangeDate:
					"日期超出有效範圍：{{input}}，期望格式為<b>月日</b>，但月或日的數值超出正常範圍",
				unexpectedNumberLength:
					"日期數值長度不符合要求：{{length}} 位數字，期望為<b>月日</b>（2位）或<b>年月日</b>（3位）格式",
				invalidLunarDate:
					"無法識別的農曆日期：{{input}}，請檢查農曆日期格式是否正確",
				unknownChineseDigit:
					"無法識別的中文數字：{{char}}，請檢查中文數字書寫是否正確",
			},
			help: {
				eventName: "事件的名稱（不可為空）",
				eventDate:
					"事件日期，以年月日的順序書寫<br>" +
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
					"事件顏色，可以選擇預設顏色或自訂顏色<br>" +
					"預設顏色在外掛設定中新增",
				eventHidden:
					"是否隱藏該事件（在概覽中不再顯示）<br>" +
					"注：在事件管理中保持可見",
				eventRemark:
					"對事件的額外說明，點擊事件時（或在管理事件中）可查看備註內容",
				customEventRepeat: "選中時，將會在每年的該日期都重複顯示事件",
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
				noYear: "需補全年份資料",
			},
			customEvent: {
				name: "自訂事件",
				repeat: "重複",
			},
		},
		dataPortView: {
			common: {
				actions: {
					selectAll: "全選",
					reverseAll: "反選全部",
					selectSummary: "已選擇 {{count}} 個事件",
				},
			},
			export: {
				name: "資料匯出",
				type: {
					configure: "配置",
					markdown: {
						folderLabel: "匯出位置",
						fieldsTitle: "匯出欄位",
						success: "成功導出 {{count}} 個事件到 markdown 文件",
						failure: "導出失敗 {{count}} 個事件, 請檢查日誌",
					},
				},
				actions: {
					handle: "匯出選中事件",
				},
				config: {
					fileName: "檔案名稱",
					year: "匯出年份",
					id: "ID",
					isoDate: "ISO日期",
					calendar: "日曆類型",
					dateArr: "日期陣列",
					emoji: "表情符號",
					color: "顏色",
					remark: "備註",
					isHidden: "是否隱藏",
					foundDate: "節日起源時間",
					nextBirthday: "下一次生日",
					age: "年齡",
					animal: "生肖",
					zodiac: "星座",
					isRepeat: "是否重複",
				},
				empty: {
					text: "暫無事件資料",
					subtext: "請先新增一些事件再進行匯出操作",
					noDate: "無日期",
					noSelectedEvents: "未選擇任何事件",
				},
			},
			import: {
				name: "資料匯入",
				actions: {
					reset: "重新選擇匯入",
					handle: "匯入選中事件",
					parseSummary:
						"發現 {{validCount}} 個有效事件，{{invalidCount}} 個無效事件",
				},
				type: {
					json: {
						title: "JSON 檔案匯入",
						message:
							"<ul>" +
							"<li>檔案必須為 JSON 格式</li>" +
							"<li>事件必須包含 <code>text</code> 和 <code>userInput</code> 欄位</li>" +
							"<li>支援 <code>holidays</code>、<code>birthdays</code>、<code>customEvents</code> 三種事件類型</li>" +
							"</ul>",
						upload: "選擇",
						paste: "貼上",
						pastePlaceholder: "在此貼上 JSON 內容",
						pasteError: "解析錯誤: {{error}}",
						submitPaste: "解析 JSON",
						success: "成功匯入 {{count}} 個事件",
					},
				},
				empty: {
					text: "未找到可匯入的事件",
					subtext: "請檢查檔案內容或檔案格式",
				},
				warn: {
					invalidEvents: "無效事件",
					nullText: "缺少事件名稱",
					nullDate: "缺少使用者輸入的日期",
					duplicateEvent: "該事件可能已存在",
				},
			},
		},
	},
	command: {
		openYearlyGlance: "開啟年度概覽",
		openGlanceManager: "開啟概覽管理",
		addEvent: "新增事件",
		reloadPlugin: "重新載入外掛程式",
	},
	common: {
		confirm: "確認",
		cancel: "取消",
	},
	data: {
		sampleEvent: {
			text: "安裝 YG 外掛程式",
			remark: "歡迎使用 Yearly Glance 外掛程式！這是一個範例事件。請根據需要隱藏或刪除。",
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
			aries: "牡羊座",
			taurus: "金牛座",
			gemini: "雙子座",
			cancer: "巨蟹座",
			leo: "獅子座",
			virgo: "處女座",
			libra: "天秤座",
			scorpio: "天蠍座",
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
