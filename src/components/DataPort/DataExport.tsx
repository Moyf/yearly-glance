import { App, Notice } from "obsidian";
import {
	DEFAULT_MARKDOWN_EXPORT_CONFIG,
	ExportFormat,
	MarkdownExportConfig,
} from "@/src/type/DataPort";
import {
	BaseEvent,
	EVENT_TYPE_DEFAULT,
	Events,
	EventType,
} from "@/src/type/Events";
import { IsoUtils } from "@/src/utils/isoUtils";
import * as React from "react";
import { Button } from "@/src/components/Base/Button";
import { NavTabs } from "@/src/components/Base/NavTabs";
import { Input } from "@/src/components/Base/Input";
import { Toggle } from "@/src/components/Base/Toggle";
import {
	Calendar,
	CheckSquare,
	ChevronLeft,
	ChevronRight,
	Download,
	FileText,
	FolderOpen,
	Sparkles,
	Square,
	Users,
} from "lucide-react";
import "./style/DataExport.css";
import { YearlyGlanceSettings } from "@/src/type/Settings";
import { t } from "@/src/i18n/i18n";
import { JsonService } from "@/src/service/JsonService";
import { iCalendarService } from "@/src/service/iCalendarService";
import { MarkdownService } from "@/src/service/MarkdownService";
import { FolderAutoComplete } from "@/src/components/Base/FolderAutoComplete";

interface DataExportProps {
	app: App;
	config: YearlyGlanceSettings;
	currentData: Events;
	onConfigUpdate: (config: Partial<YearlyGlanceSettings>) => Promise<void>;
}

interface EventWithType extends BaseEvent {
	type: EventType;
}

