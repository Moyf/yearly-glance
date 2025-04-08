import * as React from "react";
import { Lunar, LunarMonth } from "lunar-typescript";
import { Calendar } from "lucide-react";
import { parseDateValue } from "@/src/core/utils/dateParser";
import "./style/DatePicker.css";
import { Select } from "../Base/Select";

interface DatePickerProps {
	value: string; // 日期选择器的初始值
	type: "SOLAR" | "LUNAR"; // 日期类型
	onChange: (value: string, dateType: "SOLAR" | "LUNAR") => void; // 日期变化时的回调函数，返回日期字符串和日期类型
}

// 获取当前日期,格式为YYYY,MM,DD
const todayString = `${new Date().getFullYear()},${
	new Date().getMonth() + 1
},${new Date().getDate()}`;

export const DatePicker: React.FC<DatePickerProps> = ({
	value = todayString, // 默认使用当前日期
	type, // 默认使用公历
	onChange,
}) => {
	const { hasYear, year, month, day } = parseDateValue(value, type);

	// 可选项管理
	const [isLunar, setIsLunar] = React.useState(type === "LUNAR");
	const [isIgnoreYear, setIsIgnoreYear] = React.useState(!hasYear);

	// 定位窗口容器
	const [isOpen, setIsOpen] = React.useState(false);
	const pickerRef = React.useRef<HTMLDivElement>(null);
	const popupRef = React.useRef<HTMLDivElement>(null);

	// 当前选择日期管理
	const [selectedDate, setSelectedDate] = React.useState(value); // 格式为 YYYY,MM,DD 或 MM,DD; 首次加载，使用参数value，参数为空时，使用当前日期
	const [selectedYear, setSelectedYear] = React.useState<number | undefined>(
		year
	);
	const [selectedMonth, setSelectedMonth] = React.useState<number>(month);
	const [selectedDay, setSelectedDay] = React.useState<number>(day);

	// 编辑日期
	const [editingYear, setEditingYear] = React.useState(false);
	const [editingMonth, setEditingMonth] = React.useState(false);
	const [editingDay, setEditingDay] = React.useState(false);

	// 选择日期的解析
	const parseSelectedDate = React.useMemo(() => {
		return parseDateValue(selectedDate, isLunar ? "LUNAR" : "SOLAR");
	}, [selectedDate, isLunar]);

	// 选项
	const monthOptions = React.useMemo(() => {
		if (isLunar) {
			const { LMonthsInYear } = parseSelectedDate;
			return LMonthsInYear.map((month) => ({
				value: (month as LunarMonth).getMonth(),
				label: (month as LunarMonth).getMonth(),
			}));
		} else {
			return Array.from({ length: 12 }, (_, i) => ({
				value: i + 1,
				label: i + 1,
			}));
		}
	}, [isLunar, parseSelectedDate]);

	// 数据更新
	React.useEffect(() => {
		let dateString;
		if (isIgnoreYear) {
			dateString = `${selectedMonth},${selectedDay}`;
		} else {
			dateString = `${selectedYear},${selectedMonth},${selectedDay}`;
		}
		setSelectedDate(dateString);
	}, [selectedYear, selectedMonth, selectedDay, isIgnoreYear]);

	// 切换isIgnoreYear
	React.useEffect(() => {
		const today = new Date();
		setSelectedYear(today.getFullYear());
		setSelectedMonth(today.getMonth() + 1);
		setSelectedDay(today.getDate());
	}, [isIgnoreYear]);

	// 处理年份忽略状态变化
	const handleToggleIgnoreYear = () => {
		setIsIgnoreYear((prev) => !prev);
	};

	// 处理农历/公历切换
	const handleToggleCalendarType = React.useCallback(() => {
		// 切换日历类型时，需要保持日期一致
		if (isIgnoreYear) {
			// 无年份模式下，只需验证月日的有效性
			const newMonth = selectedMonth;
			let newDay = selectedDay;

			if (isLunar) {
				// 从农历切换到公历
				// 农历可能有30天，公历2月最少28天
				if (selectedMonth === 2 && selectedDay > 29) {
					newDay = 29; // 安全设置为公历2月的最大可能天数
				}
			} else {
				// 从公历切换到农历
				// 农历月份最大30天
				if (selectedDay > 30) {
					newDay = 30;
				}
			}

			setSelectedMonth(newMonth);
			setSelectedDay(newDay);
		} else {
			// 有年份模式下, 直接使用解析数据
			setSelectedYear(parseSelectedDate.year);
			setSelectedMonth(parseSelectedDate.month);
			setSelectedDay(parseSelectedDate.day);
		}
		setIsLunar((prev) => !prev);
	}, [isLunar, isIgnoreYear]);

	// 处理日期编辑
	// 输入框失去焦点时的处理
	const handleEditBlur = () => {
		setEditingYear(false);
		setEditingMonth(false);
		setEditingDay(false);
	};
	const startEditingYear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isIgnoreYear) {
			setEditingYear(true);
			setEditingMonth(false);
			setEditingDay(false);
		}
	};
	const startEditingMonth = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingYear(false);
		setEditingMonth(true);
		setEditingDay(false);
	};
	const startEditingDay = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingYear(false);
		setEditingMonth(false);
		setEditingDay(true);
	};

	// 提交日期变更
	const handleSubmitDate = () => {
		onChange(selectedDate, isLunar ? "LUNAR" : "SOLAR");
		setIsOpen(false);
	};

	const renderPopupPicker = () => {
		return (
			<div className="date-picker-popup" ref={popupRef}>
				<div className="popup-header">
					<div className="calendar-controls">
						<div className="control-checkbox">
							<input
								type="checkbox"
								checked={isLunar}
								onChange={handleToggleCalendarType}
							/>
							<span className="control-label">农历</span>
						</div>
						<div className="control-checkbox">
							<input
								type="checkbox"
								checked={isIgnoreYear}
								onChange={handleToggleIgnoreYear}
							/>
							<span className="control-label">忽略年份</span>
						</div>
						<div className="control-checkbox">
							<button
								className="control-button"
								onClick={handleSubmitDate}
							>
								确认
							</button>
						</div>
					</div>
				</div>
				<div className="popup-content">
					<div className="date-selector-container">
						{/* 年月日选择器 */}
						<div className="date-selector-row">
							{!isIgnoreYear && (
								<>
									<div className="date-selector">
										<div
											className="date-value"
											onClick={startEditingYear}
										>
											{editingYear ? (
												<select
													value={selectedYear}
													onValueChange={(value) =>
														selectedYear(value)
													}
													options={Array.from(
														{ length: 9999 },
														(_, i) => ({
															value: i + 1,
															label: i + 1,
														})
													)}
												/>
											) : (
												parseSelectedDate.yearName
											)}
										</div>
									</div>
									<div className="date-selector">
										<div
											className="date-value"
											onClick={startEditingMonth}
										>
											{editingMonth ? (
												<Select
													value={selectedMonth}
													onValueChange={(value) =>
														selectedYear(value)
													}
													options={monthOptions}
												/>
											) : (
												parseSelectedDate.monthName
											)}
										</div>
									</div>
									<div className="date-selector">
										<div className="date-value">
											{parseSelectedDate.dayName}
										</div>
									</div>
								</>
							)}
						</div>
						<div className="date-conversion-info"></div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="yg-date-picker-container" ref={pickerRef}>
			<div
				className="date-display-value"
				onClick={() => setIsOpen((prev) => !prev)}
			>
				<span className="date-display-value-text"></span>
				<Calendar size={18} className="calendar-icon" />
			</div>
			{isOpen && renderPopupPicker()}
		</div>
	);
};
