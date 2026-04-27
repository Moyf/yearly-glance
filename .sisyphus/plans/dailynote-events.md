# DailyNote Events Source

## TL;DR

> **Quick Summary**: 为 Yearly Glance 插件新增 DailyNote 事件源，从日记笔记的 frontmatter 列表属性中读取事件并在年历上显示，支持简单编辑和写回。
> 
> **Deliverables**:
> - DailyNoteService 核心服务（扫描、读取、写回）
> - dailyNoteEvent 独立事件类型
> - Settings UI 配置区域（启用开关、来源选择、属性名配置）
> - 日历视图集成（事件显示、合并）
> - EventForm 适配（禁用不支持的字段）
> - EventManager 中的 DailyNote 事件标签页
> - DailyNote 创建能力（通过核心/PeriodicNotes 插件）
> - 单元测试（核心解析逻辑）
> - i18n 三语言支持
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 6 → Task 9 → Task 11 → F1-F4

---

## Context

### Original Request

用户（Moy）希望 Yearly Glance 插件支持从 Obsidian DailyNote 中读取事件。DailyNote 的 frontmatter 包含一个列表属性（如 `events`），每个列表项是一个事件文本。日期来自文件名（如 `2026-04-27.md`）。

示例 frontmatter:
```yaml
---
特殊事件:
  - 🧩 各种开发插件
  - 📝 写文档
---
```

### Interview Summary

**Key Discussions**:
- DailyNote 事件与 Bases 事件本质不同：1 note = N events（vs Bases 的 1 note = 1 event）
- 扫描范围：读取已存在的 DailyNote，匹配当前显示年份
- 扫描时机：利用 metadataCache，打开 view 时读取，后续变动时增量更新
- 编辑限制：只能修改标题文本，颜色/图标/持续天数等禁用（灰色不可点击）
- 创建策略：通过 PeriodicNotes 或核心 DailyNote 插件创建（保留模板）
- 写回格式：纯字符串列表项，使用 processFrontMatter API
- 测试策略：核心逻辑加单元测试

**Research Findings**:
- AutoCreatePeriodicNotes.js 展示了访问插件配置的方式
- 核心日记插件: `app.internalPlugins.plugins["daily-notes"].instance.options`
- PeriodicNotes 插件: `app.plugins.plugins["periodic-notes"].settings.daily`
- 现有 NoteEventService 处理 1-note-1-event 模型，DailyNote 需要独立服务处理 1-note-N-events

### Metis Review

**Identified Gaps (addressed)**:
- Event ID 唯一性：同一文件多事件需要索引或内容哈希 → 使用 `dailynote-{isoDate}-{index}` 格式
- 文件名日期格式多样性 → 从插件配置读取 format，用 moment 解析
- EventManager 展示 → 新增 dailyNoteEvent 标签页
- 禁用字段 UI 模式 → 需在 EventForm 中引入 disabled fields 概念
- 既无 DailyNote 也无 PeriodicNotes 插件时的错误提示 → 设置中显示警告
- 不引入 obsidian-daily-notes-interface npm 包 → 直接读插件设置

---

## Work Objectives

### Core Objective

为 Yearly Glance 新增 DailyNote 事件源，允许用户从日记笔记的 frontmatter 列表中读取、显示、编辑事件，并在日历上与其他事件源合并展示。

### Concrete Deliverables

- `src/service/DailyNoteService.ts` — 核心服务
- `src/service/__tests__/DailyNoteService.test.ts` — 单元测试
- `src/type/Events.ts` — EventSource.DAILYNOTE + dailyNoteEvent 类型
- `src/type/Settings.ts` — DailyNote 相关配置字段
- `src/components/Settings/ViewSettings.tsx` — DailyNote 设置 UI
- `src/hooks/useYearlyCalendar.ts` — DailyNote 事件加载和合并
- `src/components/EventForm/EventFormModal.tsx` — DailyNote 事件编辑适配
- `src/i18n/locales/{en,zh,zh-TW}.ts` — i18n 翻译
- `src/utils/migrateData.ts` — 新字段迁移逻辑

### Definition of Done

- [ ] `npm run build:local` 成功退出
- [ ] `npx tsc --noEmit` 无类型错误
- [ ] `npm run lint` 通过
- [ ] `npm test` 所有测试通过（含新增 DailyNote 测试）
- [ ] DailyNote 事件在日历上正确显示
- [ ] 编辑 DailyNote 事件后 frontmatter 正确更新
- [ ] 设置 UI 中 DailyNote 区域正常工作

### Must Have

- DailyNote 事件从 frontmatter 列表属性读取
- 日期从文件名解析（通过插件配置的 format）
- 启用/禁用 DailyNote 事件源的开关
- 核心 DailyNote 和 PeriodicNotes 双插件支持
- 可配置的属性名
- 编辑事件时只能修改标题，其他字段禁用
- 写回时通过 processFrontMatter 操作列表
- 创建事件时可选择 DailyNote 目标
- 如果 DailyNote 不存在，通过插件 API 创建
- dailyNoteEvent 独立事件类型
- i18n 三语言
- 核心逻辑单元测试

### Must NOT Have (Guardrails)

- 不引入 `obsidian-daily-notes-interface` npm 包（直接读插件设置）
- 不新增 View 类型（DailyNote 事件合入现有 YearlyGlanceView）
- 不支持编辑 DailyNote 事件的日期、颜色、图标、持续天数、日历类型
- 不实现"点击日历日期直接创建日记"功能（后续功能）
- 不扫描超出当前显示年份的文件
- 不添加实时文件监听（v1 使用 Bus publish 在显式保存/重载时触发）
- 不修改现有 Bases 事件逻辑（DailyNote 是并行独立系统）
- 不将 DailyNote 事件纳入 DataPort 导入导出（v1）
- 不支持 Weekly/Monthly/Yearly 周期笔记（仅 Daily）
- 不过度抽象——DailyNote 逻辑就是简单的列表字符串读写

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Jest via `npm test`)
- **Automated tests**: YES (TDD for core service, tests-after for integration)
- **Framework**: Jest (`npm test`)
- **TDD targets**: DailyNoteService 核心纯函数（extractDateFromFilename, parseEventsFromFrontmatter, buildEventId）

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) or Obsidian CLI
- **Backend/Logic**: Use Bash (npm test, tsc, lint)
- **Integration**: Use Obsidian CLI to reload plugin and verify

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately):
├── Task 1: Types & enum extension [quick]
├── Task 2: DailyNoteService core (read) + unit tests [deep]
├── Task 3: i18n translations for all new UI strings [quick]
└── Task 4: Settings type + migration + DEFAULT_SETTINGS [quick]

