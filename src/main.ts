import { normalizePath, Notice, Plugin, TFile, TFolder } from "obsidian";
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
	VIEW_TYPE_YEARLY_GLANCE_BASES,
	YearlyGlanceBasesView,
} from "./views/YearlyGlanceBasesView";
import { Birthday, CustomEvent, EventSource, EventType, Holiday } from "@/src/type/Events";
import {
	EventFormModal,
	EventFormModalProps,
} from "./components/EventForm/EventFormModal";
import { YearlyGlanceBus } from "./hooks/useYearlyGlanceConfig";
import { t } from "./i18n/i18n";
import { buildPropConfig, syncEventToFrontmatter } from "./service/BasesEventFrontmatterService";
import { DailyNoteService } from "./service/DailyNoteService";
import { MigrateData } from "./utils/migrateData";
import { EventCalculator } from "./utils/eventCalculator";
import { IsoUtils } from "./utils/isoUtils";
import { generateEventId } from "./utils/uniqueEventId";
import { CalendarEvent } from "./type/CalendarEvent";

export default class YearlyGlancePlugin extends Plugin {
	settings: YearlyGlanceConfig;

	async onload() {
		// 加载设置
		await this.loadSettings();

		// 注册视图
		this.registerLeafViews();
		this.registerBasesViews();

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
			console.error("[YearlyGlance] Failed to validate settings, using default settings", error);
		}

		return validatedSettings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// 发布事件，通知所有订阅者配置已更新
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

