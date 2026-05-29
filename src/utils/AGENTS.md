# src/utils 维护要点

## 日期与时区

- 处理 `YYYY-MM-DD` 这类纯日期字符串时，不要使用 `new Date("YYYY-MM-DD")`。JavaScript 会按 UTC 解析这种格式，在 UTC-6/UTC-7 等负时区下再读取本地日期会回退到前一天，导致事件显示早一天。
- 需要把纯日期字符串转换为 `Date` 时，使用 `IsoUtils.fromLocalDateString()` 或 `IsoUtils.createLocalDate(year, month, day)`，保持本地日期语义。
- 需要对纯日期字符串做天数加减时，使用 `IsoUtils.addDaysToLocalDateString()`，不要先 `new Date(baseDate)` 再 `setDate()`。
- 修改事件展开逻辑时，重点回归 `expandEventByDuration.test.ts`，并至少在负时区下验证：`TZ=America/Los_Angeles npm test -- --runTestsByPath src/utils/expandEventByDuration.test.ts`。

## Issue #87 回归背景

- issue #87 的现象是事件显示为设置日期的前一天，根因是纯日期字符串被按 UTC 解析后在负时区发生日期偏移。
- 受影响路径包括事件展开前的 `dateArr` 计算；`expandEventByDuration()` 必须保持输入 `YYYY-MM-DD` 的日历日不变。
