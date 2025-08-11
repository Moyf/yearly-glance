import * as React from "react";
import { ArrowDown10, ArrowDownZA, ArrowUp01, ArrowUpAZ } from "lucide-react";
import { Select } from "@/src/components/Base/Select";
import { t } from "@/src/i18n/i18n";
import "./style/SortControls.css";
import { TranslationKeys } from "@/src/i18n/types";

// 定义排序类型和方向
export type SortField = "name" | "date";
export type SortDirection = "asc" | "desc";

export const SORT_FIELD_OPTIONS = [
	{ value: "name", label: t("view.eventManager.actions.sort.name") },
	{ value: "date", label: t("view.eventManager.actions.sort.date") },
];

interface SortControlsProps {
	sortFieldValue: SortField;
	sortDirectionValue: SortDirection;
	onSortChange: (field: SortField, direction: SortDirection) => void;
}

export const SortControls: React.FC<SortControlsProps> = ({
	sortFieldValue = "date",
	sortDirectionValue = "asc",
	onSortChange,
}) => {
	const [sortField, setSortField] = React.useState<SortField>(sortFieldValue);
	const [sortDirection, setSortDirection] =
		React.useState<SortDirection>(sortDirectionValue);
	const [sortExpanded, setSortExpanded] = React.useState(false);
	const sortContainerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		onSortChange(sortField, sortDirection);
	}, [sortField, sortDirection]);

	const toggleSort = () => {
		setSortExpanded(!sortExpanded);
	};

	const handleSortFieldChange = (value: SortField) => {
		setSortField(value);
	};
	const handleSortDirectionChange = () => {
		if (sortDirection === "asc") {
			setSortDirection("desc");
		} else {
			setSortDirection("asc");
		}
	};

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				sortContainerRef.current &&
				!sortContainerRef.current.contains(event.target as Node) &&
				sortExpanded
			) {
				setSortExpanded(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [sortExpanded]);

	return (
		<div
			ref={sortContainerRef}
			className={`yg-sort-controls ${sortExpanded ? "expanded" : ""}`}
		>
			{sortExpanded ? (
				<>
					<div className="yg-sort-field">
						<Select
							value={sortField}
							options={SORT_FIELD_OPTIONS}
							onValueChange={handleSortFieldChange}
						/>
					</div>
					<div className="yg-sort-sortDirection">
						<button
							className="clickable-icon"
							onClick={handleSortDirectionChange}
							title={t(
								`view.eventManager.actions.sort.${sortDirection}` as TranslationKeys
							)}
						>
							{sortDirection === "asc" &&
								sortField === "name" && <ArrowUpAZ />}
							{sortDirection === "desc" &&
								sortField === "name" && <ArrowDownZA />}
							{sortDirection === "asc" &&
								sortField === "date" && <ArrowUp01 />}
							{sortDirection === "desc" &&
								sortField === "date" && <ArrowDown10 />}
						</button>
					</div>
				</>
			) : (
				<button className="yg-sort-button" onClick={toggleSort}>
					🎢
				</button>
			)}
		</div>
	);
};
