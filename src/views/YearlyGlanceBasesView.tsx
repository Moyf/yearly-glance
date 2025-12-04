import { BasesView, ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import { ObsidianAppContext } from "@/src/context/obsidianAppContext";
import { t } from "@/src/i18n/i18n";
import YearlyGlancePlugin from "@/src/main";

// 增强 obsidian 模块
declare module "obsidian" {
	export interface ViewOption {
		type: string;
		name: string;
	}

	export class BasesView {
		readonly controller: any;
		data: any;
		constructor(controller: any);
		onDataUpdated(): void;
	}

	interface Plugin {
		registerBasesView?(
			viewType: string,
			config: {
				name: string;
				icon: string;
				factory: (controller: any, containerEl: HTMLElement) => BasesView;
				options?: () => ViewOption[];
			}
		): void;
	}
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
	static viewOptions = [
		{ type: "calendar", name: "Calendar View" },
		{ type: "list", name: "List View" }
	];
	static getViewOptions() {
		return BasesViewImpl.viewOptions;
	}
	readonly type = VIEW_TYPE_YEARLY_GLANCE_BASES;
	private plugin: YearlyGlancePlugin;
	private containerEl: HTMLElement;
	private root?: Root;

	constructor(
		controller: QueryController,
		containerEl: HTMLElement,
		plugin: YearlyGlancePlugin
	) {
		super(controller);
		this.containerEl = containerEl;
		this.plugin = plugin;

		// 初始化渲染
		this.init();
	}

	private init(): void {
		// 创建容器
		const viewEl = this.containerEl.createDiv({
			cls: "yearly-glance-bases-view"
		});

		// 使用 React 渲染
		this.root = createRoot(viewEl);
		this.render();
	}

	private render(): void {
		if (!this.root) return;

		this.root.render(
			<StrictMode>
				<ObsidianAppContext.Provider value={this.plugin.app}>
					<div className="yg-bases-view">
						<h2>Yearly Glance Bases View</h2>
						<p>This view displays events from notes with event_date property.</p>
						<p>Total items: {this.data?.length || 0}</p>
					</div>
				</ObsidianAppContext.Provider>
			</StrictMode>
		);
	}

	public onDataUpdated(): void {
		// 数据已经由 Bases 框架自动更新到 this.data
		this.render();
		console.log("Bases view data updated", this.data);
	}

	public destroy(): void {
		// 清理 React root
		if (this.root) {
			this.root.unmount();
			this.root = undefined;
		}
	}
}
