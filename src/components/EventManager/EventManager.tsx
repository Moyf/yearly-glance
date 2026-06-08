import * as React from "react";
import YearlyGlancePlugin from "@/src/main";
import { Birthday, CustomEvent, EventType, Holiday } from "@/src/type/Events";
import { useYearlyGlanceConfig, YearlyGlanceBus } from "@/src/hooks/useYearlyGlanceConfig";
import { EVENT_TYPE_OPTIONS } from "@/src/components/EventForm/EventForm";
import { SortControls, SortDirection, SortField } from "./SortControls";
import { EventList } from "./EventList";
import { ConfirmDialog } from "@/src/components/Base/ConfirmDialog";
import { NavTabs } from "@/src/components/Base/NavTabs";
import { Tooltip } from "@/src/components/Base/Tooltip";
import { t } from "@/src/i18n/i18n";
import { VIEW_TYPE_YEARLY_GLANCE } from "@/src/views/YearlyGlanceView";
import {
	EVENT_SEARCH_REQUESTED,
	EventManagerBus,
} from "@/src/hooks/useEventBus";
import { CalendarEvent } from "@/src/type/CalendarEvent";
import { NoteEventService } from "@/src/service/NoteEventService";
import { DailyNoteService } from "@/src/service/DailyNoteService";
import "./style/EventManagerView.css";

// ---------- search token parser ----------
type TokenType = "year" | "month" | "type" | "id";
interface SearchToken {
	type: TokenType;
	value: string;
}
interface ParsedSearch {
	tokens: SearchToken[];
	freetext: string;
}

function parseSearchTokens(raw: string): ParsedSearch {
	const tokens: SearchToken[] = [];
	let freetext = raw;
	const tokenRegex = /@(year|month|type|id):([^\s@]*)/gi;
	let match: RegExpExecArray | null;
	while ((match = tokenRegex.exec(raw)) !== null) {
		tokens.push({ type: match[1].toLowerCase() as TokenType, value: match[2].trim() });
		freetext = freetext.replace(match[0], "");
	}
	freetext = freetext.trim().toLowerCase();
	return { tokens, freetext };
}

interface EventManagerViewProps {
	plugin: YearlyGlancePlugin;
}

