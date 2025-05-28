import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal } from "obsidian";
import { Solar } from "lunar-typescript";
import YearlyGlancePlugin from "@/src/main";
import {
	BaseEvent,
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	EVENT_TYPE_LIST,
	Events,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import {
	calculateDateObj,
	updateBirthdayInfo,
} from "@/src/core/utils/eventCalculator";
import {
	formatToExtendedISO,
	parseDateValue,
	parseExtendedISO,
} from "@/src/core/utils/dateParser";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Toggle } from "../Base/Toggle";
import { Tooltip } from "../Base/Tooltip";
import { NavTabs } from "../Base/NavTabs";
import { DatePicker } from "@/src/components/DatePicker/DatePicker";
import { ColorSelector } from "../Base/ColorSelector";
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
	// 获取今天的日期
	const today = Solar.fromDate(new Date());
	const todayString = `${today.getYear()},${today.getMonth()},${today.getDay()}`;
	// 格式化为显示格式 y-m-d
	const todayDisplayFormat = `${today.getYear()}-${today.getMonth()}-${today.getDay()}`;

	const [formData, setFormData] = React.useState<
		Partial<CustomEvent | Birthday | Holiday>
	>({
		...event,
		// 如果是新建事件且没有提供date，默认使用今天的日期
		date:
			event.date ||
			(!isEditing && !props ? todayString : props.date ?? undefined),
		dateType: event.dateType || "SOLAR",
	});

	const [optionalCollapsed, setOptionalCollapsed] = React.useState(false);
	const [displayDateValue, setDisplayDateValue] = React.useState(() => {
		// 初始化时将内部y,m,d格式转换为显示用的y-m-d格式
		if (formData.date) {
			return formatToExtendedISO(formData.date);
		}
		// 如果是新建事件且没有date，使用今天的日期显示格式
		return !isEditing ? todayDisplayFormat : "";
	});

	React.useEffect(() => {
		// 当formData.date变化时更新显示值
		if (formData.date) {
			setDisplayDateValue(formatToExtendedISO(formData.date));
		}
	}, [formData.date]);

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
			setFormData((prev) => ({
				...prev,
				[name]: !value ? undefined : value,
			}));
		}
	};

	const handleToggleChange = (name: string, checked: boolean) => {
		setFormData((prev) => ({ ...prev, [name]: checked }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const updatedFormData = { ...formData };

		// 确保日期格式正确
		if (!updatedFormData.date) {
			// 如果用户输入了日期但未转换，尝试手动转换一次
			if (displayDateValue) {
				try {
					const convertedDate = parseExtendedISO(displayDateValue);
					if (convertedDate) {
						updatedFormData.date = convertedDate;
					} else {
						// 如果转换失败，使用今天的日期作为默认值
						updatedFormData.date = todayString;
					}
				} catch (error) {
					console.error("Error converting date on submit:", error);
					updatedFormData.date = todayString;
				}
			} else {
				// 没有输入日期，使用今天的日期作为默认值
				updatedFormData.date = todayString;
			}
		}

		// 构建基础事件对象
		const baseEvent: BaseEvent = {
			id: updatedFormData.id,
			date: updatedFormData.date || todayString, // 确保始终有日期
			dateType: updatedFormData.dateType || "SOLAR",
			text: updatedFormData.text || "",
			emoji: updatedFormData.emoji,
			color: updatedFormData.color,
			remark: updatedFormData.remark,
		};

		// 根据事件类型构建完整事件对象
		let completeEvent: CustomEvent | Birthday | Holiday;

		if (eventType === "holiday") {
			completeEvent = {
				...baseEvent,
				type: (updatedFormData as Holiday).type || "CUSTOM",
				isHidden:
					(updatedFormData as Holiday).isHidden !== undefined
						? (updatedFormData as Holiday).isHidden
						: false,
				foundDate: (updatedFormData as Holiday).foundDate,
			} as Holiday;
		} else if (eventType === "birthday") {
			completeEvent = {
				...baseEvent,
				nextBirthday: (updatedFormData as Birthday).nextBirthday || "",
				age: (updatedFormData as Birthday).age,
				animal: (updatedFormData as Birthday).animal,
				zodiac: (updatedFormData as Birthday).zodiac,
				isHidden:
					(updatedFormData as Birthday).isHidden !== undefined
						? (updatedFormData as Birthday).isHidden
						: false,
			} as Birthday;
		} else {
			completeEvent = {
				...baseEvent,
				isRepeat:
					(updatedFormData as CustomEvent).isRepeat !== undefined
						? (updatedFormData as CustomEvent).isRepeat
						: false,
				isHidden:
					(updatedFormData as CustomEvent).isHidden !== undefined
						? (updatedFormData as CustomEvent).isHidden
						: false,
			} as CustomEvent;
		}

		onSave(completeEvent);
	};

	const toggleOptional = () => {
		setOptionalCollapsed(!optionalCollapsed);
	};

	const displayDate = (date: string, dateType: "SOLAR" | "LUNAR") => {
		const { hasYear, yearName, monthName, dayName } = parseDateValue(
			date,
			dateType
		);
		let dateStr;
		if (hasYear) {
			if (dateType === "SOLAR") {
				dateStr = `${yearName}-${monthName}-${dayName}`;
			} else {
				dateStr = `${yearName}年${monthName}月${dayName}`;
			}
		} else {
			if (dateType === "SOLAR") {
				dateStr = `${monthName}-${dayName}`;
			} else {
				dateStr = `${monthName}月${dayName}`;
			}
		}
		return dateStr;
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
				{t(`view.eventManager.${eventType}.name` as TranslationKeys)}
			</h3>

			{/* 必填字段 */}
			{/* 事件名称 */}
			<div
				className={`form-group ${
					(formData as Holiday).type === "BUILTIN" ? "read-only" : ""
				}`}
			>
				<label>{t("view.eventManager.form.eventName")}</label>
				{(formData as Holiday).type === "BUILTIN" ? (
					renderReadOnlyValue(formData.text)
				) : (
					<input
						type="text"
						name="text"
						value={formData.text || ""}
						onChange={handleChange}
						required
					/>
				)}
			</div>
			{/* 事件日期 */}
			<div
				className={`form-group ${
					(formData as Holiday).type === "BUILTIN" ? "read-only" : ""
				}`}
			>
				<label>
					{t("view.eventManager.form.eventDate")}
					<Tooltip text={t("view.eventManager.form.eventDateHelp")} />
				</label>
				{(formData as Holiday).type === "BUILTIN" ? (
					renderReadOnlyValue(
						displayDate(formData.date, formData.dateType)
					)
				) : (
					<DatePicker
						value={formData.date || todayString}
						type={formData.dateType}
						onChange={(value, dateType) => {
							setFormData((prev) => ({
								...prev,
								date: value,
								dateType: dateType,
							}));
						}}
					/>
				)}
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
						(formData as Holiday).type === "BUILTIN"
							? t("view.eventManager.holiday.builtin")
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
					{optionalCollapsed ? <ChevronRight /> : <ChevronDown />}
				</h5>

				{/* 事件图标 */}
				<div className="form-group">
					<label>{t("view.eventManager.form.eventEmoji")}</label>
					<input
						type="text"
						name="emoji"
						value={formData.emoji || ""}
						onChange={handleChange}
						placeholder={EVENT_TYPE_DEFAULT[eventType].emoji}
					/>
				</div>
				{/* 事件颜色 */}
				<div className="form-group">
					<label>{t("view.eventManager.form.eventColor")}</label>
					<ColorSelector
						value={formData.color || ""}
						defaultColor={EVENT_TYPE_DEFAULT[eventType].color}
						onChange={(color) => {
							setFormData((prev) => ({
								...prev,
								color: color,
							}));
						}}
						resetTitle={t("view.eventManager.form.reset")}
						submitDefaultAsValue={false}
					/>
				</div>
				{/* 是否隐藏 */}
				<div className="form-group checkbox">
					<label>{t("view.eventManager.form.eventHidden")}</label>
					<Toggle
						checked={(formData as BaseEvent).isHidden ?? false}
						onChange={(checked) =>
							handleToggleChange("isHidden", checked)
						}
						aria-label={t("view.eventManager.form.eventHidden")}
					/>
				</div>
				{/* 节日字段：节日起源时间 */}
				{eventType === "holiday" && (
					<div className="form-group">
						<label>
							{t("view.eventManager.holiday.foundDate")}
						</label>
						<input
							type="text"
							name="foundDate"
							value={(formData as Holiday).foundDate ?? ""}
							onChange={handleChange}
							placeholder="YYYY or YYYY,MM or YYYY,MM,DD"
						/>
					</div>
				)}
				{/* 自定义事件字段：是否重复 */}
				{eventType === "customEvent" && (
					<div className="form-group checkbox">
						<label>{t("view.eventManager.form.eventRepeat")}</label>
						<Toggle
							checked={
								(formData as CustomEvent).isRepeat ?? false
							}
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
						value={(formData as BaseEvent).remark ?? ""}
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
