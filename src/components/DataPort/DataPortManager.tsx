import * as React from "react";
import {
	Birthday,
	CustomEvent,
	Events,
	EventType,
	Holiday,
} from "../../core/interfaces/Events";
import "./style/DataPortManager.css";
import { NavTabs } from "../Base/NavTabs";
import { DataExport } from "./DataExport";
import { DataImport } from "./DataImport";
import { YearlyGlanceSettings } from "@/src/core/interfaces/Settings";
import { t } from "@/src/i18n/i18n";
import YearlyGlancePlugin from "@/src/main";
import { useYearlyGlanceConfig } from "@/src/core/hook/useYearlyGlanceConfig";
import { EventFormModal } from "../EventForm/EventFormModal";

interface DataPortManagerProps {
	config: YearlyGlanceSettings;
	data: Events;
	onConfigUpdate: (config: Partial<YearlyGlanceSettings>) => Promise<void>;
	onDataImport: (
		event: CustomEvent | Birthday | Holiday,
		eventType: EventType
	) => Promise<void>;
}

type DataPortType = "export" | "import";

export const DataPortManagerView: React.FC<{
	plugin: YearlyGlancePlugin;
}> = ({ plugin }) => {
	const { config, updateConfig, events } = useYearlyGlanceConfig(plugin);

	const onDataImport = async (
		event: CustomEvent | Birthday | Holiday,
		eventType: EventType
	) => {
		const modal = new EventFormModal(
			plugin,
			event,
			eventType,
			false, // isEditing
			false, // allowTypeChange
			{}
		);

		await modal.onSave(event, eventType);
	};

	return (
		<DataPortManager
			config={config}
			data={events}
			onConfigUpdate={updateConfig}
			onDataImport={onDataImport}
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
