import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/type/Config";
import { useYearlyGlanceConfig } from "@/src/hooks/useYearlyGlanceConfig";
import {
	EVENT_CLICK_ACTION_OPTIONS,
	EVENT_FONT_SIZE_OPTIONS,
	GREGORIAN_DISPLAY_FORMAT_OPTIONS,
	ICON_DISPLAY_OPTIONS,
	LAYOUT_OPTIONS,
	VIEW_TYPE_OPTIONS,
} from "@/src/type/Settings";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import { SettingsBlock } from "@/src/components/Settings/SettingsBlock";
import { SettingsItem } from "@/src/components/Settings/SettingsItem";
import { Toggle } from "@/src/components/Base/Toggle";
import { Select } from "@/src/components/Base/Select";
import { Input } from "@/src/components/Base/Input";
import { FolderAutoComplete } from "@/src/components/Base/FolderAutoComplete";
import { IsoUtils } from "@/src/utils/isoUtils";
import { previewNoteEventPath } from "@/src/utils/notePathFormat";
import { PresetColorSettings } from "./PresetColorSettings";
import { PresetEventTypeSettings } from "./PresetEventTypeSettings";
import { NavTabs } from "@/src/components/Base/NavTabs";
import { CustomEmojiKeywordsEditor } from "./CustomEmojiKeywordsEditor";

interface ViewSettingsProps {
	plugin: YearlyGlancePlugin;
}

export const getLayoutOptions = (viewType: string) => {
	const filteredLayouts =
		viewType === "list" || viewType === "calendar"
			? LAYOUT_OPTIONS
			: LAYOUT_OPTIONS.filter((layout) => layout !== "1x12");
	return filteredLayouts.map((layout) => ({ value: layout, label: layout }));
};
export const viewTypeOptions = VIEW_TYPE_OPTIONS.map((viewType) => ({
	value: viewType,
	label: t(`setting.general.viewType.options.${viewType}` as TranslationKeys),
}));
export const eventFontSizeOptions = EVENT_FONT_SIZE_OPTIONS.map((eventFontSize) => ({
	value: eventFontSize,
	label: t(`setting.general.eventFontSize.options.${eventFontSize}` as TranslationKeys),
}));
export const iconDisplayOptions = ICON_DISPLAY_OPTIONS.map((option) => ({
	value: option,
	label: t(`setting.general.showEmojiBeforeTabName.options.${option}` as TranslationKeys),
}));
export const eventClickActionOptions = EVENT_CLICK_ACTION_OPTIONS.map((option) => ({
	value: option,
	label: t(`setting.general.eventClickAction.options.${option}` as TranslationKeys),
}));

type SettingsTabKey = "basic" | "style" | "noteEvents" | "dailyNoteEvents" | "presets";

