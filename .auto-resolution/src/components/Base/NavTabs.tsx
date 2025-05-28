import * as React from "react";
import "./style/NavTabs.css";

interface NavTab {
	label: string;
	value: string;
	icon?: React.ReactNode;
	count?: number;
}

interface NavTabsProps {
	tabs: NavTab[];
	activeTab: string;
	onClick: (tab: string) => void;
	className?: string;
	showCounts?: boolean;
	searchMode?: boolean;
}

export const NavTabs: React.FC<NavTabsProps> = ({
	tabs,
	activeTab,
	onClick,
	className = "",
	showCounts = false,
	searchMode = false,
}) => {
	React.useEffect(() => {
		setActive(activeTab);
	}, [activeTab]);

	const [active, setActive] = React.useState(activeTab);

	const handleClick = (tab: string) => {
		setActive(tab);
		onClick(tab);
	};

	return (
		<div className={`yg-nav-tabs ${className}`}>
			{tabs.map((tab) => (
				<div
					key={tab.value}
					className={`yg-nav-tab ${
						active === tab.value && !searchMode ? "active" : ""
					} ${searchMode ? "search-mode" : ""}`}
					onClick={() => handleClick(tab.value)}
				>
					{tab.icon && (
						<span className="yg-nav-tab-icon">{tab.icon}</span>
					)}
					<span className="yg-nav-tab-label">{tab.label}</span>
					{showCounts && typeof tab.count !== "undefined" && (
						<span className="yg-nav-tab-count">{tab.count}</span>
					)}
				</div>
			))}
		</div>
	);
};
