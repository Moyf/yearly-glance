import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/type/Config";
import { useYearlyGlanceConfig } from "@/src/hooks/useYearlyGlanceConfig";
import {
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
import { PresetColorSettings } from "./PresetColorSettings";

interface ViewSettingsProps {
	plugin: YearlyGlancePlugin;
}

export const getLayoutOptions = (viewType: string) => {
	// 2025-07-13 还是都加回去吧，横向滚动
	const filteredLayouts =
		viewType === "list" || viewType === "calendar"
			? LAYOUT_OPTIONS
			: LAYOUT_OPTIONS.filter((layout) => layout !== "1x12");

	return filteredLayouts.map((layout) => ({
		value: layout,
		label: layout,
	}));
};
export const viewTypeOptions = VIEW_TYPE_OPTIONS.map((viewType) => ({
	value: viewType,
	label: t(`setting.general.viewType.options.${viewType}` as TranslationKeys),
}));
export const eventFontSizeOptions = EVENT_FONT_SIZE_OPTIONS.map(
	(eventFontSize) => ({
		value: eventFontSize,
		label: t(
			`setting.general.eventFontSize.options.${eventFontSize}` as TranslationKeys
		),
	})
);

export const iconDisplayOptions = ICON_DISPLAY_OPTIONS.map((option) => ({
	value: option,
	label: t(
		`setting.general.showEmojiBeforeTabName.options.${option}` as TranslationKeys
	),
}));

export const ViewSettings: React.FC<ViewSettingsProps> = ({ plugin }) => {
	const { config, updateConfig } = useYearlyGlanceConfig(plugin);

	const handleUpdateConfig = async (
		updates: Partial<YearlyGlanceConfig["config"]>
	) => {
		await updateConfig({ ...config, ...updates });
	};

	return (
		<>
			{/* 基本设置分组 */}
			<SettingsBlock
				name={t("setting.group.basic.name")}
				desc={t("setting.group.basic.desc")}
				collapsible
				defaultCollapsed={false}
			>
				{/* 年历标题 */}
				<SettingsItem
					name={t("setting.general.title.name")}
					desc={t("setting.general.title.desc")}
				>
					<Input
						type="text"
						value={config.title}
						onChange={(value) =>
							handleUpdateConfig({ title: value })
						}
					/>
				</SettingsItem>
				{/* 默认笔记事件路径 */}
				<SettingsItem
					name={t("setting.general.defaultBasesEventPath.name")}
					desc={t("setting.general.defaultBasesEventPath.desc")}
				>
					<FolderAutoComplete
						value={config.defaultBasesEventPath || ""}
						onChange={(value) =>
							handleUpdateConfig({ defaultBasesEventPath: value })
						}
						placeholder={t("setting.general.defaultBasesEventPath.placeholder")}
					/>
				</SettingsItem>
				{/* 显示周几 */}
				<SettingsItem
					name={t("setting.general.showWeekdays.name")}
					desc={t("setting.general.showWeekdays.desc")}
				>
					<Toggle
						checked={config.showWeekdays}
						onChange={(value) =>
							handleUpdateConfig({ showWeekdays: value })
						}
					/>
				</SettingsItem>
				{/* 标签图标显示方式 */}
				<SettingsItem
					name={t("setting.general.showEmojiBeforeTabName.name")}
					desc={t("setting.general.showEmojiBeforeTabName.desc")}
				>
					<Select
						options={iconDisplayOptions}
						value={config.showEmojiBeforeTabName}
						onValueChange={(value) =>
							handleUpdateConfig({
								showEmojiBeforeTabName: value,
							})
						}
					/>
				</SettingsItem>
				{/* 显示农历日 */}
				<SettingsItem
					name={t("setting.general.showLunarDay.name")}
					desc={t("setting.general.showLunarDay.desc")}
				>
					<Toggle
						checked={config.showLunarDay}
						onChange={(value) =>
							handleUpdateConfig({ showLunarDay: value })
						}
					/>
				</SettingsItem>
				{/* 公历日期显示格式 */}
				<SettingsItem
					name={t("setting.general.gregorianDisplayFormat.name")}
					desc={t("setting.general.gregorianDisplayFormat.desc")}
				>
					<Select
						options={GREGORIAN_DISPLAY_FORMAT_OPTIONS}
						value={config.gregorianDisplayFormat}
						onValueChange={(value) =>
							handleUpdateConfig({
								gregorianDisplayFormat: value,
							})
						}
					/>
				</SettingsItem>
			</SettingsBlock>

			{/* 布局相关设置 */}
			<SettingsBlock
				name={t("setting.group.layout.name") as TranslationKeys}
				desc={t("setting.group.layout.desc") as TranslationKeys}
				collapsible
				defaultCollapsed={false}
			>
				{/* 布局 */}
				<SettingsItem
					name={t("setting.general.layout.name")}
					desc={t("setting.general.layout.desc")}
				>
					<Select
						options={getLayoutOptions(config.viewType)}
						value={config.layout}
						onValueChange={(value) =>
							handleUpdateConfig({ layout: value })
						}
					/>
				</SettingsItem>
				{/* 视图类型 */}
				<SettingsItem
					name={t("setting.general.viewType.name")}
					desc={t("setting.general.viewType.desc")}
				>
					<Select
						options={viewTypeOptions}
						value={config.viewType}
						onValueChange={(value) =>
							handleUpdateConfig({ viewType: value })
						}
					/>
				</SettingsItem>
				{/* 周开始日 */}
				<SettingsItem
					name={t("setting.general.mondayFirst.name")}
					desc={t("setting.general.mondayFirst.desc")}
				>
					<Toggle
						checked={config.mondayFirst}
						onChange={(value) =>
							handleUpdateConfig({ mondayFirst: value })
						}
					/>
				</SettingsItem>
			</SettingsBlock>

			{/* 显示内容相关设置 */}
			<SettingsBlock
				name={t("setting.group.displayContent.name") as TranslationKeys}
				desc={t("setting.group.displayContent.desc") as TranslationKeys}
				collapsible
				defaultCollapsed={false}
			>
				{/* 高亮今天 */}
				<SettingsItem
					name={t("setting.general.highlightToday.name")}
					desc={t("setting.general.highlightToday.desc")}
				>
					<Toggle
						checked={config.highlightToday}
						onChange={(value) =>
							handleUpdateConfig({ highlightToday: value })
						}
					/>
				</SettingsItem>
				{/* 高亮周末 */}
				<SettingsItem
					name={t("setting.general.highlightWeekends.name")}
					desc={t("setting.general.highlightWeekends.desc")}
				>
					<Toggle
						checked={config.highlightWeekends}
						onChange={(value) =>
							handleUpdateConfig({ highlightWeekends: value })
						}
					/>
				</SettingsItem>
				{/* 显示图例 */}
				<SettingsItem
					name={t("setting.general.showLegend.name")}
					desc={t("setting.general.showLegend.desc")}
				>
					<Toggle
						checked={config.showLegend}
						onChange={(value) =>
							handleUpdateConfig({ showLegend: value })
						}
					/>
				</SettingsItem>
				{/* 限制列表高度 */}
				<SettingsItem
					name={t("setting.general.limitListHeight.name")}
					desc={t("setting.general.limitListHeight.desc")}
				>
					<Toggle
						checked={config.limitListHeight}
						onChange={(value) =>
							handleUpdateConfig({ limitListHeight: value })
						}
					/>
				</SettingsItem>
				{/* 显示提示 */}
				<SettingsItem
					name={t("setting.general.showTooltips.name")}
					desc={t("setting.general.showTooltips.desc")}
				>
					<Toggle
						checked={config.showTooltips}
						onChange={(value) =>
							handleUpdateConfig({ showTooltips: value })
						}
					/>
				</SettingsItem>
				{/* 彩色模式 */}
				<SettingsItem
					name={t("setting.general.colorful.name")}
					desc={t("setting.general.colorful.desc")}
				>
					<Toggle
						checked={config.colorful}
						onChange={(value) =>
							handleUpdateConfig({ colorful: value })
						}
					/>
				</SettingsItem>
			</SettingsBlock>

			{/* 事件显示相关设置 */}
			<SettingsBlock
				name={t("setting.group.eventDisplay.name") as TranslationKeys}
				desc={t("setting.group.eventDisplay.desc") as TranslationKeys}
				collapsible
				defaultCollapsed={false}
			>
				{/* 事件字体大小 */}
				<SettingsItem
					name={t("setting.general.eventFontSize.name")}
					desc={t("setting.general.eventFontSize.desc")}
				>
					<Select
						options={eventFontSizeOptions}
						value={config.eventFontSize}
						onValueChange={(value) =>
							handleUpdateConfig({ eventFontSize: value })
						}
					/>
				</SettingsItem>
				{/* 显示节假日 */}
				<SettingsItem
					name={t("setting.general.showHolidays.name")}
					desc={t("setting.general.showHolidays.desc")}
				>
					<Toggle
						checked={config.showHolidays}
						onChange={(value) =>
							handleUpdateConfig({ showHolidays: value })
						}
					/>
				</SettingsItem>
				{/* 显示生日 */}
				<SettingsItem
					name={t("setting.general.showBirthdays.name")}
					desc={t("setting.general.showBirthdays.desc")}
				>
					<Toggle
						checked={config.showBirthdays}
						onChange={(value) =>
							handleUpdateConfig({ showBirthdays: value })
						}
					/>
				</SettingsItem>
				{/* 显示自定义事件 */}
				<SettingsItem
					name={t("setting.general.showCustomEvents.name")}
					desc={t("setting.general.showCustomEvents.desc")}
				>
					<Toggle
						checked={config.showCustomEvents}
						onChange={(value) =>
							handleUpdateConfig({ showCustomEvents: value })
						}
					/>
				</SettingsItem>
			</SettingsBlock>

			{/* 颜色设置 */}
			<SettingsBlock
				name={t("setting.group.colorSets.name")}
				desc={t("setting.group.colorSets.desc")}
			>
				{/* 事件颜色预设 */}
				<SettingsItem
					name={t("setting.general.presetColors.name")}
					desc={t("setting.general.presetColors.desc")}
					collapsible
					defaultCollapsed={true}
				>
					<PresetColorSettings
						presetColors={config.presetColors}
						onChange={(value) =>
							handleUpdateConfig({ presetColors: value })
						}
					/>
				</SettingsItem>
			</SettingsBlock>
		</>
	);
};
