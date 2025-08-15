import * as React from "react";
import "./style/AutoComplete.css";

export interface AutoCompleteItem {
	id: string;
	value: string;
	label: string;
	description?: string;
}

interface AutoCompleteProps {
	label?: React.ReactNode;
	value: string;
	valueLabel?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	items: AutoCompleteItem[] | (() => AutoCompleteItem[]);
	disabled?: boolean;
	className?: string;
}

export const AutoComplete: React.FC<AutoCompleteProps> = ({
	label,
	value,
	valueLabel,
	onChange,
	placeholder,
	items,
	disabled = false,
	className = "",
}) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");
	const [filteredItems, setFilteredItems] = React.useState<
		AutoCompleteItem[]
	>([]);
	const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

	const containerRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const listRef = React.useRef<HTMLDivElement>(null);

	// 获取选项列表
	const getItemList = React.useCallback(() => {
		return typeof items === "function" ? items() : items;
	}, [items]);

	// 过滤选项
	React.useEffect(() => {
		const itemList = getItemList();
		if (!searchTerm) {
			setFilteredItems(itemList);
		} else {
			const filtered = itemList.filter(
				(item) =>
					item.label
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					item.value
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(item.description &&
						item.description
							.toLowerCase()
							.includes(searchTerm.toLowerCase()))
			);
			setFilteredItems(filtered);
		}
		setHighlightedIndex(-1);
	}, [searchTerm, getItemList]);

	// 处理点击外部关闭
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSearchTerm("");
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [isOpen]);

	// 处理键盘导航
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen) {
			if (e.key === "Enter" || e.key === "ArrowDown") {
				setIsOpen(true);
				e.preventDefault();
			}
			return;
		}

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prev) =>
					prev < filteredItems.length - 1 ? prev + 1 : 0
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prev) =>
					prev > 0 ? prev - 1 : filteredItems.length - 1
				);
				break;
			case "Enter":
				e.preventDefault();
				if (
					highlightedIndex >= 0 &&
					highlightedIndex < filteredItems.length
				) {
					handleSelectItem(filteredItems[highlightedIndex]);
				}
				break;
			case "Escape":
				setIsOpen(false);
				setSearchTerm("");
				inputRef.current?.blur();
				break;
		}
	};

	// 滚动到高亮项
	React.useEffect(() => {
		if (highlightedIndex >= 0 && listRef.current) {
			const highlightedElement = listRef.current.children[
				highlightedIndex
			] as HTMLElement;
			if (highlightedElement) {
				highlightedElement.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
			}
		}
	}, [highlightedIndex]);

	const handleSelectItem = (item: AutoCompleteItem) => {
		onChange(item.value);
		setIsOpen(false);
		setSearchTerm("");
		inputRef.current?.blur();
	};

	const handleInputFocus = () => {
		setIsOpen(true);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const displayValue = isOpen ? searchTerm : valueLabel || value;

	return (
		<div className={`yg-autocomplete ${className}`} ref={containerRef}>
			{label && <label className="autocomplete-label">{label}</label>}

			<div
				className={`autocomplete-input-container ${
					isOpen ? "open" : ""
				} ${disabled ? "disabled" : ""}`}
			>
				<input
					ref={inputRef}
					type="text"
					value={displayValue}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					className="autocomplete-input"
				/>
			</div>

			{isOpen && (
				<div className="autocomplete-dropdown" ref={listRef}>
					{filteredItems.length === 0 ? (
						<div className="autocomplete-empty">NULL</div>
					) : (
						filteredItems.map((item, index) => (
							<div
								key={item.id}
								className={`autocomplete-item ${
									index === highlightedIndex
										? "highlighted"
										: ""
								} ${item.value === value ? "selected" : ""}`}
								onClick={() => handleSelectItem(item)}
								onMouseEnter={() => setHighlightedIndex(index)}
							>
								<div className="autocomplete-item-label">
									{item.label}
								</div>
								{item.description && (
									<div className="autocomplete-item-description">
										{item.description}
									</div>
								)}
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
};
