import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import YearlyGlancePlugin from "@/src/main";
import { t } from "@/src/i18n/i18n";
import { NavTabs } from "@/src/components/Base/NavTabs";
import "./style/GlanceManagerView.css";
import { Bolt, Database, SquareChartGantt } from "lucide-react";
import { EventManagerView } from "@/src/components/EventManager/EventManager";
import { ViewSettings } from "@/src/components/Settings/ViewSettings";
import { DataPortManagerView } from "@/src/components/DataPort/DataPortManager";
import { YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";

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
	private unsubscribeBus?: () => void;
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
		const config = this.plugin.getConfig();
		return config.showEmojiBeforeTabName === "lucide" ? "layout-dashboard" : ("" as IconName);
	}

	getDisplayText(): string {
		const name = t("view.glanceManager.name");
		const config = this.plugin.getConfig();
		switch (config.showEmojiBeforeTabName) {
			case "lucide":
				return name;
			case "emoji":
				return `🗂️ ${name}`;
			case "none":
			default:
				return name;
		}
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

		// Subscribe to config changes to refresh tab icon and title
		this.unsubscribeBus = YearlyGlanceBus.subscribeTopics(['config', 'all'], () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(this.leaf as any).updateHeader();
		});
	}

	async onClose() {
		this.unsubscribeBus?.();
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
