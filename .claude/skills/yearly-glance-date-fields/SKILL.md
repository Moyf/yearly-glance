---
name: yearly-glance-date-fields
description: Yearly Glance 插件中日期字段的数据关系、转换逻辑和计算规则。在处理事件日期、使用 eventDate.isoDate、计算 dateArr 或处理农历/公历日期转换时使用此技能。
author: Moy
version: 1.0.0
category: development
tags: [yearly-glance, date, eventdate, datearr, lunar, gregorian]
---

# Yearly Glance 日期字段数据关系

## 概述

Yearly Glance 插件使用多层日期字段来处理不同场景：存储、显示、计算。理解这些字段之间的关系对于正确处理事件日期至关重要。

## 快速参考

| 字段 | 用途 | 格式 | 示例 |
|------|------|------|------|
| `eventDate.userInput.input` | 用户原始输入 | 原始字符串 | `2025-01-01`, `正月初一` |
| `eventDate.isoDate` | 标准化存储 | `YYYY-MM-DD` 或 `MM-DD` | `2025-01-01`, `01-01` |
| `eventDate.calendar` | 日历类型 | `GREGORIAN`/`LUNAR`/`LUNAR_LEAP` | `GREGORIAN` |
| `dateArr` | 运行时计算 | 公历日期数组 | `["2026-01-01"]` |

## 核心类型定义

### EventDate 结构 ([src/type/Date.ts:29-32](src/type/Date.ts#L29-L32))

```typescript
interface EventDate extends StandardDate {
    userInput: UserDateInput;  // 用户原始输入（用于编辑和显示）
}

interface StandardDate {
    isoDate: string;           // ISO 格式
    calendar: CalendarType;    // 日历类型
}

interface UserDateInput {
    input: string;             // 用户输入的原始字符串
    calendar?: CalendarType;   // 用户指定的日历类型（可选，支持自动识别）
}
```

### BaseEvent 中的日期字段 ([src/type/Events.ts:16-34](src/type/Events.ts#L16-L34))

```typescript
interface BaseEvent {
    eventDate: EventDate;           // 标准化的日期信息（持久化）
    date?: string;                  // @deprecated 使用 eventDate.isoDate 替代
    dateType?: "SOLAR" | "LUNAR";   // @deprecated 使用 eventDate.calendar 替代
    dateArr?: string[];             // 计算后的公历日期数组（运行时生成）
}
```

## 字段详解

### 1. eventDate.userInput.input

**用途**: 存储用户输入的原始字符串

**格式示例**:
- 公历: `2025-01-01`, `01-01`, `1月1日`
- 农历: `2025-正月初一`, `正月初一`, `闰二月初一`

**特点**:
- ==保持用户输入的原始格式==
- 用于编辑时回显
- 用于事件列表显示
- 可含年份或不含年份

### 2. eventDate.isoDate

**用途**: 标准化的日期存储格式

