import * as React from "react";
import { TFolder } from "obsidian";
import { useObsidianApp } from "@/src/context/obsidianAppContext";
import { AutoComplete, AutoCompleteItem } from "./Autocomplete";

interface FolderAutoCompleteProps {
	label?: React.ReactNode;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

export const FolderAutoComplete: React.FC<FolderAutoCompleteProps> = ({
	label,
	value,
	onChange,
	placeholder,
	disabled = false,
	className = "",
}) => {
	const app = useObsidianApp();

	const getItems = React.useCallback((): AutoCompleteItem[] => {
		const folders = app.vault
			.getAllLoadedFiles()
			.filter((f) => f instanceof TFolder)
			.map((f) => ({
				id: f.path,
				value: f.path,
				label: f.path || "/",
			}));
		return [...folders];
	}, [app]);

	const getValueLabel = React.useCallback(() => {
		if (!value) return "/";

		// 如果值存在，尝试从文件夹列表中找到对应的名称
		const items = getItems();
		const matchedItem = items.find((item) => item.value === value);
		return matchedItem?.label || value;
	}, [value, getItems]);

	return (
		<AutoComplete
			label={label}
			value={value}
			valueLabel={getValueLabel()}
			onChange={onChange}
			placeholder={placeholder}
			items={getItems}
			disabled={disabled}
			className={className}
		/>
	);
};
