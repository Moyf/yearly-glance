import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import YearlyGlancePlugin from "@/src/main";
import { VIEW_TYPE_EVENT_MANAGER } from "@/src/views/EventManagerView";
import { useYearlyGlanceConfig } from "@/src/core/hook/useYearlyGlanceConfig";
import {
	EVENT_TYPE_DEFAULT,
	EVENT_TYPE_LIST,
} from "@/src/core/interfaces/Events";
import {
	getLayoutOptions,
	viewTypeOptions,
} from "@/src/components/Settings/ViewSettings";
import { useYearlyCalendar } from "@/src/core/hook/useYearlyCalendar";
import {
	CalendarDay,
	CalendarEvent,
} from "@/src/core/interfaces/CalendarEvent";
import { EventTooltip } from "./EventTooltip";
import { Select } from "../Base/Select";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
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
		hideEmptyDates,
		showLunarDay,
		emojiOnTop,
	} = config;

	// 添加状态来跟踪年份控制按钮是否显示
	const [showYearControls, setShowYearControls] = React.useState(false);

	const calendarRef = React.useRef<HTMLDivElement>(null);
	const yearControlsRef = React.useRef<HTMLDivElement>(null);

	// 切换年份控制按钮的显示状态
	const toggleYearControls = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowYearControls(!showYearControls);
	};

	// 调整年份
	const adjustYear = (delta: number, e: React.MouseEvent) => {
		e.stopPropagation();
		updateConfig({ ...config, year: year + delta });
	};

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				yearControlsRef.current &&
				!yearControlsRef.current.contains(event.target as Node)
			) {
				setShowYearControls(false);
			}
		};

		// 只有当控制按钮显示时才添加事件监听器
		if (showYearControls) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showYearControls]);

	// 新增状态跟踪当前选择的预设
	const [currentPreset, setCurrentPreset] = React.useState<string>(() => {
		// 根据当前配置确定初始预设
		if (layout === "2x6" && viewType === "list") return "yearOverview";
		if (layout === "4x3" && viewType === "calendar")
			return "classicCalendar";
		return "custom";
	});

	const parsedTitle = React.useMemo(() => {
		const yearPlaceholder = "{{year}}";

		// 处理空标题情况
		if (!title || title.trim() === "") {
			return {
				prefix: "",
				suffix: t("view.yearlyGlance.yearlyCalendar"),
				showYear: true,
			};
		}

		const yearIndex = title.indexOf(yearPlaceholder);

		// 如果不存在 yearPlaceholder, 则使用整个 title 作为 prefix
		if (yearIndex === -1) {
			return {
				prefix: title,
				suffix: "",
				showYear: false,
			};
		}

		// 确保空格也被正确保留
		const prefix = title.substring(0, yearIndex);
		const suffix = title.substring(yearIndex + yearPlaceholder.length);

		return {
			prefix,
			suffix,
			showYear: true,
		};
	}, [title, year]);

	const { monthsData, weekdays } = useYearlyCalendar(plugin);

	// 预设更改处理函数
	const handlePresetChange = (preset: string) => {
		setCurrentPreset(preset);

		if (preset !== "custom") {
			// 应用预设配置
			const presetConfig =
				presetConfigs[preset as keyof typeof presetConfigs];
			updateConfig({
				...config,
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
	const handleEventTooltip = (event: CalendarEvent) => {
		if (showTooltips) {
			new EventTooltip(plugin, event).open();
		} else {
			return;
		}
	};

	const handleAddEventInDay = (day: CalendarDay) => {
		const selectDate = new Date(day.date).toISOString().split("T")[0];
		plugin.openEventForm("customEvent", {}, false, true, {
			date: selectDate,
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
	const renderEvent = (event: CalendarEvent, dayView = true) => {
		const eventClasses = [
			"event",
			`font-${eventFontSize}`,
			emojiOnTop ? "emoji-top" : "",
			config.wrapEventText ? "wrap-text" : "",
		]
			.filter(Boolean)
			.join(" ");

		const eventProps: React.HTMLAttributes<HTMLDivElement> = {
			className: eventClasses,
			style: {
				backgroundColor: `${
					event.color ?? EVENT_TYPE_DEFAULT[event.eventType].color
				}20`,
				borderLeft: `3px solid ${
					event.color ?? EVENT_TYPE_DEFAULT[event.eventType].color
				}`,
			},
			onClick: (e) => handleEventTooltip(event),
		};

		// 添加 tooltip 属性
		if (config.showEventTooltips) {
			eventProps.title = event.text;
			eventProps.className += " has-tooltip";
		}

		return (
			<div
				key={`${event.text}-${event.eventDate.isoDate}`}
				{...eventProps}
			>
				<span className="event-emoji">
					{!event.emoji
						? EVENT_TYPE_DEFAULT[event.eventType].emoji
						: event.emoji}
				</span>
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
										<div className="day-info-left">
											<div
												className="add-event"
												onClick={() =>
													handleAddEventInDay(day)
												}
											>
												+
											</div>
										</div>
										<div className="day-info-right">
											<div className="day-number">
												{day.dayOfMonth}
											</div>
											{showLunarDay && (
												<div className="day-lunar">
													{day.dayOfLunarMonth}
												</div>
											)}
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
						{(hideEmptyDates
							? monthData.days.filter(
									(day: CalendarDay) =>
										day.events.length > 0 || day.isToday
							  )
							: monthData.days
						).map((day: CalendarDay) => (
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
										{showLunarDay && (
											<div className="day-lunar">
												{day.dayOfLunarMonth}
											</div>
										)}
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
									<div className="day-info-right">
										<div
											className="add-event"
											onClick={() =>
												handleAddEventInDay(day)
											}
										>
											+
										</div>
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
				{parsedTitle.prefix && (
					<span className="year-title-prefix">
						{parsedTitle.prefix}
					</span>
				)}
				{parsedTitle.showYear && (
					<div
						ref={yearControlsRef}
						className={`year-number-container ${
							showYearControls ? "expanded" : ""
						}`}
					>
						{showYearControls && (
							<span
								className="year-control prev-year"
								onClick={(e) => adjustYear(-1, e)}
							>
								<ChevronLeft />
							</span>
						)}
						<span
							className="year-number"
							onClick={toggleYearControls}
						>
							{year}
						</span>
						{showYearControls && (
							<span
								className="year-control next-year"
								onClick={(e) => adjustYear(1, e)}
							>
								<ChevronRight />
							</span>
						)}
					</div>
				)}
				{parsedTitle.suffix && (
					<span className="year-title-suffix">
						{parsedTitle.suffix}
					</span>
				)}
			</div>
			{/* actionsBar */}
			<div className="yearly-calendar-actions-bar">
				<div className="yg-buttons">
					<div className="yg-buttons-left">
						{/* 图例 */}
						{showLegend && (
							<div className="event-legend">
								{EVENT_TYPE_LIST.filter(
									(eventType) =>
										(eventType === "holiday" &&
											showHolidays) ||
										(eventType === "birthday" &&
											showBirthdays) ||
										(eventType === "customEvent" &&
											showCustomEvents) ||
										// 包含禁用的事件类型，以便可以重新启用它们
										eventType === "holiday" ||
										eventType === "birthday" ||
										eventType === "customEvent"
								).map((eventType) => {
									// 确定当前事件类型是否启用
									const isEnabled =
										(eventType === "holiday" &&
											showHolidays) ||
										(eventType === "birthday" &&
											showBirthdays) ||
										(eventType === "customEvent" &&
											showCustomEvents);

									return (
										<div
											className={`legend-item ${
												isEnabled
													? "enabled"
													: "disabled"
											}`}
											key={eventType}
											onClick={() =>
												toggleEventTypeVisibility(
													eventType
												)
											}
											title={
												isEnabled
													? `${t(
															"view.yearlyGlance.actions.clickToHide"
													  )}${t(
															`view.yearlyGlance.legend.${eventType}` as TranslationKeys
													  )}`
													: `${t(
															"view.yearlyGlance.actions.clickToShow"
													  )}${t(
															`view.yearlyGlance.legend.${eventType}` as TranslationKeys
													  )}`
											}
										>
											<span
												className="legend-icon"
												style={{
													color: EVENT_TYPE_DEFAULT[
														eventType
													].color,
													backgroundColor: `${EVENT_TYPE_DEFAULT[eventType].color}20`,
												}}
											>
												{
													EVENT_TYPE_DEFAULT[
														eventType
													].emoji
												}
											</span>
											<span className="legend-text">
												{t(
													`view.yearlyGlance.legend.${eventType}` as TranslationKeys
												)}
											</span>
										</div>
									);
								})}
							</div>
						)}
					</div>

					<div className="yg-buttons-right">
						<div className="yg-select-group">
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
										options={getLayoutOptions(viewType)}
										value={layout}
										onValueChange={(value) =>
											updateConfig({
												...config,
												layout: value,
											})
										}
									/>
									{/* 视图选择 */}
									<Select
										options={viewTypeOptions}
										value={viewType}
										onValueChange={(value) =>
											updateConfig({
												...config,
												viewType: value,
											})
										}
									/>
								</>
							)}
						</div>

						<div className="yg-action-buttons">
							{/* 日历视图专用按钮 */}
							{viewType === "calendar" && (
								<>
									<button
										className="actions-button emoji-position-button"
										onClick={() =>
											updateConfig({
												...config,
												emojiOnTop: !config.emojiOnTop,
											})
										}
										title={t(
											"view.yearlyGlance.actions.emojiOnTop"
										)}
									>
										<span className="button-icon">
											{config.emojiOnTop ? "⬆️" : "⬅️"}
										</span>
									</button>

									<button
										className="actions-button wrap-text-button"
										onClick={() =>
											updateConfig({
												...config,
												wrapEventText:
													!config.wrapEventText,
											})
										}
										title={t(
											"view.yearlyGlance.actions.wrapText"
										)}
									>
										<span className="button-icon">
											{config.wrapEventText ? "🔤" : "✂️"}
										</span>
									</button>

									<button
										className={`actions-button show-tooltips-button ${
											config.showEventTooltips
												? "active"
												: ""
										}`}
										onClick={() =>
											updateConfig({
												...config,
												showEventTooltips:
													!config.showEventTooltips,
											})
										}
										title={t(
											"view.yearlyGlance.actions.showTooltips"
										)}
									>
										<span className="button-icon">💬</span>
									</button>
								</>
							)}

							{viewType === "list" && (
								<>
									<button
										className="actions-button limit-list-height-button"
										onClick={() =>
											updateConfig({
												...config,
												limitListHeight:
													!limitListHeight,
											})
										}
										title={t(
											"view.yearlyGlance.actions.limitListHeight"
										)}
									>
										<span className="button-icon">
											{limitListHeight ? "🚧" : "♾️"}
										</span>
									</button>
									<button
										className="actions-button hide-empty-dates-button"
										onClick={() =>
											updateConfig({
												...config,
												hideEmptyDates: !hideEmptyDates,
											})
										}
										title={t(
											"view.yearlyGlance.actions.hideEmptyDates"
										)}
									>
										<span className="button-icon">
											{hideEmptyDates ? "🙈" : "👀"}
										</span>
									</button>
								</>
							)}

							{/* 事件管理 */}
							<button
								className="actions-button event-manager-button"
								onClick={handleEventManager}
								title={t("view.yearlyGlance.actions.manager")}
							>
								<span className="button-icon">🗂️</span>
							</button>

							{/* 事件添加 */}
							<button
								className="actions-button event-form-button"
								onClick={handleEventForm}
								title={t("view.yearlyGlance.actions.form")}
							>
								<span className="button-icon">➕</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* 日历网格 */}
			<div className={`calendar-grid ${viewType}-view layout-${layout}`}>
				{Array.from({ length: 12 }).map((_, monthIndex) => (
					<>
						{monthIndex < 12 && (
							<React.Fragment key={monthIndex}>
								{renderMonth(monthIndex)}
							</React.Fragment>
						)}
					</>
				))}
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
		// Reset the year configuration to current year when view is closed
		const currentYear = new Date().getFullYear();
		this.plugin.updateConfig({ year: currentYear });

		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}