Wave 2 (After Wave 1 — Service write + Settings UI + Calendar):
├── Task 5: DailyNoteService write operations + unit tests [deep]
├── Task 6: Settings UI section in ViewSettings [visual-engineering]
├── Task 7: Calendar integration — useYearlyCalendar hook [unspecified-high]
└── Task 8: Calendar control bar — visibility toggle [quick]

Wave 3 (After Wave 2 — Edit flow + Manager + Creation):
├── Task 9: EventForm disabled fields pattern + dailyNoteEvent case [unspecified-high]
├── Task 10: EventManager dailyNoteEvent tab [unspecified-high]
└── Task 11: DailyNote creation via plugin API [deep]

Wave 4 (After Wave 3 — Polish):
├── Task 12: EventTooltip + EventItem DailyNote display [quick]
└── Task 13: Build verification + full test suite [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 2 → Task 7 → Task 9 → Task 11 → Task 13 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 4 (Wave 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 2,4,5,6,7,8,9,10,11 | 1 |
| 2 | 1 | 5,7,9,11 | 1 |
| 3 | — | 6,8,9,10 | 1 |
| 4 | 1 | 6,7,8 | 1 |
| 5 | 1,2 | 9,11 | 2 |
| 6 | 1,3,4 | — | 2 |
| 7 | 1,2,4 | 8,9 | 2 |
| 8 | 3,4,7 | — | 2 |
| 9 | 2,3,5,7 | 12 | 3 |
| 10 | 1,3 | — | 3 |
| 11 | 2,5 | — | 3 |
| 12 | 9 | — | 4 |
| 13 | ALL | F1-F4 | 4 |

### Agent Dispatch Summary

- **Wave 1**: 4 agents — T1 `quick`, T2 `deep`, T3 `quick`, T4 `quick`
- **Wave 2**: 4 agents — T5 `deep`, T6 `visual-engineering`, T7 `unspecified-high`, T8 `quick`
- **Wave 3**: 3 agents — T9 `unspecified-high`, T10 `unspecified-high`, T11 `deep`
- **Wave 4**: 2 agents — T12 `quick`, T13 `quick`
- **FINAL**: 4 agents — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [ ] 1. Types & Enum Extension — EventSource.DAILYNOTE + dailyNoteEvent 类型

  **What to do**:
  - 在 `src/type/Events.ts` 的 `EventSource` enum 中添加 `DAILYNOTE = "dailynote"`
  - 在 `EVENT_TYPE_LIST` 数组中添加 `"dailyNoteEvent"`
  - 在 `EVENT_TYPE_DEFAULT` 中添加 `dailyNoteEvent` 的默认 emoji（📅）和 color（#597ef7）
  - 在 `src/type/Settings.ts` 的 `YearlyGlanceSettings` 接口中添加 DailyNote 相关字段：
    - `showDailyNoteEvents: boolean` — 显示开关
    - `dailyNoteSource: "daily-notes" | "periodic-notes"` — 来源插件选择
    - `dailyNoteEventProp: string` — 事件属性名（默认 "events"）
  - 在 `DEFAULT_SETTINGS` 中添加这些字段的默认值
  - 在 `src/utils/migrateData.ts` 中确保旧配置缺少这些字段时自动使用默认值（依赖现有的 validateAndMergeSettings 合并逻辑，无需额外迁移代码）
  - 用 `lsp_find_references` 检查 `EventSource` 和 `EVENT_TYPE_LIST` 的所有引用点，确认不需要其他文件同步修改

  **Must NOT do**:
  - 不修改现有 Bases 事件相关逻辑
  - 不添加 DailyNote 特有的 interface（BaseEvent 够用）
  - 不在此任务中做 UI 或 service 工作

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯类型定义和枚举扩展，改动小且集中
  - **Skills**: [`obsidian-plugin-dev`, `yearly-glance-date-fields`]
    - `obsidian-plugin-dev`: 了解项目事件类型体系和配置管理模式
    - `yearly-glance-date-fields`: 了解事件日期字段的数据关系

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 2, 4, 5, 6, 7, 8, 9, 10, 11
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/type/Events.ts:10-14` — 现有 EventSource enum 定义，在此添加 DAILYNOTE
  - `src/type/Events.ts:71` — EVENT_TYPE_LIST 数组，添加 "dailyNoteEvent"
  - `src/type/Events.ts:81` — EVENT_TYPE_DEFAULT 对象，参考 basesEvent 的 emoji/color 格式
  - `src/type/Settings.ts:111-168` — 现有 Bases 相关配置字段，参考此模式添加 DailyNote 字段

  **API/Type References**:
  - `src/type/Events.ts:16-34` — BaseEvent 接口（DailyNote 事件复用此接口，不新增）
  - `src/type/Config.ts:9` — DEFAULT_CONFIG 结构

  **Test References**:
  - 无需新增测试（纯类型定义）

  **Acceptance Criteria**:

  - [ ] `npx tsc --noEmit` 无类型错误
  - [ ] `EventSource.DAILYNOTE` 在 Events.ts 中可用
  - [ ] `EVENT_TYPE_LIST` 包含 `"dailyNoteEvent"`
  - [ ] `EVENT_TYPE_DEFAULT.dailyNoteEvent` 有 emoji 和 color
  - [ ] `DEFAULT_SETTINGS` 包含 `showDailyNoteEvents`, `dailyNoteSource`, `dailyNoteEventProp`

  **QA Scenarios**:

  ```
  Scenario: Type compilation check
    Tool: Bash
    Preconditions: All type changes applied
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code 0
    Expected Result: No type errors
    Evidence: .sisyphus/evidence/task-1-tsc-check.txt

  Scenario: Verify enum values accessible
    Tool: Bash (grep)
    Preconditions: Events.ts modified
    Steps:
      1. grep for `DAILYNOTE = "dailynote"` in src/type/Events.ts
      2. grep for `"dailyNoteEvent"` in EVENT_TYPE_LIST
      3. grep for `dailyNoteEvent:` in EVENT_TYPE_DEFAULT
    Expected Result: All three patterns found
    Evidence: .sisyphus/evidence/task-1-enum-verify.txt
  ```

  **Commit**: YES
  - Message: `feat(dailynote): add EventSource.DAILYNOTE type and settings fields`
  - Files: `src/type/Events.ts`, `src/type/Settings.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 2. DailyNoteService Core — 读取逻辑 + 单元测试 (TDD)

  **What to do**:
  - 创建 `src/service/DailyNoteService.ts`，包含以下核心方法：
    - `getDailyNoteSettings(app: App): { format: string, folder: string } | null` — 根据配置的 source（"daily-notes" 或 "periodic-notes"）读取对应插件的设置。核心日记: `app.internalPlugins.plugins["daily-notes"].instance.options`；PeriodicNotes: `app.plugins.plugins["periodic-notes"].settings.daily`。返回 format 和 folder，任何一个插件不存在则返回 null
    - `extractDateFromFilename(filename: string, format: string): string | null` — 用 moment 按 format 解析文件名，成功返回 ISO date（YYYY-MM-DD），失败返回 null
    - `parseEventsFromFrontmatter(frontmatter: Record<string, unknown>, eventProp: string): string[]` — 从 frontmatter 对象中提取指定属性的列表值，返回字符串数组。处理各种边界情况（属性不存在、非数组、空数组、数组中有非字符串项）
    - `buildEventId(isoDate: string, index: number): string` — 生成事件 ID 格式 `dailynote-{isoDate}-{index}`
    - `buildCalendarEvent(title: string, isoDate: string, index: number, filePath: string): CalendarEvent` — 将解析结果转为 CalendarEvent 对象，eventType 为 "dailyNoteEvent"，eventSource 为 EventSource.DAILYNOTE
    - `loadEventsForYear(app: App, year: number, source: string, eventProp: string): Promise<CalendarEvent[]>` — 主入口：获取插件设置 → 获取 vault 所有 md 文件 → 过滤 folder 路径下的文件 → 对每个文件名匹配 format → 筛选目标年份 → 读取 metadataCache frontmatter → 解析事件列表 → 返回 CalendarEvent[]
  - 创建 `src/service/__tests__/DailyNoteService.test.ts`，TDD 先写测试：
    - `extractDateFromFilename`: 测试 "2026-04-27.md" → "2026-04-27"，"2026-04-27" → "2026-04-27"（无 .md），"20260427.md" with format "YYYYMMDD" → "2026-04-27"，"invalid.md" → null，"" → null
    - `parseEventsFromFrontmatter`: 测试 `{ events: ["A","B"] }` → ["A","B"]，`{}` → []，`{ events: "string" }` → []（非数组），`{ events: [1, "A", null] }` → ["A"]（过滤非字符串），`{ other: ["A"] }` with prop "events" → []
    - `buildEventId`: 测试 ("2026-04-27", 0) → "dailynote-2026-04-27-0"
    - `buildCalendarEvent`: 测试返回对象包含正确的 eventType, eventSource, text, eventDate, id

  **Must NOT do**:
  - 不在此任务中实现写回逻辑（Task 5）
  - 不实现 DailyNote 创建（Task 11）
  - 不实现 UI 组件
  - 不做性能优化（缓存等留给后续）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: TDD 开发模式，需要仔细设计接口和全面的测试覆盖
  - **Skills**: [`obsidian-plugin-dev`, `yearly-glance-date-fields`]
    - `obsidian-plugin-dev`: 了解 metadataCache 和 vault 操作模式
    - `yearly-glance-date-fields`: 了解 EventDate 结构和 isoDate 格式

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 5, 7, 9, 11
  - **Blocked By**: Task 1 (needs EventSource.DAILYNOTE and dailyNoteEvent type)

  **References**:

  **Pattern References**:
  - `src/service/NoteEventService.ts:1-168` — 现有笔记事件加载服务，参考其整体结构（类设计、metadataCache 用法、文件过滤模式）
  - `src/service/NoteEventService.ts:72` — `app.metadataCache.getFileCache(file)?.frontmatter` 读取模式
  - `src/service/NoteEventService.ts:158` — Bases 事件 ID 生成模式（`bases-{filePath}-{isoDate}`），DailyNote 用 `dailynote-{isoDate}-{index}`

  **API/Type References**:
  - `src/type/Events.ts:16-34` — BaseEvent / CalendarEvent 接口定义
  - `src/type/Date.ts:29-32` — EventDate / StandardDate 结构
  - `AutoCreatePeriodicNotes.js:42-56` — 访问 PeriodicNotes 和核心日记插件设置的代码模式

  **Test References**:
  - `src/service/__tests__/` — 现有测试目录结构（如果存在）
  - Jest 配置：查看 package.json 中的 jest 配置

  **External References**:
  - moment.js format patterns: DailyNote 文件名通常使用 `YYYY-MM-DD` 格式

  **Acceptance Criteria**:

  - [ ] `npm test` 通过，包含所有新增 DailyNoteService 测试
  - [ ] `extractDateFromFilename` 正确处理标准和非标准文件名
  - [ ] `parseEventsFromFrontmatter` 正确处理各种边界情况
  - [ ] `loadEventsForYear` 返回正确的 CalendarEvent 数组

  **QA Scenarios**:

  ```
  Scenario: Unit tests pass
    Tool: Bash
    Preconditions: DailyNoteService.ts and test file created
    Steps:
      1. Run `npm test -- --testPathPattern="DailyNoteService"`
      2. Assert exit code 0
      3. Verify test count ≥ 12 (at least 12 test cases)
    Expected Result: All tests pass, 0 failures
    Failure Indicators: Non-zero exit code, test failure output
    Evidence: .sisyphus/evidence/task-2-unit-tests.txt

  Scenario: Type check passes with new service
    Tool: Bash
    Preconditions: Service file created
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code 0
    Expected Result: No type errors
    Evidence: .sisyphus/evidence/task-2-tsc-check.txt
  ```

  **Commit**: YES
  - Message: `feat(dailynote): add DailyNoteService core read + unit tests`
  - Files: `src/service/DailyNoteService.ts`, `src/service/__tests__/DailyNoteService.test.ts`
  - Pre-commit: `npm test`

- [ ] 3. i18n Translations — 三语言翻译

  **What to do**:
  - 在 `src/i18n/locales/en.ts`、`zh.ts`、`zh-TW.ts` 中添加所有 DailyNote 相关的翻译 key：
    - **Settings 区域**:
      - `setting.group.dailyNote.name` — "Daily Note Events" / "日记事件" / "日記事件"
      - `setting.group.dailyNote.desc` — 描述文本
      - `setting.general.showDailyNoteEvents.name` — "Show Daily Note events" / "显示日记事件"
      - `setting.general.showDailyNoteEvents.desc` — 描述文本
      - `setting.general.dailyNoteSource.name` — "Daily Note source" / "日记来源"
      - `setting.general.dailyNoteSource.desc` — 描述文本
      - `setting.general.dailyNoteSource.dailyNotes` — "Core Daily Notes" / "核心日记插件"
      - `setting.general.dailyNoteSource.periodicNotes` — "Periodic Notes" / "Periodic Notes"
      - `setting.general.dailyNoteEventProp.name` — "Events property" / "事件属性名"
      - `setting.general.dailyNoteEventProp.desc` — 描述文本
    - **Event type**:
      - `event.type.dailyNoteEvent` — "Daily Note Event" / "日记事件"
    - **EventForm**:
      - `form.dailyNote.disabledField` — "Not supported for Daily Note events" / "日记事件不支持此属性"
    - **EventManager**:
      - `manager.tab.dailyNoteEvent` — "Daily Note" / "日记"
    - **Tooltip/Display**:
      - `tooltip.source.dailynote` — "From Daily Note" / "来自日记"
    - **Warnings**:
      - `setting.dailyNote.warning.noPlugin` — "Neither Daily Notes nor Periodic Notes plugin is enabled" / 相关警告
      - `setting.dailyNote.warning.noDailyNotes` — "Core Daily Notes plugin is not enabled"
      - `setting.dailyNote.warning.noPeriodicNotes` — "Periodic Notes plugin is not installed"
  - 遵循现有翻译 key 的命名规范（点分隔层级）

  **Must NOT do**:
  - 不修改现有翻译 key
  - 不翻译不需要的 key（保持精简）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯文本翻译工作，模式明确
  - **Skills**: [`obsidian-plugin-dev`]
    - `obsidian-plugin-dev`: 了解 i18n 系统的结构和命名规范

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 6, 8, 9, 10
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/i18n/locales/en.ts` — 英文翻译文件，参考 Bases 相关 key 的命名模式
  - `src/i18n/locales/zh.ts` — 中文翻译文件
  - `src/i18n/locales/zh-TW.ts` — 繁体中文翻译文件
  - `src/i18n/i18n.ts` — i18n 系统实现，了解 key 扁平化方式

  **Acceptance Criteria**:

  - [ ] 三个 locale 文件都包含所有 DailyNote 相关 key
  - [ ] key 命名遵循现有规范
  - [ ] `npm run build:local` 成功

  **QA Scenarios**:

  ```
  Scenario: All locale files have matching keys
    Tool: Bash
    Preconditions: Translation files updated
    Steps:
      1. grep "dailyNote" in src/i18n/locales/en.ts, count matches
      2. grep "dailyNote" in src/i18n/locales/zh.ts, count matches
      3. grep "dailyNote" in src/i18n/locales/zh-TW.ts, count matches
      4. Assert all three counts are equal
    Expected Result: All three files have the same number of dailyNote keys
    Evidence: .sisyphus/evidence/task-3-i18n-keys.txt

  Scenario: Build succeeds with new translations
    Tool: Bash
    Preconditions: All locale files updated
    Steps:
      1. Run `npm run build:local`
      2. Assert exit code 0
    Expected Result: Build completes successfully
    Evidence: .sisyphus/evidence/task-3-build.txt
  ```

  **Commit**: YES (groups with Task 4)
  - Message: `feat(i18n): add dailynote event translations for en/zh/zh-TW`
  - Files: `src/i18n/locales/en.ts`, `src/i18n/locales/zh.ts`, `src/i18n/locales/zh-TW.ts`
  - Pre-commit: `npm run build:local`

- [ ] 4. Settings Type + Migration + DEFAULT_SETTINGS

  **What to do**:
  - 验证 Task 1 的 Settings.ts 修改已就位
  - 验证 `validateAndMergeSettings`（在 main.ts loadSettings 中）能正确处理缺少 DailyNote 字段的旧配置——通过深拷贝 DEFAULT_CONFIG 再合并的方式自动补全
  - 如果需要额外的迁移逻辑（如重命名旧字段），在 `src/utils/migrateData.ts` 中添加
  - 实际上，由于这是全新字段（无旧字段需要重命名），只需确认 `validateAndMergeSettings` 的合并逻辑能覆盖即可

  **Must NOT do**:
  - 不重复 Task 1 的类型定义工作
  - 不添加不必要的迁移代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 验证性工作，改动极小
  - **Skills**: [`obsidian-plugin-dev`]
    - `obsidian-plugin-dev`: 了解配置管理和迁移模式

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/main.ts:51-66` — `loadSettings()` 中的 validateAndMergeSettings 逻辑
  - `src/utils/migrateData.ts` — 现有迁移代码模式

  **Acceptance Criteria**:

  - [ ] 旧配置（无 DailyNote 字段）加载后自动获得默认值
  - [ ] `npx tsc --noEmit` 通过

  **QA Scenarios**:

  ```
  Scenario: Default values present after migration
    Tool: Bash
    Preconditions: Settings type updated
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code 0
    Expected Result: No type errors, defaults are correctly set
    Evidence: .sisyphus/evidence/task-4-migration.txt
  ```

  **Commit**: YES (groups with Task 3)
  - Message: Combined with Task 3 commit
  - Pre-commit: `npx tsc --noEmit`

- [ ] 5. DailyNoteService Write Operations + Unit Tests (TDD)

  **What to do**:
  - 在 `src/service/DailyNoteService.ts` 中添加写操作方法：
    - `updateEventTitle(app: App, filePath: string, eventProp: string, oldTitle: string, newTitle: string): Promise<void>` — 使用 `app.fileManager.processFrontMatter()` 找到列表中的 oldTitle 并替换为 newTitle
    - `addEventToDaily(app: App, filePath: string, eventProp: string, title: string): Promise<void>` — 在列表末尾追加新事件文本。如果属性不存在则创建数组
    - `removeEventFromDaily(app: App, filePath: string, eventProp: string, title: string): Promise<void>` — 从列表中移除匹配的事件文本
  - 在测试文件中添加写操作测试：
    - mock `app.fileManager.processFrontMatter` 来验证回调函数的行为
    - 测试 updateEventTitle: 正常替换、oldTitle 不存在时不修改
    - 测试 addEventToDaily: 追加到已有列表、在空属性上创建列表
    - 测试 removeEventFromDaily: 正常移除、title 不存在时不修改

  **Must NOT do**:
  - 不实现 DailyNote 文件创建逻辑（Task 11）
  - 不实现 UI 相关逻辑

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: TDD 开发，需要 mock Obsidian API 并验证 frontmatter 操作的正确性
  - **Skills**: [`obsidian-plugin-dev`]
    - `obsidian-plugin-dev`: 了解 processFrontMatter 的用法和 frontmatter 操作模式

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8)
  - **Blocks**: Tasks 9, 11
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `src/service/BasesEventFrontmatterService.ts:10-50` — syncEventToFrontmatter 函数，展示 processFrontMatter 的使用模式
  - `src/utils/frontMatter.ts` — FrontMatter 工具类，展示 processFrontMatter CRUD 操作

  **API/Type References**:
  - Obsidian API: `app.fileManager.processFrontMatter(file, (fm) => { ... })` — fm 是可变的 frontmatter 对象

  **Test References**:
  - `src/service/__tests__/DailyNoteService.test.ts` — Task 2 中创建的测试文件，在此追加写操作测试

  **Acceptance Criteria**:

  - [ ] `npm test` 通过，包含写操作测试
  - [ ] updateEventTitle 正确替换列表项
  - [ ] addEventToDaily 正确追加列表项
  - [ ] removeEventFromDaily 正确移除列表项

  **QA Scenarios**:

  ```
  Scenario: Write operation tests pass
    Tool: Bash
    Preconditions: Write methods and tests implemented
    Steps:
      1. Run `npm test -- --testPathPattern="DailyNoteService"`
      2. Assert exit code 0
      3. Verify test count includes write operation tests (≥ 18 total)
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-5-write-tests.txt
  ```

  **Commit**: YES
  - Message: `feat(dailynote): add DailyNoteService write operations + tests`
  - Files: `src/service/DailyNoteService.ts`, `src/service/__tests__/DailyNoteService.test.ts`
  - Pre-commit: `npm test`

- [ ] 6. Settings UI — DailyNote 设置区域

  **What to do**:
  - 在 `src/components/Settings/ViewSettings.tsx` 中添加新的 SettingsBlock（放在 Bases 事件设置块之后）
  - 设置区域内容：
    - 启用/禁用开关: `showDailyNoteEvents` Toggle
    - 来源选择: `dailyNoteSource` Select dropdown，选项为 "daily-notes"（核心日记插件）和 "periodic-notes"（Periodic Notes）
    - 事件属性名: `dailyNoteEventProp` Input text（默认值 "events"）
  - 当选中的插件未启用时，显示 CalloutBlock 警告信息（使用 i18n key）
  - 插件检测逻辑：
    - 核心日记: `app.internalPlugins.plugins["daily-notes"]?.enabled`
    - PeriodicNotes: `!!app.plugins.plugins["periodic-notes"]`
  - 注意：ViewSettings 需要接收 `app` 对象来做插件检测。查看现有 prop 传递方式，可能通过 plugin 对象获取 `plugin.app`

  **Must NOT do**:
  - 不实现 DailyNote 事件的文件路径配置（路径从插件设置自动读取）
  - 不实现颜色/图标等复杂属性配置（DailyNote 不支持）

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Settings UI 组件开发，需要遵循视觉一致性
  - **Skills**: [`obsidian-plugin-dev`]
    - `obsidian-plugin-dev`: 了解 Settings UI 组件模式和样式

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7, 8)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 3, 4

  **References**:

  **Pattern References**:
  - `src/components/Settings/ViewSettings.tsx:146-250` — Bases 事件设置区域，完整参考此模式
  - `src/components/Settings/SettingsBlock.tsx` — 可折叠设置分组容器
  - `src/components/Settings/SettingsItem.tsx` — 单个设置项容器
  - `src/components/base/` — Toggle, Select, Input 等基础组件

  **API/Type References**:
  - `src/hooks/useYearlyGlanceConfig.ts` — `handleUpdateConfig` 方法的调用方式

  **Acceptance Criteria**:

  - [ ] DailyNote 设置区域在 Settings UI 中正确显示
  - [ ] 三个设置项可操作：开关、来源选择、属性名输入
  - [ ] 插件未启用时显示警告
  - [ ] `npm run build:local` 成功

  **QA Scenarios**:

  ```
  Scenario: Settings UI renders correctly
    Tool: Bash
    Preconditions: ViewSettings updated
    Steps:
      1. Run `npm run build:local`
      2. Assert exit code 0
    Expected Result: Build succeeds, settings UI can be rendered
    Evidence: .sisyphus/evidence/task-6-build.txt

  Scenario: Type check for Settings UI
    Tool: Bash
    Preconditions: All settings types and UI components in place
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code 0
    Expected Result: No type errors in ViewSettings
    Evidence: .sisyphus/evidence/task-6-tsc.txt
  ```

  **Commit**: YES
  - Message: `feat(dailynote): add settings UI section for DailyNote events`
  - Files: `src/components/Settings/ViewSettings.tsx`
  - Pre-commit: `npm run build:local`

