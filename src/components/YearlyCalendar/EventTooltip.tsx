import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal, TFile } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import {
	Birthday,
	EVENT_TYPE_DEFAULT,
	EventType,
	Holiday,
	EventSource,
} from "@/src/type/Events";
import {
	EVENT_SEARCH_REQUESTED,
	EventManagerBus,
} from "@/src/hooks/useEventBus";
import { t } from "@/src/i18n/i18n";
import "./style/EventTooltip.css";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { IsoUtils } from "@/src/utils/isoUtils";

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

	const gregorianDisplayFormat = plugin.getConfig().gregorianDisplayFormat;

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

	// 在事件管理中打开或打开原始笔记
	const handleLocationEvent = () => {
		// 关闭当前tooltip
		onClose();

		// 检查是否是 Bases 事件
		const isBasesEvent = event.id.startsWith('bases-');

		if (isBasesEvent) {
			// 对于 Bases 事件，打开原始笔记
			openOriginalNoteForBasesEvent();
		} else {
			// 对于 Config 事件，打开事件管理器
			setTimeout(() => {
				// 打开事件管理器视图
				plugin.openGlanceManagerWithTab("events");

				// 使用延迟确保事件管理器视图已完全加载
				setTimeout(() => {
					// 通过事件总线发送搜索请求
					EventManagerBus.publish(EVENT_SEARCH_REQUESTED, {
						searchType: "id",
						searchValue: event.id,
					});
				}, 500);
			}, 100);
		}
	};

	// 打开 Bases 事件的原始笔记
	const openOriginalNoteForBasesEvent = () => {
		// 从事件ID中提取文件路径
		// bases-{filePath}-{isoDate} -> {filePath}
		// 例如: bases-Events/event-samples/测试事件.md-2026-01-10 -> Events/event-samples/测试事件.md
		const idWithoutPrefix = event.id.replace('bases-', '');

		// 从 .md 开始截断，获取文件路径
		const mdIndex = idWithoutPrefix.indexOf('.md');
		const filePath = mdIndex > 0 ? idWithoutPrefix.substring(0, mdIndex + 3) : idWithoutPrefix;

		// 在应用中查找文件
		const file = plugin.app.vault.getAbstractFileByPath(filePath);

		if (file && file instanceof TFile) {
			// 打开文件
			plugin.app.workspace.openLinkText(filePath, '', true);
		} else {
			// 如果找不到文件，显示通知
			console.warn(`[Yearly Glance] Could not find file: ${filePath}`);
		}
	};

	// 获取位置按钮的显示属性
	const getLocationButtonProps = () => {
		const isBasesEvent = event.id.startsWith('bases-');
		if (isBasesEvent) {
			return {
				icon: "📄",
				title: t("view.eventManager.actions.openOriginalNote"),
			};
		}
		return {
			icon: "📍",
			title: t("view.eventManager.actions.location"),
		};
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
						title={getLocationButtonProps().title}
					>
						{getLocationButtonProps().icon}
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
						{IsoUtils.formatDate(
							event.eventDate.isoDate,
							event.eventDate.calendar,
							gregorianDisplayFormat
						)}
					</span>
				</div>

				{/* 节日特有信息 */}
				{eventType === "holiday" && (event as Holiday).foundDate && (
					<div className="tooltip-row">
						<span className="tooltip-label">
							{t("view.eventManager.holiday.foundDate")}:
						</span>
						<span className="tooltip-value">
							{(event as Holiday).foundDate}
						</span>
					</div>
				)}

				{/* 生日特有信息 */}
				{eventType === "birthday" && (
					<>
						{(event as Birthday).age !== undefined && (
							<div className="tooltip-row">
								<span className="tooltip-label">
									{t("view.eventManager.birthday.age")}:
								</span>
								<span className="tooltip-value">
									{(event as Birthday).age ?? "-"}
								</span>
							</div>
						)}
						{(event as Birthday).nextBirthday !== undefined && (
							<div className="tooltip-row">
								<span className="tooltip-label">
									{t(
										"view.eventManager.birthday.nextBirthday"
									)}
									:
								</span>
								<span className="tooltip-value">
									{(event as Birthday).nextBirthday}
								</span>
							</div>
						)}
						{(event as Birthday).animal !== undefined && (
							<div className="tooltip-row">
								<span className="tooltip-label">
									{t("view.eventManager.birthday.animal")}:
								</span>
								<span className="tooltip-value">
									{(event as Birthday).animal ?? "-"}
								</span>
							</div>
						)}
						{(event as Birthday).zodiac !== undefined && (
							<div className="tooltip-row">
								<span className="tooltip-label">
									{t("view.eventManager.birthday.zodiac")}:
								</span>
								<span className="tooltip-value">
									{(event as Birthday).zodiac ?? "-"}
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
	private event: CalendarEvent;
	private plugin: YearlyGlancePlugin;

	constructor(plugin: YearlyGlancePlugin, event: CalendarEvent) {
		super(plugin.app);
		this.plugin = plugin;
		this.event = event;
	}

	onOpen() {
		// 使用 modalEl来渲染，不加载原有的关闭按钮和标题栏
		const { modalEl } = this;
		modalEl.empty();
		modalEl.addClass("yg-event-tooltip-modal");

		// 创建 React 根元素
		this.root = createRoot(modalEl);

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
