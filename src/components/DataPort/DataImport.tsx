import {
	Birthday,
	CustomEvent,
	EVENT_TYPE_DEFAULT,
	Events,
	EventType,
	Holiday,
} from "@/src/type/Events";
import * as React from "react";
import {
	AlertTriangle,
	Calendar,
	CheckSquare,
	ChevronDown,
	ChevronUp,
	FileText,
	Sparkles,
	Square,
	Upload,
	Users,
} from "lucide-react";
import {
	ImportJsonEvents,
	JsonEventParse,
	JsonEventsParseResult,
} from "@/src/type/DataPort";
import "./style/DataImport.css";
import { ImportUpload } from "@/src/components/Base/ImportUpload";
import { ImportJson } from "./ImportJson";
import { Button } from "@/src/components/Base/Button";
import { t } from "@/src/i18n/i18n";
import parse from "html-react-parser";
import { CalloutBlock } from "@/src/components/Base/CalloutBlock";
import { Pre } from "@/src/components/Base/Pre";
import { JsonService } from "@/src/service/JsonService";
import { Notice } from "obsidian";

interface DataImportProps {
	currentData: Events;
	onDataImport: (
		event: CustomEvent | Birthday | Holiday,
		eventType: EventType
	) => Promise<void>;
}

// JSON 示例代码块内容
const JSON_EXAMPLE_CODE = `{
  "holidays": [
    {
      "id": "holiday-id",
      "text": "holiday name",
      "userInput": {
        "input": "1949-10-01",
        "calendar": "Gregorian"
      },
      "emoji": "🎉",
      "color": "#ff0000",
      "remark": "holiday remark",
      "isHidden": false,
      "foundDate": "1949-10-01"
    }
  ],
  "birthdays": [
    {
      "id": "birthday-id",
      "text": "person name", 
      "userInput": {
        "input": "1990-01-01",
        "calendar": "Gregorian"
      },
      "emoji": "🎂",
      "color": "#00ff00",
      "remark": "birthday remark",
      "isHidden": false
    }
  ],
  "customEvents": [
    {
      "id": "custom-event-id",
      "text": "event name",
      "userInput": {
        "input": "2023-12-25", 
        "calendar": "Gregorian"
      },
      "emoji": "📌",
      "color": "#0000ff",
      "remark": "event remark",
      "isHidden": false,
      "isRepeat": false
    }
  ]
}`;

