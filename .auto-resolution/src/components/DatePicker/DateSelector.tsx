import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectOption } from "../Base/Select";
import { t } from "@/src/i18n/i18n";
import "./style/DateSelector.css";

interface DateSelectorProps {
	value: any;
	onChange: (value: string) => void;
	options: SelectOption[];
	type: "year" | "month" | "day";
	className?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
	value,
	onChange,
	options,
	type,
	className = "",
}) => {
	const handleDecrease = () => {
		const currentIndex = options.findIndex(
			(option) => option.value === value
		);
		const newIndex =
			currentIndex > 0 ? currentIndex - 1 : options.length - 1;
		const newValue = options[newIndex].value;
		onChange(newValue);
	};

	const handleIncrease = () => {
		const currentIndex = options.findIndex(
			(option) => option.value === value
		);
		const newIndex =
			currentIndex < options.length - 1 ? currentIndex + 1 : 0;
		const newValue = options[newIndex].value;
		onChange(newValue);
	};

	const handleSelectChange = (newValue: any) => {
		onChange(newValue);
	};

	const getDateTypeText = React.useCallback(() => {
		if (type === "year") return t("view.eventManager.form.year");
		if (type === "month") return t("view.eventManager.form.month");
		if (type === "day") return t("view.eventManager.form.day");
		return "";
	}, [type]);

	return (
		<div className={`yg-date-selector ${className}`}>
			<div className="yg-date-selector-select">
				<Select
					value={value}
					onValueChange={handleSelectChange}
					options={options}
					placeholder={`${t(
						"view.eventManager.form.selectDateType"
					)}${getDateTypeText()}`}
				/>
			</div>

			<div className="yg-date-selector-arrows">
				<span
					className="yg-date-selector-arrow yg-date-selector-prev"
					onClick={handleDecrease}
					title={`${t(
						"view.eventManager.form.previousDate"
					)}${getDateTypeText()}`}
				>
					<ChevronUp size={18} />
				</span>
				<span
					className="yg-date-selector-arrow yg-date-selector-next"
					onClick={handleIncrease}
					title={`${t(
						"view.eventManager.form.nextDate"
					)}${getDateTypeText()}`}
				>
					<ChevronDown size={18} />
				</span>
			</div>
		</div>
	);
};