- [ ] 7. Calendar Integration — useYearlyCalendar Hook

  **What to do**:
  - 在 `src/hooks/useYearlyCalendar.ts` 中集成 DailyNote 事件加载：
    - 导入 DailyNoteService
    - 在 useEffect 中（参考 basesEvents 的加载模式，约 line 120-132），添加 DailyNote 事件异步加载：
      - 当 `config.showDailyNoteEvents` 为 true 时
      - 调用 `DailyNoteService.loadEventsForYear(app, yearSelected, config.dailyNoteSource, config.dailyNoteEventProp)`
      - 将结果存入新的 state: `dailyNoteEvents`
    - 在事件合并逻辑中（约 line 135-196），添加 dailyNoteEvents 合并：
      - 当 `showDailyNoteEvents` 为 true 且 `dailyNoteEvents.length > 0` 时
      - 将每个 dailyNoteEvent 通过 `pushExpanded()` 加入 allEvents
    - 注意：仅在 `!externalEvents` 模式下加载（即主日历视图，非 BasesView）
  - 确保年份切换时重新加载（yearSelected 在 useEffect 依赖中）

  **Must NOT do**:
  - 不修改 externalEvents 模式的逻辑（BasesView 不受影响）
  - 不实现实时文件监听（v1 用 Bus 触发重载）
  - 不做缓存优化（v1 每次重载都重新扫描）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: React Hook 改动涉及状态管理和异步数据流，需要理解现有合并逻辑
  - **Skills**: [`obsidian-plugin-dev`, `yearly-glance-date-fields`]
    - `obsidian-plugin-dev`: 了解事件总线和状态管理
    - `yearly-glance-date-fields`: 了解 dateArr 和事件日期计算

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 8)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Tasks 1, 2, 4

  **References**:

  **Pattern References**:
  - `src/hooks/useYearlyCalendar.ts:120-132` — basesEvents 的异步加载模式（useEffect + NoteEventService）
  - `src/hooks/useYearlyCalendar.ts:135-196` — 事件合并逻辑（allEvents useMemo）
  - `src/hooks/useYearlyCalendar.ts:96-119` — config 解构和 state 声明

  **API/Type References**:
  - `src/service/DailyNoteService.ts` — Task 2 创建的服务，loadEventsForYear 方法
  - `src/type/Events.ts` — CalendarEvent 类型

  **Acceptance Criteria**:

  - [ ] DailyNote 事件在日历上显示
  - [ ] 切换年份时重新加载
  - [ ] `showDailyNoteEvents` 为 false 时不加载
  - [ ] `npm run build:local` 成功

  **QA Scenarios**:

  ```
  Scenario: Build with calendar integration
    Tool: Bash
    Preconditions: Hook updated
    Steps:
      1. Run `npm run build:local`
      2. Assert exit code 0
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-7-build.txt

  Scenario: Type check passes
    Tool: Bash
    Preconditions: Hook updated
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code 0
    Expected Result: No type errors
    Evidence: .sisyphus/evidence/task-7-tsc.txt
  ```

  **Commit**: YES
  - Message: `feat(dailynote): integrate DailyNote events into calendar view`
  - Files: `src/hooks/useYearlyCalendar.ts`
  - Pre-commit: `npm run build:local`

