import { TFile } from "obsidian";

/** Stub for Obsidian's undocumented Bases entry type */
export interface BasesEntry {
	file: TFile;
	getValue(key: string): BasesValue | null;
}

/** Stub for Obsidian's Bases Value type */
export interface BasesValue {
	isTruthy(): boolean;
	toString(): string;
}

/** Config for Bases event property names (used by frontmatter sync and NoteEventService) */
export interface BasesEventPropertyConfig {
	titleProp: string;
	dateProp: string;
	durationProp: string;
	iconProp: string;
	colorProp: string;
	descriptionProp: string;
	presetTypeProp: string;
}

/** Config for BasesView internal rendering settings */
export interface BasesViewConfig {
	inheritPluginData: boolean;
	propTitle: string | null;
	propDate: string | null;
	propDuration: string | null;
	propIcon: string | null;
	propColor: string | null;
	propDescription: string | null;
	propPresetType: string | null;
	limitHeight: boolean;
	embeddedHeight: number;
}
