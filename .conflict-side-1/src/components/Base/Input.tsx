import * as React from "react";
import "./style/Input.css";

interface InputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"onChange" | "prefix"
	> {
	value: string | number;
	prefix?: React.ReactNode;
	placeholder?: string;
	onChange: (value: string) => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className = "",
			value,
			onChange,
			type = "text",
			prefix,
			placeholder,
			...props
		},
		ref
	) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			onChange(newValue);
		};

		return (
			<div className="yg-input-wrapper">
				{prefix && <div className="yg-input-prefix">{prefix}</div>}
				<input
					ref={ref}
					className={`yg-input ${className}`}
					value={value}
					onChange={handleChange}
					type={type}
					placeholder={placeholder}
					{...props}
				/>
			</div>
		);
	}
);

Input.displayName = "Input";