export const EventManagerView: React.FC<EventManagerViewProps> = ({
	plugin,
}) => {
	const { events, updateEvents } = useYearlyGlanceConfig(plugin);
	// 激活的标签页
	const [activeTab, setActiveTab] = React.useState<EventType>("customEvent");
	const [searchTerm, setSearchTerm] = React.useState("");
	const [searchExpanded, setSearchExpanded] = React.useState(false);
	const [searchFocused, setSearchFocused] = React.useState(false);
	const [suggestionVisible, setSuggestionVisible] = React.useState(false);
	const suggestionTimerRef = React.useRef<number | null>(null);
	const searchContainerRef = React.useRef<HTMLDivElement>(null);
	const searchInputRef = React.useRef<HTMLInputElement>(null);

	// 添加排序状态
	const [sortField, setSortField] = React.useState<SortField>("date");
	const [sortDirection, setSortDirection] =
		React.useState<SortDirection>("asc");

	// 笔记事件状态
	const [basesEvents, setBasesEvents] = React.useState<CalendarEvent[]>([]);
	// 日记事件状态
	const [dailyNoteEvents, setDailyNoteEvents] = React.useState<CalendarEvent[]>([]);
	const { config } = useYearlyGlanceConfig(plugin);

	const gregorianDisplayFormat = config.gregorianDisplayFormat;

	// 加载笔记事件（Manager 始终加载，不受日历显示开关影响）
	React.useEffect(() => {
		const loadBasesEvents = () => {
			// 空字符串表示不扫描；"/" 或具体路径才执行扫描
			if (config.defaultBasesEventPath) {
				const noteEventService = new NoteEventService(plugin.app, config);
				noteEventService.loadEventsFromPath(config.defaultBasesEventPath, config.year)
					.then(setBasesEvents)
					.catch((error) => {
						console.error("[YearlyGlance] Failed to load note events:", error);
						setBasesEvents([]);
					});
			} else {
				setBasesEvents([]);
			}
		};

		loadBasesEvents();

		const unsubscribe = YearlyGlanceBus.subscribeTopics(['bases-data'], loadBasesEvents);

		return unsubscribe;
	}, [plugin, plugin.app, config.defaultBasesEventPath, config.year]);

	// 加载日记事件（Manager 始终加载，不受日历显示开关影响）
	React.useEffect(() => {
		const loadDailyNoteEvents = () => {
			DailyNoteService.loadEventsForYear(
				plugin.app,
				config.year,
				config.dailyNoteSource,
				config.dailyNoteEventProp
			)
				.then(setDailyNoteEvents)
				.catch((error) => {
					console.error("[YearlyGlance] Failed to load daily note events:", error);
					setDailyNoteEvents([]);
				});
		};

		loadDailyNoteEvents();

		const unsubscribe = YearlyGlanceBus.subscribeTopics(['dailynote-data'], loadDailyNoteEvents);
		return unsubscribe;
	}, [plugin, plugin.app, config.dailyNoteSource, config.dailyNoteEventProp, config.year]);

	// 订阅事件总线，处理搜索请求
	React.useEffect(() => {
		// 订阅搜索请求事件
		const unsubscribe = EventManagerBus.subscribe(
			EVENT_SEARCH_REQUESTED,
			(data) => {
				if (data.searchType === "id") {
					// 设置搜索词为@id格式
					setSearchTerm(`@id ${data.searchValue}`);
					// 确保搜索框展开
					setSearchExpanded(true);
				}
			}
		);

		// 组件卸载时取消订阅
		return () => {
			unsubscribe();
		};
	}, []);

	const handleYearlyCalendar = () => {
		void plugin.openPluginView(VIEW_TYPE_YEARLY_GLANCE);
	};

	// 处理排序变更
	const handleSortChange = (field: SortField, direction: SortDirection) => {
		setSortField(field);
		setSortDirection(direction);
	};

	// 添加新事件
	const handleAddEvent = () => {
		void plugin.openEventForm(activeTab, {}, false, true);
	};

	// 编辑事件
	const handleEditEvent = (event: Holiday | Birthday | CustomEvent | CalendarEvent) => {
		// 检查是否为笔记事件
		if ((event as CalendarEvent).id?.startsWith("bases-")) {
			void plugin.openEventForm("basesEvent", event, true, false);
			return;
		}

		// 检查是否为日记事件
		if ((event as CalendarEvent).id?.startsWith("dailynote-")) {
			void plugin.openEventForm("dailyNoteEvent", event, true, false);
			return;
		}

		// 在搜索模式下，需要根据事件类型确定要打开的编辑表单类型
		let eventType = activeTab;

		// 根据事件特性判断其实际类型
		if ((event as Holiday).id.contains("holi")) {
			eventType = "holiday";
		} else if ((event as Birthday).id.contains("birth")) {
			eventType = "birthday";
		} else if ((event as CustomEvent).id.contains("event")) {
			eventType = "customEvent";
		} else {
			throw new Error("Unknown event type");
		}

		void plugin.openEventForm(eventType, event, true, false);
	};

	// 删除事件
	const handleDeleteEvent = async (
		event: Holiday | Birthday | CustomEvent
	) => {
		new ConfirmDialog(plugin, {
			title: t("view.eventManager.actions.delete"),
			message: t("view.eventManager.actions.deleteConfirm", {
				name: event.text,
			}),
			onConfirm: () => {
				void (async () => {
				const newEvents = { ...events };
				const eventId = event.id;

				// 直接根据ID在所有事件类型中查找并删除
				newEvents.holidays = events.holidays.filter(
					(h) => h.id !== eventId
				);
				newEvents.birthdays = events.birthdays.filter(
					(b) => b.id !== eventId
				);
				newEvents.customEvents = events.customEvents.filter(
					(c) => c.id !== eventId
				);

				await updateEvents(newEvents);
				})();
			},
		}).open();
	};

	// ---------- multi-token search ----------
	const matchesSearch = React.useCallback(
		(event: Holiday | Birthday | CustomEvent | CalendarEvent): boolean => {
			const raw = searchTerm.trim();
			if (!raw) return true;
			const { tokens, freetext } = parseSearchTokens(raw);

			// freetext match
			if (freetext) {
			const textMatch =
				event.text.toLowerCase().includes(freetext) ||
				(event.emoji && event.emoji.toLowerCase().includes(freetext)) ||
				(event.remark && event.remark.toLowerCase().includes(freetext)) ||
				(event.eventDate?.isoDate?.toLowerCase().includes(freetext) ?? false);
				if (!textMatch) return false;
			}

			// token conditions (AND)
			for (const token of tokens) {
				if (token.value === "") continue; // ignore empty tokens
				switch (token.type) {
					case "id":
						if (event.id?.toString() !== token.value) return false;
						break;
					case "year": {
						const yearStr = token.value;
						const hasYear =
							(event as CalendarEvent).dateArr?.some((d) => d.startsWith(yearStr)) ||
							(event.eventDate?.isoDate?.startsWith(yearStr) ?? false);
						if (!hasYear) return false;
						break;
					}
					case "month": {
						const monthNum = parseInt(token.value, 10);
						if (isNaN(monthNum)) break;
						const hasMonth =
							(event as CalendarEvent).dateArr?.some((d) => {
								// "YYYY-MM-DD" → month is index 5-6
								const parts = d.split("-");
								return parts.length >= 2 && parseInt(parts[1], 10) === monthNum;
							}) ||
							(() => {
								const iso = event.eventDate?.isoDate ?? "";
								const parts = iso.split("-");
								// support "YYYY-MM-DD" or "MM-DD"
								if (parts.length === 3) return parseInt(parts[1], 10) === monthNum;
								if (parts.length === 2) return parseInt(parts[0], 10) === monthNum;
								return false;
							})();
						if (!hasMonth) return false;
						break;
					}
					case "type": {
						const partial = token.value.toLowerCase();
						const matchingTypeIds = (config.eventPresetTypes ?? [])
							.filter((pt) => pt.name.toLowerCase().includes(partial))
							.map((pt) => pt.id);
						if (matchingTypeIds.length === 0) return false;
						if (!event.presetTypeId || !matchingTypeIds.includes(event.presetTypeId)) return false;
						break;
					}
				}
			}
			return true;
		},
		[searchTerm, config.eventPresetTypes]
	);

	// 获取当前标签页的事件列表
	const getCurrentEvents = () => {
		// 如果有搜索词，从所有事件中搜索
		if (searchTerm.trim()) {
			const allEvents: Array<Holiday | Birthday | CustomEvent | CalendarEvent> = [
				...events.holidays,
				...events.birthdays,
				...events.customEvents,
				...basesEvents,
				...dailyNoteEvents,
			];
			return allEvents.filter(matchesSearch);
		}



		// 没有搜索词时，只显示当前激活标签页的事件
		switch (activeTab) {
			case "holiday":
				return events.holidays;
			case "birthday":
				return events.birthdays;
			case "customEvent":
				return events.customEvents;
			case "basesEvent":
				return basesEvents;
			case "dailyNoteEvent":
				return dailyNoteEvents;
			default:
				return [];
		}
	};

	// 切换搜索框展开状态
	const toggleSearch = () => {
		setSearchExpanded(!searchExpanded);
		if (!searchExpanded) {
			// 当展开搜索框时，聚焦输入框
			window.setTimeout(() => {
				searchInputRef.current?.focus();
			}, 100);
		} else {
			// 当收起搜索框时，清空搜索内容
			setSearchTerm("");
			setSearchFocused(false);
			setSuggestionVisible(false);
			if (suggestionTimerRef.current) window.clearTimeout(suggestionTimerRef.current);
		}
	};

	// 处理搜索框失焦事件
	const handleSearchBlur = (e: React.FocusEvent) => {
		setSearchFocused(false);
		setSuggestionVisible(false);
		if (suggestionTimerRef.current) window.clearTimeout(suggestionTimerRef.current);
		// 如果搜索框为空且不是点击了清除按钮，则收起搜索框
		if (
			searchTerm === "" &&
			!searchContainerRef.current?.contains(e.relatedTarget as Node)
		) {
			setSearchExpanded(false);
		}
	};

	// 计算 suggestion 面板内容
	const getActiveSuggestion = (term: string) => {
		const typePartial = term.match(/@type:([^\s@]*)$/i);
		if (typePartial) {
			const partial = typePartial[1].toLowerCase();
			return {
				mode: "type-candidates" as const,
				candidates: (config.eventPresetTypes ?? [])
					.filter((pt) => (pt.enable ?? true) && pt.name.toLowerCase().includes(partial)),
			};
		}
		return { mode: "tokens" as const, candidates: [] };
	};

	const suggestion = getActiveSuggestion(searchTerm);

	// 判断是否在搜索模式
	const isSearching = searchTerm.trim() !== "";

	// 获取事件数量信息
	const getEventCounts = () => {
		return {
			holiday: events.holidays.length,
			birthday: events.birthdays.length,
			customEvent: events.customEvents.length,
			basesEvent: basesEvents.length,
			dailyNoteEvent: dailyNoteEvents.length,
		};
	};

	const eventCounts = getEventCounts();

	return (
		<div className="yg-event-manager-container">
			<div className="yg-event-manager-header">
				<NavTabs
					tabs={EVENT_TYPE_OPTIONS.map((option) => ({
						...option,
						count: eventCounts[option.value],
					}))}
					activeTab={activeTab}
					onClick={(tab) => setActiveTab(tab as EventType)}
					className="yg-event-tabs"
					showCounts={true}
					searchMode={isSearching}
				/>

				<div className="yg-event-actions-bar">
					<div
						ref={searchContainerRef}
						className={`search-container ${
							searchExpanded ? "expanded" : ""
						}`}
					>
						{searchExpanded ? (
							<>
								<input
									ref={searchInputRef}
									type="text"
									className="search-input"
									placeholder={t(
										"view.eventManager.actions.search"
									)}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
							onFocus={() => {
										setSearchFocused(true);
										if (suggestionTimerRef.current) window.clearTimeout(suggestionTimerRef.current);
										suggestionTimerRef.current = window.setTimeout(() => setSuggestionVisible(true), 200);
									}}
									onBlur={handleSearchBlur}
								/>
								<Tooltip text={t("view.eventManager.actions.clearSearch")}>
								<button
									className="clear-search"
									onClick={() => {
										setSearchTerm("");
										if (searchTerm === "") {
											toggleSearch();
										}
									}}
								>
									✕
								</button>
							</Tooltip>
								{searchFocused && suggestionVisible && (
									<div className="yg-search-suggestions">
										{suggestion.mode === "tokens" && (
											<div className="yg-search-token-chips">
												{["@year:", "@month:", "@type:"].map((token) => (
													<button
														key={token}
														className="yg-search-chip"
														onMouseDown={(e) => {
															e.preventDefault();
															setSearchTerm((prev) => prev.trim() ? prev.trim() + ' ' + token : token);
															searchInputRef.current?.focus();
														}}
													>
														{token}
													</button>
												))}
											</div>
										)}
										{suggestion.mode === "type-candidates" &&
											suggestion.candidates.length > 0 && (
												<div className="yg-search-type-candidates">
													{suggestion.candidates.map((pt) => (
														<button
															key={pt.id}
															className="yg-search-candidate"
															onMouseDown={(e) => {
																e.preventDefault();
																const completed = searchTerm.replace(
																	/@type:[^\s@]*$/i,
																	`@type:${pt.name} `
																);
																setSearchTerm(completed);
																searchInputRef.current?.focus();
															}}
														>
															{pt.emoji} {pt.name}
														</button>
													))}
												</div>
											)}
									</div>
								)}
							</>
						) : (
							<Tooltip text={t("view.eventManager.actions.search")}>
								<button
									className="search-toggle"
									onClick={toggleSearch}
								>
									🔍
								</button>
							</Tooltip>
						)}
					</div>

					<SortControls
						sortFieldValue={sortField}
						sortDirectionValue={sortDirection}
						onSortChange={handleSortChange}
					/>
					<Tooltip text={t("view.eventManager.actions.yearlyCalendar")}>
						<button
							className="yearly-calendar-button"
							onClick={handleYearlyCalendar}
						>
							🔭
						</button>
					</Tooltip>

					<Tooltip text={t("view.yearlyGlance.actions.form")}>
						<button
							className="add-event-button"
							onClick={handleAddEvent}
						>
							✏️
						</button>
					</Tooltip>
				</div>
			</div>

			<div className="event-manager-content">
				<EventList
					events={getCurrentEvents()}
					onEdit={handleEditEvent}
					onDelete={(e) => { void handleDeleteEvent(e); }}
					eventType={activeTab}
					sortField={sortField}
					sortDirection={sortDirection}
					isSearchMode={isSearching}
					gregorianDisplayFormat={gregorianDisplayFormat}
					plugin={plugin}
				/>
			</div>
		</div>
	);
};
