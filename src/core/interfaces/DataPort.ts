export type ImportFormat = "json";

export type ExportFormat = "json" | "ics" | "md";

export interface ImportResult {
	success: boolean;
	message: string;
	warnings?: string[];
	importedCount?: number;
}
