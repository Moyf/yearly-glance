import * as React from "react";
import { App, PluginSettingTab } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { createRoot, Root } from "react-dom/client";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import { ViewSettings } from "./ViewSettings";
import "./style/SettingsTab.css";

export default class YearlyGlanceSettingsTab extends PluginSettingTab {
	plugin: YearlyGlancePlugin;
	root: Root | null = null;
	config: YearlyGlanceConfig;

	constructor(app: App, plugin: YearlyGlancePlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.config = plugin.settings;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		if (!this.root) {
			this.root = createRoot(containerEl);
		}

		this.renderContent();
	}

	hide() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
		this.containerEl.empty();
	}

	private renderContent() {
		this.root?.render(
			<React.StrictMode>
				<div className="yg-settings-container">
					<ViewSettings plugin={this.plugin} />
				</div>
			</React.StrictMode>
		);
	}
}
