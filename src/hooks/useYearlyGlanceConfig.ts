import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceSettings } from "@/src/type/Settings";
import { Events } from "@/src/type/Events";

/**
 * 刷新 topic 类型
 * - 'config'       显示设置变更（触发全局 config/events 状态刷新）
 * - 'plugin-data'  plugin config data 事件变更（holidays/birthdays/customEvents）
 * - 'bases-data'   Bases 笔记事件变更（触发笔记事件重新加载）
 * - 'dailynote-data' 日记事件变更（触发日记事件重新加载）
 * - 'all'          全量刷新（兼容旧调用，触发所有订阅者）
 */
export type RefreshTopic = 'config' | 'plugin-data' | 'bases-data' | 'dailynote-data' | 'all';

type BusListener = (topic: RefreshTopic) => void;

// 创建一个总线，用于跨组件通信（支持 topic 过滤）
export const YearlyGlanceBus = {
	listeners: new Set<BusListener>(),

	// 订阅事件更新（callback 接收 topic，可自行过滤）
	subscribe(callback: BusListener) {
		this.listeners.add(callback);
		return () => {
			this.listeners.delete(callback);
		};
	},

	// 订阅特定 topic（只在 topic 匹配时触发）
	subscribeTopics(topics: RefreshTopic[], callback: () => void) {
		const topicSet = new Set<RefreshTopic>(topics);
		const wrapped: BusListener = (topic) => {
			if (topicSet.has(topic) || topic === 'all') {
				callback();
			}
		};
		this.listeners.add(wrapped);
		return () => {
			this.listeners.delete(wrapped);
		};
	},

	// 发布指定 topic 的更新通知
	publish(topic: RefreshTopic = 'all') {
		this.listeners.forEach((callback) => callback(topic));
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
			YearlyGlanceBus.publish('config');
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
			YearlyGlanceBus.publish('plugin-data');
		},
		[plugin]
	);

	// 订阅事件更新（监听所有 topic）
	React.useEffect(() => {
		// 初始加载数据
		setConfig(plugin.getConfig());
		setEvents(plugin.getData());

		// 订阅 config 和 plugin-data 两类 topic，用于刷新本地状态
		const unsubscribe = YearlyGlanceBus.subscribeTopics(
			['config', 'plugin-data', 'all'],
			() => {
				setConfig(plugin.getConfig());
				setEvents(plugin.getData());
			}
		);

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
