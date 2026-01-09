# 事件数据格式兼容性：eventDate.isoDate 同步更新

这个文档总结了在 Obsidian 插件中处理事件日期计算时的常见陷阱，以及如何确保 `eventDate.isoDate` 与 `dateArr` 保持同步。

## 目录

- [问题场景](#问题场景)
- [问题根源](#问题根源)
- [解决方案](#解决方案)
- [实施指南](#实施指南)
- [测试验证](#测试验证)

---

## 问题场景

### 用户报告

插件中旧格式的生日/节日数据无法在日历视图中显示：
- 新创建的事件可以正常显示
- 旧版本创建的事件（生日、节日、自定义事件）不显示
- 控制台没有错误日志

### 数据格式对比

**旧格式（无法显示）**：
```json
{
  "id": "birth-0b9e0447",
  "text": "阿戒生日",
  "eventDate": {
    "isoDate": "1997-04-01",  // ← 出生年份
    "calendar": "GREGORIAN",
    "userInput": {
      "input": "1997-04-01",
      "calendar": "GREGORIAN"
    }
  },
  "dateArr": ["2026-04-01"]  // ← 显示年份
}
```

**新格式（正常显示）**：
```json
{
  "id": "birth-26614ad0",
  "text": "小狗生日",
  "eventDate": {
    "isoDate": "2026-04-01",  // ← 显示年份
    "calendar": "GREGORIAN",
    "userInput": {
      "input": "2026-04-01"
    }
  },
  "dateArr": ["2026-04-01"]
}
```

**关键差异**：
- 旧格式：`eventDate.isoDate` = 出生年份（1997-04-01）
- 新格式：`eventDate.isoDate` = 显示年份（2026-04-01）
- 两者都有正确的 `dateArr`

---

## 问题根源

### 1. 日期计算方法只更新了 dateArr

在 `EventCalculator` 的更新方法中，只计算并返回了 `dateArr`，但没有同步更新 `eventDate.isoDate`：

```typescript
// ❌ 错误实现
static updateBirthdayInfo(birthday: Birthday, yearSelected: number) {
    const dateArr = this.calculateDateArr(
        "birthday",
        birthday.eventDate.isoDate,  // 使用原始日期（出生年份）
        birthday.eventDate.calendar,
        yearSelected
    );

    return {
        ...birthday,  // ← 保留原始 eventDate（出生年份）
        dateArr,      // ← 只更新了 dateArr（显示年份）
        nextBirthday,
        age,
    };
}
```

### 2. 多日事件扩展依赖 eventDate.isoDate

在 `useYearlyCalendar` 中，`expandEventByDuration` 函数使用 `eventDate.isoDate` 作为基础日期来扩展多日事件：

```typescript
const expandEventByDuration = (event: any, eventType: any) => {
    const duration = event.duration || 1;
    const baseDate = event.eventDate?.isoDate;  // ← 使用 eventDate.isoDate

    for (let dayIndex = 0; dayIndex < duration; dayIndex++) {
        const currentDate = new Date(baseDate);  // ← 从 baseDate 扩展
        currentDate.setDate(currentDate.getDate() + dayIndex);
        const currentDateISO = IsoUtils.toLocalDateString(currentDate);

        events.push({
            ...event,
            eventDate: {
                ...event.eventDate,
                isoDate: currentDateISO
            },
        });
    }
};
```

### 3. 日期匹配逻辑优先检查 eventDate.isoDate

```typescript
const dayEvents = allEvents.filter((event) => {
    // 优先检查扩展后的 eventDate.isoDate
    if (event.eventDate?.isoDate === currentDateISO) {
        return true;
    }
    // 兼容旧的 dateArr 匹配方式
    return event.dateArr?.some((dateStr: string) => {
        return dateStr === currentDateISO;
    });
});
```

### 问题链路

```
旧格式数据
    ↓
updateBirthdayInfo() 只更新 dateArr
    ↓
eventDate.isoDate 仍然是 1997-04-01
    ↓
expandEventByDuration 使用 1997-04-01 作为基础日期
    ↓
扩展后的日期是 1997-04-01、1997-04-02...
    ↓
在 2026 年日历中匹配不到 ❌
```

---

## 解决方案

### 核心原则

**`eventDate.isoDate` 必须反映当前显示年份的日期，而不是原始输入日期。**

### 正确实现

在更新事件信息时，同步更新 `eventDate.isoDate` 为 `dateArr[0]`：

```typescript
// ✅ 正确实现
static updateBirthdayInfo(birthday: Birthday, yearSelected: number) {
    const dateArr = this.calculateDateArr(
        "birthday",
        birthday.eventDate.isoDate,
        birthday.eventDate.calendar,
        yearSelected
    );

    return {
        ...birthday,
        eventDate: {
            ...birthday.eventDate,
            isoDate: dateArr[0],  // ← 更新为显示年份的日期
        },
        dateArr,
        nextBirthday,
        age,
    };
}
```

### 同样适用于其他事件类型

**节日**：
```typescript
static updateHolidayInfo(holiday: Holiday, yearSelected: number) {
    const dateArr = this.calculateDateArr(
        "holiday",
        isoDate,
        calendar,
        yearSelected
    );

    return {
        ...holiday,
        eventDate: {
            ...holiday.eventDate,
            isoDate: dateArr[0],  // ← 同样更新
        },
        dateArr,
    };
}
```

**自定义事件**：
```typescript
static updateCustomEventInfo(customEvent: CustomEvent, yearSelected: number) {
    const dateArr = this.calculateDateArr(
        "customEvent",
        customEvent.eventDate.isoDate,
        customEvent.eventDate.calendar,
        yearSelected,
        customEvent.isRepeat
    );

    return {
        ...customEvent,
        eventDate: {
            ...customEvent.eventDate,
            isoDate: dateArr[0],  // ← 同样更新
        },
        dateArr,
    };
}
```

---

## 实施指南

### 步骤 1：识别所有事件更新方法

搜索所有调用 `calculateDateArr` 的方法：

```bash
grep -rn "calculateDateArr" src/
```

### 步骤 2：检查返回值

确保所有返回值都包含更新后的 `eventDate.isoDate`：

```typescript
return {
    ...event,
    eventDate: {
        ...event.eventDate,
        isoDate: dateArr[0],  // ← 必须包含这一行
    },
    dateArr,
    // 其他字段...
};
```

### 步骤 3：保留原始输入信息

注意不要覆盖 `eventDate.userInput`，它应该保留用户的原始输入：

```typescript
eventDate: {
    ...event.eventDate,  // ← 保留 userInput 等其他字段
    isoDate: dateArr[0],  // ← 只更新 isoDate
},
```

### 步骤 4：测试数据格式兼容性

1. **旧格式数据**：`eventDate.isoDate` = 出生年份
2. **新格式数据**：`eventDate.isoDate` = 显示年份
3. **修复后**：两者都应该正常显示

---

## 测试验证

### 单元测试

```typescript
describe('EventCalculator - updateBirthdayInfo', () => {
    it('应该更新 eventDate.isoDate 为显示年份', () => {
        const birthday = {
            id: 'birth-001',
            text: '测试生日',
            eventDate: {
                isoDate: '1997-04-01',  // 出生年份
                calendar: 'GREGORIAN',
            },
        };

        const updated = EventCalculator.updateBirthdayInfo(birthday, 2026);

        // 验证 eventDate.isoDate 已更新为显示年份
        expect(updated.eventDate.isoDate).toBe('2026-04-01');
        // 验证 dateArr 也正确
        expect(updated.dateArr).toContain('2026-04-01');
    });
});
```

### 手动测试

1. **准备旧格式数据**：手动修改 `data.json`，将某个事件的 `eventDate.isoDate` 改为出生年份
2. **重新加载插件**：触发 `updateAllEventsDateObj()`
3. **验证显示**：检查事件是否在正确的日期显示
4. **验证数据持久化**：重新加载插件，检查 `data.json` 中 `eventDate.isoDate` 是否已更新

### 边界情况

- **农历事件**：确保农历转换后 `isoDate` 正确
- **重复事件**：确保 `isRepeat` 事件的 `dateArr` 和 `isoDate` 同步
- **多日事件**：确保 `duration > 1` 的事件扩展正确
- **无年份事件**：确保 `year === undefined` 的处理正确

---

## 常见问题

### Q: 为什么要保留 userInput？

**A**: `userInput` 保存了用户的原始输入，用于：
1. 在编辑表单中显示原始值
2. 重新计算日期时使用原始日期
3. 区分"1997-04-01"和"2026-04-01"的语义差异

### Q: dateArr[0] 总是正确的吗？

**A**: 对于大多数情况，是的。`dateArr[0]` 是计算后的第一个显示日期。但对于：
- **跨年事件**：`dateArr[0]` 可能是前一年的日期
- **多日事件**：`dateArr[0]` 是事件的第一天

如果有特殊需求，可以根据事件类型选择 `dateArr` 中的特定日期。

### Q: 是否需要数据迁移？

**A**: 不需要。修复后：
1. 旧格式数据会在下次加载插件时自动更新
2. `updateAllEventsDateObj()` 会重新计算所有事件的 `eventDate.isoDate`
3. 更新后的数据会保存到 `data.json`

---

## 相关资源

- [EventCalculator 源码](../../src/utils/eventCalculator.ts) - 事件日期计算逻辑
- [useYearlyCalendar 源码](../../src/hooks/useYearlyCalendar.ts) - 事件过滤和扩展逻辑
- [事件类型定义](../../src/type/Events.ts) - `BaseEvent`、`Birthday`、`Holiday`、`CustomEvent` 接口
