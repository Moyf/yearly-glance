import * as React from "react";
import "./style/CalloutBlock.css";

interface CalloutBlockProps {
	title?: string;
	icon?: React.ReactNode;
	content?: React.ReactNode;
	children?: React.ReactNode;
	type?: string;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
	title,
	icon,
	content,
	children,
	type = "info",
}) => {
	return (
		<div
			className={`callout yg-callout yg-callout-${type}`}
			data-callout={type}
		>
			{(title || icon) && (
				<div className="yg-callout-title callout-title">
					{icon}
					{title && (
						<span className="yg-callout-title-text">{title}</span>
					)}
				</div>
			)}
			{(content || children) && (
				<div className="yg-callout-content callout-content">
					{content}
					{children}
				</div>
			)}
		</div>
	);
};
