import * as React from "react";
import { Events } from "../../core/interfaces/Events";
import "./style/DataPortManager.css";
import { NavTabs } from "../Base/NavTabs";
import { DataExport } from "./DataExport";
import { DataImport } from "./DataImport";
import { YearlyGlanceSettings } from "@/src/core/interfaces/Settings";
import { t } from "@/src/i18n/i18n";
import YearlyGlancePlugin from "@/src/main";
import { useYearlyGlanceConfig } from "@/src/core/hook/useYearlyGlanceConfig";

interface DataPortManagerProps {
	config: YearlyGlanceSettings;
	data: Events;
	onConfigUpdate: (config: Partial<YearlyGlanceSettings>) => Promise<void>;
	onDataImport: (data: Partial<Events>) => Promise<void>;
}

type DataPortType = "export" | "import";

export const DataPortManagerView: React.FC<{
	plugin: YearlyGlancePlugin;
}> = ({ plugin }) => {
	const { config, updateConfig, events, updateEvents } =
		useYearlyGlanceConfig(plugin);

	return (
		<DataPortManager
			config={config}
			data={events}
			onConfigUpdate={updateConfig}
			onDataImport={updateEvents}
		/>
	);
};

const DataPortManager: React.FC<DataPortManagerProps> = ({
	config,
	data,
	onConfigUpdate,
	onDataImport,
}) => {
	const [activeTab, setActiveTab] = React.useState<DataPortType>("export");

	return (
		<>
			<div className="yg-data-port-header">
				<div className="data-port-type-selector">
					<NavTabs
						tabs={[
							{
								label: t("view.dataPortView.export.name"),
								value: "export",
							},
							{
								label: t("view.dataPortView.import.name"),
								value: "import",
							},
						]}
						activeTab={activeTab}
						onClick={(tab) => setActiveTab(tab as DataPortType)}
					/>
				</div>
			</div>

			<div className="yg-data-port-content">
				{activeTab === "export" ? (
					<DataExport
						config={config}
						currentData={data}
						onConfigUpdate={onConfigUpdate}
					/>
				) : (
					<DataImport
						currentData={data}
						onDataImport={onDataImport}
					/>
				)}
			</div>
		</>
	);
};
