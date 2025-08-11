import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceSettings } from "@/src/type/Settings";
import { Events } from "@/src/type/Events";

// 创建一个总线，用于跨组件通信
export const YearlyGlanceBus = {
	listeners: new Set<() => void>(),

	// 订阅事件更新
	subscribe(callback: () => void) {
		this.listeners.add(callback);
		return () => {
			this.listeners.delete(callback);
		};
	},

	// 发布事件更新通知
	publish() {
		this.listeners.forEach((callback) => callback());
	},
};

export function useYearlyGlanceConfig(plugin: YearlyGlancePlugin) {
	const [config, setConfig] = React.useState<YearlyGlanceSettings>(
		plugin.getConfig()
	);
	const [events, setEvents] = React.useState<Events>(plugin.getData());

	// 更新配置的回调函数
	const updateConfig = React.useCallback(
		async (newConfig: YearlyGlanceSettings) => {
			// 使用插件的方法更新配置
			await plugin.updateConfig(newConfig);
			// 更新本地状态
			setConfig(plugin.getConfig());
			// 通知其他组件配置已更新
			YearlyGlanceBus.publish();
		},
		[plugin]
	);

	// 更新事件数据的回调函数
	const updateEvents = React.useCallback(
		async (newEvents: Events) => {
			// 使用插件的方法更新数据
			await plugin.updateData(newEvents);
			// 更新本地状态
			setEvents(newEvents);
			// 通知其他组件数据已更新
			YearlyGlanceBus.publish();
		},
		[plugin]
	);

	// 订阅事件更新
	React.useEffect(() => {
		// 初始加载数据
		setConfig(plugin.getConfig());
		setEvents(plugin.getData());

		// 订阅事件更新
		const unsubscribe = YearlyGlanceBus.subscribe(() => {
			setConfig(plugin.getConfig());
			setEvents(plugin.getData());
		});

		// 清理订阅
		return unsubscribe;
	}, [plugin]);

	return {
		config,
		updateConfig,
		events,
		updateEvents,
	};
}
