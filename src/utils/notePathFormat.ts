/**
 * Parse a note event file name format string into a file path.
 * Supports:
 * - {event_name} — replaced with the event title
 * - Moment.js date tokens (YYYY, MM, DD, YY, etc.)
 * - [text] — literal text, not interpreted as date tokens
 *
 * @param format - The format string, e.g. "YYYY-MM/YYMMDD_{event_name}"
 * @param eventName - The event title to substitute
 * @param isoDate - The event date in YYYY-MM-DD format
 * @returns The formatted path (without root folder prefix or .md extension)
 */
export function formatNoteEventPath(
	format: string,
	eventName: string,
	isoDate: string
): string {
	if (!format || format.trim() === "") {
		return eventName;
	}

	const protectedValues: string[] = [];
	const protect = (value: string) => {
		protectedValues.push(value);
		return `\uE000${protectedValues.length - 1}\uE001`;
	};

	let result = format.replace(/\[([^\]]*)\]/g, (_, content: string) => {
		return protect(content);
	});

	result = result.replace(/\{event_name\}/g, () => protect(eventName));

	const momentFn = (window).moment;
	if (momentFn && isoDate) {
		const parsedDate = momentFn(isoDate, ["YYYY-MM-DD", "MM-DD"], true);
		if (parsedDate.isValid()) {
			result = parsedDate.format(result);
		}
	}

	return result.replace(/\uE000(\d+)\uE001/g, (_, index: string) => {
		return protectedValues[parseInt(index, 10)] ?? "";
	});
}

/**
 * Generate a preview of what the note path would look like given the current settings.
 */
export function previewNoteEventPath(
	rootFolder: string,
	format: string,
	eventName: string,
	isoDate: string
): string {
	const formatted = formatNoteEventPath(
		format,
		eventName || "EventName",
		isoDate
	);
	const normalizedRoot = rootFolder?.trim().replace(/[\\/]+$/, "") || "";
	return normalizedRoot
		? `${normalizedRoot}/${formatted}.md`
		: `${formatted}.md`;
}
