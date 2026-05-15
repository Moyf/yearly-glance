# Key Files Reference

## Core

| File | Purpose |
|------|---------|
| `src/main.ts` | Plugin entry, settings load/save, commands, view registration |
| `src/type/Config.ts` | Top-level config interface (config + data) |
| `src/type/Settings.ts` | All settings fields, defaults, preset colors |
| `src/type/Events.ts` | Event interfaces (Holiday, Birthday, CustomEvent), EventSource enum |
| `src/type/CalendarEvent.ts` | Unified calendar event type for rendering |

## Views

| File | Purpose |
|------|---------|
| `src/views/YearlyGlanceView.ts` | Main calendar view (Obsidian ItemView) |
| `src/views/GlanceManagerView.tsx` | Manager with tabs (events/import-export/settings) |
| `src/views/YearlyGlanceBasesView.tsx` | Bases integration view |

## Components

| File | Purpose |
|------|---------|
| `src/components/YearlyCalendar/YearlyCalendar.tsx` | Main React calendar component + wrapper class |
| `src/components/YearlyCalendar/EventTooltip.tsx` | Event click tooltip modal |
| `src/components/EventForm/EventFormModal.tsx` | Add/edit event modal |
| `src/components/EventForm/EventForm.tsx` | Event form React component |
| `src/components/Settings/ViewSettings.tsx` | Settings UI (React) |
| `src/components/Settings/PresetColorSettings.tsx` | Color preset editor |
| `src/components/EventManager/` | Event list/management UI |

## Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useYearlyGlanceConfig.ts` | Config hook + YearlyGlanceBus (pub/sub) |
| `src/hooks/useYearlyCalendar.ts` | Calendar data computation, note event loading |
| `src/hooks/useEventBus.ts` | EventManager-specific bus (search requests) |

## Services

| File | Purpose |
|------|---------|
| `src/service/NoteEventService.ts` | Load events from note frontmatter |
| `src/service/DailyNoteService.ts` | Load events from daily notes |
| `src/service/BasesEventFrontmatterService.ts` | Sync events to frontmatter |
| `src/service/DateParseService.ts` | Parse user date inputs |

## Utils

| File | Purpose |
|------|---------|
| `src/utils/eventCalculator.ts` | Date calculations, birthday zodiac/animal/age |
| `src/utils/migrateData.ts` | Data migration between versions |
| `src/utils/isoUtils.ts` | ISO date utilities |
| `src/utils/lunarLibrary.ts` | Lunar calendar wrapper |
| `src/utils/expandEventByDuration.ts` | Multi-day event expansion |

## i18n

| File | Purpose |
|------|---------|
| `src/i18n/i18n.ts` | I18n singleton, t() export |
| `src/i18n/birthday.ts` | Zodiac/animal/ganzhi translation lookup |
| `src/i18n/types.ts` | Translation key types |
| `src/i18n/locales/{en,zh,zh-TW}.ts` | Locale files |
