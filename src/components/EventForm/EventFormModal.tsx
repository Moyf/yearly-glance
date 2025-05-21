import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_LIST,
	Events,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import {
	calculateDateObj,
	updateBirthdayInfo,
} from "@/src/core/utils/eventCalculator";
import { NavTabs } from "../Base/NavTabs";
import { CustomEventForm } from "./CustomEventForm";
import { BirthdayForm } from "./BirthdayForm";
import { HolidayForm } from "./HolidayForm";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import "./style/EventFormModal.css";

interface EventFormProps {
	event: Partial<CustomEvent | Birthday | Holiday>;
	eventType: EventType;
	onSave: (event: CustomEvent | Birthday | Holiday) => void;
	onCancel: () => void;
	isEditing: boolean;
	props?: any;
}

export const EVENT_TYPE_OPTIONS = EVENT_TYPE_LIST.map((type) => ({
	value: type,
	label: t(`view.eventManager.${type}.name` as TranslationKeys),
}));

const EventForm: React.FC<EventFormProps> = ({
	event,
	eventType,
	onSave,
	onCancel,
	isEditing,
	props,
}) => {
	const handleSave = (event: CustomEvent | Birthday | Holiday) => {
		onSave(event, eventType);
	};

	// 根据事件类型渲染不同的表单组件
	const renderEventForm = () => {
		switch (eventType) {
			case "customEvent":
				return (
					<CustomEventForm
						event={event as Partial<CustomEvent>}
						onSave={handleSave}
						onCancel={onCancel}
						isEditing={isEditing}
						props={props}
					/>
				);
			case "birthday":
				return (
					<BirthdayForm
						event={event as Partial<Birthday>}
						onSave={handleSave}
						onCancel={onCancel}
						isEditing={isEditing}
						props={props}
					/>
				);
			case "holiday":
				return (
					<HolidayForm
						event={event as Partial<Holiday>}
						onSave={handleSave}
						onCancel={onCancel}
						isEditing={isEditing}
						props={props}
					/>
				);
			default:
				return null;
		}
	};

	return renderEventForm();
};

// 创建一个包装组件来管理状态
interface EventFormWrapperProps {
	plugin: YearlyGlancePlugin;
	initialEventType: EventType;
	event: Partial<CustomEvent | Birthday | Holiday>;
	isEditing: boolean;
	allowTypeChange: boolean;
	onSave: (
		event: CustomEvent | Birthday | Holiday,
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
	props,
}) => {
	// 使用 React 状态来管理事件类型
	const [eventType, setEventType] =
		React.useState<EventType>(initialEventType);

	// 处理保存事件
	const handleSave = (event: CustomEvent | Birthday | Holiday) => {
		onSave(event, eventType);
	};

	return (
		<div className="yearly-glance-event-modal">
			{allowTypeChange && (
				<div className="event-type-selector">
					<NavTabs
						tabs={EVENT_TYPE_OPTIONS}
						activeTab={eventType}
						onClick={(tab) => setEventType(tab as EventType)}
					/>
				</div>
			)}
			<EventForm
				event={event}
				eventType={eventType}
				onSave={handleSave}
				onCancel={onCancel}
				isEditing={isEditing}
				props={props}
			/>
		</div>
	);
};

export class EventFormModal extends Modal {
	private plugin: YearlyGlancePlugin;
	private root: Root | null = null;
	private event: Partial<CustomEvent | Birthday | Holiday>;
	private eventType: EventType;
	private isEditing: boolean;
	private allowTypeChange: boolean;
	private props: any;

	constructor(
		plugin: YearlyGlancePlugin,
		eventType: EventType = "customEvent",
		event: Partial<CustomEvent | Birthday | Holiday> = {},
		isEditing: boolean = false,
		allowTypeChange: boolean = false,
		props: any = {}
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.eventType = eventType;
		this.event = event;
		this.isEditing = isEditing;
		this.allowTypeChange = allowTypeChange;
		this.props = props;
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
					props={this.props}
				/>
			</React.StrictMode>
		);
	}

	// 处理保存事件
	async handleSave(
		event: CustomEvent | Birthday | Holiday,
		eventType: EventType
	) {
		const config = this.plugin.getSettings();
		const events: Events = config.data;
		const newEvents = { ...events };
		const currentYear = config.config.year;

		// 根据事件类型进行不同的处理
		if (eventType === "holiday" || eventType === "customEvent") {
			// 计算并设置dateArr
			event.dateArr = calculateDateObj(
				event.date,
				event.dateType,
				currentYear
			);
		} else if (eventType === "birthday") {
			// 计算并更新生日的完整信息
			event = updateBirthdayInfo(event as Birthday, currentYear);
		}

		// 根据事件类型和是否编辑来更新事件
		if (eventType === "holiday") {
			if (this.isEditing) {
				// 使用更可靠的匹配方式：基于日期和文本内容
				newEvents.holidays = events.holidays.map((h) => {
					// 检查是否为同一事件（使用多个属性进行匹配）
					if (
						h.date === this.event.date &&
						h.text === this.event.text
					) {
						return event as Holiday;
					}
					return h;
				});
			} else {
				newEvents.holidays = [...events.holidays, event as Holiday];
			}
		} else if (eventType === "birthday") {
			if (this.isEditing) {
				// 使用更可靠的匹配方式
				newEvents.birthdays = events.birthdays.map((b) => {
					if (
						b.date === this.event.date &&
						b.text === this.event.text
					) {
						return event as Birthday;
					}
					return b;
				});
			} else {
				newEvents.birthdays = [...events.birthdays, event as Birthday];
			}
		} else {
			if (this.isEditing) {
				// 使用更可靠的匹配方式
				newEvents.customEvents = events.customEvents.map((c) => {
					if (
						c.date === this.event.date &&
						c.text === this.event.text
					) {
						return event as CustomEvent;
					}
					return c;
				});
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
