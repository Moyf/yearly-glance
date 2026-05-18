import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 手动解析 .env 文件并注入 process.env
 * 替代 dotenv 包，避免额外依赖
 */
export function loadEnv(envPath) {
	const filePath = envPath ?? resolve(__dirname, "../.env");
	if (!existsSync(filePath)) return;

	const lines = readFileSync(filePath, "utf8").split("\n");
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq === -1) continue;
		const key = trimmed.slice(0, eq).trim();
		const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
		if (key && !(key in process.env)) {
			process.env[key] = val;
		}
	}
}
