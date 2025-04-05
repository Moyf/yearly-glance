import { Plugin } from "obsidian";
import { DEFAULT_CONFIG, YearlyGlanceConfig } from "./core/interfaces/types";
import YearlyGlanceSettingsTab from "./components/settings/SettingsTab";
import {
	VIEW_TYPE_YEARLY_GLANCE,
	YearlyGlanceView,
} from "./views/YearlyGlanceView";
import {
	EventManagerView,
	VIEW_TYPE_EVENT_MANAGER,
} from "./views/EventManagerView";
import {
	Birthday,
	CustomEvent,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { EventFormModal } from "./components/YearlyCalendar/EventFormModal";
import { YearlyGlanceBus } from "./core/hook/useYearlyGlanceConfig";
import { updateEventsDateObj } from "./core/utils/dateConverter";
import { updateBirthdaysInfo } from "./core/utils/eventCalculator";
import { t } from "./i18n/i18n";

export default class YearlyGlancePlugin extends Plugin {
	settings: YearlyGlanceConfig;

	async onload() {
		console.debug("[yearly-glance] 加载年度概览插件");
		// 加载设置
		await this.loadSettings();

		// 注册视图
		this.registerLeafViews();

		// 注册命令
		this.registerCommands();
		this.registerRibbonCommands();

		// 添加设置选项卡
		this.addSettingTab(new YearlyGlanceSettingsTab(this.app, this));
	}

	onunload() {
		console.debug("[yearly-glance] 卸载年度概览插件");
	}

	async loadSettings() {
		// 加载数据
		const savedData = await this.loadData();

		// 验证并合并数据
		this.settings = this.validateAndMergeSettings(savedData);

		// 更新所有事件的dateObj字段
		await this.updateAllEventsDateObj();
	}

	// 确保数据结构符合预期格式，移除未定义的配置
	private validateAndMergeSettings(savedData: any): YearlyGlanceConfig {
		// 创建默认配置的深拷贝
		const validatedSettings = structuredClone(DEFAULT_CONFIG);
		// console.debug(validatedSettings);

		try {
			// 如果savedData存在且是对象
			if (savedData && typeof savedData === "object") {
				// 验证并合并config部分
				if (savedData.config && typeof savedData.config === "object") {
					validatedSettings.config = {
						...validatedSettings.config,
						...savedData.config,
					};
				}

				// 验证并合并data部分
				if (savedData.data && typeof savedData.data === "object") {
					validatedSettings.data = {
						...validatedSettings.data,
						...savedData.data,
					};
				}
			}
		} catch (error) {
			console.error("数据验证失败，使用默认配置", error);
		}

		return validatedSettings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
		YearlyGlanceBus.publish();
	}

	private registerLeafViews() {
		this.registerView(VIEW_TYPE_YEARLY_GLANCE, (leaf) => {
			return new YearlyGlanceView(leaf, this);
		});

		this.registerView(VIEW_TYPE_EVENT_MANAGER, (leaf) => {
			return new EventManagerView(leaf, this);
		});
	}

	private registerCommands() {
		this.addCommand({
			id: "open-yearly-glance",
			name: t("command.openYearlyGlance"),
			callback: () => this.openPluginView(VIEW_TYPE_YEARLY_GLANCE),
		});

		this.addCommand({
			id: "open-event-manager",
			name: t("command.openEventManager"),
			callback: () => this.openPluginView(VIEW_TYPE_EVENT_MANAGER),
		});

		this.addCommand({
			id: "add-event",
			name: t("command.addEvent"),
			callback: () => {
				this.openEventForm("holiday", {}, false, true);
			},
		});
	}

	private registerRibbonCommands() {
		this.addRibbonIcon("telescope", t("command.openYearlyGlance"), () =>
			this.openPluginView(VIEW_TYPE_YEARLY_GLANCE)
		);
	}

	public getSettings() {
		return this.settings;
	}

	public getConfig(): YearlyGlanceConfig["config"] {
		return this.settings.config;
	}

	public async updateConfig(
		newConfig: Partial<YearlyGlanceConfig["config"]>
	) {
		const oldYear = this.settings.config.year;

		this.settings.config = {
			...this.settings.config,
			...newConfig,
		};

		// 检查年份是否变化，如果变化则更新所有事件的dateObj
		if (newConfig.year && newConfig.year !== oldYear) {
			await this.updateAllEventsDateObj();
		}

		await this.saveSettings();
	}

	public getData(): YearlyGlanceConfig["data"] {
		return this.settings.data;
	}

	public async updateData(newData: Partial<YearlyGlanceConfig["data"]>) {
		this.settings.data = {
			...this.settings.data,
			...newData,
		};

		await this.saveSettings();
	}

	/**
	 * 更新所有事件的dateObj字段
	 */
	public async updateAllEventsDateObj() {
		const year = this.settings.config.year;
		const events = this.settings.data;

		// 更新节日和自定义事件的dateObj
		events.holidays = updateEventsDateObj(events.holidays, year);
		events.customEvents = updateEventsDateObj(events.customEvents, year);

		// 更新生日的完整信息（包含dateObj、nextBirthday、age、animal、zodiac等）
		events.birthdays = updateBirthdaysInfo(events.birthdays, year);

		// 不触发保存的通知，因为这是内部计算，不需要通知用户
		await this.saveData(this.settings);
	}

	public async openPluginView(viewType: string) {
		// 检查是否已经有打开的视图
		const existingLeaves = this.app.workspace.getLeavesOfType(viewType);

		if (existingLeaves.length > 0) {
			// 如果存在，则激活第一个视图
			this.app.workspace.revealLeaf(existingLeaves[0]);
		} else {
			// 如果不存在，则创建新的视图
			const leaf = this.app.workspace.getLeaf("tab");
			await leaf.setViewState({
				type: viewType,
				active: true,
			});

			this.app.workspace.revealLeaf(leaf);
		}
	}

	// 添加打开事件表单的方法
	openEventForm(
		eventType: EventType = "holiday",
		event: Partial<Holiday | Birthday | CustomEvent> = {},
		isEditing: boolean = false,
		allowTypeChange: boolean = false
	) {
		new EventFormModal(
			this,
			eventType,
			event,
			isEditing,
			allowTypeChange
		).open();
	}
}
