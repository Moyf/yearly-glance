import * as React from "react";
import { createPortal } from "react-dom";
import { EMOJI_DATA, buildEmojiKeywordMap } from "@/src/data/emojiData";
import type YearlyGlancePlugin from "@/src/main";
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

	// Get custom keywords from plugin settings
	const customKeywords: Record<string, string[]> = React.useMemo(() => {
		if (!plugin) return {};
		return plugin.getConfig().customEmojiKeywords || {};
	}, [plugin]);

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
			name: "⭐ 自定义",
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

	// Add custom keyword inline
	const handleAddKeyword = async () => {
		if (!plugin || !newKeywordEmoji.trim() || !newKeywordText.trim()) return;

		const emoji = newKeywordEmoji.trim();
		const keyword = newKeywordText.trim();
		const current = plugin.getConfig().customEmojiKeywords || {};
		const existing = current[emoji] || [];

		if (existing.includes(keyword)) return;

		const updated = {
			...current,
			[emoji]: [...existing, keyword],
		};

		await plugin.updateConfig({
			...plugin.getConfig(),
			customEmojiKeywords: updated,
		});

		setNewKeywordEmoji("");
		setNewKeywordText("");
	};

	const handleRemoveKeyword = async (emoji: string, keyword: string) => {
		if (!plugin) return;
		const current = { ...(plugin.getConfig().customEmojiKeywords || {}) };
		const existing = current[emoji] || [];
		const updated = existing.filter((kw) => kw !== keyword);

		if (updated.length === 0) {
			delete current[emoji];
		} else {
			current[emoji] = updated;
		}

		await plugin.updateConfig({
			...plugin.getConfig(),
			customEmojiKeywords: current,
		});
	};

	const popover = isOpen
		? createPortal(
				<div
					className="yg-emoji-picker-popover"
					ref={popoverRef}
					style={popoverStyle}
				>
					{/* Search input */}
					<input
						className="yg-emoji-search"
						type="text"
						placeholder="搜索 emoji..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						autoFocus
					/>

					{/* Custom keyword management (collapsible) */}
					{plugin && (
						<div className="yg-emoji-keyword-section">
							<div
								className="yg-emoji-keyword-header"
								onClick={() => setKeywordSectionOpen(!keywordSectionOpen)}
							>
								<span className="yg-emoji-keyword-header-text">
									⚙️ 快捷词管理
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
											暂无自定义关键词
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
																title="删除"
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
											placeholder="emoji"
											value={newKeywordEmoji}
											onChange={(e) =>
												setNewKeywordEmoji(e.target.value)
											}
											className="yg-emoji-keyword-input-emoji"
										/>
										<input
											type="text"
											placeholder="关键词"
											value={newKeywordText}
											onChange={(e) =>
												setNewKeywordText(e.target.value)
											}
											onKeyDown={(e) => {
												if (e.key === "Enter")
													handleAddKeyword();
											}}
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
								</div>
							)}
						</div>
					)}

					{/* Emoji grid */}
					<div className="yg-emoji-grid-container">
						{filteredCategories.map((category) => (
							<div key={category.name} className="yg-emoji-category">
								<div className="yg-emoji-category-label">
									{category.name}
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
							<div className="yg-emoji-empty">未找到匹配的 emoji</div>
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
				title="选择 emoji"
			>
				😀
			</button>
			{popover}
		</>
	);
};
