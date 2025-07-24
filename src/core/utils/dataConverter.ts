import { YearlyGlanceConfig } from "../interfaces/types";
import { CustomEvent, EVENT_TYPE_DEFAULT, Events } from "../interfaces/Events";
import { generateUUID } from "./uuid";
import { parseUserDateInput } from "./smartDateProcessor";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";

export class DataConverter {
	/**
	 * 导出为 JSON 字符串
	 * @param data 事件数据
	 * @returns JSON 字符串
	 */
	static toJSON(data: Events): string {
		return JSON.stringify(data, null, 2);
	}

	/**
	 * 导出为 ICS 字符串
	 * @param data 事件数据
	 * @returns ICS 字符串
	 */
	static toICS(data: Events): string {
		const icsLines = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"PRODID:-//Yearly Glance//EN",
			"CALSCALE:GREGORIAN",
		];

		// 添加所有事件
		const allEvents = [
			...(data.holidays || []).map((h) => ({
				type: "holiday",
				event: h,
			})),
			...(data.birthdays || []).map((b) => ({
				type: "birthday",
				event: b,
			})),
			...(data.customEvents || []).map((c) => ({
				type: "customEvent",
				event: c,
			})),
		];

		allEvents.forEach(({ type, event }) => {
			// 处理日期数组，为每个日期创建一个独立的事件
			const dates = event.dateArr || [];
			if (dates.length === 0) return;

			dates.forEach((dateStr, index) => {
				icsLines.push("BEGIN:VEVENT");

				// 为多个日期的事件生成唯一的UID
				const uid =
					dates.length > 1 ? `${event.id}-${index + 1}` : event.id;
				icsLines.push(`UID:${uid}`);

				icsLines.push(
					`SUMMARY:${t(
						`view.yearlyGlance.legend.${type}` as TranslationKeys
					)}: ${event.text}`
				);

				// 处理当前日期
				const isoDate = dateStr.replace(/-/g, "");
				icsLines.push(`DTSTART;VALUE=DATE:${isoDate}`);

				if (event.remark) {
					icsLines.push(`DESCRIPTION:${event.remark}`);
				}

				icsLines.push(
					`X-APPLE-CALENDAR-COLOR:${
						!event.color
							? EVENT_TYPE_DEFAULT[type].color
							: event.color
					}`
				);

				icsLines.push("END:VEVENT");
			});
		});

		icsLines.push("END:VCALENDAR");
		return icsLines.join("\n");
	}

	/**
	 * 从 JSON 字符串导入数据
	 * @param jsonString JSON 字符串
	 * @returns 解析后的配置对象
	 */
	static async fromJSON(
		jsonString: string
	): Promise<Partial<YearlyGlanceConfig>> {
		try {
			const parsed = JSON.parse(jsonString);

			// 如果是完整的配置对象，直接返回
			if (parsed.config || parsed.data) {
				return this.normalizeImportedData(parsed);
			}

			// 如果只是事件数据，包装在 data 字段中
			if (parsed.holidays || parsed.birthdays || parsed.customEvents) {
				return {
					data: this.normalizeImportedData(parsed),
				};
			}

			throw new Error("无法识别的 JSON 数据格式");
		} catch (error) {
			throw new Error(`JSON 解析失败: ${error.message}`);
		}
	}

	/**
	 * 从 ICS 字符串导入数据
	 * @param icsString ICS 字符串
	 * @returns 解析后的配置对象
	 */
	static async fromICS(
		icsString: string
	): Promise<Partial<YearlyGlanceConfig>> {
		try {
			const events: Events = {
				holidays: [],
				birthdays: [],
				customEvents: [],
			};

			const lines = icsString.split(/\r?\n/);
			let inEvent = false;
			let currentEvent: Record<string, string> = {};

			for (const line of lines) {
				const trimmed = line.trim();

				if (trimmed === "BEGIN:VEVENT") {
					inEvent = true;
					currentEvent = {};
				} else if (trimmed === "END:VEVENT" && inEvent) {
					inEvent = false;
					const event = this.icsEventToEvent(currentEvent);
					if (event) {
						events.customEvents.push(event);
					}
				} else if (inEvent && trimmed.includes(":")) {
					const colonIndex = trimmed.indexOf(":");
					const key = trimmed.substring(0, colonIndex);
					const value = trimmed.substring(colonIndex + 1);
					currentEvent[key] = value;
				}
			}

			return { data: events };
		} catch (error) {
			throw new Error(`ICS 解析失败: ${error.message}`);
		}
	}

	/**
	 * 标准化导入的数据
	 */
	private static normalizeImportedData(data: any): any {
		// 确保所有事件都有 ID
		if (data.holidays) {
			data.holidays.forEach((event: any) => {
				if (!event.id) {
					event.id = `holi-${generateUUID().substring(0, 8)}`;
				}
				this.normalizeEventDate(event);
			});
		}

		if (data.birthdays) {
			data.birthdays.forEach((event: any) => {
				if (!event.id) {
					event.id = `birth-${generateUUID().substring(0, 8)}`;
				}
				this.normalizeEventDate(event);
			});
		}

		if (data.customEvents) {
			data.customEvents.forEach((event: any) => {
				if (!event.id) {
					event.id = `event-${generateUUID().substring(0, 8)}`;
				}
				this.normalizeEventDate(event);
			});
		}

		return data;
	}

	/**
	 * 标准化事件日期格式
	 */
	private static normalizeEventDate(event: any): void {
		// 如果已经是新格式，直接返回
		if (
			event.eventDate &&
			event.eventDate.isoDate &&
			event.eventDate.calendar
		) {
			return;
		}

		// 如果是旧格式，转换为新格式
		if (event.date) {
			try {
				let calendar = "GREGORIAN";
				if (event.dateType === "LUNAR") {
					calendar = event.date.includes("-")
						? "LUNAR_LEAP"
						: "LUNAR";
				}

				const parsed = parseUserDateInput(event.date, calendar as any);
				event.eventDate = {
					...parsed,
					userInput: {
						input: event.date,
						calendar,
					},
				};

				// 删除旧字段
				delete event.date;
				delete event.dateType;
			} catch (error) {
				console.warn(`无法转换日期格式: ${event.date}`, error);
			}
		}
	}

	/**
	 * ICS 事件转换为事件对象
	 */
	private static icsEventToEvent(
		icsEvent: Record<string, string>
	): CustomEvent | null {
		try {
			const summary = icsEvent.SUMMARY || "";
			const description = icsEvent.DESCRIPTION || "";
			const dtstart = icsEvent.DTSTART || icsEvent["DTSTART;VALUE=DATE"];

			if (!summary) return null;

			// 解析日期
			let dateStr = "";
			if (dtstart) {
				// 移除可能的时区信息
				const cleanDate = dtstart.replace(/T.*$/, "");
				if (cleanDate.length === 8) {
					// YYYYMMDD -> YYYY-MM-DD
					dateStr = `${cleanDate.substring(
						0,
						4
					)}-${cleanDate.substring(4, 6)}-${cleanDate.substring(
						6,
						8
					)}`;
				}
			}

			if (!dateStr) return null;

			const eventDate = parseUserDateInput(dateStr, "GREGORIAN");

			return {
				id: icsEvent.UID || generateUUID(),
				text: summary,
				eventDate: {
					...eventDate,
					userInput: {
						input: dateStr,
						calendar: "GREGORIAN",
					},
				},
				remark: description,
				isRepeat: false,
				color: icsEvent["X-APPLE-CALENDAR-COLOR"] || undefined,
			};
		} catch (error) {
			console.warn("ICS 事件解析失败:", error);
			return null;
		}
	}
}
