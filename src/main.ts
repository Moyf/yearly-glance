import { Notice, Plugin } from "obsidian";
import { HolidayUtil } from "lunar-typescript";
import { DEFAULT_CONFIG, YearlyGlanceConfig } from "./type/Config";
import YearlyGlanceSettingsTab from "./components/Settings/SettingsTab";
import {
	VIEW_TYPE_YEARLY_GLANCE,
	YearlyGlanceView,
} from "./views/YearlyGlanceView";
import {
	GlanceManagerTab,
	GlanceManagerView,
	VIEW_TYPE_GLANCE_MANAGER,
} from "./views/GlanceManagerView";
import { Birthday, CustomEvent, EventType, Holiday } from "@/src/type/Events";
import {
	EventFormModal,
	EventFormModalProps,
} from "./components/EventForm/EventFormModal";
import { YearlyGlanceBus } from "./hooks/useYearlyGlanceConfig";
import { t } from "./i18n/i18n";
import { MigrateData } from "./utils/migrateData";
import { EventCalculator } from "./utils/eventCalculator";
import { generateSystemHolidays, updateUserHolidays } from "./utils/holidayUtils";
import { IsoUtils } from "./utils/isoUtils";
import { generateEventId } from "./utils/uniqueEventId";

export default class YearlyGlancePlugin extends Plugin {
	settings: YearlyGlanceConfig;

