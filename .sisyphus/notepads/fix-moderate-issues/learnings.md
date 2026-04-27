# Learnings

## [2026-04-27] Session Start
- Build command: `npm run build:local` (uses .env VAULT_PATH to copy to vault)
- Type check: `npx tsc --noEmit --skipLibCheck`
- Tests: `npm test` (Jest + ts-jest, testEnvironment=node)
- Pre-existing lint errors: 2 (EventSource unused + sort order in YearlyGlanceBasesView.tsx) — NOT in scope
- Branch: feat/multi-day-events
- IsoUtils.toLocalDateString() MUST be used instead of Date.toISOString() for timezone safety
- CalendarEvent = (Holiday | Birthday | CustomEvent) & {...} — basesEvent objects need isRepeat:false to satisfy union
- Obsidian Bases API (entry.getValue, BasesValue) has NO public types — use stub interfaces
- main.ts remark filter `startsWith('From Bases:')` is intentional — must NOT be unified into shared service

## [Task 1 complete - 2026-04-27]
- expandEventByDuration: src/utils/expandEventByDuration.ts
- Signature: expandEventByDuration(event: BaseEvent, eventType: EventType, year: number): CalendarEvent[]
- Duration clamping: Math.max(1, Number.isFinite(raw) ? Math.floor(raw) : 1)
- Year clipping: parseInt(currentDateISO.split('-')[0]) !== year → skip
- Tests: src/utils/expandEventByDuration.test.ts (9 cases, all pass)
- useYearlyCalendar: closure removed, now calls expandEventByDuration(...).forEach(e => events.push(e))
- Jest CLI compat: scripts/jest-compat.mjs rewrites deprecated --testPathPattern to --testPathPatterns for Jest 30
- Jest alias support: jest.config.js moduleNameMapper maps ^@/(.*)$ to <rootDir>/
- Typecheck compat: tsconfig.json enables skipLibCheck so plain npx tsc --noEmit matches repo build behavior

