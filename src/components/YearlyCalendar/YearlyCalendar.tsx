import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Menu, Notice } from "obsidian";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import YearlyGlancePlugin from "@/src/main";
import { VIEW_TYPE_GLANCE_MANAGER } from "@/src/views/GlanceManagerView";
import { useYearlyGlanceConfig } from "@/src/hooks/useYearlyGlanceConfig";
import { EVENT_TYPE_DEFAULT, EVENT_TYPE_LIST, EventSource, EventType } from "@/src/type/Events";
import {
	getLayoutOptions,
	viewTypeOptions,
} from "@/src/components/Settings/ViewSettings";
import { useYearlyCalendar } from "@/src/hooks/useYearlyCalendar";
import { CalendarDay, CalendarEvent } from "@/src/type/CalendarEvent";
import { EventTooltip } from "./EventTooltip";
import { Select } from "@/src/components/Base/Select";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import "./style/YearlyCalendarView.css";
import { Tooltip } from "@/src/components/Base/Tooltip";
import { IsoUtils } from "@/src/utils/isoUtils";
import { ConfirmDialog } from "@/src/components/Base/ConfirmDialog";
import { resolveEventDisplay } from "@/src/utils/resolveEventDisplay";
import { DailyNoteService } from "@/src/service/DailyNoteService";
import { YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";
import { EVENT_SEARCH_REQUESTED, EventManagerBus } from "@/src/hooks/useEventBus";

interface YearlyCalendarViewProps {
	plugin: YearlyGlancePlugin;
	externalEvents?: CalendarEvent[];
	inheritPluginData?: boolean;
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

const YearlyCalendarView: React.FC<YearlyCalendarViewProps> = ({ plugin, externalEvents, inheritPluginData }) => {
	const { config, updateConfig } = useYearlyGlanceConfig(plugin);

	const {
		year,
		title,
		layout,
		viewType,
		showWeekdays,
		showLegend,
		actionsBarCollapsed,
		showViewPresetSelector,
		limitListHeight,
		eventFontSize,
		showTooltips,
		eventClickAction,
		colorful,
		showHolidays,
		showBirthdays,
		showCustomEvents,
		showBasesEvents,
		showDailyNoteEvents,
		mondayFirst,
		hideEmptyDates,
		hidePreviousMonths,
		hideFutureMonths,
		showLunarDay,
		emojiOnTop,
		eventPresetTypes,
	} = config;

	// 添加状态来跟踪年份控制按钮是否显示
	const [showYearControls, setShowYearControls] = React.useState(false);

	const calendarRef = React.useRef<HTMLDivElement>(null);
	const yearControlsRef = React.useRef<HTMLDivElement>(null);
	const scrollToTodayAfterYearChangeRef = React.useRef(false);

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
			activeDocument.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			activeDocument.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showYearControls]);

	React.useEffect(() => {
		if (!scrollToTodayAfterYearChangeRef.current) {
			return;
		}

		scrollToTodayAfterYearChangeRef.current = false;
		window.requestAnimationFrame(() => {
			calendarRef.current
				?.querySelector<HTMLElement>(".today")
				?.scrollIntoView({ block: "center", behavior: "smooth" });
		});
	}, [year, viewType, layout, hidePreviousMonths, hideFutureMonths, hideEmptyDates]);

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

	const { monthsData, weekdays, durationWarnings } = useYearlyCalendar(plugin, externalEvents);

	// Show aggregated Notice when invalid durations are found
	const warningShownRef = React.useRef<string>('');
	React.useEffect(() => {
		if (durationWarnings.length > 0) {
			const warningKey = durationWarnings.map((w) => w.eventId).join(',');
			if (warningKey !== warningShownRef.current) {
				warningShownRef.current = warningKey;
				new Notice(t('warning.invalidDuration', { count: String(durationWarnings.length) }));
			}
		}
	}, [durationWarnings]);

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

	const handleGlanceManager = () => {
		plugin.openPluginView(VIEW_TYPE_GLANCE_MANAGER);
	};
	const handleEventForm = () => {
		plugin.openEventForm("customEvent", {}, false, true);
	};
	const toggleActionsBar = () => {
		updateConfig({
			...config,
			actionsBarCollapsed: !actionsBarCollapsed,
		});
	};
	const toggleViewPresetSelector = () => {
		updateConfig({
			...config,
			showViewPresetSelector: !showViewPresetSelector,
		});
	};
	const handleGoToToday = () => {
		const currentYear = IsoUtils.getCurrentYear();

		if (year !== currentYear) {
			scrollToTodayAfterYearChangeRef.current = true;
			updateConfig({
				...config,
				year: currentYear,
			});
			return;
		}

		calendarRef.current
			?.querySelector<HTMLElement>(".today")
			?.scrollIntoView({ block: "center", behavior: "smooth" });
	};
	const handleEventClick = (event: CalendarEvent) => {
		const action = eventClickAction || "showTooltip";

		switch (action) {
			case "editEvent":
				// 直接打开编辑表单
				plugin.openEventForm(event.eventType as EventType, event, true, false);
				break;
			case "openNote": {
				// 打开笔记（仅对有笔记来源的事件生效，否则 fallback 到 tooltip）
				const isBasesEvent = event.eventSource === EventSource.BASES || event.id.startsWith("bases-");
				const isDailyNoteEvent = event.eventType === "dailyNoteEvent";
				if ((isBasesEvent || isDailyNoteEvent) && event.sourceFilePath) {
					plugin.app.workspace.openLinkText(event.sourceFilePath, '', true);
				} else {
					// 非笔记事件，fallback 到显示 tooltip
					new EventTooltip(plugin, event).open();
				}
				break;
			}
			case "showTooltip":
			default:
				new EventTooltip(plugin, event).open();
				break;
		}
	};

	// 右键菜单：删除事件
	const handleDeleteEventFromContextMenu = (event: CalendarEvent) => {
		new ConfirmDialog(plugin, {
			title: t("view.eventManager.actions.delete"),
			message: t("view.eventManager.actions.deleteConfirm", { name: event.text }),
			onConfirm: async () => {
				const isBasesEvent = event.eventSource === EventSource.BASES || event.id.startsWith("bases-");
				const isDailyNoteEvent = event.eventType === "dailyNoteEvent";

				if (isBasesEvent) {
					// Bases 事件：删除笔记文件
					if (event.sourceFilePath) {
						const file = plugin.app.vault.getAbstractFileByPath(event.sourceFilePath);
						if (file) {
							await plugin.app.fileManager.trashFile(file);
							YearlyGlanceBus.publish("bases-data");
						}
					}
				} else if (isDailyNoteEvent) {
					// 日记事件：从 frontmatter 移除
					const filePath = DailyNoteService.getFilePathFromEvent(event);
					if (filePath) {
						const pluginConfig = plugin.getSettings().config;
						const defaultEmoji = EVENT_TYPE_DEFAULT.dailyNoteEvent.emoji;
						const fullTitle = DailyNoteService.assembleTitle(
							event.emoji !== defaultEmoji ? event.emoji : null,
							event.text,
							defaultEmoji,
						);
						await DailyNoteService.removeEventFromDaily(
							plugin.app, filePath, pluginConfig.dailyNoteEventProp, fullTitle,
						);
						YearlyGlanceBus.publish("dailynote-data");
					}
				} else {
					// Config 事件：从插件数据中移除
					const events = plugin.getData();
					await plugin.updateData({
						holidays: events.holidays.filter((h) => h.id !== event.id),
						birthdays: events.birthdays.filter((b) => b.id !== event.id),
						customEvents: events.customEvents.filter((c) => c.id !== event.id),
					});
				}

				new Notice(t("view.eventManager.form.eventDeleted"));
			},
		}).open();
	};

	// 右键菜单
	const handleEventContextMenu = (e: React.MouseEvent, event: CalendarEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const menu = new Menu();

		const isBasesEvent = event.eventSource === EventSource.BASES || event.id.startsWith("bases-");
		const isDailyNoteEvent = event.eventType === "dailyNoteEvent";
		const isConfigEvent = !isBasesEvent && !isDailyNoteEvent;

		// 1. Edit（所有事件）
		menu.addItem((item) => {
			item.setTitle(t("view.eventManager.actions.edit"))
				.setIcon("pencil")
				.onClick(() => {
					const eventType = event.eventType as EventType;
					plugin.openEventForm(eventType, event, true, false);
				});
		});

		// 2. Open Note（仅限笔记来源事件）
		if ((isBasesEvent || isDailyNoteEvent) && event.sourceFilePath) {
			menu.addItem((item) => {
				item.setTitle(t("view.eventManager.actions.openOriginalNote"))
					.setIcon("file-text")
					.onClick(() => {
						plugin.app.workspace.openLinkText(event.sourceFilePath!, "", true);
					});
			});
		}

		// 3. Delete
		menu.addSeparator();
		menu.addItem((item) => {
			item.setTitle(t("view.eventManager.actions.delete"))
				.setIcon("trash-2")
				.onClick(() => {
					handleDeleteEventFromContextMenu(event);
				});
		});

		menu.showAtMouseEvent(e.nativeEvent);
	};

	const handleAddEventInDay = (day: CalendarDay) => {
		// 避免时区转换问题，直接使用已经存在的date对象
		const selectDate = IsoUtils.toLocalDateString(day.date);
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
			case "basesEvent":
				configUpdate.showBasesEvents = !showBasesEvents;
				break;
			case "dailyNoteEvent":
				configUpdate.showDailyNoteEvents = !showDailyNoteEvents;
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
		];

		// 添加多日事件的样式类
		if (event._totalDays && event._totalDays > 1) {
			eventClasses.push("multi-day-event");
			if (event._isFirstDay) {
				eventClasses.push("multi-day-first");
			} else if (event._isLastDay) {
				eventClasses.push("multi-day-last");
			} else {
				eventClasses.push("multi-day-middle");
			}
		}

		// 获取事件颜色
		const { emoji: resolvedEmoji, color: resolvedColor } = resolveEventDisplay(event, eventPresetTypes ?? []);

		// 构建样式对象
		const eventStyle: React.CSSProperties = {
			backgroundColor: `${resolvedColor}20`,
			borderLeft: `3px solid ${resolvedColor}`,
		};

		// 为多日事件添加特殊边框
		if (event._totalDays && event._totalDays > 1) {
			if (dayView) {
				// 日历视图边框规则：
				// - 第一天：仅 border-left（默认已有），无其他边框
				// - 最后一天：仅 border-right，无 border-left
				// - 中间日：无边框
			if (event._isLastDay) {
				// 最后一天：移除 border-left，添加 border-right
				eventStyle.borderLeft = undefined;
				eventStyle.borderRight = `3px solid ${resolvedColor}`;
			} else if (event._isFirstDay) {
					// 第一天：保持默认的 border-left，不添加其他边框
					//（默认已有 border-left，无需额外操作）
				} else {
					// 中间日：移除所有边框
					eventStyle.borderLeft = undefined;
				}
			} else {
				// 列表视图：第一天添加顶部边框，最后一天添加底部边框
			if (event._isFirstDay) {
				eventStyle.borderTop = `3px solid ${resolvedColor}`;
			}
			if (event._isLastDay) {
				eventStyle.borderBottom = `3px solid ${resolvedColor}`;
			}
			}
		}

		const eventProps: React.HTMLAttributes<HTMLDivElement> = {
			className: eventClasses.filter(Boolean).join(" "),
			style: eventStyle,
			onClick: (e) => handleEventClick(event),
			onContextMenu: (e) => handleEventContextMenu(e, event),
		};

		// 构建天数标记文本
		const dayLabel = event._totalDays && event._totalDays > 1
			? <span className="event-day-label"> ({event._dayIndex! + 1}/{event._totalDays})</span>
			: null;

		// 使用原始 event.id 或 event.id + dayIndex 作为 key
		const eventKey = event._totalDays && event._totalDays > 1
			? `${event.id}-${event._dayIndex}`
			: `${event.text}-${event.eventDate.isoDate}`;

		return (
			<Tooltip text={event.text} disabled={!showTooltips}>
				<div
					key={eventKey}
					{...eventProps}
				>
				<span className="event-emoji">
					{resolvedEmoji}
				</span>
					<span className="event-text">{event.text}{dayLabel}</span>
				</div>
			</Tooltip>
		);
	};

	// 渲染单个月份
	const shouldRenderMonth = (monthIndex: number) => {
		const currentDate = new Date();
		const currentMonth = currentDate.getMonth();
		const currentYear = currentDate.getFullYear();
		const targetYear = year + Math.floor(monthIndex / 12);
		const targetMonth = monthIndex % 12;

		if (
			hidePreviousMonths &&
			(targetYear < currentYear ||
				(targetYear === currentYear && targetMonth < currentMonth))
		) {
			return false;
		}

		if (
			hideFutureMonths &&
			(targetYear > currentYear ||
				(targetYear === currentYear && targetMonth > currentMonth))
		) {
			return false;
		}

		return true;
	};

	const renderMonth = (monthIndex: number) => {
		if (!shouldRenderMonth(monthIndex)) {
			return null;
		}

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
			<div
				className={`yearly-calendar-actions-bar ${
					actionsBarCollapsed ? "collapsed" : ""
				}`}
			>
				<div className="yg-actions-collapse-container">
					<button
						className={`yg-actions-collapse-button ${
							actionsBarCollapsed ? "collapsed" : ""
						}`}
						aria-expanded={!actionsBarCollapsed}
						onClick={toggleActionsBar}
					>
						{actionsBarCollapsed ? (
							<>
								<PanelLeftOpen size={16} />
								<span>{t("view.yearlyGlance.actions.expandActionsBar")}</span>
							</>
						) : (
							<PanelLeftClose size={16} />
						)}
					</button>
				</div>

				{!actionsBarCollapsed && (
					<div className="yg-buttons">
						<div className="yg-buttons-left">
						{/* 图例 */}
						{showLegend && !(externalEvents && !inheritPluginData) && (
							<div className="event-legend">
								{EVENT_TYPE_LIST.filter(
									(eventType) => {
										// 在 BasesView 模式且启用继承插件数据时，隐藏笔记事件和日记事件开关
										if (externalEvents && inheritPluginData && eventType === "basesEvent") {
											return false;
										}
										if (externalEvents && eventType === "dailyNoteEvent") {
											return false;
										}

										return (
											(eventType === "holiday" &&
												showHolidays) ||
											(eventType === "birthday" &&
												showBirthdays) ||
											(eventType === "customEvent" &&
												showCustomEvents) ||
									(eventType === "basesEvent" &&
											showBasesEvents) ||
										(eventType === "dailyNoteEvent" &&
											showDailyNoteEvents) ||
										// 包含禁用的事件类型，以便可以重新启用它们
										eventType === "holiday" ||
										eventType === "birthday" ||
										eventType === "customEvent" ||
										eventType === "basesEvent" ||
										eventType === "dailyNoteEvent"
										);
									}
								).map((eventType) => {
									// 确定当前事件类型是否启用
									const isEnabled =
										(eventType === "holiday" &&
											showHolidays) ||
										(eventType === "birthday" &&
											showBirthdays) ||
										(eventType === "customEvent" &&
											showCustomEvents) ||
								(eventType === "basesEvent" &&
										showBasesEvents) ||
									(eventType === "dailyNoteEvent" &&
										showDailyNoteEvents);

									return (
										<Tooltip
											text={
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
										</Tooltip>
									);
								})}
							</div>
						)}
						</div>

						<div className="yg-buttons-right">
						<div className="yg-action-buttons">
							<Tooltip text={t("view.yearlyGlance.actions.viewOptions")}>
								<button
									className={`actions-button view-options-button ${
										showViewPresetSelector ? "active" : ""
									}`}
									onClick={toggleViewPresetSelector}
								>
									<span className="button-icon">🔧</span>
								</button>
							</Tooltip>

							{showViewPresetSelector && (
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
							)}

							{showViewPresetSelector && (
							<>
							{/* 过往/未来月份切换按钮 - 所有视图显示 */}
							<Tooltip
								text={
									hidePreviousMonths
										? t(
												"view.yearlyGlance.actions.showPreviousMonths"
										  )
										: t(
												"view.yearlyGlance.actions.hidePreviousMonths"
										  )
								}
							>
								<button
									className={`actions-button hide-previous-months-button ${
										hidePreviousMonths ? "active" : ""
									}`}
									onClick={() =>
										updateConfig({
											...config,
											hidePreviousMonths:
												!hidePreviousMonths,
										})
									}
								>
									<span className="button-icon">⏪</span>
								</button>
							</Tooltip>
							<Tooltip
								text={
									hideFutureMonths
										? t(
												"view.yearlyGlance.actions.showFutureMonths"
										  )
										: t(
												"view.yearlyGlance.actions.hideFutureMonths"
										  )
								}
							>
								<button
									className={`actions-button hide-future-months-button ${
										hideFutureMonths ? "active" : ""
									}`}
									onClick={() =>
										updateConfig({
											...config,
											hideFutureMonths:
												!hideFutureMonths,
										})
									}
								>
									<span className="button-icon">⏩</span>
								</button>
							</Tooltip>

							{/* 日历视图专用按钮 */}
							{viewType === "calendar" && (
								<>
									<Tooltip
										text={t(
											"view.yearlyGlance.actions.emojiOnTop"
										)}
									>
										<button
											className="actions-button emoji-position-button"
											onClick={() =>
												updateConfig({
													...config,
													emojiOnTop:
														!config.emojiOnTop,
												})
											}
										>
											<span className="button-icon">
												{config.emojiOnTop
													? "⬆️"
													: "⬅️"}
											</span>
										</button>
									</Tooltip>
									<Tooltip
										text={t(
											"view.yearlyGlance.actions.wrapText"
										)}
									>
										<button
											className="actions-button wrap-text-button"
											onClick={() =>
												updateConfig({
													...config,
													wrapEventText:
														!config.wrapEventText,
												})
											}
										>
											<span className="button-icon">
												{config.wrapEventText
													? "🔤"
													: "✂️"}
											</span>
										</button>
									</Tooltip>
								</>
							)}

							{viewType === "list" && (
								<>
									<Tooltip
										text={t(
											"view.yearlyGlance.actions.limitListHeight"
										)}
									>
										<button
											className="actions-button limit-list-height-button"
											onClick={() =>
												updateConfig({
													...config,
													limitListHeight:
														!limitListHeight,
												})
											}
										>
											<span className="button-icon">
												{limitListHeight ? "🚧" : "♾️"}
											</span>
										</button>
									</Tooltip>

									<Tooltip
										text={t(
											"view.yearlyGlance.actions.hideEmptyDates"
										)}
									>
										<button
											className="actions-button hide-empty-dates-button"
											onClick={() =>
												updateConfig({
													...config,
													hideEmptyDates:
														!hideEmptyDates,
												})
											}
										>
											<span className="button-icon">
												{hideEmptyDates ? "🙈" : "👀"}
											</span>
										</button>
									</Tooltip>
								</>
							)}

							{/* 显示工具提示 */}
							<Tooltip
								text={t(
									"view.yearlyGlance.actions.showTooltips"
								)}
							>
								<button
									className={`actions-button show-tooltips-button ${
										config.showTooltips ? "active" : ""
									}`}
									onClick={() =>
										updateConfig({
											...config,
											showTooltips: !config.showTooltips,
										})
									}
								>
									<span className="button-icon">💬</span>
								</button>
							</Tooltip>
							</>
							)}

							{/* 事件管理 */}
							<Tooltip
								text={t("view.yearlyGlance.actions.manager")}
							>
								<button
									className="actions-button glance-manager-button"
									onClick={handleGlanceManager}
								>
									<span className="button-icon">🗂️</span>
								</button>
							</Tooltip>

							{/* 事件添加 */}
							<Tooltip text={t("view.yearlyGlance.actions.form")}>
								<button
									className="actions-button event-form-button"
									onClick={handleEventForm}
								>
									<span className="button-icon">✏️</span>
								</button>
							</Tooltip>

							<Tooltip text={t("view.yearlyGlance.actions.goToToday")}>
								<button
									className="actions-button go-to-today-button"
									onClick={handleGoToToday}
								>
									<span className="button-icon">🎯</span>
								</button>
							</Tooltip>
						</div>
						</div>
					</div>
				)}
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
	private externalEvents?: CalendarEvent[];
	private inheritPluginData?: boolean;

	constructor(container: HTMLElement, plugin: YearlyGlancePlugin) {
		this.container = container;
		this.plugin = plugin;
	}

	// 新增：支持外部数据渲染
	renderWithEvents(events: CalendarEvent[], inheritPluginData?: boolean) {
		this.externalEvents = events;
		this.inheritPluginData = inheritPluginData;

		// 复用现有的 root，避免闪烁
		if (!this.root) {
			this.container.empty();
			this.root = createRoot(this.container);
		}
		this.render();
	}

	async initialize(plugin: YearlyGlancePlugin) {
		this.plugin = plugin;
		this.externalEvents = undefined;

		// 复用现有的 root，避免闪烁
		if (!this.root) {
			this.container.empty();
			this.root = createRoot(this.container);
		}
		this.render();
	}

	render() {
		if (this.root) {
			this.root.render(
				<React.StrictMode>
					<YearlyCalendarView plugin={this.plugin} externalEvents={this.externalEvents} inheritPluginData={this.inheritPluginData} />
				</React.StrictMode>
			);
		}
	}

	destroy() {
		// 注意：不在 destroy() 中更新配置，以避免触发 YearlyGlanceBus
		// 导致 YearlyGlanceBasesView 无限循环
		// 配置重置应该由调用者负责处理

		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
		this.externalEvents = undefined;
	}
}
