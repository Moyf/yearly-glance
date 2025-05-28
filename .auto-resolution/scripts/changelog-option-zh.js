module.exports = {
	writerOpts: {
		transform: (commit, context) => {
			// 创建一个新对象而不是修改原对象
			const transformedCommit = { ...commit };

			// 定义完整的commit类型映射
			const typeMap = {
				feat: "✨ 新功能",
				fix: "🐛 修复",
				// docs: "📝 文档",
				style: "🎨 样式",
				refactor: "♻️ 重构",
				perf: "⚡️ 性能优化",
				// test: "✅ 测试",
				// build: "👷 构建",
				// ci: "🔧 持续集成",
				// chore: "🔨 杂项",
				revert: "⏪️ 回退",
			};

			// 应用类型映射
			if (transformedCommit.type && typeMap[transformedCommit.type]) {
				transformedCommit.type = typeMap[transformedCommit.type];
			}

			// 如果没有匹配的类型，使用默认处理
			if (transformedCommit.type === commit.type) {
				return false;
			}

			// 保留URL链接等信息
			if (commit.scope === "*") {
				transformedCommit.scope = "";
			}

			// 确保 hash 作为链接文本
			if (transformedCommit.hash) {
				transformedCommit.shortHash = transformedCommit.hash.substring(
					0,
					7
				);
			}

			// 处理 BREAKING CHANGE - 创建深层复制
			if (commit.notes && commit.notes.length > 0) {
				transformedCommit.notes = commit.notes.map((note) => {
					// 创建笔记的副本
					const noteCopy = { ...note };
					// 修改副本而不是原对象
					if (noteCopy.title === "BREAKING CHANGE") {
						noteCopy.title = "💥 破坏性变更";
					}
					return noteCopy;
				});
			}

			return transformedCommit;
		},
	},
};
