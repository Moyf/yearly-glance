# Development Notes

This document records follow-up engineering improvements for Yearly Glance. These items are not urgent defects; they are maintenance notes for future refactoring and hardening.

## Code structure

### Split the main calendar component

`src/components/YearlyCalendar/YearlyCalendar.tsx` currently acts as the primary calendar container and also handles display controls, event rendering, interaction logic, and view state. As the plugin grows, this file is likely to become the highest-maintenance area.

Suggested direction:

- Keep `YearlyCalendar.tsx` as the data and orchestration container.
- Extract display controls into a dedicated control bar component.
- Extract month/day rendering into smaller calendar body components.
- Keep event chips and event interaction behavior isolated from calendar layout logic.

Possible component split:

- `CalendarControlBar.tsx`
- `MonthGrid.tsx`
- `MonthList.tsx`
- `CalendarDay.tsx`
- `EventChip.tsx`

### Keep `main.ts` focused on plugin lifecycle

`src/main.ts` currently coordinates plugin loading, view registration, command registration, ribbon commands, metadata watchers, and event actions. This is still workable, but future changes will be easier if registration details move into smaller modules.

Suggested direction:

- Move view registration into a dedicated module.
- Move command and ribbon registration into a dedicated module.
- Move metadata watcher logic into a dedicated module or service.
- Keep `main.ts` as a readable lifecycle overview.

Potential files:

- `src/plugin/registerViews.ts`
- `src/plugin/registerCommands.ts`
- `src/plugin/registerMetadataWatcher.ts`
- `src/service/EventActionService.ts`

## Test coverage

The current test coverage already protects some service logic, but the highest-value areas for future tests are the parts that affect user data and date correctness.

Recommended priority:

1. `EventCalculator`: Gregorian dates, lunar dates, leap lunar months, birthdays, one-off events, recurring events, and multi-day events.
2. `IsoUtils`: supported input formats and invalid date handling.
3. `migrateData`: compatibility with older saved plugin data.
4. `BasesEventFrontmatterService`: frontmatter read/write behavior and path edge cases.
5. Import/export services: JSON and iCalendar compatibility.

## Documentation follow-up

The user-facing documentation now includes an event source model in both English and Chinese README files. Future feature additions should keep that model updated so users can clearly distinguish plugin events, note events, daily note events, and Bases views.