- [ ] 8. Calendar Control Bar — Visibility Toggle

  **What to do**:
  - 在日历控制栏中添加 DailyNote 事件的显示/隐藏开关
  - 参考 `showBasesEvents` 的实现位置和模式（在 YearlyCalendarView 的控制栏区域）
  - 使用 `showDailyNoteEvents` config 字段
  - 使用 i18n key 显示标签
  - 图标使用 dailyNoteEvent 的默认 emoji 或 lucide 图标

  **Must NOT do**:
  - 不修改其他显示开关的行为
  - 不添加新的控制栏布局

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 复制现有 toggle 模式，改动小
  - **Skills**: [`obsidian-plugin-dev`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4, 7

  **References**:

  **Pattern References**:
  - 在 YearlyCalendarView 中搜索 `showBasesEvents` 的 toggle 实现位置，完整复制其模式

  **Acceptance Criteria**:

  - [ ] 控制栏显示 DailyNote 事件开关
  - [ ] 切换开关正确隐藏/显示 DailyNote 事件
  - [ ] `npm run build:local` 成功

  **QA Scenarios**:

  ```
  Scenario: Build with toggle
    Tool: Bash
    Preconditions: Control bar updated
    Steps:
      1. Run `npm run build:local`
      2. Assert exit code 0
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-8-build.txt
  ```

  **Commit**: YES (groups with Task 7)
  - Message: Combined with Task 7 commit
  - Pre-commit: `npm run build:local`

- [ ] 9. EventForm Adaptation — Disabled Fields + dailyNoteEvent Case

  **What to do**:
  - 在 `src/components/EventForm/EventFormModal.tsx` 的 `onSave` switch 中添加 `"dailyNoteEvent"` case：
    - 设置 `event.eventSource = EventSource.DAILYNOTE`
    - 编辑时：调用 `DailyNoteService.updateEventTitle()` 写回 frontmatter
    - 创建时：调用 `plugin.createDailyNoteEvent()` 方法（在 main.ts 中实现，Task 11）
  - 在 EventForm 组件中引入「禁用字段」模式：
    - 检测当前编辑的事件类型是否为 `dailyNoteEvent`
    - 如果是，以下字段显示为 disabled（灰色不可点击）：
      - 日期输入（日期由 DailyNote 文件名决定）
      - 颜色选择
      - 图标选择
      - 持续天数
      - 日历类型
      - 重复设置
    - 只有事件标题（text）可编辑
    - 每个禁用字段旁显示 tooltip 或小字提示："日记事件不支持此属性"（使用 i18n key `form.dailyNote.disabledField`）
  - 在 EventForm 的事件类型选择中，添加 "dailyNoteEvent" 选项（使用 NavTabs）
  - 当用户选择 dailyNoteEvent 类型时，自动禁用不支持的字段

  **Must NOT do**:
  - 不修改 basesEvent 或其他事件类型的编辑逻辑
  - 不完全隐藏字段（禁用 + 提示，让用户知道这些属性存在）
  - 不在此任务实现 DailyNote 创建的完整逻辑（只预留接口调用点）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 涉及表单状态管理和条件渲染，需要理解现有 EventForm 的复杂逻辑
  - **Skills**: [`obsidian-plugin-dev`]
    - `obsidian-plugin-dev`: 了解 EventForm 的 switch 模式和保存流程

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11)
  - **Blocks**: Task 12
  - **Blocked By**: Tasks 2, 3, 5, 7

  **References**:

  **Pattern References**:
  - `src/components/EventForm/EventFormModal.tsx:109-202` — onSave switch statement，参考 basesEvent case (lines 128-163)
  - `src/components/EventForm/EventFormModal.tsx:52` — isBasesEvent 判断逻辑，参考此模式添加 isDailyNoteEvent
  - `src/components/EventForm/` — EventForm 组件目录结构

  **API/Type References**:
  - `src/service/DailyNoteService.ts` — updateEventTitle 方法
  - `src/type/Events.ts` — EventSource.DAILYNOTE, CalendarEvent

  **Acceptance Criteria**:

  - [ ] dailyNoteEvent case 在 onSave switch 中正确处理
  - [ ] 编辑 dailyNoteEvent 时，非标题字段为禁用状态（disabled）
  - [ ] 禁用字段显示提示文本
  - [ ] 编辑保存后 frontmatter 列表项正确更新
  - [ ] `npm run build:local` 成功

  **QA Scenarios**:

  ```
  Scenario: Build with EventForm changes
    Tool: Bash
    Preconditions: EventForm updated
    Steps:
      1. Run `npm run build:local`
      2. Assert exit code 0
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-9-build.txt

  Scenario: Type check for EventForm
    Tool: Bash
    Preconditions: All event form changes in place
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code 0
    Expected Result: No type errors
    Evidence: .sisyphus/evidence/task-9-tsc.txt
  ```

  **Commit**: YES
  - Message: `feat(dailynote): add EventForm disabled fields for DailyNote events`
  - Files: `src/components/EventForm/EventFormModal.tsx`, `src/components/EventForm/*.tsx`
  - Pre-commit: `npm run build:local`

