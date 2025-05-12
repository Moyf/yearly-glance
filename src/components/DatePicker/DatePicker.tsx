import * as React from "react";
import { Calendar, LaptopMinimalCheck } from "lucide-react";
import { parseDateValue } from "@/src/core/utils/dateParser";
import { DatePickerYMD } from "./DatePickerYMD";
import { DatePickerMD } from "./DatePickerMD";
import { NavTabs } from "../Base/NavTabs";
import { t } from "@/src/i18n/i18n";
import "./style/DatePicker.css";

interface DatePickerProps {
	value: string; // 日期选择器的初始值
	type: "SOLAR" | "LUNAR"; // 日期类型
	onChange: (value: string, dateType: "SOLAR" | "LUNAR") => void; // 日期变化时的回调函数，返回日期字符串和日期类型
}

// 获取当前日期,格式为YYYY,MM,DD
const getTodayString = () => {
	return `${new Date().getFullYear()},${
		new Date().getMonth() + 1
	},${new Date().getDate()}`;
};

export const DatePicker: React.FC<DatePickerProps> = ({
	value = getTodayString(), // 默认使用当前日期
	type, // 默认使用公历
	onChange,
}) => {
	const { hasYear, yearName, monthName, dayName } = parseDateValue(
		value,
		type
	);

	const [useYear, setUseYear] = React.useState(hasYear);
	const [selectType, setSelectType] = React.useState(type);
	// 添加内部状态来跟踪临时选择的日期
	const [tempDateValue, setTempDateValue] = React.useState(value);

	const dateTypeOptions = [
		{ value: "SOLAR", label: t("view.eventManager.solar") },
		{ value: "LUNAR", label: t("view.eventManager.lunar") },
	];
	const useYearOptions = [
		{ value: true, label: "Y-M-D" },
		{ value: false, label: "M-D" },
	];

	const displayDate = React.useMemo(() => {
		if (hasYear) {
			if (type === "SOLAR") {
				return `${yearName}-${monthName}-${dayName}`;
			} else {
				return `${yearName}年${monthName}月${dayName}`;
			}
		} else {
			if (type === "SOLAR") {
				return `${monthName}-${dayName}`;
			} else {
				return `${monthName}月${dayName}`;
			}
		}
	}, [hasYear, yearName, monthName, dayName, type]);

	// 定位窗口容器
	const [isOpen, setIsOpen] = React.useState(false);
	const pickerRef = React.useRef<HTMLDivElement>(null);
	const popupRef = React.useRef<HTMLDivElement>(null);

	// 处理提交按钮点击事件
	const handleSubmit = () => {
		onChange(tempDateValue, selectType);
		setIsOpen(false);
	};

	// 处理日期选择器内部值变化
	const handleDateChange = (newValue: string) => {
		setTempDateValue(newValue);
	};

	return (
		<div className="yg-date-picker-container" ref={pickerRef}>
			<div
				className="date-display-value"
				onClick={() => setIsOpen((prev) => !prev)}
			>
				<span className="date-display-value-text">{displayDate}</span>
				<Calendar size={18} className="calendar-icon" />
			</div>
			{isOpen && (
				<div className="date-picker-popup" ref={popupRef}>
					<div className="date-picker-popup-header">
						<div className="calendar-actions">
							<NavTabs
								tabs={useYearOptions}
								activeTab={useYear}
								onClick={(tab) => setUseYear(tab)}
							/>
							<NavTabs
								tabs={dateTypeOptions}
								activeTab={selectType}
								onClick={(tab) => setSelectType(tab)}
							/>
						</div>
						<button
							className="actions-submit"
							title={t("view.eventManager.form.submit")}
							onClick={handleSubmit}
						>
							<LaptopMinimalCheck size={18} />
						</button>
					</div>
					<div className="date-picker-popup-content">
						{useYear ? (
							<DatePickerYMD
								value={value}
								type={selectType}
								onChange={handleDateChange}
							/>
						) : (
							<DatePickerMD
								value={value}
								type={selectType}
								onChange={handleDateChange}
							/>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
