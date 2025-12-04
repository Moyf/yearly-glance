import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { t } from "@/src/i18n/i18n";
import { IFrontmatterConfig } from "@/src/type/Settings";

interface FrontmatterSettingsProps {
	plugin: YearlyGlancePlugin;
}

export const FrontmatterSettings: React.FC<FrontmatterSettingsProps> = ({
	plugin,
}) => {
	const [config, setConfig] = React.useState<IFrontmatterConfig>(
		plugin.getConfig().frontmatter
	);

	React.useEffect(() => {
		// 监听设置变化
		const handleConfigUpdate = () => {
			setConfig(plugin.getConfig().frontmatter);
		};

		// 这里可以添加事件监听
		return () => {
			// 清理监听器
		};
	}, [plugin]);

	const handleConfigChange = async (
		updates: Partial<IFrontmatterConfig>
	) => {
		await plugin.updateConfig({
			frontmatter: { ...config, ...updates },
		});
		setConfig({ ...config, ...updates });
	};

	const handlePropertyChange = async (
		key: keyof IFrontmatterConfig["propertyNames"],
		value: string
	) => {
		await handleConfigChange({
			propertyNames: { ...config.propertyNames, [key]: value },
		});
	};

	const handleToggle = async (key: keyof IFrontmatterConfig, checked: boolean) => {
		await handleConfigChange({ [key]: checked } as Partial<IFrontmatterConfig>);
	};

	return (
		<div className="yg-frontmatter-settings">
			<h3>⚙️ {t("setting.general.frontmatter.title")}</h3>

			<div className="setting-item">
				<div className="setting-item-info">
					<div className="setting-item-name">
						{t("setting.general.frontmatter.enabled")}
					</div>
					<div className="setting-item-description">
						{t("setting.general.frontmatter.enabledDesc")}
					</div>
				</div>
				<div className="setting-item-control">
					<input
						type="checkbox"
						checked={config.enabled}
						onChange={(e) => handleToggle("enabled", e.target.checked)}
					/>
				</div>
			</div>

			{config.enabled && (
				<>
					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">
								{t("setting.general.frontmatter.folderPath")}
							</div>
							<div className="setting-item-description">
								{t("setting.general.frontmatter.folderPathDesc")}
							</div>
						</div>
						<div className="setting-item-control">
							<input
								type="text"
								placeholder="Events"
								value={config.folderPath}
								onChange={(e) =>
									handleConfigChange({ folderPath: e.target.value })
								}
							/>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">
								{t("setting.general.frontmatter.recursive")}
							</div>
							<div className="setting-item-description">
								{t("setting.general.frontmatter.recursiveDesc")}
							</div>
						</div>
						<div className="setting-item-control">
							<input
								type="checkbox"
								checked={config.recursive}
								onChange={(e) => handleToggle("recursive", e.target.checked)}
							/>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">
								{t("setting.general.frontmatter.showBasesEvents")}
							</div>
							<div className="setting-item-description">
								{t("setting.general.frontmatter.showBasesEventsDesc")}
							</div>
						</div>
						<div className="setting-item-control">
							<input
								type="checkbox"
								checked={config.showBasesEvents}
								onChange={(e) =>
									handleToggle("showBasesEvents", e.target.checked)
								}
							/>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">Property Names</div>
							<div className="setting-item-description">
								Customize frontmatter property names
							</div>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">Title</div>
						</div>
						<div className="setting-item-control">
							<input
								type="text"
								value={config.propertyNames.title}
								onChange={(e) => handlePropertyChange("title", e.target.value)}
							/>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">Event Date</div>
						</div>
						<div className="setting-item-control">
							<input
								type="text"
								value={config.propertyNames.eventDate}
								onChange={(e) =>
									handlePropertyChange("eventDate", e.target.value)
								}
							/>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">Description</div>
						</div>
						<div className="setting-item-control">
							<input
								type="text"
								value={config.propertyNames.description || ""}
								onChange={(e) =>
									handlePropertyChange("description", e.target.value)
								}
							/>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">Icon</div>
						</div>
						<div className="setting-item-control">
							<input
								type="text"
								value={config.propertyNames.icon || ""}
								onChange={(e) => handlePropertyChange("icon", e.target.value)}
							/>
						</div>
					</div>

					<div className="setting-item">
						<div className="setting-item-info">
							<div className="setting-item-name">Color</div>
						</div>
						<div className="setting-item-control">
							<input
								type="text"
								value={config.propertyNames.color || ""}
								onChange={(e) => handlePropertyChange("color", e.target.value)}
							/>
						</div>
					</div>

					<div className="setting-item">
						<button
							className="mod-cta"
							onClick={async () => {
								await plugin.refreshFrontmatterEvents();
								alert("Events refreshed!");
							}}
						>
							Refresh Events
						</button>
					</div>
				</>
			)}
		</div>
	);
};
