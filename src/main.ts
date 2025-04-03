import { Plugin } from "obsidian";
import { DEFAULT_CONFIG, YearlyGlanceConfig } from "./core/interfaces/types";
import YearlyGlanceSettingsTab from "./components/settings/SettingsTab";
import { YearlyGlanceView } from "./views/YearlyGlanceView";
import { VIEW_TYPE_YEARLY_GLANCE } from "./views/YearlyGlanceView";
import { EventManagerView } from "./views/EventManagerView";
import { VIEW_TYPE_EVENT_MANAGER } from "./views/EventManagerView";
import { t } from "./i18n/i18n";

export default class YearlyGlancePlugin extends Plugin {
	settings: YearlyGlanceConfig;

	async onload() {
		console.debug("加载年度概览插件");
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
		console.debug("卸载年度概览插件");
	}

	async loadSettings() {
		// 加载数据
		const savedData = await this.loadData();

		// 验证并合并数据
		this.settings = this.validateAndMergeSettings(savedData);
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
		this.settings.config = {
			...this.settings.config,
			...newConfig,
		};

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
}
