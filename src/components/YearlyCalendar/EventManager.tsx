import * as React from "react";
import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import {
	Birthday,
	CustomEvent,
	Events,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import "./style/EventManagerView.css";

interface EventManagerViewProps {
	config: YearlyGlanceConfig;
	plugin: YearlyGlancePlugin;
}

// 标签页组件
const TabButton: React.FC<{
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}> = ({ active, onClick, children }) => (
	<button
		className={`event-tab-button ${active ? "active" : ""}`}
		onClick={onClick}
	>
		{children}
	</button>
);

// 事件列表组件
const EventList: React.FC<{
	events: Array<Holiday | Birthday | CustomEvent>;
	onEdit: (event: Holiday | Birthday | CustomEvent) => void;
	onDelete: (event: Holiday | Birthday | CustomEvent) => void;
	eventType: EventType;
}> = ({ events, onEdit, onDelete, eventType }) => {
	if (events.length === 0) {
		return <div className="empty-list">无事件</div>;
	}

	return (
		<div className="event-list">
			{events.map((event, index) => (
				<div key={index} className="event-item">
					<div className="event-item-content">
						<span className="event-emoji">
							{event.emoji || "📅"}
						</span>
						<div className="event-details">
							<div className="event-title">
								{event.text}
								<span className="event-date">
									{event.dateType === "LUNAR" ? "🌙" : "☀️"}{" "}
									{event.date}
								</span>
							</div>
							{event.remark && (
								<div className="event-remark">
									{event.remark}
								</div>
							)}
							{"type" in event && (
								<div className="event-type">
									{event.type === "INTERNAT"
										? "内置"
										: "自定义"}
								</div>
							)}
							{"age" in event && event.age && (
								<div className="event-age">
									年龄: {event.age}
								</div>
							)}
						</div>
					</div>
					<div className="event-actions">
						<button
							className="edit-button"
							onClick={() => onEdit(event)}
						>
							编辑
						</button>
						<button
							className="delete-button"
							onClick={() => onDelete(event)}
						>
							删除
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

const EventManagerView: React.FC<EventManagerViewProps> = ({
	config,
	plugin,
}) => {
	const [activeTab, setActiveTab] = useState<EventType>("holiday");
	const [events, setEvents] = useState<Events>(config.data);

	// 当配置更改时更新事件
	useEffect(() => {
		setEvents(config.data);
	}, [config.data]);

	// 保存事件到插件
	const saveEvents = async (newEvents: Events) => {
		await plugin.updateData(newEvents);
		setEvents(newEvents);
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

		await saveEvents(newEvents);
	};

	// 获取当前标签页的事件列表
	const getCurrentEvents = () => {
		switch (activeTab) {
			case "holiday":
				return events.holidays;
			case "birthday":
				return events.birthdays;
			case "custom":
				return events.customEvents;
			default:
				return [];
		}
	};

	return (
		<div className="event-manager-container">
			<div className="event-manager-header">
				<div className="event-tabs">
					<TabButton
						active={activeTab === "holiday"}
						onClick={() => setActiveTab("holiday")}
					>
						🎉 节日
					</TabButton>
					<TabButton
						active={activeTab === "birthday"}
						onClick={() => setActiveTab("birthday")}
					>
						🎂 生日
					</TabButton>
					<TabButton
						active={activeTab === "custom"}
						onClick={() => setActiveTab("custom")}
					>
						📆 自定义
					</TabButton>
				</div>
			</div>

			<div className="event-manager-content">
				<div className="event-list-header">
					<button
						className="add-event-button"
						onClick={handleAddEvent}
					>
						添加新事件
					</button>
				</div>

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
