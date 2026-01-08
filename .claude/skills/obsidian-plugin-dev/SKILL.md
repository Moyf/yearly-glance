---
name: obsidian-plugin-dev
description: Obsidian 插件开发最佳实践，包含 BasesView 集成、配置管理、状态管理、React 集成、错误处理和性能优化。在开发 Obsidian 插件、实现 BasesView、处理插件配置或集成 React 时使用此技能。
author: Moy
version: 1.0.0
category: development
tags: [obsidian, plugin, typescript, react, basesview]
---

# Obsidian 插件开发经验总结

这个技能总结了开发 Yearly Glance Obsidian 插件时积累的经验，以及从 obsidian-maps 插件中学到的最佳实践。

## 目录

- [BasesView 集成](#basesview-集成)
- [配置管理](#配置管理)
- [状态管理](#状态管理)
- [代码组织](#代码组织)
- [性能优化](#性能优化)
- [错误处理](#错误处理)
- [i18n 国际化](#i18n-国际化)
- [React 集成](#react-集成)
- [数据同步](#数据同步)
- [扩展阅读](#扩展阅读)

---

## BasesView 集成

### 基础结构

```typescript
import { BasesView } from 'obsidian';

export class MyView extends BasesView {
    type = 'my-view-type';
    scrollEl: HTMLElement;
    plugin: MyPlugin;

    constructor(controller: QueryController, scrollEl: HTMLElement, plugin: MyPlugin) {
        super(controller);
        this.scrollEl = scrollEl;
        this.plugin = plugin;
    }

    onDataUpdated(): void {
        // 数据更新时调用
    }

    onResize(): void {
        // 尺寸变化时调用
    }
}
```

### 注册视图

在主插件中注册 BasesView：

```typescript
// main.ts
async onload() {
    this.registerBasesView('my-view-type', {
        name: 'My View',
        icon: 'lucide-icon',
        factory: (controller, containerEl) => new MyView(controller, containerEl, this),
        options: () => MyView.getViewOptions(),
    });
}
```

### 视图选项配置

使用静态方法返回视图选项：

```typescript
static getViewOptions(): ViewOption[] {
    return [
        {
            displayName: '基础属性',
            type: 'group',
            items: [
                {
                    displayName: '标题属性',
                    type: 'property',
                    key: 'propTitle',
                    filter: prop => !prop.startsWith('file.'),
                    placeholder: 'Property',
                    // 不要设置 default，让 UI 显示为空
                    // 运行时在 loadConfig 中回退到插件全局设置
                },
            ]
        },
        {
            displayName: '显示设置',
            type: 'group',
            items: [
                {
                    displayName: '限制高度',
                    type: 'toggle',
                    key: 'limitHeight',
                    default: false,
                },
            ]
        },
    ];
}
```

**关键点**：
- 不要为 `property` 类型设置 `default` 值，让 UI 显示为未配置状态
- 运行时在 `loadConfig` 或 `performUpdate` 中实现回退逻辑

### 读取配置属性

```typescript
private performUpdate(): void {
    // 读取 Bases 视图配置
    const config = {
        propTitle: this.config.getAsPropertyId('propTitle') || null,
        propDate: this.config.getAsPropertyId('propDate') || null,
    };

    // 回退到插件全局设置
    const pluginConfig = this.plugin.getConfig();
    const finalConfig = {
        propTitle: config.propTitle || pluginConfig.defaultTitleProp || null,
        propDate: config.propDate || pluginConfig.defaultDateProp || null,
    };
}
```

### 读取 Bases 数据

```typescript
const entriesToProcess = this.data?.groupedData
    ? this.data.groupedData.flatMap(group => group.entries)
    : this.data?.data || [];

for (const entry of entriesToProcess) {
    // 使用 entry.getValue() 获取属性值
    const titleValue = config.propTitle ? entry.getValue(config.propTitle) : null;
    const dateValue = config.propDate ? entry.getValue(config.propDate) : null;

    if (dateValue && dateValue.isTruthy()) {
        // 处理数据
    }
}
```

**关键点**：
- 使用 `entry.getValue()` 而不是直接读取 frontmatter
- `getValue()` 返回 `Value` 对象，需要调用 `isTruthy()` 检查
- 使用 `toString()` 转换为字符串

---

## 配置管理

### 配置验证辅助方法

从 maps 插件学习，创建辅助方法来验证配置：

```typescript
private getNumericConfig(key: string, defaultValue: number, min?: number, max?: number): number {
    const value = this.config.get(key);
    if (value == null || typeof value !== 'number') return defaultValue;

    let result = value;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
}

private getArrayConfig(key: string): string[] {
    const value = this.config.get(key);
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'string' && item.trim().length > 0);
    }

    if (typeof value === 'string' && value.trim().length > 0) {
        return [value.trim()];
    }

    return [];
}
```

### 配置快照模式

使用配置快照来检测变化，避免不必要的更新：

```typescript
private lastConfigSnapshot: string = '';

private getConfigSnapshot(): string {
    return JSON.stringify({
        propTitle: this.config.get('propTitle'),
        propDate: this.config.get('propDate'),
        limitHeight: this.config.get('limitHeight'),
    });
}

public onDataUpdated(): void {
    const configSnapshot = this.getConfigSnapshot();
    const configChanged = this.lastConfigSnapshot !== configSnapshot;

    if (configChanged) {
        // 配置发生变化，重新加载数据
        this.lastConfigSnapshot = configSnapshot;
        this.performUpdate();
    }
}
```

### 属性回退机制

实现两层回退机制：

```typescript
// 1. 视图配置 → 2. 插件全局配置 → 3. null
const propTitle = this.config.getAsPropertyId('propTitle')
    || pluginConfig.basesEventTitleProp
    || null;
```

---

## 状态管理

### Pub/Sub 事件总线

实现简单的事件总线来管理状态变化：

```typescript
// hooks/useYearlyGlanceConfig.ts
class EventBus {
    private callbacks: Set<() => void> = new Set();

    subscribe(callback: () => void): () => void {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }

    publish(): void {
        this.callbacks.forEach(cb => cb());
    }
}

export const YearlyGlanceBus = new EventBus();
```

在插件保存设置时发布：

```typescript
async saveSettings() {
    await this.saveData(this.settings);
    YearlyGlanceBus.publish(); // 通知所有订阅者
}
```

在 React 组件中订阅：

```typescript
const [config, setConfig] = useState(plugin.getConfig());

useEffect(() => {
    const unsubscribe = YearlyGlanceBus.subscribe(() => {
        setConfig(plugin.getConfig());
    });
    return unsubscribe;
}, []);
```

### 临时状态管理

处理临时状态（如地图拖拽、缩放）：

```typescript
private pendingMapState: { center?: LngLatLike, zoom?: number } | null = null;

public setEphemeralState(state: unknown): void {
    if (!state) {
        this.pendingMapState = null;
        return;
    }

    this.pendingMapState = {};
    if (hasOwnProperty(state, 'center')) {
        this.pendingMapState.center = state.center;
    }
    if (hasOwnProperty(state, 'zoom')) {
        this.pendingMapState.zoom = state.zoom;
    }
}

public getEphemeralState(): unknown {
    if (!this.map) return {};
    return {
        center: this.map.getCenter(),
        zoom: this.map.getZoom(),
    };
}
```

### 防止重复更新

```typescript
private updatePending = false;

private performUpdate(): void {
    if (this.updatePending) {
        return; // 如果已经有更新在进行，跳过
    }

    this.updatePending = true;

    try {
        // 执行更新逻辑
    } finally {
        this.updatePending = false;
    }
}
```

---

## 代码组织

### Manager 模式

从 maps 插件学习，使用 Manager 类分离关注点：

```typescript
// managers/EventManager.ts
export class EventManager {
    private plugin: MyPlugin;
    private events: CalendarEvent[] = [];

    constructor(plugin: MyPlugin) {
        this.plugin = plugin;
    }

    getEvents(): CalendarEvent[] {
        return this.events;
    }

    updateEvents(events: CalendarEvent[]): void {
        this.events = events;
    }
}

// 视图中使用
export class MyView extends BasesView {
    private eventManager: EventManager;

    constructor(controller, containerEl, plugin) {
        super(controller);
        this.eventManager = new EventManager(plugin);
    }
}
```

### 依赖注入

通过构造函数传入回调，而不是直接引用：

```typescript
class MarkerManager {
    private onOpenFile: (path: string, newLeaf: boolean) => void;
    private getData: () => any;
    private getMapConfig: () => any;

    constructor(
        onOpenFile: (path: string, newLeaf: boolean) => void,
        getData: () => any,
        getMapConfig: () => any
    ) {
        this.onOpenFile = onOpenFile;
        this.getData = getData;
        this.getMapConfig = getMapConfig;
    }
}

// 使用时传入回调
const markerManager = new MarkerManager(
    (path, newLeaf) => this.app.workspace.openLinkText(path, '', newLeaf),
    () => this.data,
    () => this.mapConfig
);
```

### 工具函数组织

```typescript
// utils/dateUtils.ts
export class DateUtils {
    static getCurrentYear(): number {
        return new Date().getFullYear();
    }

    static isValidDate(date: Date): boolean {
        return !isNaN(date.getTime());
    }
}

// utils/eventCalculator.ts
export class EventCalculator {
    static calculateDateArr(event: CalendarEvent): string[] {
        // 计算日期数组
    }
}
```

---

## 性能优化

### 防抖（Debounce）

```typescript
import { debounce } from 'obsidian';

private onResizeDebounce = debounce(
    () => { if (this.map) this.map.resize() },
    100,
    true
);

onResize(): void {
    this.onResizeDebounce();
}
```

### 限制处理数量

```typescript
// 限制最多处理 20 个属性
const propertiesSlice = properties.slice(0, 20);
```

### 条件更新

只在必要时执行更新：

```typescript
private isFirstLoad = true;

public onDataUpdated(): void {
    const configSnapshot = this.getConfigSnapshot();
    const configChanged = this.lastConfigSnapshot !== configSnapshot;

    if (configChanged) {
        // 只在配置真正变化时更新
        this.lastConfigSnapshot = configSnapshot;
        this.performUpdate();
    }

    this.isFirstLoad = false;
}
```

### 数据哈希比较

使用哈希检测数据变化：

```typescript
private lastDataHash: string = '';

private hashData(entries: any[]): string {
    const simplifiedEntries = entries.map(entry => ({
        path: entry.file.path,
        date: String(entry.getValue(config.propDate)),
        title: String(entry.getValue(config.propTitle)),
    }));

    simplifiedEntries.sort((a, b) => a.path.localeCompare(b.path));

    return JSON.stringify(simplifiedEntries);
}

private checkDataChanged(): boolean {
    const currentHash = this.hashData(this.data.data);
    const changed = currentHash !== this.lastDataHash;
    this.lastDataHash = currentHash;
    return changed;
}
```

---

## 错误处理

### Bases 数据读取

```typescript
for (const entry of entriesToProcess) {
    try {
        const value = entry.getValue(config.propTitle);
        if (value && value.isTruthy()) {
            const title = value.toString();
            // 处理数据
        }
    } catch (error) {
        console.warn(`Failed to read property for ${entry.file.name}:`, error);
    }
}
```

### 配置读取

```typescript
private getCenterFromConfig(): [number, number] {
    try {
        centerConfig = this.config.getEvaluatedFormula(this, 'center');
    } catch (error) {
        // 回退到静态值
        const centerConfigStr = this.config.get('center');
        if (String.isString(centerConfigStr)) {
            centerConfig = new StringValue(centerConfigStr);
        } else {
            return DEFAULT_CENTER;
        }
    }

    return coordinateFromValue(centerConfig) || DEFAULT_CENTER;
}
```

### 数据验证

```typescript
async loadSettings() {
    try {
        const loadedData = await this.loadData();
        return this.validateSettings(loadedData);
    } catch (error) {
        console.error("[YearlyGlance] Loading settings failed, using default settings", error);
        return DEFAULT_SETTINGS;
    }
}
```

---

## i18n 国际化

### 自定义 i18n 系统

```typescript
// i18n/i18n.ts
class I18n {
    private locale: string = 'en';
    private translations: Record<string, string> = {};

    setLocale(locale: string): void {
        this.locale = locale;
    }

    loadTranslations(translations: Record<string, string>): void {
        this.translations = translations;
    }

    t(key: string, params?: Record<string, string>): string {
        let template = this.translations[key] || key;

        if (params) {
            Object.entries(params).forEach(([param, value]) => {
                template = template.replace(`{{${param}}}`, value);
            });
        }

        return template;
    }
}

export const I18nSingleton = new I18n();
export const t = (key: string, params?: Record<string, string>) =>
    I18nSingleton.t(key, params);
```

### 翻译文件结构

```typescript
// i18n/locales/zh.ts
export default {
    'view.eventManager.title': '事件管理',
    'view.eventManager.help.basesEventCreate.text': '保存后将在 {{path}} 文件夹中创建新笔记。',
    'view.eventManager.help.basesEventCreate.textWithName': '将保存为新笔记：',
};
```

### 自动检测语言

```typescript
async onload() {
    const obsidianLang = this.app.vault.config.locale;
    const locale = obsidianLang?.split('_')[0] || 'en';
    I18nSingleton.setLocale(locale);
    I18nSingleton.loadTranslations(locales[locale] || locales['en']);
}
```

---

## React 集成

### 使用 React 19

```typescript
import { createRoot } from 'react-dom/client';
import { YearlyCalendar } from './components/YearlyCalendar/YearlyCalendar';

export class YearlyGlanceView extends ItemView {
    private reactRoot: Root | null = null;

    async onOpen() {
        const container = this.containerEl.children[1];
        this.reactRoot = createRoot(container);
        this.reactRoot.render(<YearlyCalendar plugin={this.plugin} />);
    }

    async onClose() {
        this.reactRoot?.unmount();
    }
}
```

### 使用自定义 Hook

```typescript
// hooks/useYearlyGlanceConfig.ts
export function useYearlyGlanceConfig(plugin: YearlyGlancePlugin) {
    const [config, setConfig] = useState(plugin.getConfig());

    useEffect(() => {
        const unsubscribe = YearlyGlanceBus.subscribe(() => {
            setConfig(plugin.getConfig());
        });
        return unsubscribe;
    }, [plugin]);

    return config;
}

// 在组件中使用
function YearlyCalendar({ plugin }: Props) {
    const config = useYearlyGlanceConfig(plugin);
    // ...
}
```

---

## 数据同步

### Frontmatter 同步

```typescript
async updateEventFrontmatter(event: CalendarEvent): Promise<void> {
    const filePath = this.getBasesFilePath(event.id);
    const file = this.app.vault.getAbstractFileByPath(filePath);

    if (!(file instanceof TFile)) {
        return;
    }

    await this.app.fileManager.processFrontMatter(file, (fm) => {
        // 更新 frontmatter 字段
        fm.title = event.text;
        fm.event_date = event.eventDate?.isoDate;

        // 删除空字段
        if (fm.description && !event.remark) {
            delete fm.description;
        }
    });
}
```

### 双向同步

```typescript
// 从 frontmatter 读取
private loadEventFromFrontmatter(file: TFile): CalendarEvent | null {
    const metadata = this.app.metadataCache.getFileCache(file);
    const frontmatter = metadata?.frontmatter || {};

    return {
        id: `bases-${file.path}-${frontmatter.event_date}`,
        text: frontmatter.title || file.name,
        eventDate: { isoDate: frontmatter.event_date },
        // ...
    };
}

// 写入到 frontmatter
private syncEventToFrontmatter(event: CalendarEvent): void {
    this.updateEventFrontmatter(event);
}
```

### 数据迁移

```typescript
// utils/migrateData.ts
export class MigrateData {
    static migrateV2(data: any): any {
        // 处理版本迁移
        if (!data.version) {
            data.version = '1.0.0';
        }

        // 迁移到 v2
        if (data.events) {
            data.data = { customEvents: data.events };
            delete data.events;
        }

        return data;
    }
}
```

---

## 最佳实践总结

1. **分层回退配置**：视图配置 → 插件全局配置 → 默认值
2. **使用配置快照**：避免不必要的重新渲染
3. **Manager 模式**：分离复杂逻辑到独立的 Manager 类
4. **依赖注入**：通过构造函数传入回调，提高可测试性
5. **错误处理**：在 getValue 等操作中使用 try-catch
6. **性能优化**：debounce、限制数量、条件更新
7. **Pub/Sub 模式**：使用事件总线管理状态变化
8. **数据验证**：加载时验证，失败时使用默认值
9. **i18n 支持**：从设计开始就考虑多语言
10. **React 集成**：使用 createRoot 和自定义 Hook

---

## 扩展阅读

### 1. BasesView 最佳实践

**适用场景**：

- 正在开发或维护 BasesView 相关功能
- 需要处理 Bases 数据读取和错误处理
- 需要实现配置验证逻辑

**详细文档**：参见 [BasesView 最佳实践：错误处理和配置验证](./bases-view-best-practices.md)

**核心内容**：

1. **错误处理模式**：如何在 `entry.getValue()` 调用中添加 try-catch
2. **配置验证辅助方法**：`getNumericConfig`、`getArrayConfig`、`getBooleanConfig` 的实现
3. **实施指南**：逐步改造现有代码的步骤

### 2. BasesView 更新策略

**适用场景**：

- BasesView 数据频繁更新导致性能问题
- 需要优化 `onDataUpdated()` 的调用频率
- 需要检测配置和数据的变化

**详细文档**：参见 [BasesView 更新策略最佳实践](./basesview-update-strategies.md)

**核心内容**：

1. **防抖更新机制**：避免频繁重新渲染
2. **配置快照模式**：检测配置变化
3. **数据哈希比较**：检测数据变化
4. **更新锁**：防止重复更新

### 3. React vs MarkdownRenderer

**适用场景**：

- 需要渲染用户输入的内容
- 需要动态更新或条件渲染
- 决定使用 JSX 还是 MarkdownRenderer

**详细文档**：参见 [React 组件 vs MarkdownRenderer 渲染选择指南](./react-vs-markdown-rendering.md)

**核心内容**：

1. **决策树**：如何选择渲染方式
2. **MarkdownRenderer 使用场景**：用户输入、安全性
3. **JSX 使用场景**：动态内容、交互性
4. **常见陷阱**：Component 参数传递、性能优化

### 4. 配置默认值的 UI/运行时分离

**适用场景**：

- 设计插件配置系统
- 实现 BasesView 属性配置
- 需要区分"未配置"和"使用默认值"

**详细文档**：参见 [配置默认值的 UI/运行时分离模式](./config-default-pattern.md)

**核心内容**：

1. **分离原则**：UI 不显示默认值，运行时回退
2. **实施步骤**：完整的改造流程
3. **用户体验优化**：清晰的视觉反馈
4. **适用场景**：何时使用这种模式

### 5. 事件数据格式兼容性

**适用场景**：

- 实现事件日期计算和更新逻辑
- 处理不同年份的事件显示（如生日、节日）
- 确保多日事件扩展功能正常

**详细文档**：参见 [事件数据格式兼容性：eventDate.isoDate 同步更新](./event-data-format-compatibility.md)

**核心内容**：

1. **问题根源**：`eventDate.isoDate` 与 `dateArr` 不同步导致旧格式数据无法显示
2. **解决方案**：在更新事件信息时同步更新 `eventDate.isoDate` 为 `dateArr[0]`
3. **实施指南**：如何识别和修复所有事件更新方法
4. **测试验证**：单元测试和手动测试的完整流程

---

## 相关资源

- [Obsidian Plugin Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [obsidian-maps](https://github.com/esm7/obsidian-maps) - BasesView 实现参考
- [Yearly Glance](https://github.com/your-repo) - 实际项目示例
