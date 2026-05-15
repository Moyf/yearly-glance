import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { t } from "@/src/i18n/i18n";
import { YearlyCalendar } from "@/src/components/YearlyCalendar/YearlyCalendar";
import { YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";

// 定义视图类型
export const VIEW_TYPE_YEARLY_GLANCE = "yearly-glance-view";

// 定义年历视图类
export class YearlyGlanceView extends ItemView {
	plugin: YearlyGlancePlugin;
	calendarView: YearlyCalendar;
	calendarContainer: HTMLElement;
	private unsubscribeBus?: () => void;

	constructor(leaf: WorkspaceLeaf, plugin: YearlyGlancePlugin) {
		super(leaf);
		this.plugin = plugin;
		this.calendarContainer = this.contentEl.createEl("div", {
			cls: "yg-view",
		});
	}

	getViewType(): string {
		return VIEW_TYPE_YEARLY_GLANCE;
	}

	getIcon(): IconName {
		const config = this.plugin.getConfig();
		return config.showEmojiBeforeTabName === "lucide" ? "telescope" : ("" as IconName);
	}

	getDisplayText(): string {
		const name = t("view.yearlyGlance.name");
		const config = this.plugin.getConfig();
		switch (config.showEmojiBeforeTabName) {
			case "lucide":
				return name;
			case "emoji":
				return `🔭 ${name}`;
			case "none":
			default:
				return name;
		}
	}

	async onOpen() {
		await super.onOpen();

		// 初始化视图
		this.calendarView = new YearlyCalendar(
			this.calendarContainer,
			this.plugin
		);
		this.calendarView.initialize(this.plugin);
		this.calendarView.render();

		// Subscribe to config changes to refresh tab icon and title
		this.unsubscribeBus = YearlyGlanceBus.subscribeTopics(['config', 'all'], () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(this.leaf as any).updateHeader();
		});
	}

	async onClose() {
		// 清理视图资源
		if (this.calendarView) {
			this.calendarView.destroy();
		}

		this.unsubscribeBus?.();
		await super.onClose();
	}
}