export const DataExport: React.FC<DataExportProps> = ({
	app,
	config,
	currentData,
	onConfigUpdate,
}) => {
	const [isExporting, setIsExporting] = React.useState(false);

	// 获取所有事件的ID用于默认全选
	const allEventIds = React.useMemo(() => {
		const allIds: string[] = [];
		allIds.push(...currentData.holidays.map((event) => event.id));
		allIds.push(...currentData.birthdays.map((event) => event.id));
		allIds.push(...currentData.customEvents.map((event) => event.id));
		return allIds;
	}, [currentData]);

	const [selectedEvents, setSelectedEvents] = React.useState<Set<string>>(
		new Set(allEventIds)
	);

	// 导出配置状态
	const [activeExportFormat, setActiveExportFormat] =
		React.useState<ExportFormat>("json");
	const [exportYear, setExportYear] = React.useState(config.year);
	const [exportFileName, setExportFileName] = React.useState("");

	// Markdown导出配置
	const [markdownConfig, setMarkdownConfig] =
		React.useState<MarkdownExportConfig>(DEFAULT_MARKDOWN_EXPORT_CONFIG);

	// 保存原始年份以便恢复
	const originalYear = React.useRef(config.year);

	// 组件卸载时恢复原始年份配置
	React.useEffect(() => {
		return () => {
			void onConfigUpdate({ year: originalYear.current });
		};
	}, [onConfigUpdate]);

	// 初始化默认文件名
	React.useEffect(() => {
		// 使用时区安全的今天日期字符串
		const today = IsoUtils.getTodayLocalDateString();
		if (activeExportFormat === "json") {
			setExportFileName(`yearly-glance-events-${today}`);
		} else if (activeExportFormat === "ics") {
			setExportFileName(`yearly-glance-events-${exportYear}`);
		} else if (activeExportFormat === "md") {
			// Markdown导出不需要文件名，因为会直接创建到指定文件夹
			setExportFileName("");
		}
	}, [activeExportFormat, exportYear]);

	// 导出标签配置
	const exportTabs = [
		{
			label: "JSON",
			value: "json" as ExportFormat,
			icon: <FileText size={16} />,
		},
		{
			label: "ICS",
			value: "ics" as ExportFormat,
			icon: <Calendar size={16} />,
		},
		{
			label: "Markdown",
			value: "md" as ExportFormat,
			icon: <FolderOpen size={16} />,
		},
	];

	// 将所有事件转换为统一格式并按类型分组，组内按dateArr第一个元素升序排序
	const eventGroups = React.useMemo(() => {
		const sortEventsByDate = (events: EventWithType[]) => {
			return events.sort((a, b) => {
				const dateA =
					a.dateArr && a.dateArr.length > 0 ? a.dateArr[0] : "";
				const dateB =
					b.dateArr && b.dateArr.length > 0 ? b.dateArr[0] : "";
				return dateA.localeCompare(dateB);
			});
		};

		const groups: Record<EventType, EventWithType[]> = {
			holiday: sortEventsByDate(
				currentData.holidays.map((event) => ({
					...event,
					type: "holiday" as EventType,
				}))
			),
			birthday: sortEventsByDate(
				currentData.birthdays.map((event) => ({
					...event,
					type: "birthday" as EventType,
				}))
			),
			customEvent: sortEventsByDate(
				currentData.customEvents.map((event) => ({
					...event,
					type: "customEvent" as EventType,
				}))
			),
			// bases events are tied to notes and don't need to be exported through data port
			basesEvent: [],
			// daily note events are tied to daily notes and don't need to be exported through data port
			dailyNoteEvent: [],
		};
		return groups;
	}, [currentData, config]);

	// 当数据变化时更新选中状态，保持全选
	React.useEffect(() => {
		setSelectedEvents(new Set(allEventIds));
	}, [allEventIds]);

	// 检查是否全选
	const isAllSelected =
		selectedEvents.size === allEventIds.length && allEventIds.length > 0;

	// 全选/取消全选
	const handleSelectAll = () => {
		if (isAllSelected) {
			setSelectedEvents(new Set());
		} else {
			setSelectedEvents(new Set(allEventIds));
		}
	};

	// 选择/取消选择某个分组的所有事件
	const handleGroupSelection = (type: EventType) => {
		const groupEventIds = eventGroups[type].map((event) => event.id);
		const newSelected = new Set(selectedEvents);

		// 检查该分组是否有任何已选择的事件
		const hasSelectedInGroup = groupEventIds.some((id) =>
			selectedEvents.has(id)
		);

		if (hasSelectedInGroup) {
			// 如果分组内有已选择的事件，则取消选择该分组的所有事件
			groupEventIds.forEach((id) => newSelected.delete(id));
		} else {
			// 如果分组内没有已选择的事件，则选择该分组的所有事件
			groupEventIds.forEach((id) => newSelected.add(id));
		}

		setSelectedEvents(newSelected);
	};

	// 切换单个事件的选择状态
	const handleEventSelection = (eventId: string) => {
		const newSelected = new Set(selectedEvents);
		if (selectedEvents.has(eventId)) {
			newSelected.delete(eventId);
		} else {
			newSelected.add(eventId);
		}
		setSelectedEvents(newSelected);
	};

	// 检查某个分组是否全选
	const isGroupSelected = (type: EventType) => {
		const groupEventIds = eventGroups[type].map((event) => event.id);
		return (
			groupEventIds.length > 0 &&
			groupEventIds.every((id) => selectedEvents.has(id))
		);
	};

	// 调整年份
	const adjustYear = (delta: number) => {
		const newYear = exportYear + delta;
		setExportYear(newYear);
		// 同步更新配置中的年份
		void onConfigUpdate({ year: newYear });
	};

	// 处理导出格式切换
	const handleExportFormatChange = (format: string) => {
		setActiveExportFormat(format as ExportFormat);
	};

	// 获取选中的数据
	const getSelectedData = (): Events => {
		return {
			holidays: currentData.holidays.filter((event) =>
				selectedEvents.has(event.id)
			),
			birthdays: currentData.birthdays.filter((event) =>
				selectedEvents.has(event.id)
			),
			customEvents: currentData.customEvents.filter((event) =>
				selectedEvents.has(event.id)
			),
		};
	};

	const handleExport = async () => {
		if (selectedEvents.size === 0) {
			new Notice(t("view.dataPortView.export.empty.noSelectedEvents"));
			return;
		}

		setIsExporting(true);
		try {
			const selectedData = getSelectedData();

			switch (activeExportFormat) {
				case "json": {
					const content = JsonService.createJsonEvents(selectedData, config.eventPresetTypes);
					const filename = `${exportFileName}.json`;
					const mimeType = "application/json";

					// 创建下载链接
					const blob = new Blob([content], { type: mimeType });
					const url = URL.createObjectURL(blob);
				const link = activeDocument.createElement("a");
				link.href = url;
				link.download = filename;
				activeDocument.body.appendChild(link);
				link.click();
				activeDocument.body.removeChild(link);
					URL.revokeObjectURL(url);
					break;
				}
				case "ics": {
					const content =
						iCalendarService.createICalEvents(selectedData);
					const filename = `${exportFileName}.ics`;
					const mimeType = "text/calendar";

					// 创建下载链接
					const blob = new Blob([content], { type: mimeType });
					const url = URL.createObjectURL(blob);
				const link = activeDocument.createElement("a");
				link.href = url;
				link.download = filename;
				activeDocument.body.appendChild(link);
				link.click();
				activeDocument.body.removeChild(link);
					URL.revokeObjectURL(url);
					break;
				}
				case "md": {
					// Markdown导出直接创建文件到Obsidian vault
					const markdownService = new MarkdownService(app);
					const result = await markdownService.exportMarkdownEvents(
						selectedData,
						markdownConfig,
						config.eventPresetTypes
					);

					if (result.success > 0) {
						new Notice(
							t(
								"view.dataPortView.export.type.markdown.success",
								{ count: result.success }
							)
						);
					}
					if (result.failed > 0) {
						new Notice(
							t(
								"view.dataPortView.export.type.markdown.failure",
								{ count: result.failed }
							)
						);
						throw new Error(
							`导出失败: ${result.errors.join(", ")}`
						);
					}
					break;
				}
				default:
					throw new Error(
						`Unsupported export format: ${activeExportFormat}`
					);
			}
		} catch (error) {
			throw new Error(
				`导出失败: ${error instanceof Error ? error.message : String(error)}`
			);
		} finally {
			setIsExporting(false);
		}
	};

	// 获取分组显示信息
	const getGroupInfo = (type: EventType) => {
		const config = {
			holiday: {
				title: t("view.yearlyGlance.legend.holiday"),
				icon: <Sparkles className="group-icon" />,
			},
			birthday: {
				title: t("view.yearlyGlance.legend.birthday"),
				icon: <Users className="group-icon" />,
			},
			customEvent: {
				title: t("view.yearlyGlance.legend.customEvent"),
				icon: <Calendar className="group-icon" />,
			},
		};
		return config[type];
	};

	// 格式化事件日期显示
	const formatEventDate = (event: EventWithType) => {
		const dateArr = event.dateArr;
		if (!dateArr || dateArr.length === 0) {
			return <div>{t("view.dataPortView.export.empty.noDate")}</div>;
		}
		return (
			<>
				{dateArr.map((date, index) => (
					<div key={index} className="event-date">
						<Calendar size={12} />
						{date}
					</div>
				))}
			</>
		);
	};

	if (allEventIds.length === 0) {
		return (
			<div className="yg-data-export">
				<div className="export-empty-state">
					<div className="empty-icon">📁</div>
					<div className="empty-text">
						{t("view.dataPortView.export.empty.text")}
					</div>
					<div className="empty-subtext">
						{t("view.dataPortView.export.empty.subtext")}
					</div>
				</div>
			</div>
		);
	}

	const jsonExportConfig = () => {
		return (
			<>
				<div className="config-group">
					<label className="config-label">
						{t("view.dataPortView.export.config.fileName")}
					</label>
					<Input
						value={exportFileName}
						onChange={setExportFileName}
					/>
				</div>
			</>
		);
	};

	const icsExportConfig = () => {
		return (
			<>
				<div className="config-group">
					<label className="config-label">
						{t("view.dataPortView.export.config.fileName")}
					</label>
					<Input
						value={exportFileName}
						onChange={setExportFileName}
					/>
				</div>
				<div className="config-group">
					<label className="config-label">
						{t("view.dataPortView.export.config.year")}
					</label>
					<div className="year-selector">
						<Button
							className="year-control"
							onClick={() => adjustYear(-1)}
							variant="secondary"
						>
							<ChevronLeft size={16} />
						</Button>
						<span className="year-display">{exportYear}</span>
						<Button
							className="year-control"
							onClick={() => adjustYear(1)}
							variant="secondary"
						>
							<ChevronRight size={16} />
						</Button>
					</div>
				</div>
			</>
		);
	};

	const eventCommonFields = [
		{
			key: "id",
			label: t("view.dataPortView.export.config.id"),
		},
		{
			key: "isoDate",
			label: t("view.dataPortView.export.config.isoDate"),
		},
		{
			key: "calendar",
			label: t("view.dataPortView.export.config.calendar"),
		},
		{
			key: "emoji",
			label: t("view.dataPortView.export.config.emoji"),
		},
		{
			key: "color",
			label: t("view.dataPortView.export.config.color"),
		},
		{
			key: "remark",
			label: t("view.dataPortView.export.config.remark"),
		},
	];

	// 事件类型配置映射
	const eventTypeConfigs = {
		holiday: {
			title:
				t("view.yearlyGlance.legend.holiday") +
				t("view.dataPortView.export.type.configure"),
			folderKey: "holidayFolder" as const,
			fields: [
				...eventCommonFields,
				{
					key: "foundDate",
					label: t("view.dataPortView.export.config.foundDate"),
				},
			],
			configKey: "holidayFields" as const,
		},
		birthday: {
			title:
				t("view.yearlyGlance.legend.birthday") +
				t("view.dataPortView.export.type.configure"),
			folderKey: "birthdayFolder" as const,
			fields: [
				...eventCommonFields,
				{
					key: "nextBirthday",
					label: t("view.dataPortView.export.config.nextBirthday"),
				},
				{
					key: "age",
					label: t("view.dataPortView.export.config.age"),
				},
				{
					key: "animal",
					label: t("view.dataPortView.export.config.animal"),
				},
				{
					key: "zodiac",
					label: t("view.dataPortView.export.config.zodiac"),
				},
			],
			configKey: "birthdayFields" as const,
		},
		customEvent: {
			title:
				t("view.yearlyGlance.legend.customEvent") +
				t("view.dataPortView.export.type.configure"),
			folderKey: "customEventFolder" as const,
			fields: [
				...eventCommonFields,
				{
					key: "isRepeat",
					label: t("view.dataPortView.export.config.isRepeat"),
				},
			],
			configKey: "customEventFields" as const,
		},
	};

	// 渲染单个事件类型的配置区域
	const renderEventTypeConfig = (type: keyof typeof eventTypeConfigs) => {
		const config = eventTypeConfigs[type];

		return (
			<div key={type} className="event-type-config">
				<h3>{config.title}</h3>

				{/* 文件夹配置 */}
				<div className="folder-config-section">
					<FolderAutoComplete
						label={
							<>
								<FolderOpen size={12} />
								{t(
									"view.dataPortView.export.type.markdown.folderLabel"
								)}
							</>
						}
						value={markdownConfig[config.folderKey]}
						onChange={(value) =>
							setMarkdownConfig((prev) => ({
								...prev,
								[config.folderKey]: value,
							}))
						}
						app={app}
					/>
				</div>

				{/* 字段配置 */}
				<div className="field-config-section">
					<label>
						<FileText size={12} />
						{t(
							"view.dataPortView.export.type.markdown.fieldsTitle"
						)}
					</label>
					<div className="field-toggles">
						{config.fields.map((field) => (
							<Toggle
								key={field.key}
								label={field.label}
								checked={
									markdownConfig[config.configKey][
										field.key
									] || false
								}
								onChange={(checked) =>
									setMarkdownConfig((prev) => ({
										...prev,
										[config.configKey]: {
											...prev[config.configKey],
											[field.key]: checked,
										},
									}))
								}
							/>
						))}
					</div>
				</div>
			</div>
		);
	};

	const markdownExportConfig = () => {
		return (
			<>
				<div className="config-group">
					<div className="markdown-export-config">
						{Object.keys(eventTypeConfigs).map((type) =>
							renderEventTypeConfig(
								type as keyof typeof eventTypeConfigs
							)
						)}
					</div>
				</div>
			</>
		);
	};

	return (
		<div className="yg-data-export">
			{/* 导出操作区域 */}
			<div className="export-actions">
				<div className="export-actions-header">
					<div className="export-format-tabs">
						<NavTabs
							tabs={exportTabs}
							activeTab={activeExportFormat}
							onClick={handleExportFormatChange}
						/>
					</div>
					<Button
						icon={<Download size={16} />}
						onClick={() => {
							void handleExport();
						}}
						disabled={isExporting || selectedEvents.size === 0}
						variant="primary"
					>
						{t("view.dataPortView.export.actions.handle")}
					</Button>
				</div>

				{/* 导出配置区域 */}
				<div className="export-config">
					{activeExportFormat === "json" && jsonExportConfig()}
					{activeExportFormat === "ics" && icsExportConfig()}
					{activeExportFormat === "md" && markdownExportConfig()}
				</div>
			</div>

			{/* 选择控制区域 */}
			<div className="export-selection-controls">
				<div className="selection-info">
					<span>
						{t("view.dataPortView.common.actions.selectSummary", {
							count: `${selectedEvents.size} / ${allEventIds.length}`,
						})}
					</span>
				</div>
				<div className="selection-actions">
					<Button
						variant="secondary"
						size="small"
						icon={
							isAllSelected ? (
								<CheckSquare size={16} />
							) : (
								<Square size={16} />
							)
						}
						onClick={handleSelectAll}
					>
						{isAllSelected
							? t("view.dataPortView.common.actions.reverseAll")
							: t("view.dataPortView.common.actions.selectAll")}
					</Button>

					{/* 分类选择控制 */}
					{(Object.keys(eventGroups) as EventType[]).map((type) => {
						const events = eventGroups[type];
						if (events.length === 0) return null;

						const groupInfo = getGroupInfo(type);
						const groupSelected = isGroupSelected(type);
						const groupEventIds = eventGroups[type].map(
							(event) => event.id
						);
						const hasSelectedInGroup = groupEventIds.some((id) =>
							selectedEvents.has(id)
						);

						return (
							<Button
								key={type}
								variant="secondary"
								size="small"
								icon={
									groupSelected ? (
										<CheckSquare size={16} />
									) : (
										<Square size={16} />
									)
								}
								onClick={() => handleGroupSelection(type)}
							>
								{hasSelectedInGroup
									? t(
											"view.dataPortView.common.actions.reverseAll"
									  )
									: t(
											"view.dataPortView.common.actions.selectAll"
									  )}
								{groupInfo.title}
							</Button>
						);
					})}
				</div>
			</div>

			{/* 事件分组列表 */}
			<div className="export-event-groups">
				{(Object.keys(eventGroups) as EventType[]).map((type) => {
					const events = eventGroups[type];
					if (events.length === 0) return null;

					const groupInfo = getGroupInfo(type);

					return (
						<div key={type} className="export-event-group">
							<div className="export-group-header">
								<div className="group-title">
									{groupInfo.icon}
									<span>{groupInfo.title}</span>
									<span className="group-count">
										{events.length}
									</span>
								</div>
								<div className="group-actions">
									<Button
										variant="secondary"
										size="small"
										icon={
											isGroupSelected(type) ? (
												<CheckSquare size={16} />
											) : (
												<Square size={16} />
											)
										}
										onClick={() =>
											handleGroupSelection(type)
										}
									>
										{isGroupSelected(type)
											? t(
													"view.dataPortView.common.actions.reverseAll"
											  )
											: t(
													"view.dataPortView.common.actions.selectAll"
											  )}
									</Button>
								</div>
							</div>
							<div className="export-event-list">
								{events.map((event) => {
									const isSelected = selectedEvents.has(
										event.id
									);
									return (
										<div
											key={event.id}
											className={`export-event-item ${
												isSelected ? "selected" : ""
											}`}
											onClick={() =>
												handleEventSelection(event.id)
											}
										>
											<div
												className={`event-checkbox ${
													isSelected ? "checked" : ""
												}`}
											/>
											<div className="event-info">
												<div className="event-title">
													{!event.emoji
														? EVENT_TYPE_DEFAULT[
																type
														  ].emoji
														: event.emoji}{" "}
													{event.text}
												</div>
												<div className="event-details">
													{formatEventDate(event)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
