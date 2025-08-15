import * as React from "react";
import "./style/Toggle.css";

interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	className?: string;
	"aria-label"?: string;
	label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
	checked,
	onChange,
	className = "",
	"aria-label": ariaLabel,
	label,
}) => {
	const handleChange = React.useCallback(() => {
		onChange(!checked);
	}, [checked, onChange]);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onChange(!checked);
			}
		},
		[checked, onChange]
	);
	return (
		<div
			className={`yg-toggle ${checked ? "is-enabled" : ""} ${className}`}
			onClick={handleChange}
			role="switch"
			aria-checked={checked}
			aria-label={ariaLabel}
			onKeyDown={handleKeyDown}
			tabIndex={0}
		>
			{label && <span className="yg-toggle-label">{label}</span>}
			<div className="yg-toggle-slider" />
		</div>
	);
};
