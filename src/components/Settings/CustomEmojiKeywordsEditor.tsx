import * as React from "react";

interface CustomEmojiKeywordsEditorProps {
	value: Record<string, string[]>;
	onChange: (value: Record<string, string[]>) => void;
}

/**
 * Parse text format like:
 * 😂: lol, 笑死
 * 🎉: party
 *
 * Tolerant of format variations (no colon, extra spaces, etc.)
 */
function parseKeywordsText(text: string): Record<string, string[]> {
	const result: Record<string, string[]> = {};
	const lines = text.split("\n");

	// Regex to match: emoji (optionally followed by colon/comma) then keywords
	// Supports lines like:
	//   😂: lol, 笑死
	//   😂 lol, 笑死
	//   😂 lol 笑死
	const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		// Find emoji at start of line
		emojiRegex.lastIndex = 0;
		const match = emojiRegex.exec(trimmed);
		if (!match) continue;

		const emoji = match[0];
		// Get the rest of the line after the emoji (match.index gives correct position)
		const rest = trimmed.slice(match.index + match[0].length).trim();
		// Remove leading colon or comma if present
		const cleaned = rest.replace(/^[:\s,，：]+/, "").trim();

		if (!cleaned) {
			// Just an emoji with no keywords - still include it
			if (!result[emoji]) result[emoji] = [];
			continue;
		}

		// Split by comma (both English and Chinese)
		const keywords = cleaned
			.split(/[,，]/)
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		if (keywords.length > 0) {
			result[emoji] = keywords;
		}
	}

	return result;
}

/**
 * Format keywords to text format:
 * 😂: lol, 笑死
 * 🎉: party
 */
function formatKeywordsText(data: Record<string, string[]>): string {
	return Object.entries(data)
		.map(([emoji, keywords]) => {
			if (keywords.length === 0) return emoji;
			return `${emoji}: ${keywords.join(", ")}`;
		})
		.join("\n");
}

export const CustomEmojiKeywordsEditor: React.FC<
	CustomEmojiKeywordsEditorProps
> = ({ value, onChange }) => {
	const [text, setText] = React.useState(() => formatKeywordsText(value));
	const [isEditing, setIsEditing] = React.useState(false);

	// Sync from prop when not editing
	React.useEffect(() => {
		if (!isEditing) {
			setText(formatKeywordsText(value));
		}
	}, [value, isEditing]);

	const handleFocus = () => {
		setIsEditing(true);
	};

	const handleBlur = () => {
		setIsEditing(false);
		const parsed = parseKeywordsText(text);
		onChange(parsed);
		// Reformat after save
		setText(formatKeywordsText(parsed));
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setText(e.target.value);
	};

	return (
		<textarea
			className="yg-custom-emoji-keywords-editor"
			value={text}
			onChange={handleChange}
			onFocus={handleFocus}
			onBlur={handleBlur}
			rows={6}
			placeholder={"😂: lol, 笑死\n🎉: party, 庆祝"}
			spellCheck={false}
		/>
	);
};
