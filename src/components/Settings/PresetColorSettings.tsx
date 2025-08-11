import { DEFAULT_PRESET_COLORS, IPresetColor } from "@/src/type/Settings";
import * as React from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Toggle } from "@/src/components/Base/Toggle";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import "./style/PresetColorSettings.css";
import { Input } from "@/src/components/Base/Input";

interface PresetColorSettingsProps {
	presetColors: IPresetColor[];
	onChange: (Colors: IPresetColor[]) => void;
}

export const PresetColorSettings: React.FC<PresetColorSettingsProps> = ({
	presetColors,
	onChange,
}) => {
	const [colors, setColors] = React.useState<IPresetColor[]>(presetColors);
	const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(
		null
	);

	React.useEffect(() => {
		setColors(presetColors);
	}, [presetColors]);

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		setDragOverIndex(index);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		if (
			draggedIndex !== null &&
			dragOverIndex !== null &&
			draggedIndex !== dragOverIndex
		) {
			const newColors = [...colors];
			const draggedItem = newColors[draggedIndex];
			newColors.splice(draggedIndex, 1);
			newColors.splice(dragOverIndex, 0, draggedItem);
			setColors(newColors);
			onChange(newColors);
		}
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleColorChange = (index: number, value: string) => {
		const newColors = [...colors];
		newColors[index] = { ...newColors[index], value };
		setColors(newColors);
		onChange(newColors);
	};

	const handleLabelChange = (index: number, label: string) => {
		if (colors[index].id !== undefined) return;
		const newColors = [...colors];
		newColors[index] = { ...newColors[index], label };
		setColors(newColors);
		onChange(newColors);
	};

	const handleEnableChange = (index: number) => {
		const newColors = [...colors];
		newColors[index] = {
			...newColors[index],
			enable: !newColors[index].enable,
		};
		setColors(newColors);
		onChange(newColors);
	};

	const handleRemove = (index: number) => {
		if (colors[index].id !== undefined) return;
		const newColors = [...colors];
		newColors.splice(index, 1);
		setColors(newColors);
		onChange(newColors);
	};

	const handleReset = (index: number) => {
		if (colors[index].id === undefined) return;

		// 查找默认颜色中对应的颜色
		const defaultColor = DEFAULT_PRESET_COLORS.find(
			(color) => color.id === colors[index].id
		);
		if (!defaultColor) return;

		// 重置为默认值
		const newColors = [...colors];
		newColors[index] = { ...newColors[index], value: defaultColor.value };
		setColors(newColors);
		onChange(newColors);
	};

	const handleAdd = () => {
		const customColorCount = colors.filter(
			(color) => color.id === undefined
		).length;

		const newColors = [
			...colors,
			{
				label: `${t("setting.general.presetColors.newColor")} #${
					customColorCount + 1
				}`,
				value: "#cccccc",
				enable: true,
			},
		];
		setColors(newColors);
		onChange(newColors);
	};

	return (
		<div className="yg-preset-colors">
			<div className="yg-preset-colors-header">
				<button className="yg-color-add mod-cta" onClick={handleAdd}>
					<Plus />
				</button>
			</div>
			<div className="yg-preset-colors-container">
				{presetColors.map((color, index) => (
					<div
						key={index}
						className={`yg-color-item ${
							draggedIndex === index ? "dragging" : ""
						} ${dragOverIndex === index ? "drag-over" : ""}`}
					>
						<div className="yg-color-input-container">
							<span
								className="yg-drag-handle"
								draggable
								onDragStart={(e) => handleDragStart(e, index)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDrop={handleDrop}
								onDragEnd={handleDragEnd}
							>
								≡
							</span>
							<div className="yg-color-preview">
								<Input
									type="color"
									value={color.value}
									onChange={(value) =>
										handleColorChange(index, value)
									}
								/>
							</div>
							<Input
								className="yg-color-input-label"
								type="text"
								value={
									color.id !== undefined
										? t(
												`data.color.${color.id}` as TranslationKeys
										  )
										: color.label
								}
								disabled={color.id !== undefined}
								onChange={(value) =>
									handleLabelChange(index, value)
								}
							/>
							<Input
								className="yg-color-input-value"
								type="text"
								value={color.value}
								onChange={(value) =>
									handleColorChange(index, value)
								}
							/>
						</div>
						<div className="yg-color-actions">
							<Toggle
								checked={color.enable}
								onChange={() => handleEnableChange(index)}
							/>
							{color.id !== undefined ? (
								<button
									className="yg-color-reset mod-cta"
									onClick={() => handleReset(index)}
								>
									<RotateCcw size={18} />
								</button>
							) : (
								<button
									className="yg-color-remove mod-cta"
									onClick={() => handleRemove(index)}
								>
									<Trash2 size={18} />
								</button>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
