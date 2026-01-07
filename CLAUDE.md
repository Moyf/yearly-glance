# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Notice: 构建的时候请优先使用 npm run build:local 。

## Project Overview

Yearly Glance is an Obsidian plugin that provides a visual yearly calendar view for managing holidays, birthdays, and custom events. It supports both Gregorian and Chinese lunar calendars, with multi-language support (English, Simplified Chinese, Traditional Chinese).

**Tech Stack**: TypeScript 4.7.4, React 19, esbuild 0.27.1, PostCSS with nesting support

## Development Commands

```bash
# Development (watch mode)
npm run dev

# Production build
npm run build

# Build + copy to local vault (requires .env with VAULT_PATH)
npm run build:local

# Type checking
npx tsc --noEmit

# Linting
npm run lint          # Check
npm run lint:fix      # Auto-fix

# Testing
npm test              # Run Jest tests
npm run test:watch    # Jest watch mode

# Versioning & Release
npm run version       # Bump version and update manifests
npm run release:pre   # Build + version + changelog
```

## Build Configuration

- **Entry Point**: `src/main.ts`
- **Output**: `main.js` (bundle), `styles.css` (from PostCSS)
- **External Dependencies**: obsidian, electron, CodeMirror modules (not bundled)
- **CSS Processing**: PostCSS with nesting plugin (allows SCSS-like syntax)
- **TypeScript**: ES2017 target, ESNext modules, React JSX transform

## High-Level Architecture

### Plugin Structure ([src/main.ts](src/main.ts))

The plugin follows the standard Obsidian plugin pattern with three view types:

1. **YearlyGlanceView** (`VIEW_TYPE_YEARLY_GLANCE`): Main calendar view
2. **GlanceManagerView** (`VIEW_TYPE_GLANCE_MANAGER`): Management interface (Events, Import/Export, Settings)
3. **YearlyGlanceBasesView** (`VIEW_TYPE_YEARLY_GLANCE_BASES`): BasesView integration for rendering events from note frontmatter

### Event System

Three event types with shared `BaseEvent` interface:
- **Holiday**: Fixed/recurring holidays with `foundDate` for anniversaries
- **Birthday**: Annual birthdays with calculated age, zodiac, animal
- **CustomEvent**: User-defined events with repeat support

**Event Sources** ([EventSource enum](src/type/Events.ts)):
- `CONFIG`: Stored in plugin settings
- `BASES`: From note frontmatter (via Obsidian Bases)
- `CODEBLOCK`: Future support for markdown code blocks

**Event ID Format**: `{source}-{filePath}-{isoDate}` (e.g., `bases-Events/event.md-2026-01-10`)

### State Management

**Pub/Sub Event Bus** ([src/hooks/useYearlyGlanceConfig.ts](src/hooks/useYearlyGlanceConfig.ts)):
```typescript
YearlyGlanceBus.subscribe(callback) // Subscribe to changes
YearlyGlanceBus.publish()            // Notify all subscribers
```

Used by React components via `useYearlyGlanceConfig` hook to sync plugin settings across views.

### Data Flow

1. Settings stored in `YearlyGlanceConfig` with two parts:
   - `config`: Display preferences (year, layout, colors, visibility)
   - `data`: Event collections (holidays, birthdays, customEvents)

2. On plugin load ([`loadSettings()`](src/main.ts:51-66)):
   - Load and validate saved data
   - Run migrations via `MigrateData.migrateV2()`
   - Update all events' `dateArr` field via `EventCalculator`
   - Add sample event on first install

3. On settings save ([`saveSettings()`](src/main.ts:101-104)):
   - Persist to Obsidian data store
   - Publish to `YearlyGlanceBus` to notify components

### Key Services

- **EventCalculator** ([src/utils/eventCalculator.ts](src/utils/eventCalculator.ts)): Core date calculation logic (Gregorian/Lunar conversion, recurring events, birthday age/zodiac)
- **DateParseService** ([src/services/dateParseService.ts](src/services/dateParseService.ts)): Parses user input dates
- **iCalendarService** ([src/services/iCalendarService.ts](src/services/iCalendarService.ts)): ICS export
- **JsonService** ([src/services/jsonService.ts](src/services/jsonService.ts)): JSON import/export
- **MarkdownService** ([src/services/markdownService.ts](src/services/markdownService.ts)): Frontmatter parsing/export

### Internationalization

Custom i18n system ([src/i18n/i18n.ts](src/i18n/i18n.ts)):
- Singleton `I18n` class with flattened translation keys
- Supported locales: `en`, `zh`, `zh-TW`
- Auto-detects Obsidian language
- Usage: `t(key, params)` for template string interpolation

### BasesView Integration

[`YearlyGlanceBasesView`](src/views/YearlyGlanceBasesView.tsx) integrates with Obsidian's Bases database feature:
- Reads events from note frontmatter
- Configurable property mapping (title, date)
- Option to inherit plugin data
- Bidirectional sync: updates frontmatter when events are modified via `syncBasesEventToFrontmatter()`

## Component Architecture

**React 19** with `createRoot` API. Component hierarchy:
```
YearlyCalendar
├── YearlyCalendarView
│   ├── Control Bar (year nav, view presets, toggles)
│   ├── Month Grid (12 months)
│   └── EventTooltip (modal for details)

Feature Components:
├── EventForm (add/edit modal)
├── EventManager (list view with sorting/filtering)
├── DataPortManager (import/export)
└── SettingsTab (configuration)
```

Base reusable components in [src/components/base/](src/components/base/): Form components (Input, Select, Toggle, DateInput, Autocomplete), Action components (Button, ConfirmDialog), Display components (Tooltip, CalloutBlock, ColorSelector).

## Important Patterns

### Data Migration
When adding new config fields, update:
1. [`DEFAULT_CONFIG`](src/type/Config.ts) - Default values
2. [`MigrateData.migrateV2()`](src/utils/migrateData.ts) - Migration logic

### Adding New Event Types
1. Extend [`BaseEvent`](src/type/Events.ts) interface
2. Add to [`EventType`](src/type/Events.ts) and [`EVENT_TYPE_LIST`](src/type/Events.ts)
3. Update [`EVENT_TYPE_DEFAULT`](src/type/Events.ts)
4. Add to [`Events`](src/type/Events.ts) interface
5. Update [`EventCalculator`](src/utils/eventCalculator.ts) for date calculations

### Adding Translations
Add keys to all locale files in [src/i18n/locales/](src/i18n/locales/). Keys are flattened at runtime (dot-notation access).

## Linting Rules

ESLint with TypeScript rules. The following can be ignored:
- `no-explicit-any`
- `no-unused-vars` (with `args: none` option)
- `no-non-null-assertion`

Use `npm run lint:fix` for auto-fixing.

## Commit Convention

Uses Conventional Commits. Use `npx cz` for interactive commit formatting.
