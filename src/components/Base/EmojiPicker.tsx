import * as React from "react";
import { createPortal } from "react-dom";
import { EMOJI_DATA, buildEmojiKeywordMap } from "@/src/data/emojiData";
import type YearlyGlancePlugin from "@/src/main";
import { t } from "@/src/i18n/i18n";
import "./style/EmojiPicker.css";

interface EmojiPickerProps {
	value: string;
	onChange: (emoji: string) => void;
	plugin?: YearlyGlancePlugin;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
	value,
	onChange,
	plugin,
}) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [keywordSectionOpen, setKeywordSectionOpen] = React.useState(false);
	const [newKeywordEmoji, setNewKeywordEmoji] = React.useState("");
	const [newKeywordText, setNewKeywordText] = React.useState("");

	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const popoverRef = React.useRef<HTMLDivElement>(null);
	const searchRef = React.useRef<HTMLInputElement>(null);

	// Get custom keywords from plugin settings — use useState for immediate re-render
	const [customKeywords, setCustomKeywords] = React.useState<Record<string, string[]>>(
		() => (plugin ? plugin.getConfig().customEmojiKeywords || {} : {})
	);

	// Build the combined keyword map (built-in + custom)
	const keywordMap = React.useMemo(() => {
		const map = buildEmojiKeywordMap();
		for (const [emoji, keywords] of Object.entries(customKeywords)) {
			if (!map[emoji]) {
				map[emoji] = [];
			}
			// Add custom keywords that aren't already present
			for (const kw of keywords) {
				if (!map[emoji].includes(kw)) {
					map[emoji].push(kw);
				}
			}
		}
		return map;
	}, [customKeywords]);

	// Build custom category if user has custom emojis
	const customCategory = React.useMemo(() => {
		const entries = Object.keys(customKeywords);
		if (entries.length === 0) return null;
		return {
			name: "⭐ " + t("view.emojiPicker.customCategory"),
			emojis: entries.map((emoji) => ({
				emoji,
				keywords: customKeywords[emoji] || [],
			})),
		};
	}, [customKeywords]);

	// Filter emojis based on search
	const filteredCategories = React.useMemo(() => {
		const allCategories = customCategory
			? [customCategory, ...EMOJI_DATA]
			: [...EMOJI_DATA];

		if (!search.trim()) return allCategories;

		const query = search.trim().toLowerCase();
		return allCategories
			.map((category) => {
				const filteredEmojis = category.emojis.filter((entry) => {
					const keywords = keywordMap[entry.emoji] || [];
					return (
						entry.emoji.includes(query) ||
						keywords.some((kw) => kw.toLowerCase().includes(query))
					);
				});
				return { ...category, emojis: filteredEmojis };
			})
			.filter((category) => category.emojis.length > 0);
	}, [search, keywordMap, customCategory]);

	// Position the popover
	const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({});

	const updatePosition = React.useCallback(() => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		const popoverHeight = 360;
		const popoverWidth = 320;

		let top = rect.bottom + 4;
		let left = rect.left;

		// If not enough room below, show above
		if (top + popoverHeight > window.innerHeight) {
			top = rect.top - popoverHeight - 4;
		}
		if (top < 0) top = 4;

		// Keep within viewport horizontally
		if (left + popoverWidth > window.innerWidth) {
			left = window.innerWidth - popoverWidth - 8;
		}
		if (left < 0) left = 4;

		setPopoverStyle({
			position: "fixed",
			top: `${top}px`,
			left: `${left}px`,
			width: `${popoverWidth}px`,
		});
	}, []);

	// Handle click outside to close
	React.useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
				setSearch("");
			}
		};

		const handleScroll = () => {
			if (isOpen) updatePosition();
		};

		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("scroll", handleScroll, true);
		window.addEventListener("resize", updatePosition);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("scroll", handleScroll, true);
			window.removeEventListener("resize", updatePosition);
		};
	}, [isOpen, updatePosition]);

	// Focus search input when popover opens (delayed to avoid Obsidian Modal focus trap)
	React.useEffect(() => {
		if (isOpen && searchRef.current) {
			requestAnimationFrame(() => {
				searchRef.current?.focus();
			});
		}
	}, [isOpen]);

	const togglePopover = () => {
		if (!isOpen) {
			setSearch("");
		}
		setIsOpen(!isOpen);
		// Defer position update so the popover renders first
		if (!isOpen) {
			requestAnimationFrame(() => updatePosition());
		}
	};

	const handleEmojiClick = (emoji: string) => {
		onChange(emoji);
		setIsOpen(false);
		setSearch("");
	};

	const categoryLabel = (key: string): string => {
		const map: Record<string, string> = {
			common: t("view.emojiPicker.categoryCommon"),
			activity: t("view.emojiPicker.categoryActivity"),
			holiday: t("view.emojiPicker.categoryHoliday"),
			emotion: t("view.emojiPicker.categoryEmotion"),
			nature: t("view.emojiPicker.categoryNature"),
			food: t("view.emojiPicker.categoryFood"),
			tech: t("view.emojiPicker.categoryTech"),
			other: t("view.emojiPicker.categoryOther"),
		};
		return map[key] || key;
	};

	// Add custom keyword inline
	const handleAddKeyword = async () => {
		if (!plugin || !newKeywordEmoji.trim() || !newKeywordText.trim()) return;

		try {
			const emoji = newKeywordEmoji.trim();
			// Split by spaces and/or English commas, filter empty tokens
			const newKeywords = newKeywordText
				.split(/[\s,]+/)
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
			if (newKeywords.length === 0) return;

			const current = plugin.getConfig().customEmojiKeywords || {};
			const existing = current[emoji] || [];
			// Merge, deduplicate
			const merged = [...existing];
			for (const kw of newKeywords) {
				if (!merged.includes(kw)) merged.push(kw);
			}

			const updated = {
				...current,
				[emoji]: merged,
			};

		await plugin.updateConfig({
			...plugin.getConfig(),
			customEmojiKeywords: updated,
		});

		// Update local state for immediate re-render
		setCustomKeywords(updated);
		setNewKeywordEmoji("");
		setNewKeywordText("");
		} catch (error) {
			console.error("Failed to add keyword:", error);
		}
	};

	const handleRemoveKeyword = async (emoji: string, keyword: string) => {
		if (!plugin) return;
		const current = { ...(plugin.getConfig().customEmojiKeywords || {}) };
		const existing = current[emoji] || [];
		const updated = existing.filter((kw) => kw !== keyword);

		try {
			if (updated.length === 0) {
				delete current[emoji];
			} else {
				current[emoji] = updated;
			}

		await plugin.updateConfig({
			...plugin.getConfig(),
			customEmojiKeywords: current,
		});

		// Update local state for immediate re-render
		setCustomKeywords({ ...current });
	} catch (error) {
		console.error("Failed to remove keyword:", error);
	}
	};

	const popover = isOpen
		? createPortal(
				<div
					className="yg-emoji-picker-popover"
					ref={popoverRef}
					style={popoverStyle}
					onMouseDown={(e) => e.stopPropagation()}
				>
					{/* Search input */}
				<input
					ref={searchRef}
					className="yg-emoji-search"
					type="text"
					placeholder={t("view.emojiPicker.searchPlaceholder")}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					onFocus={(e) => e.stopPropagation()}
				/>

					{/* Custom keyword management (collapsible) */}
					{plugin && (
						<div className="yg-emoji-keyword-section">
							<div
								className="yg-emoji-keyword-header"
								onClick={() => setKeywordSectionOpen(!keywordSectionOpen)}
							>
								<span className="yg-emoji-keyword-header-text">
									{"⚙️ " + t("view.emojiPicker.keywordManager")}
								</span>
								<span
									className={`yg-emoji-keyword-toggle ${
										keywordSectionOpen ? "open" : ""
									}`}
								>
									▸
								</span>
							</div>
							{keywordSectionOpen && (
								<div className="yg-emoji-keyword-body">
									{/* Existing custom keywords */}
									{Object.entries(customKeywords).length === 0 && (
										<div className="yg-emoji-keyword-empty">
											{t("view.emojiPicker.keywordEmpty")}
										</div>
									)}
									{Object.entries(customKeywords).map(
										([emoji, keywords]) => (
											<div
												key={emoji}
												className="yg-emoji-keyword-row"
											>
												<span className="yg-emoji-keyword-emoji">
													{emoji}
												</span>
												<span className="yg-emoji-keyword-list">
													{keywords.map((kw) => (
														<span
															key={kw}
															className="yg-emoji-keyword-tag"
														>
															{kw}
															<button
																className="yg-emoji-keyword-remove"
																onClick={() =>
																	handleRemoveKeyword(
																		emoji,
																		kw
																	)
																}
																title={t("view.emojiPicker.keywordRemove")}
															>
																×
															</button>
														</span>
													))}
												</span>
											</div>
										)
									)}
									{/* Add new keyword inline */}
									<div className="yg-emoji-keyword-add">
								<input
										type="text"
										placeholder={t("view.emojiPicker.keywordEmojiPlaceholder")}
										value={newKeywordEmoji}
										onChange={(e) =>
											setNewKeywordEmoji(e.target.value)
										}
										onFocus={(e) => e.stopPropagation()}
										className="yg-emoji-keyword-input-emoji"
									/>
									<input
										type="text"
										placeholder={t("view.emojiPicker.keywordTextPlaceholder")}
										value={newKeywordText}
										onChange={(e) =>
											setNewKeywordText(e.target.value)
										}
										onKeyDown={(e) => {
											if (e.key === "Enter")
												handleAddKeyword();
										}}
										onFocus={(e) => e.stopPropagation()}
										className="yg-emoji-keyword-input-text"
									/>
										<button
											className="yg-emoji-keyword-add-btn"
											onClick={handleAddKeyword}
											disabled={
												!newKeywordEmoji.trim() ||
												!newKeywordText.trim()
											}
										>
											+
										</button>
									</div>
									<div className="yg-emoji-keyword-hint">
										{t("view.emojiPicker.keywordSettingsHint")}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Emoji grid */}
					<div className="yg-emoji-grid-container">
						{filteredCategories.map((category) => (
							<div key={category.name} className="yg-emoji-category">
								<div className="yg-emoji-category-label">
									{categoryLabel(category.name)}
								</div>
								<div className="yg-emoji-grid">
									{category.emojis.map((entry) => (
										<button
											key={entry.emoji}
											className={`yg-emoji-item ${
												value === entry.emoji
													? "selected"
													: ""
											}`}
											onClick={() =>
												handleEmojiClick(entry.emoji)
											}
											title={
												keywordMap[entry.emoji]?.join(
													", "
												) || entry.emoji
											}
										>
											{entry.emoji}
										</button>
									))}
								</div>
							</div>
						))}
						{filteredCategories.length === 0 && (
							<div className="yg-emoji-empty">{t("view.emojiPicker.noResults")}</div>
						)}
					</div>
				</div>,
				document.body
		  )
		: null;

	return (
		<>
			<button
				className={`yg-emoji-trigger ${isOpen ? "active" : ""}`}
				ref={triggerRef}
				onClick={togglePopover}
				type="button"
				title="Select emoji"
			>
				😀
			</button>
			{popover}
		</>
	);
};
