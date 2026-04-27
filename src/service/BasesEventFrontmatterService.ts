import { App, TFile } from "obsidian";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { BasesEventPropertyConfig } from "@/src/type/BasesTypes";
import { EVENT_TYPE_DEFAULT } from "@/src/type/Events";

/**
 * Syncs a Bases event to its corresponding note's frontmatter.
 * Callers are responsible for: file path resolution, remark pre-processing, and bus publishing.
 */
export async function syncEventToFrontmatter(
	app: App,
	file: TFile,
	event: CalendarEvent,
	propConfig: BasesEventPropertyConfig
): Promise<void> {
	const eventDate = event.eventDate?.isoDate;
	if (!eventDate) {
		console.warn("[YearlyGlance] syncEventToFrontmatter: event has no date", event.id);
		return;
	}

	await app.fileManager.processFrontMatter(file, (fm) => {
		fm[propConfig.titleProp] = event.text;
		fm[propConfig.dateProp] = eventDate;

		if (event.duration && event.duration > 1) {
			fm[propConfig.durationProp] = event.duration;
		} else if (fm[propConfig.durationProp]) {
			delete fm[propConfig.durationProp];
		}

		if (event.emoji && event.emoji !== EVENT_TYPE_DEFAULT.basesEvent.emoji) {
			fm[propConfig.iconProp] = event.emoji;
		} else if (fm[propConfig.iconProp]) {
			delete fm[propConfig.iconProp];
		}

		if (event.color && event.color !== EVENT_TYPE_DEFAULT.basesEvent.color) {
			fm[propConfig.colorProp] = event.color;
		} else if (fm[propConfig.colorProp]) {
			delete fm[propConfig.colorProp];
		}

		if (event.remark && typeof event.remark === "string" && event.remark.length > 0) {
			fm[propConfig.descriptionProp] = event.remark;
		} else if (fm[propConfig.descriptionProp]) {
			delete fm[propConfig.descriptionProp];
		}
	});
}

/**
 * Builds a BasesEventPropertyConfig from plugin config fields with fallbacks.
 */
export function buildPropConfig(config: {
	basesEventTitleProp?: string;
	basesEventDateProp?: string;
	basesEventDurationProp?: string;
	basesEventIconProp?: string;
	basesEventColorProp?: string;
	basesEventDescriptionProp?: string;
}): BasesEventPropertyConfig {
	return {
		titleProp: config.basesEventTitleProp || "title",
		dateProp: config.basesEventDateProp || "event_date",
		durationProp: config.basesEventDurationProp || "duration",
		iconProp: config.basesEventIconProp || "icon",
		colorProp: config.basesEventColorProp || "color",
		descriptionProp: config.basesEventDescriptionProp || "description",
	};
}
