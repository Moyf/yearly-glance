import { copyFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// 获取当前文件的目录
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const manifestPath = join(rootDir, "manifest.json");

async function copyToVault(vaultPath) {
	try {
		// 从 manifest.json 读取插件 ID
		console.log("正在读取 manifest.json...");
		const manifestContent = await readFile(manifestPath, "utf8");
		const manifest = JSON.parse(manifestContent);
		const pluginId = manifest.id;
		console.log(`插件 ID: ${pluginId}`);

		if (!pluginId) {
			throw new Error("无法从 manifest.json 中获取插件 ID");
		}

		const pluginDir = join(vaultPath, ".obsidian", "plugins", pluginId);
		console.log(`插件目录: ${pluginDir}`);

		// 确保插件目录存在
		if (!existsSync(pluginDir)) {
			console.log(`插件目录不存在，正在创建...`);
			await mkdir(pluginDir, { recursive: true });
			console.log(`创建目录: ${pluginDir}`);
		} else {
			console.log(`插件目录已存在`);
		}

		// 要复制的文件列表
		const filesToCopy = ["main.js", "manifest.json", "styles.css"];
		console.log(`要复制的文件: ${filesToCopy.join(", ")}`);

		// 复制文件
		for (const file of filesToCopy) {
			const sourcePath = join(rootDir, file);
			const destPath = join(pluginDir, file);

			if (!existsSync(sourcePath)) {
				console.error(`源文件不存在: ${sourcePath}`);
				continue;
			}

			await copyFile(sourcePath, destPath);
			console.log(`复制文件: ${file} -> ${destPath}`);
		}

		console.log(
			`所有文件已成功复制到 Obsidian 库的 ${pluginId} 插件目录！`
		);
	} catch (error) {
		console.error("复制文件时出错:", error);
		process.exit(1);
	}
}

// 主函数：只在直接运行时执行
async function main() {
	console.log("开始执行复制到 Obsidian 库的脚本...");
	console.log(`项目根目录: ${rootDir}`);

	// 加载 .env 文件中的环境变量
	dotenv.config();

	// 获取 VAULT_PATH 环境变量
	const VAULT_PATH = process.env.VAULT_PATH;
	console.log(`Obsidian 库路径: ${VAULT_PATH}`);

	if (!VAULT_PATH) {
		// CI 环境中没有 VAULT_PATH 是正常的，跳过复制步骤
		console.log("VAULT_PATH 未定义，跳过复制到 Obsidian 库的步骤（CI 环境正常行为）");
		process.exit(0);
	}

	console.log(`manifest 文件路径: ${manifestPath}`);
	console.log("开始复制文件...");

	await copyToVault(VAULT_PATH);
	console.log("脚本执行完成！");
}

// 只在直接运行时才执行 main
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
	main().catch(err => {
		console.error("脚本执行失败:", err);
		process.exit(1);
	});
}

// 导出函数供其他模块使用
export { copyToVault };
