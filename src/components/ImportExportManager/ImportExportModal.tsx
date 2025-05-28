import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Modal } from "obsidian";
import YearlyGlancePlugin from "@/src/main";
import { NavTabs } from "../Base/NavTabs";
import { ImportHandle } from "./ImportHandle";
import { ExportHandle } from "./ExportHandle";
import { t } from "@/src/i18n/i18n";
import "./style/ImportExportModal.css";

interface ImportExportManagerProps {
	plugin: YearlyGlancePlugin;
	tab: "import" | "export";
}

const ImportExportManager: React.FC<ImportExportManagerProps> = ({
	plugin,
	tab,
}) => {
	const renderImportExportSection = () => {
		switch (tab) {
			case "import":
				return <ImportHandle plugin={plugin} />;
			case "export":
				return <ExportHandle plugin={plugin} />;
			default:
				return null;
		}
	};

	return renderImportExportSection();
};

interface ImportExportWrapperProps {
	plugin: YearlyGlancePlugin;
}

const TABS = [
	{
		label: t("view.importExportManager.import.tab"),
		value: "import",
	},
	{
		label: t("view.importExportManager.export.tab"),
		value: "export",
	},
];

const ImportExportWrapper: React.FC<ImportExportWrapperProps> = ({
	plugin,
}) => {
	const [tab, setTab] = React.useState<"import" | "export">("import");

	return (
		<div className="yg-import-export-modal">
			<div className="yg-import-export-selector">
				<NavTabs
					tabs={TABS}
					activeTab={tab}
					onClick={(tab) => setTab(tab)}
				/>
			</div>
			<ImportExportManager plugin={plugin} tab={tab} />
		</div>
	);
};

export class ImportExportModal extends Modal {
	private plugin: YearlyGlancePlugin;
	private root: Root | null = null;

	constructor(plugin: YearlyGlancePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		this.root = createRoot(contentEl);

		this.root.render(
			<React.StrictMode>
				<ImportExportWrapper plugin={this.plugin} />
			</React.StrictMode>
		);
	}

	onClose() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}
