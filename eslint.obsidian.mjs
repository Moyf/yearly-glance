import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  ...obsidianmd.configs.recommendedWithLocalesEn,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "obsidianmd/ui/sentence-case-locale-module": ["warn", { allowAutoFix: true }],
      "obsidianmd/ui/sentence-case": ["warn", { allowAutoFix: true }],
      // 关闭旧版 @typescript-eslint 规则（避免 eslint v9 下的规则名冲突）
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
