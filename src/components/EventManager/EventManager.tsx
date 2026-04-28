import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { Birthday, CustomEvent, EventType, Holiday } from "@/src/type/Events";
import { useYearlyGlanceConfig, YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";
import { EVENT_TYPE_OPTIONS } from "@/src/components/EventForm/EventForm";
import { SortControls, SortDirection, SortField } from "./SortControls";
import { EventList } from "./EventList";
import { Input } from "@/src/components/Base/Input";
import { ConfirmDialog } from "@/src/components/Base/ConfirmDialog";
import { NavTabs } from "@/src/components/Base/NavTabs";
import { Tooltip } from "@/src/components/Base/Tooltip";
import { t } from "@/src/i18n/i18n";
import { VIEW_TYPE_YEARLY_GLANCE } from "@/src/views/YearlyGlanceView";
import {
	EVENT_SEARCH_REQUESTED,
	EventManagerBus,
} from "@/src/hooks/useEventBus";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { NoteEventService } from "@/src/service/NoteEventService";
import { DailyNoteService } from "@/src/service/DailyNoteService";
import "./style/EventManagerView.css";

interface EventManagerViewProps {
	plugin: YearlyGlancePlugin;
}

export const EventManagerView: React.FC<EventManagerViewProps> = ({
	plugin,
}) => {
	const { events, updateEvents } = useYearlyGlanceConfig(plugin);
	// 激活的标签页
	const [activeTab, setActiveTab] = React.useState<EventType>("customEvent");
	const [searchTerm, setSearchTerm] = React.useState("");
	const [searchExpanded, setSearchExpanded] = React.useState(false);
	const searchContainerRef = React.useRef<HTMLDivElement>(null);

	// 添加排序状态
	const [sortField, setSortField] = React.useState<SortField>("date");
	const [sortDirection, setSortDirection] =
		React.useState<SortDirection>("asc");

	// 笔记事件状态
	const [basesEvents, setBasesEvents] = React.useState<CalendarEvent[]>([]);
	// 日记事件状态
	const [dailyNoteEvents, setDailyNoteEvents] = React.useState<CalendarEvent[]>([]);
	const { config } = useYearlyGlanceConfig(plugin);

	const gregorianDisplayFormat = config.gregorianDisplayFormat;

	// 加载笔记事件
	React.useEffect(() => {
		const loadBasesEvents = () => {
			if (config.showBasesEvents && config.defaultBasesEventPath) {
				const noteEventService = new NoteEventService(plugin.app, config);
				noteEventService.loadEventsFromPath(config.defaultBasesEventPath, config.year)
					.then(setBasesEvents)
					.catch((error) => {
						console.error("[YearlyGlance] Failed to load note events:", error);
						setBasesEvents([]);
					});
			} else {
				setBasesEvents([]);
			}
		};

		// 初始加载
		loadBasesEvents();

		// 仅订阅 Bases 事件更新
		const unsubscribe = YearlyGlanceBus.subscribeTopics(['bases-data'], loadBasesEvents);

		return unsubscribe;
	}, [plugin, plugin.app, config.showBasesEvents, config.defaultBasesEventPath, config.year]);

	// 加载日记事件
	React.useEffect(() => {
		const loadDailyNoteEvents = () => {
			if (config.showDailyNoteEvents) {
				DailyNoteService.loadEventsForYear(
					plugin.app,
					config.year,
					config.dailyNoteSource,
					config.dailyNoteEventProp
				)
					.then(setDailyNoteEvents)
					.catch((error) => {
						console.error("[YearlyGlance] Failed to load daily note events:", error);
						setDailyNoteEvents([]);
					});
			} else {
				setDailyNoteEvents([]);
			}
		};

		loadDailyNoteEvents();

		const unsubscribe = YearlyGlanceBus.subscribeTopics(['dailynote-data'], loadDailyNoteEvents);
		return unsubscribe;
	}, [plugin, plugin.app, config.showDailyNoteEvents, config.dailyNoteSource, config.dailyNoteEventProp, config.year]);

	// 订阅事件总线，处理搜索请求
	React.useEffect(() => {
		// 订阅搜索请求事件
		const unsubscribe = EventManagerBus.subscribe(
			EVENT_SEARCH_REQUESTED,
			(data) => {
				if (data.searchType === "id") {
					// 设置搜索词为@id格式
					setSearchTerm(`@id ${data.searchValue}`);
					// 确保搜索框展开
					setSearchExpanded(true);
				}
			}
		);

		// 组件卸载时取消订阅
		return () => {
			unsubscribe();
		};
	}, []);

	const handleYearlyCalendar = () => {
		plugin.openPluginView(VIEW_TYPE_YEARLY_GLANCE);
	};

	// 处理排序变更
	const handleSortChange = (field: SortField, direction: SortDirection) => {
		setSortField(field);
		setSortDirection(direction);
	};

	// 添加新事件
	const handleAddEvent = () => {
		plugin.openEventForm(activeTab, {}, false, false);
	};

	// 编辑事件
	const handleEditEvent = (event: Holiday | Birthday | CustomEvent | CalendarEvent) => {
		// 检查是否为笔记事件
		if ((event as CalendarEvent).id?.startsWith("bases-")) {
			plugin.openEventForm("basesEvent", event, true, false);
			return;
		}

		// 检查是否为日记事件
		if ((event as CalendarEvent).id?.startsWith("dailynote-")) {
			plugin.openEventForm("dailyNoteEvent", event, true, false);
			return;
		}

		// 在搜索模式下，需要根据事件类型确定要打开的编辑表单类型
		let eventType = activeTab;

		// 根据事件特性判断其实际类型
		if ((event as Holiday).id.contains("holi")) {
			eventType = "holiday";
		} else if ((event as Birthday).id.contains("birth")) {
			eventType = "birthday";
		} else if ((event as CustomEvent).id.contains("event")) {
			eventType = "customEvent";
		} else {
			throw new Error("Unknown event type");
		}

		plugin.openEventForm(eventType, event, true, false);
	};

	// 删除事件
	const handleDeleteEvent = async (
		event: Holiday | Birthday | CustomEvent
	) => {
		new ConfirmDialog(plugin, {
			title: t("view.eventManager.actions.delete"),
			message: t("view.eventManager.actions.deleteConfirm", {
				name: event.text,
			}),
			onConfirm: async () => {
				const newEvents = { ...events };
				const eventId = event.id;

				// 直接根据ID在所有事件类型中查找并删除
				newEvents.holidays = events.holidays.filter(
					(h) => h.id !== eventId
				);
				newEvents.birthdays = events.birthdays.filter(
					(b) => b.id !== eventId
				);
				newEvents.customEvents = events.customEvents.filter(
					(c) => c.id !== eventId
				);

				await updateEvents(newEvents);
			},
		}).open();
	};

	// 获取当前标签页的事件列表
	const getCurrentEvents = () => {
		// 如果有搜索词，从所有事件中搜索
		if (searchTerm.trim()) {
			const term = searchTerm.trim().toLowerCase();

			// 检查是否使用 @id 语法进行搜索
			const idMatch = term.match(/^@id\s+(.+)$/);
			if (idMatch) {
				const idTerm = idMatch[1].trim();
				// 在所有事件类型中搜索指定ID - 使用精确匹配
				const results: Array<Holiday | Birthday | CustomEvent | CalendarEvent> = [
					...events.holidays.filter(
						(event) => event.id?.toString() === idTerm
					),
					...events.birthdays.filter(
						(event) => event.id?.toString() === idTerm
					),
					...events.customEvents.filter(
						(event) => event.id?.toString() === idTerm
					),
					...basesEvents.filter(
						(event) => event.id?.toString() === idTerm
					),
					...dailyNoteEvents.filter(
						(event) => event.id?.toString() === idTerm
					),
				];
				return results;
			}

			// 常规搜索 - 从所有事件类型中搜索
			const results: Array<Holiday | Birthday | CustomEvent | CalendarEvent> = [
				...events.holidays.filter(
					(event) =>
						event.text.toLowerCase().includes(term) ||
						(event.remark &&
							event.remark.toLowerCase().includes(term)) ||
						event.eventDate?.isoDate?.includes(term)
				),
				...events.birthdays.filter(
					(event) =>
						event.text.toLowerCase().includes(term) ||
						(event.remark &&
							event.remark.toLowerCase().includes(term)) ||
						event.eventDate?.isoDate?.includes(term)
				),
				...events.customEvents.filter(
					(event) =>
						event.text.toLowerCase().includes(term) ||
						(event.remark &&
							event.remark.toLowerCase().includes(term)) ||
						event.eventDate?.isoDate?.includes(term)
				),
				...basesEvents.filter(
					(event) =>
						event.text.toLowerCase().includes(term) ||
						(event.remark &&
							event.remark.toLowerCase().includes(term)) ||
						event.eventDate?.isoDate?.includes(term)
				),
				...dailyNoteEvents.filter(
					(event) =>
						event.text.toLowerCase().includes(term) ||
						(event.remark &&
							event.remark.toLowerCase().includes(term)) ||
						event.eventDate?.isoDate?.includes(term)
				),
			];
			return results;
		}

		// 没有搜索词时，只显示当前激活标签页的事件
		switch (activeTab) {
			case "holiday":
				return events.holidays;
			case "birthday":
				return events.birthdays;
			case "customEvent":
				return events.customEvents;
			case "basesEvent":
				return basesEvents;
			case "dailyNoteEvent":
				return dailyNoteEvents;
			default:
				return [];
		}
	};

	// 切换搜索框展开状态
	const toggleSearch = () => {
		setSearchExpanded(!searchExpanded);
		if (!searchExpanded) {
			// 当展开搜索框时，聚焦输入框
			setTimeout(() => {
				const searchInput = document.querySelector(
					".search-input"
				) as HTMLInputElement;
				if (searchInput) searchInput.focus();
			}, 100);
		} else {
			// 当收起搜索框时，清空搜索内容
			setSearchTerm("");
		}
	};

	// 处理搜索框失焦事件
	const handleSearchBlur = (e: React.FocusEvent) => {
		// 如果搜索框为空且不是点击了清除按钮，则收起搜索框
		if (
			searchTerm === "" &&
			!searchContainerRef.current?.contains(e.relatedTarget as Node)
		) {
			setSearchExpanded(false);
		}
	};

	// 判断是否在搜索模式
	const isSearching = searchTerm.trim() !== "";

	// 获取事件数量信息
	const getEventCounts = () => {
		return {
			holiday: events.holidays.length,
			birthday: events.birthdays.length,
			customEvent: events.customEvents.length,
			basesEvent: basesEvents.length,
			dailyNoteEvent: dailyNoteEvents.length,
		};
	};

	const eventCounts = getEventCounts();

	return (
		<div className="yg-event-manager-container">
			<div className="yg-event-manager-header">
				<NavTabs
					tabs={EVENT_TYPE_OPTIONS.map((option) => ({
						...option,
						count: eventCounts[option.value as EventType],
					}))}
					activeTab={activeTab}
					onClick={(tab) => setActiveTab(tab as EventType)}
					className="yg-event-tabs"
					showCounts={true}
					searchMode={isSearching}
				/>

				<div className="yg-event-actions-bar">
					<div
						ref={searchContainerRef}
						className={`search-container ${
							searchExpanded ? "expanded" : ""
						}`}
					>
						{searchExpanded ? (
							<>
								<Input
									type="text"
									className="search-input"
									placeholder={t(
										"view.eventManager.actions.search"
									)}
									value={searchTerm}
									onChange={(value) => setSearchTerm(value)}
									onBlur={handleSearchBlur}
								/>
								<Tooltip text={t("view.eventManager.actions.clearSearch")}>
								<button
									className="clear-search"
									onClick={() => {
										setSearchTerm("");
										if (searchTerm === "") {
											toggleSearch();
										}
									}}
								>
									✕
								</button>
							</Tooltip>
							</>
						) : (
							<Tooltip text={t("view.eventManager.actions.search")}>
								<button
									className="search-toggle"
									onClick={toggleSearch}
								>
									🔍
								</button>
							</Tooltip>
						)}
					</div>

					<SortControls
						sortFieldValue={sortField}
						sortDirectionValue={sortDirection}
						onSortChange={handleSortChange}
					/>
					<Tooltip text={t("view.eventManager.actions.yearlyCalendar")}>
						<button
							className="yearly-calendar-button"
							onClick={handleYearlyCalendar}
						>
							🔭
						</button>
					</Tooltip>

					<Tooltip text={t("view.yearlyGlance.actions.form")}>
						<button
							className="add-event-button"
							onClick={handleAddEvent}
						>
							<span className="add-icon">+</span>
							<span>{t("view.eventManager.actions.add")}</span>
						</button>
					</Tooltip>
				</div>
			</div>

			<div className="event-manager-content">
				<EventList
					events={getCurrentEvents()}
					onEdit={handleEditEvent}
					onDelete={handleDeleteEvent}
					eventType={activeTab}
					sortField={sortField}
					sortDirection={sortDirection}
					isSearchMode={isSearching}
					gregorianDisplayFormat={gregorianDisplayFormat}
					plugin={plugin}
				/>
			</div>
		</div>
	);
};