- [ ] 10. EventManager — dailyNoteEvent Tab

  **What to do**:
  - 在 EventManager 组件中为 dailyNoteEvent 添加标签页
  - 参考 basesEvent 标签页的实现模式
  - 标签页内显示当前年份已加载的所有 DailyNote 事件列表
  - 每个事件项显示：事件标题、日期、来源文件路径
  - 支持从列表中点击事件打开编辑（跳转到 EventForm，带 disabled fields）
  - 列表排序：按日期升序

  **Must NOT do**:
  - 不实现批量编辑功能
  - 不实现从 EventManager 直接创建 DailyNote 事件（创建入口在日历视图的 EventForm）
  - 不实现拖拽排序

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要理解 EventManager 的标签页系统和事件列表渲染
  - **Skills**: [`obsidian-plugin-dev`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 11)
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 3

  **References**:

  **Pattern References**:
  - `src/components/EventManager/` — EventManager 组件目录，查看 basesEvent 标签页实现
  - `src/type/Events.ts:71` — EVENT_TYPE_LIST 决定了标签页的出现

  **Acceptance Criteria**:

  - [ ] EventManager 中出现 dailyNoteEvent 标签页
  - [ ] 标签页内显示 DailyNote 事件列表
  - [ ] 点击事件可打开编辑
  - [ ] `npm run build:local` 成功

  **QA Scenarios**:

  ```
  Scenario: Build with EventManager tab
    Tool: Bash
    Preconditions: EventManager updated
    Steps:
      1. Run `npm run build:local`
      2. Assert exit code 0
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-10-build.txt
  ```

  **Commit**: YES (groups with Task 9)
  - Message: Combined with Task 9 commit or separate `feat(dailynote): add EventManager dailyNoteEvent tab`
  - Pre-commit: `npm run build:local`

