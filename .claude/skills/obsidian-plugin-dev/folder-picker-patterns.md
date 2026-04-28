# 文件夹选择器模式（React AutoComplete）

在 Obsidian 插件中实现文件夹选择功能的两种主要方案：

## 方案一：React AutoComplete（适用于 React 渲染的设置面板）

### 核心组件

```typescript
// src/components/Base/Autocomplete.tsx
// 通用 AutoComplete 组件，支持：
// - 键盘导航（↑↓ Enter Escape）
// - 模糊搜索过滤
// - 当前值保持（聚焦不清空）
// - 点击外部关闭

// src/components/Base/FolderAutoComplete.tsx
// 文件夹专用封装，使用 app.vault.getAllLoadedFiles() + TFolder 过滤
```

### 关键交互要点

1. **聚焦时保留当前值**：
```typescript
const handleInputFocus = () => {
    setSearchTerm(value);  // 用当前值初始化搜索词，不清空
    setIsOpen(true);
};
```

2. **路径不换行**：
```css
.autocomplete-item-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

3. **下拉宽度**：设置 `min-width: 300px` 确保长路径可读。

### 使用示例

```tsx
<FolderAutoComplete
    value={config.defaultBasesEventPath || ""}
    onChange={(value) => handleUpdateConfig({ defaultBasesEventPath: value })}
    placeholder="选择文件夹路径"
    app={plugin.app}
/>
```

---

## 方案二：TextInputSuggest（适用于原生 Obsidian Setting API）

> 参考实现：[obsidian-rapid-notes](D:\Codes\obsidian-rapid-notes\src\utils\IgnoredFolderSuggest.ts)

### 基类结构

```typescript
// suggest.ts — 通用 Suggest 基类
abstract class TextInputSuggest<T> {
    protected app: App;
    protected inputEl: HTMLInputElement;
    private popper: PopperInstance;    // @popperjs/core 定位
    private scope: Scope;              // 键盘快捷键作用域
    private suggestEl: HTMLElement;
    private selectedItem: number;

    constructor(app: App, inputEl: HTMLInputElement) {
        // 监听 input 事件 → 调用 getSuggestions → 渲染列表
        // 注册 Scope: ArrowUp/Down/Enter/Escape
        // 创建 suggestEl 挂在 document.body 上
    }

    abstract getSuggestions(inputStr: string): T[];
    abstract renderSuggestion(item: T, el: HTMLElement): void;
    abstract selectSuggestion(item: T): void;
}
```

### 文件夹选择器实现

```typescript
// IgnoredFolderSuggest.ts
class FolderSuggest extends TextInputSuggest<TFolder> {
    getSuggestions(inputStr: string): TFolder[] {
        const allFiles = this.app.vault.getAllLoadedFiles();
        return allFiles.filter((file): file is TFolder => {
            if (!(file instanceof TFolder)) return false;
            if (file.path === "") return false;  // 排除根目录
            return file.path.toLowerCase().contains(inputStr.toLowerCase());
        });
    }

    renderSuggestion(folder: TFolder, el: HTMLElement): void {
        el.setText(folder.path);
    }

    selectSuggestion(folder: TFolder): void {
        this.inputEl.value = folder.path;
        this.inputEl.trigger("input");  // 触发 input 事件让 Setting 感知变化
        this.close();
    }
}
```

### 在 Settings 中使用

```typescript
// 在 SettingTab.display() 中
new Setting(containerEl)
    .setName("文件夹路径")
    .addText((text) => {
        text.setPlaceholder("选择文件夹");
        text.setValue(this.plugin.settings.folderPath);
        // 附加 suggest
        new FolderSuggest(this.app, text.inputEl);
        // 保存变更
        text.onChange(async (value) => {
            this.plugin.settings.folderPath = value;
            await this.plugin.saveSettings();
        });
    });
```

### 依赖

- `@popperjs/core`（仅原生方案需要，用于定位弹出框）

---

## 选型指南

| 场景 | 推荐方案 |
|------|----------|
| React 渲染的设置面板（如 Yearly Glance） | React AutoComplete |
| 原生 Obsidian SettingTab | TextInputSuggest |
| 需要多选文件夹列表 | TextInputSuggest + 列表渲染 |
| 只选一个路径 | React AutoComplete（更简洁） |

## 通用最佳实践

1. 使用 `app.vault.getAllLoadedFiles().filter(f => f instanceof TFolder)` 获取文件夹列表
2. 排除根目录（`path === ""`）
3. 大小写不敏感搜索
4. 路径显示不换行（`white-space: nowrap; text-overflow: ellipsis`）
5. 下拉框设置合理的 `min-width`（≥300px）和 `max-height`（200-300px）
6. 支持键盘导航（↑↓ Enter Escape）
