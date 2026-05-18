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
		const inputRef = React.useRef<HTMLInputElement>(null);
		const isComposingRef = React.useRef(false);

		// 合并外部ref和内部ref
		React.useImperativeHandle(ref, () => inputRef.current!);

		// 强制设置value的函数
		const forceSetValue = React.useCallback(() => {
			if (inputRef.current && value !== undefined) {
				const stringValue = String(value);
				if (inputRef.current.value !== stringValue) {
					inputRef.current.value = stringValue;
					inputRef.current.setAttribute("value", stringValue);
				}
			}
		}, [value]);

		// 在value变化时强制更新DOM
		React.useEffect(() => {
			if (!isComposingRef.current) {
				forceSetValue();
			}
		}, [forceSetValue]);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			// 只有在非中文输入状态下才触发onChange
			if (!isComposingRef.current) {
				const { value } = e.target;
				onChange(value);
			}
		};

		const handleCompositionStart = () => {
			isComposingRef.current = true;
		};

		const handleCompositionEnd = (
			e: React.CompositionEvent<HTMLInputElement>
		) => {
			isComposingRef.current = false;
			// 中文输入结束后触发onChange
			const target = e.target as HTMLInputElement;
			onChange(target.value);
		};

		const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
			// focus时延迟设置value，避免光标位置问题
			window.setTimeout(forceSetValue, 10);
			props.onFocus?.(e);
		};

		const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			// blur时延迟设置value
			window.setTimeout(forceSetValue, 150);
			props.onBlur?.(e);
		};

		return (
			<div className="yg-input-wrapper">
				{prefix && <div className="yg-input-prefix">{prefix}</div>}
				<input
					ref={inputRef}
					className={`yg-input ${className}`}
					defaultValue={String(value)}
					onChange={handleChange}
					onCompositionStart={handleCompositionStart}
					onCompositionEnd={handleCompositionEnd}
					onFocus={handleFocus}
					onBlur={handleBlur}
					type={type}
					placeholder={placeholder}
					{...props}
				/>
			</div>
		);
	}
);

Input.displayName = "Input";
