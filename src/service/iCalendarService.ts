import { EVENT_TYPE_DEFAULT, Events } from "@/src/type/Events";
import { TranslationKeys } from "../i18n/types";
import { t } from "../i18n/i18n";

export class iCalendarService {
	static createICalEvents(eventsData: Events): string {
		const icsLines = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"PRODID:-//Yearly Glance//EN",
			"CALSCALE:GREGORIAN",
		];

		// 添加所有事件
		const allEvents = [
			...eventsData.holidays.map((h) => ({
				type: "holiday",
				event: h,
			})),
			...eventsData.birthdays.map((b) => ({
				type: "birthday",
				event: b,
			})),
			...eventsData.customEvents.map((c) => ({
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
}
