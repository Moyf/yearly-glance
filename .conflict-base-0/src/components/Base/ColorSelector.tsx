import * as React from "react";
import { RotateCcw } from "lucide-react";
import "./style/ColorSelector.css";

/**
 * 颜色选择器组件
 * 1. 支持默认颜色显示
 * 2. 仅在颜色被修改后显示重置按钮
 * 3. 可自定义标签和提示文本
 * 4. 可控制默认颜色的提交行为
 * value: 当前所选颜色
 * defaultColor: 默认颜色，当value未提供时使用
 * onChange: 颜色变更回调
 * label: 标签文本
 * resetTitle: 重置按钮提示文本
 * disabled: 是否禁用
 * submitDefaultAsValue: 当颜色与默认颜色相同时是否提交变更
 */

interface ColorSelectorProps {
	value?: string;
	defaultColor?: string;
	onChange: (color: string | undefined) => void;
	label?: string;
	resetTitle?: string;
	disabled?: boolean;
	submitDefaultAsValue?: boolean;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
	value,
	defaultColor,
	onChange,
	label,
	resetTitle,
	disabled = false,
	submitDefaultAsValue = false,
}) => {
	// 跟踪颜色是否被修改过
	const [isModified, setIsModified] = React.useState<boolean>(false);
	// 跟踪颜色的真实值(包括当submitDefaultAsValue=true时的默认颜色)
	const [actualColor, setActualColor] = React.useState<string>(
		value || defaultColor
	);

	// 实际显示的颜色值
	const displayColor = value || defaultColor;

	// 检测value变化来更新修改状态和实际颜色
	React.useEffect(() => {
		// 如果value存在，则认为已修改
		setIsModified(!!value);
		setActualColor(value || defaultColor);
	}, [value, defaultColor]);

	// 处理颜色变更
	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setActualColor(e.target.value);

		// 判断是否需要提交变更
		if (actualColor === defaultColor && !submitDefaultAsValue) {
			// 如果颜色与默认值相同且不需要提交默认值，则提交undefined
			onChange(undefined);
		} else {
			// 否则提交实际的颜色值
			onChange(actualColor);
		}

		// 只要操作了颜色选择器，就标记为已修改
		setIsModified(true);
	};

	// 重置颜色
	const handleReset = () => {
		setActualColor(defaultColor);
		onChange(undefined);
		setIsModified(false);
	};

	return (
		<div className="yg-color-selector-container">
			{label && <label>{label}</label>}
			<div className="yg-color-selector-input-group">
				<input
					type="color"
					value={displayColor}
					onChange={handleColorChange}
					disabled={disabled}
					className="yg-color-input"
				/>
				{isModified && (
					<button
						type="button"
						className="yg-color-reset-button"
						onClick={handleReset}
						title={resetTitle}
						disabled={disabled}
					>
						<RotateCcw size={16} />
					</button>
				)}
			</div>
		</div>
	);
};
