# Fix Code Quality Issues (Moderate + Selected Minor)

## TL;DR

> **Quick Summary**: Fix 5 moderate-severity + 3 minor code quality issues found by Oracle review on `feat/multi-day-events` branch: extract shared frontmatter sync service, remove dead NoteEventService cache, fix `any` types, clip multi-day events at year boundary, refactor isSaving state management, add duration validation warnings, add debug logging, extract readOptionalProp helper.
> 
> **Deliverables**:
> - Extracted `expandEventByDuration` utility with year-boundary clipping + unit tests
> - Removed dead cache code from NoteEventService
> - Proper TypeScript interfaces replacing `any` types across 4 files
> - Extracted `BasesEventFrontmatterService` eliminating duplicated sync logic
> - isSaving state managed in React instead of Modal class field
> - Duration validation with Notice + console warnings
> - Debug logging in hashData error paths
> - Extracted `readOptionalProp` helper in BasesView
> 
> **Estimated Effort**: Medium (1-2 days)
> **Parallel Execution**: NO - sequential (each task modifies overlapping files)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Final Verification

---

## Context

### Original Request
User asked to fix all moderate-severity code quality issues identified by 3 parallel Oracle code reviews on the `feat/multi-day-events` branch.

### Interview Summary
**Key Discussions**:
- Branch contains 68 commits ahead of master (4 stacked feature branches merged into one)
- Build passes, type check passes, 2 lint errors pre-existing (not in scope)
- No automated tests exist yet (Jest configured but zero test files)

**Research Findings**:
- `CalendarEvent` type is `(Holiday | Birthday | CustomEvent) & {...}` — `basesEvent` objects don't satisfy the union, hidden by `as CalendarEvent` casts
- Frontmatter sync exists in 3 places with subtle behavioral differences (remark filter in main.ts)
- Obsidian Bases API types (`entry.getValue()`, `Value`, `isTruthy()`) are not publicly typed
- `EventFormModal` is an Obsidian `Modal` subclass, cannot use React hooks directly

### Metis Review
**Identified Gaps** (addressed):
- Remark filter divergence between `main.ts` and `BasesView` — resolved: shared service accepts prop names, callers handle pre/post processing
- Year boundary fix must handle both directions (events starting before AND after current year)
- `duration: 0` and negative values need clamping
- Task order matters due to file overlap — sequential execution required
- `isSaving` refactor scope must be limited to state management, not full save flow restructure

---

## Work Objectives

### Core Objective
Improve code quality by eliminating 5 moderate-severity issues: code duplication, dead code, type unsafety, edge case bug, and React anti-pattern.

### Concrete Deliverables
- `src/utils/expandEventByDuration.ts` — extracted pure function with year clipping
- `src/utils/expandEventByDuration.test.ts` — unit tests
- `src/service/NoteEventService.ts` — cache removed, `processFrontMatter` replaced with `metadataCache`
- `src/service/BasesEventFrontmatterService.ts` — shared frontmatter sync service
- Proper TypeScript interfaces for Bases API boundaries
- `EventForm` component manages `isSaving` state internally

### Definition of Done
- [ ] `npx tsc --noEmit` passes with zero new errors
- [ ] `npm run build:local` succeeds
- [ ] `npm test` passes (including new unit tests)
- [ ] All 5 issues resolved with atomic commits

### Must Have
- Each issue = 1 atomic commit that builds independently
- Zero behavioral regressions in existing functionality
- Unit tests for `expandEventByDuration` (year boundary, duration edge cases)

### Must NOT Have (Guardrails)
- NO new features (no "continues into next year" UI for multi-day events)
- NO new test dependencies (no React Testing Library, jsdom, etc.)
- NO restructuring the entire `EventFormModal.onSave` method
- NO creating a `BasesEvent` interface or modifying the `CalendarEvent` union type
- NO modifying `CalendarEvent` type definition in this PR
- NO touching files unrelated to the 5 issues

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Jest + ts-jest configured)
- **Automated tests**: YES (Tests-after for extracted utility; no React component tests)
- **Framework**: Jest (existing)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Utility functions**: Use Bash (`npm test`) - Run tests, assert pass counts
- **Build verification**: Use Bash (`npx tsc --noEmit && npm run build:local`) - Zero errors
- **Code quality**: Use Bash (`npm run lint`) - No new errors introduced

---

## Execution Strategy

### Sequential Execution (dependency-aware order)

```
Task 1: Extract expandEventByDuration + year boundary fix [deep]
    ↓
Task 2: Remove NoteEventService dead cache [quick]
    ↓
Task 3: Replace any types with proper interfaces [unspecified-high]
    ↓
Task 4: Extract shared BasesEventFrontmatterService [deep]
    ↓
Task 5: Move isSaving to React state [quick]
    ↓
Task 6: Add duration validation warnings [quick]
    ↓
Task 7: Add debug logging in hashData + extract readOptionalProp helper [quick]
    ↓
Task 8: Remove dead code (getArrayConfig) [quick]
    ↓
Wave FINAL (4 parallel reviews → user okay):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real QA (unspecified-high)
└── F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay
```

### Why Sequential
Tasks 1, 3, 4 all modify `useYearlyCalendar.ts` and `YearlyGlanceBasesView.tsx`. Parallel execution would cause merge conflicts. Task 3 (type fixes) improves the interfaces that Task 4 (shared service) will consume.

