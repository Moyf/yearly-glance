中文 | [English](./README.md)

# Yearly Glance (年度概览)

可定制化管理的年度事件概览。

## 安装方法

### 手动安装

1. 下载最新版本
2. 将 `main.js`、`styles.css` 和 `manifest.json` 复制到您的 vault 插件文件夹：`<vault>/.obsidian/plugins/yearly-glance/`
3. 重新加载 Obsidian
4. 在设置 → 社区插件中启用该插件

### BRAT 安装（推荐 Beta 用户使用）

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件
2. 在 BRAT 设置中点击"添加 Beta 插件"
3. 输入 `Moyf/yearly-glance`
4. 启用插件

## 开发指南

- 克隆此仓库
- 确保您的 NodeJS 版本至少为 v18（`node --version`）
- 运行 `npm i` 或 `yarn` 安装依赖
- 运行 `npm run dev` 以监视模式启动编译
- 运行 `npm run build` 构建插件
- 运行 `npm run build:local` 构建插件并将其复制到您的 vault 插件文件夹（需要在项目根目录创建一个 `.env` 文件并添加：`VAULT_PATH=/path/to/your/vault`）
- 运行 `npm run version` 更新版本号并更新 manifest.json、version.json、package.json
- 运行 `npm run release` 构建插件并更新版本号

## 支持与帮助

如果您遇到任何问题或有建议：
- 在 GitHub 上[提交问题](https://github.com/Moyf/yearly-glance/issues)
- [加入讨论](https://github.com/Moyf/yearly-glance/discussions)提出问题和想法

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。 