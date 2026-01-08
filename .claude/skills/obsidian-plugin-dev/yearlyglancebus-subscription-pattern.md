# YearlyGlanceBus 订阅模式 - React 状态同步与刷新最佳实践

## 目录

- [问题背景](#问题背景)
- [核心原则](#核心原则)
- [常见模式](#常见模式)
- [问题1：useMemo 依赖数组不完整导致 UI 不刷新](#问题1usememo-依赖数组不完整导致-ui-不刷新)
- [问题2：编辑后 View 不刷新](#问题2编辑后-view-不刷新)
- [问题3：EventManager 中编辑后不刷新](#问题3eventmanager-中编辑后不刷新)
- [相关修复](#相关修复)
- [经验总结](#经验总结)

## 问题背景

在 Yearly Glance 插件开发中，遇到了多个与 React 状态同步相关的问题：

1. **UI 不刷新问题**：切换"笔记事件"按钮后，笔记事件无法渲染出来
2. **编辑后不刷新**：编辑笔记事件后，View 内容不更新
3. **EventManager 不刷新**：在事件管理器中编辑笔记事件后，显示内容不更新

这些问题都与 **React Hook 的依赖数组管理**和**事件总线订阅模式**有关。

## 核心原则

### 1. 完整的依赖数组

**原则**：useMemo 和 useEffect 的依赖数组必须包含所有在回调中使用的响应式值。

```typescript
// ❌ 错误：依赖数组不完整
const monthsData = React.useMemo(() => {
    return MonthMap.map((month) => {
        // ... 这里使用了 allEvents
        const dayEvents = allEvents.filter((event) => {
            return event.eventDate?.isoDate === currentDateISO;
        });
    });
}, [config, events, externalEvents]);  // 缺少 allEvents

// ✅ 正确：包含所有使用的值
const monthsData = React.useMemo(() => {
    return MonthMap.map((month) => {
        const dayEvents = allEvents.filter((event) => {
            return event.eventDate?.isoDate === currentDateISO;
        });
    });
}, [allEvents, config, year, today, mondayFirst, highlightWeekends, highlightToday]);
```

### 2. 事件总线的双向通知

**原则**：任何修改数据的地方都应该调用 `YearlyGlanceBus.publish()`，任何需要响应变化的组件都应该订阅。

```typescript
// 发布端：数据修改后必须调用 publish()
async updateEventFrontmatter(event: CalendarEvent): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
        // ... 更新 frontmatter ...
    });

    // ✅ 关键：通知所有订阅者
    YearlyGlanceBus.publish();
}

// 订阅端：需要响应变化的组件必须订阅
React.useEffect(() => {
    const unsubscribe = YearlyGlanceBus.subscribe(() => {
        // 重新加载数据或触发刷新
        loadBasesEvents();
    });
    return unsubscribe;
}, [/* 依赖项 */]);
```

### 3. 统一使用 useYearlyGlanceConfig

**原则**：在组件中使用 `useYearlyGlanceConfig` hook 来获取配置和数据，确保能收到总线通知。

```typescript
// ✅ 正确：使用 hook 获取 config
const { config } = useYearlyGlanceConfig(plugin);

// 订阅后，当 config 变化时会自动更新
React.useEffect(() => {
    const unsubscribe = YearlyGlanceBus.subscribe(() => {
        loadBasesEvents();
    });
    return unsubscribe;
}, [config.showBasesEvents, config.defaultBasesEventPath, config.year, config.dataVersion]);
```

## 常见模式

### 模式1：useMemo 依赖数组检查清单

在使用 useMemo 时，确保依赖数组包含：

1. **在回调中读取的所有状态和 props**
2. **在回调中调用的所有函数**（如果函数不稳定，使用 useCallback 或内联）
3. **计算结果所依赖的所有值**

```typescript
// 检查清单
const computedValue = React.useMemo(() => {
    // 1. 检查：这里用了哪些变量？
    const result = processData(
        allEvents,      // ✓ 已添加到依赖
        config.year,    // ✓ 已添加到依赖
        today,          // ✓ 已添加到依赖
        someFunc        // ✗ 未添加到依赖！
    );
    return result;
}, [allEvents, config.year, today]);  // 缺少 someFunc
```

### 模式2：异步数据加载 + 总线订阅

当组件需要异步加载数据并响应外部变化时：

```typescript
const [data, setData] = React.useState<DataType[]>([]);

React.useEffect(() => {
    const loadData = () => {
        if (shouldLoad) {
            dataSource.load().then(setData);
        } else {
            setData([]);
        }
    };

    // 初始加载
    loadData();

    // 订阅总线，当数据变化时重新加载
    const unsubscribe = YearlyGlanceBus.subscribe(loadData);

    return unsubscribe;
}, [/* 变化的触发条件 */]);
```

### 模式3：编辑后的数据同步

在编辑操作完成后，确保所有相关视图都能刷新：

```typescript
// 在数据同步方法末尾
async syncDataToFrontmatter(event: CalendarEvent): Promise<void> {
    try {
        await this.app.fileManager.processFrontMatter(file, (fm) => {
            // 更新 frontmatter
        });

        // ✅ 关键步骤：通知所有订阅者
        YearlyGlanceBus.publish();
    } catch (error) {
        console.error('Failed to sync:', error);
    }
}
```

## 问题1：useMemo 依赖数组不完整导致 UI 不刷新

### 现象

在 YearlyCalendar View 中切换"笔记事件"按钮时，笔记事件无法渲染出来，需要点其他按钮才会渲染。

### 根本原因

`monthsData` 的 useMemo 依赖数组缺少 `allEvents`：

```typescript
// ❌ 问题代码
const monthsData = React.useMemo(() => {
    return MonthMap.map((month, monthIndex) => {
        // ... 在这里使用了 allEvents.filter()
        const dayEvents = allEvents.filter((event) => {
            return event.eventDate?.isoDate === currentDateISO;
        });
        // ...
    });
}, [config, events, externalEvents]);  // 缺少 allEvents！
```

**数据流分析**：

```
用户切换按钮 → updateConfig({showBasesEvents: true})
             → useEffect 触发，加载笔记事件
             → setBasesEvents(loadedEvents)
             → allEvents 重新计算（包含新加载的笔记事件）
             → ❌ monthsData 不更新（缺少 allEvents 依赖）
             → UI 仍显示旧数据
```

### 解决方案

```diff
 }, [allEvents, config, year, today, mondayFirst, highlightWeekends, highlightToday]);
```

**文件**：`src/hooks/useYearlyCalendar.ts:287`

### 修复后的数据流

```
用户切换按钮 → updateConfig({showBasesEvents: true})
             → useEffect 触发，加载笔记事件
             → setBasesEvents(loadedEvents)
             → allEvents 重新计算
             → ✅ monthsData 重新计算（allEvents 变化触发）
             → UI 显示最新数据
```

## 问题2：编辑后 View 不刷新

### 现象

编辑笔记事件后，YearlyCalendar View 的内容不更新。

### 根本原因

`YearlyGlanceBasesView.updateEventFrontmatter()` 更新了 frontmatter，但没有调用 `YearlyGlanceBus.publish()`。

**对比分析**：

| 方法 | 位置 | 是否调用 publish() |
|------|------|-------------------|
| `main.syncBasesEventToFrontmatter()` | main.ts:447 | ✅ 正确调用 |
| `YearlyGlanceBasesView.updateEventFrontmatter()` | YearlyGlanceBasesView.tsx:526 | ❌ 缺失 |

### 解决方案

```typescript
async updateEventFrontmatter(event: CalendarEvent): Promise<void> {
    // ... 现有逻辑 ...
    try {
        await this.app.fileManager.processFrontMatter(file, (fm) => {
            // ... frontmatter 更新 ...
        });
        console.log('Frontmatter updated successfully for:', filePath);

        // ✅ 添加：同步成功后触发刷新，通知所有订阅者更新视图
        YearlyGlanceBus.publish();
    } catch (error) {
        console.error('Failed to update frontmatter:', error);
    }
}
```

**文件**：`src/views/YearlyGlanceBasesView.tsx:525`

## 问题3：EventManager 中编辑后不刷新

### 现象

在事件管理器中编辑笔记事件保存后，显示的内容不会更新。

### 根本原因

`EventManagerView` 组件的笔记事件加载逻辑：
1. 使用本地 state `[basesEvents, setBasesEvents]`
2. useEffect 依赖项包含 `plugin.getConfig()`（函数引用）
3. **没有订阅 `YearlyGlanceBus`**

```typescript
// ❌ 问题代码
React.useEffect(() => {
    const config = plugin.getConfig();  // 每次都返回新对象引用
    if (config.showBasesEvents && config.defaultBasesEventPath) {
        noteEventService.loadEventsFromPath(...)
            .then(setBasesEvents);
    }
}, [plugin, plugin.app, plugin.getConfig()]);  // plugin.getConfig() 每次都是新引用
```

### 解决方案

```typescript
// ✅ 修复后代码
const { config } = useYearlyGlanceConfig(plugin);  // 统一使用 hook

React.useEffect(() => {
    const loadBasesEvents = () => {
        if (config.showBasesEvents && config.defaultBasesEventPath) {
            const noteEventService = new NoteEventService(plugin.app, config);
            noteEventService.loadEventsFromPath(config.defaultBasesEventPath, config.year)
                .then(setBasesEvents)
                .catch((error) => {
                    console.error("[YearlyGlance] Failed to load note events:", error);
                    setBasesEvents([]);
                });
        } else {
            setBasesEvents([]);
        }
    };

    // 初始加载
    loadBasesEvents();

    // 订阅 YearlyGlanceBus，当笔记事件更新时重新加载
    const unsubscribe = YearlyGlanceBus.subscribe(loadBasesEvents);

    return unsubscribe;
}, [config.showBasesEvents, config.defaultBasesEventPath, config.year, config.dataVersion]);
```

**文件**：`src/components/EventManager/EventManager.tsx:48-70`

### 关键改进

1. **使用 `useYearlyGlanceConfig`** 获取稳定的 config 对象
2. **依赖项使用具体的配置值**，而不是 `plugin.getConfig()`
3. **订阅 `YearlyGlanceBus`**，响应外部数据变化
4. **提取加载函数**，避免代码重复

## 相关修复

### 修复 1：笔记链接显示

在事件卡片中添加可点击的笔记名称：

```typescript
// src/components/EventManager/EventItem.tsx

const extractNoteInfo = (eventId: string) => {
    if (!eventId.startsWith('bases-')) return null;
    const idWithoutPrefix = eventId.replace('bases-', '');
    const mdIndex = idWithoutPrefix.indexOf('.md');
    if (mdIndex <= 0) return null;
    const filePath = idWithoutPrefix.substring(0, mdIndex + 3);
    const fileName = filePath.split('/').pop()?.replace('.md', '') || filePath;
    return { filePath, fileName };
};

const openBasesEventNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const noteInfo = extractNoteInfo(event.id);
    if (noteInfo) {
        plugin.app.workspace.openLinkText(noteInfo.filePath, '', true);
    }
};
```

## 经验总结

### 关键原则

1. **完整的依赖数组**
   - useMemo 和 useEffect 的依赖数组必须包含所有使用的响应式值
   - 使用 ESLint 的 `react-hooks/exhaustive-deps` 规则自动检查

2. **双向事件通知**
   - 任何修改数据的地方都应该调用 `YearlyGlanceBus.publish()`
   - 任何需要响应变化的组件都应该订阅 `YearlyGlanceBus`

3. **统一使用 Hook**
   - 在组件中使用 `useYearlyGlanceConfig` 获取配置
   - 避免直接调用 `plugin.getConfig()` 作为依赖项

### 订阅模式模板

```typescript
// 模板：需要响应配置变化的组件
const { config } = useYearlyGlanceConfig(plugin);

React.useEffect(() => {
    const loadData = () => {
        // 加载数据逻辑
    };

    // 初始加载
    loadData();

    // 订阅总线
    const unsubscribe = YearlyGlanceBus.subscribe(loadData);

    return unsubscribe;
}, [/* 具体的配置值 */]);
```

### 常见误区

1. **依赖数组不完整**
   - 症状：数据变化了但 UI 不更新
   - 原因：useMemo/useEffect 缺少必要的依赖项
   - 解决：添加所有使用的响应式值到依赖数组

2. **忘记调用 publish()**
   - 症状：修改数据后其他视图不刷新
   - 原因：数据修改后没有通知订阅者
   - 解决：在数据修改后调用 `YearlyGlanceBus.publish()`

3. **直接使用 plugin.getConfig() 作为依赖**
   - 症状：useEffect 频繁触发或永不触发
   - 原因：函数引用每次都不同
   - 解决：使用 `useYearlyGlanceConfig` 或解构具体值

### 检查清单

在开发涉及状态同步的功能时，验证：

- [ ] useMemo/useEffect 的依赖数组是否完整
- [ ] 数据修改后是否调用了 `YearlyGlanceBus.publish()`
- [ ] 需要响应变化的组件是否订阅了 `YearlyGlanceBus`
- [ ] 是否使用了 `useYearlyGlanceConfig` 获取配置
- [ ] 依赖项是否使用稳定的值（避免函数引用）

## 相关文件

| 文件 | 修改内容 |
|------|----------|
| `src/hooks/useYearlyCalendar.ts:287` | 修复 monthsData 的 useMemo 依赖数组 |
| `src/views/YearlyGlanceBasesView.tsx:525` | 在 updateEventFrontmatter 中添加 publish() |
| `src/components/EventManager/EventManager.tsx:48-70` | 添加 YearlyGlanceBus 订阅 |
| `src/main.ts:447` | 参考：正确的 publish() 调用位置 |
