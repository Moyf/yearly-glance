#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "fs";
import readline from "readline";

// 检查是否为直接调用模式
const directVersion = process.argv[2];
const isDirectMode = !!directVersion;

// 如果是直接调用模式，直接更新版本
if (isDirectMode) {
	updateAllFiles(directVersion);
	process.exit(0);
}

// 否则，启动交互式模式
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// 获取当前版本
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const currentVersion = packageJson.version;
console.log(`当前版本: ${currentVersion}`);

// 解析版本号
const [major, minor, patch] = currentVersion.split(".").map(Number);

// 显示选项
console.log("\n请选择版本更新类型:");
console.log(`1. 主版本 (${major + 1}.0.0)`);
console.log(`2. 次版本 (${major}.${minor + 1}.0)`);
console.log(`3. 补丁版本 (${major}.${minor}.${patch + 1})`);
console.log(`4. 自定义版本`);
console.log(`5. Beta 版本 (${currentVersion}-beta.1)`);

rl.question("\n请输入选项 (1-5): ", (answer) => {
	let newVersion;
	let isBeta = false;

	switch (answer) {
		case "1":
			newVersion = `${major + 1}.0.0`;
			break;
		case "2":
			newVersion = `${major}.${minor + 1}.0`;
			break;
		case "3":
			newVersion = `${major}.${minor}.${patch + 1}`;
			break;
		case "4":
			rl.question("请输入自定义版本号 (x.y.z): ", (customVersion) => {
				isBeta = customVersion.includes("-beta");
				updateAllFiles(customVersion, isBeta);
				rl.close();
			});
			return;
		case "5":
			// 检查当前版本是否已经是 beta
			if (currentVersion.includes("-beta.")) {
				const betaRegex = /-beta\.(\d+)$/;
				const match = currentVersion.match(betaRegex);
				if (match) {
					const betaNum = parseInt(match[1], 10);
					newVersion = currentVersion.replace(
						betaRegex,
						`-beta.${betaNum + 1}`
					);
				} else {
					newVersion = `${currentVersion}-beta.1`;
				}
			} else {
				newVersion = `${currentVersion}-beta.1`;
			}
			isBeta = true;
			break;
		default:
			console.log("无效选项，使用补丁版本更新");
			newVersion = `${major}.${minor}.${patch + 1}`;
	}

	updateAllFiles(newVersion, isBeta);
	rl.close();
});

/**
 * 更新所有相关文件的版本号
 * @param {string} version 新版本号
 * @param {boolean} isBeta 是否为Beta版本
 */
function updateAllFiles(version, isBeta = false) {
	try {
		console.log(`\n正在更新至版本 ${version}...`);

		// 1. 更新 package.json
		updatePackageJson(version);

		// 2. 更新 manifest.json 或 manifest-beta.json
		const minAppVersion = updateManifestJson(version, isBeta);

		// 3. 更新 versions.json
		updateVersionsJson(version, minAppVersion);

		// 提示提交更改
		console.log("\n版本已更新。建议执行以下命令:");
		if (isBeta) {
			console.log(
				`git add package.json manifest-beta.json versions.json`
			);
		} else {
			console.log(`git add package.json manifest.json versions.json`);
		}
		console.log(`git commit -m "build: bump version to ${version}"`);
		console.log(`git tag ${version}`);

		console.log("\n版本更新完成！");
	} catch (error) {
		console.error("更新版本时出错:", error);
		process.exit(1);
	}
}

/**
 * 更新 package.json 文件
 * @param {string} version 新版本号
 */
function updatePackageJson(version) {
	try {
		const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
		packageJson.version = version;
		writeFileSync(
			"package.json",
			JSON.stringify(packageJson, null, "\t") + "\n"
		);
		console.log(`已更新 package.json 版本至 ${version}`);
	} catch (error) {
		console.error("更新 package.json 时出错:", error);
		throw error;
	}
}

/**
 * 更新 manifest.json 或 manifest-beta.json 文件
 * @param {string} version 新版本号
 * @param {boolean} isBeta 是否为Beta版本
 * @returns {string} 最低应用版本
 */
function updateManifestJson(version, isBeta = false) {
	try {
		const manifestFile = isBeta ? "manifest-beta.json" : "manifest.json";

		// 检查文件是否存在
		if (!existsSync(manifestFile) && isBeta) {
			// 如果manifest-beta.json不存在，则从manifest.json复制一份
			if (existsSync("manifest.json")) {
				const manifest = JSON.parse(
					readFileSync("manifest.json", "utf8")
				);
				manifest.version = version;
				writeFileSync(
					manifestFile,
					JSON.stringify(manifest, null, "\t") + "\n"
				);
				console.log(`已创建并更新 ${manifestFile} 版本至 ${version}`);
				return manifest.minAppVersion;
			}
		}

		const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
		const { minAppVersion } = manifest;
		manifest.version = version;
		writeFileSync(
			manifestFile,
			JSON.stringify(manifest, null, "\t") + "\n"
		);
		console.log(`已更新 ${manifestFile} 版本至 ${version}`);
		return minAppVersion;
	} catch (error) {
		console.error(`更新 manifest 文件时出错:`, error);
		throw error;
	}
}

/**
 * 更新 versions.json 文件
 * @param {string} version 新版本号
 * @param {string} minAppVersion 最低应用版本
 */
function updateVersionsJson(version, minAppVersion) {
	try {
		// 读取或创建 versions.json
		let versions = {};
		try {
			if (existsSync("versions.json")) {
				const versionsContent = readFileSync("versions.json", "utf8");
				if (versionsContent.trim()) {
					versions = JSON.parse(versionsContent);
				}
			}
		} catch (error) {
			console.log("创建新的 versions.json 文件");
		}

		// 更新版本信息
		versions[version] = minAppVersion;
		writeFileSync(
			"versions.json",
			JSON.stringify(versions, null, "\t") + "\n"
		);
		console.log(
			`已更新 versions.json，添加版本 ${version} -> ${minAppVersion}`
		);
	} catch (error) {
		console.error("更新 versions.json 时出错:", error);
		throw error;
	}
}
