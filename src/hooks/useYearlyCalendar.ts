import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { CalendarDay, CalendarEvent } from "@/src/type/CalendarEvent";
import { useYearlyGlanceConfig, YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";
import { LunarLibrary } from "@/src/utils/lunarLibrary";
import { IsoUtils } from "@/src/utils/isoUtils";
import { DurationWarning, expandEventByDuration } from "@/src/utils/expandEventByDuration";
import { t } from "@/src/i18n/i18n";
import { NoteEventService } from "@/src/service/NoteEventService";
import { DailyNoteService } from "@/src/service/DailyNoteService";
import { logger } from "@/src/utils/logger";

export const MonthMap: Array<{ name: string; color: string }> = [
	{
		name: t("data.month.jan"),
		color: hexToRgb("#e74c3c"), // 红色
	},
	{
		name: t("data.month.feb"),
		color: hexToRgb("#e67e22"), // 橙色
	},
	{
		name: t("data.month.mar"),
		color: hexToRgb("#f1c40f"), // 黄色
	},
	{
		name: t("data.month.apr"),
		color: hexToRgb("#2ecc71"), // 绿色
	},
	{
		name: t("data.month.may"),
		color: hexToRgb("#1abc9c"), // 青绿色
	},
	{
		name: t("data.month.jun"),
		color: hexToRgb("#3498db"), // 蓝色
	},
	{
		name: t("data.month.jul"),
		color: hexToRgb("#9b59b6"), // 紫色
	},
	{
		name: t("data.month.aug"),
		color: hexToRgb("#e84393"), // 粉色
	},
	{
		name: t("data.month.sep"),
		color: hexToRgb("#fd79a8"), // 浅粉色
	},
	{
		name: t("data.month.oct"),
		color: hexToRgb("#fdcb6e"), // 浅黄色
	},
	{
		name: t("data.month.nov"),
		color: hexToRgb("#00cec9"), // 青色
	},
	{
		name: t("data.month.dec"),
		color: hexToRgb("#6c5ce7"), // 靛蓝色
	},
];

export const WeekMap: Record<string, string[]> = {
	sundayFirst: [
		t("data.week.sun"),
		t("data.week.mon"),
		t("data.week.tue"),
		t("data.week.wed"),
		t("data.week.thu"),
		t("data.week.fri"),
		t("data.week.sat"),
	],
	mondayFirst: [
		t("data.week.mon"),
		t("data.week.tue"),
		t("data.week.wed"),
		t("data.week.thu"),
		t("data.week.fri"),
		t("data.week.sat"),
		t("data.week.sun"),
	],
};

function hexToRgb(hex: string): string {
	// 移除 # 号
	hex = hex.replace("#", "");

	// 解析RGB值
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `${r}, ${g}, ${b}`;
}

// 主要 Hook
export function useYearlyCalendar(plugin: YearlyGlancePlugin, externalEvents?: CalendarEvent[]) {
	const { config, events } = useYearlyGlanceConfig(plugin);

	const {
		year,
		highlightWeekends,
		highlightToday,
		mondayFirst,
		showHolidays,
		showBirthdays,
		showCustomEvents,
		showBasesEvents,
		showDailyNoteEvents,
		defaultBasesEventPath,
	} = config;

	const { holidays, birthdays, customEvents } = events;

	// 当前日期 - 使用时区安全的方法
	const today = React.useMemo(() => new Date(), []);

	// 笔记事件状态
	const [basesEvents, setBasesEvents] = React.useState<CalendarEvent[]>([]);

	// 日记事件状态
	const [dailyNoteEvents, setDailyNoteEvents] = React.useState<CalendarEvent[]>([]);
	const [basesRefreshKey, setBasesRefreshKey] = React.useState(0);
	const [dailyNoteRefreshKey, setDailyNoteRefreshKey] = React.useState(0);

	React.useEffect(() => {
		const unsubscribeBases = YearlyGlanceBus.subscribeTopics(
			['bases-data', 'all'],
			() => setBasesRefreshKey((k) => k + 1)
		);
		const unsubscribeDaily = YearlyGlanceBus.subscribeTopics(
			['dailynote-data', 'all'],
			() => setDailyNoteRefreshKey((k) => k + 1)
		);
		return () => {
			unsubscribeBases();
			unsubscribeDaily();
		};
	}, []);

	// 异步加载笔记事件
	React.useEffect(() => {
		// 空字符串表示不扫描；"/" 表示全库扫描
		if (!showBasesEvents || defaultBasesEventPath === "" || defaultBasesEventPath == null) {
			setBasesEvents([]);
			return;
		}
		const noteEventService = new NoteEventService(plugin.app, config);
		noteEventService.loadEventsFromPath(defaultBasesEventPath, year).then((loadedEvents) => {
			setBasesEvents(loadedEvents);
		}).catch((error) => {
			logger.error("Failed to load note events", error);
			setBasesEvents([]);
		});
	}, [showBasesEvents, defaultBasesEventPath, year, plugin.app, basesRefreshKey]);

	// 异步加载日记事件
	React.useEffect(() => {
		if (externalEvents) return;
		if (!config.showDailyNoteEvents) {
			setDailyNoteEvents([]);
			return;
		}

		const loadDailyNoteEvents = async () => {
			try {
				const settings = DailyNoteService.getDailyNoteSettings(plugin.app, config.dailyNoteSource);
				logger.debug("DailyNote loading events", {
					source: config.dailyNoteSource,
					eventProp: config.dailyNoteEventProp,
					year,
					pluginSettings: settings,
				});

				const events = await DailyNoteService.loadEventsForYear(
					plugin.app,
					year,
					config.dailyNoteSource,
					config.dailyNoteEventProp
				);

				logger.debug("DailyNote loaded events", {
					count: events.length,
					events: events.map(e => ({ id: e.id, text: e.text, date: e.eventDate.isoDate })),
				});

				setDailyNoteEvents(events);
			} catch (error) {
				logger.error("DailyNote failed to load", error);
				setDailyNoteEvents([]);
			}
		};

		loadDailyNoteEvents();
	}, [externalEvents, config.showDailyNoteEvents, config.dailyNoteSource, config.dailyNoteEventProp, year, plugin.app, dailyNoteRefreshKey]);

	// 处理所有事件
	const allEvents = React.useMemo(() => {
		const events: CalendarEvent[] = [];
		const durationWarnings: DurationWarning[] = [];

		const pushExpanded = (event: CalendarEvent | Parameters<typeof expandEventByDuration>[0], type: Parameters<typeof expandEventByDuration>[1]) => {
			const { events: expanded, warning } = expandEventByDuration(event as Parameters<typeof expandEventByDuration>[0], type, year);
			expanded.forEach((e) => events.push(e));
			if (warning) durationWarnings.push(warning);
		};

		// 如果有外部事件（Bases 事件），只使用外部事件
		// 即使 externalEvents 是空数组，也不应该 fallback 到插件数据
		if (externalEvents) {
			externalEvents.forEach((event) => {
				// 扩展 Bases 事件
				pushExpanded(event, event.eventType);
			});
		} else {
			// 处理节假日
			if (showHolidays) {
				holidays.forEach((holiday) => {
					if (!holiday.isHidden) {
						pushExpanded(holiday, "holiday");
					}
				});
			}

			// 处理生日
			if (showBirthdays) {
				birthdays.forEach((birthday) => {
					if (!birthday.isHidden) {
						pushExpanded(birthday, "birthday");
					}
				});
			}

			// 处理自定义事件
			if (showCustomEvents) {
				customEvents.forEach((customEvent) => {
					if (!customEvent.isHidden) {
						pushExpanded(customEvent, "customEvent");
					}
				});
			}

			// 处理笔记事件
			if (showBasesEvents && basesEvents.length > 0) {
				basesEvents.forEach((basesEvent) => {
					if (!basesEvent.isHidden) {
						pushExpanded(basesEvent, "basesEvent");
					}
				});
			}

			// 处理日记事件
			if (showDailyNoteEvents && dailyNoteEvents.length > 0) {
				dailyNoteEvents.forEach((event) => {
					pushExpanded(event, "dailyNoteEvent");
				});
			}
		}

		// Log warnings to console
		if (durationWarnings.length > 0) {
			console.warn("[YearlyGlance] Invalid duration values found:", durationWarnings);
		}

		return { events, durationWarnings };
	}, [externalEvents, config, events, basesEvents, dailyNoteEvents, showBasesEvents, showDailyNoteEvents]);

	// 月份数据
	const monthsData = React.useMemo(() => {
		return MonthMap.map((month, monthIndex) => {
			// 当月第一天 - 使用时区安全的方法
			const firstDayOfMonth = IsoUtils.createLocalDate(
				year,
				monthIndex + 1,
				1
			);
			// 当月天数 - 使用时区安全的方法
			const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
			// 当月第一天是星期几 (0-6, 0是星期日)
			let firstDayWeekday = firstDayOfMonth.getDay();

			// 如果配置了周一为一周的第一天，调整星期几的值
			if (mondayFirst) {
				firstDayWeekday =
					firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
			}

			// 当月所有日期数据
			const days: CalendarDay[] = [];

			// 填充当月日期
			for (let i = 1; i <= daysInMonth; i++) {
				// 使用时区安全的日期构造方法
				const date = IsoUtils.createLocalDate(year, monthIndex + 1, i);
				const isWeekend =
					highlightWeekends &&
					(date.getDay() === 0 || date.getDay() === 6);

				// 使用 IsoUtils.toLocalDateString 生成当前日期的 ISO 字符串用于比较，避免时区问题
				const currentDateISO = IsoUtils.toLocalDateString(date);

				// 查找当天的事件（包括多日事件的每一天）
				const dayEvents = allEvents.events.filter((event) => {
					// 优先使用 dateArr 匹配（dateArr 是根据当前年份计算的显示日期）
					return event.dateArr?.some((dateStr: string) => {
						return dateStr === currentDateISO;
					});
				});

				days.push({
					date,
					dayOfMonth: i,
					dayOfLunarMonth: LunarLibrary.getDayOfLunarMonth(date),
					isCurrentMonth: true,
					isToday:
						highlightToday && IsoUtils.isSameLocalDay(date, today),
					isWeekend,
					events: dayEvents,
				});
			}

			return {
				name: month.name,
				color: month.color,
				days,
				isCurrentMonth:
					today.getMonth() === monthIndex &&
					today.getFullYear() === year,
				firstDayPosition: firstDayWeekday,
			};
		});
	}, [allEvents, config, year, today, mondayFirst, highlightWeekends, highlightToday]);

	// 获取星期几标题
	const weekdays = React.useMemo(() => {
		return mondayFirst ? WeekMap.mondayFirst : WeekMap.sundayFirst;
	}, [mondayFirst]);

	return {
		monthsData,
		weekdays,
		today,
		durationWarnings: allEvents.durationWarnings,
	};
}
