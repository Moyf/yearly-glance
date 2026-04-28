type DebugEnabledGetter = () => boolean;

let isDebugEnabled: DebugEnabledGetter = () => false;

export function setDebugLoggerEnabled(getter: DebugEnabledGetter): void {
	isDebugEnabled = getter;
}

export const logger = {
	debug(message: string, data?: unknown): void {
		if (!isDebugEnabled()) return;
		if (data !== undefined) {
			console.debug(`[YearlyGlance] ${message}`, data);
			return;
		}
		console.debug(`[YearlyGlance] ${message}`);
	},
	info(message: string, data?: unknown): void {
		if (!isDebugEnabled()) return;
		if (data !== undefined) {
			console.info(`[YearlyGlance] ${message}`, data);
			return;
		}
		console.info(`[YearlyGlance] ${message}`);
	},
	warn(message: string, data?: unknown): void {
		if (data !== undefined) {
			console.warn(`[YearlyGlance] ${message}`, data);
			return;
		}
		console.warn(`[YearlyGlance] ${message}`);
	},
	error(message: string, data?: unknown): void {
		if (data !== undefined) {
			console.error(`[YearlyGlance] ${message}`, data);
			return;
		}
		console.error(`[YearlyGlance] ${message}`);
	},
};
