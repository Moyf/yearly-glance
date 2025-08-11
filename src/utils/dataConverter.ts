import { EVENT_TYPE_DEFAULT, Events } from "@/src/type/Events";
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";
import { ImportJson, ImportJsonEventParseResult } from "@/src/type/DataPort";
import { ImportJsonProcessor } from "./importJsonProcessor";

export class DataConverter {
	/**
	 * 导出为 JSON
	 * @param data 事件数据
	 * @returns JSON
	 */
	static toJSON(data: Events): string {
		return JSON.stringify(data, null, 2);
	}

	/**
	 * 导出为 ICS
	 * @param data 事件数据
	 * @returns ICS
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
	 * 导出为 Markdown
	 * @param data 事件数据
	 * @returns Markdown
	 */
	static toMarkdown(data: Events): string {
		return "";
	}

	/**
	 * 从 JSON 导入数据
	 */
	static fromJSON(content: string): ImportJsonEventParseResult {
		const jsonString = JSON.parse(content) as ImportJson;
		if (
			!jsonString.holidays &&
			!jsonString.birthdays &&
			!jsonString.customEvents
		) {
			throw new Error(
				"导入数据中没有找到任何事件，请检查 JSON 格式是否正确。"
			);
		}

		return ImportJsonProcessor.parse(jsonString);
	}
}
