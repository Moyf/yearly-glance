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
	eventFontSize: (typeof EVENT_FONT_SIZE_OPTIONS)[number]; // 事件字体大小
	showHolidays: boolean; // 是否显示节假日
	showBirthdays: boolean; // 是否显示生日
	showCustomEvents: boolean; // 是否显示自定义事件
	mondayFirst: boolean; // 是否以周一为一周的第一天
	title: string | null; // 年历标题
	showTooltips: boolean; // 是否显示提示
	colorful: boolean; // 是否多彩
}

export const DEFAULT_SETTINGS: YearlyGlanceSettings = {
	year: new Date().getFullYear(),
	layout: "4x3",
	viewType: "calendar",
	showWeekdays: true,
	highlightToday: true,
	highlightWeekends: true,
	showLegend: true,
	limitListHeight: true,
	eventFontSize: "medium",
	showHolidays: true,
	showBirthdays: true,
	showCustomEvents: true,
	mondayFirst: true,
	title: null,
	showTooltips: true,
	colorful: false,
};

export const LAYOUT_OPTIONS = ["12x1", "1x12", "6x2", "2x6", "3x4", "4x3"];
export const VIEW_TYPE_OPTIONS = ["calendar", "list"];
export const EVENT_FONT_SIZE_OPTIONS = ["small", "medium", "large"];
