#!/usr/bin/env node

import { loadEnv } from "./load-env.mjs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import AITranslator from "./ai-translator.mjs";

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnv(path.resolve(__dirname, "../.env"));

const execAsync = promisify(exec);

// 检测文本语言
function detectLanguage(text) {
	if (!text) return "unknown";

	// 移除链接、格式化标记和符号，只检测实际文本内容
	const cleanText = text
		.replace(/\[.*?\]\(.*?\)/g, "") // 移除markdown链接
		.replace(/\(.*?https?:\/\/.*?\)/g, "") // 移除URL链接
		.replace(/\*\*/g, "") // 移除粗体标记
		.replace(/[#()[\]]/g, "") // 移除特殊符号
		.replace(/\d+/g, "") // 移除数字
		.replace(/closes|fixes|resolves/gi, "") // 移除英文关键词
		.trim();

	if (!cleanText) return "unknown";

	const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g);
	const chineseCount = chineseChars ? chineseChars.length : 0;
	const totalChars = cleanText.length;

	// 如果中文字符占比超过15%，认为是中文
	return chineseCount / totalChars > 0.15 ? "zh" : "en";
}

// 翻译changelog内容
async function translateChangelogContent(content, targetLanguage) {
	if (!content) return content;

	const translator = new AITranslator();
	const lines = content.split("\n");
	const translatedLines = [];

	console.log(
		`🌐 Translating ${lines.length} lines to ${
			targetLanguage === "zh" ? "Chinese" : "English"
		}...`
	);

	let translationCount = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// 跳过空行、标题行和特殊格式行
		if (
			!line.trim() ||
			line.startsWith("#") ||
			line.startsWith("<!--") ||
			(line.includes("](") && !line.includes("* ")) || // 跳过链接，但保留commit行
			/^\s*$/.test(line)
		) {
			translatedLines.push(line);
			continue;
		}

		// 检测并翻译commit行
		const commitMatch = line.match(/^(\* )(.+)$/);
		if (commitMatch) {
			const prefix = commitMatch[1];
			const commitText = commitMatch[2];
			const textLang = detectLanguage(commitText);

			// 只翻译需要翻译的内容
			const shouldTranslate =
				(targetLanguage === "zh" && textLang === "en") ||
				(targetLanguage === "en" && textLang === "zh");

			if (shouldTranslate) {
				try {
					console.log(
						`  🌐 [${i + 1}/${
							lines.length
						}] Translating: "${commitText.substring(
							0,
							50
						)}..." (${textLang} → ${targetLanguage})`
					);
					const translatedText = await translator.translateText(
						commitText,
						targetLanguage === "zh" ? "Chinese" : "English"
					);
					console.log(
						`  ✅ Result: "${translatedText.substring(0, 50)}..."`
					);
					translatedLines.push(prefix + translatedText);
					translationCount++;

					// 添加延迟避免API限流
					await new Promise((resolve) => setTimeout(resolve, 100));
				} catch (error) {
					console.warn(
						`❌ Failed to translate line: ${commitText.substring(
							0,
							50
						)}...`,
						error.message
					);
					translatedLines.push(line);
				}
			} else {
				translatedLines.push(line);
			}
		} else {
			translatedLines.push(line);
		}
	}

	console.log(
		`📊 Translation summary: ${translationCount} lines translated.`
	);
	return translatedLines.join("\n");
}

async function generateTranslatedChangelog(mode = "update") {
	try {
		console.log("🚀 Starting changelog generation with translation...");

		// 决定是全量生成还是增量更新
		const releaseFlag = mode === "all" ? "-r 0" : "";

		console.log("📝 Generating original changelogs...");

		// 生成原始版本（不翻译）
		await execAsync(
			`npx conventional-changelog -p angular -i CHANGELOG.md -s -u ${releaseFlag} -n ./scripts/changelog-option.js`
		);
		await execAsync(
			`npx conventional-changelog -p angular -i CHANGELOG-zh.md -s -u ${releaseFlag} -n ./scripts/changelog-option-zh.js`
		);

		console.log("📖 Reading generated changelogs...");

		// 读取生成的changelog
		const changelogEn = await fs.readFile(
			path.join(__dirname, "../CHANGELOG.md"),
			"utf-8"
		);
		const changelogZh = await fs.readFile(
			path.join(__dirname, "../CHANGELOG-zh.md"),
			"utf-8"
		);

		console.log("🌐 Starting translation process...");

		// 翻译英文版本（将中文commit翻译为英文）
		console.log("\n📝 Processing English changelog...");
		const translatedEnContent = await translateChangelogContent(
			changelogEn,
			"en"
		);

		// 翻译中文版本（将英文commit翻译为中文）
		console.log("\n📝 Processing Chinese changelog...");
		const translatedZhContent = await translateChangelogContent(
			changelogZh,
			"zh"
		);

		console.log("💾 Writing translated changelogs...");

		// 写入翻译后的内容
		await fs.writeFile(
			path.join(__dirname, "../CHANGELOG.md"),
			translatedEnContent
		);
		await fs.writeFile(
			path.join(__dirname, "../CHANGELOG-zh.md"),
			translatedZhContent
		);

		console.log(
			"✅ Changelog generation with translation completed successfully!"
		);
	} catch (error) {
		console.error("❌ Error generating translated changelog:", error);
		process.exit(1);
	}
}

// 处理命令行参数
const args = process.argv.slice(2);
const mode = args.includes("--all") || args.includes("-a") ? "all" : "update";

generateTranslatedChangelog(mode);
