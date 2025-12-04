import { ItemView, WorkspaceLeaf } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { createRoot, Root } from "react-dom/client";
import { StrictMode } from "react";
import { ObsidianAppContext } from "@/src/context/obsidianAppContext";
import { t } from "@/src/i18n/i18n";

// 类型声明 - Bases API 可能需要在运行时可用
declare class BasesView {
	readonly type: string;
	controller: any;
	data: any;
	config: any;
	constructor(controller: any);
}

type QueryController = any;


export const VIEW_TYPE_YEARLY_GLANCE_BASES = "yearly-glance-bases-view";

export class YearlyGlanceBasesView extends ItemView {
	plugin: YearlyGlancePlugin;
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: YearlyGlancePlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_YEARLY_GLANCE_BASES;
	}

	getIcon(): string {
		return "calendar";
	}

	getDisplayText(): string {
		const name = t("view.yearlyGlanceBases.name");
		const config = this.plugin.getConfig();
		return config.showEmojiBeforeTabName ? `🗓️ ${name}` : name;
	}

	async onOpen(): Promise<void> {
		await super.onOpen();

		// Render React component
		this.root = createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<ObsidianAppContext.Provider value={this.app}>
					<div className="yg-bases-view">
						<h2>Yearly Glance Bases View</h2>
						<p>This view displays events from notes with event_date property.</p>
						<p>Configure the source folder in plugin settings.</p>
					</div>
				</ObsidianAppContext.Provider>
			</StrictMode>
		);
	}

	async onClose(): Promise<void> {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
		await super.onClose();
	}
}

export class BasesViewImpl extends BasesView {
	readonly type = VIEW_TYPE_YEARLY_GLANCE_BASES;
	private plugin: YearlyGlancePlugin;
	private year: number;

	constructor(
		controller: any,
		parentEl: HTMLElement,
		plugin: YearlyGlancePlugin
	) {
		super(controller);
		this.plugin = plugin;
		this.year = plugin.getConfig().year;
	}

	public onDataUpdated(): void {
		// 这里将实现从 Bases 数据渲染 Yearly Glance 日历
		console.log("Bases view data updated", this.data);
	}
}
