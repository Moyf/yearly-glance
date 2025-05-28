/**
 * 执行发版和打标签操作的专用脚本
 */

import { execSync } from "child_process";

// 从 package.json 获取当前版本号
const version = process.env.npm_package_version;
console.log(`📦 Preparing to release version: ${version}`);

try {
	// 执行 git add 操作
	console.log("📝 添加文件到 git...");
	execSync("git add .", { stdio: "inherit" });

	// 执行 git commit 操作
	console.log("💾 创建提交...");
	execSync(`git commit -m "build: ${version}"`, { stdio: "inherit" });

	// 执行 git push 操作
	console.log("🚀 推送到远程...");
	execSync("git push", { stdio: "inherit" });

	// 创建版本标签
	console.log(`🏷️ 创建标签: ${version}`);
	execSync(`git tag ${version}`, { stdio: "inherit" });

	// 推送标签到远程
	console.log("📤 推送标签到远程...");
	execSync("git push --tags", { stdio: "inherit" });

	console.log(`✅ 成功发布版本 ${version}!`);
} catch (error) {
	console.error(`❌ 发布失败: ${error.message}`);
	process.exit(1);
}
