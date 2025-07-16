import { Notice, Plugin } from "obsidian";
import { DEFAULT_CONFIG, YearlyGlanceConfig } from "./core/interfaces/types";
import YearlyGlanceSettingsTab from "./components/Settings/SettingsTab";
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
import { EventFormModal } from "./components/EventForm/EventFormModal";
import { YearlyGlanceBus } from "./core/hook/useYearlyGlanceConfig";
import { t } from "./i18n/i18n";
import { generateUUID } from "./core/utils/uuid";
import { MigrateData } from "./core/utils/migrateData";
import { EventCalculator } from "./core/utils/eventCalculator";

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

		// 更新所有事件的dateArr字段
		await this.updateAllEventsDateObj();
		// 保存设置，并通知其他组件
		await this.saveSettings();
	}

	// 确保数据结构符合预期格式，移除未定义的配置
	private validateAndMergeSettings(savedData: unknown): YearlyGlanceConfig {
		// 创建默认配置的深拷贝
		const validatedSettings = structuredClone(DEFAULT_CONFIG);

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
					validatedSettings.data = {
						...validatedSettings.data,
						...(data.data as Record<string, unknown>),
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

		this.settings.config = {
			...this.settings.config,
			...newConfig,
		};

		// 检查年份是否变化，如果变化则更新所有事件的dateArr
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

		// 确保所有事件都有id
		await this.ensureEventsHaveIds();

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

	// 添加打开事件表单的方法
	openEventForm(
		eventType: EventType = "customEvent",
		event: Partial<CustomEvent | Birthday | Holiday> = {},
		isEditing: boolean = false,
		allowTypeChange: boolean = false,
		props?: {
			date?: string;
		}
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

	private generateEventId(eventType?: EventType): string {
		const prefixMap: Record<EventType, string> = {
			birthday: "birth",
			holiday: "holi",
			customEvent: "event",
		};

		const prefix = eventType ? prefixMap[eventType] : "event";

		return generateUUID({
			prefix: prefix,
		});
	}

	private async ensureEventsHaveIds(): Promise<void> {
		const events = this.settings.data;

		events.birthdays.forEach((birthday) => {
			if (!birthday.id) {
				birthday.id = this.generateEventId("birthday");
			}
		});

		events.holidays.forEach((holiday) => {
			if (!holiday.id) {
				holiday.id = this.generateEventId("holiday");
			}
		});

		events.customEvents.forEach((customEvent) => {
			if (!customEvent.id) {
				customEvent.id = this.generateEventId("customEvent");
			}
		});

		await this.saveData(this.settings);
	}

	/**
	 * 更新所有事件的dateArr字段
	 */
	public async updateAllEventsDateObj() {
		const year = this.settings.config.year;
		const events = this.settings.data;

		// 更新节日和自定义事件的dateArr
		events.holidays = EventCalculator.updateHolidaysInfo(
			events.holidays,
			year
		);
		events.customEvents = EventCalculator.updateCustomEventsInfo(
			events.customEvents,
			year
		);

		// 更新生日的完整信息（包含dateArr、nextBirthday、age、animal、zodiac等）
		events.birthdays = EventCalculator.updateBirthdaysInfo(
			events.birthdays,
			year
		);

		// 不触发保存的通知，因为这是内部计算，不需要通知用户
		await this.saveData(this.settings);
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
			// 获取今天的日期
			const today = new Date();
			const todayIsoDate = today.toISOString().split("T")[0]; // 格式: YYYY-MM-DD

			// 创建示例事件
			const sampleEvent: CustomEvent = {
				id: this.generateEventId("customEvent"),
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
