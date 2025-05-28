import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import {
	BaseEvent,
	Birthday,
	CustomEvent,
	Events,
	EventType,
	Holiday,
} from "@/src/core/interfaces/Events";
import { Notice } from "obsidian";
import { generateUUID } from "@/src/core/utils/uuid";
import { t } from "@/src/i18n/i18n";
import { Lunar, Solar } from "lunar-typescript";

interface ImportHandleProps {
	plugin: YearlyGlancePlugin;
}

interface ImportedEvents {
	holidays?: Holiday[];
	birthdays?: Birthday[];
	customEvents?: CustomEvent[];
}

/**
 * 事件检查
 * -----
 * - 事件必需字段 -
 * id：事件id，要求唯一
 * text：事件名称
 * date：事件时间
 * dateType：事件时间类型，农历或公历
 * -----
 * eventType：事件类型
 * selected：是否被选择导入
 * -----
 * - 数据验证 -
 * valid：事件是否正常构造
 * errorMessage：错误构造的信息
 * fixed：是否有修复字段
 * -----
 */
interface EventCheckStatus {
	validateEvent: Partial<Holiday | Birthday | CustomEvent>;
	eventType: EventType;
	selected: boolean;
	valid: boolean;
	errorMessage?: string;
	fixed: boolean;
}

