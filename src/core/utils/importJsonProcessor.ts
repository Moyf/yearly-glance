import { t } from "@/src/i18n/i18n";
import {
	ImportJson,
	ImportJsonEvent,
	ImportJsonEventParse,
	ImportJsonEventParseResult,
} from "../interfaces/DataPort";
import { EventType } from "../interfaces/Events";
import { parseUserDateInput } from "./smartDateProcessor";

export class ImportJsonProcessor {
	static parse(importData: ImportJson): ImportJsonEventParseResult {
		const validEvents: ImportJsonEventParse[] = [];
		const invalidEvents: ImportJsonEventParse[] = [];

		if (importData.holidays) {
			this.processEventArray(
				importData.holidays,
				"holiday",
				validEvents,
				invalidEvents
			);
		}
		if (importData.birthdays) {
			this.processEventArray(
				importData.birthdays,
				"birthday",
				validEvents,
				invalidEvents
			);
		}
		if (importData.customEvents) {
			this.processEventArray(
				importData.customEvents,
				"customEvent",
				validEvents,
				invalidEvents
			);
		}

		return {
			validEvents,
			invalidEvents,
		};
	}

	static processEventArray(
		events: ImportJsonEvent[],
		eventType: EventType,
		validEvents: ImportJsonEventParse[],
		invalidEvents: ImportJsonEventParse[]
	) {
		events.forEach((event) => {
			const warnings = this.valid(event);
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
			}
		});
	}

	static valid(event: ImportJsonEvent): string | undefined {
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

		return warnings.length > 0 ? warnings.join("\n") : undefined;
	}

	static createEventFromParsed(parsedEvent: ImportJsonEventParse) {
		const parsedDate = parseUserDateInput(
			parsedEvent.userInput.input,
			parsedEvent.userInput.calendar
		);

		return {
			id: parsedEvent.id,
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
