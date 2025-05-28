export const LAYOUT_OPTIONS = ["12x1", "1x12", "6x2", "2x6", "3x4", "4x3"];
export const VIEW_TYPE_OPTIONS = ["calendar", "list"];
export const EVENT_FONT_SIZE_OPTIONS = ["small", "medium", "large"];

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
	mondayFirst: boolean; // 是否以周一为一周的第一天
	title: string; // 年历标题
	showTooltips: boolean; // 是否显示提示
	colorful: boolean; // 是否多彩
	showLunarDay: boolean; // 是否显示农历日
	showDebugInfo: boolean; // 是否显示调试信息
	presetColors: IPresetColor[];
}

export const DEFAULT_SETTINGS: YearlyGlanceSettings = {
	year: new Date().getFullYear(),
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
	mondayFirst: true,
	title: "",
	showTooltips: true,
	colorful: false,
	showLunarDay: false,
	showDebugInfo: false,
	presetColors: DEFAULT_PRESET_COLORS,
};
