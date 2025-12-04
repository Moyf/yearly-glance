import { debounce, Notice, Plugin, TAbstractFile, TFile } from "obsidian";
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
import {
	Birthday,
	CustomEvent,
	EventType,
	Holiday,
	FrontmatterEvent,
} from "@/src/type/Events";
import {
	EventFormModal,
	EventFormModalProps,
} from "./components/EventForm/EventFormModal";
import { YearlyGlanceBus } from "./hooks/useYearlyGlanceConfig";
import { t } from "./i18n/i18n";
import { MigrateData } from "./utils/migrateData";
import { EventCalculator } from "./utils/eventCalculator";
import { IsoUtils } from "./utils/isoUtils";
import { generateEventId } from "./utils/uniqueEventId";
import { FrontmatterService } from "./service/FrontmatterService";
import { BasesViewImpl } from "./views/YearlyGlanceBasesView";

export default class YearlyGlancePlugin extends Plugin {
	settings: YearlyGlanceConfig;
	frontmatterService!: FrontmatterService;
	private refreshFrontmatterEventsDebounced: () => void;

	async onload() {
		// 初始化 frontmatter 服务（必须在 loadSettings 之前）
		this.frontmatterService = new FrontmatterService(this.app);

		// 加载设置
		await this.loadSettings();

		// 注册视图
		this.registerLeafViews();

		// 注册 Bases 视图
		// 使用类型断言访问 Bases API
		const basesPlugin = this as any;
		if (typeof basesPlugin.registerBasesView === 'function') {
			basesPlugin.registerBasesView('yearly-glance', {
				name: 'Yearly Glance',
				icon: 'calendar',
				factory: (controller: any, containerEl: HTMLElement) => {
					return new BasesViewImpl(controller, containerEl, this);
				},
				options: BasesViewImpl.getViewOptions
			});
		}

		// 扫描 frontmatter 事件（在 frontmatterService 初始化后）
		await this.refreshFrontmatterEvents();

		// 注册命令
		this.registerCommands();
		this.registerRibbonCommands();

		// 添加设置选项卡
		this.addSettingTab(new YearlyGlanceSettingsTab(this.app, this));

		// 注册文件监听器（防抖 5 秒）
		this.registerFileListeners();

		// 创建防抖的刷新函数
		this.refreshFrontmatterEventsDebounced = debounce(
			() => this.refreshFrontmatterEvents(),
			5000,
			true
		);
	}

	onunload() {
		// 清理防抖函数
		if (this.refreshFrontmatterEventsDebounced) {
			(this.refreshFrontmatterEventsDebounced as any).cancel?.();
		}
	}

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

		// 更新 frontmatter 事件
		events.basesEvents = EventCalculator.updateFrontmatterEventsInfo(
			events.basesEvents,
			year
		);

		// 不触发保存的通知，因为这是内部计算，不需要通知用户
		await this.saveData(this.settings);
	}

	/**
	 * 注册文件监听器
	 */
	private registerFileListeners() {
		// 监听文件修改
		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (this.isEventFile(file)) {
					this.refreshFrontmatterEventsDebounced();
				}
			})
		);

		// 监听文件创建
		this.registerEvent(
			this.app.vault.on("create", (file) => {
				if (this.isEventFile(file)) {
					this.refreshFrontmatterEventsDebounced();
				}
			})
		);

		// 监听文件删除
		this.registerEvent(
			this.app.vault.on("delete", (file) => {
				if (this.isEventFile(file)) {
					this.refreshFrontmatterEventsDebounced();
				}
			})
		);
	}

	/**
	 * 检查文件是否为事件文件
	 */
	private isEventFile(file: TAbstractFile): file is TFile {
		if (!(file instanceof TFile)) return false;
		if (file.extension !== "md") return false;

		const config = this.settings.config.frontmatter;
		if (!config.enabled || !config.folderPath) return false;

		// 检查文件是否在配置的文件夹中
		if (config.recursive) {
			return file.path.startsWith(config.folderPath);
		} else {
			const fileFolder = file.path.substring(0, file.path.lastIndexOf("/"));
			return fileFolder === config.folderPath;
		}
	}

	/**
	 * 刷新 frontmatter 事件
	 */
	async refreshFrontmatterEvents(): Promise<void> {
		const config = this.settings.config.frontmatter;

		if (!config.enabled || !config.folderPath) {
			this.settings.data.basesEvents = [];
			return;
		}

		// 更新调试模式
		this.frontmatterService.setDebug(this.settings.config.showDebugInfo);

		try {
			const events = await this.frontmatterService.scanEvents(config);
			if (this.settings.config.showDebugInfo) {
				console.log(`[main.ts] Frontmatter scan completed, found ${events.length} events`);
			}
			this.settings.data.basesEvents = events;

			// 更新事件的日期数组
			const year = this.settings.config.year;
			this.settings.data.basesEvents = EventCalculator.updateFrontmatterEventsInfo(
				events,
				year
			);

			// 通知视图更新
			YearlyGlanceBus.publish();
		} catch (error) {
			console.error("Failed to refresh frontmatter events:", error);
		}
	}

	/**
	 * 更新 frontmatter 事件
	 */
	async updateFrontmatterEvent(
		eventId: string,
		updates: Partial<FrontmatterEvent>
	): Promise<boolean> {
		const event = this.settings.data.basesEvents.find((e) => e.id === eventId);
		if (!event) return false;

		try {
			// 使用 Obsidian API 更新 frontmatter
			const file = this.app.vault.getAbstractFileByPath(event.sourcePath);
			if (file instanceof TFile) {
				await this.app.fileManager.processFrontMatter(
					file,
					(frontmatter) => {
						if (updates.text !== undefined) {
							frontmatter[event.propertyNames.title] = updates.text;
						}
						if (updates.eventDate !== undefined) {
							frontmatter[event.propertyNames.eventDate] =
								updates.eventDate.isoDate;
							if (event.propertyNames.calendar) {
								frontmatter[event.propertyNames.calendar] =
									updates.eventDate.calendar;
							}
						}
						if (updates.remark !== undefined && event.propertyNames.description) {
							frontmatter[event.propertyNames.description] = updates.remark;
						}
						if (updates.emoji !== undefined && event.propertyNames.icon) {
							frontmatter[event.propertyNames.icon] = updates.emoji;
						}
						if (updates.color !== undefined && event.propertyNames.color) {
							frontmatter[event.propertyNames.color] = updates.color;
						}
						if (updates.isHidden !== undefined && event.propertyNames.hidden) {
							frontmatter[event.propertyNames.hidden] = updates.isHidden;
						}
					}
				);

				// 更新本地缓存
				Object.assign(event, updates);

				// 重新计算日期
				const year = this.settings.config.year;
				this.settings.data.basesEvents = EventCalculator.updateFrontmatterEventsInfo(
					this.settings.data.basesEvents,
					year
				);

				await this.saveSettings();
				return true;
			}
		} catch (error) {
			console.error("Failed to update frontmatter event:", error);
			new Notice("Failed to update frontmatter event");
		}

		return false;
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