	async onload() {
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

	onunload() {}

	async loadSettings() {
		// 加载数据
		const savedData = await this.loadData();
		// 验证并合并数据
		this.settings = this.validateAndMergeSettings(savedData);
		// 数据迁移
		this.settings = MigrateData.migrateV2(this);

		// 检查是否为第一次安装，如果是则添加示例事件
		await this.addSampleEventOnFirstInstall(savedData);

		// 应用保存的节假日补充数据（如果存在）
		if (this.settings.config.holidayFixData) {
			HolidayUtil.fix(this.settings.config.holidayFixData);
		}

		// 更新所有事件的dateArr字段
		await this.updateAllEventsDateObj();
		// updateAllEventsDateObj 内部会保存用户节假日
	}

	// 确保数据结构符合预期格式，移除未定义的配置
	private validateAndMergeSettings(savedData: unknown): YearlyGlanceConfig {
		// 创建默认配置的深拷贝
		const validatedSettings = JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as YearlyGlanceConfig;

		try {
			// 如果savedData存在且是对象
			if (savedData && typeof savedData === "object") {
				const data = savedData as Record<string, unknown>;

				// 验证并合并config部分
				if (data.config && typeof data.config === "object") {
					validatedSettings.config = {
						...validatedSettings.config,
						...(data.config as Record<string, unknown>),
					};
				}

				// 验证并合并data部分
				if (data.data && typeof data.data === "object") {
					const savedDataObj = data.data as Record<string, unknown>;
					validatedSettings.data = {
						...validatedSettings.data,
						holidays: (savedDataObj.holidays as Holiday[] | undefined) || [],
						birthdays: (savedDataObj.birthdays as Birthday[] | undefined) || [],
						customEvents: (savedDataObj.customEvents as CustomEvent[] | undefined) || [],
					};
				}
			}
		} catch (error) {
			console.error("数据验证失败，使用默认配置", error);
		}

		return validatedSettings;
	}

	async saveSettings() {
		// 只保存需要持久化的数据（用户节假日、生日、自定义事件）
		const dataToSave = {
			...this.settings,
			data: {
				holidays: this.settings.data.holidays,
				birthdays: this.settings.data.birthdays,
				customEvents: this.settings.data.customEvents,
			},
		};
		await this.saveData(dataToSave);
		// 通知所有订阅组件刷新数据
		YearlyGlanceBus.publish();
	}

	private registerLeafViews() {
		this.registerView(VIEW_TYPE_YEARLY_GLANCE, (leaf) => {
			return new YearlyGlanceView(leaf, this);
		});

		this.registerView(VIEW_TYPE_GLANCE_MANAGER, (leaf) => {
			return new GlanceManagerView(leaf, this);
		});
	}

	private registerCommands() {
		this.addCommand({
			id: "open-yearly-glance",
			name: t("command.openYearlyGlance"),
			callback: () => this.openPluginView(VIEW_TYPE_YEARLY_GLANCE),
		});

		this.addCommand({
			id: "open-glance-manager",
			name: t("command.openGlanceManager"),
			callback: () => this.openPluginView(VIEW_TYPE_GLANCE_MANAGER),
		});

		this.addCommand({
			id: "add-event",
			name: t("command.addEvent"),
			callback: () => {
				this.openEventForm("customEvent", {}, false, true);
			},
		});

		this.addCommand({
			id: "reload-plugin",
			name: t("command.reloadPlugin"),
			callback: () => this.reloadPlugin(),
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
		const oldShowHolidays = this.settings.config.showHolidays;

		this.settings.config = {
			...this.settings.config,
			...newConfig,
		};

		// 检查是否需要重新加载节假日
		const yearChanged = newConfig.year && newConfig.year !== oldYear;
		const showHolidaysChanged = newConfig.showHolidays !== undefined && newConfig.showHolidays !== oldShowHolidays;

		if (yearChanged || showHolidaysChanged) {
			await this.updateAllEventsDateObj();
		}

		await this.saveSettings();
	}

	// 导入节假日补充数据（用于修正法定节假日）
	public async importHolidayFixData(fixData: string) {
		if (!fixData) {
			return;
		}

		// 调用 lunar-typescript 库的 fix 方法修正节假日
		HolidayUtil.fix(fixData);
		// 保存到配置中（持久化）
		// lunar 组件没有开放对比方法，所以，无法和组件内部配置对比去重
		this.settings.config.holidayFixData = fixData;
		// 重新生成节假日（使用修正后的数据）
		await this.updateAllEventsDateObj();
		await this.saveSettings();
		new Notice(t("setting.general.holidayFixData.success"));
	}

	// 返回运行时数据（包含 systemHolidays），供 UI 组件使用
	public getData(): YearlyGlanceConfig["data"] {
		return {
			holidays: [...this.settings.data.holidays],
			systemHolidays: [...this.settings.data.systemHolidays],
			birthdays: [...this.settings.data.birthdays],
			customEvents: [...this.settings.data.customEvents],
		};
	}

	public async updateData(newData: Partial<YearlyGlanceConfig["data"]>) {
		this.settings.data = {
			...this.settings.data,
			...newData,
		};

		// 确保所有事件都有id
		await this.ensureEventsHaveIds();

		// 重新生成系统节假日
		await this.updateAllEventsDateObj();

		// 持久化数据到 data.json
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

	// 打开管理器视图并指定标签
	public async openGlanceManagerWithTab(tab: GlanceManagerTab) {
		// 检查是否已经有打开的管理器视图
		const existingLeaves = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_GLANCE_MANAGER
		);

		if (existingLeaves.length > 0) {
			// 如果存在，则激活第一个视图并更新标签
			const leaf = existingLeaves[0];
			this.app.workspace.revealLeaf(leaf);

			// 确保视图已经加载完成后再更新标签
			const view = leaf.view as GlanceManagerView;
			if (view && view.updateActiveTab) {
				// 使用 setTimeout 确保视图已完全渲染
				setTimeout(() => {
					view.updateActiveTab(tab);
				}, 50);
			}
		} else {
			// 如果不存在，则创建新的视图
			const leaf = this.app.workspace.getLeaf("tab");
			await leaf.setViewState({
				type: VIEW_TYPE_GLANCE_MANAGER,
				active: true,
			});

			// 获取视图实例并设置初始标签
			const view = leaf.view as GlanceManagerView;
			if (view && view.updateActiveTab) {
				// 使用 setTimeout 确保视图已完全渲染
				setTimeout(() => {
					view.updateActiveTab(tab);
				}, 100);
			}

			this.app.workspace.revealLeaf(leaf);
		}
	}

	// 添加打开事件表单的方法
	openEventForm(
		eventType: EventType = "customEvent",
		event: Partial<CustomEvent | Birthday | Holiday> = {},
		isEditing: boolean = false,
		allowTypeChange: boolean = false,
		props?: EventFormModalProps
	) {
		new EventFormModal(
			this,
			event,
			eventType,
			isEditing,
			allowTypeChange,
			props
		).open();
	}

	// 重载插件
	public async reloadPlugin() {
		try {
			// @ts-ignore
			await this.app.plugins.disablePluginAndSave("yearly-glance");
			// @ts-ignore
			await this.app.plugins.enablePluginAndSave("yearly-glance");
			new Notice("[yearly-glance] Reloaded 插件已重载");
		} catch (error) {
			console.error("[yearly-glance] Fail to reload 插件重载失败", error);
		}
	}

	private async ensureEventsHaveIds(): Promise<void> {
		const events = this.settings.data;

		events.birthdays.forEach((birthday) => {
			if (!birthday.id) {
				birthday.id = generateEventId("birthday");
			}
		});

		events.holidays.forEach((holiday) => {
			if (!holiday.id) {
				holiday.id = generateEventId("holiday");
			}
		});

		events.customEvents.forEach((customEvent) => {
			if (!customEvent.id) {
				customEvent.id = generateEventId("customEvent");
			}
		});
	}

	/**
	 * 更新所有事件的 dateArr 字段
	 * 触发时机：插件加载、切换年份、开关节假日显示、导入节假日数据、增删改事件
	 */
	public async updateAllEventsDateObj() {
		const year = this.settings.config.year;
		const { showHolidays } = this.settings.config;
		const events = this.settings.data;

		// 更新用户节假日 dateArr
		events.holidays = updateUserHolidays(events.holidays, year);

		// 更新自定义事件和生日的 dateArr
		events.customEvents = EventCalculator.updateCustomEventsInfo(events.customEvents, year);
		events.birthdays = EventCalculator.updateBirthdaysInfo(events.birthdays, year);

		// 生成系统节假日
		if (showHolidays) {
			events.systemHolidays = generateSystemHolidays(year);
		} else {
			events.systemHolidays = [];
		}

		YearlyGlanceBus.publish();
	}

	/**
	 * 检查是否为第一次安装，如果是则添加示例事件
	 */
	private async addSampleEventOnFirstInstall(
		savedData: unknown
	): Promise<void> {
		// 类型保护函数
		const hasCustomEvents = (data: unknown): boolean => {
			if (!data || typeof data !== "object") return false;
			const obj = data as Record<string, unknown>;
			if (!obj.data || typeof obj.data !== "object") return false;
			const dataObj = obj.data as Record<string, unknown>;
			if (!Array.isArray(dataObj.customEvents)) return false;
			return dataObj.customEvents.length > 0;
		};

		// 如果没有保存的数据，或者自定义事件为空，认为是第一次安装
		const isFirstInstall = !hasCustomEvents(savedData);

		if (isFirstInstall) {
			// 获取今天的日期 - 使用时区安全的方法
			const todayIsoDate = IsoUtils.getTodayLocalDateString(); // 格式: YYYY-MM-DD

			// 创建示例事件
			const sampleEvent: CustomEvent = {
				id: generateEventId("customEvent"),
				text: t("data.sampleEvent.text"),
				eventDate: {
					isoDate: todayIsoDate,
					calendar: "GREGORIAN",
					userInput: {
						input: todayIsoDate,
						calendar: "GREGORIAN",
					},
				},
				emoji: "🎉",
				color: "#73d13d",
				isRepeat: false,
				remark: t("data.sampleEvent.remark"),
			};

			// 添加到自定义事件列表
			this.settings.data.customEvents.push(sampleEvent);
		}
	}
}
