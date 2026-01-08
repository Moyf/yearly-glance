import { BaseMessage } from "../types";

const translations: BaseMessage = {
	setting: {
		title: "年度一览",
		desc: "查看<a href='https://docs.ravenhogwarts.top/obsidian-yearly-glance/' target='_blank'>wiki文档</a>了解更多功能",
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
				desc: "在日期下方显示农历日期",
			},
			showEmojiBeforeTabName: {
				name: "标签图标显示方式",
				desc: "选择标签页图标的显示方式",
				options: {
					none: "不显示图标",
					lucide: "Lucide 矢量图标",
					emoji: "Emoji 图标",
				},
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
			gregorianDisplayFormat: {
				name: "公历显示格式",
				desc: "公历日期的全局显示格式",
				options: {
					iso: "ISO标准格式(1949-10-01)",
					usSlash: "美式格式(01/10/1949)",
					euSlash: "欧式格式(10/01/1949)",
					jpSlash: "日式格式(1949/10/01)",
					deDot: "德式格式(01.10.1949)",
					usDash: "美式连字符(01-10-1949)",
					euDash: "欧式连字符(10-01-1949)",
					chinese: "中文格式(1949年10月01日)",
					enShortMdy: "英文月日年格式(Oct 01, 1949)",
					enShortDmy: "英文日月年格式(01 Oct 1949)",
					enFullMdy: "完整英文月日年格式(October 1, 1949)",
					enFullDmy: "完整英文日月年格式(1 October 1949)",
				},
			},
			defaultBasesEventPath: {
				name: "默认笔记事件路径",
				desc: "创建笔记事件时，新笔记将保存到此文件夹",
				placeholder: "留空则保存到库根目录",
			},
			basesEventTitleProp: {
				name: "标题属性名",
				desc: "笔记 frontmatter 中用于存储事件标题的属性名",
				placeholder: "默认: title",
			},
			basesEventDateProp: {
				name: "日期属性名",
				desc: "笔记 frontmatter 中用于存储事件日期的属性名",
				placeholder: "默认: event_date",
			},
			basesEventDurationProp: {
				name: "持续天数属性名",
				desc: "笔记 frontmatter 中用于存储事件持续天数的属性名",
				placeholder: "默认: duration_days",
			},
			basesEventIconProp: {
				name: "图标属性名",
				desc: "笔记 frontmatter 中用于存储事件图标的属性名",
				placeholder: "默认: icon",
			},
			basesEventColorProp: {
				name: "颜色属性名",
				desc: "笔记 frontmatter 中用于存储事件颜色的属性名",
				placeholder: "默认: color",
			},
			basesEventDescriptionProp: {
				name: "描述属性名",
				desc: "笔记 frontmatter 中用于存储事件描述的属性名",
				placeholder: "默认: description",
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
			basesEvent: {
				name: "笔记事件",
				desc: "使用特定的笔记作为事件来源，用于配合 Bases 视图使用",
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
		basesView: {
			name: "年度概览",
			options: {
				embeddedHeight: "嵌入高度",
				limitHeight: "限制高度",
				maxHeight: "最大高度",
				properties: "属性",
				display: "显示",
				propTitle: "标题属性",
				propDate: "日期属性",
				propDuration: "持续天数属性",
				inheritPluginData: "继承插件数据",
			},
		},
		glanceManager: {
			name: "概览管理",
			events: "事件管理",
			settings: "插件设置",
			dataPort: "数据流转",
		},
		yearlyGlance: {
			name: "年度概览",
			yearlyCalendar: "年 概览",
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
				manager: "打开概览管理",
				limitListHeight: "是否限制列表高度",
				hideEmptyDates: "是否隐藏空日期",
				emojiOnTop: "将 emoji 显示在上方",
				wrapText: "切换文本换行",
				showTooltips: "鼠标悬浮时显示完整事件名",
				hidePreviousMonths: "隐藏当月之前的月份",
				showPreviousMonths: "显示当月之前的月份",
				previousMonths: "过往",
				hideFutureMonths: "隐藏当月之后的月份",
				showFutureMonths: "显示当月之后的月份",
				futureMonths: "未来",
			},
		},
		eventManager: {
			solar: "公历",
			lunar: "农历",
			date: "日期",
			calendar: {
				auto: "自动推断",
				gregorian: "公历",
				lunar: "农历",
				lunar_leap: "农历闰月",
			},
			actions: {
				add: "添加新事件",
				search: "搜索事件...",
				clearSearch: "清除搜索",
				delete: "删除事件",
				edit: "编辑",
				yearlyCalendar: "打开年度概览",
				deleteConfirm: "确认删除事件",
				location: "在事件管理中打开",
				openOriginalNote: "打开原始笔记",
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
				editBasesEvent: "编辑笔记事件",
				addBasesEvent: "添加笔记事件",
				eventType: "事件类型",
				eventName: "事件名称",
				eventDate: "事件日期",
				eventDuration: "事件天数",
				eventDateType: "日期类型",
				optional: "可选",
				eventHidden: "隐藏",
				eventEmoji: "图标",
				eventColor: "颜色",
				eventRemark: "备注",
				save: "保存",
				saving: "保存中...",
				cancel: "取消",
				reset: "重置",
				submit: "提交",
				selectPresetColor: "选择预设",
				eventCreated: "事件已创建",
				eventUpdated: "事件已更新",
				saveFailed: "保存失败：{{error}}",
			},
			dateError: {
				emptyDate: "日期不能为空，请输入日期",
				invalidZeroDate:
					"日期的年月日不能为零：{{input}}，请检查日期格式",
				insufficientDate:
					"输入的日期信息不完整：{{input}}，至少需要输入月和日",
				invalidFormatDate:
					"日期格式不正确：{{input}}，期望格式为<b>月日</b>，但输入可能是<b>年月</b>或<b>年日</b>格式",
				invalidRangeDate:
					"日期超出有效范围：{{input}}，期望格式为<b>月日</b>，但月或日的数值超出正常范围",
				unexpectedNumberLength:
					"日期数值长度不符合要求：{{length}} 位数字，期望为<b>月日</b>（2位）或<b>年月日</b>（3位）格式",
				invalidLunarDate:
					"无法识别的农历日期：{{input}}，请检查农历日期格式是否正确",
				unknownChineseDigit:
					"无法识别的中文数字：{{char}}，请检查中文数字书写是否正确",
			},
			help: {
				eventName: "事件的名称（不可为空）",
				eventDate:
					"事件日期，以年月日的顺序书写<br>" +
					"<b>公历</b>：<br>" +
					"标准格式：2025-01-01, 2025/01/01, 2025.01.01, 01-01, 01/01, 01.01<br>" +
					"旧格式：2025,01,01, 01,01<br>" +
					"中文格式：2025年01月01日, 01月01日<br>" +
					"<b>农历</b>：<br>" +
					"标准格式：2025-01-01, 2025/01/01, 2025.01.01, 01-01, 01/01, 01.01<br>" +
					"旧格式：2025,6,1  2025,-6,1  6,1  -6,1<br>" +
					"中文格式：2025年正月初一, 正月初一, 闰二月初一, 二〇二五年闰六月初一",
				eventDuration:
					"设置事件持续的天数<br>" +
					"默认为1天（单日事件）<br>" +
					"设置为大于1的数字时，事件会在多个日期中显示，例如设置为3会在连续3天中显示该事件",
				eventDateType:
					"事件日期类型，自动推断或手动选择<br>" +
					"<b>自动推断</b>：根据输入日期自动判断是公历，农历或者农历闰月<br>" +
					"<b>公历</b>：公历日期<br>" +
					"<b>农历</b>：农历日期<br>" +
					"<b>农历闰月</b>：农历闰月日期，若闰月不存在会自动转换为农历日期",
				eventEmoji: "事件图标，目前支持使用emoji",
				eventColor:
					"事件颜色，可以选择预设颜色或自定义颜色<br>" +
					"预设颜色在插件设置中添加",
				eventHidden:
					"是否隐藏该事件（在概览中不再显示）<br>" +
					"注：在事件管理中保持可见",
				eventRemark:
					"对事件的额外说明，点击事件时（或在管理事件中）可查看备注内容",
				customEventRepeat: "选中时，将会在每年的该日期都重复显示事件",
				holidayFoundDate: "节日起源日期，后续计划会用于计算节庆周年",
				frontmatterSync: "同步到笔记元数据（frontmatter）",
				basesEventCreate: {
					label: "创建新笔记",
					text: "保存后将在 {{path}} 文件夹中创建新笔记，可在插件设置中配置默认路径。",
					textWithName: "将保存为新笔记：",
				},
				basesEventEdit: {
					label: "事件来源",
					notePrefix: "此事件来自笔记",
					syncText: "保存时会将修改同步到原始笔记的 frontmatter 元数据中。",
				},
			},
			holiday: {
				name: "节日",
				foundDate: "节日起源时间",
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
			basesEvent: {
				name: "笔记事件",
				sourceNote: "来自笔记",
			},
			source: {
				bases: "来自笔记",
			},
		},
		dataPortView: {
			common: {
				actions: {
					selectAll: "全选",
					reverseAll: "反选全部",
					selectSummary: "已选择 {{count}} 个事件",
				},
			},
			export: {
				name: "数据导出",
				type: {
					configure: "配置",
					markdown: {
						folderLabel: "导出位置",
						fieldsTitle: "导出字段",
						success: "成功导出 {{count}} 个事件到 markdown 文件",
						failure: "导出失败 {{count}} 个事件, 请检查日志",
					},
				},
				actions: {
					handle: "导出选中事件",
				},
				config: {
					fileName: "文件名",
					year: "导出年份",
					id: "ID",
					isoDate: "ISO日期",
					calendar: "日历类型",
					dateArr: "日期数组",
					emoji: "表情符号",
					color: "颜色",
					remark: "备注",
					isHidden: "是否隐藏",
					foundDate: "节日起源时间",
					nextBirthday: "下一次生日",
					age: "年龄",
					animal: "生肖",
					zodiac: "星座",
					isRepeat: "是否重复",
				},
				empty: {
					text: "暂无事件数据",
					subtext: "请先添加一些事件再进行导出操作",
					noDate: "无日期",
					noSelectedEvents: "未选择任何事件",
				},
			},
			import: {
				name: "数据导入",
				actions: {
					reset: "重新选择导入",
					handle: "导入选中事件",
					parseSummary:
						"发现 {{validCount}} 个有效事件, {{invalidCount}} 个无效事件",
				},
				type: {
					json: {
						title: "JSON 文件导入",
						format_example: "有效 JSON 格式范例",
						message:
							"<ul>" +
							"<li>文件必须为 JSON 格式</li>" +
							"<li>事件必须包含 <code>text</code> 和 <code>userInput</code> 字段</li>" +
							"<li>支持 <code>holidays</code>、<code>birthdays</code>、<code>customEvents</code> 三种事件类型</li>" +
							"<ul>",
						upload: "选择",
						paste: "粘贴",
						pastePlaceholder: "在此粘贴 JSON 内容",
						pasteError: "解析错误: {{error}}",
						submitPaste: "解析 JSON",
						success: "成功导入 {{count}} 个事件",
					},
				},
				empty: {
					text: "未找到可导入的事件",
					subtext: "请检查文件内容或文件格式",
				},
				warn: {
					invalidEvents: "无效事件",
					nullText: "缺少事件名称",
					nullDate: "缺少用户输入的日期",
					duplicateEvent: "该事件可能已存在",
				},
			},
		},
	},
	command: {
		openYearlyGlance: "打开年度概览",
		openGlanceManager: "打开概览管理",
		addEvent: "添加事件",
		reloadPlugin: "重载插件",
	},
	common: {
		confirm: "确认",
		cancel: "取消",
	},
	data: {
		sampleEvent: {
			text: "安装 YG 插件",
			remark: "欢迎使用 Yearly Glance 插件！这是一个示例事件。请根据需要隐藏或删除。",
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
			red: "红色",
			orange: "橙色",
			yellow: "黄色",
			green: "绿色",
			blue: "蓝色",
			purple: "紫色",
			brown: "棕色",
		},
	},
};

export default translations;
