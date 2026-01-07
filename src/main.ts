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
import { Birthday, CustomEvent, EVENT_TYPE_DEFAULT, EventSource, EventType, Holiday } from "@/src/type/Events";
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
						displayName: '拓展属性',
						items: [
							{
								type: 'property',
								displayName: '图标属性',
								key: 'propIcon',
								filter: prop => !prop.startsWith('file.'),
								placeholder: 'Property',
							},
							{
								type: 'property',
								displayName: '颜色属性',
								key: 'propColor',
								filter: prop => !prop.startsWith('file.'),
								placeholder: 'Property',
							},
							{
								type: 'property',
								displayName: '描述属性',
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
		// 检查是否是 Bases 事件
		if (!event.id.startsWith('bases-')) {
			console.log('Event is not from Bases, skipping frontmatter sync');
			return;
		}

		// 获取自定义属性名
		const config = this.settings.config;
		const titleProp = config.basesEventTitleProp || "title";
		const dateProp = config.basesEventDateProp || "event_date";
		const durationProp = config.basesEventDurationProp || "duration_days";
		const iconProp = config.basesEventIconProp || "icon";
		const colorProp = config.basesEventColorProp || "color";
		const descriptionProp = config.basesEventDescriptionProp || "description";

		// 从事件 ID 中提取文件路径
		// 事件 ID 格式: bases-{filePath}-{isoDate}
		// 例如: bases-Events/event-samples/测试事件.md-2026-01-10
		const idWithoutPrefix = event.id.replace('bases-', '');

		// 从 .md 开始截断，获取文件路径
		const mdIndex = idWithoutPrefix.indexOf('.md');
		const filePath = mdIndex > 0 ? idWithoutPrefix.substring(0, mdIndex + 3) : idWithoutPrefix;

		// 获取文件
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!file || !(file instanceof TFile)) {
			console.warn('File not found or not a TFile:', filePath);
			return;
		}

		// 检查事件是否有日期
		const eventDate = event.eventDate?.isoDate;
		if (!eventDate) {
			console.warn('Event has no date:', event.id);
			return;
		}

		try {
			// 使用 fileManager.processFrontMatter 直接更新 frontmatter
			await this.app.fileManager.processFrontMatter(file, (fm) => {
				// 更新 frontmatter 字段（使用自定义属性名）
				fm[titleProp] = event.text;
				fm[dateProp] = eventDate;

				// 同步持续天数字段
				if (event.duration && event.duration > 1) {
					fm[durationProp] = event.duration;
				} else if (fm[durationProp]) {
					delete fm[durationProp];
				}

				// 同步图标：如果有自定义值则设置，否则删除
				if (event.emoji && event.emoji !== EVENT_TYPE_DEFAULT.basesEvent.emoji) {
					fm[iconProp] = event.emoji;
				} else if (fm[iconProp]) {
					delete fm[iconProp];
				}

				// 同步颜色：如果有自定义值则设置，否则删除
				if (event.color && event.color !== EVENT_TYPE_DEFAULT.basesEvent.color) {
					fm[colorProp] = event.color;
				} else if (fm[colorProp]) {
					delete fm[colorProp];
				}

				// 同步描述：如果有值则设置，否则删除
				if (event.remark && typeof event.remark === 'string' && !event.remark.startsWith('From Bases:')) {
					fm[descriptionProp] = event.remark;
				} else if (fm[descriptionProp]) {
					delete fm[descriptionProp];
				}
			});
			console.log('Frontmatter sync completed for:', filePath);
		} catch (error) {
			console.error('Failed to sync frontmatter:', error);
		}
	}

	/**
	 * 为 Bases 事件创建新笔记文件
	 * @param event 事件对象
	 * @returns 创建的文件路径
	 */
	async createBasesEventNote(event: CustomEvent): Promise<string> {
		// 1. 获取配置的默认路径和属性名
		const config = this.settings.config;
		const defaultPath = config.defaultBasesEventPath?.trim();

		// 获取自定义属性名，如果未设置则使用默认值
		const titleProp = config.basesEventTitleProp || "title";
		const dateProp = config.basesEventDateProp || "event_date";
		const durationProp = config.basesEventDurationProp || "duration_days";
		const iconProp = config.basesEventIconProp || "icon";
		const colorProp = config.basesEventColorProp || "color";
		const descriptionProp = config.basesEventDescriptionProp || "description";

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
			fm[titleProp] = event.text;
			fm[dateProp] = event.eventDate.isoDate;
			if (event.duration && event.duration > 1) {
				fm[durationProp] = event.duration;
			}
			if (event.emoji) {
				fm[iconProp] = event.emoji;
			}
			if (event.color) {
				fm[colorProp] = event.color;
			}
			if (event.remark) {
				fm[descriptionProp] = event.remark;
			}
		});

		// 6. 如果路径有问题，显示 Notice
		if (pathWarning) {
			new Notice("提示：请在插件设置中选择默认笔记事件路径");
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
