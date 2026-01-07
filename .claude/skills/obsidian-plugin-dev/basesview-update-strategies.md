# BasesView 更新策略最佳实践

这个文档总结了在开发 BasesView 时，处理数据更新和性能优化的最佳实践。

## 目录

- [防抖更新机制](#防抖更新机制)
- [配置快照模式](#配置快照模式)
- [数据哈希比较](#数据哈希比较)
- [更新防抖](#更新防抖)
- [防止重复更新](#防止重复更新)

---

## 防抖更新机制

### 为什么需要防抖

BasesView 的 `onDataUpdated()` 方法会在以下情况被调用：
- Bases 数据变化（用户编辑笔记）
- Bases 配置变化（用户修改视图设置）
- 前端主动刷新

如果每次都立即执行更新，可能导致：
- 频繁的重新渲染，影响性能
- 不必要的计算消耗
- 用户体验不佳（视图闪烁）

### 实现防抖更新

```typescript
export class YearlyGlanceBasesView extends BasesView {
    private updateTimer: number | undefined = undefined;
    private updatePending = false;

    // onDataUpdated 由 Obsidian BasesView 调用
    public onDataUpdated(): void {
        this.containerEl.removeClass('is-loading');

        // 清除之前的定时器
        if (this.updateTimer !== undefined) {
            window.clearTimeout(this.updateTimer);
        }

        // 设置新的防抖定时器（100ms）
        this.updateTimer = window.setTimeout(() => {
            this.performUpdate();
        }, 100);
    }

    // 清理定时器
    destroy(): void {
        if (this.updateTimer !== undefined) {
            window.clearTimeout(this.updateTimer);
            this.updateTimer = undefined;
        }
    }
}
```

**关键点**：
- 使用 `window.setTimeout` 而非 `debounce` 函数（需要手动清理）
- 100ms 是合适的延迟（平衡响应性和性能）
- 在 `destroy()` 中清理定时器，防止内存泄漏

---

## 配置快照模式

### 为什么需要配置快照

BasesView 有多种配置来源：
- Bases 视图配置（`this.config.get()`）
- 插件全局配置（`plugin.getConfig()`）
- 插件数据（`plugin.getData()`）

需要检测这些配置的变化，只在真正变化时更新视图。

### 实现配置快照

```typescript
export class YearlyGlanceBasesView extends BasesView {
    private lastConfigSnapshot: string = '';

    private getConfigSnapshot(): string {
        const config = this.config;
        const pluginConfig = this.plugin.getConfig();
        const pluginData = this.plugin.getData();

        // 包含所有影响渲染的配置
        return JSON.stringify({
            // Bases 视图配置
            inheritPluginData: config.get('inheritPluginData'),
            propTitle: config.getAsPropertyId('propTitle'),
            propDate: config.getAsPropertyId('propDate'),

            // 插件全局配置
            showHolidays: pluginConfig.showHolidays,
            showBirthdays: pluginConfig.showBirthdays,
            showCustomEvents: pluginConfig.showCustomEvents,

            // 插件数据（如果启用继承）
            ...(config.get('inheritPluginData') && {
                holidays: pluginData.holidays.map(h => ({
                    id: h.id,
                    emoji: h.emoji,
                    color: h.color,
                    isHidden: h.isHidden,
                    // 只包含影响渲染的字段
                })),
            }),
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
}
```

**关键点**：
- 使用 `JSON.stringify` 创建快照
- 只包含影响渲染的字段（不包括所有数据）
- 插件数据只哈希关键字段（id, emoji, color, isHidden）

---

## 数据哈希比较

### 为什么需要数据哈希

Bases 数据可能频繁变化，但实际内容没有改变：
- Obsidian 的缓存更新
- 元数据重新计算
- 前端轮询

使用数据哈希可以避免不必要的重新渲染。

### 实现数据哈希

```typescript
export class YearlyGlanceBasesView extends BasesView {
    private lastDataHash: string = '';

    private hashData(entries: any[], config: any): string {
        // 只计算影响渲染的关键字段
        const simplifiedEntries = entries.map(entry => {
            let dateValue = null;
            let titleValue = null;
            let durationValue = null;

            try {
                dateValue = config.propDate ? entry.getValue(config.propDate) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

            try {
                titleValue = config.propTitle ? entry.getValue(config.propTitle) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

            try {
                durationValue = config.propDuration ? entry.getValue(config.propDuration) : null;
            } catch (error) {
                // 忽略错误，使用 null
            }

            return {
                path: entry.file.path,
                date: dateValue ? String(dateValue) : null,
                title: titleValue ? String(titleValue) : null,
                duration: durationValue ? String(durationValue) : null,
            };
        });

        // 排序确保顺序不影响哈希
        simplifiedEntries.sort((a, b) => a.path.localeCompare(b.path));

        return JSON.stringify(simplifiedEntries);
    }

    private performUpdate(): void {
        const entriesToProcess = this.data?.data || [];
        const dataHash = this.hashData(entriesToProcess, config);
        const dataChanged = dataHash !== this.lastDataHash;

        if (dataChanged) {
            this.lastDataHash = dataHash;
            // 重新渲染
        }
    }
}
```

**关键点**：
- 只计算影响渲染的字段（不包括所有属性）
- 使用 `entry.file.path` 作为唯一标识
- 排序确保顺序不影响哈希
- 使用 `String()` 转换确保类型一致

---

## 更新防抖

### 防抖 vs 节流

- **防抖（Debounce）**：延迟执行，如果在延迟时间内再次触发，则重置定时器
- **节流（Throttle）**：固定时间间隔执行，无论触发频率

对于 BasesView，防抖更合适：
- 用户连续编辑时，只执行最后一次更新
- 避免中间状态的渲染

### 手动实现防抖

```typescript
export class YearlyGlanceBasesView extends BasesView {
    private updateTimer: number | undefined = undefined;

    public onDataUpdated(): void {
        // 清除之前的定时器
        if (this.updateTimer !== undefined) {
            window.clearTimeout(this.updateTimer);
        }

        // 设置新的防抖定时器
        this.updateTimer = window.setTimeout(() => {
            this.performUpdate();
        }, 100);
    }
}
```

### 使用 Obsidian 的 debounce

```typescript
import { debounce } from 'obsidian';

export class MyView extends BasesView {
    private onResizeDebounce = debounce(
        () => { if (this.map) this.map.resize() },
        100,
        true
    );

    onResize(): void {
        this.onResizeDebounce();
    }
}
```

**选择建议**：
- **手动实现**：需要手动清理定时器（如 `destroy()` 时）
- **Obsidian debounce**：不需要手动管理，但只能在方法级别使用

---

## 防止重复更新

### 为什么需要防止重复更新

在某些情况下，`onDataUpdated()` 可能在更新完成前被再次调用：
- 异步数据加载
- 快速连续的配置变化
- 用户快速切换视图

### 实现更新锁

```typescript
export class YearlyGlanceBasesView extends BasesView {
    private updatePending = false;

    private performUpdate(): void {
        if (this.updatePending) {
            return; // 如果已经有更新在进行，跳过
        }

        this.updatePending = true;

        try {
            // 执行更新逻辑
            this.buildMixedEvents(config);
            this.renderEvents();
        } finally {
            this.updatePending = false;
        }
    }

    public onDataUpdated(): void {
        if (!this.updatePending) {
            // 只有在没有更新进行时才启动新的更新
            this.updateTimer = window.setTimeout(() => {
                this.performUpdate();
            }, 100);
        }
    }
}
```

**关键点**：
- 使用 `finally` 确保锁总是被释放
- 即使更新失败，也要释放锁
- 在 `onDataUpdated()` 中检查锁状态

---

## 完整示例

```typescript
export class YearlyGlanceBasesView extends BasesView {
    // 防抖定时器
    private updateTimer: number | undefined = undefined;

    // 更新锁
    private updatePending = false;

    // 快照
    private lastConfigSnapshot: string = '';
    private lastDataHash: string = '';

    public onDataUpdated(): void {
        this.containerEl.removeClass('is-loading');

        // 1. 检查配置变化
        const configSnapshot = this.getConfigSnapshot();
        const configChanged = this.lastConfigSnapshot !== configSnapshot;

        // 2. 检查数据变化
        const dataHash = this.hashData(this.data?.data || [], config);
        const dataChanged = dataHash !== this.lastDataHash;

        // 3. 如果没有变化，跳过更新
        if (!configChanged && !dataChanged) {
            return;
        }

        // 4. 清除之前的防抖定时器
        if (this.updateTimer !== undefined) {
            window.clearTimeout(this.updateTimer);
        }

        // 5. 设置新的防抖定时器
        this.updateTimer = window.setTimeout(() => {
            this.performUpdate();
            this.lastConfigSnapshot = configSnapshot;
            this.lastDataHash = dataHash;
        }, 100);
    }

    private performUpdate(): void {
        if (this.updatePending) {
            return;
        }

        this.updatePending = true;

        try {
            const config = this.loadConfig();
            const events = this.buildMixedEvents(config);
            this.renderEvents(events);
        } finally {
            this.updatePending = false;
        }
    }

    destroy(): void {
        if (this.updateTimer !== undefined) {
            window.clearTimeout(this.updateTimer);
            this.updateTimer = undefined;
        }
    }
}
```

---

## 常见问题

### Q: 防抖延迟设置为多少合适？

**A**: 取决于数据更新频率：
- **高频更新**（如实时数据）：100-200ms
- **中频更新**（如用户编辑）：50-100ms
- **低频更新**（如配置变化）：可以不用防抖

### Q: 配置快照应该包含哪些字段？

**A**: 只包含影响渲染的字段：
- ✅ 布尔配置（showHolidays, showBirthdays）
- ✅ 属性映射（propTitle, propDate）
- ✅ 影响显示的样式（emoji, color）
- ❌ 内部状态（isFirstLoad, lastDataHash）
- ❌ 不影响显示的配置

### Q: 数据哈希为什么要排序？

**A**: `JSON.stringify` 的结果依赖于对象属性的顺序。如果不排序：
- 相同的数据，不同的顺序 → 不同的哈希
- 导致错误地认为数据已变化

---

## 相关资源

- [Obsidian BasesView API 文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Yearly Glance BasesView 实现](../../src/views/YearlyGlanceBasesView.tsx) - 实际应用示例
