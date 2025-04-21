/**
 * 执行发版和打标签操作的专用脚本
 */

import { execSync } from "child_process";

// 从 package.json 获取当前版本号
const version = process.env.npm_package_version;
console.log(`📦 Preparing to release version: ${version}`);

try {
	// 执行 git add 操作
	console.log("📝 Adding files to git...");
	execSync("git add .", { stdio: "inherit" });

	// 执行 git commit 操作
	console.log("💾 Creating commit...");
	execSync(`git commit -m "build: ${version}"`, { stdio: "inherit" });

	// 执行 git push 操作
	console.log("🚀 Pushing to remote...");
	execSync("git push", { stdio: "inherit" });

	// 创建版本标签
	console.log(`🏷️ Creating tag: ${version}`);
	execSync(`git tag ${version}`, { stdio: "inherit" });

	// 推送标签到远程
	console.log("📤 Pushing tags to remote...");
	execSync("git push --tags", { stdio: "inherit" });

	console.log(`✅ Successfully released version ${version}!`);
} catch (error) {
	console.error(`❌ Release process failed: ${error.message}`);
	process.exit(1);
}