### Agent Dispatch Summary
- **Task 1**: `deep` — pure function extraction + test writing + edge case handling
- **Task 2**: `quick` — simple code deletion
- **Task 3**: `unspecified-high` — multi-file type annotation changes
- **Task 4**: `deep` — service extraction with behavioral preservation
- **Task 5**: `quick` — React state refactor in 2 files
- **Task 6**: `quick` — duration validation + Notice warning
- **Task 7**: `quick` — debug log + helper extraction in BasesView
- **Task 8**: `quick` — dead code removal (1 method)

---

## TODOs

- [x] 1. Extract `expandEventByDuration` and clip multi-day events at year boundary

  **What to do**:
  - Extract the `expandEventByDuration` closure from `useYearlyCalendar.ts:138-168` into a standalone pure function at `src/utils/expandEventByDuration.ts`
  - Add a `year` parameter to the function signature for year-boundary clipping
  - Clip expanded dates: only produce events where the expanded date falls within the given `year` (handles both Dec→Jan overflow and events starting in previous year extending into current year)
  - Clamp `duration` to `Math.max(1, event.duration ?? 1)` to handle `0`, `undefined`, and negative values safely
  - Update `useYearlyCalendar.ts` to import and call the extracted function, passing `year` from config
  - Write unit tests in `src/utils/expandEventByDuration.test.ts` covering:
    - Normal expansion (duration=3 from mid-month)
    - Year boundary: Dec 29 + duration 5 with year=2025 → only Dec 29, 30, 31
    - Year boundary: Dec 31 + duration 1 → single event Dec 31
    - Duration=1 (no expansion, single event)
    - Duration=0 / undefined / negative → treated as 1
    - Event without `eventDate.isoDate` → returns empty array

  **Must NOT do**:
  - Do NOT add "continues into next year" UI indicator
  - Do NOT modify `CalendarEvent` type definition
  - Do NOT change any rendering logic in `YearlyCalendar.tsx`

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Pure function extraction with edge case handling and test writing requires careful reasoning
  - **Skills**: [`ob-plugin-dev`]
    - `ob-plugin-dev`: Plugin codebase conventions and patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 1)
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/hooks/useYearlyCalendar.ts:138-168` — Current `expandEventByDuration` closure to extract. Note the `_dayIndex`, `_totalDays`, `_isFirstDay`, `_isLastDay` metadata fields it sets
  - `src/utils/isoUtils.ts` — `IsoUtils.toLocalDateString()` is used for date→ISO conversion, must continue using this (not `toISOString()`) to avoid timezone issues
  - `src/utils/eventCalculator.ts` — Existing utility pattern in the project (class with static methods)

  **API/Type References**:
  - `src/type/CalendarEvent.ts:4-12` — `CalendarEvent` type definition with `_dayIndex?`, `_totalDays?`, `_isFirstDay?`, `_isLastDay?` metadata fields
  - `src/type/Events.ts:16-34` — `BaseEvent` interface with `duration?: number`, `eventDate: EventDate`
  - `src/type/Events.ts:70` — `EventType` type definition

  **Test References**:
  - `package.json` — Jest configured with `ts-jest`, `testEnvironment: "node"`, test script is `jest`
  - No existing test files to reference for patterns — use standard Jest `describe/it/expect` style

  **External References**:
  - `src/utils/isoUtils.ts` — `IsoUtils.toLocalDateString(date)` and `IsoUtils.createLocalDate(year, month, day)` for timezone-safe date operations

  **WHY Each Reference Matters**:
  - `useYearlyCalendar.ts:138-168`: This is the exact code to extract. The executor must preserve the spread pattern (`...event`) and metadata fields
  - `isoUtils.ts`: MUST use `IsoUtils.toLocalDateString` instead of `Date.toISOString()` — the existing code already uses this to avoid timezone shift bugs
  - `CalendarEvent.ts`: The return type of the expanded events — executor must match this shape exactly

  **Acceptance Criteria**:

  - [ ] `src/utils/expandEventByDuration.ts` exists as a pure function with `year` parameter
  - [ ] `src/utils/expandEventByDuration.test.ts` exists with ≥6 test cases
  - [ ] `useYearlyCalendar.ts` imports and uses the extracted function
  - [ ] `npm test` → PASS (all new tests pass)
  - [ ] `npx tsc --noEmit` → zero errors

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Year boundary clipping works correctly
    Tool: Bash (npm test)
    Preconditions: Test file created with year boundary test cases
    Steps:
      1. Run `npm test -- --testPathPattern=expandEventByDuration`
      2. Assert test output contains "6 passed" (or more)
      3. Assert test output contains zero failures
    Expected Result: All tests pass, including Dec 29 + duration 5 → 3 events for year 2025
    Failure Indicators: Any test failure, especially year boundary tests
    Evidence: .sisyphus/evidence/task-1-unit-tests.txt

  Scenario: Build succeeds after extraction
    Tool: Bash
    Preconditions: Function extracted, useYearlyCalendar updated
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert exit code 0 and no error output
      3. Run `npm run build:local`
      4. Assert "所有文件已成功复制" in output
    Expected Result: Both commands succeed with zero errors
    Failure Indicators: TypeScript errors, build failure
    Evidence: .sisyphus/evidence/task-1-build-verify.txt
  ```

  **Commit**: YES
  - Message: `refactor: extract expandEventByDuration and clip multi-day events at year boundary`
  - Files: `src/utils/expandEventByDuration.ts`, `src/utils/expandEventByDuration.test.ts`, `src/hooks/useYearlyCalendar.ts`
  - Pre-commit: `npx tsc --noEmit && npm test`

