import * as React from "react";
import { Solar } from "lunar-typescript";
import { CustomEvent } from "@/src/core/interfaces/Events";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Toggle } from "../Base/Toggle";
import { Tooltip } from "../Base/Tooltip";
import { DatePicker } from "@/src/components/DatePicker/DatePicker";
import { ColorSelector } from "../Base/ColorSelector";
import { t } from "@/src/i18n/i18n";
import { EVENT_TYPE_DEFAULT } from "@/src/core/interfaces/Events";
import "./style/EventFormModal.css";

interface CustomEventFormProps {
	event: Partial<CustomEvent>;
	onSave: (event: CustomEvent) => void;
	onCancel: () => void;
	isEditing: boolean;
	props?: any;
}

export const CustomEventForm: React.FC<CustomEventFormProps> = ({
	event,
	onSave,
	onCancel,
	isEditing,
	props,
}) => {
	// 获取今天的日期
	const today = Solar.fromDate(new Date());
	const todayString = `${today.getYear()},${today.getMonth()},${today.getDay()}`;

	const [formData, setFormData] = React.useState<Partial<CustomEvent>>({
		...event,
		// 如果是新建事件且没有提供date，默认使用今天的日期
		date:
			event.date ||
			(!isEditing && !props ? todayString : props.date ?? undefined),
		dateType: event.dateType || "SOLAR",
	});

	const [optionalCollapsed, setOptionalCollapsed] = React.useState(false);

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
			// 如果没有日期，使用今天的日期作为默认值
			updatedFormData.date = todayString;
		}

		// 构建完整事件对象
		const completeEvent: CustomEvent = {
			id: updatedFormData.id,
			date: updatedFormData.date || todayString,
			dateType: updatedFormData.dateType || "SOLAR",
			text: updatedFormData.text || "",
			emoji: updatedFormData.emoji,
			color: updatedFormData.color,
			remark: updatedFormData.remark,
			isRepeat:
				updatedFormData.isRepeat !== undefined
					? updatedFormData.isRepeat
					: false,
			isHidden:
				updatedFormData.isHidden !== undefined
					? updatedFormData.isHidden
					: false,
		};

		onSave(completeEvent);
	};

	const toggleOptional = () => {
		setOptionalCollapsed(!optionalCollapsed);
	};

	return (
		<form className="yg-event-form" onSubmit={handleSubmit}>
			<h3 className="yg-event-form-title">
				{isEditing
					? t("view.eventManager.form.edit")
					: t("view.eventManager.form.add")}
				{t(`view.eventManager.customEvent.name`)}
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
				<label>
					{t("view.eventManager.form.eventDate")}
					<Tooltip text={t("view.eventManager.form.eventDateHelp")} />
				</label>
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
			</div>

			{/* 事件日期类型(只读，由事件日期自动推断) */}
			<div className="form-group read-only">
				<label>{t("view.eventManager.form.eventDateType")}</label>
				<span className="field-value">
					{formData.dateType === "LUNAR"
						? t("view.eventManager.lunar")
						: t("view.eventManager.solar")}
				</span>
			</div>

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
						placeholder={EVENT_TYPE_DEFAULT.customEvent.emoji}
					/>
				</div>

				{/* 事件颜色 */}
				<div className="form-group">
					<label>{t("view.eventManager.form.eventColor")}</label>
					<ColorSelector
						value={formData.color || ""}
						defaultColor={EVENT_TYPE_DEFAULT.customEvent.color}
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
						checked={formData.isHidden ?? false}
						onChange={(checked) =>
							handleToggleChange("isHidden", checked)
						}
						aria-label={t("view.eventManager.form.eventHidden")}
					/>
				</div>

				{/* 是否重复 */}
				<div className="form-group checkbox">
					<label>{t("view.eventManager.form.eventRepeat")}</label>
					<Toggle
						checked={formData.isRepeat ?? false}
						onChange={(checked) =>
							handleToggleChange("isRepeat", checked)
						}
						aria-label={t("view.eventManager.form.eventRepeat")}
					/>
				</div>

				{/* 事件备注 */}
				<div className="form-group">
					<label>{t("view.eventManager.form.eventRemark")}</label>
					<textarea
						name="remark"
						value={formData.remark ?? ""}
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
