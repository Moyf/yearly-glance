import * as React from "react";
import { parseUserDateInput } from "@/src/utils/smartDateProcessor";
import { CalendarType, StandardDate } from "@/src/type/Date";
import "./style/DateInput.css";
import { TranslationKeys } from "@/src/i18n/types";
import { t } from "@/src/i18n/i18n";
import { IsoUtils } from "@/src/utils/isoUtils";

interface DateInputProps {
	value: string;
	calendar?: CalendarType;
	onChange: (value: string) => void;
	required?: boolean;
	placeholder?: string;
	className?: string;
	gregorianDisplayFormat: string; // 公历显示格式
}

export const DateInput: React.FC<DateInputProps> = ({
	value,
	calendar,
	onChange,
	required = false,
	placeholder,
	className = "",
	gregorianDisplayFormat,
}) => {
	const [preview, setPreview] = React.useState<{
		success: boolean;
		result?: StandardDate;
		error?: string;
	}>({ success: false });

	// 计算预览
	React.useEffect(() => {
		if (!value || value.trim() === "") {
			setPreview({
				success: false,
				error: t("view.eventManager.dateError.emptyDate"),
			});
			return;
		}

		try {
			const result = parseUserDateInput(value.trim(), calendar);
			setPreview({ success: true, result });
		} catch (error) {
			setPreview({
				success: false,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}, [value, calendar]);

	const getCalendarTypeDisplay = (calendarType: CalendarType): string => {
		return t(
			`view.eventManager.calendar.${calendarType.toLowerCase()}` as TranslationKeys
		);
	};

	const formatPreviewDate = (
		isoDate: string,
		calendar: CalendarType
	): string => {
		return IsoUtils.formatDate(isoDate, calendar, gregorianDisplayFormat);
	};

	// 生成容器的CSS类名
	const containerClasses = [
		"date-input-container",
		className,
		preview.success && value.trim() && "has-success",
		preview.error && "has-error",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={containerClasses}>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				required={required}
				placeholder={placeholder}
				className="date-input"
			/>

			{/* 预览区域 */}
			<div className="date-preview">
				{preview.success && preview.result ? (
					<div className="preview-success">
						<span className="preview-icon">✓</span>
						<span className="preview-text">
							{formatPreviewDate(
								preview.result.isoDate,
								preview.result.calendar
							)}
						</span>
						<span className="preview-calendar">
							({getCalendarTypeDisplay(preview.result.calendar)})
						</span>
					</div>
				) : (
					preview.error && (
						<div className="preview-error">
							<span className="preview-icon">⚠</span>
							<span className="preview-text">
								<div
									dangerouslySetInnerHTML={{
										__html: preview.error,
									}}
								/>
							</span>
						</div>
					)
				)}
			</div>
		</div>
	);
};
