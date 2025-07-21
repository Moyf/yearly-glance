import en from "./locales/en";
import zh from "./locales/zh";
import zhTW from "./locales/zh-TW";

// 定义支持的语言类型
export const SupportedLocales: Record<string, BaseMessage> = {
	en,
	zh,
	"zh-TW": zhTW,
};

interface IBaseSettingsItem {
	name: string;
	desc: string;
}
type SettingsItem<T = Record<string, never>> = IBaseSettingsItem & T;

// 定义翻译结构类型
export type BaseMessage = {
	setting: {
		title: string;
		desc: string;
		general: SettingsItem<{
			title: IBaseSettingsItem;
			layout: IBaseSettingsItem;
			viewType: SettingsItem<{
				options: {
					calendar: string;
					list: string;
				};
			}>;
			showWeekdays: IBaseSettingsItem;
			highlightToday: IBaseSettingsItem;
			highlightWeekends: IBaseSettingsItem;
			showLegend: IBaseSettingsItem;
			limitListHeight: IBaseSettingsItem;
			eventFontSize: SettingsItem<{
				options: {
					small: string;
					medium: string;
					large: string;
				};
			}>;
			showHolidays: IBaseSettingsItem;
			showBirthdays: IBaseSettingsItem;
			showCustomEvents: IBaseSettingsItem;
			mondayFirst: IBaseSettingsItem;
			showTooltips: IBaseSettingsItem;
			colorful: IBaseSettingsItem;
			showLunarDay: IBaseSettingsItem;
			showDebugInfo: IBaseSettingsItem;
			presetColors: SettingsItem<{
				newColor: string;
			}>;
			gregorianDisplayFormat: SettingsItem<{
				options: {
					iso: string;
					usSlash: string;
					euSlash: string;
					jpSlash: string;
					deDot: string;
					usDash: string;
					euDash: string;
					chinese: string;
					enShortMdy: string;
					enShortDmy: string;
					enFullMdy: string;
					enFullDmy: string;
				};
			}>;
		}>;
		events: IBaseSettingsItem;
		group: {
			basic: IBaseSettingsItem;
			layout: IBaseSettingsItem;
			displayContent: IBaseSettingsItem;
			eventDisplay: IBaseSettingsItem;
			colorSets: IBaseSettingsItem;
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
				emojiOnTop: string;
				wrapText: string;
				showTooltips: string;
			};
		};
		eventManager: {
			name: string;
			solar: string;
			lunar: string;
			date: string;
			calendar: {
				auto: string;
				gregorian: string;
				lunar: string;
				lunar_leap: string;
			};
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
				eventHidden: string;
				eventEmoji: string;
				eventColor: string;
				eventRemark: string;
				save: string;
				cancel: string;
				submit: string;
				reset: string;
				selectPresetColor: string;
			};
			dateError: {
				emptyDate: string;
				invalidZeroDate: string;
				insufficientDate: string;
				invalidFormatDate: string;
				invalidRangeDate: string;
				unexpectedNumberLength: string;
				invalidLunarDate: string;
				unknownChineseDigit: string;
			};
			help: {
				eventName: string;
				eventDate: string;
				eventDateType: string;
				eventEmoji: string;
				eventColor: string;
				eventHidden: string;
				eventRemark: string;
				customEventRepeat: string;
				holidayFoundDate: string;
			};
			holiday: {
				name: string;
				foundDate: string;
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
		settingsTab: {
			name: string;
		};
	};
	command: {
		openYearlyGlance: string;
		openEventManager: string;
		openSettingsView: string;
		addEvent: string;
		reloadPlugin: string;
	};
	common: {
		confirm: string;
		cancel: string;
	};
	data: {
		sampleEvent: {
			text: string;
			remark: string;
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
		color: {
			red: string;
			orange: string;
			yellow: string;
			green: string;
			blue: string;
			purple: string;
			brown: string;
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
