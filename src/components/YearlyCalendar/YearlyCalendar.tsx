import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "@/src/main";
import { Solar } from "lunar-typescript";
import { VIEW_TYPE_EVENT_MANAGER } from "@/src/views/EventManagerView";
import { useYearlyGlanceConfig } from "@/src/core/hook/useYearlyGlanceConfig";
import {
	EVENT_TYPE_DEFAULT,
	EVENT_TYPE_LIST,
} from "@/src/core/interfaces/Events";
import {
	layoutOptions,
	viewTypeOptions,
} from "@/src/components/Settings/ViewSettings";
import { LayoutConfigMap } from "@/src/core/interfaces/Settings";
import { useYearlyCalendar } from "@/src/core/hook/useYearlyCalendar";
import { EventTooltip } from "./EventTooltip";
import { Select } from "../Base/Select";
import { t } from "@/src/i18n/i18n";
import "./style/YearlyCalendarView.css";

interface YearlyCalendarViewProps {
	plugin: YearlyGlancePlugin;
}

// 定义视图预设选项
const viewPresetOptions = [
	{
		value: "yearOverview",
		label: t("view.yearlyGlance.viewPreset.yearOverview"),
	},
	{
		value: "classicCalendar",
		label: t("view.yearlyGlance.viewPreset.classicCalendar"),
	},
	{ value: "custom", label: t("view.yearlyGlance.viewPreset.custom") },
];

// 预设配置映射
const presetConfigs = {
	yearOverview: { layout: "2x6", viewType: "list" },
	classicCalendar: { layout: "4x3", viewType: "calendar" },
};

