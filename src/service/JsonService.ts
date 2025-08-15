import { t } from "@/src/i18n/i18n";
import {
	CustomEvent,
	EventData,
	Events,
	EventType,
	Holiday,
} from "@/src/type/Events";
import { parseUserDateInput } from "./DateParseService";
import {
	ImportJsonEvents,
	JsonEvent,
	JsonEventParse,
	JsonEventsParseResult,
} from "@/src/type/DataPort";
import { validEventId } from "../utils/uniqueEventId";

export class JsonService {
	static validJsonStructure(jsonString: string): {
		success: boolean;
		error?: string;
	} {
		try {
			JSON.parse(jsonString);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	static stringify(jsonObject: string): string {
		try {
			const jsonString = JSON.stringify(jsonObject, null, 2);
			return jsonString;
		} catch (error) {
			return "{}"; // 返回空对象字符串以避免错误
		}
	}

	static createJsonEvents(eventsData: Events): string {
		const jsonData: ImportJsonEvents = {
			holidays: eventsData.holidays?.map((h) =>
				this.converterToJsonEvent(h)
			),
			birthdays: eventsData.birthdays?.map((b) =>
				this.converterToJsonEvent(b)
			),
			customEvents: eventsData.customEvents?.map((c) =>
				this.converterToJsonEvent(c)
			),
		};

		return JsonService.stringify(jsonData as string);
	}

	private static converterToJsonEvent(event: EventData): JsonEvent {
		return {
			id: event.id,
			text: event.text,
			userInput: {
				input: event.eventDate.isoDate,
				calendar: event.eventDate.calendar,
			},
			emoji: event.emoji,
			color: event.color,
			remark: event.remark,
			isHidden: event.isHidden,
			// Holiday 和 CustomEvent 的两个独特字段
			foundDate: (event as Holiday).foundDate,
			isRepeat: (event as CustomEvent).isRepeat,
		};
	}

	static parseJsonEvents(
		importData: ImportJsonEvents,
		currentData?: Events
	): JsonEventsParseResult {
		const validEvents: JsonEventParse[] = [];
		const invalidEvents: JsonEventParse[] = [];

		// 收集所有现有的事件信息，用于重复检测
		const existingEvents: {
			id?: string;
			text: string;
			userInput: { input: string; calendar: string };
		}[] = [];

		if (currentData) {
			currentData.holidays?.forEach((event) => {
				existingEvents.push({
					id: event.id,
					text: event.text,
					userInput: {
						input:
							event.eventDate.userInput?.input ||
							event.eventDate.isoDate,
						calendar:
							event.eventDate.userInput?.calendar ||
							event.eventDate.calendar,
					},
				});
			});
			currentData.birthdays?.forEach((event) => {
				existingEvents.push({
					id: event.id,
					text: event.text,
					userInput: {
						input:
							event.eventDate.userInput?.input ||
							event.eventDate.isoDate,
						calendar:
							event.eventDate.userInput?.calendar ||
							event.eventDate.calendar,
					},
				});
			});
			currentData.customEvents?.forEach((event) => {
				existingEvents.push({
					id: event.id,
					text: event.text,
					userInput: {
						input:
							event.eventDate.userInput?.input ||
							event.eventDate.isoDate,
						calendar:
							event.eventDate.userInput?.calendar ||
							event.eventDate.calendar,
					},
				});
			});
		}

		if (importData.holidays) {
			this.parseEventsProcess(
				importData.holidays,
				"holiday",
				validEvents,
				invalidEvents,
				existingEvents
			);
		}
		if (importData.birthdays) {
			this.parseEventsProcess(
				importData.birthdays,
				"birthday",
				validEvents,
				invalidEvents,
				existingEvents
			);
		}
		if (importData.customEvents) {
			this.parseEventsProcess(
				importData.customEvents,
				"customEvent",
				validEvents,
				invalidEvents,
				existingEvents
			);
		}

		return {
			validEvents,
			invalidEvents,
		};
	}

	private static parseEventsProcess(
		events: JsonEvent[],
		eventType: EventType,
		validEvents: JsonEventParse[],
		invalidEvents: JsonEventParse[],
		existingEvents: {
			id?: string;
			text: string;
			userInput: { input: string; calendar: string };
		}[]
	) {
		events.forEach((event) => {
			const warnings = this.validEventJsonStructure(
				event,
				existingEvents
			);
			if (warnings) {
				invalidEvents.push({
					...event,
					eventType,
					warnings: warnings.split("\n"),
				});
			} else {
				validEvents.push({
					...event,
					eventType,
				});
				// 将新的有效事件添加到现有事件数组中，防止同一批次内的重复
				existingEvents.push({
					id: event.id,
					text: event.text,
					userInput: {
						input: event.userInput.input,
						calendar:
							event.userInput.calendar?.toUpperCase() ||
							"GREGORIAN",
					},
				});
			}
		});
	}

	private static validEventJsonStructure(
		event: JsonEvent,
		existingEvents: {
			id?: string;
			text: string;
			userInput: { input: string; calendar: string };
		}[]
	): string | undefined {
		const warnings: string[] = [];

		// 检查必需字段
		if (!event.text || event.text.trim() === "") {
			warnings.push(t("view.dataPortView.import.warn.nullText"));
		}

		if (
			!event.userInput ||
			!event.userInput.input ||
			event.userInput.input.trim() === ""
		) {
			warnings.push(t("view.dataPortView.import.warn.nullDate"));
		}

		// 检查重复事件
		if (this.detectDuplicateEvent(event, existingEvents)) {
			warnings.push(t("view.dataPortView.import.warn.duplicateEvent"));
		}

		return warnings.length > 0 ? warnings.join("\n") : undefined;
	}

	private static detectDuplicateEvent(
		event: JsonEvent,
		existingEvents: {
			id?: string;
			text: string;
			userInput: { input: string; calendar: string };
		}[]
	): boolean {
		// 规则 1: 如果事件有ID，优先检查ID是否重复
		if (event.id) {
			return existingEvents.some((existing) => existing.id === event.id);
		}

		// 规则 2: 检查是否有相同的事件名称和日期
		if (event.text && event.userInput?.input) {
			const eventText = event.text.trim().toLowerCase();
			const eventDate = event.userInput.input.trim();
			const eventCalendar =
				event.userInput.calendar?.toUpperCase() || "GREGORIAN";

			return existingEvents.some((existing) => {
				const existingText = existing.text.trim().toLowerCase();
				const existingDate = existing.userInput.input.trim();
				const existingCalendar =
					existing.userInput.calendar?.toUpperCase() || "GREGORIAN";

				// 检查文本和日期是否完全相同
				return (
					existingText === eventText &&
					existingDate === eventDate &&
					existingCalendar === eventCalendar
				);
			});
		}

		return false;
	}

	static createEventFromParsed(parsedEvent: JsonEventParse) {
		const parsedDate = parseUserDateInput(
			parsedEvent.userInput.input,
			parsedEvent.userInput.calendar
		);

		return {
			id: validEventId(parsedEvent.eventType, parsedEvent.id),
			text: parsedEvent.text,
			eventDate: {
				...parsedDate,
				userInput: parsedEvent.userInput,
			},
			emoji: parsedEvent.emoji,
			color: parsedEvent.color,
			remark: parsedEvent.remark,
			isHidden: parsedEvent.isHidden,
			// Holiday 和 CustomEvent 的两个独特字段
			foundDate: parsedEvent.foundDate,
			isRepeat: parsedEvent.isRepeat,
		};
	}
}
