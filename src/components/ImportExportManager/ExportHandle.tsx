import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { t } from "@/src/i18n/i18n";

interface ExportHandleProps {
	plugin: YearlyGlancePlugin;
}

export const ExportHandle: React.FC<ExportHandleProps> = ({ plugin }) => {
	return (
		<div className="yg-ie-handle">
			<h3 className="yg-ie-handle-title">
				{t("view.importExportManager.import.title")}
			</h3>

			<div className="yg-export-handle">敬请期待</div>
		</div>
	);
};
