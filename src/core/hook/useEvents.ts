import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { Events } from "@/src/core/interfaces/Events";

// 创建一个事件总线，用于跨组件通信
export const EventBus = {
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

export function useEvents(plugin: YearlyGlancePlugin) {
	// 使用插件的数据作为初始状态
	const [events, setEvents] = React.useState<Events>(plugin.getData());

	// 更新事件数据的回调函数
	const updateEvents = React.useCallback(
		async (newEvents: Events) => {
			// 使用插件的方法更新数据
			await plugin.updateData(newEvents);
			// 更新本地状态
			setEvents(newEvents);
			// 通知其他组件数据已更新
			EventBus.publish();
		},
		[plugin]
	);

	// 订阅事件更新
	React.useEffect(() => {
		// 初始加载数据
		setEvents(plugin.getData());

		// 订阅事件更新
		const unsubscribe = EventBus.subscribe(() => {
			setEvents(plugin.getData());
		});

		// 清理订阅
		return unsubscribe;
	}, [plugin]);

	return {
		events,
		updateEvents,
	};
}
