import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "@/src/main";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { EVENT_TYPE_OPTIONS } from "./EventFormModal";
import { useYearlyGlanceConfig } from "@/src/core/hook/useYearlyGlanceConfig";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "../Base/Input";
import { ConfirmDialog } from "../Base/ConfirmDialog";
import { t } from "@/src/i18n/i18n";
import { parseDateValue } from "@/src/core/utils/dateParser";
import { VIEW_TYPE_YEARLY_GLANCE } from "@/src/views/YearlyGlanceView";
import {
	EVENT_SEARCH_REQUESTED,
	EventManagerBus,
} from "@/src/core/hook/useEventBus";
import "./style/EventManagerView.css";

interface EventItemProps {
	event: Holiday | Birthday | CustomEvent;
	onEdit: () => void;
	onDelete: () => void;
	canDelete: boolean;
	eventType: EventType;
}

interface EventListProps {
	events: Array<Holiday | Birthday | CustomEvent>;
	onEdit: (event: Holiday | Birthday | CustomEvent) => void;
	onDelete: (event: Holiday | Birthday | CustomEvent) => void;
	eventType: EventType;
}

interface EventManagerViewProps {
	plugin: YearlyGlancePlugin;
}

// 事件列表项组件
const EventItem: React.FC<EventItemProps> = ({
	event,
	onEdit,
	onDelete,
	canDelete,
	eventType,
}) => {
	// 获取事件特定信息
	const getEventSpecificInfo = () => {
		if (eventType === "holiday") {
			const holiday = event as Holiday;
			return (
				<>
					<div className="event-info-row" data-property="isShow">
						<span className="info-label">
							{t("view.eventManager.holiday.isShow")}:
						</span>
						<span
							className={`info-value ${
								holiday.isShow ? "active" : "inactive"
							}`}
						>
							{holiday.isShow ? "✔" : "✘"}
						</span>
					</div>
					{holiday.foundDate && (
						<div
							className="event-info-row"
							data-property="foundDate"
						>
							<span className="info-label">
								{t("view.eventManager.holiday.foundDate")}:
							</span>
							<span className="info-value">
								{holiday.foundDate}
							</span>
						</div>
					)}
				</>
			);
		} else if (eventType === "birthday") {
			const birthday = event as Birthday;
			return (
				<>
					{birthday.age !== undefined && (
						<div className="event-info-row" data-property="age">
							<span className="info-label">
								{t("view.eventManager.birthday.age")}:
							</span>
							<span className="info-value">{birthday.age}</span>
						</div>
					)}
					<div
						className="event-info-row"
						data-property="nextBirthday"
					>
						<span className="info-label">
							{t("view.eventManager.birthday.nextBirthday")}:
						</span>
						<span className="info-value">
							{birthday.nextBirthday}
						</span>
					</div>
					{birthday.animal !== undefined && (
						<div className="event-info-row" data-property="animal">
							<span className="info-label">
								{t("view.eventManager.birthday.animal")}:
							</span>
							<span className="info-value">
								{birthday.animal}
							</span>
						</div>
					)}
					{birthday.zodiac !== undefined && (
						<div className="event-info-row" data-property="zodiac">
							<span className="info-label">
								{t("view.eventManager.birthday.zodiac")}:
							</span>
							<span className="info-value">
								{birthday.zodiac}
							</span>
						</div>
					)}
				</>
			);
		} else {
			const customEvent = event as CustomEvent;
			return (
				<div className="event-info-row" data-property="isRepeat">
					<span className="info-label">
						{t("view.eventManager.customEvent.repeat")}:
					</span>
					<span
						className={`info-value ${
							customEvent.isRepeat ? "active" : "inactive"
						}`}
					>
						{customEvent.isRepeat ? "✔" : "✘"}
					</span>
				</div>
			);
		}
	};

	const displayDate = (date: string, dateType: "SOLAR" | "LUNAR") => {
		const { hasYear, yearName, monthName, dayName } = parseDateValue(
			date,
			dateType
		);
		let dateStr;
		if (hasYear) {
			if (dateType === "SOLAR") {
				dateStr = `${yearName}-${monthName}-${dayName}`;
			} else {
				dateStr = `${yearName}年${monthName}月${dayName}`;
			}
		} else {
			if (dateType === "SOLAR") {
				dateStr = `${monthName}-${dayName}`;
			} else {
				dateStr = `${monthName}月${dayName}`;
			}
		}
		return dateStr;
	};

	return (
		<div className="event-item">
			<div className="event-item-content">
				<div className="event-header">
					<div
						className="event-title"
						style={{
							color:
								event.color ??
								EVENT_TYPE_DEFAULT[eventType].color,
							backgroundColor: `${
								event.color ??
								EVENT_TYPE_DEFAULT[eventType].color
							}20`,
						}}
					>
						<span>
							{event.emoji ?? EVENT_TYPE_DEFAULT[eventType].emoji}
							{event.text}
						</span>
					</div>
				</div>

				<div className="event-date">
					<span className="date-icon">
						{event.dateType === "LUNAR" ? "🌙" : "🌞"}
					</span>
					<span>{displayDate(event.date, event.dateType)}</span>
				</div>

				{event.remark && (
					<div className="event-remark">
						<span className="remark-icon">💬</span>
						<span>{event.remark}</span>
					</div>
				)}

				<div className="event-specific-info">
					{getEventSpecificInfo()}
				</div>
			</div>

			<div className="event-actions">
				<button
					className="edit-button"
					onClick={onEdit}
					title={t("view.eventManager.actions.edit")}
				>
					✏️
				</button>
				{canDelete && (
					<button
						className="delete-button"
						onClick={onDelete}
						title={t("view.eventManager.actions.delete")}
					>
						🗑️
					</button>
				)}
			</div>
		</div>
	);
};

