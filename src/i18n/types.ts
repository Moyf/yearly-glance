import en from "./locales/en";
import zh from "./locales/zh";
import zhTW from "./locales/zh-TW";

// 定义支持的语言类型
export const SupportedLocales: Record<string, BaseMessage> = {
	en,
	zh,
	"zh-TW": zhTW,
};

// 定义翻译结构类型
export type BaseMessage = {
	setting: {
		title: string;
		desc: string;
		general: {
			name: string;
			desc: string;
			title: {
				name: string;
				desc: string;
			};
			layout: {
				name: string;
				desc: string;
			};
			viewType: {
				name: string;
				desc: string;
				options: {
					calendar: string;
					list: string;
				};
			};
			showWeekdays: {
				name: string;
				desc: string;
			};
			highlightToday: {
				name: string;
				desc: string;
			};
			highlightWeekends: {
				name: string;
				desc: string;
			};
			showLegend: {
				name: string;
				desc: string;
			};
			limitListHeight: {
				name: string;
				desc: string;
			};
			eventFontSize: {
				name: string;
				desc: string;
				options: {
					small: string;
					medium: string;
					large: string;
				};
			};
			showHolidays: {
				name: string;
				desc: string;
			};
			showBirthdays: {
				name: string;
				desc: string;
			};
			showCustomEvents: {
				name: string;
				desc: string;
			};
			mondayFirst: {
				name: string;
				desc: string;
			};
			showTooltips: {
				name: string;
				desc: string;
			};
			colorful: {
				name: string;
				desc: string;
			};
			showLunarDay: {
				name: string;
				desc: string;
			};
			showDebugInfo: {
				name: string;
				desc: string;
			};
		};
		events: {
			name: string;
			desc: string;
		};
		group: {
			basic: string;
			basicDesc: string;
			layout: string;
			layoutDesc: string;
			displayContent: string;
			displayContentDesc: string;
			eventDisplay: string;
			eventDisplayDesc: string;
		};
	};
	view: {
		yearlyGlance: {
			name: string;
			yearlyCalendar: string;
			legend: {
				holiday: string;
				birthday: string;
				customEvent: string;
			};
			viewPreset: {
				yearOverview: string;
				classicCalendar: string;
				custom: string;
			};
			actions: {
				clickToShow: string;
				clickToHide: string;
				form: string;
				manager: string;
				limitListHeight: string;
				hideEmptyDates: string;
			};
		};
		eventManager: {
			name: string;
			solar: string;
			lunar: string;
			date: string;
			actions: {
				add: string;
				edit: string;
				delete: string;
				search: string;
				clearSearch: string;
				yearlyCalendar: string;
				deleteConfirm: string;
				location: string;
				toggleBuiltinEventHidden: string;
				sort: {
					name: string;
					date: string;
					asc: string;
					desc: string;
				};
			};
			empty: {
				text: string;
				subtext: string;
			};
			form: {
				edit: string;
				add: string;
				eventType: string;
				eventName: string;
				eventDate: string;
				eventDateType: string;
				optional: string;
				eventRepeat: string;
				eventHidden: string;
				eventEmoji: string;
				eventColor: string;
				eventRemark: string;
				save: string;
				cancel: string;
				submit: string;
				reset: string;
				eventDateHelp: string;
				selectDateType: string;
				previousDate: string;
				nextDate: string;
				year: string;
				month: string;
				day: string;
			};
			holiday: {
				name: string;
				type: string;
				foundDate: string;
				builtin: string;
				custom: string;
			};
			birthday: {
				name: string;
				age: string;
				nextBirthday: string;
				animal: string;
				zodiac: string;
				noYear: string;
			};
			customEvent: {
				name: string;
				repeat: string;
			};
		};
		importExportManager: {
			import: {
				title: string;
				tab: string;
			};
			export: {
				title: string;
				tab: string;
			};
		};
	};
	command: {
		openYearlyGlance: string;
		openEventManager: string;
		addEvent: string;
		reloadPlugin: string;
		importExportEvents: string;
	};
	common: {
		confirm: string;
		cancel: string;
	};
	data: {
		month: {
			jan: string;
			feb: string;
			mar: string;
			apr: string;
			may: string;
			jun: string;
			jul: string;
			aug: string;
			sep: string;
			oct: string;
			nov: string;
			dec: string;
		};
		week: {
			sun: string;
			mon: string;
			tue: string;
			wed: string;
			thu: string;
			fri: string;
			sat: string;
		};
		animal: {
			rat: string; // 鼠
			ox: string; // 牛
			tiger: string; // 虎
			rabbit: string; // 兔
			dragon: string; // 龙
			snake: string; // 蛇
			horse: string; // 马
			sheep: string; // 羊
			monkey: string; // 猴
			rooster: string; // 鸡
			dog: string; // 狗
			pig: string; // 猪
		};
		zodiac: {
			aries: string; // 白羊座
			taurus: string; // 金牛座
			gemini: string; // 双子座
			cancer: string; // 巨蟹座
			leo: string; // 狮子座
			virgo: string; // 处女座
			libra: string; // 天秤座
			scorpio: string; // 天蝎座
			sagittarius: string; // 射手座
			capricorn: string; // 摩羯座
			aquarius: string; // 水瓶座
			pisces: string; // 双鱼座
		};
		gan: {
			jia: string; // 甲
			yi: string; // 乙
			bing: string; // 丙
			ding: string; // 丁
			wu: string; // 戊
			ji: string; // 己
			geng: string; // 庚
			xin: string; // 辛
			ren: string; // 壬
			gui: string; // 癸
		};
		zhi: {
			zi: string; // 子
			chou: string; // 丑
			yin: string; // 寅
			mao: string; // 卯
			chen: string; // 辰
			si: string; // 巳
			wu: string; // 午
			wei: string; // 未
			shen: string; // 申
			you: string; // 酉
			xu: string; // 戌
			hai: string; // 亥
		};
	};
};

// 生成所有可能的翻译键路径类型
type PathsToStringProps<T> = T extends string
	? []
	: {
			[K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
	  }[Extract<keyof T, string>];

// 将路径数组转换为点号分隔的字符串
type JoinPath<T extends string[]> = T extends []
	? never
	: T extends [infer F]
	? F extends string
		? F
		: never
	: T extends [infer F, ...infer R]
	? F extends string
		? R extends string[]
			? `${F}.${JoinPath<R>}`
			: never
		: never
	: never;

// 生成所有可能的翻译键
export type TranslationKeys = JoinPath<PathsToStringProps<BaseMessage>>;

// 参数类型定义
export type TranslationParams = Record<string, any> | any[];
