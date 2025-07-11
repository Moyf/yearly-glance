import * as React from "react";
import { Solar } from "lunar-typescript";
import { Holiday } from "@/src/core/interfaces/Events";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Toggle } from "../Base/Toggle";
import { Tooltip } from "../Base/Tooltip";
import { ColorSelector } from "../Base/ColorSelector";
import { t } from "@/src/i18n/i18n";
import { EVENT_TYPE_DEFAULT } from "@/src/core/interfaces/Events";
import { SmartDateProcessor } from "@/src/core/utils/smartDateProcessor";

interface HolidayFormProps {
	event: Partial<Holiday>;
	onSave: (event: Holiday) => void;
	onCancel: () => void;
	isEditing: boolean;
	props?: any;
}

export const HolidayForm: React.FC<HolidayFormProps> = ({
	event,
	onSave,
	onCancel,
	isEditing,
	props,
}) => {
	// 获取今天的日期
	const today = Solar.fromDate(new Date());
	const todayString = `${today.getYear()},${today.getMonth()},${today.getDay()}`;

	const [formData, setFormData] = React.useState<Partial<Holiday>>({
		...event,
		// 如果是新建事件且没有提供date，默认使用今天的日期
		date:
			event.date ||
			(!isEditing && !props ? todayString : props.date ?? undefined),
		dateType: event.dateType || "SOLAR",
		type: event.type || "CUSTOM",
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
		const completeEvent: Holiday = {
			id: updatedFormData.id,
			eventDate: {
				isoDate: SmartDateProcessor.parseUserInput(
					updatedFormData.date,
					updatedFormData.dateType
				),
				userInput: {
					input: updatedFormData.date || todayString,
					calendar: updatedFormData.dateType,
				},
			},
			text: updatedFormData.text || "",
			emoji: updatedFormData.emoji,
			color: updatedFormData.color,
			remark: updatedFormData.remark,
			type: updatedFormData.type || "CUSTOM",
			isHidden:
				updatedFormData.isHidden !== undefined
					? updatedFormData.isHidden
					: false,
			foundDate: updatedFormData.foundDate,
		};

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

	const isBuiltIn = formData.type === "BUILTIN";

	return (
		<form className="yg-event-form" onSubmit={handleSubmit}>
			<h3 className="yg-event-form-title">
				{isEditing
					? t("view.eventManager.form.edit")
					: t("view.eventManager.form.add")}
				{t(`view.eventManager.holiday.name`)}
			</h3>

			{/* 必填字段 */}
			{/* 事件名称 */}
			<div className={`form-group ${isBuiltIn ? "read-only" : ""}`}>
				<label>{t("view.eventManager.form.eventName")}</label>
				{isBuiltIn ? (
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
			<div className={`form-group ${isBuiltIn ? "read-only" : ""}`}>
				<label>
					{t("view.eventManager.form.eventDate")}
					<Tooltip text={t("view.eventManager.form.eventDateHelp")} />
				</label>
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

			{/* 节日类型(只读) */}
			{isEditing && (
				<div className="form-group read-only">
					<label>{t("view.eventManager.holiday.type")}</label>
					{renderReadOnlyValue(
						formData.type === "BUILTIN"
							? t("view.eventManager.holiday.builtin")
							: t("view.eventManager.holiday.custom")
					)}
				</div>
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
						placeholder={EVENT_TYPE_DEFAULT.holiday.emoji}
					/>
				</div>

				{/* 事件颜色 */}
				<div className="form-group">
					<label>{t("view.eventManager.form.eventColor")}</label>
					<ColorSelector
						value={formData.color || ""}
						defaultColor={EVENT_TYPE_DEFAULT.holiday.color}
						presetColors={props.config.presetColors}
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

				{/* 节日起源时间 */}
				<div className="form-group">
					<label>{t("view.eventManager.holiday.foundDate")}</label>
					<input
						type="text"
						name="foundDate"
						value={formData.foundDate ?? ""}
						onChange={handleChange}
						placeholder="YYYY or YYYY,MM or YYYY,MM,DD"
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
