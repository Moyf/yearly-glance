import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import { useYearlyCalendar } from "@/src/core/hook/useYearlyCalendar";
import "./style/YearlyCalendarView.css";

interface YearlyCalendarViewProps {
	config: YearlyGlanceConfig;
	plugin: YearlyGlancePlugin;
}

const YearlyCalendarView: React.FC<YearlyCalendarViewProps> = ({
	config,
	plugin,
}) => {
	const {
		year,
		layout,
		viewType,
		showWeekdays,
		showLegend,
		limitListHeight,
		eventFontSize,
		showHolidays,
		showBirthdays,
		showCustomEvents,
		mondayFirst,
		title,
		showTooltips,
		colorful,
	} = config.config;

	// 使用自定义 hook
	const { monthsData, weekdays, getEventStyle } = useYearlyCalendar(config);

	const calendarRef = React.useRef<HTMLDivElement>(null);
	const [tooltipState, setTooltipState] = React.useState({
		visible: false,
		text: "",
		x: 0,
		y: 0,
	});

	// 处理事件悬浮提示
	const handleEventMouseEnter = (
		event: React.MouseEvent,
		eventText: string
	) => {
		if (showTooltips) {
			setTooltipState({
				visible: true,
				text: eventText,
				x: event.clientX,
				y: event.clientY,
			});
		}
	};

	const handleEventMouseLeave = () => {
		setTooltipState((prev) => ({ ...prev, visible: false }));
	};

	// 渲染图例
	const renderLegend = () => {
		return (
			<div className="event-legend">
				{showHolidays && (
					<div className="legend-item">
						<span
							className="legend-icon"
							style={{
								backgroundColor: "#ff787520",
								color: "#ff7875",
							}}
						>
							🎉
						</span>
						<span className="legend-text">Holidays</span>
					</div>
				)}
				{showBirthdays && (
					<div className="legend-item">
						<span
							className="legend-icon"
							style={{
								backgroundColor: "#fa8c1620",
								color: "#fa8c16",
							}}
						>
							🎂
						</span>
						<span className="legend-text">Birthdays</span>
					</div>
				)}
				{showCustomEvents && (
					<div className="legend-item">
						<span
							className="legend-icon"
							style={{
								backgroundColor: "#73d13d20",
								color: "#73d13d",
							}}
						>
							📌
						</span>
						<span className="legend-text">Custom Events</span>
					</div>
				)}
			</div>
		);
	};

	// 渲染星期几标题
	const renderWeekdays = () => {
		return (
			<div className="weekdays">
				{weekdays.map((day, i) => {
					// 判断是否是周末
					const isWeekend = mondayFirst
						? i === 5 || i === 6 // 周一为第一天时，周六日是第6、7天
						: i === 0 || i === 6; // 周日为第一天时，周六日是第1、7天

					return (
						<div
							key={i}
							className={`weekday${isWeekend ? " weekend" : ""}`}
						>
							{day}
						</div>
					);
				})}
			</div>
		);
	};

	// 渲染事件
	const renderEvent = (event: any, fontSizeClass: string) => {
		const style = getEventStyle(event);

		return (
			<div
				className={`event${fontSizeClass}`}
				style={{
					backgroundColor: style.backgroundColor,
					color: style.color,
				}}
				onMouseEnter={(e) => handleEventMouseEnter(e, event.text)}
				onMouseLeave={handleEventMouseLeave}
			>
				<span className="event-emoji">{style.emoji}</span>
				<span className="event-text">{event.text}</span>
			</div>
		);
	};

	// 渲染单个月份的日历视图
	const renderCalendarView = (monthData, fontSizeClass: string) => {
		return (
			<>
				{showWeekdays && renderWeekdays()}

				<div className="month-days">
					{/* 添加月初的空白格子 */}
					{Array.from(
						{ length: monthData.firstDayPosition },
						(_, i) => (
							<div
								key={`empty-start-${i}`}
								className="day empty"
							></div>
						)
					)}

					{/* 只渲染当月日期 */}
					{monthData.days.map((day) => {
						const hasEvents = day.events.length > 0;

						return (
							<div
								key={day.dayOfMonth}
								className={`day${
									hasEvents ? " has-events" : ""
								}${day.isToday ? " today" : ""}${
									day.isWeekend ? " weekend" : ""
								}`}
							>
								<div className="day-number">
									{day.dayOfMonth}
								</div>

								{hasEvents && (
									<div className="events">
										{day.events.map((event, eventIndex) => (
											<React.Fragment key={eventIndex}>
												{renderEvent(
													event,
													fontSizeClass
												)}
											</React.Fragment>
										))}
									</div>
								)}
							</div>
						);
					})}

					{/* 添加月末的空白格子，确保网格完整 */}
					{(() => {
						const lastDayPosition =
							(monthData.firstDayPosition +
								monthData.days.length -
								1) %
							7;
						const emptyEndCells =
							lastDayPosition < 6 ? 6 - lastDayPosition : 0;
						return Array.from({ length: emptyEndCells }, (_, i) => (
							<div
								key={`empty-end-${i}`}
								className="day empty"
							></div>
						));
					})()}
				</div>
			</>
		);
	};

	// 渲染单个月份
	const renderMonth = (monthIndex: number) => {
		const monthData = monthsData[monthIndex];

		// 获取字体大小类名
		const fontSizeClass = ` font-${eventFontSize || "medium"}`;

		// 获取月份主题色
		const monthStyle = colorful
			? ({
					"--month-color": monthData.color,
					"--month-color-rgb": monthData.colorRgb,
			  } as React.CSSProperties)
			: {};

		// 确定视图类型：优先使用 viewType 配置，如果未设置则根据布局判断
		const useListView =
			viewType === "list" ||
			(viewType === "calendar"
				? false
				: layout === "2x6" || layout === "1x12");

		return (
			<div
				className={`month-container${
					colorful ? " colorful-month" : ""
				}`}
				style={monthStyle}
			>
				<div
					className={`month-header${
						monthData.isCurrentMonth ? " current-month" : ""
					}`}
				>
					{monthData.name}
				</div>

				{useListView ? (
					// 列表视图
					<div
						className={`month-days-list${
							limitListHeight ? "" : " no-height-limit"
						}`}
					>
						{renderCalendarView(monthData, fontSizeClass)}
					</div>
				) : (
					// 传统周历视图
					renderCalendarView(monthData, fontSizeClass)
				)}
			</div>
		);
	};

	// 根据布局确定行数和列数
	let rows, cols;
	switch (layout) {
		case "6x2":
			rows = 6;
			cols = 2;
			break;
		case "3x4":
			rows = 3;
			cols = 4;
			break;
		case "2x6":
			rows = 2;
			cols = 6;
			break;
		case "1x12":
			rows = 1;
			cols = 12;
			break;
		default: // "4x3"
			rows = 4;
			cols = 3;
			break;
	}

	return (
		<div className="yearly-calendar" ref={calendarRef}>
			{/* 标题 */}
			{title !== "" && (
				<div className="yearly-calendar-title">
					{title === null ? `${year}年 年历` : title}
				</div>
			)}

			{/* 图例 */}
			{showLegend && renderLegend()}

			{/* 日历网格 */}
			<div className={`calendar-grid layout-${layout}`}>
				{Array.from({ length: rows }, (_, row) => (
					<div key={row} className="month-row">
						{Array.from({ length: cols }, (_, col) => {
							const monthIndex = row * cols + col;
							return monthIndex < 12 ? (
								<React.Fragment key={monthIndex}>
									{renderMonth(monthIndex)}
								</React.Fragment>
							) : null;
						})}
					</div>
				))}
			</div>

			{/* 悬浮提示 */}
			{tooltipState.visible && (
				<div
					className="event-tooltip"
					style={{
						top: tooltipState.y + 10,
						left: tooltipState.x + 10,
						backgroundColor: "var(--day-bg-color)",
						border: "1px solid var(--border-color)",
					}}
				>
					{tooltipState.text}
				</div>
			)}
		</div>
	);
};

export class YearlyCalendar {
	private container: HTMLElement;
	private root: Root | null = null;
	private plugin: YearlyGlancePlugin;
	private config: YearlyGlanceConfig;

	constructor(container: HTMLElement, plugin: YearlyGlancePlugin) {
		this.container = container;
		this.plugin = plugin;
		this.config = this.plugin.getSettings();
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
					<YearlyCalendarView
						plugin={this.plugin}
						config={this.config}
					/>
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
