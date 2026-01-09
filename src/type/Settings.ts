import { SelectOption } from "@/src/components/Base/Select";
import { t } from "@/src/i18n/i18n";
import { IsoUtils } from "@/src/utils/isoUtils";

export const LAYOUT_OPTIONS = ["12x1", "1x12", "6x2", "2x6", "3x4", "4x3"];
export const VIEW_TYPE_OPTIONS = ["calendar", "list"];
export const EVENT_FONT_SIZE_OPTIONS = ["small", "medium", "large"];

// 图标显示选项
export const ICON_DISPLAY_OPTIONS = ["none", "lucide", "emoji"] as const;
export type IconDisplayOption = typeof ICON_DISPLAY_OPTIONS[number];

// 公历日期显示格式选项
export const GREGORIAN_DISPLAY_FORMAT_OPTIONS: SelectOption[] = [
	{
		label: t("setting.general.gregorianDisplayFormat.options.iso"),
		value: "YYYY-MM-DD",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.usSlash"),
		value: "MM/DD/YYYY",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.euSlash"),
		value: "DD/MM/YYYY",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.jpSlash"),
		value: "YYYY/MM/DD",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.deDot"),
		value: "DD.MM.YYYY",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.usDash"),
		value: "MM-DD-YYYY",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.euDash"),
		value: "DD-MM-YYYY",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.chinese"),
		value: "YYYY年MM月DD日",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.enShortMdy"),
		value: "MMM DD, YYYY",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.enShortDmy"),
		value: "DD MMM YYYY",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.enFullMdy"),
		value: "MMMM DD, YYYY",
	},
	{
		label: t("setting.general.gregorianDisplayFormat.options.enFullDmy"),
		value: "DD MMMM YYYY",
	},
];

interface LayoutConfig {
	rows: number;
	cols: number;
}

export interface IPresetColor {
	label: string;
	value: any;
	enable: boolean;
	id?: string;
}

export const LayoutConfigMap: Record<string, LayoutConfig> =
	LAYOUT_OPTIONS.reduce((acc, layout) => {
		const [rows, cols] = layout.split("x").map(Number);
		acc[layout] = { rows, cols };
		return acc;
	}, {});

export const DEFAULT_PRESET_COLORS: IPresetColor[] = [
	{ label: "", value: "#FF2D55", enable: true, id: "red" },
	{ label: "", value: "#FF9500", enable: true, id: "orange" },
	{ label: "", value: "#FFCC00", enable: true, id: "yellow" },
	{ label: "", value: "#65DB39", enable: true, id: "green" },
	{ label: "", value: "#34AADC", enable: true, id: "blue" },
	{ label: "", value: "#CC73E1", enable: true, id: "purple" },
	{ label: "", value: "#A2845E", enable: true, id: "brown" },
];

// 插件设置接口
export interface YearlyGlanceSettings {
	year: number; // 当前选择的年份
	layout: (typeof LAYOUT_OPTIONS)[number]; // 布局方式
	viewType: (typeof VIEW_TYPE_OPTIONS)[number]; // 视图类型
	showWeekdays: boolean; // 是否显示周几
	highlightToday: boolean; // 是否高亮今天
	highlightWeekends: boolean; // 是否高亮周末
	showLegend: boolean; // 是否显示图例
	limitListHeight: boolean; // 是否限制列表高度
	hideEmptyDates: boolean; // 是否隐藏空日期
	eventFontSize: (typeof EVENT_FONT_SIZE_OPTIONS)[number]; // 事件字体大小
	showHolidays: boolean; // 是否显示节假日
	showBirthdays: boolean; // 是否显示生日
	showCustomEvents: boolean; // 是否显示自定义事件
	showBasesEvents: boolean; // 是否显示笔记事件
	mondayFirst: boolean; // 是否以周一为一周的第一天
	title: string; // 年历标题
	showEmojiBeforeTabName: IconDisplayOption; // 标签图标显示方式
	showTooltips: boolean; // 是否显示提示
	colorful: boolean; // 是否多彩
	showLunarDay: boolean; // 是否显示农历日
	showDebugInfo: boolean; // 是否显示调试信息
	presetColors: IPresetColor[];
	// 日历视图设置
	emojiOnTop: boolean; // 是否在事件上方显示emoji（仅日历视图）
	wrapEventText: boolean; // 是否换行显示事件文本
	gregorianDisplayFormat: (typeof GREGORIAN_DISPLAY_FORMAT_OPTIONS)[number]["value"]; // 公历显示格式
	// 笔记事件设置
	defaultBasesEventPath?: string; // 默认笔记事件路径
	basesEventTitleProp?: string; // 笔记事件标题属性名
	basesEventDateProp?: string; // 笔记事件日期属性名
	basesEventDurationProp?: string; // 笔记事件持续天数属性名
	basesEventIconProp?: string; // 笔记事件图标属性名
	basesEventColorProp?: string; // 笔记事件颜色属性名
	basesEventDescriptionProp?: string; // 笔记事件描述属性名
	dataVersion?: number; // 数据版本号，用于强制刷新笔记事件
}

export const DEFAULT_SETTINGS: YearlyGlanceSettings = {
	year: IsoUtils.getCurrentYear(), // 使用时区安全的方法获取当前年份
	layout: "2x6",
	viewType: "list",
	showWeekdays: true,
	highlightToday: true,
	highlightWeekends: true,
	showLegend: true,
	limitListHeight: false,
	hideEmptyDates: false,
	eventFontSize: "medium",
	showHolidays: true,
	showBirthdays: true,
	showCustomEvents: true,
	showBasesEvents: true, // 默认显示笔记事件
	mondayFirst: true,
	title: "",
	showEmojiBeforeTabName: "emoji",
	showTooltips: true,
	colorful: false,
	showLunarDay: false,
	showDebugInfo: false,
	presetColors: DEFAULT_PRESET_COLORS,
	emojiOnTop: false, // 默认在左侧显示emoji
	wrapEventText: false,
	gregorianDisplayFormat: "YYYY-MM-DD", // 默认使用ISO格式
	defaultBasesEventPath: "", // 默认笔记事件路径为空（根目录）
	basesEventTitleProp: "title", // 默认标题属性名
	basesEventDateProp: "event_date", // 默认日期属性名
	basesEventDurationProp: "duration_days", // 默认持续天数属性名
	basesEventIconProp: "icon", // 默认图标属性名
	basesEventColorProp: "color", // 默认颜色属性名
	basesEventDescriptionProp: "description", // 默认描述属性名
	dataVersion: 0, // 初始版本号为 0
};