- [x] 2. Remove dead NoteEventService cache code

  **What to do**:
  - Remove `private cache: Map<string, CalendarEvent[]> = new Map();` field from `NoteEventService` (L14)
  - Remove cache check block at L31-35 (`if (this.cache.has(cacheKey)) ...`)
  - Remove cache set at L71 (`this.cache.set(cacheKey, events)`)
  - Remove `getCacheKey()` method (L193-195)
  - Remove `invalidateCache()` method (L200-202)
  - Replace `processFrontMatter` (L146) with `this.app.metadataCache.getFileCache(file)?.frontmatter` for read-only access — this is synchronous and doesn't acquire a write lock
  - Make `parseEventFromFile` synchronous (no longer needs `async` after removing `processFrontMatter` for reads)
  - Keep `loadEventsFromPath` as the only public method

  **Must NOT do**:
  - Do NOT change the public API of `loadEventsFromPath` (same parameters, same return type)
  - Do NOT modify any callers of NoteEventService

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple code deletion and one API swap, low complexity
  - **Skills**: [`ob-plugin-dev`]
    - `ob-plugin-dev`: Obsidian API knowledge for `metadataCache` vs `processFrontMatter`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 2)
  - **Blocks**: Tasks 3, 4, 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `src/service/NoteEventService.ts` — Entire file (203 lines). Focus on L14 (cache field), L31-35 (cache check), L71 (cache set), L144-149 (getFrontmatter using processFrontMatter), L193-202 (getCacheKey + invalidateCache)

  **API/Type References**:
  - Obsidian API: `app.metadataCache.getFileCache(file)?.frontmatter` — returns `Record<string, any> | undefined`, synchronous read-only access to cached frontmatter. This is the recommended way to READ frontmatter; `processFrontMatter` is for WRITES

  **WHY Each Reference Matters**:
  - `NoteEventService.ts` is the only file being modified — executor needs to understand the full file to safely remove cache code
  - `metadataCache` API: The replacement for `processFrontMatter` in read-only path — critical to get right

  **Acceptance Criteria**:

  - [ ] `NoteEventService.ts` has no `cache`, `getCacheKey`, or `invalidateCache` references
  - [ ] `getFrontmatter` method replaced with `metadataCache.getFileCache` usage
  - [ ] `npx tsc --noEmit` → zero errors
  - [ ] `npm run build:local` → success

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: NoteEventService builds without cache code
    Tool: Bash
    Preconditions: Cache code removed, processFrontMatter replaced
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert zero errors
      3. Run `grep -r "invalidateCache\|getCacheKey\|this\.cache" src/service/NoteEventService.ts`
      4. Assert zero matches (all cache code removed)
    Expected Result: Clean build, no cache references remain
    Failure Indicators: TypeScript errors, remaining cache references
    Evidence: .sisyphus/evidence/task-2-cache-removal.txt

  Scenario: Build and load succeeds
    Tool: Bash
    Preconditions: Task 2 changes committed
    Steps:
      1. Run `npm run build:local`
      2. Assert "所有文件已成功复制" in output
    Expected Result: Plugin builds and copies to vault successfully
    Failure Indicators: Build failure
    Evidence: .sisyphus/evidence/task-2-build-verify.txt
  ```

  **Commit**: YES
  - Message: `refactor: remove dead NoteEventService cache, use metadataCache for reads`
  - Files: `src/service/NoteEventService.ts`
  - Pre-commit: `npx tsc --noEmit`

- [x] 3. Replace `any` types with proper interfaces in event processing

  **What to do**:
  - Create a `BasesEntry` interface stub in `src/type/BasesTypes.ts` for Obsidian's untyped Bases API:
    ```typescript
    import { TFile } from "obsidian";
    /** Stub for Obsidian's undocumented Bases entry type */
    export interface BasesEntry {
      file: TFile;
      getValue(key: string): BasesValue | null;
    }
    /** Stub for Obsidian's Bases Value type */
    export interface BasesValue {
      isTruthy(): boolean;
      toString(): string;
    }
    /** Config for Bases event property names (used by frontmatter sync) */
    export interface BasesEventPropertyConfig {
      titleProp: string;
      dateProp: string;
      durationProp: string;
      iconProp: string;
      colorProp: string;
      descriptionProp: string;
    }
    /** Config for BasesView internal settings */
    export interface BasesViewConfig {
      inheritPluginData: boolean;
      propTitle: string | null;
      propDate: string | null;
      propDuration: string | null;
      propIcon: string | null;
      propColor: string | null;
      propDescription: string | null;
      limitHeight: boolean;
      embeddedHeight: number;
    }
    ```
  - Update `expandEventByDuration` (extracted in Task 1) parameter: change `event: any` → `event: BaseEvent` and `eventType: any` → `eventType: EventType` (should already be done in Task 1, verify)
  - Update `YearlyGlanceBasesView.tsx`:
    - `hashData(entries: any[], config: any)` → `hashData(entries: BasesEntry[], config: BasesViewConfig)`
    - `buildMixedEvents(config: any)` → `buildMixedEvents(config: BasesViewConfig)`
    - `convertBasesEvent(entry: any, dateValue: any, text: any, ...)` → `convertBasesEvent(entry: BasesEntry, dateValue: BasesValue | string | Date, text: string, ...)`
  - Update `NoteEventService.ts`:
    - `getFrontmatter` return type: `Promise<any>` → `Record<string, unknown>` (after Task 2 switches to metadataCache this becomes synchronous, but type the return)
    - `parseDateValue(dateValue: any)` → `parseDateValue(dateValue: unknown)`
    - Fix `as CalendarEvent` cast at L138: add `isRepeat: false` to the constructed object to satisfy the `CustomEvent` leg of the union. This is semantically correct since Bases events behave like non-repeating custom events
  - Fix the same `as CalendarEvent` cast in `YearlyGlanceBasesView.tsx:convertBasesEvent` (L448): ensure `isRepeat: false` is present (already there at L446, verify the cast is still needed after type improvements)

  **Must NOT do**:
  - Do NOT modify the `CalendarEvent` union type itself
  - Do NOT create a `BasesEvent` interface in the union
  - `any` is acceptable ONLY at the Obsidian API boundary where no types exist (e.g., `entry.getValue()` return)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Multi-file type annotation changes requiring careful type flow analysis
  - **Skills**: [`ob-plugin-dev`]
    - `ob-plugin-dev`: Plugin type patterns and Obsidian API knowledge

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 3)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `src/type/Events.ts:16-34` — `BaseEvent` interface (the proper type for event parameters)
  - `src/type/Events.ts:63-65` — `CustomEvent` interface with `isRepeat: boolean` (the union leg that Bases events should satisfy)
  - `src/type/Events.ts:70-71` — `EventType` type and `EVENT_TYPE_LIST`

  **API/Type References**:
  - `src/type/CalendarEvent.ts:4-12` — `CalendarEvent` union type that the `as CalendarEvent` casts target
  - `src/views/YearlyGlanceBasesView.tsx:185,251,394` — Three methods with `any` parameters to fix
  - `src/service/NoteEventService.ts:138,144,155` — Three locations with `any` or unsafe casts

  **WHY Each Reference Matters**:
  - `BaseEvent` is the correct type for event parameters in `expandEventByDuration` — all event types extend it
  - `CustomEvent.isRepeat` is REQUIRED by the union — adding `isRepeat: false` to Bases event objects eliminates the unsafe `as CalendarEvent` cast
  - Bases API has no public types — we need stubs that document this limitation

  **Acceptance Criteria**:

  - [ ] `src/type/BasesTypes.ts` exists with `BasesEntry`, `BasesValue`, `BasesEventPropertyConfig`, `BasesViewConfig` interfaces
  - [ ] Zero `any` types in `expandEventByDuration`, `hashData`, `buildMixedEvents`, `convertBasesEvent` parameters
  - [ ] `as CalendarEvent` casts have `isRepeat: false` in the constructed objects
  - [ ] `npx tsc --noEmit` → zero errors
  - [ ] `npm run build:local` → success

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: No any types remain in target functions
    Tool: Bash (grep)
    Preconditions: All type changes applied
    Steps:
      1. Run `grep -n ": any" src/hooks/useYearlyCalendar.ts src/views/YearlyGlanceBasesView.tsx src/service/NoteEventService.ts`
      2. Count matches — should be zero or only at Obsidian API boundaries (e.g., getValue return)
      3. Run `npx tsc --noEmit`
      4. Assert zero errors
    Expected Result: No `any` in function parameters; build passes
    Failure Indicators: `any` in non-boundary locations, TypeScript errors
    Evidence: .sisyphus/evidence/task-3-any-types-check.txt

  Scenario: Build succeeds with new types
    Tool: Bash
    Preconditions: All type changes applied
    Steps:
      1. Run `npm run build:local`
      2. Assert "所有文件已成功复制" in output
    Expected Result: Plugin builds and copies to vault
    Failure Indicators: Build failure
    Evidence: .sisyphus/evidence/task-3-build-verify.txt
  ```

  **Commit**: YES
  - Message: `refactor: replace any types with proper interfaces in event processing`
  - Files: `src/type/BasesTypes.ts`, `src/hooks/useYearlyCalendar.ts`, `src/views/YearlyGlanceBasesView.tsx`, `src/service/NoteEventService.ts`
  - Pre-commit: `npx tsc --noEmit`

