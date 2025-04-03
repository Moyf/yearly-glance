import * as React from "react";
import { App, PluginSettingTab } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { createRoot, Root } from "react-dom/client";
import { YearlyGlanceConfig } from "@/src/core/interfaces/types";
import { t } from "@/src/i18n/i18n";
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
					<div className="yg-settings-header">
						<h2>{t("setting.title")}</h2>
						<p>{t("setting.desc")}</p>
					</div>
					<ViewSettings plugin={this.plugin} />
				</div>
			</React.StrictMode>
		);
	}
}