export const ImportHandle: React.FC<ImportHandleProps> = ({ plugin }) => {
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
	const [importedData, setImportedData] =
		React.useState<ImportedEvents | null>(null);
	const [eventChecks, setEventChecks] = React.useState<EventCheckStatus[]>(
		[]
	);
	const [isDragging, setIsDragging] = React.useState(false);

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// 验证数据
	React.useEffect(() => {
		if (importedData) {
			validateImportedData(importedData);
		}
	}, [importedData]);

	const resetFileInput = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// 读取文件数据
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setSelectedFile(file);
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const jsonData = JSON.parse(
					e.target?.result as string
				) as ImportedEvents;
				setImportedData(jsonData);
			} catch (error) {
				new Notice("导入出错，请检查文件内容是否为json格式");
				setSelectedFile(null);
				setImportedData(null);
				setEventChecks([]);
			}
		};

		reader.onerror = () => {
			new Notice("读取文件时出错，请重试。");
			setSelectedFile(null);
			setImportedData(null);
			setEventChecks([]);
		};

		reader.readAsText(file);
	};

	// 拖拽三件套
	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};
	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const file = e.dataTransfer.files?.[0];
		if (file && file.type === "application/json") {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const jsonData = JSON.parse(
						e.target?.result as string
					) as ImportedEvents;
					setImportedData(jsonData);
				} catch (error) {
					new Notice("导入出错，请检查文件内容是否为json格式");
					setSelectedFile(null);
					setImportedData(null);
					setEventChecks([]);
				}
			};
			reader.onerror = () => {
				new Notice("读取文件时出错，请重试。");
				setSelectedFile(null);
				setImportedData(null);
				setEventChecks([]);
			};
			reader.readAsText(file);
		} else {
			new Notice("请选择JSON格式的文件");
		}
	};

	const validateImportedData = (data: ImportedEvents) => {
		const checks: EventCheckStatus[] = [];

		// 验证节日
		if (data.holidays && data.holidays.length > 0) {
			data.holidays.forEach((holiday) => {
				const validationResult = validateEvent(holiday, "holiday");
				checks.push({
					validateEvent: validationResult.fixedEvent as Holiday,
					eventType: "holiday",
					selected: validationResult.valid,
					valid: validationResult.valid,
					errorMessage: validationResult.errorMessage,
					fixed: validationResult.fixed,
				});
			});
		}

		// 验证生日
		if (data.birthdays && data.birthdays.length > 0) {
			data.birthdays.forEach((birthday) => {
				const validationResult = validateEvent(birthday, "birthday");
				checks.push({
					validateEvent: validationResult.fixedEvent as Birthday,
					eventType: "birthday",
					selected: validationResult.valid,
					valid: validationResult.valid,
					errorMessage: validationResult.errorMessage,
					fixed: validationResult.fixed,
				});
			});
		}

		// 验证自定义事件
		if (data.customEvents && data.customEvents.length > 0) {
			data.customEvents.forEach((customEvent) => {
				const validationResult = validateEvent(
					customEvent,
					"customEvent"
				);
				checks.push({
					validateEvent: validationResult.fixedEvent as CustomEvent,
					eventType: "customEvent",
					selected: validationResult.valid,
					valid: validationResult.valid,
					errorMessage: validationResult.errorMessage,
					fixed: validationResult.fixed,
				});
			});
		}

		setEventChecks(checks);
	};

	// 验证事件构造
	const validateEvent = (
		event: Partial<Holiday | Birthday | CustomEvent>,
		eventType: EventType
	): {
		valid: boolean;
		errorMessage: string;
		fixed: boolean;
		fixedEvent: Partial<Holiday | Birthday | CustomEvent>;
	} => {
		let valid = true;
		let errorMessage = "";
		let fixed = false;
		const fixedEvent = { ...event };

		// 无值处理
		if (!event.id) {
			fixed = true;
			fixedEvent.id = plugin.generateEventId(eventType);
			errorMessage += `未设置事件ID, 已自动生成${fixedEvent.id}|`;
		}

		if (!event.text) {
			valid = false;
			fixed = true;
			fixedEvent.text = generateUUID({ prefix: "未命名" });
			errorMessage += `未设置事件名称, 坚持导入将使用${fixedEvent.text}|`;
		}

		if (!event.dateType) {
			valid = false;
			fixed = true;
			fixedEvent.dateType = "SOLAR";
			errorMessage += `未设置事件日期类型, 坚持导入将使用${fixedEvent.dateType}|`;
		}

		if (!event.date) {
			valid = false;
			fixed = true;
			if (event.dateType === "SOLAR") {
				const today = Solar.fromDate(new Date());
				fixedEvent.date = `${today.getYear()},${today.getMonth()},${today.getDay()}`;
			} else {
				const today = Lunar.fromDate(new Date());
				fixedEvent.date = `${today.getYear()},${today.getMonth()},${today.getDay()}`;
			}
			errorMessage += `未设置事件日期, 坚持导入将使用${fixedEvent.dateType} ${fixedEvent.date}|`;
		}

		if (eventType === "holiday") {
			if (!(event as Holiday).type) {
				fixed = true;
				(fixedEvent as Holiday).type = "CUSTOM";
				errorMessage += `未设置节日类型, 坚持导入将使用${
					(fixedEvent as Holiday).type
				}|`;
			}
			if (!(event as Holiday).isHidden) {
				fixed = true;
				(fixedEvent as Holiday).isHidden = false;
				errorMessage += `未设置节日是否隐藏, 坚持导入将使用${
					(fixedEvent as Holiday).isHidden
				}|`;
			}
		}

		if (eventType === "customEvent" && !(event as CustomEvent).isRepeat) {
			fixed = true;
			(fixedEvent as CustomEvent).isRepeat = false;
			errorMessage += `未设置自定义事件是否重复, 坚持导入将使用${
				(fixedEvent as CustomEvent).isRepeat
			}|`;
		}

		// TODO: 重复事件检查

		// TODO: 事件日期构造有效性检查

		return {
			valid,
			errorMessage,
			fixed,
			fixedEvent,
		};
	};

	// 切换事件选择状态
	const toggleEventSelection = (id: string) => {
		setEventChecks((prev) =>
			prev.map((event) =>
				event.id === id
					? { ...event, selected: !event.selected }
					: event
			)
		);
	};

	// 全选/反选
	const toggleAllEvents = (selected: boolean) => {
		setEventChecks((prev) =>
			prev.map((event) => ({
				...event,
				selected: event.valid || event.fixed ? selected : false,
			}))
		);
	};

	// 导入
	const handleImport = async () => {
		if (!importedData) return;

		// 筛选用户选择的事件
		const selectedEvents: Events = {
			holidays: [],
			birthdays: [],
			customEvents: [],
		};

		// 收集选中的事件
		for (const check of eventChecks) {
			if (check.selected) {
				switch (check.eventType) {
					case "holiday":
						selectedEvents.holidays = [
							...selectedEvents.holidays,
							check.validateEvent as Holiday,
						];
						break;
					case "birthday":
						selectedEvents.birthdays = [
							...selectedEvents.birthdays,
							check.validateEvent as Birthday,
						];
						break;
					case "customEvent":
						selectedEvents.customEvents = [
							...selectedEvents.customEvents,
							check.validateEvent as CustomEvent,
						];
						break;
					default:
						break;
				}
			}
		}

		console.debug(selectedEvents);

		const events = plugin.getData();
		const newEvents = { ...events };

		if (selectedEvents.holidays.length > 0) {
			newEvents.holidays = [
				...newEvents.holidays,
				...selectedEvents.holidays,
			];
		}
		if (selectedEvents.birthdays.length > 0) {
			newEvents.birthdays = [
				...newEvents.birthdays,
				...selectedEvents.birthdays,
			];
		}
		if (selectedEvents.customEvents.length > 0) {
			newEvents.customEvents = [
				...newEvents.customEvents,
				...selectedEvents.customEvents,
			];
		}

		await plugin.updateData(newEvents);
	};

	return (
		<div className="yg-ie-handle">
			<h3 className="yg-ie-handle-title">
				{t("view.importExportManager.import.title")}
			</h3>

			<div className="yg-import-handle">
				<div
					className="yg-upload-section"
					onClick={() => fileInputRef.current?.click()}
					onDragEnter={handleDragEnter}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<div className="yg-file-input">
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							onChange={handleFileChange}
							onClick={resetFileInput}
						/>
						<div className="yg-upload-content">
							{selectedFile && (
								<span className="yg-upload-file-name">
									{selectedFile.name}
								</span>
							)}
							<span className="yg-upload-file-placeholder">
								{isDragging
									? "松开鼠标导入文件"
									: "点击或拖拽文件到此处"}
							</span>
						</div>
					</div>
				</div>

				<div className="yg-import-select-section">
					<div className="yg-import-stats">
						<span>
							找到 {eventChecks.length} 个事件，其中{" "}
							{eventChecks.filter((check) => check.valid).length}{" "}
							个有效
						</span>
					</div>

					<div className="yg-import-controls">
						<button onClick={() => toggleAllEvents(true)}>
							全选
						</button>
						<button onClick={() => toggleAllEvents(false)}>
							反选
						</button>
						<button
							className="mod-cta"
							onClick={handleImport}
							disabled={
								eventChecks.filter((e) => e.selected && e.valid)
									.length === 0
							}
						>
							导入
						</button>
					</div>

					<div className="yg-import-event-list">
						{eventChecks.map((event) => (
							<div
								key={event.id}
								className={`yg-import-event-item ${
									!event.valid
										? "yg-import-invalid-event"
										: ""
								}`}
							>
								<label className="yg-import-checkbox">
									<input
										type="checkbox"
										checked={event.selected}
										onChange={() =>
											toggleEventSelection(event.id)
										}
										disabled={!(event.valid || event.fixed)}
									/>
									<div className="yg-import-event-info">
										<span className="yg-import-event-name">
											{event.validateEvent.text} (
											{event.validateEvent.type})
										</span>
										<span className="yg-import-event-date">
											{event.validateEvent.dateType}:{" "}
											{event.validateEvent.date}
										</span>
										{event.fixed && (
											<span className="yg-import-event-error">
												{event.errorMessage
													.split("|")
													.filter((msg) => msg.trim())
													.map((msg, index) => (
														<div
															key={index}
															className="yg-error-item"
														>
															• {msg}
														</div>
													))}
											</span>
										)}
									</div>
								</label>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