	private registerBasesViews() {

		this.registerBasesView(VIEW_TYPE_YEARLY_GLANCE_BASES, {
			name: 'Yearly Glance',
			icon: 'telescope',
			factory: (controller, containerEl) => {
				return new YearlyGlanceBasesView(controller, containerEl, this);
			},
			options: () => {
				return [
					{
						type: 'toggle',
						displayName: t("view.basesView.options.inheritPluginData"),
						key: 'inheritPluginData',
						default: false
					},
					{
						type: 'group',
						displayName: t("view.basesView.options.properties"),
						items: [
							{
								type: 'property',
								displayName: t("view.basesView.options.propTitle"),
								key: 'propTitle',
								filter: prop => !prop.startsWith('file.'),
								placeholder: 'Property',
							},
							{
								type: 'property',
								displayName: t("view.basesView.options.propDate"),
								key: 'propDate',
								filter: prop => !prop.startsWith('file.'),
								placeholder: 'Property',
							},
							{
								type: 'property',
								displayName: t("view.basesView.options.propDuration"),
								key: 'propDuration',
								filter: prop => !prop.startsWith('file.'),
								placeholder: 'Property',
							},
						]
					},
					{
						type: 'group',
						displayName: t("view.basesView.options.extendedProperties"),
						items: [
							{
								type: 'property',
								displayName: t("view.basesView.options.propIcon"),
								key: 'propIcon',
								filter: prop => !prop.startsWith('file.'),
								placeholder: 'Property',
							},
							{
								type: 'property',
								displayName: t("view.basesView.options.propColor"),
								key: 'propColor',
								filter: prop => !prop.startsWith('file.'),
								placeholder: 'Property',
							},
							{
								type: 'property',
								displayName: t("view.basesView.options.propDescription"),
								key: 'propDescription',
								filter: prop => !prop.startsWith('file.'),
								placeholder: 'Property',
							},
						]
					},
					{
						type: 'group',
						displayName: t("view.basesView.options.display"),
						items: [
							{
								type: 'toggle',
								displayName: t("view.basesView.options.limitHeight"),
								key: 'limitHeight',
								default: false,
							},
							{
								type: 'slider',
								displayName: t("view.basesView.options.embeddedHeight"),
								key: 'embeddedHeight',
								min: 400,
								max: 1200,
								step: 50,
								default: 600,
							},
						]
					}
				];
			}
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

	// 同步 Bases 事件到 frontmatter
	async syncBasesEventToFrontmatter(event: CalendarEvent): Promise<void> {
		if (!event.id.startsWith('bases-')) {
			console.log('Event is not from Bases, skipping frontmatter sync');
			return;
		}

		const idWithoutPrefix = event.id.replace('bases-', '');
		const mdIndex = idWithoutPrefix.indexOf('.md');
		const filePath = mdIndex > 0 ? idWithoutPrefix.substring(0, mdIndex + 3) : idWithoutPrefix;

		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!file || !(file instanceof TFile)) {
			console.warn('[YearlyGlance] syncBasesEventToFrontmatter: file not found:', filePath);
			return;
		}

		const eventToSync = { ...event };
		if (
			eventToSync.remark &&
			typeof eventToSync.remark === 'string' &&
			eventToSync.remark.startsWith('From Bases:')
		) {
			eventToSync.remark = '';
		}

		const propConfig = buildPropConfig(this.settings.config);

		try {
			await syncEventToFrontmatter(this.app, file, eventToSync, propConfig);
			console.log('[YearlyGlance] Frontmatter sync completed for:', filePath);
			YearlyGlanceBus.publish();
		} catch (error) {
			console.error('[YearlyGlance] Failed to sync frontmatter:', error);
		}
	}

	async createDailyNoteEvent(event: CalendarEvent): Promise<void> {
		const settings = DailyNoteService.getDailyNoteSettings(
			this.app,
			this.settings.config.dailyNoteSource
		);
		if (!settings) {
			new Notice("Daily note plugin is not available");
			return;
		}

		const isoDate = event.eventDate.isoDate;
		if (!isoDate) return;

		const momentFn = (window as typeof window & {
			moment?: (input: string, format: string) => { format(pattern: string): string };
		}).moment;
		if (!momentFn) return;

		const formattedName = momentFn(isoDate, "YYYY-MM-DD").format(settings.format);
		const folder = settings.folder.replace(/\/+$/, "");
		const filePath = normalizePath(
			folder ? `${folder}/${formattedName}.md` : `${formattedName}.md`
		);

		let file = this.app.vault.getAbstractFileByPath(filePath);
		if (!file) {
			if (folder) {
				const folderExists = this.app.vault.getAbstractFileByPath(folder);
				if (!folderExists) {
					await this.app.vault.createFolder(folder);
				}
			}

			await this.app.vault.create(filePath, "");
			file = this.app.vault.getAbstractFileByPath(filePath);
		}

		if (!file) {
			new Notice("Failed to create daily note");
			return;
		}

		const eventProp = this.settings.config.dailyNoteEventProp;
		await DailyNoteService.addEventToDaily(this.app, filePath, eventProp, event.text);

		YearlyGlanceBus.publish();
		new Notice(`Event added to ${formattedName}`);
	}

	async syncDailyNoteEvent(event: CalendarEvent, oldTitle?: string): Promise<void> {
		const filePath = DailyNoteService.getFilePathFromEvent(event);
		if (!filePath) return;

		const eventProp = this.settings.config.dailyNoteEventProp;

		if (oldTitle && oldTitle !== event.text) {
			await DailyNoteService.updateEventTitle(
				this.app,
				filePath,
				eventProp,
				oldTitle,
				event.text
			);
		}

		YearlyGlanceBus.publish();
	}

	/**
	 * 为 Bases 事件创建新笔记文件
	 * @param event 事件对象
	 * @returns 创建的文件路径
	 */
	async createBasesEventNote(event: CustomEvent): Promise<string> {
		const config = this.settings.config;
		const defaultPath = config.defaultBasesEventPath?.trim();
		const propConfig = buildPropConfig(config);

		// 2. 确定文件夹路径
		let folderPath = "";
		let pathWarning = false;

		if (defaultPath) {
			const folder = this.app.vault.getAbstractFileByPath(defaultPath);
			if (folder instanceof TFolder) {
				folderPath = defaultPath;
			} else {
				pathWarning = true;
			}
		}

		// 3. 生成文件名（使用事件标题）
		const fileName = `${event.text}.md`;
		const filePath = folderPath ? normalizePath(`${folderPath}/${fileName}`) : fileName;

		// 4. 创建文件
		await this.app.vault.create(filePath, "");

		// 5. 写入 frontmatter（使用自定义属性名）
		const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
		await this.app.fileManager.processFrontMatter(file, (fm) => {
			fm[propConfig.titleProp] = event.text;
			fm[propConfig.dateProp] = event.eventDate.isoDate;
			if (event.duration && event.duration > 1) {
				fm[propConfig.durationProp] = event.duration;
			}
			if (event.emoji) {
				fm[propConfig.iconProp] = event.emoji;
			}
			if (event.color) {
				fm[propConfig.colorProp] = event.color;
			}
			if (event.remark) {
				fm[propConfig.descriptionProp] = event.remark;
			}
		});

		// 6. 如果路径有问题，显示 Notice
		if (pathWarning) {
			new Notice(t("notice.setDefaultBasesEventPath"));
		}

		return filePath;
	}

	// 重载插件
	public async reloadPlugin() {
		try {
			// @ts-ignore
			await this.app.plugins.disablePluginAndSave("yearly-glance");
			// @ts-ignore
			await this.app.plugins.enablePluginAndSave("yearly-glance");
			new Notice("[Yearly Glance] Reloaded successfully");
		} catch (error) {
			console.error("[Yearly Glance] Fail to reload", error);
		}
	}

	private async ensureEventsHaveIds(): Promise<void> {
		const events = this.settings.data;

		events.birthdays.forEach((birthday) => {
			if (!birthday.id) {
				birthday.id = generateEventId("birthday");
			}
			// 确保 config 事件有 eventSource
			if (!birthday.eventSource) {
				birthday.eventSource = EventSource.CONFIG;
			}
		});

		events.holidays.forEach((holiday) => {
			if (!holiday.id) {
				holiday.id = generateEventId("holiday");
			}
			// 确保 config 事件有 eventSource
			if (!holiday.eventSource) {
				holiday.eventSource = EventSource.CONFIG;
			}
		});

		events.customEvents.forEach((customEvent) => {
			if (!customEvent.id) {
				customEvent.id = generateEventId("customEvent");
			}
			// 确保 config 事件有 eventSource
			if (!customEvent.eventSource) {
				customEvent.eventSource = EventSource.CONFIG;
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
				eventSource: EventSource.CONFIG,
			};

			// 添加到自定义事件列表
			this.settings.data.customEvents.push(sampleEvent);
		}
	}
}
