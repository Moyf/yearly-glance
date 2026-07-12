import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, parse, resolve } from "node:path";

export function getVaultPath(startDirectory) {
	const start = resolve(startDirectory);
	const envResult = findEnvValue("VAULT_PATH", start);
	const configuredPath = process.env.VAULT_PATH?.trim() || envResult?.value;
	if (!configuredPath) throw new Error("VAULT_PATH is not set. Add it to .env in this repository or a parent directory.");
	return isAbsolute(configuredPath) ? configuredPath : resolve(envResult?.directory ?? start, configuredPath);
}

function findEnvValue(key, startDirectory) {
	let directory = resolve(startDirectory);
	const root = parse(directory).root;
	while (true) {
		const envPath = join(directory, ".env");
		if (existsSync(envPath)) {
			const value = parseEnvValue(readFileSync(envPath, "utf8"), key);
			if (value !== undefined) return { value, directory };
		}
		if (directory === root) return null;
		directory = dirname(directory);
	}
}

function parseEnvValue(contents, key) {
	for (const line of contents.split(/\r?\n/u)) {
		const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/u);
		if (!match || match[1] !== key) continue;
		const raw = match[2].trim();
		if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) return raw.slice(1, -1);
		return raw.replace(/\s+#.*$/u, "").trim();
	}
	return undefined;
}
