import * as React from "react";
import { App, PluginSettingTab } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { createRoot, Root } from "react-dom/client";
import { YearlyGlanceConfig } from "@/src/type/Config";
import { ViewSettings } from "./ViewSettings";
import parse from "html-react-parser";
import { t } from "@/src/i18n/i18n";
import "./style/SettingsTab.css";

export default class YearlyGlanceSettingsTab extends PluginSettingTab {
	plugin: YearlyGlancePlugin;
	root: Root | null = null;
	config: YearlyGlanceConfig;
	icon: string = "telescope";

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
						<div className="yg-settings-item-name">
							{t("setting.title")}
						</div>
						<div className="yg-settings-item-description">
							{parse(t("setting.desc"))}
						</div>
					</div>
					<ViewSettings plugin={this.plugin} />
				</div>
			</React.StrictMode>
		);
	}
}
