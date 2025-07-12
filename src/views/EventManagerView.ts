import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { t } from "@/src/i18n/i18n";
import { EventManager } from "@/src/components/EventManager/EventManager";

// 定义视图类型
export const VIEW_TYPE_EVENT_MANAGER = "yearly-glance-event-view";

// 定义事件管理器视图类
export class EventManagerView extends ItemView {
	plugin: YearlyGlancePlugin;
	eventView: EventManager;
	eventManagerContainer: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: YearlyGlancePlugin) {
		super(leaf);
		this.plugin = plugin;
		this.eventManagerContainer = this.contentEl.createEl("div", {
			cls: "yearly-glance-event-container",
		});
	}

	getViewType(): string {
		return VIEW_TYPE_EVENT_MANAGER;
	}

	getIcon(): IconName {
		return "square-chart-gantt";
	}

	getDisplayText(): string {
		const name = t("view.eventManager.name");
		const config = this.plugin.getConfig();
		return config.showEmojiBeforeTabName ? `🗂️ ${name}` : name;
	}

	async onOpen() {
		await super.onOpen();

		// 初始化视图
		this.eventView = new EventManager(
			this.eventManagerContainer,
			this.plugin
		);
		this.eventView.initialize(this.plugin);
		this.eventView.render();
	}

	async onClose() {
		// 清理视图资源
		if (this.eventView) {
			this.eventView.destroy();
		}

		await super.onClose();
	}
}
