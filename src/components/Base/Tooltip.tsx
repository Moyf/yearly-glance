import { HelpCircle } from "lucide-react";
import * as React from "react";
import "./style/Tooltip.css";

interface TooltipProps {
	text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
	const [isVisible, setIsVisible] = React.useState(false);

	return (
		<div className="yg-tooltip-container">
			<HelpCircle
				size={16}
				className="yg-tooltip-icon"
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
				aria-label="Help"
			/>
			{isVisible && (
				<div
					className="yg-tooltip-content"
					dangerouslySetInnerHTML={{ __html: text }}
				/>
			)}
		</div>
	);
};
