import * as React from "react";
import { DateSelector } from "./DateSelector";
import {
	getDayOptions,
	getMonthOptions,
	parseDateValue,
} from "@/src/core/utils/dateParser";

interface DatePickerMDProps {
	value: string;
	type: "SOLAR" | "LUNAR";
	onChange: (value: string, dateType: "SOLAR" | "LUNAR") => void;
}

export const DatePickerMD: React.FC<DatePickerMDProps> = ({
	value,
	type,
	onChange,
}) => {
	const { month, day } = parseDateValue(value, type);

	const [selectMonth, setSelectMonth] = React.useState<number>(month);
	const [selectDay, setSelectDay] = React.useState<number>(day);
	const [prevType, setPrevType] = React.useState<"SOLAR" | "LUNAR">(type);

	const monthOptions = React.useMemo(() => {
		return getMonthOptions(type);
	}, [type]);

	const dayOptions = React.useMemo(() => {
		return getDayOptions(type, selectMonth);
	}, [selectMonth, type]);

	// 月份切换处理
	React.useEffect(() => {
		// 获取当前月份的最大天数
		const maxDaysInCurrentMonth =
			type === "SOLAR"
				? [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
						selectMonth - 1
				  ]
				: 30; // 农历每月最多30天

		// 如果当前选择的日期大于当前月份的最大天数，则调整为最大天数
		if (selectDay > maxDaysInCurrentMonth) {
			setSelectDay(maxDaysInCurrentMonth);
		}
	}, [selectMonth, type]);

	// 日期类型改变处理
	React.useEffect(() => {
		if (type !== prevType && selectMonth && selectDay) {
			// 记录新的类型
			setPrevType(type);
			// 日期类型发生变化时进行转换
			if (type === "SOLAR" && prevType === "LUNAR") {
				// 农历转公历时，处理农历30日转换到公历月份（特别是2月）的情况
				const solarDaysInMonth = [
					31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
				][selectMonth - 1];
				if (selectDay > solarDaysInMonth) {
					setSelectDay(solarDaysInMonth);
				}
			} else if (type === "LUNAR" && prevType === "SOLAR") {
				// 公历转农历时，处理公历31日转换到农历的情况
				if (selectDay > 30) {
					setSelectDay(30); // 农历最大只有30天
				}
			}
		}
	}, [type, selectMonth, selectDay]);

	// 当选择的月或日发生变化时，触发onChange
	React.useEffect(() => {
		if (selectMonth && selectDay) {
			const newValue = `${selectMonth},${selectDay}`;

			onChange(newValue);
		}
	}, [selectMonth, selectDay]);

	return (
		<div className="date-selector-MD">
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
