import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { EventPresetType } from "@/src/type/Settings";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import { generateUUID } from "@/src/utils/uuid";
import YearlyGlancePlugin from "@/src/main";
import { Input } from "@/src/components/Base/Input";
import { Toggle } from "@/src/components/Base/Toggle";
import { ConfirmDialog } from "@/src/components/Base/ConfirmDialog";
import { Tooltip } from "@/src/components/Base/Tooltip";
import "./style/PresetEventTypeSettings.css";

interface PresetEventTypeSettingsProps {
	presetTypes: EventPresetType[];
	onChange: (types: EventPresetType[]) => void;
	plugin: YearlyGlancePlugin;
}

export const PresetEventTypeSettings: React.FC<
	PresetEventTypeSettingsProps
> = ({ presetTypes, onChange, plugin }) => {
	const [types, setTypes] = React.useState<EventPresetType[]>(presetTypes);
	const [errors, setErrors] = React.useState<Record<string, string>>({});
	const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

	React.useEffect(() => {
		setTypes(presetTypes);
	}, [presetTypes]);

	const updateTypes = (newTypes: EventPresetType[]) => {
		setTypes(newTypes);
		onChange(newTypes);
	};

	// --- Drag handlers ---
	const handleDragStart = (_e: React.DragEvent, index: number) => {
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
			const newTypes = [...types];
			const draggedItem = newTypes[draggedIndex];
			newTypes.splice(draggedIndex, 1);
			newTypes.splice(dragOverIndex, 0, draggedItem);
			updateTypes(newTypes);
		}
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	// --- Field handlers ---
	const handleAdd = () => {
		const newType: EventPresetType = {
			id: generateUUID({ length: 8 }),
			name: "",
			emoji: "",
			color: undefined,
			enable: true,
		};
		updateTypes([...types, newType]);
	};

	const handleNameChange = (id: string, name: string) => {
		const newTypes = types.map((type) =>
			type.id === id ? { ...type, name } : type
		);
		setTypes(newTypes);

		const duplicate = newTypes.find(
			(t) => t.id !== id && t.name.trim() === name.trim() && name.trim() !== ""
		);
		setErrors((prev) => ({
			...prev,
			[id]: duplicate ? "duplicate" : "",
		}));

		if (!duplicate) {
			onChange(newTypes);
		}
	};

	const handleNameBlur = (id: string) => {
		const type = types.find((t) => t.id === id);
		if (!type) return;
		const duplicate = types.find(
			(t) =>
				t.id !== id &&
				t.name.trim() === type.name.trim() &&
				type.name.trim() !== ""
		);
		if (!duplicate) {
			onChange(types);
		}
	};

	const handleEmojiChange = (id: string, emoji: string) => {
		updateTypes(types.map((type) =>
			type.id === id ? { ...type, emoji } : type
		));
	};

	const handleColorChange = (id: string, color: string) => {
		updateTypes(types.map((type) =>
			type.id === id ? { ...type, color } : type
		));
	};

	const handlePresetColorSelect = (id: string, value: string) => {
		updateTypes(types.map((type) =>
			type.id === id ? { ...type, color: value || undefined } : type
		));
	};

	const handleEnableChange = (id: string) => {
		updateTypes(types.map((type) =>
			type.id === id
				? { ...type, enable: !(type.enable ?? true) }
				: type
		));
	};

	const countReferences = (typeId: string): number => {
		const data = plugin.getData();
		let count = 0;
		count += data.holidays.filter((e) => e.presetTypeId === typeId).length;
		count += data.birthdays.filter((e) => e.presetTypeId === typeId).length;
		count += data.customEvents.filter((e) => e.presetTypeId === typeId).length;
		return count;
	};

	const handleDelete = (id: string) => {
		const refCount = countReferences(id);
		const doDelete = () => {
			const newTypes = types.filter((type) => type.id !== id);
			setErrors((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
			updateTypes(newTypes);
		};

		if (refCount > 0) {
			new ConfirmDialog(plugin, {
				title: t("setting.general.eventPresetTypes.name" as TranslationKeys),
				message: t(
					"setting.general.eventPresetTypes.deleteConfirm" as TranslationKeys,
					{ count: refCount }
				),
				onConfirm: doDelete,
			}).open();
		} else {
			doDelete();
		}
	};

	// Build preset color options from plugin config
	const presetColorOptions = (plugin.getConfig().presetColors ?? [])
		.filter((c) => c.enable)
		.map((c) => ({
			label: c.id
				? t(`data.color.${c.id}` as TranslationKeys)
				: c.label,
			value: c.value,
		}));

	return (
		<div className="yg-preset-types">
			<div className="yg-preset-types-header">
				<Tooltip text={t("setting.general.eventPresetTypes.tooltip" as TranslationKeys)} />
				<button className="yg-type-add mod-cta" onClick={handleAdd}>
					<Plus />
				</button>
			</div>
			<div className="yg-preset-types-container">
				{types.map((type, index) => (
					<div
						key={type.id}
						className={`yg-preset-type-item ${
							draggedIndex === index ? "dragging" : ""
						} ${dragOverIndex === index ? "drag-over" : ""}`}
					>
						<div className="yg-preset-type-inputs">
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
							<Input
								className="yg-preset-type-name"
								value={type.name}
								onChange={(value) => handleNameChange(type.id, value)}
								onBlur={() => handleNameBlur(type.id)}
								placeholder={t(
									"setting.general.eventPresetTypes.namePlaceholder" as TranslationKeys
								)}
							/>
						<input
							className="yg-preset-type-emoji"
							type="text"
							value={type.emoji || ""}
							placeholder="😀"
							onChange={(e) => handleEmojiChange(type.id, e.target.value)}
						/>
							<input
								className="yg-preset-type-color-pick"
								type="color"
								value={type.color || "#cccccc"}
								onChange={(e) => handleColorChange(type.id, e.target.value)}
								title={t("common.color" as TranslationKeys)}
							/>
							{presetColorOptions.length > 0 && (
								<select
									className="yg-preset-type-preset-select"
									value={type.color || ""}
									onChange={(e) =>
										handlePresetColorSelect(type.id, e.target.value)
									}
									title={t("setting.general.presetColors.name" as TranslationKeys)}
								>
									<option value="">—</option>
									{presetColorOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							)}
						</div>
						<div className="yg-preset-type-actions">
							{errors[type.id] && (
								<span className="yg-preset-type-error">
									{t("setting.general.eventPresetTypes.namePlaceholder" as TranslationKeys)}
								</span>
							)}
							<Toggle
								checked={type.enable ?? true}
								onChange={() => handleEnableChange(type.id)}
							/>
							<button
								className="yg-preset-type-delete-btn mod-cta"
								onClick={() => handleDelete(type.id)}
								title={t("common.delete" as TranslationKeys)}
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
