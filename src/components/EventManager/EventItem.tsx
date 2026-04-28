import * as React from "react";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	EventSource,
	EventType,
	Holiday,
} from "@/src/type/Events";
import { Tooltip } from "@/src/components/Base/Tooltip";
import { t } from "@/src/i18n/i18n";
import { CalendarType } from "@/src/type/Date";
import { IsoUtils } from "@/src/utils/isoUtils";
import YearlyGlancePlugin from "@/src/main";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { DailyNoteService } from "@/src/service/DailyNoteService";

interface EventItemProps {
	event: Holiday | Birthday | CustomEvent | CalendarEvent;
	onEdit: () => void;
	onDelete: () => void;
	eventType: EventType;
	gregorianDisplayFormat: string; // 公历显示格式
	plugin: YearlyGlancePlugin;
}

// 事件列表项组件
export const EventItem: React.FC<EventItemProps> = ({
	event,
	onEdit,
	onDelete,
	eventType,
	gregorianDisplayFormat,
	plugin,
}) => {
	// 从笔记事件 ID 中提取笔记路径和名称
	const extractNoteInfo = (eventId: string) => {
		if (!eventId.startsWith('bases-')) {
			return null;
		}
		// 事件 ID 格式: bases-{filePath}-{isoDate}
		// 例如: bases-Events/event-samples/测试事件.md-2026-01-10
		const idWithoutPrefix = eventId.replace('bases-', '');
		const mdIndex = idWithoutPrefix.indexOf('.md');
		if (mdIndex <= 0) {
			return null;
		}
		const filePath = idWithoutPrefix.substring(0, mdIndex + 3);
		// 提取文件名（不含路径和扩展名）
		const fileName = filePath.split('/').pop()?.replace('.md', '') || filePath;
		return { filePath, fileName };
	};

	// 从日记事件中提取笔记路径和名称
	const extractDailyNoteInfo = (calendarEvent: CalendarEvent) => {
		const filePath = DailyNoteService.getFilePathFromEvent(calendarEvent);
		if (!filePath) {
			return null;
		}
		const fileName = filePath.split('/').pop()?.replace('.md', '') || filePath;
		return { filePath, fileName };
	};

	// 打开笔记事件源文件
	const openBasesEventNote = (e: React.MouseEvent) => {
		e.stopPropagation();
		const noteInfo = extractNoteInfo(event.id);
		if (noteInfo) {
			plugin.app.workspace.openLinkText(noteInfo.filePath, '', true);
		}
	};

	// 打开日记事件源文件
	const openDailyNoteEventNote = (e: React.MouseEvent) => {
		e.stopPropagation();
		const noteInfo = extractDailyNoteInfo(event as CalendarEvent);
		if (noteInfo) {
			plugin.app.workspace.openLinkText(noteInfo.filePath, '', true);
		}
	};
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
		} else if (eventType === "basesEvent" || eventType === "dailyNoteEvent") {
			// 笔记事件和日记事件不显示额外的特定信息
			// 来源信息已在 event-source-info 区域显示
			return null;
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

				{event.remark && event.eventSource !== EventSource.DAILYNOTE && (
					<div className="event-remark">
						<span className="remark-icon">💬</span>
						<span>{event.remark}</span>
					</div>
				)}

				{event.eventSource === EventSource.BASES && (
					<div className="event-source-info">
						<span className="source-icon">📄</span>
						<span>{t("view.eventManager.source.bases")}: </span>
						<span
							className="note-link"
							onClick={openBasesEventNote}
						>
							{extractNoteInfo(event.id)?.fileName || event.id}
						</span>
					</div>
				)}

				{event.eventSource === EventSource.DAILYNOTE && (
					<div className="event-source-info">
						<span className="source-icon">📄</span>
						<span>{t("view.eventManager.source.dailynote")}: </span>
						<span
							className="note-link"
							onClick={openDailyNoteEventNote}
						>
							{extractDailyNoteInfo(event as CalendarEvent)?.fileName || event.id}
						</span>
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
				{eventType !== "basesEvent" && eventType !== "dailyNoteEvent" && (
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
