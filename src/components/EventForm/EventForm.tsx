import * as React from "react";
import { YearlyGlanceConfig } from "@/src/type/Config";
import type YearlyGlancePlugin from "@/src/main";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	EVENT_TYPE_LIST,
	EventType,
	Holiday,
} from "@/src/type/Events";
import { NavTabs } from "@/src/components/Base/NavTabs";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import { CalendarType } from "@/src/type/Date";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Select } from "@/src/components/Base/Select";
import { ColorSelector } from "@/src/components/Base/ColorSelector";
import { Toggle } from "@/src/components/Base/Toggle";
import { DateInput } from "@/src/components/Base/DateInput";
import { parseUserDateInput } from "@/src/service/DateParseService";
import { Tooltip } from "@/src/components/Base/Tooltip";
import { IsoUtils } from "@/src/utils/isoUtils";
import { previewNoteEventPath } from "@/src/utils/notePathFormat";

// 事件类型tab
export const EVENT_TYPE_OPTIONS = EVENT_TYPE_LIST.map((type) => ({
	value: type,
	label: t(`view.eventManager.${type}.name` as TranslationKeys),
	emoji: EVENT_TYPE_DEFAULT[type].emoji,
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
	duration?: number; // 事件持续天数
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

	// 预设类型
	presetTypeId?: string;
}

interface EventFormProps {
	event: Partial<CustomEvent | Birthday | Holiday>;
	eventType: EventType;
	isEditing: boolean;
	allowTypeChange: boolean;
	settings: YearlyGlanceConfig;
	plugin?: YearlyGlancePlugin;
	onSave: (
		event: CustomEvent | Birthday | Holiday,
		eventType: EventType
	) => Promise<void>;
	onCancel: () => void;
	onDelete?: () => Promise<void>;
	canDelete?: boolean;
	onEventTypeChange?: (newType: EventType) => void;
	props?: {
		date?: string; // 可选的日期属性
	};
	isBasesEvent?: boolean;
	isDailyNoteEvent?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
	event,
	eventType,
	isEditing,
	allowTypeChange,
	settings,
	plugin,
	onSave,
	onCancel,
	onDelete,
	canDelete = true,
	props = {},
	isBasesEvent = false,
	isDailyNoteEvent: isDailyNoteEventProp = false,
	onEventTypeChange,
}) => {
	const today = IsoUtils.getTodayLocalDateString(); // 获取今天的日期字符串（时区安全）
	const todayString = props.date || today; // 如果传入了特定日期，则使用它，否则使用今天的日期

	// 第一个输入框的引用，用于自动聚焦
	const firstInputRef = React.useRef<HTMLInputElement>(null);

	// 表单容器和表单元素的引用，用于键盘快捷键
	const modalRef = React.useRef<HTMLDivElement>(null);
	const formRef = React.useRef<HTMLFormElement>(null);

	// 当前选择的事件类型
	const [currentEventType, setCurrentEventType] =
		React.useState<EventType>(eventType);

	// isDailyNoteEvent 动态跟随 tab 切换
	const isDailyNoteEvent = currentEventType === "dailyNoteEvent";

	// 表单数据状态
	const [formData, setFormData] = React.useState<EventFormData>(() => {
		const initialData: EventFormData = {
			id: event.id || "",
			text: event.text || "",
			userInputDate: event.eventDate?.userInput?.input || todayString,
			userInputCalendar: event.eventDate?.userInput?.calendar,
			duration: event.duration || 1, // 默认为1天
			emoji: event.emoji,
			color: event.color,
			remark: event.remark,
			isHidden: event.isHidden,
			presetTypeId: (event as any).presetTypeId,
		};

		// 处理不同事件类型的特有属性
		switch (currentEventType) {
			case "customEvent":
			case "basesEvent":
				initialData.isRepeat = (event as CustomEvent).isRepeat;
				break;
			case "dailyNoteEvent":
				initialData.isRepeat = (event as CustomEvent).isRepeat;
				// dailyNoteEvent 的默认 emoji 不显示在表单里，只显示从原文提取的
				if (initialData.emoji === EVENT_TYPE_DEFAULT.dailyNoteEvent.emoji) {
					initialData.emoji = "";
				}
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
	const [isSaving, setIsSaving] = React.useState(false);

	// Track original date for dailyNoteEvent editing
	const originalIsoDate = React.useRef(event.eventDate?.isoDate || '');
	const hasDateChanged = isEditing && formData.userInputDate !== originalIsoDate.current;

	// Compute daily note filename for hint display
	const dailyNoteInfo = React.useMemo(() => {
		if (currentEventType !== 'dailyNoteEvent' || !plugin) return null;

		const { DailyNoteService } = require('@/src/service/DailyNoteService') as { DailyNoteService: typeof import('@/src/service/DailyNoteService').DailyNoteService };
		const dnSettings = DailyNoteService.getDailyNoteSettings(plugin.app, settings.config.dailyNoteSource);
		if (!dnSettings) return null;

		const momentFn = (window as any).moment;
		if (!momentFn || !formData.userInputDate) return null;

		const parsed = momentFn(formData.userInputDate, 'YYYY-MM-DD', true);
		if (!parsed.isValid()) return null;

		const formattedName = parsed.format(dnSettings.format);
		const folder = dnSettings.folder.replace(/\/+$/, '');
		const filePath = folder ? `${folder}/${formattedName}.md` : `${formattedName}.md`;
		const filename = formattedName.split('/').pop() + '.md';
		const fileExists = !!plugin.app.vault.getAbstractFileByPath(filePath);

		return { filename, filePath, fileExists };
	}, [currentEventType, plugin, formData.userInputDate, settings.config.dailyNoteSource]);

	const basesEventPreviewPath = React.useMemo(() => {
		if (currentEventType !== "basesEvent") {
			return "";
		}

		let isoDate = todayString;
		if (formData.userInputDate) {
			try {
				isoDate = parseUserDateInput(
					formData.userInputDate,
					formData.userInputCalendar as CalendarType | undefined
				).isoDate;
			} catch {
				isoDate = todayString;
			}
		}

		return previewNoteEventPath(
			settings.config.defaultBasesEventPath || "",
			settings.config.basesEventFileNameFormat || "{event_name}",
			formData.text || "EventName",
			isoDate
		);
	}, [
		currentEventType,
		formData.text,
		formData.userInputCalendar,
		formData.userInputDate,
		settings.config.basesEventFileNameFormat,
		settings.config.defaultBasesEventPath,
		todayString,
	]);

	// 组件挂载时自动聚焦到第一个输入框
	React.useEffect(() => {
		if (firstInputRef.current) {
			firstInputRef.current.focus();
		}
	}, []);

	// 处理键盘快捷键提交表单
	React.useEffect(() => {
		if (!modalRef.current || !formRef.current) {
			return;
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			// 检查是否按下了 Ctrl+Enter 或 Cmd+Enter
			if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				formRef.current?.requestSubmit();
				return;
			}
		};

		const modalElement = modalRef.current;
		modalElement.addEventListener("keydown", handleKeyDown);

		return () => {
			modalElement.removeEventListener("keydown", handleKeyDown);
		};
	}, [formData]); // 依赖 formData，确保 handleSubmit 中使用的是最新的表单数据

	// 处理事件类型切换
	const handleEventTypeChange = (newEventType: EventType) => {
		setCurrentEventType(newEventType);
		onEventTypeChange?.(newEventType);

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
	const handleSubmit = async (e: React.FormEvent) => {
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
			duration: formData.duration || 1, // 添加 duration 字段
			emoji: formData.emoji,
			color: formData.color,
			remark: formData.remark,
			isHidden: formData.isHidden,

			// 预设类型
			...(formData.presetTypeId ? { presetTypeId: formData.presetTypeId } : {}),

			// 根据当前事件类型添加特有字段
			...(currentEventType === "customEvent" || currentEventType === "basesEvent" || currentEventType === "dailyNoteEvent"
				? { isRepeat: formData.isRepeat }
				: {}),

			...(currentEventType === "holiday"
				? { foundDate: formData.foundDate }
				: {}),
		};

		setIsSaving(true);
		try {
			await onSave(completeEvent, currentEventType);
			// 成功：Modal 会调用 this.close()，isSaving 状态无需重置
		} catch (error) {
			// 失败：Modal 已显示错误通知，这里只需重新启用按钮
			setIsSaving(false);
		}
	};

	return (
		<div className="yearly-glance-event-modal" ref={modalRef}>
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

			<form
				className="yg-event-form"
				ref={formRef}
				onSubmit={handleSubmit}
			>
				{/* 表单标题 */}
				<h3 className="yg-event-form-title">
					{isDailyNoteEvent
						? isEditing
							? t("view.eventManager.form.editDailyNoteEvent")
							: t("view.eventManager.form.addDailyNoteEvent")
						: isBasesEvent
						? isEditing
							? t("view.eventManager.form.editBasesEvent")
							: t("view.eventManager.form.addBasesEvent")
						: isEditing
						? t("view.eventManager.form.edit") +
						  t(
								`view.eventManager.${currentEventType}.name` as TranslationKeys
						  )
						: t("view.eventManager.form.add") +
						  t(
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
						gregorianDisplayFormat={
							settings.config.gregorianDisplayFormat
						}
						required
					/>
				</div>
				<div className={`form-group ${isDailyNoteEvent ? "yg-field-disabled" : ""}`}>
					<label>
						{t("view.eventManager.form.eventDateType")}
						<Tooltip
							text={isDailyNoteEvent ? t("view.eventManager.form.dailyNoteDisabledField") : t("view.eventManager.help.eventDateType")}
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
					} ${isDailyNoteEvent ? "yg-field-disabled" : ""}`}
				>
					<h5
						onClick={() => setOptionalCollapsed(!optionalCollapsed)}
					>
						{t("view.eventManager.form.optional")}
						{optionalCollapsed ? <ChevronRight /> : <ChevronDown />}
					</h5>

					<div className="form-group">
						<label>
							{t("view.eventManager.form.eventDuration")}
							<Tooltip text={t("view.eventManager.help.eventDuration")} />
						</label>
						<input
							type="number"
							min="1"
							max="365"
							value={formData.duration || 1}
							onChange={(e) =>
								handleFieldChange("duration", parseInt(e.target.value) || 1)
							}
						/>
					</div>

					{/* 预设类型（仅对配置事件显示） */}
					{currentEventType !== "basesEvent" && currentEventType !== "dailyNoteEvent" && (
						<div className="form-group">
							<label>{t("view.eventManager.presetType.label")}</label>
							<Select
								options={[
									{ label: t("view.eventManager.presetType.none"), value: "" },
									...(settings.config.eventPresetTypes ?? []).map((pt) => ({
										label: `${pt.emoji ?? ""} ${pt.name}`.trim(),
										value: pt.id,
									})),
								]}
								value={formData.presetTypeId ?? ""}
								onValueChange={(value) => {
									handleFieldChange("presetTypeId", value || undefined);
									// Auto-fill emoji/color if empty
									if (value) {
										const preset = settings.config.eventPresetTypes?.find((p) => p.id === value);
										if (preset) {
											if (!formData.emoji && preset.emoji) {
												handleFieldChange("emoji", preset.emoji);
											}
											if (!formData.color && preset.color) {
												handleFieldChange("color", preset.color);
											}
										}
									}
								}}
							/>
						</div>
					)}

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
					{currentEventType === 'basesEvent' && (
						<div className="form-group bases-event-hint">
							<div className="yg-bases-event-hint-content">
								{isEditing ? (
									// 编辑模式：显示来源笔记
									<>
										<b>{t("view.eventManager.help.basesEventEdit.label")}：</b>
										{t("view.eventManager.help.basesEventEdit.notePrefix")} <i>{
											event.id?.replace(/^bases-/, "")?.replace(/-\d{4}-\d{2}-\d{2}$/, "") || ""
										}</i>
										<br />
										{t("view.eventManager.help.basesEventEdit.syncText")}
									</>
								) : (
									// 新增模式
									<>
										<b>{t("view.eventManager.help.basesEventCreate.label")}：</b>
										{formData.text ? (
											// 有事件名：显示完整路径
											<>
												{t("view.eventManager.help.basesEventCreate.textWithName")}<br />
												<i>{basesEventPreviewPath}</i>
											</>
										) : (
											// 无事件名：显示文件夹
											t("view.eventManager.help.basesEventCreate.text", {
												path: settings.config.defaultBasesEventPath || '/'
											})
										)}
									</>
								)}
							</div>
						</div>
					)}
			</div>
				{currentEventType === 'dailyNoteEvent' && (
					<div className="form-group bases-event-hint">
						<div className="yg-bases-event-hint-content">
							{isEditing ? (
								<>
									<b>{t("view.eventManager.help.dailyNoteEventEdit.label")}：</b>
									{t("view.eventManager.help.dailyNoteEventEdit.text")}
									{hasDateChanged && dailyNoteInfo && (
										<div style={{ marginTop: '6px', color: 'var(--text-warning)' }}>
											⚠️ {t("view.eventManager.help.dailyNoteEventEdit.dateChanged", { oldDate: originalIsoDate.current })}
										</div>
									)}
								</>
							) : (
								<>
									<b>{t("view.eventManager.help.dailyNoteEventCreate.label")}：</b>
									{dailyNoteInfo ? (
										<>
											{t("view.eventManager.help.dailyNoteEventCreate.textDetailed", {
												prop: settings.config.dailyNoteEventProp,
												filename: dailyNoteInfo.filename,
											})}
											{!dailyNoteInfo.fileExists && (
												<div style={{ marginTop: '6px', color: 'var(--text-warning)' }}>
													⚠️ {t("view.eventManager.help.dailyNoteEventCreate.fileNotExist")}
												</div>
											)}
										</>
									) : (
										t("view.eventManager.help.dailyNoteEventCreate.text")
									)}
								</>
							)}
						</div>
					</div>
				)}

			{/* 操作按钮 */}
			<div className="form-actions">
				<div className="form-actions-left">
					{isEditing && onDelete && (
						<button
							type="button"
							className="delete-button"
							disabled={!canDelete || isSaving}
							onClick={async () => { if (canDelete && onDelete) await onDelete(); }}
						>
							{t("view.eventManager.actions.delete")}
						</button>
					)}
				</div>
				<div className="form-actions-right">
					<button
						type="submit"
						className={`save-button ${isSaving ? "is-saving" : ""}`}
						disabled={isSaving}
					>
						{isSaving ? t("view.eventManager.form.saving") : t("view.eventManager.form.save")}
					</button>
					<button
						type="button"
						className="cancel-button"
						disabled={isSaving}
						onClick={onCancel}
					>
						{t("view.eventManager.form.cancel")}
					</button>
				</div>
			</div>
			</form>
		</div>
	);
};