**格式规则** ([src/service/DateParseService.ts:471-487](src/service/DateParseService.ts#L471-L487)):
- 有年份: `YYYY-MM-DD` (如 `2025-01-01`)
- 无年份: `MM-DD` (如 `01-01`)

**生成逻辑**:
```typescript
// 如果 input 里不含年份，isoDate 也不加年份
if (year !== undefined) {
    return "2025-01-01";  // YYYY-MM-DD
} else {
    return "01-01";       // MM-DD
}
```

**重要原则**：`eventDate.isoDate` 必须反映当前显示年份的日期，而不是原始输入日期。详见 [event-data-format-compatibility.md](obsidian-plugin-dev/event-data-format-compatibility.md)。

### 3. eventDate.calendar

**用途**: 指定日历类型

**可选值**:
- `GREGORIAN`: 公历
- `LUNAR`: 农历
- `LUNAR_LEAP`: 农历闰月

### 4. dateArr

**用途**: ==运行时计算==的公历日期数组

**生成时机**: 每次加载或切换年份时通过 `EventCalculator` 计算

**特点**:
- 不是持久化字段
- 根据 `yearSelected` 动态生成
- 存储的是完整的公历日期（带年份）
- 农历日期可能产生两个公历日期（跨年情况）

## 数据转换流程

```
用户输入
    │
    ▼
DateParseService.parseUserInput()
    │
    ├── 解析 input 字符串
    ├── 检测/指定 calendar 类型
    │
    ▼
生成 isoDate (有年份: YYYY-MM-DD, 无年份: MM-DD)
    │
    ▼
创建 EventDate 对象
    │
    ├── isoDate: 标准化日期
    ├── calendar: 日历类型
    └── userInput: 原始输入
    │
    ▼
持久化存储
    │
    ▼
运行时加载
    │
    ▼
EventCalculator.calculateDateArr()
    │
    ├── 根据 isoDate + calendar + yearSelected
    └── 生成 dateArr[]
```

## 不同事件类型的日期计算

### 1. 节日 (Holiday)

**规则**: 忽略 isoDate 中的年份，使用 `yearSelected`

```typescript
// isoDate = "01-01" 或 "2025-01-01"
// 都会使用 yearSelected=2026 计算
dateArr = ["2026-01-01"]
```

### 2. 生日 (Birthday)

**规则**: 忽略 isoDate 中的年份，使用 `yearSelected`，但需要计算年龄等

```typescript
// isoDate = "1990-01-01"
// yearSelected = 2026
dateArr = ["2026-01-01"]
age = 36  // 根据原始年份计算
```

### 3. 自定义事件 - 不重复 (CustomEvent, isRepeat=false)

**规则**: ==如果有年份，直接使用原年份==，不随 `yearSelected` 变化

```typescript
// isoDate = "2025-01-01", 有年份
// yearSelected = 2026
dateArr = ["2025-01-01"]  // 使用原年份
```

### 4. 自定义事件 - 重复 (CustomEvent, isRepeat=true)

**规则**: 忽略 isoDate 中的年份，使用 `yearSelected`

```typescript
// isoDate = "01-01" 或 "2025-01-01"
// yearSelected = 2026
dateArr = ["2026-01-01"]
```

## 农历日期的特殊处理

### dateArr 可能包含两个日期

农历日期转换到公历时，可能跨越两个公历年份：

```typescript
// 农历 "正月初一"
// yearSelected = 2026
dateArr = ["2026-01-28", "2026-02-17"]  // 排序后
```

### 闰月处理

```typescript
// 闰二月
calendar = "LUNAR_LEAP"
isoDate = "2025--02-01"  // 负数表示闰月
```

## 常见问题

### Q: isoDate 什么时候包含年份？

**A**: 取决于用户输入是否包含年份：
- 输入 `01-01` → isoDate = `01-01`
- 输入 `2025-01-01` → isoDate = `2025-01-01`

### Q: 不重复的事件为什么需要年份？

**A**: 不重复的事件是一次性事件，需要固定年份，比如：
- 会议: `2025-01-15`
- 纪念日: `2024-05-20`

### Q: dateArr 会在什么时候重新计算？

**A**: 以下情况会触发重新计算：
- 插件加载时
- 切换年份时
- 修改事件日期时
- 从 Bases/frontmatter 同步数据时

### Q: 如何正确判断事件是否有年份？

**A**: 使用 `IsoUtils.parse()` 解析 isoDate：

```typescript
const { year, month, day } = IsoUtils.parse(isoDate, calendar);
if (year !== undefined) {
    // 有年份
} else {
    // 无年份
}
```

## 最佳实践

1. **保存原始输入**: 始终保留 `eventDate.userInput.input` 用于编辑回显
2. **同步更新 isoDate**: 更新事件时，确保 `eventDate.isoDate = dateArr[0]`
3. **运行时计算 dateArr**: 不要持久化 `dateArr`，每次运行时重新计算
4. **区分有无年份**: 使用 `IsoUtils.parse()` 判断，而不是字符串操作

## 关键文件

| 文件 | 说明 |
|------|------|
| [src/type/Date.ts](src/type/Date.ts) | 日期类型定义 |
| [src/type/Events.ts](src/type/Events.ts) | 事件类型定义 |
| [src/service/DateParseService.ts](src/service/DateParseService.ts) | 日期解析服务 |
| [src/utils/eventCalculator.ts](src/utils/eventCalculator.ts) | 日期计算核心逻辑 |
| [src/utils/isoUtils.ts](src/utils/isoUtils.ts) | ISO 日期工具类 |

## 相关文档

- [事件数据格式兼容性](obsidian-plugin-dev/event-data-format-compatibility.md) - 了解 eventDate.isoDate 与 dateArr 同步的重要性
