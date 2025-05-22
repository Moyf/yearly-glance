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

interface EventCheckStatus {
	id: string;
	text: string;
	dateType: "SOLAR" | "LUNAR";
	date: string;
	type: EventType;
	selected: boolean;
	valid: boolean;
	errorMessage?: string;
	fixed: boolean;
	fixedId?: string;
	fixedText?: string;
	fixedDate?: string;
	fixedDateType?: "SOLAR" | "LUNAR";
}

export const ImportHandle: React.FC<ImportHandleProps> = ({ plugin }) => {
	const [importedData, setImportedData] =
		React.useState<ImportedEvents | null>(null);
	const [eventChecks, setEventChecks] = React.useState<EventCheckStatus[]>(
		[]
	);

	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// 读取文件数据
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const jsonData = JSON.parse(
					e.target?.result as string
				) as ImportedEvents;
				console.debug(jsonData);
				setImportedData(jsonData);
			} catch (error) {
				new Notice("导入出错，请检查文件内容是否为json格式");
			}
		};

		reader.onerror = () => {
			new Notice("读取文件时出错，请重试。");
		};

		reader.readAsText(file);
	};

	// 验证数据
	React.useEffect(() => {
		if (importedData) {
			validateImportedData(importedData);
		}
	}, [importedData]);

	const validateImportedData = (data: ImportedEvents) => {
		const checks: EventCheckStatus[] = [];

		// 验证节日
		if (data.holidays && data.holidays.length > 0) {
			data.holidays.forEach((holiday) => {
				const validationResult = validateEvent(holiday, "holiday");
				checks.push({
					id: holiday.id || validationResult.fixedId,
					text: holiday.text,
					dateType: holiday.dateType,
					date: holiday.date,
					type: "holiday",
					selected: validationResult.valid,
					valid: validationResult.valid,
					errorMessage: validationResult.errorMessage,
					fixed: validationResult.fixed,
					fixedId: validationResult.fixedId,
					fixedText: validationResult.fixedText,
					fixedDate: validationResult.fixedDate,
					fixedDateType: validationResult.fixedDateType,
				});
			});
		}

		// 验证生日
		if (data.birthdays && data.birthdays.length > 0) {
			data.birthdays.forEach((birthday) => {
				const validationResult = validateEvent(birthday, "birthday");
				checks.push({
					id: birthday.id || validationResult.fixedId,
					text: birthday.text,
					dateType: birthday.dateType,
					date: birthday.date,
					type: "birthday",
					selected: validationResult.valid,
					valid: validationResult.valid,
					errorMessage: validationResult.errorMessage,
					fixed: validationResult.fixed,
					fixedId: validationResult.fixedId,
					fixedText: validationResult.fixedText,
					fixedDate: validationResult.fixedDate,
					fixedDateType: validationResult.fixedDateType,
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
					id: customEvent.id || validationResult.fixedId,
					text: customEvent.text,
					dateType: customEvent.dateType,
					date: customEvent.date,
					type: "customEvent",
					selected: validationResult.valid,
					valid: validationResult.valid,
					errorMessage: validationResult.errorMessage,
					fixed: validationResult.fixed,
					fixedId: validationResult.fixedId,
					fixedText: validationResult.fixedText,
					fixedDate: validationResult.fixedDate,
					fixedDateType: validationResult.fixedDateType,
				});
			});
		}

		setEventChecks(checks);
	};

	// 验证事件构造
	const validateEvent = (
		event: Partial<BaseEvent>,
		eventType: EventType
	): {
		valid: boolean;
		errorMessage: string;
		fixed: boolean;
		fixedId: string;
		fixedText: string;
		fixedDate: string;
		fixedDateType: "SOLAR" | "LUNAR";
	} => {
		let valid = true;
		let errorMessage = "";
		let fixed = false;
		let fixedId = "";
		let fixedText = "";
		let fixedDate = "";
		let fixedDateType = "SOLAR";

		// 无值处理
		if (!event.id) {
			valid = true;
			fixed = true;
			fixedId = plugin.generateEventId(eventType);
			errorMessage += `事件ID为空, 已自动生成${fixedId}|`;
		}

		if (!event.text) {
			valid = false;
			fixed = true;
			fixedText = generateUUID({ prefix: "未命名" });
			errorMessage += `事件名称为空, 坚持导入将使用${fixedText}|`;
		}

		if (!event.dateType) {
			valid = false;
			fixed = true;
			fixedDateType = "SOLAR";
			errorMessage += `事件日期类型为空, 坚持导入将使用${fixedDateType}|`;
		}

		if (!event.date) {
			valid = false;
			fixed = true;
			if (event.dateType === "SOLAR") {
				const today = Solar.fromDate(new Date());
				fixedDate = `${today.getYear()},${today.getMonth()},${today.getDay()}`;
			} else {
				const today = Lunar.fromDate(new Date());
				fixedDate = `${today.getYear()},${today.getMonth()},${today.getDay()}`;
			}
			errorMessage += `事件日期为空, 坚持导入将使用${fixedDateType} ${fixedDate}|`;
		}

		// TODO:日期构造错误处理

		return {
			valid,
			errorMessage,
			fixed,
			fixedId,
			fixedText,
			fixedDate,
			fixedDateType: fixedDateType as "SOLAR" | "LUNAR",
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
	const handleImport = () => {
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
				// 创建基本事件对象，应用修复数据（如果有）
				const baseEvent: BaseEvent = {
					id: check.fixed && check.fixedId ? check.fixedId : check.id,
					text:
						check.fixed && check.fixedText
							? check.fixedText
							: check.text,
					dateType:
						check.fixed && check.fixedDateType
							? check.fixedDateType
							: check.dateType,
					date:
						check.fixed && check.fixedDate
							? check.fixedDate
							: check.date,
				};

				// 根据类型添加到不同的集合
				switch (check.type) {
					case "holiday": {
						const holiday: Holiday = (() => {
							if (
								importedData.holidays &&
								importedData.holidays.length > 0
							) {
								const foundHoliday = importedData.holidays.find(
									(h) => h.id === check.id
								);
								if (foundHoliday) {
									return { ...foundHoliday, ...baseEvent };
								}
							}
							return baseEvent as Holiday;
						})();
						selectedEvents.holidays.push(holiday);
						break;
					}
					case "birthday": {
						const birthday: Birthday = (() => {
							if (
								importedData.birthdays &&
								importedData.birthdays.length > 0
							) {
								const foundBirthday =
									importedData.birthdays.find(
										(b) => b.id === check.id
									);
								if (foundBirthday) {
									return { ...foundBirthday, ...baseEvent };
								}
							}
							return baseEvent as Birthday;
						})();
						selectedEvents.birthdays.push(birthday);
						break;
					}
					case "customEvent": {
						const customEvent: CustomEvent = (() => {
							if (
								importedData.customEvents &&
								importedData.customEvents.length > 0
							) {
								const foundCustomEvent =
									importedData.customEvents.find(
										(c) => c.id === check.id
									);
								if (foundCustomEvent) {
									return {
										...foundCustomEvent,
										...baseEvent,
									};
								}
							}
							return baseEvent as CustomEvent;
						})();
						selectedEvents.customEvents.push(customEvent);
						break;
					}
					default:
						break;
				}
			}
		}

		console.debug(selectedEvents);
	};

	return (
		<div className="yg-ie-handle">
			<h3 className="yg-ie-handle-title">
				{t("view.importExportManager.import.title")}
			</h3>

			<div className="yg-import-handle">
				<div className="yg-upload-section">
					<div className="yg-file-input">
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							onChange={handleFileChange}
						/>
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
											{event.text} ({event.type})
										</span>
										<span className="yg-import-event-date">
											{event.dateType}: {event.date}
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
