import { DEFAULT_EVENTS, Events } from "./Events";
import { DEFAULT_SETTINGS, YearlyGlanceSettings } from "./Settings";

export interface YearlyGlanceConfig {
	config: YearlyGlanceSettings;
	data: Events;
}

export const DEFAULT_CONFIG: YearlyGlanceConfig = {
	config: DEFAULT_SETTINGS,
	data: DEFAULT_EVENTS,
};
