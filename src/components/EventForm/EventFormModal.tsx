import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal, Notice, normalizePath } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/type/Config";
import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	Events,
	EventSource,
	EventType,
	Holiday,
} from "@/src/type/Events";
import { EventForm } from "./EventForm";
import { EventCalculator } from "@/src/utils/eventCalculator";
import "./style/EventFormModal.css";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { t } from "@/src/i18n/i18n";
import { DailyNoteService } from "@/src/service/DailyNoteService";
import { ConfirmDialog } from "@/src/components/Base/ConfirmDialog";
import { YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";

export interface EventFormModalProps {
	date?: string; // 可选的日期属性
	targetBasesEventFilePath?: string;
	isConvertingExistingNote?: boolean;
	pathWarning?: string;
}

export class EventFormModal extends Modal {
	root: Root | null = null;
	plugin: YearlyGlancePlugin;
	event: Partial<CustomEvent | Birthday | Holiday>;
	eventType: EventType;
	isEditing: boolean;
	allowTypeChange: boolean;
	settings: YearlyGlanceConfig;
	props: EventFormModalProps;
	isBasesEvent: boolean;
	isDailyNoteEvent: boolean;
	editingEvent: Partial<CustomEvent | Birthday | Holiday> | null;

	constructor(
		plugin: YearlyGlancePlugin,
		event: Partial<CustomEvent | Birthday | Holiday>,
		eventType: EventType,
		isEditing: boolean,
		allowTypeChange: boolean,
		props: EventFormModalProps = {}
	) {
		super(plugin.app);
		this.plugin = plugin;
		this.event = event;
		this.eventType = eventType;
		this.isEditing = isEditing;
		this.allowTypeChange = allowTypeChange;
		this.settings = plugin.getSettings();
		this.props = props;
		// 检查是否是 Bases 事件（通过 id 判断、事件类型或指定目标文件判断）
		this.isBasesEvent = event.id ? event.id.startsWith('bases-') : eventType === 'basesEvent' || !!props.targetBasesEventFilePath;
		// 检查是否是日记事件
		this.isDailyNoteEvent = event.id ? event.id.startsWith('dailynote-') : eventType === 'dailyNoteEvent';
		// 保存编辑前的事件引用，用于比较标题变化
		this.editingEvent = isEditing ? event : null;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		// 创建 React 根元素
		this.root = createRoot(contentEl);

		// 渲染 EventForm 组件
		this.renderForm();
	}

	private renderForm() {
		if (!this.root) return;

		this.root.render(
			<React.StrictMode>
				<EventForm
					event={this.event}
					eventType={this.eventType}
					isEditing={this.isEditing}
					allowTypeChange={this.allowTypeChange}
					settings={this.settings}
					plugin={this.plugin}
					onSave={(event, eventType) => this.onSave(event, eventType)}
				onCancel={() => this.close()}
				onDelete={this.isEditing ? () => this.handleDelete() : undefined}
				canDelete={this.isEditing}
				props={this.props}
				isBasesEvent={this.isBasesEvent}
				isDailyNoteEvent={this.isDailyNoteEvent}
				/>
			</React.StrictMode>
	);
	}

	onClose(): void {
		super.onClose();
		window.setTimeout(() => {
			this.root?.unmount();
			this.contentEl.empty();
		});
	}

	private async handleDelete(): Promise<void> {
		return new Promise((resolve) => {
			new ConfirmDialog(this.plugin, {
				title: t("view.eventManager.actions.delete"),
				message: t("view.eventManager.actions.deleteConfirm", { name: this.event.text || "" }),
				onConfirm: () => {
					void (async () => {
					try {
						if (this.isDailyNoteEvent) {
							const filePath = (this.event as CalendarEvent).sourceFilePath || DailyNoteService.getFilePathFromEvent(this.event as CalendarEvent);
							if (filePath) {
								const defaultEmoji = EVENT_TYPE_DEFAULT.dailyNoteEvent.emoji;
								const fullTitle = DailyNoteService.assembleTitle(this.event.emoji, this.event.text || '', defaultEmoji);
								await DailyNoteService.removeEventFromDaily(this.app, filePath, this.plugin.getSettings().config.dailyNoteEventProp, fullTitle);
								YearlyGlanceBus.publish('dailynote-data');
							}
						} else if (this.isBasesEvent) {
							const filePath = (this.event as CalendarEvent).sourceFilePath;
							if (filePath) {
								const file = this.app.vault.getAbstractFileByPath(filePath);
								if (file) {
									await this.app.fileManager.trashFile(file);
									YearlyGlanceBus.publish('bases-data');
								}
							}
						} else {
							const events = this.plugin.getData();
							const newEvents = { ...events };
							const eventId = this.event.id;
							newEvents.holidays = events.holidays.filter(h => h.id !== eventId);
							newEvents.birthdays = events.birthdays.filter(b => b.id !== eventId);
							newEvents.customEvents = events.customEvents.filter(c => c.id !== eventId);
							await this.plugin.updateData(newEvents);
						}
						new Notice(t("view.eventManager.form.eventUpdated"));
						this.close();
					} catch (error) {
						console.error("[YearlyGlance] Delete failed:", error);
					}
					resolve();
					})();
				},
			}).open();
		});
	}

	async onSave(
		event: CustomEvent | Birthday | Holiday,
		eventType: EventType
	): Promise<void> {
		try {
			const events: Events = this.plugin.getData();
			const newEvents = { ...events };
			const currentYear = this.plugin.getConfig().year;

			// 确保数组存在
			if (!newEvents.customEvents) newEvents.customEvents = [];
			if (!newEvents.birthdays) newEvents.birthdays = [];
			if (!newEvents.holidays) newEvents.holidays = [];

			// 根据事件类型进行不同的处理
			switch (eventType) {
				case "customEvent": {
					// 计算并更新自定义事件的完整信息
					event = EventCalculator.updateCustomEventInfo(
						event as CustomEvent,
						currentYear
					);
					// 编辑模式,更新现有事件; 新增模式,添加新事件
					if (this.isEditing) {
						newEvents.customEvents = newEvents.customEvents.map((c) =>
							c.id === event.id ? (event as CustomEvent) : c
						);
					} else {
						// 新增事件时添加 eventSource
						(event as CustomEvent).eventSource = EventSource.CONFIG;
						newEvents.customEvents.push(event as CustomEvent);
					}
					break;
				}
				case "basesEvent": {
					// 计算并更新事件信息（使用 CustomEvent 的计算逻辑）
					event = EventCalculator.updateCustomEventInfo(
						event as CustomEvent,
						currentYear
					);

					// 如果是新增事件，创建笔记文件；从当前笔记转换时写入指定的现有笔记
					if (!this.isEditing || this.props.isConvertingExistingNote) {
						const filePath = this.props.targetBasesEventFilePath
							? await this.plugin.convertExistingNoteToBasesEvent(
								this.props.targetBasesEventFilePath,
								event as CustomEvent
							)
							: await this.plugin.createBasesEventNote(event as CustomEvent);
						// 更新 event.id 为 bases-{filePath}-{isoDate}
						const idWithoutDate = filePath.replace(/\.md$/, "");
						event.id = `bases-${idWithoutDate}-${event.eventDate.isoDate}`;
					}

					// 标记事件来源为 BASES
					(event as CustomEvent).eventSource = EventSource.BASES;

					// 同步到 frontmatter（编辑模式下）
					if (this.isEditing) {
					const calendarEvent: CalendarEvent = {
						id: event.id,
						text: event.text,
						eventDate: event.eventDate,
						dateArr: event.dateArr,
						duration: (event as CustomEvent).duration,
						emoji: event.emoji,
						color: event.color,
						isHidden: event.isHidden,
						remark: event.remark,
						eventType: eventType,
						isRepeat: (event as CustomEvent).isRepeat,
						presetTypeId: event.presetTypeId,
					};
						await this.plugin.syncBasesEventToFrontmatter(calendarEvent);
					}
					break;
				}
				case "birthday": {
					// 计算并更新生日的完整信息
					event = EventCalculator.updateBirthdayInfo(
						event as Birthday,
						currentYear
					);
					if (this.isEditing) {
						newEvents.birthdays = newEvents.birthdays.map((b) =>
							b.id === event.id ? (event as Birthday) : b
						);
					} else {
						// 新增事件时添加 eventSource
						(event as Birthday).eventSource = EventSource.CONFIG;
						newEvents.birthdays.push(event as Birthday);
					}
					break;
				}
				case "holiday": {
					// 计算并更新节日的完整信息
						event = EventCalculator.updateHolidayInfo(
							event,
							currentYear
						);
					if (this.isEditing) {
						newEvents.holidays = newEvents.holidays.map((h) =>
							h.id === event.id ? (event as Holiday) : h
						);
					} else {
						// 新增事件时添加 eventSource
						(event as Holiday).eventSource = EventSource.CONFIG;
						newEvents.holidays.push(event as Holiday);
					}
					break;
				}
				case "dailyNoteEvent": {
					// 计算并更新事件信息（使用 CustomEvent 的计算逻辑）
					event = EventCalculator.updateCustomEventInfo(
						event as CustomEvent,
						currentYear
					);
					(event as CustomEvent).eventSource = EventSource.DAILYNOTE;

					const defaultDailyEmoji = EVENT_TYPE_DEFAULT.dailyNoteEvent.emoji;

					if (this.isEditing && this.editingEvent) {
						// 编辑模式：写回日记笔记的 frontmatter
						const oldIsoDate = this.editingEvent.eventDate?.isoDate;
						const newIsoDate = event.eventDate.isoDate;
						const oldFilePath = (this.editingEvent as CalendarEvent).sourceFilePath || DailyNoteService.getFilePathFromEvent(this.editingEvent as CalendarEvent);
						const newTitle = DailyNoteService.assembleTitle(
							event.emoji,
							event.text || '',
							defaultDailyEmoji
						);

						if (oldFilePath) {
							// 从 event ID 提取 index（格式: dailynote-{date}-{index}）用于精确定位
							const eventIndex = Number((this.editingEvent.id || '').split('-').pop());

							if (oldIsoDate && newIsoDate && oldIsoDate !== newIsoDate) {
								const oldEmoji = DailyNoteService.getEffectiveEmoji(
									this.editingEvent as CalendarEvent,
									defaultDailyEmoji
								);
								const oldTitle = DailyNoteService.assembleTitle(
									oldEmoji,
									this.editingEvent.text || '',
									defaultDailyEmoji
								);

								await DailyNoteService.removeEventFromDaily(
									this.app,
									oldFilePath,
									this.plugin.getSettings().config.dailyNoteEventProp,
									oldTitle
								);

								const settings = DailyNoteService.getDailyNoteSettings(
									this.app,
									this.plugin.getSettings().config.dailyNoteSource
								);
								if (!settings) {
									throw new Error("Daily note plugin is not available");
								}

								const momentFn = (window as typeof window & {
									moment?: (input: string, format: string) => { format(pattern: string): string };
								}).moment;
								if (!momentFn) {
									throw new Error("Moment is not available");
								}

								const formattedName = momentFn(newIsoDate, "YYYY-MM-DD").format(settings.format);
								const folder = settings.folder.replace(/\/+$/, "");
								const newFilePath = normalizePath(
									folder ? `${folder}/${formattedName}.md` : `${formattedName}.md`
								);

								let newFile = this.app.vault.getAbstractFileByPath(newFilePath);
								if (!newFile) {
									if (folder) {
										const normalizedFolder = normalizePath(folder);
										const folderExists = this.app.vault.getAbstractFileByPath(normalizedFolder);
										if (!folderExists) {
											await this.app.vault.createFolder(normalizedFolder);
										}
									}

									await this.app.vault.create(newFilePath, "");
									newFile = this.app.vault.getAbstractFileByPath(newFilePath);
								}

								if (!newFile) {
									throw new Error("Failed to create daily note");
								}

								await DailyNoteService.addEventToDaily(
									this.app,
									newFilePath,
									this.plugin.getSettings().config.dailyNoteEventProp,
									newTitle
								);
								YearlyGlanceBus.publish('dailynote-data');
							} else if (!Number.isNaN(eventIndex)) {
								await DailyNoteService.updateEventTitle(
									this.app,
									oldFilePath,
									this.plugin.getSettings().config.dailyNoteEventProp,
									eventIndex,
									newTitle
								);
							}
						}
					} else {
						// 创建模式：将 emoji 拼回标题后创建/追加到对应的 DailyNote
						const fullTitle = DailyNoteService.assembleTitle(
							event.emoji,
							event.text || '',
							defaultDailyEmoji
						);
						const createEvent: CalendarEvent = {
							id: '',
							text: fullTitle,
							eventDate: event.eventDate,
							dateArr: event.dateArr,
							eventType: eventType,
							eventSource: EventSource.DAILYNOTE,
						};
						await this.plugin.createDailyNoteEvent(createEvent);
					}
					// 日记事件不存入插件配置数据，关闭 modal 并刷新即可
					break;
				}
				default: {
					throw new Error(`Unsupported event type: ${eventType}`);
				}
			}

			await this.plugin.updateData(newEvents);

			// 成功提示
			new Notice(
				this.isEditing
					? t("view.eventManager.form.eventUpdated")
					: t("view.eventManager.form.eventCreated")
			);

			// 记住本次保存的事件类型，用于下次新建事件时的默认类型
			if (!this.isEditing && this.allowTypeChange) {
				void this.plugin.updateConfig({ lastSelectedEventType: eventType });
			}

			this.close();
		} catch (error) {
			// 错误提示
			const errorMessage = error instanceof Error ? error.message : String(error);
			new Notice(t("view.eventManager.form.saveFailed", { error: errorMessage }));
			console.error(`[YearlyGlance] Failed to save: ${errorMessage}`, error);

			// 重新抛出错误，让 EventForm 可以捕获并重新启用保存按钮
			throw error;
		}
	}
}
