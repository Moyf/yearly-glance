import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceSettings } from "../interfaces/Settings";

export function useConfig(plugin: YearlyGlancePlugin) {
	// 使用插件的配置作为初始状态
	const [config, setConfig] = React.useState(plugin.getConfig());

	// 更新配置的回调函数
	const updateConfig = React.useCallback(
		async (newConfig: YearlyGlanceSettings) => {
			// 使用插件的方法更新配置
			await plugin.updateConfig(newConfig);
			// 更新本地状态
			setConfig(plugin.getConfig());
		},
		[plugin]
	);

	// 当插件实例变化时重新获取配置
	React.useEffect(() => {
		setConfig(plugin.getConfig());
	}, [plugin]);

	return {
		config,
		updateConfig,
	};
}