export const DataImport: React.FC<DataImportProps> = ({
	currentData,
	onDataImport,
}) => {
	const [isImporting, setIsImporting] = React.useState(false);
	const [parseResult, setParseResult] =
		React.useState<JsonEventsParseResult | null>(null);

	// 选中的有效事件
	const [selectedValidEvents, setSelectedValidEvents] = React.useState<
		Set<string>
	>(new Set());
	// 是否显示无效事件
	const [showInvalidEvents, setShowInvalidEvents] = React.useState(true);

	// 获取所有有效事件的ID
	const allValidEventIds = React.useMemo(() => {
		if (!parseResult) return [];
		return parseResult.validEvents.map(
			(event) => event.id || `${event.eventType}-${event.text}`
		);
	}, [parseResult]);

	// 当解析结果变化时，默认选择所有有效事件
	React.useEffect(() => {
		if (parseResult) {
			setSelectedValidEvents(new Set(allValidEventIds));
		}
	}, [parseResult, allValidEventIds]);

	const handleFileChange = async (
		etc: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = etc.target.files?.[0] || null;
		if (!file) return;

		setIsImporting(true);
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;

				switch (file.type) {
					case "application/json": {
						const result = JsonService.parseJsonEvents(
							JSON.parse(content) as ImportJsonEvents,
							currentData
						);
						setParseResult(result);
						break;
					}
					default:
						throw new Error(
							`Unsupported import file type: ${file.type}`
						);
				}
			} catch (error) {
				throw new Error(
					`文件解析失败: ${
						error instanceof Error ? error.message : String(error)
					}`
				);
			} finally {
				setIsImporting(false);
				// 清空文件选择
				etc.target.value = "";
			}
		};

		reader.readAsText(file);
	};

	const handlePasteJson = (jsonContent: string) => {
		setIsImporting(true);
		try {
			const result = JsonService.parseJsonEvents(
				JSON.parse(jsonContent) as ImportJsonEvents,
				currentData
			);
			setParseResult(result);
		} catch (error) {
			throw new Error(
				`JSON 解析失败: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		} finally {
			setIsImporting(false);
		}
	};

	const handleImport = async () => {
		if (!parseResult || selectedValidEvents.size === 0) return;

		setIsImporting(true);
		try {
			const eventsToImport = parseResult.validEvents.filter((event) =>
				selectedValidEvents.has(
					event.id || `${event.eventType}-${event.text}`
				)
			);

			for (const event of eventsToImport) {
				const eventData = JsonService.createEventFromParsed(event);
				const eventType = event.eventType;

				await onDataImport(
					eventData,
					eventType
				);
			}

			// 导入成功后清除解析结果
			new Notice(
				t("view.dataPortView.import.type.json.success", {
					count: eventsToImport.length,
				})
			);

			setParseResult(null);
			setSelectedValidEvents(new Set());
		} catch (error) {
			throw new Error(
				`导入事件失败: ${
					error instanceof Error ? error.message : String(error)
				}`
			);
		} finally {
			setIsImporting(false);
		}
	};

	// 检查是否全选
	const isAllSelected =
		selectedValidEvents.size === allValidEventIds.length &&
		allValidEventIds.length > 0;

	// 全选/取消全选
	const handleSelectAll = () => {
		if (isAllSelected) {
			setSelectedValidEvents(new Set());
		} else {
			setSelectedValidEvents(new Set(allValidEventIds));
		}
	};

	// 按事件类型分组
	const eventGroups = React.useMemo(() => {
		if (!parseResult) return { holiday: [], birthday: [], customEvent: [], basesEvent: [], dailyNoteEvent: [] };

		const groups: Record<EventType, JsonEventParse[]> = {
			holiday: [],
			birthday: [],
			customEvent: [],
			// bases events are tied to notes and don't need to be imported through data port
			basesEvent: [],
			// daily note events are tied to daily notes and don't need to be imported through data port
			dailyNoteEvent: [],
		};

		parseResult.validEvents.forEach((event) => {
			groups[event.eventType].push(event);
		});

		// 按文本排序
		Object.keys(groups).forEach((type) => {
			groups[type as EventType].sort((a, b) =>
				a.text.localeCompare(b.text)
			);
		});

		return groups;
	}, [parseResult]);

	// 选择/取消选择某个分组的所有事件
	const handleGroupSelection = (type: EventType) => {
		const groupEventIds = eventGroups[type].map(
			(event) => event.id || `${event.eventType}-${event.text}`
		);
		const newSelected = new Set(selectedValidEvents);

		// 检查该分组是否有任何已选择的事件
		const hasSelectedInGroup = groupEventIds.some((id) =>
			selectedValidEvents.has(id)
		);

		if (hasSelectedInGroup) {
			// 如果分组内有已选择的事件，则取消选择该分组的所有事件
			groupEventIds.forEach((id) => newSelected.delete(id));
		} else {
			// 如果分组内没有已选择的事件，则选择该分组的所有事件
			groupEventIds.forEach((id) => newSelected.add(id));
		}

		setSelectedValidEvents(newSelected);
	};

	// 切换单个事件的选择状态
	const handleEventSelection = (eventId: string) => {
		const newSelected = new Set(selectedValidEvents);
		if (selectedValidEvents.has(eventId)) {
			newSelected.delete(eventId);
		} else {
			newSelected.add(eventId);
		}
		setSelectedValidEvents(newSelected);
	};

	// 检查某个分组是否全选
	const isGroupSelected = (type: EventType) => {
		const groupEventIds = eventGroups[type].map(
			(event) => event.id || `${event.eventType}-${event.text}`
		);
		return (
			groupEventIds.length > 0 &&
			groupEventIds.every((id) => selectedValidEvents.has(id))
		);
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
	const formatEventDate = (event: JsonEventParse) => {
		const userInput = event.userInput?.input;
		return (
			<div className="event-date">
				<Calendar size={12} />
				{userInput}
			</div>
		);
	};

	const ImportPreview = () => {
		if (!parseResult) return null;

		const hasValidEvents = parseResult.validEvents.length > 0;
		const hasInvalidEvents = parseResult.invalidEvents.length > 0;

		return (
			<div className="import-preview">
				{/* 导入操作区域 */}
				<div className="import-actions">
					<div className="import-actions-header">
						<div className="import-summary">
							<span>
								{t(
									"view.dataPortView.import.actions.parseSummary",
									{
										validCount:
											parseResult.validEvents.length,
										invalidCount:
											parseResult.invalidEvents.length,
									}
								)}
							</span>
						</div>
						<div className="import-action-buttons">
							<Button
								variant="secondary"
								onClick={() => setParseResult(null)}
							>
								{t("view.dataPortView.import.actions.reset")}
							</Button>
							<Button
								variant="primary"
								onClick={() => {
									void handleImport();
								}}
								disabled={
									isImporting ||
									selectedValidEvents.size === 0
								}
								icon={<Upload size={16} />}
							>
								{t("view.dataPortView.import.actions.handle")}
							</Button>
						</div>
					</div>
				</div>

				{hasValidEvents && (
					<>
						{/* 选择控制区域 */}
						<div className="import-selection-controls">
							<div className="selection-info">
								<span>
									{t(
										"view.dataPortView.common.actions.selectSummary",
										{
											count: `${selectedValidEvents.size} / ${allValidEventIds.length}`,
										}
									)}
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
										? t(
												"view.dataPortView.common.actions.reverseAll"
										  )
										: t(
												"view.dataPortView.common.actions.selectAll"
										  )}
								</Button>

								{/* 分类选择控制 */}
								{(Object.keys(eventGroups) as EventType[]).map(
									(type) => {
										const events = eventGroups[type];
										if (events.length === 0) return null;

										const groupInfo = getGroupInfo(type);
										const groupSelected =
											isGroupSelected(type);
										const groupEventIds = eventGroups[
											type
										].map(
											(event) =>
												event.id ||
												`${event.eventType}-${event.text}`
										);
										const hasSelectedInGroup =
											groupEventIds.some((id) =>
												selectedValidEvents.has(id)
											);

										return (
											<Button
												key={type}
												variant="secondary"
												size="small"
												icon={
													groupSelected ? (
														<CheckSquare
															size={16}
														/>
													) : (
														<Square size={16} />
													)
												}
												onClick={() =>
													handleGroupSelection(type)
												}
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
									}
								)}
							</div>
						</div>

						{/* 有效事件分组列表 */}
						<div className="import-event-groups">
							{(Object.keys(eventGroups) as EventType[]).map(
								(type) => {
									const events = eventGroups[type];
									if (events.length === 0) return null;

									const groupInfo = getGroupInfo(type);

									return (
										<div
											key={type}
											className="import-event-group"
										>
											<div className="import-group-header">
												<div className="group-title">
													{groupInfo.icon}
													<span>
														{groupInfo.title}
													</span>
													<span className="group-count">
														{events.length}
													</span>
												</div>
												<div className="group-actions">
													<Button
														variant="secondary"
														size="small"
														icon={
															isGroupSelected(
																type
															) ? (
																<CheckSquare
																	size={16}
																/>
															) : (
																<Square
																	size={16}
																/>
															)
														}
														onClick={() =>
															handleGroupSelection(
																type
															)
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
											<div className="import-event-list">
												{events.map((event) => {
													const eventId =
														event.id ||
														`${event.eventType}-${event.text}`;
													const isSelected =
														selectedValidEvents.has(
															eventId
														);
													return (
														<div
															key={eventId}
															className={`import-event-item ${
																isSelected
																	? "selected"
																	: ""
															}`}
															onClick={() =>
																handleEventSelection(
																	eventId
																)
															}
														>
															<div
																className={`event-checkbox ${
																	isSelected
																		? "checked"
																		: ""
																}`}
															/>
															<div className="event-info">
																<div className="event-title">
																	{event.emoji ||
																		EVENT_TYPE_DEFAULT[
																			type
																		]
																			.emoji}{" "}
																	{event.text}
																</div>
																<div className="event-details">
																	{formatEventDate(
																		event
																	)}
																</div>
															</div>
														</div>
													);
												})}
											</div>
										</div>
									);
								}
							)}
						</div>
					</>
				)}

				{/* 无效事件区域 */}
				{hasInvalidEvents && (
					<div className="import-invalid-events">
						<div
							className="invalid-events-header"
							onClick={() =>
								setShowInvalidEvents(!showInvalidEvents)
							}
						>
							<div className="invalid-events-title">
								<AlertTriangle
									size={16}
									className="warning-icon"
								/>
								<span>
									{t(
										"view.dataPortView.import.warn.invalidEvents"
									)}
									({parseResult.invalidEvents.length})
								</span>
							</div>
							<div className="toggle-icon">
								{showInvalidEvents ? (
									<ChevronUp size={16} />
								) : (
									<ChevronDown size={16} />
								)}
							</div>
						</div>
						{showInvalidEvents && (
							<div className="invalid-event-list">
								{parseResult.invalidEvents.map(
									(event, index) => (
										<div
											key={index}
											className="invalid-event-item"
										>
											<div className="event-info">
												<div className="event-title">
													{event.emoji ||
														EVENT_TYPE_DEFAULT[
															event.eventType
														].emoji}{" "}
													{event.text}
												</div>
												<div className="event-warnings">
													{event.warnings?.map(
														(warning, wIndex) => (
															<div
																key={wIndex}
																className="warning-text"
															>
																• {warning}
															</div>
														)
													)}
												</div>
											</div>
										</div>
									)
								)}
							</div>
						)}
					</div>
				)}

				{!hasValidEvents && !hasInvalidEvents && (
					<div className="import-empty-state">
						<div className="empty-icon">📁</div>
						<div className="empty-text">
							{t("view.dataPortView.import.empty.text")}
						</div>
						<div className="empty-subtext">
							{t("view.dataPortView.import.empty.subtext")}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="yg-data-import">
			{!parseResult && (
				<div className="import-area">
					<ImportUpload
						title={t("view.dataPortView.import.type.json.title")}
						icon={<FileText size={24} />}
						actions={
							<ImportJson
								onUpload={(e) => { void handleFileChange(e); }}
								onPasteJson={handlePasteJson}
								disabled={isImporting}
							/>
						}
					>
						<CalloutBlock>
							{parse(
								t("view.dataPortView.import.type.json.message")
							)}
							<Pre
								language="json"
								title={t(
									"view.dataPortView.import.type.json.format_example"
								)}
							>
								{JSON_EXAMPLE_CODE}
							</Pre>
						</CalloutBlock>
					</ImportUpload>
				</div>
			)}
			{parseResult && <ImportPreview />}
		</div>
	);
};
