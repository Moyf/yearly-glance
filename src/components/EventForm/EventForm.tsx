import * as React from "react";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	EVENT_TYPE_LIST,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { NavTabs } from "../Base/NavTabs";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import { CalendarType } from "@/src/core/interfaces/Date";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Select } from "../Base/Select";
import { ColorSelector } from "../Base/ColorSelector";
import { Toggle } from "../Base/Toggle";
import { DateInput } from "../Base/DateInput";
import { parseUserDateInput } from "@/src/core/utils/smartDateProcessor";
import { Tooltip } from "../Base/Tooltip";

// 事件类型tab
export const EVENT_TYPE_OPTIONS = EVENT_TYPE_LIST.map((type) => ({
	value: type,
	label: t(`view.eventManager.${type}.name` as TranslationKeys),
}));

// 日历类型选项
const CALENDAR_OPTIONS = [
	{ label: t("view.eventManager.calendar.auto"), value: undefined },
	{ label: t("view.eventManager.calendar.gregorian"), value: "GREGORIAN" },
	{ label: t("view.eventManager.calendar.lunar"), value: "LUNAR" },
	{ label: t("view.eventManager.calendar.lunar_leap"), value: "LUNAR_LEAP" },
];

/**
 * 事件表单数据接口
 * 继承 BaseEvent 的所有基础属性，并包含三种事件类型的特有属性
 */
interface EventFormData {
	// 基础属性
	id: string;
	text: string;
	userInputDate: string;
	userInputCalendar?: string;
	emoji?: string;
	color?: string;
	remark?: string;
	isHidden?: boolean;

	// Holiday 特有属性
	foundDate?: string;

	// Birthday 特有属性
	// 生日的特殊字段在运行时生成，不需要在表单中编辑

	// CustomEvent 特有属性
	isRepeat?: boolean;
}

interface EventFormProps {
	event: Partial<CustomEvent | Birthday | Holiday>;
	eventType: EventType;
	isEditing: boolean;
	allowTypeChange: boolean;
	settings: YearlyGlanceConfig;
	onSave: (
		event: CustomEvent | Birthday | Holiday,
		eventType: EventType
	) => void;
	onCancel: () => void;
	props?: {
		date?: string; // 可选的日期属性
	};
}

