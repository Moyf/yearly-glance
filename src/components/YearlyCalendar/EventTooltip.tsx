import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { Birthday, CustomEvent, Holiday } from "@/src/core/interfaces/Events";
import { t } from "@/src/i18n/i18n";
import "./style/EventTooltip.css";

interface EventTooltipContentProps {
	event: any;
}

const EventTooltipContent: React.FC<EventTooltipContentProps> = ({ event }) => {
	const eventType = event.type;

	return (
		<div className="yg-event-tooltip-content">
			<div
				className="tooltip-header"
				style={{ backgroundColor: event.color }}
			>
				<span className="tooltip-emoji">{event.emoji}</span>
				<span className="tooltip-title">{event.text}</span>
			</div>

			<div className="tooltip-body">
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
									{event.age}
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
									{event.animal}
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

	constructor(plugin: YearlyGlancePlugin, event: any) {
		super(plugin.app);
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
				<EventTooltipContent event={this.event} />
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
