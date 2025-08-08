import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "../main";
import { t } from "../i18n/i18n";
import { NavTabs } from "../components/Base/NavTabs";
import "./style/GlanceManagerView.css";
import { Bolt, Database, SquareChartGantt } from "lucide-react";
import { EventManagerView } from "../components/EventManager/EventManager";
import { ViewSettings } from "../components/Settings/ViewSettings";
import { DataPortManagerView } from "../components/DataPort/DataPortManager";

export const VIEW_TYPE_GLANCE_MANAGER = "yearly-glance-manager-view";

export type GlanceManagerTab = "events" | "settings" | "dataPort";

interface GlanceManagerProps {
	plugin: YearlyGlancePlugin;
	initialTab?: GlanceManagerTab;
}

const GlanceManager = React.forwardRef<
	{ setActiveTab: (tab: GlanceManagerTab) => void },
	GlanceManagerProps
>(({ plugin, initialTab = "events" }, ref) => {
	const [activeTab, setActiveTab] =
		React.useState<GlanceManagerTab>(initialTab);

	// 当 initialTab 改变时更新 activeTab
	React.useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);

	// 暴露 setActiveTab 方法给父组件
	React.useImperativeHandle(ref, () => ({
		setActiveTab,
	}));

	const tabs = [
		{
			label: t("view.glanceManager.events"),
			value: "events" as GlanceManagerTab,
			icon: <SquareChartGantt size={16} />,
		},
		{
			label: t("view.glanceManager.dataPort"),
			value: "dataPort" as GlanceManagerTab,
			icon: <Database size={16} />,
		},
		{
			label: t("view.glanceManager.settings"),
			value: "settings" as GlanceManagerTab,
			icon: <Bolt size={16} />,
		},
	];

	const renderTabContent = () => {
		switch (activeTab) {
			case "events":
				return <EventManagerView plugin={plugin} />;
			case "settings":
				return (
					<div>
						<ViewSettings plugin={plugin} />
					</div>
				);
			case "dataPort":
				return <DataPortManagerView plugin={plugin} />;
			default:
				return <></>;
		}
	};

	return (
		<div className="yg-manager-view">
			<div className="yg-glance-manager-tabs">
				<NavTabs
					tabs={tabs}
					activeTab={activeTab}
					onClick={(tab) => setActiveTab(tab as GlanceManagerTab)}
					className="yg-glance-manager-nav"
				/>
			</div>
			<div className="yg-glance-manager-content">
				{renderTabContent()}
			</div>
		</div>
	);
});

export class GlanceManagerView extends ItemView {
	plugin: YearlyGlancePlugin;
	root: Root | null = null;
	private initialTab: GlanceManagerTab;
	private glanceManagerRef: React.RefObject<{
		setActiveTab: (tab: GlanceManagerTab) => void;
	} | null> = React.createRef();

	constructor(
		leaf: WorkspaceLeaf,
		plugin: YearlyGlancePlugin,
		initialTab?: GlanceManagerTab
	) {
		super(leaf);
		this.plugin = plugin;
		this.initialTab = initialTab || "events";
	}

	getViewType(): string {
		return VIEW_TYPE_GLANCE_MANAGER;
	}

	getIcon(): IconName {
		return "layout-dashboard";
	}

	getDisplayText(): string {
		const name = t("view.glanceManager.name");
		const config = this.plugin.getConfig();
		return config.showEmojiBeforeTabName ? `🗂️ ${name}` : name;
	}

	async onOpen() {
		await super.onOpen();

		if (!this.root) {
			this.root = createRoot(this.contentEl);
		}

		this.root.render(
			<React.StrictMode>
				<GlanceManager
					ref={this.glanceManagerRef}
					plugin={this.plugin}
					initialTab={this.initialTab}
				/>
			</React.StrictMode>
		);
	}

	async onClose() {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
		await super.onClose();
	}

	// 允许外部更新标签
	public updateActiveTab(tab: GlanceManagerTab) {
		this.initialTab = tab;

		// 如果 ref 存在且有当前的 setActiveTab 方法，直接调用
		if (this.glanceManagerRef?.current?.setActiveTab) {
			this.glanceManagerRef.current.setActiveTab(tab);
		} else if (this.root) {
			// 如果 ref 不可用，重新渲染组件
			this.root.render(
				<React.StrictMode>
					<GlanceManager
						ref={this.glanceManagerRef}
						plugin={this.plugin}
						initialTab={this.initialTab}
					/>
				</React.StrictMode>
			);
		}
	}
}
