# React 组件 vs MarkdownRenderer 渲染选择指南

这个文档总结了在 Obsidian 插件开发中，选择使用 React 组件（JSX）还是 MarkdownRenderer 的最佳实践。

## 目录

- [核心原则](#核心原则)
- [MarkdownRenderer 的使用场景](#markdownrenderer-的使用场景)
- [React JSX 的使用场景](#react-jsx-的使用场景)
- [常见陷阱](#常见陷阱)
- [迁移指南](#迁移指南)

---

## 核心原则

### 决策树

```
需要渲染的内容是否来自用户输入？
├─ 是 → 使用 MarkdownRenderer（安全性）
│       用户输入可能包含恶意代码
│
└─ 否 → 是否需要动态交互？
    ├─ 是 → 使用 React JSX（灵活性）
    │       需要动态更新、事件处理
    │
    └─ 否 → 是否需要复杂样式？
        ├─ 是 → 使用 React JSX（可控性）
        │       需要 CSS-in-JS、条件样式
        │
        └─ 否 → 使用 MarkdownRenderer（简单性）
            简单的静态文本
```

### 快速对比

| 特性 | MarkdownRenderer | React JSX |
|------|------------------|-----------|
| **安全性** | ✅ 自动转义用户输入 | ❌ 需手动转义 |
| **动态性** | ❌ 静态渲染 | ✅ 完全动态 |
| **交互性** | ❌ 无事件处理 | ✅ 完整交互支持 |
| **样式控制** | ⚠️ 依赖 Markdown | ✅ 完全可控 |
| **复杂度** | ✅ 简单 | ⚠️ 需要管理组件状态 |
| **性能** | ⚠️ 每次重新解析 | ✅ React 优化 |

---

## MarkdownRenderer 的使用场景

### 1. 渲染用户输入的内容

**典型场景**：事件描述、备注字段

```typescript
import { MarkdownRenderer } from 'obsidian';

// ✅ 正确：使用 MarkdownRenderer 渲染用户输入
async renderUserContent(containerEl: HTMLElement, content: string) {
    await MarkdownRenderer.renderMarkdown(
        content,           // 用户输入的 Markdown
        containerEl,       // 渲染目标
        '',                // 源路径（可选）
        this.component     // ⚠️ 重要：传入 Component
    );
}
```

**为什么**：
- 自动转义 HTML 标签（防止 XSS）
- 支持 Obsidian 的 Markdown 扩展（wiki-links, callouts 等）
- 自动处理内部链接

### 2. 传递 Component 参数

**错误示例**：

```typescript
// ❌ 错误：不传 Component 会导致警告
await MarkdownRenderer.renderMarkdown(content, containerEl, '', null);
```

**正确示例**：

```typescript
// ✅ 正确：传入 Component
import { MarkdownRenderer } from 'obsidian';

export class EventFormModal extends Modal {
    async renderHint(hint: string) {
        await MarkdownRenderer.renderMarkdown(
            hint,
            this.hintEl,
            '',
            this  // Modal 继承自 Component，传入 this
        );
    }
}
```

**原因**：
- Obsidian 需要Component 来清理事件监听器
- 不传会导致内存泄漏警告
- 在 Modal/View 中，`this` 就是 Component

### 3. 从子组件传递 Component

如果需要从子组件使用 MarkdownRenderer：

```typescript
// EventFormModal.tsx
export const EventFormModal: React.FC<Props> = ({ obsidianComponent }) => {
    const renderHint = async (hint: string) => {
        await MarkdownRenderer.renderMarkdown(
            hint,
            hintEl.current,
            '',
            obsidianComponent  // 从 props 传入
        );
    };
};

// 父组件
export class MyView extends ItemView {
    render() {
        return <EventFormModal obsidianComponent={this} />;
    }
}
```

---

## React JSX 的使用场景

### 1. 需要动态更新的内容

**场景**：根据用户输入动态显示提示信息

```typescript
// ❌ 不推荐：使用 MarkdownRenderer
{isEditing && (
    <div ref={hintEl}>
        {useEffect(() => {
            MarkdownRenderer.renderMarkdown(
                getHintText(formData.text),
                hintEl.current,
                '',
                component
            );
        }, [formData.text])}
    </div>
)}

// ✅ 推荐：使用 JSX
{isEditing && (
    <>
        <b>{t("view.eventManager.help.basesEventEdit.label")}：</b>
        {t("view.eventManager.help.basesEventEdit.notePrefix")} <i>{
            event.id?.replace(/^bases-/, "")?.replace(/-\d{4}-\d{2}-\d{2}$/, "") || ""
        }</i>
        <br />
        {t("view.eventManager.help.basesEventEdit.syncText")}
    </>
)}
```

**优势**：
- 响应式更新（依赖变化自动重新渲染）
- 不需要手动管理 DOM
- 代码更清晰

### 2. 需要条件渲染的内容

```typescript
// ✅ 使用 JSX 的条件渲染
{formData.text ? (
    <>
        {t("view.eventManager.help.basesEventCreate.textWithName")}<br />
        <i>{`${settings.config.defaultBasesEventPath || ''}/${formData.text}.md`}</i>
    </>
) : (
    t("view.eventManager.help.basesEventCreate.text", {
        path: settings.config.defaultBasesEventPath || '/'
    })
)}
```

**优势**：
- 类型安全（TypeScript 检查）
- 逻辑清晰
- 易于维护

### 3. 需要复杂样式或交互

```typescript
// ✅ 使用 JSX 实现复杂样式
<div
    className="event-tooltip"
    style={{
        borderLeft: `4px solid ${event.color}`,
        backgroundColor: isDark ? '#1e1e1e' : '#ffffff'
    }}
    onMouseEnter={() => setShowDetails(true)}
    onMouseLeave={() => setShowDetails(false)}
>
    <b>{event.text}</b>
    {showDetails && <EventDetails event={event} />}
</div>
```

---

## 常见陷阱

### 陷阱 1：混合使用两种方式

```typescript
// ❌ 错误：在 MarkdownRenderer 中使用 JSX 模板字符串
const hint = `<b>${t("label")}：</b><i>${value}</i>`;
await MarkdownRenderer.renderMarkdown(hint, containerEl);

// ✅ 正确 1：使用 MarkdownRenderer 的原生语法
const hint = `**${t("label")}：** *${value}*`;
await MarkdownRenderer.renderMarkdown(hint, containerEl);

// ✅ 正确 2：直接使用 JSX
<>
    <b>{t("label")}：</b>
    <i>{value}</i>
</>
```

### 陷阱 2：忘记传递 Component

```typescript
// ❌ 错误：不传 Component
await MarkdownRenderer.renderMarkdown(content, containerEl, '');

// ✅ 正确：传入 Component
await MarkdownRenderer.renderMarkdown(content, containerEl, '', this.component);
```

### 陷阱 3：在循环中使用 MarkdownRenderer

```typescript
// ❌ 错误：性能差
{items.map(item => (
    <div key={item.id}>
        {useEffect(() => {
            MarkdownRenderer.renderMarkdown(item.content, divRef.current, '', component);
        }, [item.content])}
    </div>
))}

// ✅ 正确：直接使用 JSX（如果内容安全）
{items.map(item => (
    <div key={item.id}>{item.content}</div>
))}

// 或者：使用 React Markdown（需要转义）
import ReactMarkdown from 'react-markdown';
{items.map(item => (
    <ReactMarkdown key={item.id}>{item.content}</ReactMarkdown>
))}
```

---

## 迁移指南

### 从 MarkdownRenderer 迁移到 JSX

#### 场景 1：简单的格式化文本

**迁移前**：

```typescript
const hint = `**${label}：** ${value}`;
await MarkdownRenderer.renderMarkdown(hint, containerEl);
```

**迁移后**：

```typescript
<>
    <b>{label}：</b>
    {value}
</>
```

#### 场景 2：动态内容 + 国际化

**迁移前**：

```typescript
// i18n 键：使用模板字符串
'view.hint': '保存后将在 **{{path}}** 文件夹中创建新笔记。'

// 组件中
const hint = t("view.hint", { path: folderName });
await MarkdownRenderer.renderMarkdown(hint, containerEl);
```

**迁移后**：

```typescript
// i18n 键：拆分
'view.hint.label': '保存后将在'
'view.hint.path': '文件夹中创建新笔记。'

// 组件中
<>
    {t("view.hint.label")} <i>{folderName}</i> {t("view.hint.path")}
</>
```

#### 场景 3：条件内容

**迁移前**：

```typescript
let hint = '';
if (isEditing) {
    hint = `**编辑模式**\n此事件来自笔记 *${fileName}*`;
} else {
    hint = `**新增模式**\n将保存为新笔记：${filePath}`;
}
await MarkdownRenderer.renderMarkdown(hint, containerEl);
```

**迁移后**：

```typescript
{isEditing ? (
    <>
        <b>{t("mode.edit")}</b><br />
        {t("mode.fromNote")} <i>{fileName}</i>
    </>
) : (
    <>
        <b>{t("mode.create")}</b><br />
        {t("mode.saveAs")} <i>{filePath}</i>
    </>
)}
```

---

## 性能优化

### MarkdownRenderer 缓存

MarkdownRenderer 每次都会重新解析 Markdown，对于不常变化的内容，可以缓存结果：

```typescript
const cache = new Map<string, HTMLElement>();

async renderCachedMarkdown(content: string, containerEl: HTMLElement) {
    if (cache.has(content)) {
        containerEl.appendChild(cache.get(content)!.cloneNode(true));
        return;
    }

    const tempEl = createDiv();
    await MarkdownRenderer.renderMarkdown(content, tempEl, '', this.component);
    cache.set(content, tempEl.firstElementChild as HTMLElement);
    containerEl.appendChild(tempEl.firstElementChild!);
}
```

### JSX 组件优化

使用 React 的优化技巧：

```typescript
// 1. 使用 useMemo 缓存计算结果
const formattedHint = useMemo(() => (
    <>
        <b>{t("label")}：</b>
        <i>{value}</i>
    </>
), [t, value]);

// 2. 使用 useCallback 缓存事件处理器
const handleClick = useCallback(() => {
    // ...
}, [dependency]);

// 3. 使用 React.memo 避免不必要的重新渲染
const HintComponent = React.memo(({ label, value }) => (
    <>
        <b>{label}：</b>
        <i>{value}</i>
    </>
));
```

---

## 总结

### 选择指南

| 场景 | 推荐方案 |
|------|---------|
| 渲染用户输入的 Markdown | **MarkdownRenderer** |
| 简单的静态文本 | MarkdownRenderer 或 JSX 都可以 |
| 需要动态更新/条件渲染 | **JSX** |
| 需要复杂样式或交互 | **JSX** |
| 性能敏感场景 | JSX（配合 React 优化） |

### 最佳实践

1. **用户输入**：始终使用 MarkdownRenderer（安全性）
2. **静态提示**：优先使用 JSX（简洁性）
3. **动态内容**：使用 JSX（响应式）
4. **传递 Component**：使用 MarkdownRenderer 时不要忘记

---

## 相关资源

- [Obsidian MarkdownRenderer API](https://docs.obsidian.md/Reference/TypeScript+API/Materialize)
- [React 官方文档 - JSX](https://react.dev/learn/writing-markup-with-jsx)
- [Yearly Glance EventForm 实现](../../src/components/EventForm/EventForm.tsx) - 实际应用示例
