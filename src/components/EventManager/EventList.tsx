import * as React from "react";
import {
	Birthday,
	CustomEvent,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { ChevronDown, ChevronRight, Eye, EyeClosed } from "lucide-react";
import { EventItem } from "./EventItem";
import { SortDirection, SortField } from "./SortControls";
import { t } from "@/src/i18n/i18n";

interface EventListProps {
	events: Array<Holiday | Birthday | CustomEvent>;
	onEdit: (event: Holiday | Birthday | CustomEvent) => void;
	onDelete: (event: Holiday | Birthday | CustomEvent) => void;
	eventType: EventType;
	updateEvents: (events: Array<Holiday | Birthday | CustomEvent>) => void;
	sortField: SortField;
	sortDirection: SortDirection;
}

// 事件列表组件
export const EventList: React.FC<EventListProps> = ({
	events,
	onEdit,
	onDelete,
	eventType,
	updateEvents,
	sortField,
	sortDirection,
}) => {
	const [builtinCollapsed, setBuiltinCollapsed] = React.useState(true);
	const isSearchMode = events.some((event) =>
		(event as any).type === "BUILTIN" || (event as any).type === "CUSTOM"
			? "holiday" !== eventType
			: (event as any).age !== undefined
			? "birthday" !== eventType
			: "customEvent" !== eventType
	);

	const toggleAllBuiltinHolidays = async (hide: boolean) => {
		const newEvents = events.filter(
			(event) => (event as Holiday).type === "BUILTIN"
		);
		newEvents.forEach((event) => {
			(event as Holiday).isHidden = hide;
		});

		await updateEvents(newEvents);
	};
	const checkAllBuiltinHolidays = React.useCallback(() => {
		const allBuiltinHolidays = events.filter(
			(event) => (event as Holiday).type === "BUILTIN"
		);
		// 如果所有内置节日都隐藏，则返回true，否则返回false
		return allBuiltinHolidays.every((event) => (event as Holiday).isHidden);
	}, [events]);

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
		eventsToSort: Array<Holiday | Birthday | CustomEvent>
	) => {
		if (!sortField) return eventsToSort;

		return [...eventsToSort].sort((a, b) => {
			if (sortField === "name") {
				const compareResult = a.text.localeCompare(b.text);
				return sortDirection === "asc" ? compareResult : -compareResult;
			} else if (sortField === "date") {
				const dateA = a.dateArr![0];
				const dateB = b.dateArr![0];

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
		const holidayEvents = sortEvents(
			events.filter(
				(event) =>
					(event as any).type === "BUILTIN" ||
					(event as any).type === "CUSTOM"
			)
		);
		const birthdayEvents = sortEvents(
			events.filter(
				(event) =>
					(event as any).age !== undefined && !(event as any).type
			)
		);
		const customEvents = sortEvents(
			events.filter(
				(event) =>
					!(event as any).type && (event as any).age === undefined
			)
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
									canDelete={
										(event as any).type !== "BUILTIN"
									}
									eventType="holiday"
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
									canDelete={true}
									eventType="birthday"
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
									canDelete={true}
									eventType="customEvent"
								/>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	// 对于节日类型，分组显示内置和自定义节日
	if (eventType === "holiday") {
		const builtinHolidays = sortEvents(
			events.filter((event) => (event as Holiday).type === "BUILTIN")
		);
		const customHolidays = sortEvents(
			events.filter((event) => (event as Holiday).type === "CUSTOM")
		);

		return (
			<div className="event-list" data-type={eventType}>
				{builtinHolidays.length > 0 && (
					<div className="event-group">
						<div className="event-group-header collapsible">
							<div
								className="header-left"
								onClick={() =>
									setBuiltinCollapsed(!builtinCollapsed)
								}
							>
								<h4>
									{t("view.eventManager.holiday.builtin")}
								</h4>
								<span className="collapse-icon">
									{builtinCollapsed ? (
										<ChevronRight />
									) : (
										<ChevronDown />
									)}
								</span>
							</div>
							<div className="header-right">
								<button
									className="builtin-event-hidden-toggle"
									onClick={() => {
										toggleAllBuiltinHolidays(
											!checkAllBuiltinHolidays()
										);
									}}
									title={t(
										"view.eventManager.actions.toggleBuiltinEventHidden"
									)}
								>
									{checkAllBuiltinHolidays() ? (
										<EyeClosed />
									) : (
										<Eye />
									)}
								</button>
								<span className="event-count">
									{builtinHolidays.length}
								</span>
							</div>
						</div>

						<div
							className={`event-items-grid ${
								builtinCollapsed ? "collapsed" : ""
							}`}
						>
							{builtinHolidays.map((event, index) => (
								<EventItem
									key={`builtin-${index}`}
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
		<div className="event-list" data-type={eventType}>
			<div className="event-items-grid">
				{sortEvents(events).map((event, index) => (
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
