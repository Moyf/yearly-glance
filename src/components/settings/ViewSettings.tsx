import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import { useYearlyGlanceConfig } from "@/src/core/hook/useYearlyGlanceConfig";
import {
	EVENT_FONT_SIZE_OPTIONS,
	LAYOUT_OPTIONS,
	VIEW_TYPE_OPTIONS,
} from "@/src/core/interfaces/Settings";
import { t } from "@/src/i18n/i18n";
import { SettingsBlock } from "@/src/components/Settings/SettingsBlock";
import { SettingsItem } from "@/src/components/Settings/SettingsItem";
import { Toggle } from "@/src/components/Base/Toggle";
import { Select } from "@/src/components/Base/Select";
import { Input } from "@/src/components/Base/Input";

interface ViewSettingsProps {
	plugin: YearlyGlancePlugin;
}

export const layoutOptions = LAYOUT_OPTIONS.map((layout) => ({
	value: layout,
	label: layout,
}));
export const viewTypeOptions = VIEW_TYPE_OPTIONS.map((viewType) => ({
	value: viewType,
	label: t(`setting.general.viewType.options.${viewType}` as any),
}));
export const eventFontSizeOptions = EVENT_FONT_SIZE_OPTIONS.map(
	(eventFontSize) => ({
		value: eventFontSize,
		label: t(
			`setting.general.eventFontSize.options.${eventFontSize}` as any
		),
	})
);

export const ViewSettings: React.FC<ViewSettingsProps> = ({ plugin }) => {
	const { config, updateConfig } = useYearlyGlanceConfig(plugin);

	const handleUpdateConfig = async (
		updates: Partial<YearlyGlanceConfig["config"]>
	) => {
		await updateConfig(updates);
	};

	return (
		<SettingsBlock
			name={t("setting.general.name")}
			desc={t("setting.general.desc")}
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
					onChange={(value) => handleUpdateConfig({ title: value })}
				/>
			</SettingsItem>
			{/* 布局 */}
			<SettingsItem
				name={t("setting.general.layout.name")}
				desc={t("setting.general.layout.desc")}
			>
				<Select
					options={layoutOptions}
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
			{/* 多彩 */}
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
	);
};
