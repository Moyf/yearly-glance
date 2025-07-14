import * as React from "react";
import { parseUserDateInput } from "@/src/core/utils/smartDateProcessor";
import { CalendarType, StandardDate } from "@/src/core/interfaces/Date";
import "./style/DateInput.css";

interface DateInputProps {
	value: string;
	calendar?: CalendarType;
	onChange: (value: string) => void;
	required?: boolean;
	placeholder?: string;
	className?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
	value,
	calendar,
	onChange,
	required = false,
	placeholder,
	className = "",
}) => {
	const [preview, setPreview] = React.useState<{
		success: boolean;
		result?: StandardDate;
		error?: string;
	}>({ success: false });

	// 计算预览
	React.useEffect(() => {
		if (!value || value.trim() === "") {
			setPreview({ success: false });
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
		switch (calendarType) {
			case "GREGORIAN":
				return "公历";
			case "LUNAR":
				return "农历";
			case "LUNAR_LEAP":
				return "闰月";
			default:
				return calendarType;
		}
	};

	const formatPreviewDate = (isoDate: string): string => {
		// 处理不同的ISO日期格式
		if (isoDate.includes("-")) {
			const parts = isoDate.split("-");
			if (parts.length === 3) {
				// YYYY-MM-DD 格式
				return `${parts[0]}年${parseInt(parts[1])}月${parseInt(
					parts[2]
				)}日`;
			} else if (parts.length === 2) {
				// MM-DD 格式
				return `${parseInt(parts[0])}月${parseInt(parts[1])}日`;
			}
		}
		return isoDate;
	};

	return (
		<div className={`date-input-container ${className}`}>
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
							{formatPreviewDate(preview.result.isoDate)}
						</span>
						<span className="preview-calendar">
							({getCalendarTypeDisplay(preview.result.calendar)})
						</span>
					</div>
				) : preview.error ? (
					<div className="preview-error">
						<span className="preview-icon">⚠</span>
						<span className="preview-text">{preview.error}</span>
					</div>
				) : value.trim() !== "" ? (
					<div className="preview-parsing">
						<span className="preview-icon">⏳</span>
						<span className="preview-text">解析中...</span>
					</div>
				) : (
					<div className="preview-empty">
						<span className="preview-text">
							支持多种格式：2025-01-01, 正月初一, 01-01 等
						</span>
					</div>
				)}
			</div>
		</div>
	);
};
