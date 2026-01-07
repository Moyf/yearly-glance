# 配置默认值的 UI/运行时分离模式

这个文档总结了 Obsidian 插件中配置默认值的最佳实践：UI 层面不显示默认值，运行时层面使用回退逻辑。

## 目录

- [核心概念](#核心概念)
- [传统方式的问题](#传统方式的问题)
- [UI/运行时分离模式](#ui运行时分离模式)
- [实施步骤](#实施步骤)
- [适用场景](#适用场景)

---

## 核心概念

### 什么是 UI/运行时分离

- **UI 层面**：用户在设置界面看到的值
- **运行时层面**：代码实际使用的值
- **分离原则**：UI 不显示默认值（显示为空），运行时回退到默认值

### 对比

| 方式 | UI 显示 | 运行时使用 | 用户体验 |
|------|---------|-----------|---------|
| **传统方式** | 显示默认值 | 使用 UI 设置的值 | 用户看到"已配置"的假象 |
| **分离模式** | 显示为空 | 无值时回退到默认值 | 用户清楚知道哪些未配置 |

---

## 传统方式的问题

### 问题 1：用户混淆

```typescript
// ❌ 传统方式：在 options 中设置 default
options: () => {
    return [
        {
            displayName: '标题属性',
            key: 'propTitle',
            type: 'property',
            default: 'title',  // ← UI 会显示 "title"
        }
    ];
}
```

**问题**：
- 用户看到 "title" 已经填写
- 误以为是他们自己设置的
- 不清楚是否有全局默认值

### 问题 2：无法区分"未配置"和"使用默认值"

```typescript
// 用户场景 1：从未配置 propTitle
this.config.getAsPropertyId('propTitle')
// 返回：null

// 用户场景 2：显式配置 propTitle 为 "title"
this.config.getAsPropertyId('propTitle')
// 返回："title"

// 但是：由于 default: 'title'，两种情况在 UI 上看起来一样！
```

### 问题 3：修改全局默认值后，已创建的视图不同步

```typescript
// 1. 用户创建视图 A，此时默认值是 "title"
// 2. 用户将全局默认值改为 "name"
// 3. 视图 A 仍然显示 "title"（已保存的配置）
// 4. 用户困惑：为什么改了全局设置，视图没有更新？
```

---

## UI/运行时分离模式

### 核心思想

```
┌─────────────────────────────────────────────────┐
│ UI 层面（用户看到的）                            │
├─────────────────────────────────────────────────┤
│ 不设置 default 字段 → 显示为空/未配置           │
│ 用户明确知道：这个字段我还没有配置              │
└─────────────────────────────────────────────────┘
                      ↓ 未配置时
┌─────────────────────────────────────────────────┐
│ 运行时层面（代码使用的）                         │
├─────────────────────────────────────────────────┤
│ 检查：视图配置是否存在？                          │
│   ├─ 存在 → 使用视图配置                         │
│   └─ 不存在 → 回退到插件全局配置                 │
└─────────────────────────────────────────────────┘
```

### 实现步骤

#### 步骤 1：在 options 中不设置 default

```typescript
// ✅ 分离模式：不设置 default
options: () => {
    return [
        {
            displayName: '标题属性',
            key: 'propTitle',
            type: 'property',
            filter: prop => !prop.startsWith('file.'),
            placeholder: 'Property',
            // 注意：没有 default 字段
        }
    ];
}
```

#### 步骤 2：在代码中实现回退逻辑

```typescript
private performUpdate(): void {
    const pluginConfig = this.plugin.getConfig();

    // 实现两层回退
    const config = {
        // 1. 尝试从视图配置读取
        // 2. 如果为 null，回退到插件全局配置
        // 3. 如果还是 null，使用硬编码默认值
        propTitle: this.config.getAsPropertyId('propTitle')
            || pluginConfig.basesEventTitleProp
            || 'title',  // 最后的兜底
    };

    // 使用 config.propTitle...
}
```

#### 步骤 3：确保插件全局配置有默认值

```typescript
// src/type/Settings.ts
export const DEFAULT_SETTINGS: YearlyGlanceSettings = {
    // ... 其他配置
    basesEventTitleProp: 'title',      // ← 全局默认值
    basesEventDateProp: 'event_date',
    basesEventDurationProp: 'duration_days',
};
```

---

## 实施步骤

### 完整示例：BasesView 属性配置

#### 1. 定义插件全局配置

```typescript
// src/type/Settings.ts
export interface YearlyGlanceSettings {
    // ... 其他配置

    // Bases 事件属性名（全局默认值）
    basesEventTitleProp?: string;
    basesEventDateProp?: string;
    basesEventDurationProp?: string;
    basesEventIconProp?: string;
    basesEventColorProp?: string;
    basesEventDescriptionProp?: string;
}

export const DEFAULT_SETTINGS: YearlyGlanceSettings = {
    // ... 其他默认值

    // 提供合理的默认值
    basesEventTitleProp: 'title',
    basesEventDateProp: 'event_date',
    basesEventDurationProp: 'duration_days',
    basesEventIconProp: 'icon',
    basesEventColorProp: 'color',
    basesEventDescriptionProp: 'description',
};
```

#### 2. 在插件设置中添加配置项

```typescript
// src/components/Settings/SettingsTab.tsx
export default class YearlyGlanceSettingsTab extends PluginSettingTab {
    display(): void {
        new Setting(this.containerEl)
            .setName('笔记事件属性名')
            .setDesc('配置从笔记 frontmatter 读取事件时使用的属性名')
            .addText(text => text
                .setPlaceholder('title')
                .setValue(this.plugin.settings.config.basesEventTitleProp)
                .onChange(async (value) => {
                    this.plugin.settings.config.basesEventTitleProp = value;
                    await this.plugin.saveSettings();
                }));

        // ... 其他属性配置
    }
}
```

#### 3. 在 BasesView options 中不设置 default

```typescript
// src/main.ts
private registerBasesViews() {
    this.registerBasesView(VIEW_TYPE_YEARLY_GLANCE_BASES, {
        name: 'Yearly Glance',
        icon: 'telescope',
        factory: (controller, containerEl) => {
            return new YearlyGlanceBasesView(controller, containerEl, this);
        },
        options: () => {
            return [
                {
                    displayName: '标题属性',
                    key: 'propTitle',
                    type: 'property',
                    filter: prop => !prop.startsWith('file.'),
                    placeholder: 'Property',
                    // ❌ 不要设置 default: defaultTitleProp
                },
                // ... 其他属性配置
            ];
        },
    });
}
```

#### 4. 在视图代码中实现回退逻辑

```typescript
// src/views/YearlyGlanceBasesView.tsx
export class YearlyGlanceBasesView extends BasesView {
    private performUpdate(): void {
        // 获取插件全局配置
        const pluginConfig = this.plugin.getConfig();

        // 实现回退逻辑
        const config = {
            propTitle: this.config.getAsPropertyId('propTitle')
                || pluginConfig.basesEventTitleProp
                || null,
            propDate: this.config.getAsPropertyId('propDate')
                || pluginConfig.basesEventDateProp
                || null,
            // ... 其他属性
        };

        // 使用 config...
    }
}
```

---

## 适用场景

### ✅ 应该使用分离模式的场景

1. **BasesView 属性配置**
   - 每个视图可能需要不同的属性映射
   - 用户需要明确知道哪些属性已配置

2. **插件设置中的可选功能**
   - 如"自定义图标路径"
   - 未配置时使用插件内置图标

3. **有全局默认值的配置**
   - 如"默认存储路径"
   - 用户可以为特定视图覆盖

### ❌ 不应该使用分离模式的场景

1. **布尔类型配置**
   - 如"启用功能 X"
   - 应该有明确的 on/off 状态

2. **没有全局默认值的配置**
   - 如"用户名"
   - 必须由用户显式设置

3. **枚举类型配置**
   - 如"主题模式"（light/dark）
   - 应该始终显示当前选中的值

---

## 高级用法

### 三层回退机制

```typescript
const config = {
    // 层级 1：视图特定配置
    // 层级 2：插件全局配置
    // 层级 3：硬编码默认值（最后的兜底）
    propTitle: this.config.getAsPropertyId('propTitle')
        || pluginConfig.basesEventTitleProp
        || 'title',
};
```

### 条件回退

```typescript
// 只有在特定条件下才使用全局配置
const iconDisplay = this.isEmbedded()
    ? this.config.get('iconDisplay') || pluginConfig.defaultIconDisplay
    : 'none';  // 嵌入模式不显示图标
```

### 用户友好的提示

```typescript
// 在设置界面添加说明
new Setting(this.containerEl)
    .setName('默认图标属性名')
    .setDesc('配置笔记事件中图标字段的名称。留空则不读取图标。')
    .addText(text => text
        .setPlaceholder('未配置')
        .setValue(this.plugin.settings.config.basesEventIconProp || '')
        .onChange(async (value) => {
            this.plugin.settings.config.basesEventIconProp = value || undefined;
            await this.plugin.saveSettings();
        }));
```

---

## 用户体验优化

### 1. 视觉区分"未配置"和"默认值"

```typescript
// 在 UI 中使用占位符文本
{
    displayName: '标题属性',
    key: 'propTitle',
    type: 'property',
    placeholder: '使用全局默认值 (title)',  // 明确提示
}
```

### 2. 显示当前使用的值（包括回退值）

```typescript
// 在设置页面显示实际使用的值
const effectivePropTitle = config.propTitle
    || pluginConfig.basesEventTitleProp
    || 'title';

new Setting(this.containerEl)
    .setName('标题属性')
    .setDesc(`当前使用：${effectivePropTitle}`)
    .addText(/* ... */);
```

### 3. 提供"重置为全局默认值"按钮

```typescript
new Setting(this.containerEl)
    .setName('标题属性')
    .addText(text => {
        text.setValue(config.propTitle || '');
        text.onChange(async (value) => {
            this.config.set('propTitle', value || null);  // null 表示使用全局默认
            await this.saveConfig();
        });
    })
    .addButton(button => {
        button.setIcon('rotate-ccw')
            .setTooltip('重置为全局默认值')
            .onClick(() => {
                this.config.set('propTitle', null);
            });
    });
```

---

## 测试检查清单

实施 UI/运行时分离模式后，验证以下场景：

### UI 层面

- [ ] 创建新视图时，属性配置显示为空
- [ ] 用户能明确区分"未配置"和"已配置"
- [ ] 占位符文本清晰说明会使用默认值

### 运行时层面

- [ ] 未配置属性时，正确使用全局默认值
- [ ] 修改全局默认值后，未配置的视图自动使用新值
- [ ] 已配置的视图不受全局默认值影响

### 边界情况

- [ ] 全局默认值被删除后，使用硬编码默认值
- [ ] 用户配置空字符串时，视为未配置
- [ ] 视图配置被删除后，重新使用全局默认值

---

## 相关资源

- [Obsidian BasesView API 文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Yearly Glance BasesView 实现](../../src/views/YearlyGlanceBasesView.tsx) - 实际应用示例
- [obsidian-maps 插件](https://github.com/esm7/obsidian-maps) - 参考实现
