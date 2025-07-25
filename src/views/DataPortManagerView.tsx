import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "../main";
import { t } from "../i18n/i18n";
import { DataPortManager } from "../components/DataPort/DataPortManager";
import { useYearlyGlanceConfig } from "../core/hook/useYearlyGlanceConfig";

export const VIEW_TYPE_DATA_PORT_MANAGER = "yearly-glance-data-port-view";

// 创建一个包装组件来使用 Hook
const DataPortManagerWrapper: React.FC<{
	plugin: YearlyGlancePlugin;
}> = ({ plugin }) => {
	const { config, updateConfig, events, updateEvents } =
		useYearlyGlanceConfig(plugin);

	return (
		<DataPortManager
			config={config}
			data={events}
			onConfigUpdate={updateConfig}
			onDataImport={updateEvents}
		/>
	);
};

export class DataPortManagerView extends ItemView {
	plugin: YearlyGlancePlugin;
	root: Root | null = null;
	dataPortContainer: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: YearlyGlancePlugin) {
		super(leaf);
		this.plugin = plugin;
		this.dataPortContainer = this.contentEl.createDiv({
			cls: "yg-data-port-view",
		});
	}

	getViewType(): string {
		return VIEW_TYPE_DATA_PORT_MANAGER;
	}

	getIcon(): IconName {
		return "database";
	}

	getDisplayText(): string {
		return t("view.dataPortView.name");
	}

	async onOpen() {
		await super.onOpen();

		this.dataPortContainer.empty();
		const dataPortView = this.dataPortContainer.createDiv({
			cls: "yg-data-port-view-container",
		});

		if (!this.root) {
			this.root = createRoot(dataPortView);
		}

		this.root.render(
			<React.StrictMode>
				<DataPortManagerWrapper plugin={this.plugin} />
			</React.StrictMode>
		);
	}

	async onClose() {
		await super.onClose();
	}
}
