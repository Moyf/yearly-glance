import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jestBin = path.resolve(__dirname, "../node_modules/jest/bin/jest.js");

const forwardedArgs = process.argv.slice(2).map((arg) => {
	if (arg === "--testPathPattern") {
		return "--testPathPatterns";
	}

	if (arg.startsWith("--testPathPattern=")) {
		return arg.replace("--testPathPattern=", "--testPathPatterns=");
	}

	return arg;
});

const result = spawnSync(
	process.execPath,
	[jestBin, ...forwardedArgs],
	{ stdio: "inherit" }
);

if (result.error) {
	throw result.error;
}

process.exit(result.status ?? 1);
