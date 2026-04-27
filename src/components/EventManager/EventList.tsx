import * as React from "react";
import { Birthday, CustomEvent, EventType, Holiday } from "@/src/type/Events";
import { EventItem } from "./EventItem";
import { SortDirection, SortField } from "./SortControls";
import { t } from "@/src/i18n/i18n";
import YearlyGlancePlugin from "@/src/main";
import { CalendarEvent } from "@/src/type/CalendarEvent";

interface EventListProps {
	events: Array<Holiday | Birthday | CustomEvent | CalendarEvent>;
	onEdit: (event: Holiday | Birthday | CustomEvent | CalendarEvent) => void;
	onDelete: (event: Holiday | Birthday | CustomEvent) => void;
	eventType: EventType;
	sortField: SortField;
	sortDirection: SortDirection;
	isSearchMode?: boolean; // 是否为搜索模式
	gregorianDisplayFormat: string; // 公历显示格式
	plugin: YearlyGlancePlugin;
}

// 事件列表组件
export const EventList: React.FC<EventListProps> = ({
	events,
	onEdit,
	onDelete,
	eventType,
	sortField,
	sortDirection,
	isSearchMode = false, // 默认为非搜索模式
	gregorianDisplayFormat,
	plugin,
}) => {
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

	// 排序事件的函数
	const sortEvents = (
		eventsToSort: Array<Holiday | Birthday | CustomEvent | CalendarEvent>
	) => {
		if (!sortField) return eventsToSort;

		return [...eventsToSort].sort((a, b) => {
			if (sortField === "name") {
				const compareResult = a.text.localeCompare(b.text);
				return sortDirection === "asc" ? compareResult : -compareResult;
			} else if (sortField === "date") {
				// 优先使用 eventDate.isoDate，如果没有则使用 dateArr[0]
				const dateA = a.eventDate?.isoDate || a.dateArr?.[0];
				const dateB = b.eventDate?.isoDate || b.dateArr?.[0];

				if (dateA && dateB) {
					return sortDirection === "asc"
						? dateA.localeCompare(dateB)
						: dateB.localeCompare(dateA);
				}
			}
			return 0;
		});
	};

	// 搜索模式下，按事件类型分组显示结果
	if (isSearchMode) {
		// 将事件按类型分组
		const holidayEvents = sortEvents(events).filter((event) =>
			event.id.contains("holi")
		);
		const birthdayEvents = sortEvents(
			events.filter((event) => event.id.contains("birth"))
		);
		const customEvents = sortEvents(
			events.filter((event) => event.id.contains("event"))
		);
		const basesEvents = sortEvents(
			events.filter((event) => event.id.startsWith("bases-"))
		);
		const dailyNoteEvents = sortEvents(
			events.filter((event) => event.id.startsWith("dailynote-"))
		);

		return (
			<div className="event-list search-results">
				{holidayEvents.length > 0 && (
					<div className="event-group">
						<div className="event-group-header">
							<div className="header-left">
								<h4>{t("view.eventManager.holiday.name")}</h4>
							</div>
							<span className="event-count">
								{holidayEvents.length}
							</span>
						</div>
						<div className="event-items-grid">
							{holidayEvents.map((event, index) => (
								<EventItem
									key={`holiday-${index}`}
									event={event}
									onEdit={() => onEdit(event)}
									onDelete={() => onDelete(event)}
									eventType="holiday"
									gregorianDisplayFormat={
										gregorianDisplayFormat
									}
									plugin={plugin}
								/>
							))}
						</div>
					</div>
				)}

				{birthdayEvents.length > 0 && (
					<div className="event-group">
						<div className="event-group-header">
							<div className="header-left">
								<h4>{t("view.eventManager.birthday.name")}</h4>
							</div>
							<span className="event-count">
								{birthdayEvents.length}
							</span>
						</div>
						<div className="event-items-grid">
							{birthdayEvents.map((event, index) => (
								<EventItem
									key={`birthday-${index}`}
									event={event}
									onEdit={() => onEdit(event)}
									onDelete={() => onDelete(event)}
									eventType="birthday"
									gregorianDisplayFormat={
										gregorianDisplayFormat
									}
									plugin={plugin}
								/>
							))}
						</div>
					</div>
				)}

				{customEvents.length > 0 && (
					<div className="event-group">
						<div className="event-group-header">
							<div className="header-left">
								<h4>
									{t("view.eventManager.customEvent.name")}
								</h4>
							</div>
							<span className="event-count">
								{customEvents.length}
							</span>
						</div>
						<div className="event-items-grid">
							{customEvents.map((event, index) => (
								<EventItem
									key={`custom-${index}`}
									event={event}
									onEdit={() => onEdit(event)}
									onDelete={() => onDelete(event)}
									eventType="customEvent"
									gregorianDisplayFormat={
										gregorianDisplayFormat
									}
									plugin={plugin}
								/>
							))}
						</div>
					</div>
				)}

				{basesEvents.length > 0 && (
					<div className="event-group">
						<div className="event-group-header">
							<div className="header-left">
								<h4>
									{t("view.eventManager.basesEvent.name")}
								</h4>
							</div>
							<span className="event-count">
								{basesEvents.length}
							</span>
						</div>
						<div className="event-items-grid">
							{basesEvents.map((event, index) => (
								<EventItem
									key={`bases-${index}`}
									event={event}
									onEdit={() => onEdit(event)}
									onDelete={() => onDelete(event)}
									eventType="basesEvent"
									gregorianDisplayFormat={
										gregorianDisplayFormat
									}
									plugin={plugin}
								/>
							))}
						</div>
					</div>
				)}

				{dailyNoteEvents.length > 0 && (
					<div className="event-group">
						<div className="event-group-header">
							<div className="header-left">
								<h4>
									{t("view.eventManager.dailyNoteEvent.name")}
								</h4>
							</div>
							<span className="event-count">
								{dailyNoteEvents.length}
							</span>
						</div>
						<div className="event-items-grid">
							{dailyNoteEvents.map((event, index) => (
								<EventItem
									key={`dailynote-${index}`}
									event={event}
									onEdit={() => onEdit(event)}
									onDelete={() => onDelete(event)}
									eventType="dailyNoteEvent"
									gregorianDisplayFormat={
										gregorianDisplayFormat
									}
									plugin={plugin}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="event-list" data-type={eventType}>
			<div className="event-items-grid">
				{sortEvents(events).map((event, index) => (
					<EventItem
						key={index}
						event={event}
						onEdit={() => onEdit(event)}
						onDelete={() => onDelete(event)}
						eventType={eventType}
						gregorianDisplayFormat={gregorianDisplayFormat}
						plugin={plugin}
					/>
				))}
			</div>
		</div>
	);
};
