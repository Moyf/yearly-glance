import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "../main";
import { ViewSettings } from "../components/Settings/ViewSettings";
import { t } from "../i18n/i18n";

export const VIEW_TYPE_SETTINGS = "yearly-glance-settings-view";

export class SettingsView extends ItemView {
	plugin: YearlyGlancePlugin;
	root: Root | null = null;
	pluginSettingsContainer: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: YearlyGlancePlugin) {
		super(leaf);
		this.plugin = plugin;
		this.pluginSettingsContainer = this.contentEl.createDiv({
			cls: "yg-settings-view",
		});
	}

	getViewType(): string {
		return VIEW_TYPE_SETTINGS;
	}

	getIcon(): IconName {
		return "bolt";
	}

	getDisplayText(): string {
		return t("view.settingsTab.name");
	}

	async onOpen() {
		await super.onOpen();

		this.pluginSettingsContainer.empty();
		const settingsView = this.pluginSettingsContainer.createDiv({
			cls: "yg-settings-view-container",
		});

		if (!this.root) {
			this.root = createRoot(settingsView);
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
