# What's New in v4.0

This document highlights the key new features in Yearly Glance v4.0.

---

## Daily Note Events

You can now create events directly from your daily notes. Events are stored as a list property in the daily note's frontmatter and automatically displayed on the calendar.

### How It Works

1. **Enable** in Settings → Daily Note Events → toggle on
2. **Choose source**: Core "Daily notes" plugin or "Periodic Notes" plugin
3. **Set property name**: The frontmatter property that stores events (default: `events`)

### Example Daily Note

```yaml
---
events:
  - "🧩 Plugin dev session"
  - "📚 Reading"
  - "Team meeting"
---
```

Each item becomes a separate event on that day. Emoji prefixes are extracted as the event icon automatically.

### Creating Daily Note Events

- Click the ✏️ button → select "Daily Note Event" tab → enter event name and date
- The event is written to the daily note's frontmatter property
- If the daily note doesn't exist, it will be created automatically

### Date Migration

When editing a daily note event and changing its date:
- The event is **removed** from the original daily note
- And **added** to the new daily note (created if needed)
- The form shows a warning: "The event will be moved from the original daily note (2026-04-22) to the new daily note."

---

## Note Events

Use any note with an `event_date` frontmatter property as an event source. This lets you attach rich content — descriptions, links, checklists — directly to an event note, going beyond what a simple calendar entry can hold.

### How It Works

1. **Set root folder**: Settings → Note Events → Default note event path (e.g., `Events/`)
2. **Create a note** in that folder with the required frontmatter
3. The note automatically appears as an event on the calendar

### Example Note

```yaml
---
title: Team Offsite
event_date: 2026-06-15
duration: 3
icon: 🏢
color: "#3498db"
description: Annual team building event
---

## Agenda
- Morning: Strategy session
- Afternoon: Team activities
```

### Available Properties

| Property | Default Name | Required | Description |
|----------|-------------|----------|-------------|
| Title | `title` | No (uses filename) | Event display name |
| Date | `event_date` | **Yes** | Event date (YYYY-MM-DD) |
| Duration | `duration` | No (default: 1) | Number of days |
| Icon | `icon` | No | Custom emoji |
| Color | `color` | No | Hex color code |
| Description | `description` | No | Additional notes |

All property names are customizable in Settings → Note Events.

### Creating Note Events from the Calendar

Click the ✏️ button → select "Note Event" tab → fill in the event details. A new note file is created automatically in the configured root folder with the proper frontmatter.

### Bases View Integration

For advanced filtering, use Obsidian's **Bases** feature:

1. Create a `.base` file with a query selecting your event notes
2. Add the **Yearly Glance** view
3. Map property names in the view options

This lets you create multiple calendar views with different event sources and filters.

> For more on Bases, see the [Obsidian Bases documentation](https://help.obsidian.md/bases).

---

## Note Event File Name Format

Note events (Bases events) now support a configurable file name format with date-based folder organization.

### Setting

**Settings → Note Events → File Name Format**

### Syntax

| Token | Meaning | Example |
|-------|---------|---------|
| `{event_name}` | The event title | `MyEvent` |
| `YYYY` | 4-digit year | `2026` |
| `MM` | 2-digit month | `04` |
| `DD` | 2-digit day | `29` |
| `YY` | 2-digit year | `26` |
| `[text]` | Literal characters (not parsed as date) | `[YG]` → `YG` |

### Examples

| Format | Event "Meeting" on 2026-04-29 | Result Path |
|--------|-------------------------------|-------------|
| `{event_name}` (default) | — | `Events/Meeting.md` |
| `YYYY-MM/YYMMDD_{event_name}` | — | `Events/2026-04/260429_Meeting.md` |
| `YYYY/MM/{event_name}` | — | `Events/2026/04/Meeting.md` |
| `[Event]_{event_name}_MMDD` | — | `Events/Event_Meeting_0429.md` |

Intermediate directories are created automatically.

The settings page shows a live preview of the resolved path based on today's date.

---

## Right-Click Context Menu

Right-clicking any event on the calendar now shows a context menu with quick actions:

| Action | When shown | What it does |
|--------|-----------|--------------|
| **Edit** | Always | Opens the edit form directly (skips preview) |
| **Open Note** | Note/Daily Note events with a source file | Opens the source note in a new tab |
| **Delete** | Always | Shows confirmation, then deletes the event |

Delete behavior varies by event type:
- **Config events** (holiday/birthday/custom): Removed from plugin data
- **Note events**: Source note file is trashed
- **Daily note events**: Property value removed from the daily note's frontmatter

---

## Delete Button in Edit Modal

The event edit form now has a **Delete** button at the bottom-left corner. This provides a faster way to delete events without navigating to the Event Manager.

- Confirmation dialog is shown before deletion
- Supports all event types with appropriate deletion behavior
- Built-in holidays that shouldn't be deleted show a disabled button

---

## Remember Last Event Type

When creating a new event, the form now defaults to the last event type you selected. If you previously created a Daily Note Event, the next time you open the form it will default to the Daily Note Event tab.

This preference persists across sessions.

---

## UI/UX Improvements

### Color Selector
- Preset color dropdown shows a **colored circle** before each option
- Responsive layout: wraps to two lines when space is narrow
- Select aligned to the right with `max-width: 50%`

### Responsive Tabs
- **Event Manager tabs**: Show emoji + text at normal width, emoji-only when container is narrow (≤600px)
- **Event Form tabs**: Show text only, switch to emoji-only at narrow viewport (≤600px)

### Event Preview Tooltip
- Source file path simplified to filename only (full path on hover)
- Modal width constrained to 360px
- Unified Tooltip component on all action buttons

### Calendar Title
- Year number: serif font, 1.5em, underline decoration
- Hover: year number and underline change to accent color
- Title and year number aligned at baseline

### Event Legend
- Collapses to emoji-only mode at container width ≤600px

### Event Manager
- Header wraps buttons to second line when space is insufficient
- Event-specific info only shows meaningful values (no more "Hidden: ✘" clutter)
- Add button changed to circular ✏️ icon matching adjacent buttons

---

## Date Validation

Invalid date inputs are now properly caught:
- `2026-04-220` → Error: invalid date range
- `2026-13-01` → Error: month out of range
- `2026-02-30` → Error: day exceeds month limit

The date input field shows inline validation with ✓ or ⚠ indicators.
