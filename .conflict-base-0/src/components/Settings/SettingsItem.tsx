import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SettingsItemProps {
	name: string;
	desc?: string;
	icon?: React.ReactNode;
	children?: React.ReactNode;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
	name,
	desc,
	icon,
	children,
	collapsible,
	defaultCollapsed,
}) => {
	const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

	return (
		<div
			className={`yg-settings-item ${
				collapsible ? "is-collapsible" : ""
			}`}
		>
			<div className="yg-settings-item-info">
				<div
					className="yg-settings-item-heading"
					onClick={
						collapsible
							? () => setIsCollapsed(!isCollapsed)
							: undefined
					}
				>
					{icon && (
						<span className="yg-settings-item-icon">{icon}</span>
					)}
					<div className="yg-settings-item-name">{name}</div>
					{collapsible && (
						<span className="yg-settings-item-collapse-icon">
							{isCollapsed ? (
								<ChevronRight size={16} />
							) : (
								<ChevronDown size={16} />
							)}
						</span>
					)}
				</div>
				{desc && (
					<div className="yg-settings-item-description">{desc}</div>
				)}
			</div>
			{children && !isCollapsed && (
				<div className="yg-settings-item-control">{children}</div>
			)}
		</div>
	);
};
