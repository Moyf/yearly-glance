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
	const { config, updateConfig } = useYearlyGlanceConfig(plugin);

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
	const [tooltipInfo, setTooltipInfo] = React.useState<{
		text: string;
		x: number;
		y: number;
		visible: boolean;
		color: string;
	}>({
		text: "",
		x: 0,
		y: 0,
		visible: false,
		color: "",
	});

	const handleEventManager = () => {
		plugin.openPluginView(VIEW_TYPE_EVENT_MANAGER);
	};
	const handleEventForm = () => {
		plugin.openEventForm("holiday", {}, false, true);
	};

	// 处理事件悬停显示提示
	const handleEventMouseEnter = (
		e: React.MouseEvent,
		eventText: string,
		color: string
	) => {
		if (showTooltips) {
			const rect = e.currentTarget.getBoundingClientRect();
			setTooltipInfo({
				text: eventText,
				x: rect.left,
				y: rect.bottom + window.scrollY,
				visible: true,
				color,
			});
		}
	};

	const handleEventMouseLeave = () => {
		if (showTooltips) {
			setTooltipInfo((prev) => ({ ...prev, visible: false }));
		}
	};

	// 渲染单个事件
	const renderEvent = (event: any, dayView = true) => {
		return (
			<div
				key={`${event.text}-${event.date}`}
				className={`event font-${eventFontSize}`}
				style={{
					backgroundColor: `${event.color}20`,
					borderLeft: `3px solid ${event.color}`,
				}}
				onMouseEnter={(e) =>
					handleEventMouseEnter(e, event.text, event.color)
				}
				onMouseLeave={handleEventMouseLeave}
			>
				<span className="event-emoji">{event.emoji}</span>
				<span className="event-text">{event.text}</span>
			</div>
		);
	};

	// 渲染单个月份
	const renderMonth = (monthIndex: number) => {
		const monthData = monthsData[monthIndex];
		const fontSizeClass = `font-${eventFontSize}`;
		const monthColorStyle = colorful
			? {
					"--month-color": monthData.color,
					"--month-color-rgb": monthData.color,
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
					<>
						{/* 星期几标题 */}
						<div className="weekdays">
							{weekdays.map((day, i) => (
								<div key={i}>{day}</div>
							))}
						</div>

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
									<div className="day-number">
										{day.dayOfMonth}
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
					</>
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
									<div className="day-number">
										{day.dayOfMonth}
									</div>
									<div className="weekday-name">
										{weekdays[day.date.getDay()]}
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

			{/* 事件提示框 */}
			{tooltipInfo.visible && (
				<div
					className="event-tooltip"
					style={{
						left: `${tooltipInfo.x}px`,
						top: `${tooltipInfo.y}px`,
						backgroundColor: `${tooltipInfo.color}20`,
						borderLeft: `3px solid ${tooltipInfo.color}`,
					}}
				>
					{tooltipInfo.text}
				</div>
			)}
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
