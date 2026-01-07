# BasesView 最佳实践：错误处理和配置验证

这个文档总结了在开发 BasesView 时，从 obsidian-maps 插件学习并应用的最佳实践。

## 目录

- [错误处理模式](#错误处理模式)
- [配置验证辅助方法](#配置验证辅助方法)
- [实施指南](#实施指南)

---

## 错误处理模式

### 为什么需要统一的错误处理

BasesView 通过 `entry.getValue()` 读取用户配置的属性，这些操作可能因为以下原因失败：
- 属性配置错误或不存在
- 属性值类型不匹配
- 属性值计算公式抛出异常
- 用户修改了笔记结构

如果没有统一的错误处理，任何异常都可能导致整个视图崩溃。

### getValue 错误处理原则

#### 1. 必需字段：失败时跳过

```typescript
// 日期是必需字段，读取失败则跳过整个条目
let dateValue: any = null;
try {
    dateValue = config.propDate ? entry.getValue(config.propDate) : null;
} catch (error) {
    console.warn(`Failed to read date property for ${entry.file.name}:`, error);
    continue; // 跳过此条目
}

if (!dateValue || !dateValue.isTruthy()) continue;
```

#### 2. 可选字段：失败时使用默认值

```typescript
// 标题是可选字段，读取失败时使用文件名
let titleValue = entry.file.name.replace(/\.md$/, '');
if (config.propTitle) {
    try {
        const rawTitle = entry.getValue(config.propTitle);
        if (rawTitle && rawTitle.isTruthy()) {
            titleValue = rawTitle.toString();
        }
    } catch (error) {
        console.warn(`Failed to read title for ${entry.file.name}, using filename:`, error);
        // 保持 titleValue 为文件名
    }
}
```

#### 3. 数据哈希：静默失败

在 `hashData` 方法中，错误不应该影响哈希计算：

```typescript
let dateValue = null;
try {
    dateValue = config.propDate ? entry.getValue(config.propDate) : null;
} catch (error) {
    // 忽略错误，使用 null
}

return {
    path: entry.file.path,
    date: dateValue ? String(dateValue) : null,
    // ...
};
```

### 完整示例：buildMixedEvents

```typescript
if (entriesToProcess.length > 0) {
    for (const entry of entriesToProcess) {
        // 1. 读取必需字段（日期）
        let dateValue: any = null;
        try {
            dateValue = config.propDate ? entry.getValue(config.propDate) : null;
        } catch (error) {
            console.warn(`Failed to read date property for ${entry.file.name}:`, error);
            continue; // 必需字段失败，跳过
        }

        if (!dateValue || !dateValue.isTruthy()) continue;

        // 2. 读取可选字段（标题）
        let titleValue = entry.file.name.replace(/\.md$/, '');
        if (config.propTitle) {
            try {
                const rawTitle = entry.getValue(config.propTitle);
                if (rawTitle && rawTitle.isTruthy()) {
                    titleValue = rawTitle.toString();
                }
            } catch (error) {
                console.warn(`Failed to read title for ${entry.file.name}, using filename:`, error);
            }
        }

        // 3. 读取可选字段（duration）
        let durationNum = 1;
        if (config.propDuration) {
            try {
                const durationValue = entry.getValue(config.propDuration);
                if (durationValue && durationValue.isTruthy()) {
                    const durationStr = durationValue.toString();
                    const parsed = parseInt(durationStr, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                        durationNum = parsed;
                    }
                }
            } catch (error) {
                console.warn(`Failed to read duration for ${entry.file.name}, using default (1):`, error);
            }
        }

        // 4. 创建事件...
    }
}
```

---

## 配置验证辅助方法

### 为什么需要配置验证

直接使用 `this.config.get(key)` 存在以下问题：
- 没有类型验证，可能导致运行时错误
- 没有范围检查，值可能超出合理范围
- 没有默认值处理，null/undefined 需要额外判断
- 代码重复，每次都要写相同的验证逻辑

### 数字配置验证

```typescript
/**
 * 获取数字类型配置，带验证和范围限制
 * @param key 配置键
 * @param defaultValue 默认值
 * @param min 最小值（可选）
 * @param max 最大值（可选）
 * @returns 验证后的数字值
 */
private getNumericConfig(key: string, defaultValue: number, min?: number, max?: number): number {
    const value = this.config.get(key);
    if (value == null || typeof value !== 'number') return defaultValue;

    let result = value;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
}
```

**使用示例**：

```typescript
// 嵌入高度：默认 600，范围 400-2000
const embeddedHeight = this.getNumericConfig('embeddedHeight', 600, 400, 2000);

// 默认缩放：默认 10，范围 1-18
const defaultZoom = this.getNumericConfig('defaultZoom', 10, 1, 18);
```

### 数组配置验证

```typescript
/**
 * 获取数组类型配置，自动过滤空值
 * @param key 配置键
 * @returns 字符串数组
 */
private getArrayConfig(key: string): string[] {
    const value = this.config.get(key);
    if (!value) return [];

    // 处理数组类型
    if (Array.isArray(value)) {
        return value.filter(item => typeof item === 'string' && item.trim().length > 0);
    }

    // 处理单个字符串类型（兼容性）
    if (typeof value === 'string' && value.trim().length > 0) {
        return [value.trim()];
    }

    return [];
}
```

**使用示例**：

```typescript
// 地图瓦片配置
const mapTiles = this.getArrayConfig('mapTiles');
const mapTilesDark = this.getArrayConfig('mapTilesDark');
```

### 布尔配置验证

```typescript
/**
 * 获取布尔类型配置，带默认值
 * @param key 配置键
 * @param defaultValue 默认值
 * @returns 布尔值
 */
private getBooleanConfig(key: string, defaultValue: boolean): boolean {
    const value = this.config.get(key);
    if (value == null) return defaultValue;
    return value === true;
}
```

**使用示例**：

```typescript
// 布尔开关配置
const inheritPluginData = this.getBooleanConfig('inheritPluginData', false);
const limitHeight = this.getBooleanConfig('limitHeight', false);
```

### 完整示例：performUpdate

```typescript
private performUpdate(): void {
    const pluginConfig = this.plugin.getConfig();

    // 使用验证辅助方法读取配置
    const config = {
        // 布尔配置
        inheritPluginData: this.getBooleanConfig('inheritPluginData', false),
        limitHeight: this.getBooleanConfig('limitHeight', false),

        // 数字配置（带范围）
        embeddedHeight: this.getNumericConfig('embeddedHeight', 600, 400, 2000),

        // 属性 ID 配置（使用 AsPropertyId API）
        propTitle: this.config.getAsPropertyId('propTitle') || pluginConfig.basesEventTitleProp || null,
        propDate: this.config.getAsPropertyId('propDate') || pluginConfig.basesEventDateProp || null,
    };

    // ...
}
```

---

## 实施指南

### 步骤 1：添加辅助方法

在 BasesView 类中添加三个私有方法：

```typescript
export class MyBasesView extends BasesView {
    // 1. getNumericConfig
    private getNumericConfig(key: string, defaultValue: number, min?: number, max?: number): number {
        const value = this.config.get(key);
        if (value == null || typeof value !== 'number') return defaultValue;
        let result = value;
        if (min !== undefined) result = Math.max(min, result);
        if (max !== undefined) result = Math.min(max, result);
        return result;
    }

    // 2. getArrayConfig
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

    // 3. getBooleanConfig
    private getBooleanConfig(key: string, defaultValue: boolean): boolean {
        const value = this.config.get(key);
        if (value == null) return defaultValue;
        return value === true;
    }
}
```

### 步骤 2：更新配置读取

在 `performUpdate` 或 `loadConfig` 方法中使用新的辅助方法：

```typescript
// 替换前
const config = {
    inheritPluginData: this.config.get('inheritPluginData') === true,
    limitHeight: this.config.get('limitHeight') === true,
    embeddedHeight: typeof this.config.get('embeddedHeight') === 'number'
        ? this.config.get('embeddedHeight')
        : 600,
};

// 替换后
const config = {
    inheritPluginData: this.getBooleanConfig('inheritPluginData', false),
    limitHeight: this.getBooleanConfig('limitHeight', false),
    embeddedHeight: this.getNumericConfig('embeddedHeight', 600, 400, 2000),
};
```

### 步骤 3：添加 getValue 错误处理

在所有 `entry.getValue()` 调用处添加 try-catch：

**必需字段**：
```typescript
try {
    dateValue = entry.getValue(config.propDate);
} catch (error) {
    console.warn(`Failed to read ${field} for ${entry.file.name}:`, error);
    continue;
}
```

**可选字段**：
```typescript
try {
    value = entry.getValue(config.prop);
    if (value && value.isTruthy()) {
        // 处理值
    }
} catch (error) {
    console.warn(`Failed to read ${field} for ${entry.file.name}:`, error);
    // 使用默认值
}
```

### 步骤 4：测试

1. **错误处理测试**：
   - 创建包含无效属性的 Bases 笔记
   - 验证视图不会崩溃
   - 验证控制台有警告日志

2. **配置验证测试**：
   - 设置超出范围的数字配置（如 embeddedHeight: 5000）
   - 验证自动限制到最大值 2000
   - 设置无效类型配置（如 limitHeight: "true"）
   - 验证使用默认值

3. **编译测试**：
   ```bash
   npm run build
   ```

---

## 常见问题

### Q: 什么时候使用 getNumericConfig 的 min/max 参数？

**A**: 当配置值有明确的物理或业务限制时：
- 高度/宽度：最小 100，最大 2000（防止 UI 破坏）
- 缩放级别：最小 1，最大 18（地图/视图的有效范围）
- 数量限制：最小 0，最大 100（防止性能问题）

如果配置值没有明确限制，可以省略 min/max 参数。

### Q: hashData 中为什么不需要警告日志？

**A**: `hashData` 用于检测数据变化，而不是渲染数据。个别条目读取失败不应该影响整体哈希计算。静默失败可以避免日志噪音。

### Q: 是否需要为所有配置都创建验证方法？

**A**: 不需要。只需要为以下类型创建验证方法：
- **数字配置**：有范围限制的
- **布尔配置**：需要严格类型检查的
- **数组配置**：需要过滤空值的

对于简单的字符串或对象配置，直接使用 `this.config.get()` 即可。

---

## 相关资源

- [obsidian-maps 插件源码](https://github.com/esm7/obsidian-maps) - 参考实现
- [Obsidian BasesView API 文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Yearly Glance BasesView 实现](../../src/views/YearlyGlanceBasesView.tsx) - 实际应用示例
