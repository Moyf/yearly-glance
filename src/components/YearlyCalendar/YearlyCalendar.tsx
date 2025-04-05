import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "@/src/main";
import { VIEW_TYPE_EVENT_MANAGER } from "@/src/views/EventManagerView";
import { useYearlyGlanceConfig } from "@/src/core/hook/useYearlyGlanceConfig";
import {
	EVENT_TYPE_DEFAULT,
	EVENT_TYPE_LIST,
} from "@/src/core/interfaces/Events";
import { layoutOptions, viewTypeOptions } from "../settings/ViewSettings";
import { LayoutConfigMap } from "@/src/core/interfaces/Settings";
import { useYearlyCalendar } from "@/src/core/hook/useYearlyCalendar";
import { Select } from "../base/Select";
import { t } from "@/src/i18n/i18n";
import "./style/YearlyCalendarView.css";

interface YearlyCalendarViewProps {
	plugin: YearlyGlancePlugin;
}

const YearlyCalendarView: React.FC<YearlyCalendarViewProps> = ({ plugin }) => {
	const { config, updateConfig, events } = useYearlyGlanceConfig(plugin);

	const {
		year,
		title,
		layout,
		viewType,
		showLegend,
		limitListHeight,
		eventFontSize,
		showTooltips,
		colorful,
		showHolidays,
		showBirthdays,
		showCustomEvents,
	} = config;

	const { monthsData, weekdays, today } = useYearlyCalendar(plugin);

	const calendarRef = React.useRef<HTMLDivElement>(null);

	const handleEventManager = () => {
		plugin.openPluginView(VIEW_TYPE_EVENT_MANAGER);
	};
	const handleEventForm = () => {
		plugin.openEventForm("holiday", {}, false, true);
	};

	// 渲染单个月份
	const renderMonth = (monthIndex: number) => {
		const monthData = monthsData[monthIndex];
		const fontSizeClass = ` font-${eventFontSize}`;

		return (
			<div
				className={`month-container${
					colorful ? " colorful-month" : ""
				}`}
			>
				<div
					className={`month-header${
						monthData.isCurrentMonth ? " current-month" : ""
					}`}
				>
					{monthData.name}
				</div>
			</div>
		);
	};

	return (
		<div className="yearly-calendar" ref={calendarRef}>
			{/* 标题 */}
			<div className="yearly-calendar-title">
				{title === "" ? `${year}年 年历` : title}
			</div>
			{/* actionsBar */}
			<div className="yearly-calendar-actions-bar">
				{/* 图例 */}
				{showLegend && (
					<div className="event-legend">
						{EVENT_TYPE_LIST.filter(
							(type) =>
								(type === "holiday" && showHolidays) ||
								(type === "birthday" && showBirthdays) ||
								(type === "customEvent" && showCustomEvents)
						).map((type) => (
							<div className="legend-item" key={type}>
								<span
									className="legend-icon"
									style={{
										color: EVENT_TYPE_DEFAULT[type].color,
										backgroundColor: `${EVENT_TYPE_DEFAULT[type].color}20`,
									}}
								>
									{EVENT_TYPE_DEFAULT[type].emoji}
								</span>
								<span className="legend-text">
									{t(
										`view.yearlyGlance.legend.${type}` as any
									)}
								</span>
							</div>
						))}
					</div>
				)}
				{/* 布局选择 */}
				<Select
					options={layoutOptions}
					value={layout}
					onValueChange={(value) => updateConfig({ layout: value })}
				/>
				{/* 视图选择 */}
				<Select
					options={viewTypeOptions}
					value={viewType}
					onValueChange={(value) => updateConfig({ viewType: value })}
				/>
				{/* 事件管理 */}
				<button
					className="event-manager-button"
					onClick={handleEventManager}
				>
					<span className="button-icon">🚧</span>
				</button>
				{/* 事件添加 */}
				<button className="event-form-button" onClick={handleEventForm}>
					<span className="button-icon">➕</span>
				</button>
			</div>
			{/* 日历网格 */}
			{viewType === "calendar" && (
				<div className={`calendar-grid layout-${layout}`}>
					{Array.from(
						{ length: LayoutConfigMap[layout].rows },
						(_, row) => (
							<div key={row} className="month-row">
								{Array.from(
									{ length: LayoutConfigMap[layout].cols },
									(_, col) => {
										const monthIndex =
											row * LayoutConfigMap[layout].cols +
											col;
										return (
											<>
												{monthIndex < 12 && (
													<React.Fragment
														key={monthIndex}
													>
														{renderMonth(
															monthIndex
														)}
													</React.Fragment>
												)}
											</>
										);
									}
								)}
							</div>
						)
					)}
				</div>
			)}
			{/* 列表视图 */}
			{viewType === "list" && <></>}
		</div>
	);
};

export class YearlyCalendar {
	private container: HTMLElement;
	private root: Root | null = null;
	private plugin: YearlyGlancePlugin;

	constructor(container: HTMLElement, plugin: YearlyGlancePlugin) {
		this.container = container;
		this.plugin = plugin;
	}

	async initialize(plugin: YearlyGlancePlugin) {
		this.plugin = plugin;
		this.container.empty();
		this.root = createRoot(this.container);
		this.render();
	}

	render() {
		if (this.root) {
			this.root.render(
				<React.StrictMode>
					<YearlyCalendarView plugin={this.plugin} />
				</React.StrictMode>
			);
		}
	}

	destroy() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}
