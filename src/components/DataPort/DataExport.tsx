import { ExportFormat } from "@/src/core/interfaces/DataPort";
import {
	BaseEvent,
	EVENT_TYPE_DEFAULT,
	Events,
	EventType,
} from "@/src/core/interfaces/Events";
import { DataConverter } from "@/src/core/utils/dataConverter";
import * as React from "react";
import { Button } from "../Base/Button";
import { NavTabs } from "../Base/NavTabs";
import { Input } from "../Base/Input";
import {
	Calendar,
	CheckSquare,
	ChevronLeft,
	ChevronRight,
	Download,
	FileText,
	Sparkles,
	Square,
	Users,
} from "lucide-react";
import "./style/DataExport.css";
import { YearlyGlanceSettings } from "@/src/core/interfaces/Settings";

interface DataExportProps {
	config: YearlyGlanceSettings;
	currentData: Events;
	onConfigUpdate: (config: Partial<YearlyGlanceSettings>) => Promise<void>;
}

interface EventWithType extends BaseEvent {
	type: EventType;
}

export const DataExport: React.FC<DataExportProps> = ({
	config,
	currentData,
	onConfigUpdate,
}) => {
	const [isExporting, setIsExporting] = React.useState(false);
	const [selectedEvents, setSelectedEvents] = React.useState<Set<string>>(
		new Set()
	);

	// 导出配置状态
	const [activeExportFormat, setActiveExportFormat] =
		React.useState<ExportFormat>("json");
	const [exportYear, setExportYear] = React.useState(config.year);
	const [exportFileName, setExportFileName] = React.useState("");

	// 保存原始年份以便恢复
	const originalYear = React.useRef(config.year);

	// 组件卸载时恢复原始年份配置
	React.useEffect(() => {
		return () => {
			onConfigUpdate({ year: originalYear.current });
		};
	}, [onConfigUpdate]);

	// 初始化默认文件名
	React.useEffect(() => {
		const today = new Date().toISOString().split("T")[0];
		if (activeExportFormat === "json") {
			setExportFileName(`yearly-glance-events-${today}`);
		} else if (activeExportFormat === "ics") {
			setExportFileName(`yearly-glance-events-${exportYear}`);
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
		};
		return groups;
	}, [currentData, config]);

	// 获取所有事件的ID
	const allEventIds = React.useMemo(() => {
		return Object.values(eventGroups)
			.flat()
			.map((event) => event.id);
	}, [eventGroups]);

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
		onConfigUpdate({ year: newYear });
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
			alert("请选择要导出的事件");
			return;
		}

		setIsExporting(true);
		try {
			const selectedData = getSelectedData();
			let content: string;
			let filename: string;
			let mimeType: string;

			switch (activeExportFormat) {
				case "json": {
					content = DataConverter.toJSON(selectedData);
					filename = `${exportFileName}.json`;
					mimeType = "application/json";
					break;
				}
				case "ics": {
					content = DataConverter.toICS(selectedData);
					filename = `${exportFileName}.ics`;
					mimeType = "text/calendar";
					break;
				}
				default:
					throw new Error(
						`Unsupported export format: ${activeExportFormat}`
					);
			}

			// 创建下载链接
			const blob = new Blob([content], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			alert(`导出失败: ${error.message}`);
		} finally {
			setIsExporting(false);
		}
	};

	// 获取分组显示信息
	const getGroupInfo = (type: EventType) => {
		const config = {
			holiday: {
				title: "节日",
				icon: <Sparkles className="group-icon" />,
			},
			birthday: {
				title: "生日",
				icon: <Users className="group-icon" />,
			},
			customEvent: {
				title: "自定义事件",
				icon: <Calendar className="group-icon" />,
			},
		};
		return config[type];
	};

	// 格式化事件日期显示
	const formatEventDate = (event: EventWithType) => {
		const dateArr = event.dateArr;
		if (!dateArr || dateArr.length === 0) {
			return <div>无日期</div>;
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
					<div className="empty-text">暂无事件数据</div>
					<div className="empty-subtext">
						请先添加一些事件再进行导出操作
					</div>
				</div>
			</div>
		);
	}

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
						onClick={handleExport}
						disabled={isExporting || selectedEvents.size === 0}
						variant="primary"
					>
						导出 {activeExportFormat.toUpperCase()}
					</Button>
				</div>

				{/* 导出配置区域 */}
				<div className="export-config">
					<div className="config-group">
						<label className="config-label">文件名</label>
						<Input
							value={exportFileName}
							onChange={setExportFileName}
							placeholder="请输入文件名"
						/>
					</div>

					{activeExportFormat === "ics" && (
						<div className="config-group">
							<label className="config-label">导出年份</label>
							<div className="year-selector">
								<button
									className="year-control"
									onClick={() => adjustYear(-1)}
									type="button"
								>
									<ChevronLeft size={16} />
								</button>
								<span className="year-display">
									{exportYear}
								</span>
								<button
									className="year-control"
									onClick={() => adjustYear(1)}
									type="button"
								>
									<ChevronRight size={16} />
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* 选择控制区域 */}
			<div className="export-selection-controls">
				<div className="selection-info">
					<span>
						已选择 {selectedEvents.size} / {allEventIds.length}{" "}
						个事件
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
						{isAllSelected ? "反选全部" : "全选"}
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
								{hasSelectedInGroup ? "取消" : "全选"}
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
