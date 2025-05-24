import * as React from "react";
import { SelectOption } from "../Base/Select";
import "./style/DateSelector.css";

interface DateSelectorProps {
	value: number;
	onChange: (value: number) => void;
	type: "year" | "month" | "day";
	min?: number;
	max?: number;
	options?: SelectOption[];
	className?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
	value,
	onChange,
	type,
	min,
	max,
	options = [] as SelectOption[],
	className = "",
}) => {
	const [inputValue, setInputValue] = React.useState(value);
	const [showOptions, setShowOptions] = React.useState(false);
	// 初始化 selectedIndex 为当前值在 options 中的位置
	const [selectedIndex, setSelectedIndex] = React.useState(() => {
		return options.findIndex((option) => option.value === value);
	});
	const containerRef = React.useRef<HTMLDivElement>(null);
	const suggestionsRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		setInputValue(value);
	}, [value]);

	// 在选项显示时或 selectedIndex 改变时，滚动到当前选中的选项
	React.useEffect(() => {
		if (showOptions && selectedIndex >= 0 && suggestionsRef.current) {
			// 使用 setTimeout 确保 DOM 已更新
			setTimeout(() => {
				const suggestionsContainer = suggestionsRef.current;
				const selectedElement = suggestionsContainer?.children[
					selectedIndex
				] as HTMLElement;

				if (selectedElement && suggestionsContainer) {
					// 计算需要滚动的位置
					const scrollTop = selectedElement.offsetTop;
					const elementHeight = selectedElement.offsetHeight;
					const containerHeight = suggestionsContainer.clientHeight;

					// 如果选中项不在可视区域内，则滚动到它在容器中居中的位置
					if (
						scrollTop < suggestionsContainer.scrollTop ||
						scrollTop + elementHeight >
							suggestionsContainer.scrollTop + containerHeight
					) {
						suggestionsContainer.scrollTop =
							scrollTop - containerHeight / 2 + elementHeight / 2;
					}
				}
			}, 0);
		}
	}, [showOptions, selectedIndex]);

	const handleOptionClick = (value: number) => {
		setInputValue(value);
		onChange(value);
		setShowOptions(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
	};

	const handleInputBlur = () => {
		let finalValue = inputValue;

		if (min !== undefined && finalValue < min) {
			finalValue = min;
		} else if (max !== undefined && finalValue > max) {
			finalValue = max;
		}

		setInputValue(finalValue);
		onChange(finalValue);
	};

	const handleFocusCapture = (e: React.FocusEvent) => {
		if (containerRef.current?.contains(e.target)) {
			if (options && options.length > 0) {
				setShowOptions(true);
			}
		}
	};

	const handleBlurCapture = (e: React.FocusEvent) => {
		requestAnimationFrame(() => {
			if (!containerRef.current?.contains(e.relatedTarget)) {
				setShowOptions(false);
			}
		});
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (type === "year") {
			if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
			}
			return;
		}

		switch (e.key) {
			case "ArrowUp":
				e.preventDefault();
				if (options.length > 0) {
					setShowOptions(true);
					setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
				}
				break;
			case "ArrowDown":
				e.preventDefault();
				if (options.length > 0) {
					setShowOptions(true);
					setSelectedIndex((prev) =>
						prev < options.length - 1 ? prev + 1 : prev
					);
				}
				break;
			case "Enter":
				e.preventDefault();
				if (options.length > 0 && selectedIndex >= 0) {
					handleOptionClick(options[selectedIndex].value as number);
				}
				break;
			case "Escape":
				setShowOptions(false);
				setSelectedIndex(-1);
				break;
		}
	};

	return (
		<div
			className={`yg-date-selector ${className}`}
			ref={containerRef}
			onFocusCapture={handleFocusCapture}
			onBlurCapture={handleBlurCapture}
		>
			<div className="yg-date-selector-select">
				<input
					className="yg-date-selector-input"
					type={type === "year" ? "number" : "text"}
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleInputBlur}
					onKeyDown={handleKeyDown}
					min={min}
					max={max}
				/>
				{showOptions && options && options.length > 0 && (
					<div
						className="yg-date-selector-suggestions"
						ref={suggestionsRef}
						onMouseDown={(e) => {
							e.preventDefault();
						}}
					>
						{options.map((option, index) => (
							<div
								key={index}
								className={`yg-date-selector-suggestion ${
									index === selectedIndex ? "selected" : ""
								}`}
								onMouseDown={(e) => {
									e.preventDefault();
									handleOptionClick(option.value as number);
								}}
							>
								{option.label}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