- [x] 4. Extract shared `BasesEventFrontmatterService` for frontmatter sync

  **What to do**:
  - Create `src/service/BasesEventFrontmatterService.ts` with:
    - A function `syncEventToFrontmatter(app: App, file: TFile, event: CalendarEvent, propConfig: BasesEventPropertyConfig): Promise<void>` that encapsulates the shared `processFrontMatter` callback logic
    - The function handles: title, date, duration (>1 sets, ≤1 deletes), icon (non-default sets, default deletes), color (same), description (non-empty sets, empty deletes)
    - The function does NOT handle: remark filtering (caller responsibility), file path resolution (caller passes resolved `TFile`), bus publishing (caller responsibility)
  - Update `main.ts:syncBasesEventToFrontmatter()`:
    - Resolve file path from event ID (keep existing logic at L388-392)
    - Build `BasesEventPropertyConfig` from `this.settings.config`
    - Call shared `syncEventToFrontmatter()`
    - Keep `remark.startsWith('From Bases:')` filter as pre-processing BEFORE calling shared function (preserve existing behavior)
    - Keep `YearlyGlanceBus.publish()` call after sync
  - Update `YearlyGlanceBasesView.tsx:updateEventFrontmatter()`:
    - Resolve file path from `this.basesEventMap` (keep existing logic)
    - Build `BasesEventPropertyConfig` from Bases view config with plugin config fallback (keep existing fallback logic at L494-499)
    - Call shared `syncEventToFrontmatter()`
    - Keep `YearlyGlanceBus.publish()` call after sync
  - Also update `main.ts:createBasesEventNote()` (L457-499) to use the shared prop config resolution (it duplicates the same 6 property name lookups)

  **Must NOT do**:
  - Do NOT change the remark filter behavior in `main.ts` (the `startsWith('From Bases:')` check)
  - Do NOT move file path resolution into the shared service
  - Do NOT move `YearlyGlanceBus.publish()` into the shared service

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Largest refactor — extracting shared logic while preserving behavioral differences between two callers
  - **Skills**: [`ob-plugin-dev`]
    - `ob-plugin-dev`: Plugin architecture patterns and Obsidian API usage

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 4)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 1, 2, 3

  **References**:

  **Pattern References**:
  - `src/main.ts:369-450` — `syncBasesEventToFrontmatter()`: The plugin-level frontmatter sync. Note L437 remark filter: `!event.remark.startsWith('From Bases:')` — this MUST be preserved as caller-side logic
  - `src/views/YearlyGlanceBasesView.tsx:472-542` — `updateEventFrontmatter()`: The view-level sync. Note L494-499 uses `this.config.getAsPropertyId()` with fallback to `pluginConfig.*`
  - `src/main.ts:457-499` — `createBasesEventNote()`: Third location duplicating property name resolution
  - `src/service/NoteEventService.ts:85-96` — Fourth location reading the same 6 property names (read-only, not sync)

  **API/Type References**:
  - `src/type/BasesTypes.ts:BasesEventPropertyConfig` — Created in Task 3, used as the parameter type for the shared service
  - `src/type/Events.ts:74-82` — `EVENT_TYPE_DEFAULT.basesEvent` defaults used for icon/color comparison

  **WHY Each Reference Matters**:
  - `main.ts:437` remark filter is a behavioral difference that MUST NOT be unified — the shared service must not handle remark filtering
  - `BasesView:494-499` config fallback chain shows the 2-tier resolution (Bases config → plugin config) that callers implement themselves
  - `EVENT_TYPE_DEFAULT` is used to determine "is this the default emoji/color?" for delete-vs-set decisions

  **Acceptance Criteria**:

  - [ ] `src/service/BasesEventFrontmatterService.ts` exists with `syncEventToFrontmatter()` function
  - [ ] `main.ts:syncBasesEventToFrontmatter()` calls the shared service (file path resolution + remark filter remain in main.ts)
  - [ ] `YearlyGlanceBasesView.tsx:updateEventFrontmatter()` calls the shared service
  - [ ] `main.ts:createBasesEventNote()` uses `BasesEventPropertyConfig` for property name resolution
  - [ ] `npx tsc --noEmit` → zero errors
  - [ ] `npm run build:local` → success

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Shared frontmatter service builds correctly
    Tool: Bash
    Preconditions: Service extracted, callers updated
    Steps:
      1. Run `npx tsc --noEmit`
      2. Assert zero errors
      3. Run `npm run build:local`
      4. Assert "所有文件已成功复制" in output
    Expected Result: Clean build and successful vault copy
    Failure Indicators: TypeScript errors, import resolution failures
    Evidence: .sisyphus/evidence/task-4-build-verify.txt

  Scenario: No duplicated frontmatter logic remains
    Tool: Bash (grep)
    Preconditions: Shared service in use
    Steps:
      1. Run `grep -c "processFrontMatter" src/main.ts src/views/YearlyGlanceBasesView.tsx`
      2. Assert main.ts has ≤2 calls (createBasesEventNote + one remaining direct call if needed)
      3. Assert BasesView has 0 direct processFrontMatter calls (delegated to service)
      4. Run `grep -c "fm\[titleProp\]\|fm\[dateProp\]" src/main.ts src/views/YearlyGlanceBasesView.tsx`
      5. Assert zero matches in both files (logic moved to service)
    Expected Result: Frontmatter field mapping logic lives only in the shared service
    Failure Indicators: Duplicated processFrontMatter callbacks in both files
    Evidence: .sisyphus/evidence/task-4-dedup-check.txt
  ```

  **Commit**: YES
  - Message: `refactor: extract shared BasesEventFrontmatterService for frontmatter sync`
  - Files: `src/service/BasesEventFrontmatterService.ts`, `src/main.ts`, `src/views/YearlyGlanceBasesView.tsx`
  - Pre-commit: `npx tsc --noEmit && npm run build:local`

- [x] 5. Move `isSaving` state from Modal class field to EventForm component

  **What to do**:
  - In `EventFormModal.tsx`:
    - Remove `isSaving: boolean = false` class field (L34)
    - Remove `this.isSaving = true; this.renderForm();` (L101-102) and `this.isSaving = false; this.renderForm();` (L227-228)
    - Remove `isSaving={this.isSaving}` prop from `renderForm()` (L82)
    - Change `onSave` prop type: instead of `EventFormModal` managing saving state, pass `onSave` as a `Promise`-returning callback. `EventForm` will await it and manage its own loading state
    - Simplify `renderForm()` to not need re-calling for state updates
  - In `EventForm.tsx`:
    - Remove `isSaving` from props interface
    - Add internal `const [isSaving, setIsSaving] = React.useState(false)` state
    - In `handleSubmit`: wrap the `onSave(event, eventType)` call with `setIsSaving(true)` / `setIsSaving(false)` in try/finally
    - The `onSave` prop becomes `(event, eventType) => Promise<void>` — `EventForm` awaits it
  - Ensure error handling: if `onSave` throws, `isSaving` resets to `false` (via `finally` block) and the user sees the error Notice (thrown by EventFormModal.onSave) and can retry

  **Must NOT do**:
  - Do NOT restructure the entire `EventFormModal.onSave` business logic
  - Do NOT extract save logic into a separate service
  - Do NOT change the modal open/close flow

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Scoped React state refactor in 2 files, clear pattern
  - **Skills**: [`ob-plugin-dev`]
    - `ob-plugin-dev`: React integration patterns in Obsidian plugins

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 5)
  - **Blocks**: Final Verification
  - **Blocked By**: Tasks 1-4

  **References**:

  **Pattern References**:
  - `src/components/EventForm/EventFormModal.tsx:34,67-86,96-229` — Current `isSaving` as class field + `renderForm()` manual re-render pattern + `onSave` method
  - `src/components/EventForm/EventForm.tsx` — Current `isSaving` prop usage, `handleSubmit` logic

  **API/Type References**:
  - `src/components/EventForm/EventForm.tsx` — `EventFormProps` interface (needs `isSaving` removed, `onSave` return type changed to `Promise<void>`)

  **WHY Each Reference Matters**:
  - `EventFormModal.tsx:101-102,227-228`: These are the exact lines to remove — the manual `renderForm()` calls for state updates
  - `EventForm.tsx` props: The `isSaving` prop must be removed and replaced with internal state

  **Acceptance Criteria**:

  - [ ] `EventFormModal` has no `isSaving` field
  - [ ] `EventFormModal.renderForm()` is called only once (in `onOpen`), not for state updates
  - [ ] `EventForm` manages `isSaving` via `React.useState`
  - [ ] Save button disables during save and re-enables on error
  - [ ] `npx tsc --noEmit` → zero errors
  - [ ] `npm run build:local` → success

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: isSaving managed by React state
    Tool: Bash (grep)
    Preconditions: isSaving refactored
    Steps:
      1. Run `grep -n "isSaving" src/components/EventForm/EventFormModal.tsx`
      2. Assert zero matches (no isSaving in Modal class)
      3. Run `grep -n "useState.*isSaving\|isSaving.*useState" src/components/EventForm/EventForm.tsx`
      4. Assert at least 1 match (useState in EventForm)
      5. Run `npx tsc --noEmit`
      6. Assert zero errors
    Expected Result: isSaving lives in EventForm React state, not Modal class
    Failure Indicators: isSaving still in Modal, or TypeScript errors
    Evidence: .sisyphus/evidence/task-5-state-check.txt

  Scenario: Build succeeds after refactor
    Tool: Bash
    Preconditions: Task 5 changes committed
    Steps:
      1. Run `npm run build:local`
      2. Assert "所有文件已成功复制" in output
    Expected Result: Plugin builds successfully
    Failure Indicators: Build failure
    Evidence: .sisyphus/evidence/task-5-build-verify.txt
  ```

  **Commit**: YES
  - Message: `refactor: move isSaving state from Modal class field to EventForm component`
  - Files: `src/components/EventForm/EventFormModal.tsx`, `src/components/EventForm/EventForm.tsx`
  - Pre-commit: `npx tsc --noEmit && npm run build:local`