- [ ] 11. DailyNote Creation — via Plugin API

  **What to do**:
  - 在 `src/main.ts` 中添加 `createDailyNoteEvent(event: CalendarEvent): Promise<void>` 方法：
    - 从 event 中提取目标日期
    - 用 DailyNoteService.getDailyNoteSettings() 获取 format 和 folder
    - 根据日期和 format 生成文件名和路径
    - 检查文件是否已存在
    - 如果不存在——通过插件 API 创建 DailyNote：
      - 核心日记插件路径: 手动创建文件（`app.vault.create(path, "")`），然后写入 frontmatter
      - PeriodicNotes 路径: 使用 `app.plugins.plugins["periodic-notes"]` 的 API（如果暴露了创建方法），否则也手动创建
      - 备选方案：如果两个插件都不提供直接的"创建笔记"API，就手动创建 md 文件 + 写入 frontmatter（足够可靠，且不依赖 Templater）
    - 文件存在或创建后，调用 `DailyNoteService.addEventToDaily()` 将事件追加到 frontmatter 列表
    - 发布 `YearlyGlanceBus.publish()` 通知视图刷新
  - 在 EventFormModal 的 dailyNoteEvent 创建流程中调用此方法

  **Must NOT do**:
  - 不尝试调用 Templater 渲染模板（复杂度太高，且不可靠）
  - 不创建非 Daily 的周期笔记
  - 不在文件创建时添加复杂的 frontmatter 结构（只添加事件属性）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 涉及 Obsidian vault 操作和外部插件 API 交互，需要仔细处理边界情况
  - **Skills**: [`obsidian-plugin-dev`]
    - `obsidian-plugin-dev`: 了解 vault 创建文件、processFrontMatter 等 API

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10)
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 5

  **References**:

  **Pattern References**:
  - `src/main.ts:411-461` — createBasesEventNote 方法，参考文件创建和 frontmatter 写入模式
  - `AutoCreatePeriodicNotes.js:42-100` — 访问 PeriodicNotes 和核心日记插件设置、创建笔记的完整模式

  **API/Type References**:
  - Obsidian API: `app.vault.create(path, content)`, `app.vault.createFolder(path)`
  - `src/service/DailyNoteService.ts` — getDailyNoteSettings(), addEventToDaily()

  **Acceptance Criteria**:

  - [ ] 创建事件到不存在的 DailyNote 时，文件被正确创建
  - [ ] 事件文本正确追加到 frontmatter 列表
  - [ ] 创建事件到已存在的 DailyNote 时，只追加列表项不覆盖文件
  - [ ] `npm run build:local` 成功

  **QA Scenarios**:

  ```
  Scenario: Build with creation logic
    Tool: Bash
    Preconditions: Creation method implemented
    Steps:
      1. Run `npm run build:local`
      2. Assert exit code 0
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-11-build.txt

  Scenario: Type check
    Tool: Bash
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code 0
    Expected Result: No type errors
    Evidence: .sisyphus/evidence/task-11-tsc.txt
  ```

  **Commit**: YES
  - Message: `feat(dailynote): add DailyNote creation via plugin API`
  - Files: `src/main.ts`, `src/components/EventForm/EventFormModal.tsx`
  - Pre-commit: `npm run build:local`

