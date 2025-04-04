import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT_EMOJI,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { Select } from "../base/Select";
import { t } from "@/src/i18n/i18n";
import "./style/EventManagerView.css";
import { EVENT_TYPE_OPTIONS } from "./EventFormModal";
import { useEvents } from "@/src/core/hook/useEvents";

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
	config: YearlyGlanceConfig;
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
					<div className="event-info-row">
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
						<div className="event-info-row">
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
					{birthday.age && (
						<div className="event-info-row">
							<span className="info-label">
								{t("view.eventManager.birthday.age")}:
							</span>
							<span className="info-value">{birthday.age}</span>
						</div>
					)}
					<div className="event-info-row">
						<span className="info-label">
							{t("view.eventManager.birthday.nextBirthday")}:
						</span>
						<span className="info-value">
							{birthday.nextBirthday}
						</span>
					</div>
					{birthday.animal && (
						<div className="event-info-row">
							<span className="info-label">
								{t("view.eventManager.birthday.animal")}:
							</span>
							<span className="info-value">
								{birthday.animal}
							</span>
						</div>
					)}
					{birthday.zodiac && (
						<div className="event-info-row">
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
				<div className="event-info-row">
					<span className="info-label">
						{t("view.eventManager.custom.repeat")}:
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

	return (
		<div className="event-item">
			<div className="event-item-content">
				<div className="event-header">
					<span
						className="event-emoji"
						style={event.color ? { color: event.color } : {}}
					>
						{event.emoji || EVENT_TYPE_DEFAULT_EMOJI[eventType]}
					</span>
					<div className="event-title">
						<span>{event.text}</span>
					</div>
				</div>

				<div className="event-date">
					<span className="date-icon">
						{event.dateType === "LUNAR" ? "🌙" : "☀️"}
					</span>
					<span>{event.date}</span>
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
									{internatCollapsed ? "▶" : "▼"}
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

const EventManagerView: React.FC<EventManagerViewProps> = ({
	config,
	plugin,
}) => {
	const { events, updateEvents } = useEvents(plugin);
	const [activeTab, setActiveTab] = React.useState<EventType>("holiday");
	const [searchTerm, setSearchTerm] = React.useState("");
	const [searchExpanded, setSearchExpanded] = React.useState(false);
	const searchContainerRef = React.useRef<HTMLDivElement>(null);

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

		const newEvents = { ...events };

		if (activeTab === "holiday") {
			newEvents.holidays = events.holidays.filter((h) => h !== event);
		} else if (activeTab === "birthday") {
			newEvents.birthdays = events.birthdays.filter((b) => b !== event);
		} else {
			newEvents.customEvents = events.customEvents.filter(
				(c) => c !== event
			);
		}

		await updateEvents(newEvents);
	};

	// 获取当前标签页的事件列表
	const getCurrentEvents = () => {
		let currentEvents: Array<Holiday | Birthday | CustomEvent> = [];

		switch (activeTab) {
			case "holiday":
				currentEvents = events.holidays;
				break;
			case "birthday":
				currentEvents = events.birthdays;
				break;
			case "custom":
				currentEvents = events.customEvents;
				break;
		}

		// 如果有搜索词，过滤事件
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			return currentEvents.filter(
				(event) =>
					event.text.toLowerCase().includes(term) ||
					(event.remark &&
						event.remark.toLowerCase().includes(term)) ||
					event.date.includes(term)
			);
		}

		return currentEvents;
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

	return (
		<div className="event-manager-container">
			<div className="event-manager-header">
				<div className="event-type-selector">
					<Select
						value={activeTab}
						onValueChange={(value) =>
							setActiveTab(value as EventType)
						}
						options={EVENT_TYPE_OPTIONS}
					/>
				</div>

				<div className="event-actions-bar">
					<div
						ref={searchContainerRef}
						className={`search-container ${
							searchExpanded ? "expanded" : ""
						}`}
					>
						{searchExpanded ? (
							<>
								<input
									type="text"
									className="search-input"
									placeholder={t(
										"view.eventManager.actions.search"
									)}
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
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
					<EventManagerView
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
