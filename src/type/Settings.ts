import { SelectOption } from "@/src/components/Base/Select";
import { t } from "@/src/i18n/i18n";
import { IsoUtils } from "@/src/utils/isoUtils";

export const LAYOUT_OPTIONS = ["12x1", "1x12", "6x2", "2x6", "3x4", "4x3"];
export const VIEW_TYPE_OPTIONS = ["calendar", "list"];
export const EVENT_FONT_SIZE_OPTIONS = ["small", "medium", "large"];

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

// Frontmatter 配置接口
export interface IFrontmatterConfig {
	enabled: boolean;
	folderPath: string;
	recursive: boolean;
	propertyNames: {
		title: string;
		eventDate: string;
		endDate?: string;
		durationDays?: string;
		description?: string;
		icon?: string;
		color?: string;
		hidden?: string;
		calendar?: string;
	};
	showBasesEvents: boolean; // 是否显示从 frontmatter 读取的事件
}

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
	showBasesEvents: boolean; // 是否显示 Bases 事件
	mondayFirst: boolean; // 是否以周一为一周的第一天
	title: string; // 年历标题
	showEmojiBeforeTabName: boolean; // 是否在标签名称前显示emoji
	showTooltips: boolean; // 是否显示提示
	colorful: boolean; // 是否多彩
	showLunarDay: boolean; // 是否显示农历日
	showDebugInfo: boolean; // 是否显示调试信息
	presetColors: IPresetColor[];
	// 日历视图设置
	emojiOnTop: boolean; // 是否在事件上方显示emoji（仅日历视图）
	wrapEventText: boolean; // 是否换行显示事件文本
	gregorianDisplayFormat: (typeof GREGORIAN_DISPLAY_FORMAT_OPTIONS)[number]["value"]; // 公历显示格式
	// Frontmatter 设置
	frontmatter: IFrontmatterConfig;
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
	showBasesEvents: true,
	mondayFirst: true,
	title: "",
	showEmojiBeforeTabName: true,
	showTooltips: true,
	colorful: false,
	showLunarDay: false,
	showDebugInfo: false,
	presetColors: DEFAULT_PRESET_COLORS,
	emojiOnTop: false, // 默认在左侧显示emoji
	wrapEventText: false,
	gregorianDisplayFormat: "YYYY-MM-DD", // 默认使用ISO格式
	// Frontmatter 默认设置
	frontmatter: {
		enabled: false,
		folderPath: "",
		recursive: true,
		propertyNames: {
			title: "title",
			eventDate: "event_date",
			endDate: "end_date",
			durationDays: "duration_days",
			description: "description",
			icon: "icon",
			color: "color",
			hidden: "hidden",
			calendar: "calendar",
		},
		showBasesEvents: true,
	},
};