export const ViewSettings: React.FC<ViewSettingsProps> = ({ plugin }) => {
	const { config, updateConfig } = useYearlyGlanceConfig(plugin);
	const [activeSettingsTab, setActiveSettingsTab] = React.useState<SettingsTabKey>("basic");
	// 记忆颜色预设折叠状态
	const [colorPresetsCollapsed, setColorPresetsCollapsed] = React.useState(true);

	const basesEventFilePreview = previewNoteEventPath(
		config.defaultBasesEventPath || "",
		config.basesEventFileNameFormat || "YYYY/{event_name}",
		"MyEvent",
		IsoUtils.getTodayLocalDateString()
	);

	const handleUpdateConfig = (updates: Partial<YearlyGlanceConfig["config"]>) => {
		void updateConfig({ ...config, ...updates });
	};

	const settingsTabs = [
		{ label: t("setting.group.basic.name"), value: "basic" },
		{ label: t("setting.group.style.name" as TranslationKeys), value: "style" },
		{ label: t("setting.group.basesEvent.name"), value: "noteEvents" },
		{ label: t("setting.group.dailyNoteEvent.name"), value: "dailyNoteEvents" },
		{ label: t("setting.group.presets.name" as TranslationKeys), value: "presets" },
	];

	const renderTabContent = () => {
		switch (activeSettingsTab) {
			case "basic":
				return (
					<>
						{/* 通用设置分组 */}
						<SettingsBlock
							name={t("setting.group.basic.name")}
							desc={t("setting.group.basic.desc")}
							collapsible
							defaultCollapsed={false}
						>
							{/* 年历标题 */}
							<SettingsItem name={t("setting.general.title.name")} desc={t("setting.general.title.desc")}>
								<Input type="text" value={config.title} onChange={(value) => handleUpdateConfig({ title: value })} />
							</SettingsItem>
							{/* 显示周几 */}
							<SettingsItem name={t("setting.general.showWeekdays.name")} desc={t("setting.general.showWeekdays.desc")}>
								<Toggle checked={config.showWeekdays} onChange={(value) => handleUpdateConfig({ showWeekdays: value })} />
							</SettingsItem>
							{/* 周一作为第一天 */}
							<SettingsItem name={t("setting.general.mondayFirst.name")} desc={t("setting.general.mondayFirst.desc")}>
								<Toggle checked={config.mondayFirst} onChange={(value) => handleUpdateConfig({ mondayFirst: value })} />
							</SettingsItem>
							{/* 标签图标显示方式 */}
							<SettingsItem name={t("setting.general.showEmojiBeforeTabName.name")} desc={t("setting.general.showEmojiBeforeTabName.desc")}>
								<Select options={iconDisplayOptions} value={config.showEmojiBeforeTabName} onValueChange={(value) => handleUpdateConfig({ showEmojiBeforeTabName: value })} />
							</SettingsItem>
							{/* 事件点击操作 */}
							<SettingsItem name={t("setting.general.eventClickAction.name")} desc={t("setting.general.eventClickAction.desc")}>
								<Select options={eventClickActionOptions} value={config.eventClickAction} onValueChange={(value) => handleUpdateConfig({ eventClickAction: value })} />
							</SettingsItem>
							{/* 显示农历日 */}
							<SettingsItem name={t("setting.general.showLunarDay.name")} desc={t("setting.general.showLunarDay.desc")}>
								<Toggle checked={config.showLunarDay} onChange={(value) => handleUpdateConfig({ showLunarDay: value })} />
							</SettingsItem>
							{/* 公历日期显示格式 */}
							<SettingsItem name={t("setting.general.gregorianDisplayFormat.name")} desc={t("setting.general.gregorianDisplayFormat.desc")}>
								<Select options={GREGORIAN_DISPLAY_FORMAT_OPTIONS} value={config.gregorianDisplayFormat} onValueChange={(value) => handleUpdateConfig({ gregorianDisplayFormat: value })} />
							</SettingsItem>
						</SettingsBlock>

						{/* 布局相关设置分组 */}
						<SettingsBlock
							name={t("setting.group.layout.name" as TranslationKeys)}
							desc={t("setting.group.layout.desc" as TranslationKeys)}
							collapsible
							defaultCollapsed={false}
						>
							{/* 布局 */}
							<SettingsItem name={t("setting.general.layout.name")} desc={t("setting.general.layout.desc")}>
								<Select options={getLayoutOptions(config.viewType)} value={config.layout} onValueChange={(value) => handleUpdateConfig({ layout: value })} />
							</SettingsItem>
							{/* 视图类型 */}
							<SettingsItem name={t("setting.general.viewType.name")} desc={t("setting.general.viewType.desc")}>
								<Select options={viewTypeOptions} value={config.viewType} onValueChange={(value) => handleUpdateConfig({ viewType: value })} />
							</SettingsItem>
						</SettingsBlock>
					</>
				);

			case "style":
				return (
					<>
						{/* 样式设置 */}
						<SettingsBlock
							name={t("setting.group.style.name" as TranslationKeys)}
							desc={t("setting.group.style.desc" as TranslationKeys)}
							collapsible
							defaultCollapsed={false}
						>
							{/* 高亮今天 */}
							<SettingsItem name={t("setting.general.highlightToday.name")} desc={t("setting.general.highlightToday.desc")}>
								<Toggle checked={config.highlightToday} onChange={(value) => handleUpdateConfig({ highlightToday: value })} />
							</SettingsItem>
							{/* 高亮周末 */}
							<SettingsItem name={t("setting.general.highlightWeekends.name")} desc={t("setting.general.highlightWeekends.desc")}>
								<Toggle checked={config.highlightWeekends} onChange={(value) => handleUpdateConfig({ highlightWeekends: value })} />
							</SettingsItem>
							{/* 显示图例 */}
							<SettingsItem name={t("setting.general.showLegend.name")} desc={t("setting.general.showLegend.desc")}>
								<Toggle checked={config.showLegend} onChange={(value) => handleUpdateConfig({ showLegend: value })} />
							</SettingsItem>
							{/* 限制列表高度 */}
							<SettingsItem name={t("setting.general.limitListHeight.name")} desc={t("setting.general.limitListHeight.desc")}>
								<Toggle checked={config.limitListHeight} onChange={(value) => handleUpdateConfig({ limitListHeight: value })} />
							</SettingsItem>
							{/* 显示提示 */}
							<SettingsItem name={t("setting.general.showTooltips.name")} desc={t("setting.general.showTooltips.desc")}>
								<Toggle checked={config.showTooltips} onChange={(value) => handleUpdateConfig({ showTooltips: value })} />
							</SettingsItem>
							{/* 彩色模式 */}
							<SettingsItem name={t("setting.general.colorful.name")} desc={t("setting.general.colorful.desc")}>
								<Toggle checked={config.colorful} onChange={(value) => handleUpdateConfig({ colorful: value })} />
							</SettingsItem>
						</SettingsBlock>

						{/* 事件显示相关设置 */}
						<SettingsBlock
							name={t("setting.group.eventDisplay.name" as TranslationKeys)}
							desc={t("setting.group.eventDisplay.desc" as TranslationKeys)}
							collapsible
							defaultCollapsed={false}
						>
							{/* 事件字体大小 */}
							<SettingsItem name={t("setting.general.eventFontSize.name")} desc={t("setting.general.eventFontSize.desc")}>
								<Select options={eventFontSizeOptions} value={config.eventFontSize} onValueChange={(value) => handleUpdateConfig({ eventFontSize: value })} />
							</SettingsItem>
							{/* 显示节假日 */}
							<SettingsItem name={t("setting.general.showHolidays.name")} desc={t("setting.general.showHolidays.desc")}>
								<Toggle checked={config.showHolidays} onChange={(value) => handleUpdateConfig({ showHolidays: value })} />
							</SettingsItem>
							{/* 显示生日 */}
							<SettingsItem name={t("setting.general.showBirthdays.name")} desc={t("setting.general.showBirthdays.desc")}>
								<Toggle checked={config.showBirthdays} onChange={(value) => handleUpdateConfig({ showBirthdays: value })} />
							</SettingsItem>
							{/* 显示自定义事件 */}
							<SettingsItem name={t("setting.general.showCustomEvents.name")} desc={t("setting.general.showCustomEvents.desc")}>
								<Toggle checked={config.showCustomEvents} onChange={(value) => handleUpdateConfig({ showCustomEvents: value })} />
							</SettingsItem>
						</SettingsBlock>
					</>
				);

			case "noteEvents":
				return (
					<>
						{/* 笔记事件 */}
						<SettingsBlock
							name={t("setting.group.basesEvent.name")}
							desc={t("setting.group.basesEvent.desc")}
							collapsible
							defaultCollapsed={false}
						>
							{/* 默认笔记事件路径 */}
							<SettingsItem name={t("setting.general.defaultBasesEventPath.name")} desc={t("setting.general.defaultBasesEventPath.desc")}>
								<FolderAutoComplete
									value={config.defaultBasesEventPath || ""}
									onChange={(value) => handleUpdateConfig({ defaultBasesEventPath: value })}
									placeholder={t("setting.general.defaultBasesEventPath.placeholder")}
									app={plugin.app}
								/>
							</SettingsItem>
							<SettingsItem name={t("setting.general.showConvertNoteToEventRibbon.name")} desc={t("setting.general.showConvertNoteToEventRibbon.desc")}>
								<Toggle checked={config.showConvertNoteToEventRibbon} onChange={(value) => handleUpdateConfig({ showConvertNoteToEventRibbon: value })} />
							</SettingsItem>
							<SettingsItem
								name={t("setting.general.basesEventFileNameFormat.name")}
								desc={`${t("setting.general.basesEventFileNameFormat.desc")} ${t("setting.general.basesEventFileNameFormat.preview")}: ${basesEventFilePreview}`}
							>
								<Input
									type="text"
									value={config.basesEventFileNameFormat || ""}
									onChange={(value) => handleUpdateConfig({ basesEventFileNameFormat: value })}
									placeholder="YYYY/{event_name}"
								/>
							</SettingsItem>
						</SettingsBlock>

						{/* 笔记属性 */}
						<SettingsBlock
							name={t("setting.group.noteEventProps.name" as TranslationKeys)}
							desc={t("setting.group.noteEventProps.desc" as TranslationKeys)}
							collapsible
							defaultCollapsed={false}
						>
							{/* 标题属性名 */}
							<SettingsItem name={t("setting.general.basesEventTitleProp.name")} desc={t("setting.general.basesEventTitleProp.desc")}>
								<Input type="text" value={config.basesEventTitleProp || ""} onChange={(value) => handleUpdateConfig({ basesEventTitleProp: value })} placeholder={t("setting.general.basesEventTitleProp.placeholder")} />
							</SettingsItem>
							{/* 日期属性名 */}
							<SettingsItem name={t("setting.general.basesEventDateProp.name")} desc={t("setting.general.basesEventDateProp.desc")}>
								<Input type="text" value={config.basesEventDateProp || ""} onChange={(value) => handleUpdateConfig({ basesEventDateProp: value })} placeholder={t("setting.general.basesEventDateProp.placeholder")} />
							</SettingsItem>
							{/* 持续天数属性名 */}
							<SettingsItem name={t("setting.general.basesEventDurationProp.name")} desc={t("setting.general.basesEventDurationProp.desc")}>
								<Input type="text" value={config.basesEventDurationProp || ""} onChange={(value) => handleUpdateConfig({ basesEventDurationProp: value })} placeholder={t("setting.general.basesEventDurationProp.placeholder")} />
							</SettingsItem>
							{/* 图标属性名 */}
							<SettingsItem name={t("setting.general.basesEventIconProp.name")} desc={t("setting.general.basesEventIconProp.desc")}>
								<Input type="text" value={config.basesEventIconProp || ""} onChange={(value) => handleUpdateConfig({ basesEventIconProp: value })} placeholder={t("setting.general.basesEventIconProp.placeholder")} />
							</SettingsItem>
							{/* 颜色属性名 */}
							<SettingsItem name={t("setting.general.basesEventColorProp.name")} desc={t("setting.general.basesEventColorProp.desc")}>
								<Input type="text" value={config.basesEventColorProp || ""} onChange={(value) => handleUpdateConfig({ basesEventColorProp: value })} placeholder={t("setting.general.basesEventColorProp.placeholder")} />
							</SettingsItem>
							{/* 描述属性名 */}
							<SettingsItem name={t("setting.general.basesEventDescriptionProp.name")} desc={t("setting.general.basesEventDescriptionProp.desc")}>
								<Input type="text" value={config.basesEventDescriptionProp || ""} onChange={(value) => handleUpdateConfig({ basesEventDescriptionProp: value })} placeholder={t("setting.general.basesEventDescriptionProp.placeholder")} />
							</SettingsItem>
							{/* 预设类型属性名 */}
							<SettingsItem name={t("setting.general.basesEventPresetTypeProp.name")} desc={t("setting.general.basesEventPresetTypeProp.desc")}>
								<Input type="text" value={config.basesEventPresetTypeProp || ""} onChange={(value) => handleUpdateConfig({ basesEventPresetTypeProp: value })} placeholder={t("setting.general.basesEventPresetTypeProp.placeholder")} />
							</SettingsItem>
						</SettingsBlock>
					</>
				);

			case "dailyNoteEvents":
				return (
					<SettingsBlock
						name={t("setting.group.dailyNoteEvent.name")}
						desc={t("setting.group.dailyNoteEvent.desc")}
						collapsible
						defaultCollapsed={false}
					>
						{/* 启用/禁用开关 */}
						<SettingsItem name={t("setting.general.showDailyNoteEvents.name")} desc={t("setting.general.showDailyNoteEvents.desc")}>
							<Toggle checked={config.showDailyNoteEvents} onChange={(value) => handleUpdateConfig({ showDailyNoteEvents: value })} />
						</SettingsItem>
						{/* 来源选择 */}
						<SettingsItem name={t("setting.general.dailyNoteSource.name")} desc={t("setting.general.dailyNoteSource.desc")}>
							<Select
								value={config.dailyNoteSource}
								options={[
									{ label: t("setting.general.dailyNoteSource.options.dailyNotes"), value: "daily-notes" },
									{ label: t("setting.general.dailyNoteSource.options.periodicNotes"), value: "periodic-notes" },
								]}
								onValueChange={(value) => handleUpdateConfig({ dailyNoteSource: value })}
							/>
						</SettingsItem>
						{/* 事件属性名 */}
						<SettingsItem name={t("setting.general.dailyNoteEventProp.name")} desc={t("setting.general.dailyNoteEventProp.desc")}>
							<Input type="text" value={config.dailyNoteEventProp} placeholder={t("setting.general.dailyNoteEventProp.placeholder")} onChange={(value) => handleUpdateConfig({ dailyNoteEventProp: value })} />
						</SettingsItem>
					</SettingsBlock>
				);

			case "presets":
				return (
					<>
						{/* Emoji 快捷词管理 */}
						<SettingsBlock
							name={t("setting.group.customEmoji.name")}
							desc={t("setting.group.customEmoji.desc")}
							collapsible
							defaultCollapsed={true}
						>
							<SettingsItem
								name={t("setting.general.customEmojiKeywords.name")}
								desc={t("setting.general.customEmojiKeywords.desc")}
							>
								<CustomEmojiKeywordsEditor
									value={config.customEmojiKeywords || {}}
									onChange={(value) =>
										handleUpdateConfig({ customEmojiKeywords: value })
									}
								/>
							</SettingsItem>
						</SettingsBlock>

						{/* 颜色预设 */}
						<SettingsBlock
							name={t("setting.group.colorSets.name")}
							desc={t("setting.group.colorSets.desc")}
							collapsible
							defaultCollapsed={colorPresetsCollapsed}
							onCollapse={(collapsed) => setColorPresetsCollapsed(collapsed)}
						>
							<PresetColorSettings
								presetColors={config.presetColors}
								onChange={(value) => handleUpdateConfig({ presetColors: value })}
							/>
						</SettingsBlock>
						{/* 事件类型预设 */}
						<SettingsBlock
							name={t("setting.general.eventPresetTypes.name")}
							desc={t("setting.general.eventPresetTypes.desc")}
						>
							<PresetEventTypeSettings
								presetTypes={config.eventPresetTypes ?? []}
								onChange={(types) => handleUpdateConfig({ eventPresetTypes: types })}
								plugin={plugin}
							/>
						</SettingsBlock>
					</>
				);

			default:
				return null;
		}
	};

	return (
		<div className="yg-settings-tabs-wrapper">
			<NavTabs
				tabs={settingsTabs}
				activeTab={activeSettingsTab}
				onClick={(tab) => setActiveSettingsTab(tab as SettingsTabKey)}
				className="yg-settings-tab-nav"
			/>
			<div className="yg-settings-tab-content">
				{renderTabContent()}
			</div>
		</div>
	);
};
