import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import {
	BaseEvent,
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT_EMOJI,
	EVENT_TYPE_LIST,
	Events,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { t } from "@/src/i18n/i18n";
import { Select } from "../base/Select";
import { Toggle } from "../base/Toggle";
import "./style/EventFormModal.css";

interface EventFormProps {
	event: Partial<Holiday | Birthday | CustomEvent>;
	eventType: EventType;
	onSave: (event: Holiday | Birthday | CustomEvent) => void;
	onCancel: () => void;
	isEditing: boolean;
}

export const EVENT_TYPE_OPTIONS = EVENT_TYPE_LIST.map((type) => ({
	value: type,
	label: t(`view.eventManager.${type}.name` as any),
}));

const EventForm: React.FC<EventFormProps> = ({
	event,
	eventType,
	onSave,
	onCancel,
	isEditing,
}) => {
	const [formData, setFormData] =
		React.useState<Partial<Holiday | Birthday | CustomEvent>>(event);
	const [optionalCollapsed, setOptionalCollapsed] = React.useState(true);

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

	const handleToggleChange = (name: string, checked: boolean) => {
		setFormData((prev) => ({ ...prev, [name]: checked }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 构建基础事件对象
		const baseEvent: BaseEvent = {
			date: formData.date || "",
			dateType: formData.dateType || "SOLAR",
			text: formData.text || "",
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

	const toggleOptional = () => {
		setOptionalCollapsed(!optionalCollapsed);
	};

	// 渲染只读字段的值
	const renderReadOnlyValue = (value: any) => {
		if (value === undefined || value === null || value === "") {
			return <span className="empty-value">-</span>;
		}
		return <span className="field-value">{value}</span>;
	};

	return (
		<form className="yg-event-form" onSubmit={handleSubmit}>
			<h3 className="yg-event-form-title">
				{isEditing
					? t("view.eventManager.form.edit")
					: t("view.eventManager.form.add")}
				{t(`view.eventManager.${eventType}.name` as any)}
			</h3>

			{/* 必填字段 */}
			{/* 事件名称 */}
			<div className="form-group">
				<label>{t("view.eventManager.form.eventName")}</label>
				<input
					type="text"
					name="text"
					value={formData.text || ""}
					onChange={handleChange}
					required
				/>
			</div>
			{/* 事件日期 */}
			<div className="form-group">
				<label>{t("view.eventManager.form.eventDate")}</label>
				<input
					type="text"
					name="date"
					value={formData.date || ""}
					onChange={handleChange}
					placeholder="MM-DD or YYYY-MM-DD"
					required
				/>
			</div>
			{/* 事件日期类型(只读，由事件日期自动推断) */}
			<div className="form-group read-only">
				<label>{t("view.eventManager.form.eventDateType")}</label>
				{renderReadOnlyValue(
					formData.dateType === "LUNAR"
						? t("view.eventManager.lunar")
						: t("view.eventManager.solar")
				)}
			</div>
			{/* 节日字段(只读)：类型 */}
			{eventType === "holiday" && isEditing && (
				<div className="form-group read-only">
					<label>{t("view.eventManager.holiday.type")}</label>
					{renderReadOnlyValue(
						(formData as Holiday).type === "INTERNAT"
							? t("view.eventManager.holiday.internat")
							: t("view.eventManager.holiday.custom")
					)}
				</div>
			)}
			{/* 生日字段(只读)：年龄、下一次生日、生肖、星座 */}
			{eventType === "birthday" && isEditing && (
				<>
					<div className="form-group read-only">
						<label>{t("view.eventManager.birthday.age")}</label>
						{renderReadOnlyValue((formData as Birthday).age)}
					</div>
					<div className="form-group read-only">
						<label>
							{t("view.eventManager.birthday.nextBirthday")}
						</label>
						{renderReadOnlyValue(
							(formData as Birthday).nextBirthday
						)}
					</div>
					<div className="form-group read-only">
						<label>{t("view.eventManager.birthday.animal")}</label>
						{renderReadOnlyValue((formData as Birthday).animal)}
					</div>
					<div className="form-group read-only">
						<label>{t("view.eventManager.birthday.zodiac")}</label>
						{renderReadOnlyValue((formData as Birthday).zodiac)}
					</div>
				</>
			)}

			{/* 可选字段 */}
			<div
				className={`yg-event-form-optional ${
					optionalCollapsed ? "collapsed" : ""
				}`}
			>
				<h5 onClick={toggleOptional}>
					{t("view.eventManager.form.optional")}
				</h5>

				{/* 事件图标 */}
				<div className="form-group">
					<label>{t("view.eventManager.form.eventEmoji")}</label>
					<input
						type="text"
						name="emoji"
						value={formData.emoji || ""}
						onChange={handleChange}
						placeholder={EVENT_TYPE_DEFAULT_EMOJI[eventType]}
					/>
				</div>
				{/* 事件颜色 */}
				<div className="form-group">
					<label>{t("view.eventManager.form.eventColor")}</label>
					<input
						type="color"
						name="color"
						value={formData.color || "#000000"}
						onChange={handleChange}
					/>
				</div>
				{/* 节日字段：是否显示，节日起源时间 */}
				{eventType === "holiday" && (
					<>
						<div className="form-group checkbox">
							<label>
								{t("view.eventManager.holiday.isShow")}
							</label>
							<Toggle
								checked={(formData as Holiday).isShow || false}
								onChange={(checked) =>
									handleToggleChange("isShow", checked)
								}
								aria-label={t(
									"view.eventManager.holiday.isShow"
								)}
							/>
						</div>
						<div className="form-group">
							<label>
								{t("view.eventManager.holiday.foundDate")}
							</label>
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
				{/* 自定义事件字段：是否重复 */}
				{eventType === "custom" && (
					<div className="form-group checkbox">
						<label>{t("view.eventManager.form.eventRepeat")}</label>
						<Toggle
							checked={formData.isRepeat || false}
							onChange={(checked) =>
								handleToggleChange("isRepeat", checked)
							}
							aria-label={t("view.eventManager.form.eventRepeat")}
						/>
					</div>
				)}
				{/* 事件备注 */}
				<div className="form-group">
					<label>{t("view.eventManager.form.eventRemark")}</label>
					<textarea
						name="remark"
						value={formData.remark || ""}
						onChange={handleChange}
					/>
				</div>
			</div>

			<div className="form-actions">
				<button type="submit" className="save-button">
					{t("view.eventManager.form.save")}
				</button>
				<button
					type="button"
					className="cancel-button"
					onClick={onCancel}
				>
					{t("view.eventManager.form.cancel")}
				</button>
			</div>
		</form>
	);
};

// 创建一个包装组件来管理状态
interface EventFormWrapperProps {
	plugin: YearlyGlancePlugin;
	initialEventType: EventType;
	event: Partial<Holiday | Birthday | CustomEvent>;
	isEditing: boolean;
	allowTypeChange: boolean;
	onSave: (
		event: Holiday | Birthday | CustomEvent,
		eventType: EventType
	) => Promise<void>;
	onCancel: () => void;
}

const EventFormWrapper: React.FC<EventFormWrapperProps> = ({
	plugin,
	initialEventType,
	event,
	isEditing,
	allowTypeChange,
	onSave,
	onCancel,
}) => {
	// 使用 React 状态来管理事件类型
	const [eventType, setEventType] =
		React.useState<EventType>(initialEventType);

	// 处理事件类型变更
	const handleEventTypeChange = (value: string) => {
		setEventType(value as EventType);
	};

	// 处理保存事件
	const handleSave = (event: Holiday | Birthday | CustomEvent) => {
		onSave(event, eventType);
	};

	return (
		<div className="yearly-glance-event-modal">
			{allowTypeChange && (
				<div className="event-type-selector">
					<Select
						label={t("view.eventManager.form.eventType")}
						value={eventType}
						onValueChange={handleEventTypeChange}
						options={EVENT_TYPE_OPTIONS}
					/>
				</div>
			)}
			<EventForm
				event={event}
				eventType={eventType}
				onSave={handleSave}
				onCancel={onCancel}
				isEditing={isEditing}
			/>
		</div>
	);
};

export class EventFormModal extends Modal {
	private plugin: YearlyGlancePlugin;
	private root: Root | null = null;
	private event: Partial<Holiday | Birthday | CustomEvent>;
	private eventType: EventType;
	private isEditing: boolean;
	private allowTypeChange: boolean;

	constructor(
		plugin: YearlyGlancePlugin,
		eventType: EventType = "holiday",
		event: Partial<Holiday | Birthday | CustomEvent> = {},
		isEditing: boolean = false,
		allowTypeChange: boolean = false
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.eventType = eventType;
		this.event = event;
		this.isEditing = isEditing;
		this.allowTypeChange = allowTypeChange;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// 创建 React 根元素
		this.root = createRoot(contentEl);

		// 渲染包装组件
		this.root.render(
			<React.StrictMode>
				<EventFormWrapper
					plugin={this.plugin}
					initialEventType={this.eventType}
					event={this.event}
					isEditing={this.isEditing}
					allowTypeChange={this.allowTypeChange}
					onSave={this.handleSave.bind(this)}
					onCancel={this.close.bind(this)}
				/>
			</React.StrictMode>
		);
	}

	// 处理保存事件
	async handleSave(
		event: Holiday | Birthday | CustomEvent,
		eventType: EventType
	) {
		const config = this.plugin.getSettings();
		const events: Events = config.data;
		const newEvents = { ...events };

		// 根据事件类型和是否编辑来更新事件
		if (eventType === "holiday") {
			if (this.isEditing) {
				newEvents.holidays = events.holidays.map((h) =>
					h === this.event ? (event as Holiday) : h
				);
			} else {
				newEvents.holidays = [...events.holidays, event as Holiday];
			}
		} else if (eventType === "birthday") {
			if (this.isEditing) {
				newEvents.birthdays = events.birthdays.map((b) =>
					b === this.event ? (event as Birthday) : b
				);
			} else {
				newEvents.birthdays = [...events.birthdays, event as Birthday];
			}
		} else {
			if (this.isEditing) {
				newEvents.customEvents = events.customEvents.map((c) =>
					c === this.event ? (event as CustomEvent) : c
				);
			} else {
				newEvents.customEvents = [
					...events.customEvents,
					event as CustomEvent,
				];
			}
		}

		await this.plugin.updateData(newEvents);

		this.close();
	}

	onClose() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}
