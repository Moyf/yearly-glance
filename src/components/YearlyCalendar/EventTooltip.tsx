import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { VIEW_TYPE_EVENT_MANAGER } from "@/src/views/EventManagerView";
import {
	EVENT_SEARCH_REQUESTED,
	EventManagerBus,
} from "@/src/core/hook/useEventBus";
import { t } from "@/src/i18n/i18n";
import "./style/EventTooltip.css";
import { CalendarEvent } from "@/src/core/interfaces/CalendarEvent";
import { IsoExtend } from "@/src/core/utils/isoExtend";

interface EventTooltipContentProps {
	plugin: YearlyGlancePlugin;
	event: CalendarEvent;
	onClose: () => void;
}

const EventTooltipContent: React.FC<EventTooltipContentProps> = ({
	plugin,
	event,
	onClose,
}) => {
	const eventType = event.eventType;

	// 编辑事件
	const handleEditEvent = () => {
		// 将类型从 CalendarEvent.type 转换为 EventType
		const eventType = event.eventType as EventType;

		// 关闭当前tooltip，否则可能会导致UI堆叠问题
		onClose();

		// 使用延迟确保tooltip已完全关闭
		setTimeout(() => {
			plugin.openEventForm(eventType, event, true, false);
		}, 100);
	};

	// 在事件管理中打开
	const handleLocationEvent = () => {
		// 关闭当前tooltip
		onClose();

		// 使用延迟确保tooltip已完全关闭
		setTimeout(() => {
			// 打开事件管理器视图
			plugin.openPluginView(VIEW_TYPE_EVENT_MANAGER);

			// 使用延迟确保事件管理器视图已完全加载
			setTimeout(() => {
				// 通过事件总线发送搜索请求
				EventManagerBus.publish(EVENT_SEARCH_REQUESTED, {
					searchType: "id",
					searchValue: event.id,
				});
			}, 500);
		}, 100);
	};
	return (
		<div className="yg-event-tooltip-content">
			<div
				className="tooltip-header"
				style={{
					backgroundColor:
						event.color ?? EVENT_TYPE_DEFAULT[eventType].color,
				}}
			>
				<span className="tooltip-emoji">
					{event.emoji ?? EVENT_TYPE_DEFAULT[eventType].emoji}
				</span>
				<span className="tooltip-title">{event.text}</span>
				<div className="tooltip-actions">
					<button
						className="location-button"
						onClick={handleLocationEvent}
						title={t("view.eventManager.actions.location")}
					>
						📍
					</button>
					<button
						className="edit-button"
						onClick={handleEditEvent}
						title={t("view.eventManager.actions.edit")}
					>
						✏️
					</button>
				</div>
			</div>

			<div className="tooltip-body">
				{/* 日期信息 */}
				<div className="tooltip-row">
					<span className="tooltip-label">
						{t("view.eventManager.date")}:
					</span>
					<span className="tooltip-value">
						{IsoExtend.formatDate(event.eventDate.core.isoDate)}
					</span>
				</div>

				{/* 节日特有信息 */}
				{eventType === "holiday" && event.foundDate && (
					<div className="tooltip-row">
						<span className="tooltip-label">
							{t("view.eventManager.holiday.foundDate")}:
						</span>
						<span className="tooltip-value">{event.foundDate}</span>
					</div>
				)}

				{/* 生日特有信息 */}
				{eventType === "birthday" && (
					<>
						{event.age !== undefined && (
							<div className="tooltip-row">
								<span className="tooltip-label">
									{t("view.eventManager.birthday.age")}:
								</span>
								<span className="tooltip-value">
									{event.age ?? "-"}
								</span>
							</div>
						)}
						{event.nextBirthday !== undefined && (
							<div className="tooltip-row">
								<span className="tooltip-label">
									{t(
										"view.eventManager.birthday.nextBirthday"
									)}
									:
								</span>
								<span className="tooltip-value">
									{event.nextBirthday}
								</span>
							</div>
						)}
						{event.animal !== undefined && (
							<div className="tooltip-row">
								<span className="tooltip-label">
									{t("view.eventManager.birthday.animal")}:
								</span>
								<span className="tooltip-value">
									{event.animal ?? "-"}
								</span>
							</div>
						)}
						{event.zodiac !== undefined && (
							<div className="tooltip-row">
								<span className="tooltip-label">
									{t("view.eventManager.birthday.zodiac")}:
								</span>
								<span className="tooltip-value">
									{event.zodiac}
								</span>
							</div>
						)}
					</>
				)}

				{/* 备注信息（所有事件类型共有） */}
				{event.remark && (
					<div className="tooltip-row tooltip-remark">
						<span className="tooltip-value">{event.remark}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export class EventTooltip extends Modal {
	private root: Root | null = null;
	private event: Partial<Holiday | Birthday | CustomEvent>;
	private plugin: YearlyGlancePlugin;

	constructor(plugin: YearlyGlancePlugin, event: CalendarEvent) {
		super(plugin.app);
		this.plugin = plugin;
		this.event = event;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// 创建 React 根元素
		this.root = createRoot(contentEl);

		// 渲染包装组件
		this.root.render(
			<React.StrictMode>
				<EventTooltipContent
					plugin={this.plugin}
					event={this.event}
					onClose={() => this.close()}
				/>
			</React.StrictMode>
		);
	}

	onClose() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}
