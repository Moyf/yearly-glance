import * as React from "react";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { Tooltip } from "../Base/Tooltip";
import { t } from "@/src/i18n/i18n";
import { CalendarType } from "@/src/core/interfaces/Date";
import { IsoUtils } from "@/src/core/utils/isoUtils";

interface EventItemProps {
	event: Holiday | Birthday | CustomEvent;
	onEdit: () => void;
	onDelete: () => void;
	eventType: EventType;
	gregorianDisplayFormat: string; // 公历显示格式
}

// 事件列表项组件
export const EventItem: React.FC<EventItemProps> = ({
	event,
	onEdit,
	onDelete,
	eventType,
	gregorianDisplayFormat,
}) => {
	// 获取事件特定信息
	const getEventSpecificInfo = () => {
		if (eventType === "holiday") {
			const holiday = event as Holiday;
			return (
				<>
					<div className="event-info-row" data-property="isHidden">
						<span className="info-label">
							{t("view.eventManager.form.eventHidden")}:
						</span>
						<span
							className={`info-value ${
								holiday.isHidden ? "active" : "inactive"
							}`}
						>
							{holiday.isHidden ? "✔" : "✘"}
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
							<span className="info-value">
								{birthday.age}
								{birthday.age !== null ? (
									<></>
								) : (
									<Tooltip
										text={t(
											"view.eventManager.birthday.noYear"
										)}
									/>
								)}
							</span>
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
								{birthday.animal !== null ? (
									<></>
								) : (
									<Tooltip
										text={t(
											"view.eventManager.birthday.noYear"
										)}
									/>
								)}
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
								{birthday.zodiac !== null ? (
									<></>
								) : (
									<Tooltip
										text={t(
											"view.eventManager.birthday.noYear"
										)}
									/>
								)}
							</span>
						</div>
					)}
					<div className="event-info-row" data-property="isHidden">
						<span className="info-label">
							{t("view.eventManager.form.eventHidden")}:
						</span>
						<span
							className={`info-value ${
								birthday.isHidden ? "active" : "inactive"
							}`}
						>
							{birthday.isHidden ? "✔" : "✘"}
						</span>
					</div>
				</>
			);
		} else {
			const customEvent = event as CustomEvent;
			return (
				<>
					<div className="event-info-row" data-property="isHidden">
						<span className="info-label">
							{t("view.eventManager.form.eventHidden")}:
						</span>
						<span
							className={`info-value ${
								customEvent.isHidden ? "active" : "inactive"
							}`}
						>
							{customEvent.isHidden ? "✔" : "✘"}
						</span>
					</div>
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
				</>
			);
		}
	};

	const displayDate = (isoDate: string, calendar: CalendarType) => {
		return IsoUtils.formatDate(isoDate, calendar, gregorianDisplayFormat);
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
							{!event.emoji
								? EVENT_TYPE_DEFAULT[eventType].emoji
								: event.emoji}
							{event.text}
						</span>
					</div>
				</div>

				<div className="event-date">
					<span className="date-icon">
						{event.eventDate.calendar === "GREGORIAN" ? "📅" : "🌙"}
					</span>
					<span>
						{displayDate(
							event.eventDate.isoDate,
							event.eventDate.calendar
						)}
					</span>
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
				<button
					className="delete-button"
					onClick={onDelete}
					title={t("view.eventManager.actions.delete")}
				>
					🗑️
				</button>
			</div>
		</div>
	);
};
