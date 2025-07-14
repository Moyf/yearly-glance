import * as React from "react";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import {
	BaseEvent,
	Birthday,
	CustomEvent,
	EVENT_TYPE_LIST,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { NavTabs } from "../Base/NavTabs";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import { parseUserDateInput } from "@/src/core/utils/smartDateProcessor";
import { ChevronDown, ChevronRight } from "lucide-react";

// 事件类型tab
export const EVENT_TYPE_OPTIONS = EVENT_TYPE_LIST.map((type) => ({
	value: type,
	label: t(`view.eventManager.${type}.name` as TranslationKeys),
}));

// 日历类型选项
const CALENDAR_OPTIONS = [
	{ label: "AUTO", value: undefined },
	{ label: "GREGORIAN", value: "GREGORIAN" },
	{ label: "LUNAR", value: "LUNAR" },
	{ label: "LUNAR_LEAP", value: "LUNAR_LEAP" },
];

/**
 * 事件表单数据接口
 * 继承 BaseEvent 的所有基础属性，并包含三种事件类型的特有属性
 */
interface EventFormData extends BaseEvent {
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

	// 当前选择的事件类型
	const [currentEventType, setCurrentEventType] =
		React.useState<EventType>(eventType);

	// 表单数据状态
	const [formData, setFormData] = React.useState<EventFormData>(() => {
		const initialData: EventFormData = {
			id: event.id || "",
			text: event.text || "",
			eventDate: {
				...(event.eventDate || parseUserDateInput(todayString)),
				userInput: {
					input: event.eventDate?.userInput?.input || "",
					calendar: event.eventDate?.userInput?.calendar,
				},
			},
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

	const [optionalCollapsed, setOptionalCollapsed] = React.useState(false);

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
	const handleSubmit = () => {};

	return (
		<div className="yearly-glance-event-modal">
			{allowTypeChange && (
				<div className="event-type-selector">
					<NavTabs
						tabs={EVENT_TYPE_OPTIONS}
						activeTab={currentEventType}
						onClick={(tab) => setCurrentEventType(tab as EventType)}
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
				<div className="form-section">
					<div className="form-group">
						<label>{t("view.eventManager.form.eventName")}</label>
					</div>
					<div className="form-group">
						<label>{t("view.eventManager.form.eventDate")}</label>
					</div>
					<div className="form-group">
						<label>
							{t("view.eventManager.form.eventDateType")}
						</label>
					</div>
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

						<div className="form-section">
							<div className="form-group">
								<label>
									{t("view.eventManager.form.eventEmoji")}
								</label>
							</div>
							<div className="form-group">
								<label>
									{t("view.eventManager.form.eventColor")}
								</label>
							</div>
							<div className="form-group">
								<label>
									{t("view.eventManager.form.eventHidden")}
								</label>
							</div>
							{currentEventType === "customEvent" && (
								<div className="form-group checkbox">
									<label>
										{t(
											"view.eventManager.form.eventRepeat"
										)}
									</label>
								</div>
							)}
							{currentEventType === "holiday" && (
								<div className="form-group">
									<label>
										{t(
											"view.eventManager.holiday.foundDate"
										)}
									</label>
								</div>
							)}
							<div className="form-group">
								<label>
									{t("view.eventManager.form.eventRemark")}
								</label>
							</div>
						</div>
					</h5>
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
