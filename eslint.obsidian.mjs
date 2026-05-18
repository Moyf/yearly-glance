import tsparser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import obsidianmd from "eslint-plugin-obsidianmd";

const pluginRules = Object.keys(obsidianmd.rules).reduce((acc, key) => {
  acc[`obsidianmd/${key}`] = "warn";
  return acc;
}, {});

export default [
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      obsidianmd: obsidianmd,
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      ...pluginRules,
      "obsidianmd/ui/sentence-case-locale-module": ["warn", { allowAutoFix: true }],
      "obsidianmd/ui/sentence-case": ["warn", { allowAutoFix: true }],
      // 关闭旧版 @typescript-eslint 规则（避免 eslint v9 下的规则名冲突）
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
