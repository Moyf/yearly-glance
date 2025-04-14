import * as React from "react";
import "./style/Select.css";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SelectOption {
	value: any;
	label: string;
}

interface SelectProps {
	value: any;
	onValueChange: (value: any) => void;
	options: SelectOption[];
	placeholder?: string;
	className?: string;
}

export const Select: React.FC<SelectProps> = ({
	value,
	onValueChange,
	options,
	placeholder = "Select an option",
	className = "",
}) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const selectRef = React.useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				selectRef.current &&
				!selectRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="yg-select-wrapper" ref={selectRef}>
			<div
				className={`yg-select ${
					isOpen ? "yg-select-open" : ""
				} ${className}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="yg-select-value">
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<span className="yg-select-arrow">
					{isOpen ? <ChevronUp /> : <ChevronDown />}
				</span>
			</div>
			{isOpen && (
				<div className="yg-select-dropdown">
					{options.map((option) => (
						<div
							key={option.value}
							className={`yg-select-option ${
								option.value === value ? "selected" : ""
							}`}
							onClick={() => {
								onValueChange(option.value);
								setIsOpen(false);
							}}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
};
