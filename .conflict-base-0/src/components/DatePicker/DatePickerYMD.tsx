import * as React from "react";
import { DateSelector } from "./DateSelector";
import {
	displayDateValue,
	getMonthOptions,
	parseDateValue,
} from "@/src/core/utils/dateParser";
import {
	LunarYearOptions,
	SolarYearOptions,
} from "@/src/core/data/dateOptions";
import {
	Lunar,
	LunarMonth,
	LunarYear,
	Solar,
	SolarUtil,
} from "lunar-typescript";

interface DatePickerYMDProps {
	value: string;
	type: "SOLAR" | "LUNAR";
	onChange: (value: string, dateType: "SOLAR" | "LUNAR") => void;
}

export const DatePickerYMD: React.FC<DatePickerYMDProps> = ({
	value,
	type,
	onChange,
}) => {
	const { year, month, day } = parseDateValue(value, type);

	const [selectYear, setSelectYear] = React.useState<number>(year!);
	const [selectMonth, setSelectMonth] = React.useState<number>(month);
	const [selectDay, setSelectDay] = React.useState<number>(day);
	const [prevType, setPrevType] = React.useState<"SOLAR" | "LUNAR">(type);

	const yearOptions = React.useMemo(() => {
		if (type === "SOLAR") {
			return SolarYearOptions;
		} else {
			return LunarYearOptions;
		}
	}, [type]);

	const monthOptions = React.useMemo(() => {
		if (type === "SOLAR") {
			return getMonthOptions(type);
		} else {
			const lunarYear = LunarYear.fromYear(selectYear);
			const lunarMonthsInYear = lunarYear.getMonthsInYear();
			return lunarMonthsInYear.map((month) => ({
				value: month.getMonth(),
				label: displayDateValue(month.getMonth(), "LUNAR", "month"),
			}));
		}
	}, [selectYear, type]);

	const dayOptions = React.useMemo(() => {
		if (type === "SOLAR") {
			const SolarDaysOfMonth = SolarUtil.getDaysOfMonth(
				selectYear,
				selectMonth
			);
			return Array.from(
				{ length: SolarDaysOfMonth },
				(_, i) => i + 1
			).map((day) => ({
				value: day,
				label: displayDateValue(day, "SOLAR", "day"),
			}));
		} else {
			const LMonth = LunarMonth.fromYm(selectYear, selectMonth);
			const LunarDaysOfMonth = LMonth!.getDayCount();
			return Array.from(
				{ length: LunarDaysOfMonth },
				(_, i) => i + 1
			).map((day) => ({
				value: day,
				label: displayDateValue(day, "LUNAR", "day"),
			}));
		}
	}, [selectYear, selectMonth, type]);

	// 闰月处理
	React.useEffect(() => {
		if (type === "LUNAR" && selectMonth < 0) {
			const monthExists = monthOptions.some(
				(option) => option.value === selectMonth
			);
			if (!monthExists) {
				setSelectMonth(Math.abs(selectMonth));
			}
		}
	}, [type, monthOptions, selectYear, selectMonth]);

	// 日期类型改变处理
	React.useEffect(() => {
		if (type !== prevType && selectYear && selectMonth && selectDay) {
			// 记录新的类型
			setPrevType(type);

			if (type === "SOLAR" && prevType === "LUNAR") {
				const lunarDay = Lunar.fromYmd(
					selectYear,
					selectMonth,
					selectDay
				);
				const solarDay = lunarDay.getSolar();

				// 更新状态
				setSelectYear(solarDay.getYear());
				setSelectMonth(solarDay.getMonth());
				setSelectDay(solarDay.getDay());
			} else if (type === "LUNAR" && prevType === "SOLAR") {
				const solarDay = Solar.fromYmd(
					selectYear,
					selectMonth,
					selectDay
				);
				const lunarDay = solarDay.getLunar();

				// 更新状态
				setSelectYear(lunarDay.getYear());
				setSelectMonth(lunarDay.getMonth());
				setSelectDay(lunarDay.getDay());
			}
		}
	}, [type, prevType, selectYear, selectMonth, selectDay]);

	// 当选择的年、月或日发生变化时，触发onChange
	React.useEffect(() => {
		if (selectYear && selectMonth && selectDay) {
			const newValue = `${selectYear},${selectMonth},${selectDay}`;

			onChange(newValue);
		}
	}, [selectYear, selectMonth, selectDay]);

	return (
		<div className="date-selector-YMD">
			<DateSelector
				value={selectYear}
				type="year"
				options={yearOptions}
				onChange={(value) => setSelectYear(value)}
			/>
			<DateSelector
				value={selectMonth}
				type="month"
				options={monthOptions}
				onChange={(value) => setSelectMonth(value)}
			/>
			<DateSelector
				value={selectDay}
				type="day"
				options={dayOptions}
				onChange={(value) => setSelectDay(value)}
			/>
		</div>
	);
};