- [x] 6. Add duration validation warnings for invalid values

  **What to do**:
  - In `expandEventByDuration` (extracted in Task 1, `src/utils/expandEventByDuration.ts`):
    - When `duration` is `0`, negative, `NaN`, or non-integer: clamp to `1` (already done in Task 1) AND collect a warning entry `{ eventText, eventId, duration, reason }` into a returned warnings array
    - Change return type from just expanded events to `{ events: CalendarEvent[], warnings: DurationWarning[] }` (or add a second output parameter)
  - In `useYearlyCalendar.ts` where `expandEventByDuration` is called:
    - Collect all warnings from all `expandEventByDuration` calls
    - After `allEvents` useMemo completes, if warnings exist:
      - `console.warn("[YearlyGlance] Invalid duration values found:", warnings)` — log each event's id, text, and invalid duration value
    - Do NOT use `Notice` inside the hook (React component should not trigger Obsidian UI). Instead, expose warnings via the hook's return value
  - In `src/components/YearlyCalendar/YearlyCalendar.tsx` (or the top-level component that calls `useYearlyCalendar`):
    - If `warnings.length > 0`, show a single `new Notice(t("warning.invalidDuration", { count: String(warnings.length) }))` on first render with warnings (use a `useEffect` + ref to avoid repeated notices)
  - Add i18n key for the warning message in all 3 locale files:
    - en: `"{{count}} event(s) have invalid duration values, treated as 1 day. Check console for details."`
    - zh: `"有 {{count}} 条事件的持续天数不规范，已按 1 天处理。详情请查看控制台。"`
    - zh-TW: `"有 {{count}} 筆事件的持續天數不規範，已按 1 天處理。詳情請查看控制台。"`

  **Must NOT do**:
  - Do NOT block rendering for invalid duration — always clamp and continue
  - Do NOT show a Notice for every single invalid event — one aggregated Notice only
  - Do NOT add modal or interactive UI for this warning

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Validation logic + one Notice + i18n keys, straightforward
  - **Skills**: [`ob-plugin-dev`]
    - `ob-plugin-dev`: Notice API, i18n patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 6)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: Tasks 1-5 (especially Task 1 which creates the function)

  **References**:

  **Pattern References**:
  - `src/utils/expandEventByDuration.ts` — Created in Task 1, this is where duration clamping already happens. Add warning collection here
  - `src/hooks/useYearlyCalendar.ts:134-217` — `allEvents` useMemo block where `expandEventByDuration` is called for each event type
  - `src/components/YearlyCalendar/YearlyCalendar.tsx` — Top-level component that consumes `useYearlyCalendar` return values

  **API/Type References**:
  - `src/i18n/types.ts` — i18n key type system (new key must be added to `BaseMessage`)
  - `src/i18n/locales/en.ts`, `zh.ts`, `zh-TW.ts` — All 3 locale files need the new warning key
  - Obsidian API: `new Notice(message)` — displays a temporary notification

  **WHY Each Reference Matters**:
  - `expandEventByDuration.ts`: Duration clamping already exists from Task 1 — just add warning collection alongside it
  - i18n files: Must add the key to ALL 3 locales to avoid missing translation fallback

  **Acceptance Criteria**:

  - [ ] Invalid duration (0, negative, NaN) produces console.warn with event details
  - [ ] A single aggregated Notice appears when invalid durations are detected
  - [ ] i18n key exists in all 3 locale files
  - [ ] `npx tsc --noEmit` → zero errors
  - [ ] `npm run build:local` → success

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Duration warning logic exists in expandEventByDuration
    Tool: Bash (grep)
    Preconditions: Warning collection added
    Steps:
      1. Run `grep -n "warn" src/utils/expandEventByDuration.ts`
      2. Assert at least 1 match (warning collection logic exists)
      3. Run `grep -n "invalidDuration" src/i18n/locales/en.ts src/i18n/locales/zh.ts src/i18n/locales/zh-TW.ts`
      4. Assert 3 matches (one per locale file)
      5. Run `npx tsc --noEmit`
      6. Assert zero errors
    Expected Result: Warning infrastructure in place across utility + i18n
    Failure Indicators: Missing i18n keys, TypeScript errors
    Evidence: .sisyphus/evidence/task-6-duration-warnings.txt

  Scenario: Build succeeds
    Tool: Bash
    Preconditions: Task 6 changes applied
    Steps:
      1. Run `npm run build:local`
      2. Assert "所有文件已成功复制" in output
    Expected Result: Plugin builds successfully
    Failure Indicators: Build failure
    Evidence: .sisyphus/evidence/task-6-build-verify.txt
  ```

  **Commit**: YES
  - Message: `feat: add duration validation warnings with Notice and console output`
  - Files: `src/utils/expandEventByDuration.ts`, `src/hooks/useYearlyCalendar.ts`, `src/components/YearlyCalendar/YearlyCalendar.tsx`, `src/i18n/locales/en.ts`, `src/i18n/locales/zh.ts`, `src/i18n/locales/zh-TW.ts`, `src/i18n/types.ts`
  - Pre-commit: `npx tsc --noEmit && npm run build:local`

- [x] 7. Add debug logging in `hashData` + extract `readOptionalProp` helper in BasesView

  **What to do**:
  - In `YearlyGlanceBasesView.tsx`:
    - **hashData debug logging**: Replace the 6 empty `catch (error) { // 忽略错误，使用 null }` blocks (L195-229) with `catch (error) { console.debug("[YearlyGlance] hashData: failed to read prop for", entry.file?.name, ":", error); }`. Use `console.debug` (not `console.warn`) — these are high-frequency and only useful for debugging
    - **Extract `readOptionalProp` helper**: Create a private method:
      ```typescript
      private readOptionalProp(entry: BasesEntry, propKey: string | null, label: string): string | null {
          if (!propKey) return null;
          try {
              const raw = entry.getValue(propKey);
              return raw?.isTruthy() ? raw.toString() : null;
          } catch (error) {
              console.warn(`[YearlyGlance] Failed to read ${label} for ${entry.file.name}:`, error);
              return null;
          }
      }
      ```
    - Replace the 6 repetitive try-catch blocks in `buildMixedEvents` (L302-367: title, duration, icon, color, description reads) with calls to `readOptionalProp`. Note: duration needs special handling (parseInt), so read the raw string via helper then parse separately
    - Also use `readOptionalProp` in `hashData` to collapse the 6 identical try-catch blocks there (after adding debug log)

  **Must NOT do**:
  - Do NOT use `console.warn` in `hashData` (too noisy for change-detection path) — use `console.debug`
  - Do NOT change the date reading in `buildMixedEvents` (L292-298) — date is a required field with different error handling (continue vs skip)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Helper extraction + log addition, repetitive pattern simplification
  - **Skills**: [`ob-plugin-dev`]
    - `ob-plugin-dev`: BasesView patterns

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 7)
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 1-6 (especially Task 3 which introduces `BasesEntry` type)

  **References**:

  **Pattern References**:
  - `src/views/YearlyGlanceBasesView.tsx:195-229` — The 6 identical try-catch blocks in `hashData` to add debug logging
  - `src/views/YearlyGlanceBasesView.tsx:302-367` — The 6 repetitive property reading patterns in `buildMixedEvents` to collapse
  - `src/type/BasesTypes.ts:BasesEntry` — Created in Task 3, the type for `entry` parameter in the helper

  **WHY Each Reference Matters**:
  - L195-229: Exact location of silent error swallowing to fix
  - L302-367: Exact location of repetitive pattern to extract. Each block follows the same structure: check propKey → try getValue → isTruthy check → toString. Only duration differs (needs parseInt after)

  **Acceptance Criteria**:

  - [ ] `readOptionalProp` helper method exists in `YearlyGlanceBasesView`
  - [ ] `hashData` has `console.debug` in catch blocks
  - [ ] `buildMixedEvents` uses `readOptionalProp` for title, icon, color, description reads
  - [ ] Net line reduction ≥30 lines (6 repeated blocks → 6 one-liners)
  - [ ] `npx tsc --noEmit` → zero errors
  - [ ] `npm run build:local` → success

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Helper exists and is used
    Tool: Bash (grep)
    Preconditions: Helper extracted, calls replaced
    Steps:
      1. Run `grep -c "readOptionalProp" src/views/YearlyGlanceBasesView.tsx`
      2. Assert ≥7 matches (1 definition + ≥6 calls)
      3. Run `grep -c "console.debug" src/views/YearlyGlanceBasesView.tsx`
      4. Assert ≥1 match (hashData debug logging)
      5. Run `npx tsc --noEmit`
      6. Assert zero errors
    Expected Result: Helper in use, debug logging present, clean build
    Failure Indicators: Low match counts, TypeScript errors
    Evidence: .sisyphus/evidence/task-7-helper-check.txt

  Scenario: Build succeeds
    Tool: Bash
    Preconditions: Task 7 changes applied
    Steps:
      1. Run `npm run build:local`
      2. Assert "所有文件已成功复制" in output
    Expected Result: Plugin builds successfully
    Failure Indicators: Build failure
    Evidence: .sisyphus/evidence/task-7-build-verify.txt
  ```

  **Commit**: YES
  - Message: `refactor: extract readOptionalProp helper and add debug logging in BasesView`
  - Files: `src/views/YearlyGlanceBasesView.tsx`
  - Pre-commit: `npx tsc --noEmit`

- [x] 8. Remove dead code: `getArrayConfig` method

  **What to do**:
  - Delete the `getArrayConfig` method (L567-582) from `YearlyGlanceBasesView.tsx` — it is defined but never called anywhere in the codebase
  - Verify with `lsp_find_references` or grep before deletion to confirm zero callers

  **Must NOT do**:
  - Do NOT remove `getNumericConfig` or `getBooleanConfig` — those ARE used

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single method deletion
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Task 8)
  - **Blocks**: Final Verification
  - **Blocked By**: Tasks 1-7

  **References**:

  **Pattern References**:
  - `src/views/YearlyGlanceBasesView.tsx:567-582` — The dead `getArrayConfig` method to remove

  **WHY Each Reference Matters**:
  - Exact line range to delete. Executor must verify zero callers first

  **Acceptance Criteria**:

  - [ ] `getArrayConfig` does not exist in the codebase
  - [ ] `npx tsc --noEmit` → zero errors

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Dead code removed
    Tool: Bash (grep)
    Preconditions: Method deleted
    Steps:
      1. Run `grep -rn "getArrayConfig" src/`
      2. Assert zero matches
      3. Run `npx tsc --noEmit`
      4. Assert zero errors
    Expected Result: No references, clean build
    Failure Indicators: Remaining references, TypeScript errors
    Evidence: .sisyphus/evidence/task-8-dead-code.txt
  ```

  **Commit**: YES (group with Task 7)
  - Message: `refactor: remove unused getArrayConfig method from BasesView`
  - Files: `src/views/YearlyGlanceBasesView.tsx`
  - Pre-commit: `npx tsc --noEmit`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npm run lint` + `npm test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (`git diff`). Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Task 1**: `refactor: extract expandEventByDuration and clip multi-day events at year boundary` — `src/utils/expandEventByDuration.ts`, `src/utils/expandEventByDuration.test.ts`, `src/hooks/useYearlyCalendar.ts` | Pre-commit: `npx tsc --noEmit && npm test`
