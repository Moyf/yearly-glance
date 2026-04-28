# Note Events

Yearly Glance can use notes with specific properties (frontmatter) as event sources. This allows you to manage events directly from your Obsidian notes.

This is useful for creating more *complex* events with additional information and records stored right in the note itself.

Note-based events also integrate naturally with Obsidian's native note ecosystem.

## Quick Start

### 1. Configure the Default Path

Go to **Settings → Yearly Glance → Note Events** and set the **Default note event path** to a folder in your vault (e.g., `Events/`).

> [!note]
> The path configured here determines which note events appear in the **plugin view** (and where new ones are created by default).
> You can actually create notes with event properties anywhere in your vault and use Bases views to filter and display them.

### 2. Create a Note with Event Properties

Create a note in that folder with the following frontmatter:

```yaml
---
title: Team Meeting
event_date: 2025-06-15
---
```

The note will automatically appear as an event on your Yearly Calendar.

### 3. Available Properties

| Property | Default Name | Required | Description |
|----------|-------------|----------|-------------|
| Title | `title` | No (uses filename) | Event display name |
| Date | `event_date` | **Yes** | Event date (YYYY-MM-DD) |
| Duration | `duration` | No (default: 1) | Number of days the event spans |
| Icon | `icon` | No | Custom emoji for the event |
| Color | `color` | No | Custom color (hex code) |
| Description | `description` | No | Additional notes or details |

All property names can be customized in **Settings → Note Events**.

### Example: Multi-day Event

```yaml
---
title: Summer Vacation
event_date: 2025-07-20
duration: 7
icon: 🏖️
color: "#3498db"
description: Annual family trip
---
```

## Bases View Integration

Beyond the default path, you can also use Obsidian's **Bases** feature for more advanced filtering:

1. Create a `.base` file with a query that selects the notes you want
2. Add the **Yearly Glance** view to your Bases file
3. In the view options, map the property names for title, date, etc.

This allows you to:
- Use different folders and filter conditions for different calendars
- Create multiple calendar views with different event sources
- Leverage Bases queries to dynamically include/exclude events

For more on Bases, see the [Obsidian Bases documentation](https://help.obsidian.md/bases).
