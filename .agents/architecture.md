# Architecture Overview

## Plugin Structure

Entry point: `src/main.ts` → `YearlyGlancePlugin extends Plugin`

### Three View Types

1. **YearlyGlanceView** (`yearly-glance-view`): Main calendar view - renders `YearlyCalendar` component
2. **GlanceManagerView** (`yearly-glance-manager`): Management interface with tabs (events, import/export, settings)
3. **YearlyGlanceBasesView** (`yearly-glance-bases-view`): Bases integration view - renders events from note frontmatter

### Data Architecture

```
YearlyGlanceConfig {
  config: YearlyGlanceSettings  // Display preferences, paths, toggles
  data: Events {                // Event collections
    holidays: Holiday[]
    birthdays: Birthday[]
    customEvents: CustomEvent[]
  }
}
```

**Event Sources** (EventSource enum):
- `CONFIG`: Stored in plugin data.json
- `BASES`: From note frontmatter via NoteEventService
- `DAILYNOTE`: From daily note frontmatter lists
- `CODEBLOCK`: Future support

**Event ID Format**: `{source}-{filePath}-{isoDate}`

### State Management - Pub/Sub Bus

```typescript
// src/hooks/useYearlyGlanceConfig.ts
YearlyGlanceBus.publish(topic: RefreshTopic)  // Notify subscribers
YearlyGlanceBus.subscribe(callback)            // Listen all
YearlyGlanceBus.subscribeTopics(topics[], callback)  // Listen specific

// RefreshTopic: 'config' | 'plugin-data' | 'bases-data' | 'dailynote-data' | 'all'
```

### Component Hierarchy

```
YearlyCalendar (wrapper class, manages React root)
└── YearlyCalendarView (React FC)
    ├── Control Bar (year nav, layout, view preset, filters)
    ├── Month Grid (12 months, calendar or list view)
    │   └── Event items (click → EventTooltip modal)
    └── Legend (event type toggles)

EventTooltip (Obsidian Modal)
└── EventTooltipContent (React FC)
    ├── Header (emoji, title, action buttons: locate/edit)
    └── Body (date, type-specific info, remark)

EventFormModal (Obsidian Modal)
└── EventForm (React FC) - add/edit events

GlanceManagerView
└── Tabs: EventManager | DataPortManager | ViewSettings
```

### Key Services

| Service | Purpose |
|---------|---------|
| `EventCalculator` | Date calculations, birthday age/zodiac/animal |
| `NoteEventService` | Load events from note frontmatter |
| `DailyNoteService` | Load events from daily note properties |
| `DateParseService` | Parse user date inputs |
| `BasesEventFrontmatterService` | Sync events to frontmatter |
| `iCalendarService` | ICS export |
| `JsonService` | JSON import/export |
| `MarkdownService` | Frontmatter parsing/export |

### i18n System

- Singleton `I18n` class in `src/i18n/i18n.ts`
- Flattened key access: `t("data.zodiac.capricorn")`
- Locales: `en`, `zh`, `zh-TW`
- Birthday translations: `src/i18n/birthday.ts` (maps Chinese chars → i18n keys)

### Event Click Flow (Current)

1. User clicks event → `handleEventTooltip(event)` in YearlyCalendar.tsx
2. Opens `new EventTooltip(plugin, event).open()` (Obsidian Modal)
3. Tooltip shows event details with action buttons:
   - Edit button → `plugin.openEventForm(eventType, event, true, false)`
   - Location button → opens original note (bases/daily) or locates in EventManager (config)
4. Right-click context menu also available with edit/delete/open options

### Settings UI

- `ViewSettings.tsx`: Main settings component with SettingsBlock/SettingsItem pattern
- Settings organized in collapsible groups (basic, basesEvent, dailyNote, presetColors, advanced)
- Changes flow: `updateConfig()` → `plugin.updateConfig()` → `saveSettings()` → `YearlyGlanceBus.publish()`