const YearlyCalendarView: React.FC<YearlyCalendarViewProps> = ({ plugin }) => {
	const { config, updateConfig } = useYearlyGlanceConfig(plugin);

	const {
		year,
		title,
		layout,
		viewType,
		showWeekdays,
		showLegend,
		limitListHeight,
		eventFontSize,
		showTooltips,
		colorful,
		showHolidays,
		showBirthdays,
		showCustomEvents,
		mondayFirst,
	} = config;

	// 新增状态跟踪当前选择的预设
	const [currentPreset, setCurrentPreset] = React.useState<string>(() => {
		// 根据当前配置确定初始预设
		if (layout === "2x6" && viewType === "list") return "yearOverview";
		if (layout === "4x3" && viewType === "calendar")
			return "classicCalendar";
		return "custom";
	});

	const { monthsData, weekdays } = useYearlyCalendar(plugin);

	const calendarRef = React.useRef<HTMLDivElement>(null);

	// 预设更改处理函数
	const handlePresetChange = (preset: string) => {
		setCurrentPreset(preset);

		if (preset !== "custom") {
			// 应用预设配置
			const presetConfig =
				presetConfigs[preset as keyof typeof presetConfigs];
			updateConfig({
				layout: presetConfig.layout,
				viewType: presetConfig.viewType,
			});
		}
	};

	const handleEventManager = () => {
		plugin.openPluginView(VIEW_TYPE_EVENT_MANAGER);
	};
	const handleEventForm = () => {
		plugin.openEventForm("customEvent", {}, false, true);
	};
	const handleEventTooltip = (event: any) => {
		if (showTooltips) {
			new EventTooltip(plugin, event).open();
		} else {
			return;
		}
	};

	const handleAddEventInDay = (day: any) => {
		const solar = Solar.fromDate(day.date);
		plugin.openEventForm("customEvent", {}, false, true, {
			date: `${solar.getYear()},${solar.getMonth()},${solar.getDay()}`,
		});
	};

	// 切换事件类型可见性
	const toggleEventTypeVisibility = (eventType: string) => {
		const configUpdate: any = {};

		switch (eventType) {
			case "holiday":
				configUpdate.showHolidays = !showHolidays;
				break;
			case "birthday":
				configUpdate.showBirthdays = !showBirthdays;
				break;
			case "customEvent":
				configUpdate.showCustomEvents = !showCustomEvents;
				break;
		}

		updateConfig(configUpdate);
	};

	// 渲染单个事件
	const renderEvent = (event: any, dayView = true) => {
		return (
			<div
				key={`${event.text}-${event.date}`}
				className={`event font-${eventFontSize}`}
				style={{
					backgroundColor: `${
						event.color ?? EVENT_TYPE_DEFAULT[event.eventType].color
					}20`,
					borderLeft: `3px solid ${
						event.color ?? EVENT_TYPE_DEFAULT[event.eventType].color
					}`,
				}}
				onClick={(e) => handleEventTooltip(event)}
			>
				<span className="event-emoji">{event.emoji}</span>
				<span className="event-text">{event.text}</span>
			</div>
		);
	};

	// 渲染单个月份
	const renderMonth = (monthIndex: number) => {
		const monthData = monthsData[monthIndex];
		const monthColorStyle = colorful
			? {
					"--yg-month-color": monthData.color,
			  }
			: {};

		return (
			<div
				className={`month-container${
					colorful ? " colorful-month" : ""
				}`}
				style={monthColorStyle as React.CSSProperties}
			>
				<div
					className={`month-header${
						monthData.isCurrentMonth ? " current-month" : ""
					}`}
				>
					{monthData.name}
				</div>

				{viewType === "calendar" && (
					<div className="month-days-calendar">
						{/* 星期几标题 */}
						{showWeekdays && (
							<div className="weekdays">
								{weekdays.map((day, i) => (
									<div key={i}>{day}</div>
								))}
							</div>
						)}

						{/* 日期网格 */}
						<div className="month-days">
							{/* 空白填充前几天 */}
							{Array.from(
								{ length: monthData.firstDayPosition },
								(_, i) => (
									<div
										key={`empty-${i}`}
										className="day empty"
									></div>
								)
							)}

							{/* 实际日期 */}
							{monthData.days.map((day) => (
								<div
									key={day.dayOfMonth}
									className={`day${
										day.isToday ? " today" : ""
									}${day.isWeekend ? " weekend" : ""}${
										day.events.length > 0
											? " has-events"
											: ""
									}`}
								>
									<div className="day-info">
										<div
											className="add-event"
											onClick={() =>
												handleAddEventInDay(day)
											}
										>
											+
										</div>
										<div className="day-number">
											{day.dayOfMonth}
										</div>
									</div>
									{day.events.length > 0 && (
										<div className="events">
											{day.events.map((event) =>
												renderEvent(event)
											)}
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{viewType === "list" && (
					<div
						className={`month-days-list${
							!limitListHeight ? " no-height-limit" : ""
						}`}
					>
						{monthData.days.map((day) => (
							<div
								key={day.dayOfMonth}
								className={`day-row${
									day.isToday ? " today" : ""
								}${day.isWeekend ? " weekend" : ""}`}
							>
								<div className="day-info">
									<div className="day-info-left">
										<div className="day-number">
											{day.dayOfMonth}
										</div>
										<div className="weekday-name">
											{
												weekdays[
													mondayFirst
														? day.date.getDay() ===
														  0
															? 6
															: day.date.getDay() -
															  1
														: day.date.getDay()
												]
											}
										</div>
									</div>
									<div
										className="add-event"
										onClick={() => handleAddEventInDay(day)}
									>
										+
									</div>
								</div>
								{day.events.length > 0 && (
									<div className="events-list">
										{day.events.map((event) =>
											renderEvent(event, false)
										)}
									</div>
								)}
							</div>
						))}
					</div>
				)}
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
							(eventType) =>
								(eventType === "holiday" && showHolidays) ||
								(eventType === "birthday" && showBirthdays) ||
								(eventType === "customEvent" &&
									showCustomEvents) ||
								// 包含禁用的事件类型，以便可以重新启用它们
								eventType === "holiday" ||
								eventType === "birthday" ||
								eventType === "customEvent"
						).map((eventType) => {
							// 确定当前事件类型是否启用
							const isEnabled =
								(eventType === "holiday" && showHolidays) ||
								(eventType === "birthday" && showBirthdays) ||
								(eventType === "customEvent" &&
									showCustomEvents);

							return (
								<div
									className={`legend-item ${
										isEnabled ? "enabled" : "disabled"
									}`}
									key={eventType}
									onClick={() =>
										toggleEventTypeVisibility(eventType)
									}
									title={
										isEnabled
											? `${t(
													"view.yearlyGlance.actions.clickToHide"
											  )}${t(
													`view.yearlyGlance.legend.${eventType}` as any
											  )}`
											: `${t(
													"view.yearlyGlance.actions.clickToShow"
											  )}${t(
													`view.yearlyGlance.legend.${eventType}` as any
											  )}`
									}
								>
									<span
										className="legend-icon"
										style={{
											color: EVENT_TYPE_DEFAULT[eventType]
												.color,
											backgroundColor: `${EVENT_TYPE_DEFAULT[eventType].color}20`,
										}}
									>
										{EVENT_TYPE_DEFAULT[eventType].emoji}
									</span>
									<span className="legend-text">
										{t(
											`view.yearlyGlance.legend.${eventType}` as any
										)}
									</span>
								</div>
							);
						})}
					</div>
				)}
				{/* 视图预设选择 */}
				<Select
					options={viewPresetOptions}
					value={currentPreset}
					onValueChange={handlePresetChange}
				/>

				{/* 自定义模式下显示布局和视图类型选择器 */}
				{currentPreset === "custom" && (
					<>
						{/* 布局选择 */}
						<Select
							options={layoutOptions}
							value={layout}
							onValueChange={(value) =>
								updateConfig({ layout: value })
							}
						/>
						{/* 视图选择 */}
						<Select
							options={viewTypeOptions}
							value={viewType}
							onValueChange={(value) =>
								updateConfig({ viewType: value })
							}
						/>
					</>
				)}

				{viewType === "list" && (
					<button
						className="limit-list-height-button"
						onClick={() =>
							updateConfig({ limitListHeight: !limitListHeight })
						}
						title={t("view.yearlyGlance.actions.limitListHeight")}
					>
						<span className="button-icon">
							{limitListHeight ? "🚧" : "♾️"}
						</span>
					</button>
				)}
				{/* 事件管理 */}
				<button
					className="event-manager-button"
					onClick={handleEventManager}
					title={t("view.yearlyGlance.actions.manager")}
				>
					<span className="button-icon">📜</span>
				</button>
				{/* 事件添加 */}
				<button
					className="event-form-button"
					onClick={handleEventForm}
					title={t("view.yearlyGlance.actions.form")}
				>
					<span className="button-icon">➕</span>
				</button>
			</div>
			{/* 日历网格 */}
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
													{renderMonth(monthIndex)}
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
