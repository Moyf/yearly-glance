import { IPresetColor } from "@/src/core/interfaces/Settings";
import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Toggle } from "../Base/Toggle";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import "./style/PresetColorSettings.css";

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

	const handleDragStart = (index: number) => {
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
		if (colors[index].id !== undefined) return;
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
						draggable
						onDragStart={() => handleDragStart(index)}
						onDragOver={(e) => handleDragOver(e, index)}
						onDrop={handleDrop}
						onDragEnd={handleDragEnd}
					>
						<div className="yg-color-input-container">
							<span className="yg-drag-handle">≡</span>
							<div className="yg-color-preview">
								<input
									type="color"
									value={color.value}
									onChange={(e) =>
										handleColorChange(index, e.target.value)
									}
									disabled={color.id !== undefined}
								/>
							</div>
							<input
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
								onChange={(e) =>
									handleLabelChange(index, e.target.value)
								}
							/>
							<input
								className="yg-color-input-value"
								type="text"
								value={color.value}
								disabled={color.id !== undefined}
								onChange={(e) =>
									handleColorChange(index, e.target.value)
								}
							/>
						</div>
						<div className="yg-color-actions">
							<Toggle
								checked={color.enable}
								onChange={() => handleEnableChange(index)}
							/>
							<button
								className="yg-color-remove mod-cta"
								onClick={() => handleRemove(index)}
								disabled={color.id !== undefined}
							>
								<Trash2 />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