export const EventForm: React.FC<EventFormProps> = ({
	event,
	eventType,
	isEditing,
	allowTypeChange,
	settings,
	onSave,
	onCancel,
	props = {},
}) => {
	const today = new Date().toISOString().split("T")[0]; // 获取今天的日期字符串
	const todayString = props.date || today; // 如果传入了特定日期，则使用它，否则使用今天的日期

	// 第一个输入框的引用，用于自动聚焦
	const firstInputRef = React.useRef<HTMLInputElement>(null);

	// 当前选择的事件类型
	const [currentEventType, setCurrentEventType] =
		React.useState<EventType>(eventType);

	// 表单数据状态
	const [formData, setFormData] = React.useState<EventFormData>(() => {
		const initialData: EventFormData = {
			id: event.id || "",
			text: event.text || "",
			userInputDate: event.eventDate?.userInput?.input || todayString,
			userInputCalendar: event.eventDate?.userInput?.calendar,
			emoji: event.emoji,
			color: event.color,
			remark: event.remark,
			isHidden: event.isHidden,
		};

		// 处理不同事件类型的特有属性
		switch (currentEventType) {
			case "customEvent":
				initialData.isRepeat = (event as CustomEvent).isRepeat;
				break;
			case "holiday":
				initialData.foundDate = (event as Holiday).foundDate;
				break;
			case "birthday":
				break;
		}

		return initialData;
	});

	// 处理表单字段变化
	const handleFieldChange = (
		name: string,
		value: string | boolean | number | undefined
	) => {
		setFormData((prev) => ({
			...prev,
			[name]: value === "" ? undefined : value,
		}));
	};

	const [optionalCollapsed, setOptionalCollapsed] = React.useState(false);

	// 组件挂载时自动聚焦到第一个输入框
	React.useEffect(() => {
		if (firstInputRef.current) {
			firstInputRef.current.focus();
		}
	}, []);

	// 处理事件类型切换
	const handleEventTypeChange = (newEventType: EventType) => {
		setCurrentEventType(newEventType);

		// 切换类型时，重置类型特有字段
		setFormData((prev) => {
			const newData = { ...prev };

			// 清除所有类型特有字段
			delete newData.isRepeat;
			delete newData.foundDate;

			return newData;
		});
	};

	// 处理表单提交
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const completeEvent: CustomEvent | Birthday | Holiday = {
			id: formData.id,
			text: formData.text,
			eventDate: {
				...parseUserDateInput(
					formData.userInputDate,
					formData.userInputCalendar as CalendarType | undefined
				),
				userInput: {
					input: formData.userInputDate,
					calendar: formData.userInputCalendar as
						| CalendarType
						| undefined,
				},
			},
			emoji: formData.emoji,
			color: formData.color,
			remark: formData.remark,
			isHidden: formData.isHidden,

			// 根据当前事件类型添加特有字段
			...(currentEventType === "customEvent"
				? { isRepeat: formData.isRepeat }
				: {}),

			...(currentEventType === "holiday"
				? { foundDate: formData.foundDate }
				: {}),
		};

		onSave(completeEvent, currentEventType);
	};

	return (
		<div className="yearly-glance-event-modal">
			{allowTypeChange && (
				<div className="event-type-selector">
					<NavTabs
						tabs={EVENT_TYPE_OPTIONS}
						activeTab={currentEventType}
						onClick={(tab) =>
							handleEventTypeChange(tab as EventType)
						}
					/>
				</div>
			)}

			<form className="yg-event-form" onSubmit={handleSubmit}>
				{/* 表单标题 */}
				<h3 className="yg-event-form-title">
					{isEditing
						? t("view.eventManager.form.edit")
						: t("view.eventManager.form.add")}
					{t(
						`view.eventManager.${currentEventType}.name` as TranslationKeys
					)}
				</h3>

				{/* 基础字段 */}
				<div className="form-group">
					<label>
						{t("view.eventManager.form.eventName")}
						<Tooltip text={t("view.eventManager.help.eventName")} />
					</label>
					<input
						ref={firstInputRef}
						type="text"
						name="text"
						value={formData.text || ""}
						onChange={(e) =>
							handleFieldChange("text", e.target.value)
						}
						required
					/>
				</div>
				<div className="form-group">
					<label>
						{t("view.eventManager.form.eventDate")}
						<Tooltip text={t("view.eventManager.help.eventDate")} />
					</label>
					<DateInput
						value={formData.userInputDate || ""}
						calendar={
							formData.userInputCalendar as
								| CalendarType
								| undefined
						}
						onChange={(value) =>
							handleFieldChange("userInputDate", value)
						}
						required
					/>
				</div>
				<div className="form-group">
					<label>
						{t("view.eventManager.form.eventDateType")}
						<Tooltip
							text={t("view.eventManager.help.eventDateType")}
						/>
					</label>
					<Select
						value={formData.userInputCalendar || undefined}
						onValueChange={(value) =>
							handleFieldChange("userInputCalendar", value)
						}
						options={CALENDAR_OPTIONS}
					/>
				</div>

				{/* 可选字段 */}
				<div
					className={`yg-event-form-optional ${
						optionalCollapsed ? "collapsed" : ""
					}`}
				>
					<h5
						onClick={() => setOptionalCollapsed(!optionalCollapsed)}
					>
						{t("view.eventManager.form.optional")}
						{optionalCollapsed ? <ChevronRight /> : <ChevronDown />}
					</h5>

					<div className="form-group">
						<label>
							{t("view.eventManager.form.eventEmoji")}
							<Tooltip
								text={t("view.eventManager.help.eventEmoji")}
							/>
						</label>
						<input
							type="text"
							value={formData.emoji || ""}
							onChange={(e) =>
								handleFieldChange("emoji", e.target.value)
							}
							placeholder={
								EVENT_TYPE_DEFAULT[currentEventType].emoji
							}
						/>
					</div>
					<div className="form-group">
						<label>
							{t("view.eventManager.form.eventColor")}
							<Tooltip
								text={t("view.eventManager.help.eventColor")}
							/>
						</label>
						<ColorSelector
							value={formData.color || ""}
							defaultColor={
								EVENT_TYPE_DEFAULT[currentEventType].color
							}
							presetColors={settings.config.presetColors}
							onChange={(color) =>
								handleFieldChange("color", color)
							}
							resetTitle={t("view.eventManager.form.reset")}
							submitDefaultAsValue={false}
						/>
					</div>
					<div className="form-group checkbox">
						<label>
							{t("view.eventManager.form.eventHidden")}
							<Tooltip
								text={t("view.eventManager.help.eventHidden")}
							/>
						</label>
						<Toggle
							checked={formData.isHidden || false}
							onChange={(checked) =>
								handleFieldChange("isHidden", checked)
							}
						/>
					</div>
					{currentEventType === "customEvent" && (
						<div className="form-group checkbox">
							<label>
								{t("view.eventManager.customEvent.repeat")}
								<Tooltip
									text={t(
										"view.eventManager.help.customEventRepeat"
									)}
								/>
							</label>
							<Toggle
								checked={formData.isRepeat ?? false}
								onChange={(checked) =>
									handleFieldChange("isRepeat", checked)
								}
							/>
						</div>
					)}
					{currentEventType === "holiday" && (
						<div className="form-group">
							<label>
								{t("view.eventManager.holiday.foundDate")}
								<Tooltip
									text={t(
										"view.eventManager.help.holidayFoundDate"
									)}
								/>
							</label>
							<input
								type="text"
								value={formData.foundDate || ""}
								onChange={(e) =>
									handleFieldChange(
										"foundDate",
										e.target.value
									)
								}
								placeholder="ISO 8601 date (YYYY-MM-DD)"
							/>
						</div>
					)}
					<div className="form-group">
						<label>
							{t("view.eventManager.form.eventRemark")}
							<Tooltip
								text={t("view.eventManager.help.eventRemark")}
							/>
						</label>
						<textarea
							value={formData.remark || ""}
							onChange={(e) =>
								handleFieldChange("remark", e.target.value)
							}
							rows={3}
						/>
					</div>
				</div>

				{/* 操作按钮 */}
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
		</div>
	);
};
