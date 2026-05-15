import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { EventPresetType } from "@/src/type/Settings";
import { ColorSelector } from "@/src/components/Base/ColorSelector";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import { generateUUID } from "@/src/utils/uuid";
import YearlyGlancePlugin from "@/src/main";
import { Input } from "@/src/components/Base/Input";
import { ConfirmDialog } from "@/src/components/Base/ConfirmDialog";
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

	React.useEffect(() => {
		setTypes(presetTypes);
	}, [presetTypes]);

	const updateTypes = (newTypes: EventPresetType[]) => {
		setTypes(newTypes);
		onChange(newTypes);
	};

	const validateName = (
		name: string,
		currentId: string
	): string | undefined => {
		if (!name.trim()) return undefined; // allow empty names during editing
		const duplicate = types.find(
			(t) => t.id !== currentId && t.name.trim() === name.trim()
		);
		if (duplicate) {
			return t(
				"setting.general.eventPresetTypes.namePlaceholder" as TranslationKeys
			);
		}
		return undefined;
	};

	const handleAdd = () => {
		const newType: EventPresetType = {
			id: generateUUID({ length: 8 }),
			name: "",
			emoji: "",
			color: undefined,
		};
		const newTypes = [...types, newType];
		updateTypes(newTypes);
	};

	const handleNameChange = (id: string, name: string) => {
		const newTypes = types.map((type) =>
			type.id === id ? { ...type, name } : type
		);
		setTypes(newTypes);

		// Validate duplicate names
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
		// Allow only up to 2 characters (emoji can be multi-byte)
		const trimmed = [...emoji].slice(0, 2).join("");
		const newTypes = types.map((type) =>
			type.id === id ? { ...type, emoji: trimmed } : type
		);
		updateTypes(newTypes);
	};

	const handleColorChange = (id: string, color: string | undefined) => {
		const newTypes = types.map((type) =>
			type.id === id ? { ...type, color } : type
		);
		updateTypes(newTypes);
	};

	const countReferences = (typeId: string): number => {
		const data = plugin.getData();
		let count = 0;
		count += data.holidays.filter((e) => e.presetTypeId === typeId).length;
		count += data.birthdays.filter((e) => e.presetTypeId === typeId).length;
		count += data.customEvents.filter(
			(e) => e.presetTypeId === typeId
		).length;
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
				title: t(
					"setting.general.eventPresetTypes.name" as TranslationKeys
				),
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

	return (
		<div className="yg-preset-type-list">
			{types.map((type) => (
				<div key={type.id} className="yg-preset-type-row">
					<Input
						className="yg-preset-type-emoji-input"
						value={type.emoji || ""}
						onChange={(value) => handleEmojiChange(type.id, value)}
						placeholder="😀"
						maxLength={4}
					/>
					<div className="yg-preset-type-name-input">
						<Input
							value={type.name}
							onChange={(value) => handleNameChange(type.id, value)}
							onBlur={() => handleNameBlur(type.id)}
							placeholder={t(
								"setting.general.eventPresetTypes.namePlaceholder" as TranslationKeys
							)}
						/>
						{errors[type.id] && (
							<div className="yg-preset-type-error">
								{t(
									"setting.general.eventPresetTypes.namePlaceholder" as TranslationKeys
								)}
							</div>
						)}
					</div>
					<ColorSelector
						value={type.color}
						onChange={(color) => handleColorChange(type.id, color)}
						submitDefaultAsValue={false}
					/>
					<button
						className="yg-preset-type-delete-btn"
						onClick={() => handleDelete(type.id)}
						title={t("common.delete" as TranslationKeys)}
					>
						<Trash2 size={16} />
					</button>
				</div>
			))}
			<button className="yg-preset-type-add-btn" onClick={handleAdd}>
				<Plus size={16} />
				<span>
					{t(
						"setting.general.eventPresetTypes.addNew" as TranslationKeys
					)}
				</span>
			</button>
		</div>
	);
};
