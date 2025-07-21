import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { t } from "@/src/i18n/i18n";
import { YearlyCalendar } from "@/src/components/YearlyCalendar/YearlyCalendar";

// 定义视图类型
export const VIEW_TYPE_YEARLY_GLANCE = "yearly-glance-view";

// 定义年历视图类
export class YearlyGlanceView extends ItemView {
	plugin: YearlyGlancePlugin;
	calendarView: YearlyCalendar;
	calendarContainer: HTMLElement;

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
		return "telescope";
	}

	getDisplayText(): string {
		return t("view.yearlyGlance.name");
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
	}

	async onClose() {
		// 清理视图资源
		if (this.calendarView) {
			this.calendarView.destroy();
		}

		await super.onClose();
	}
}
