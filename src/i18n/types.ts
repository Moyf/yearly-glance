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
		};
		events: {
			name: string;
			desc: string;
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
			};
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
				eventEmoji: string;
				eventColor: string;
				eventRemark: string;
				save: string;
				cancel: string;
				reset: string;
				eventDateHelp: string;
			};
			holiday: {
				name: string;
				type: string;
				isShow: string;
				foundDate: string;
				internat: string;
				custom: string;
			};
			birthday: {
				name: string;
				age: string;
				nextBirthday: string;
				animal: string;
				zodiac: string;
			};
			customEvent: {
				name: string;
				repeat: string;
			};
		};
	};
	command: {
		openYearlyGlance: string;
		openEventManager: string;
		addEvent: string;
	};
	common: {
		confirm: string;
		cancel: string;
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