- **Task 2**: `refactor: remove dead NoteEventService cache, use metadataCache for reads` — `src/service/NoteEventService.ts` | Pre-commit: `npx tsc --noEmit`
- **Task 3**: `refactor: replace any types with proper interfaces in event processing` — `src/type/BasesTypes.ts`, `src/hooks/useYearlyCalendar.ts`, `src/views/YearlyGlanceBasesView.tsx`, `src/service/NoteEventService.ts` | Pre-commit: `npx tsc --noEmit`
- **Task 4**: `refactor: extract shared BasesEventFrontmatterService for frontmatter sync` — `src/service/BasesEventFrontmatterService.ts`, `src/main.ts`, `src/views/YearlyGlanceBasesView.tsx` | Pre-commit: `npx tsc --noEmit && npm run build:local`
- **Task 5**: `refactor: move isSaving state from Modal class field to EventForm component` — `src/components/EventForm/EventFormModal.tsx`, `src/components/EventForm/EventForm.tsx` | Pre-commit: `npx tsc --noEmit && npm run build:local`
- **Task 6**: `feat: add duration validation warnings with Notice and console output` — `src/utils/expandEventByDuration.ts`, `src/hooks/useYearlyCalendar.ts`, `src/components/YearlyCalendar/YearlyCalendar.tsx`, `src/i18n/locales/*.ts`, `src/i18n/types.ts` | Pre-commit: `npx tsc --noEmit && npm run build:local`
- **Task 7**: `refactor: extract readOptionalProp helper and add debug logging in BasesView` — `src/views/YearlyGlanceBasesView.tsx` | Pre-commit: `npx tsc --noEmit`
- **Task 8**: `refactor: remove unused getArrayConfig method from BasesView` — `src/views/YearlyGlanceBasesView.tsx` | Pre-commit: `npx tsc --noEmit`

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit           # Expected: no errors
npm run build:local        # Expected: build + copy success
npm test                   # Expected: all tests pass
npm run lint               # Expected: no NEW errors (pre-existing 2 errors acceptable)
```

### Final Checklist
- [ ] All 5 moderate issues resolved
- [ ] All 3 minor issues resolved
- [ ] Zero behavioral regressions
- [ ] Each commit builds independently
- [ ] Unit tests for expandEventByDuration pass
- [ ] No new `any` types introduced
- [ ] Shared frontmatter service used by both main.ts and BasesView
- [ ] isSaving managed by React state
- [ ] Invalid duration values produce Notice + console warnings
- [ ] hashData has debug logging in catch blocks
- [ ] readOptionalProp helper used in BasesView (net code reduction)
- [ ] getArrayConfig dead code removed
