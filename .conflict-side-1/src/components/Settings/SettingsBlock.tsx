import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SettingsBlockProps {
	name: string;
	desc?: string;
	icon?: React.ReactNode;
	children?: React.ReactNode;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
}

export const SettingsBlock: React.FC<SettingsBlockProps> = ({
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
			className={`yg-settings-block ${
				collapsible ? "is-collapsible" : ""
			}`}
		>
			<div className="yg-settings-block-info">
				<div
					className="yg-settings-block-heading"
					onClick={
						collapsible
							? () => setIsCollapsed(!isCollapsed)
							: undefined
					}
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
