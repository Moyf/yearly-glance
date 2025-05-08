export interface EventSearchPayload {
	searchType: "id" | "text";
	searchValue: string;
}

// 创建事件管理器总线
export const EventManagerBus = createEventBus<EventSearchPayload>();

// 事件类型常量
export const EVENT_SEARCH_REQUESTED = "event-search-requested";

/**
 * 创建一个类型安全的事件总线
 * 用于不同组件间的通信，避免直接DOM操作
 */
export function createEventBus<T = any>() {
	type Listener = (data: T) => void;
	const listeners = new Map<string, Set<Listener>>();

	return {
		/**
		 * 订阅事件
		 * @param eventName 事件名称
		 * @param callback 回调函数
		 * @returns 取消订阅的函数
		 */
		subscribe(eventName: string, callback: Listener) {
			if (!listeners.has(eventName)) {
				listeners.set(eventName, new Set());
			}

			listeners.get(eventName)?.add(callback);

			// 返回取消订阅函数
			return () => {
				const eventListeners = listeners.get(eventName);
				if (eventListeners) {
					eventListeners.delete(callback);
					if (eventListeners.size === 0) {
						listeners.delete(eventName);
					}
				}
			};
		},

		/**
		 * 发布事件
		 * @param eventName 事件名称
		 * @param data 事件数据
		 */
		publish(eventName: string, data: T) {
			const eventListeners = listeners.get(eventName);
			if (eventListeners) {
				eventListeners.forEach((listener) => listener(data));
			}
		},
	};
}
