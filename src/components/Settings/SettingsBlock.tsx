import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SettingsBlockProps {
	name: string;
	desc?: string;
	icon?: React.ReactNode;
	children?: React.ReactNode;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
	onCollapse?: (collapsed: boolean) => void;
}

export const SettingsBlock: React.FC<SettingsBlockProps> = ({
	name,
	desc,
	icon,
	children,
	collapsible,
	defaultCollapsed,
	onCollapse,
}) => {
	const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

	const handleToggle = () => {
		const next = !isCollapsed;
		setIsCollapsed(next);
		onCollapse?.(next);
	};

	return (
		<div
			className={`yg-settings-block ${
				collapsible ? "is-collapsible" : ""
			}`}
		>
			<div className="yg-settings-block-info">
				<div
					className="yg-settings-block-heading"
					onClick={collapsible ? handleToggle : undefined}
				>
					{icon && (
						<span className="yg-settings-block-icon">{icon}</span>
					)}
					<div className="yg-settings-block-name">{name}</div>
					{collapsible && (
						<span className="yg-settings-block-collapse-icon">
							{isCollapsed ? (
								<ChevronRight size={16} />
							) : (
								<ChevronDown size={16} />
							)}
						</span>
					)}
				</div>
				{desc && (
					<div className="yg-settings-block-description">{desc}</div>
				)}
			</div>
			{children && !isCollapsed && (
				<div className="yg-settings-block-control">{children}</div>
			)}
		</div>
	);
};
