import * as React from "react";
import "./style/Button.css";

interface ButtonProps {
	children?: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	variant?: "primary" | "secondary" | "outline" | "danger";
	size?: "small" | "medium" | "large";
	icon?: React.ReactNode;
	className?: string;
	type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
	children,
	onClick,
	disabled = false,
	variant = "primary",
	size = "medium",
	icon,
	className = "",
	type = "button",
}) => {
	const baseClasses = [
		"yg-button",
		`yg-button--${variant}`,
		`yg-button--${size}`,
		disabled && "yg-button--disabled",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button
			type={type as "button" | "submit" | "reset"}
			className={baseClasses}
			onClick={onClick}
			disabled={disabled}
		>
			{icon && <span className="yg-button__icon">{icon}</span>}
			{children && <span className="yg-button__text">{children}</span>}
		</button>
	);
};