- [ ] 12. EventTooltip + EventItem — DailyNote Source Display

  **What to do**:
  - 在 EventTooltip 组件中：当事件来源为 DAILYNOTE 时，显示 "来自日记" 标记（使用 i18n key `tooltip.source.dailynote`）
  - 添加"打开日记笔记"链接——点击后使用 `app.workspace.openLinkText()` 打开对应的 DailyNote 文件
  - 在 EventItem（日历格子中的事件显示）中：确保 dailyNoteEvent 使用其默认 emoji 和颜色正确渲染
  - 确保 DailyNote 事件在 legend（图例）中正确显示

  **Must NOT do**:
  - 不修改其他事件类型的 tooltip 显示
  - 不添加复杂的 DailyNote 预览功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 小幅 UI 调整，模式明确
  - **Skills**: [`obsidian-plugin-dev`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 13)
  - **Blocks**: None
  - **Blocked By**: Task 9

  **References**:

  **Pattern References**:
  - 在组件中搜索 `EventSource.BASES` 的显示处理，参考相同模式添加 `EventSource.DAILYNOTE`
  - `src/components/YearlyCalendar/` — EventTooltip, EventItem 等组件位置

  **Acceptance Criteria**:

  - [ ] DailyNote 事件 tooltip 显示来源信息
  - [ ] tooltip 中有"打开日记"链接
  - [ ] 日历格子中 DailyNote 事件正确显示图标和颜色
  - [ ] Legend 中出现 dailyNoteEvent 类型
  - [ ] `npm run build:local` 成功

  **QA Scenarios**:

  ```
  Scenario: Build with tooltip changes
    Tool: Bash
    Preconditions: Tooltip and EventItem updated
    Steps:
      1. Run `npm run build:local`
      2. Assert exit code 0
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-12-build.txt
  ```

  **Commit**: YES
  - Message: `feat(dailynote): add tooltip display and DailyNote source badge`
  - Files: EventTooltip, EventItem components
  - Pre-commit: `npm run build:local`

