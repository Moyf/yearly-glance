import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "../main";
import { ViewSettings } from "../components/Settings/ViewSettings";

export const VIEW_TYPE_SETTINGS = "yearly-glance-settings";

export class SettingsView extends ItemView {
	plugin: YearlyGlancePlugin;
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: YearlyGlancePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_SETTINGS;
	}

	getIcon(): IconName {
		return "bolt";
	}

	getDisplayText(): string {
		return "YG SettingTab";
	}

	async onOpen() {
		await super.onOpen();

		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass("yg-settings-view");

		if (!this.root) {
			this.root = createRoot(containerEl);
		}

		this.root.render(
			<React.StrictMode>
				<ViewSettings plugin={this.plugin} />
			</React.StrictMode>
		);
	}

	async onClose() {
		await super.onClose();
	}
}
