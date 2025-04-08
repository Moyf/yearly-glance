import * as React from "react";
import {
	Lunar,
	LunarMonth,
	LunarYear,
	Solar,
	SolarUtil,
} from "lunar-typescript";
import { Calendar, Check, X } from "lucide-react"; // 引入 Lucide 图标
import { parseDateValue } from "@/src/core/utils/dateParser";
import "./style/DatePicker.css";

interface DatePickerProps {
	value: string; // 日期选择器的初始值
	defaultLunar: boolean; // 是否默认使用农历模式
	onChange: (value: string, dateType: "SOLAR" | "LUNAR") => void; // 日期变化时的回调函数，返回日期字符串和日期类型
}

// 获取当前日期,格式为YYYY,MM,DD
const todayString = `${new Date().getFullYear()},${
	new Date().getMonth() + 1
},${new Date().getDate()}`;

export const DatePicker: React.FC<DatePickerProps> = ({
	value = todayString, // 默认使用当前日期
	onChange,
	defaultLunar = false,
}) => {
	const { hasYear } = parseDateValue(value, defaultLunar ? "LUNAR" : "SOLAR");

	// 状态管理
	const [isLunar, setIsLunar] = React.useState(defaultLunar);
	const [ignoreYear, setIgnoreYear] = React.useState(!hasYear);
	const [selectedDate, setSelectedDate] = React.useState(value);

	// 是否打开日期选择器
	const [isOpen, setIsOpen] = React.useState(false);
	// 分别为年、月、日创建编辑状态
	const [editingYear, setEditingYear] = React.useState(false);
	const [editingMonth, setEditingMonth] = React.useState(false);
	const [editingDay, setEditingDay] = React.useState(false);

	// 解析当前选择的日期
	const parsedSelectedDate: {
		Ld: Lunar;
		Sd: Solar;
		hasYear: boolean;
		year: number;
		month: number;
		monthAbs: number;
		day: number;
		yearName: string;
		monthName: string;
		dayName: string;
	} = React.useMemo(() => {
		return parseDateValue(selectedDate, isLunar ? "LUNAR" : "SOLAR");
	}, [selectedDate, isLunar]);

	// 当前选择的年月日
	const [selectedYear, setSelectedYear] = React.useState(
		parsedSelectedDate.year
	);
	const [selectedMonth, setSelectedMonth] = React.useState(
		parsedSelectedDate.month
	);
	const [selectedDay, setSelectedDay] = React.useState(
		parsedSelectedDate.day
	);

	const [savedData, setSavedData] = React.useState({
		date: parsedSelectedDate,
		isLunar: defaultLunar,
		ignoreYear: ignoreYear,
	});

	// 只在保存时重新显示
	const formatDate = React.useCallback(() => {
		const { Ld, Sd } = parsedSelectedDate;
		return ignoreYear
			? isLunar
				? Ld.toString().slice(5)
				: Sd.toYmd().slice(5)
			: isLunar
			? Ld.toString()
			: Sd.toYmd();
	}, [savedData]);

	// 当任何依赖项变化时，更新selectedDate
	React.useEffect(() => {
		let dateString;
		if (ignoreYear) {
			dateString = `${selectedMonth},${selectedDay}`;
		} else {
			dateString = `${selectedYear},${selectedMonth},${selectedDay}`;
		}
		setSelectedDate(dateString);
	}, [selectedYear, selectedMonth, selectedDay, ignoreYear, isLunar]);

	React.useEffect(() => {
		const { year, month, day } = parseDateValue(
			selectedDate,
			isLunar ? "LUNAR" : "SOLAR"
		);
		setSelectedYear(year);
		setSelectedMonth(month);
		setSelectedDay(day);
	}, [isLunar, ignoreYear]);

	// 用于定位弹出窗口的ref
	const pickerRef = React.useRef<HTMLDivElement>(null);
	const popupRef = React.useRef<HTMLDivElement>(null);

	const toggleDatePicker = (e: React.MouseEvent) => {
		e.stopPropagation(); // 阻止事件冒泡
		setIsOpen((prev) => !prev);
		// 重置所有编辑状态
		setEditingYear(false);
		setEditingMonth(false);
		setEditingDay(false);
	};

	const toggleLunar = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation(); // 阻止事件冒泡

		const newDate = isLunar
			? `${parsedSelectedDate.Sd.getYear()},${parsedSelectedDate.Sd.getMonth()},${parsedSelectedDate.Sd.getDay()}`
			: `${parsedSelectedDate.Ld.getYear()},${parsedSelectedDate.Ld.getMonth()},${parsedSelectedDate.Ld.getDay()}`;
		setSelectedDate(newDate);
		setIsLunar((prev) => !prev);
	};

	const toggleIgnoreYear = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation(); // 阻止事件冒泡
		setIgnoreYear((prev) => !prev);
	};

	// 处理直接输入的年份变化
	const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		const value = parseInt(e.target.value);
		if (value > 0) {
			setSelectedYear(value);
		}
	};

	// 处理直接输入的月份变化
	const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		const value = parseInt(e.target.value);
		if (!ignoreYear && isLunar) {
			const lunarLeapMonth = LunarYear.fromYear(
				parsedSelectedDate.year
			).getLeapMonth();
			if (value === lunarLeapMonth) {
				setSelectedMonth(value);
			} else if (value >= 1 && value <= 12) {
				setSelectedMonth(value);
			}
		} else if (value >= 1 && value <= 12) {
			setSelectedMonth(value);
		}
	};

	// 处理直接输入的日期变化
	const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.stopPropagation();
		const value = parseInt(e.target.value);
		if (!ignoreYear) {
			if (isLunar) {
				const lunarMonthDays = LunarMonth.fromYm(
					parsedSelectedDate.year,
					parsedSelectedDate.month
				)?.getDayCount();
				if (value >= 1 && value <= lunarMonthDays!) {
					setSelectedDay(value);
				}
			} else {
				const solarMonthDays = SolarUtil.getDaysOfMonth(
					parsedSelectedDate.year,
					parsedSelectedDate.month
				);
				if (value >= 1 && value <= solarMonthDays) {
					setSelectedDay(value);
				}
			}
		} else if (value >= 1 && value <= 31) {
			setSelectedDay(value);
		}
	};

	// 输入框失去焦点时的处理
	const handleEditBlur = () => {
		setEditingYear(false);
		setEditingMonth(false);
		setEditingDay(false);
	};

	// 输入框按键处理
	const handleKeyDown = (
		e: React.KeyboardEvent,
		setEditingState: React.Dispatch<React.SetStateAction<boolean>>
	) => {
		if (e.key === "Enter" || e.key === "Escape") {
			e.preventDefault();
			setEditingState(false);
		}
	};

	// 点击年份
	const startEditingYear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!ignoreYear) {
			setEditingYear(true);
			setEditingMonth(false);
			setEditingDay(false);
		}
	};

	// 点击月份
	const startEditingMonth = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingYear(false);
		setEditingMonth(true);
		setEditingDay(false);
	};

	// 点击日
	const startEditingDay = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditingYear(false);
		setEditingMonth(false);
		setEditingDay(true);
	};

	const handleSave = (e: React.MouseEvent) => {
		e.stopPropagation(); // 阻止事件冒泡
		setSavedData({
			date: parsedSelectedDate,
			isLunar: isLunar,
			ignoreYear: ignoreYear,
		});
		// 传递日期字符串和日期类型
		onChange(selectedDate, isLunar ? "LUNAR" : "SOLAR");
		setIsOpen(false);
	};

	return (
		<div className="yg-date-picker-container" ref={pickerRef}>
			<div className="date-display-value" onClick={toggleDatePicker}>
				<span className="date-display-value-text">{formatDate}</span>
				<Calendar size={18} className="calendar-icon" />
			</div>

			{isOpen && (
				<div className="date-picker-popup" ref={popupRef}>
					<div className="popup-header">
						<div className="calendar-controls">
							<div className="control-checkbox">
								<input
									type="checkbox"
									checked={isLunar}
									onChange={toggleLunar}
									onClick={(e) => e.stopPropagation()}
								/>
								<span className="control-label">农历</span>
							</div>
							<div className="control-checkbox">
								<input
									type="checkbox"
									checked={ignoreYear}
									onChange={toggleIgnoreYear}
									onClick={(e) => e.stopPropagation()}
								/>
								<span className="control-label">忽略年份</span>
							</div>
						</div>

						<div>
							<button
								className="save-button"
								onClick={handleSave}
							>
								<Check size={16} />
							</button>
							<button
								className="close-button"
								onClick={toggleDatePicker}
							>
								<X size={16} />
							</button>
						</div>
					</div>

					<div className="popup-content">
						<div className="date-selector-container">
							{/* 年月日选择器 */}
							<div className="date-selector-row">
								{!ignoreYear && (
									<div
										className="date-selector"
										onClick={(e) => e.stopPropagation()}
									>
										<div
											className="date-value"
											onClick={startEditingYear}
										>
											{editingYear && !ignoreYear ? (
												<input
													type="text"
													className="date-edit-input"
													value={selectedYear}
													onChange={handleYearChange}
													onClick={(e) =>
														e.stopPropagation()
													}
													onBlur={handleEditBlur}
													onKeyDown={(e) =>
														handleKeyDown(
															e,
															setEditingYear
														)
													}
													autoFocus
												/>
											) : (
												parsedSelectedDate.yearName
											)}
										</div>
									</div>
								)}

								<div
									className="date-selector"
									onClick={(e) => e.stopPropagation()}
								>
									<div
										className="date-value"
										onClick={startEditingMonth}
									>
										{editingMonth ? (
											<input
												type="text"
												className="date-edit-input"
												value={selectedMonth}
												onChange={handleMonthChange}
												onClick={(e) =>
													e.stopPropagation()
												}
												onBlur={handleEditBlur}
												onKeyDown={(e) =>
													handleKeyDown(
														e,
														setEditingMonth
													)
												}
												autoFocus
											/>
										) : (
											parsedSelectedDate.monthName
										)}
									</div>
								</div>

								<div
									className="date-selector"
									onClick={(e) => e.stopPropagation()}
								>
									<div
										className="date-value"
										onClick={startEditingDay}
									>
										{editingDay ? (
											<input
												type="text"
												className="date-edit-input"
												value={selectedDay}
												onChange={handleDayChange}
												onClick={(e) =>
													e.stopPropagation()
												}
												onBlur={handleEditBlur}
												onKeyDown={(e) =>
													handleKeyDown(
														e,
														setEditingDay
													)
												}
												autoFocus
											/>
										) : (
											parsedSelectedDate.dayName
										)}
									</div>
								</div>
							</div>

							{/* 显示对应的公历或农历日期 */}
							<div
								className="date-conversion-info"
								// onClick={(e) => e.stopPropagation()}
							>
								{isLunar ? "农历" : "公历"}：
								{ignoreYear
									? isLunar
										? parsedSelectedDate.Ld.toString().slice(
												5
										  )
										: parsedSelectedDate.Sd.toYmd().slice(5)
									: isLunar
									? parsedSelectedDate.Ld.toString()
									: parsedSelectedDate.Sd.toYmd()}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