- [ ] 13. Build Verification + Full Test Suite

  **What to do**:
  - 运行完整的验证命令集：
    - `npx tsc --noEmit` — 类型检查
    - `npm run lint` — lint 检查
    - `npm test` — 所有测试（含新增 DailyNoteService 测试）
    - `npm run build:local` — 构建到本地 vault
  - 修复所有报错（lint warning、type error、test failure）
  - 确认 main.js 和 styles.css 正确生成
  - 确认插件可以在 Obsidian 中正常加载

  **Must NOT do**:
  - 不添加新功能
  - 不做大范围重构

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯验证和修复工作
  - **Skills**: [`obsidian-plugin-dev`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after Task 12)
  - **Blocks**: F1-F4
  - **Blocked By**: ALL previous tasks

  **References**:

  **Pattern References**:
  - `package.json` — npm scripts 定义

  **Acceptance Criteria**:

  - [ ] `npx tsc --noEmit` exit 0
  - [ ] `npm run lint` exit 0
  - [ ] `npm test` exit 0, all tests pass
  - [ ] `npm run build:local` exit 0

  **QA Scenarios**:

  ```
  Scenario: Full verification suite
    Tool: Bash
    Preconditions: All tasks complete
    Steps:
      1. Run `npx tsc --noEmit` → assert exit 0
      2. Run `npm run lint` → assert exit 0
      3. Run `npm test` → assert exit 0, capture test count
      4. Run `npm run build:local` → assert exit 0
    Expected Result: All four commands succeed
    Failure Indicators: Any non-zero exit code
    Evidence: .sisyphus/evidence/task-13-full-verification.txt

  Scenario: Verify build output
    Tool: Bash
    Preconditions: build:local succeeded
    Steps:
      1. Check main.js exists and is non-empty
      2. Check styles.css exists
    Expected Result: Both files exist with content
    Evidence: .sisyphus/evidence/task-13-build-output.txt
  ```

  **Commit**: YES (if fixes needed)
  - Message: `fix(dailynote): resolve build/lint/test issues`
  - Pre-commit: `npm run build:local && npm test`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npm run lint` + `npm test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty frontmatter, no daily notes plugin, no events property. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Commit | Message | Files | Pre-commit |
|--------|---------|-------|------------|
| 1 | `feat(dailynote): add EventSource.DAILYNOTE type and settings fields` | Events.ts, Settings.ts, Config.ts, migrateData.ts | `npx tsc --noEmit` |
| 2 | `feat(dailynote): add DailyNoteService core read + unit tests` | DailyNoteService.ts, DailyNoteService.test.ts | `npm test` |
| 3 | `feat(i18n): add dailynote event translations for en/zh/zh-TW` | en.ts, zh.ts, zh-TW.ts | `npm run build:local` |
| 4 | `feat(dailynote): add DailyNoteService write operations + tests` | DailyNoteService.ts, DailyNoteService.test.ts | `npm test` |
| 5 | `feat(dailynote): add settings UI section for DailyNote events` | ViewSettings.tsx | `npm run build:local` |
| 6 | `feat(dailynote): integrate DailyNote events into calendar view` | useYearlyCalendar.ts, YearlyCalendarView.tsx | `npm run build:local` |
| 7 | `feat(dailynote): add EventForm disabled fields for DailyNote events` | EventFormModal.tsx, EventForm.tsx | `npm run build:local` |
| 8 | `feat(dailynote): add EventManager tab and DailyNote creation` | EventManager.tsx, main.ts | `npm run build:local` |
| 9 | `feat(dailynote): add tooltip display and final polish` | EventTooltip.tsx, EventItem.tsx | `npm run build:local && npm test` |

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit          # Expected: no errors
npm run lint              # Expected: no errors
npm test                  # Expected: all tests pass (including new DailyNote tests)
npm run build:local       # Expected: exit 0, main.js + styles.css generated
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] DailyNote events display correctly on calendar for current year
- [ ] Settings UI for DailyNote source works correctly
- [ ] Editing DailyNote event updates frontmatter list
- [ ] Creating DailyNote event creates/updates correct file
- [ ] Disabling DailyNote source hides events from calendar
- [ ] i18n strings present in all 3 locales
