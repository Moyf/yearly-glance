import * as React from "react";
import { App, Notice, TFolder } from "obsidian";
import { AutoComplete, AutoCompleteItem } from "./Autocomplete";
import { t } from "@/src/i18n/i18n";

interface FolderAutoCompleteProps {
	label?: React.ReactNode;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	app: App; // 必须通过 props 传入 app
}

export const FolderAutoComplete: React.FC<FolderAutoCompleteProps> = ({
	label,
	value,
	onChange,
	placeholder,
	disabled = false,
	className = "",
	app,
}) => {

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
		if (!value) return ""; // 空值时不显示任何内容，让 input 展示 placeholder

		// 如果值存在，尝试从文件夹列表中找到对应的名称
		const items = getItems();
		const matchedItem = items.find((item) => item.value === value);
		return matchedItem?.label || value;
	}, [value, getItems]);

	/** 自由输入提交前校验：空值和根目录直接放行，否则检查文件夹是否存在 */
	const handleCommit = React.useCallback((inputValue: string): boolean => {
		const normalized = inputValue.replace(/^\/+|\/+$/g, "").trim();
		// 空字符串（不扫描）或 "/" （全库扫描）均为合法值，直接放行
		if (!normalized) return true;

		const folder = app.vault.getAbstractFileByPath(normalized);
		if (folder instanceof TFolder) return true;

		new Notice(t("notice.invalidFolderPath", { path: inputValue.trim() }));
		return false;
	}, [app]);

	return (
		<AutoComplete
			label={label}
			value={value}
			valueLabel={getValueLabel()}
			onChange={onChange}
			onCommit={handleCommit}
			placeholder={placeholder}
			items={getItems}
			disabled={disabled}
			className={className}
		/>
	);
};
