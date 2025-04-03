import * as React from "react";
import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import {
	BaseEvent,
	Birthday,
	CustomEvent,
	Events,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import "./style/EventManagerView.css";
import { t } from "@/src/i18n/i18n";

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

// 事件表单组件
const EventForm: React.FC<{
	event: Partial<Holiday | Birthday | CustomEvent>;
	eventType: EventType;
	onSave: (event: Holiday | Birthday | CustomEvent) => void;
	onCancel: () => void;
	isEditing: boolean;
}> = ({ event, eventType, onSave, onCancel, isEditing }) => {
	const [formData, setFormData] =
		useState<Partial<Holiday | Birthday | CustomEvent>>(event);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value, type } = e.target;

		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData((prev) => ({ ...prev, [name]: checked }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 构建基础事件对象
		const baseEvent: BaseEvent = {
			date: formData.date || "",
			dateType: formData.dateType || "SOLAR",
			text: formData.text || "",
			isRepeat: formData.isRepeat || false,
			emoji: formData.emoji,
			color: formData.color,
			remark: formData.remark,
		};

		// 根据事件类型构建完整事件对象
		let completeEvent: Holiday | Birthday | CustomEvent;

		if (eventType === "holiday") {
			completeEvent = {
				...baseEvent,
				type: (formData as Holiday).type || "CUSTOM",
				isShow: (formData as Holiday).isShow || true,
				foundDate: (formData as Holiday).foundDate,
			} as Holiday;
		} else if (eventType === "birthday") {
			completeEvent = {
				...baseEvent,
				nextBirthday: (formData as Birthday).nextBirthday || "",
				age: (formData as Birthday).age,
				animal: (formData as Birthday).animal,
				zodiac: (formData as Birthday).zodiac,
			} as Birthday;
		} else {
			completeEvent = baseEvent as CustomEvent;
		}

		onSave(completeEvent);
	};

	return (
		<form className="event-form" onSubmit={handleSubmit}>
			<h3>{isEditing ? "编辑" : "添加"}</h3>

			<div className="form-group">
				<label>事件名称</label>
				<input
					type="text"
					name="text"
					value={formData.text || ""}
					onChange={handleChange}
					required
				/>
			</div>

			<div className="form-group">
				<label>事件日期</label>
				<input
					type="text"
					name="date"
					value={formData.date || ""}
					onChange={handleChange}
					placeholder="MM-DD"
					required
				/>
			</div>

			<div className="form-group">
				<label>日期类型</label>
				<select
					name="dateType"
					value={formData.dateType || "SOLAR"}
					onChange={handleChange}
				>
					<option value="SOLAR">公历</option>
					<option value="LUNAR">农历</option>
				</select>
			</div>

			<div className="form-group checkbox">
				<label>
					<input
						type="checkbox"
						name="isRepeat"
						checked={formData.isRepeat || false}
						onChange={handleChange}
					/>
					重复
				</label>
			</div>

			<div className="form-group">
				<label>事件图标</label>
				<input
					type="text"
					name="emoji"
					value={formData.emoji || ""}
					onChange={handleChange}
					placeholder="📅"
				/>
			</div>

			<div className="form-group">
				<label>事件颜色</label>
				<input
					type="color"
					name="color"
					value={formData.color || "#000000"}
					onChange={handleChange}
				/>
			</div>

			<div className="form-group">
				<label>事件备注</label>
				<textarea
					name="remark"
					value={formData.remark || ""}
					onChange={handleChange}
				/>
			</div>

			{/* 节日特有字段 */}
			{eventType === "holiday" && (
				<>
					<div className="form-group">
						<label>节日类型</label>
						<select
							name="type"
							value={(formData as Holiday).type || "CUSTOM"}
							onChange={handleChange}
						>
							<option value="CUSTOM">自定义</option>
							<option value="INTERNAT">内置</option>
						</select>
					</div>

					<div className="form-group checkbox">
						<label>
							<input
								type="checkbox"
								name="isShow"
								checked={(formData as Holiday).isShow || false}
								onChange={handleChange}
							/>
							显示在日历上
						</label>
					</div>

					<div className="form-group">
						<label>节日起源时间</label>
						<input
							type="text"
							name="foundDate"
							value={(formData as Holiday).foundDate || ""}
							onChange={handleChange}
							placeholder="YYYY-MM-DD"
						/>
					</div>
				</>
			)}

			{/* 生日特有字段 */}
			{eventType === "birthday" && (
				<>
					<div className="form-group">
						<label>年龄</label>
						<input
							type="number"
							name="age"
							value={(formData as Birthday).age || ""}
							onChange={handleChange}
						/>
					</div>

					<div className="form-group">
						<label>生肖</label>
						<input
							type="text"
							name="animal"
							value={(formData as Birthday).animal || ""}
							onChange={handleChange}
						/>
					</div>

					<div className="form-group">
						<label>星座</label>
						<input
							type="text"
							name="zodiac"
							value={(formData as Birthday).zodiac || ""}
							onChange={handleChange}
						/>
					</div>
				</>
			)}

			<div className="form-actions">
				<button type="submit" className="save-button">
					保存
				</button>
				<button
					type="button"
					className="cancel-button"
					onClick={onCancel}
				>
					取消
				</button>
			</div>
		</form>
	);
};

const EventManagerView: React.FC<EventManagerViewProps> = ({
	config,
	plugin,
}) => {
	const [activeTab, setActiveTab] = useState<EventType>("holiday");
	const [events, setEvents] = useState<Events>(config.data);
	const [showForm, setShowForm] = useState(false);
	const [currentEvent, setCurrentEvent] = useState<
		Partial<Holiday | Birthday | CustomEvent>
	>({});
	const [isEditing, setIsEditing] = useState(false);

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
		setCurrentEvent({
			date: "",
			dateType: "SOLAR",
			text: "",
			isRepeat: true,
			emoji: "📅",
			color: "#4285f4",
			...(activeTab === "holiday"
				? { type: "CUSTOM", isShow: true }
				: {}),
			...(activeTab === "birthday" ? { nextBirthday: "" } : {}),
		});
		setIsEditing(false);
		setShowForm(true);
	};

	// 编辑事件
	const handleEditEvent = (event: Holiday | Birthday | CustomEvent) => {
		setCurrentEvent(event);
		setIsEditing(true);
		setShowForm(true);
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

	// 保存事件
	const handleSaveEvent = async (event: Holiday | Birthday | CustomEvent) => {
		const newEvents = { ...events };

		if (activeTab === "holiday") {
			if (isEditing) {
				newEvents.holidays = events.holidays.map((h) =>
					h === currentEvent ? (event as Holiday) : h
				);
			} else {
				newEvents.holidays = [...events.holidays, event as Holiday];
			}
		} else if (activeTab === "birthday") {
			if (isEditing) {
				newEvents.birthdays = events.birthdays.map((b) =>
					b === currentEvent ? (event as Birthday) : b
				);
			} else {
				newEvents.birthdays = [...events.birthdays, event as Birthday];
			}
		} else {
			if (isEditing) {
				newEvents.customEvents = events.customEvents.map((c) =>
					c === currentEvent ? (event as CustomEvent) : c
				);
			} else {
				newEvents.customEvents = [
					...events.customEvents,
					event as CustomEvent,
				];
			}
		}

		await saveEvents(newEvents);
		setShowForm(false);
	};

	// 取消编辑
	const handleCancelEdit = () => {
		setShowForm(false);
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
				{showForm ? (
					<EventForm
						event={currentEvent}
						eventType={activeTab}
						onSave={handleSaveEvent}
						onCancel={handleCancelEdit}
						isEditing={isEditing}
					/>
				) : (
					<>
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
					</>
				)}
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
