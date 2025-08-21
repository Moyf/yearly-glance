import * as React from "react";
import { Check, Copy } from "lucide-react";
import "./style/Pre.css";

interface PreProps {
	children: React.ReactNode;
	className?: string;
	language?: string;
	showCopyButton?: boolean;
	title?: string;
}

export const Pre: React.FC<PreProps> = ({
	children,
	className = "",
	language,
	showCopyButton = true,
	title,
}) => {
	const [copied, setCopied] = React.useState(false);
	const preRef = React.useRef<HTMLPreElement>(null);

	const handleCopy = async () => {
		if (!preRef.current) return;

		try {
			const textContent = preRef.current.textContent || "";
			await navigator.clipboard.writeText(textContent);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy text:", error);
		}
	};

	const preClassName = [
		"yg-pre",
		language && `language-${language}`,
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className="yg-pre-wrapper">
			{title && <div className="yg-pre-title">{title}</div>}
			{showCopyButton && (
				<button
					className={`yg-pre-copy-button ${copied ? "copied" : ""}`}
					onClick={handleCopy}
					title={copied ? "Copied!" : "Copy to clipboard"}
				>
					{copied ? <Check size={16} /> : <Copy size={16} />}
				</button>
			)}
			<pre ref={preRef} className={preClassName}>
				{children}
			</pre>
		</div>
	);
};