// 事件列表组件
const EventList: React.FC<EventListProps> = ({
	events,
	onEdit,
	onDelete,
	eventType,
}) => {
	const [internatCollapsed, setInternatCollapsed] = React.useState(true);

	if (events.length === 0) {
		return (
			<div className="empty-list">
				<div className="empty-icon">📭</div>
				<div className="empty-text">
					{t("view.eventManager.empty.text")}
				</div>
				<div className="empty-subtext">
					{t("view.eventManager.empty.subtext")}
				</div>
			</div>
		);
	}

	// 对于节日类型，分组显示内置和自定义节日
	if (eventType === "holiday") {
		const internatHolidays = events.filter(
			(event) => (event as Holiday).type === "INTERNAT"
		);
		const customHolidays = events.filter(
			(event) => (event as Holiday).type === "CUSTOM"
		);

		return (
			<div className="event-list">
				{internatHolidays.length > 0 && (
					<div className="event-group">
						<div
							className="event-group-header collapsible"
							onClick={() =>
								setInternatCollapsed(!internatCollapsed)
							}
						>
							<div className="header-left">
								<h4>
									{t("view.eventManager.holiday.internat")}
								</h4>
								<span className="collapse-icon">
									{internatCollapsed ? (
										<ChevronRight />
									) : (
										<ChevronDown />
									)}
								</span>
							</div>
							<span className="event-count">
								{internatHolidays.length}
							</span>
						</div>

						<div
							className={`event-items-grid ${
								internatCollapsed ? "collapsed" : ""
							}`}
						>
							{internatHolidays.map((event, index) => (
								<EventItem
									key={`internat-${index}`}
									event={event}
									onEdit={() => onEdit(event)}
									onDelete={() => onDelete(event)}
									canDelete={false}
									eventType={eventType}
								/>
							))}
						</div>
					</div>
				)}

				{customHolidays.length > 0 && (
					<div className="event-group">
						<div className="event-group-header">
							<div className="header-left">
								<h4>{t("view.eventManager.holiday.custom")}</h4>
							</div>
							<span className="event-count">
								{customHolidays.length}
							</span>
						</div>

						<div className="event-items-grid">
							{customHolidays.map((event, index) => (
								<EventItem
									key={`custom-${index}`}
									event={event}
									onEdit={() => onEdit(event)}
									onDelete={() => onDelete(event)}
									canDelete={true}
									eventType={eventType}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	// 生日和自定义事件直接显示列表
	return (
		<div className="event-list">
			<div className="event-items-grid">
				{events.map((event, index) => (
					<EventItem
						key={index}
						event={event}
						onEdit={() => onEdit(event)}
						onDelete={() => onDelete(event)}
						canDelete={true}
						eventType={eventType}
					/>
				))}
			</div>
		</div>
	);
};

const EventManagerView: React.FC<EventManagerViewProps> = ({ plugin }) => {
	const { events, updateEvents } = useYearlyGlanceConfig(plugin);
	// 激活的标签页
	const [activeTab, setActiveTab] = React.useState<EventType>("customEvent");
	const [searchTerm, setSearchTerm] = React.useState("");
	const [searchExpanded, setSearchExpanded] = React.useState(false);
	const searchContainerRef = React.useRef<HTMLDivElement>(null);

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

	// 添加新事件
	const handleAddEvent = () => {
		plugin.openEventForm(activeTab, {}, false, false);
	};

	// 编辑事件
	const handleEditEvent = (event: Holiday | Birthday | CustomEvent) => {
		plugin.openEventForm(activeTab, event, true, false);
	};

	// 删除事件
	const handleDeleteEvent = async (
		event: Holiday | Birthday | CustomEvent
	) => {
		// 内置节日不能删除
		if (activeTab === "holiday" && (event as Holiday).type === "INTERNAT") {
			return;
		}

		new ConfirmDialog(plugin, {
			title: t("view.eventManager.actions.delete"),
			message: t("view.eventManager.actions.deleteConfirm", {
				name: event.text,
			}),
			onConfirm: async () => {
				const newEvents = { ...events };
				const eventId = event.id;

				if (activeTab === "holiday") {
					newEvents.holidays = events.holidays.filter(
						(h) => h.id !== eventId
					);
				} else if (activeTab === "birthday") {
					newEvents.birthdays = events.birthdays.filter(
						(b) => b.id !== eventId
					);
				} else {
					newEvents.customEvents = events.customEvents.filter(
						(c) => c.id !== eventId
					);
				}

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
				const results: Array<Holiday | Birthday | CustomEvent> = [
					...events.holidays.filter(
						(event) => event.id?.toString() === idTerm
					),
					...events.birthdays.filter(
						(event) => event.id?.toString() === idTerm
					),
					...events.customEvents.filter(
						(event) => event.id?.toString() === idTerm
					),
				];
				return results;
			}

			// 常规搜索 - 从所有事件类型中搜索
			const results: Array<Holiday | Birthday | CustomEvent> = [
				...events.holidays.filter(
					(event) =>
						event.text.toLowerCase().includes(term) ||
						(event.remark &&
							event.remark.toLowerCase().includes(term)) ||
						event.date.includes(term)
				),
				...events.birthdays.filter(
					(event) =>
						event.text.toLowerCase().includes(term) ||
						(event.remark &&
							event.remark.toLowerCase().includes(term)) ||
						event.date.includes(term)
				),
				...events.customEvents.filter(
					(event) =>
						event.text.toLowerCase().includes(term) ||
						(event.remark &&
							event.remark.toLowerCase().includes(term)) ||
						event.date.includes(term)
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
		};
	};

	const eventCounts = getEventCounts();

	return (
		<div className="yg-event-manager-container">
			<div className="yg-event-manager-header">
				<div className="yg-event-tabs">
					{EVENT_TYPE_OPTIONS.map((option) => (
						<div
							key={option.value}
							className={`yg-event-tab ${
								activeTab === option.value && !isSearching
									? "active"
									: ""
							} ${isSearching ? "search-mode" : ""}`}
							onClick={() =>
								setActiveTab(option.value as EventType)
							}
						>
							<span className="tab-label">{option.label}</span>
							<span className="tab-count">
								{eventCounts[option.value as EventType]}
							</span>
						</div>
					))}
				</div>

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
								<button
									className="clear-search"
									onClick={() => {
										setSearchTerm("");
										// 如果搜索框为空，点击清除按钮会收起搜索框
										if (searchTerm === "") {
											toggleSearch();
										}
									}}
									title={t(
										"view.eventManager.actions.clearSearch"
									)}
								>
									✕
								</button>
							</>
						) : (
							<button
								className="search-toggle"
								onClick={toggleSearch}
								title={t("view.eventManager.actions.search")}
							>
								🔍
							</button>
						)}
					</div>

					<button
						className="yearly-calendar-button"
						onClick={handleYearlyCalendar}
						title={t("view.eventManager.actions.yearlyCalendar")}
					>
						🔭
					</button>

					<button
						className="add-event-button"
						onClick={handleAddEvent}
					>
						<span className="add-icon">+</span>
						<span>{t("view.eventManager.actions.add")}</span>
					</button>
				</div>
			</div>

			<div className="event-manager-content">
				<EventList
					events={getCurrentEvents()}
					onEdit={handleEditEvent}
					onDelete={handleDeleteEvent}
					eventType={activeTab}
				/>
			</div>
		</div>
	);
};

export class EventManager {
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
					<EventManagerView plugin={this.plugin} />
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
