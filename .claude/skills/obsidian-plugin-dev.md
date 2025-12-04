---
name: obsidian-plugin-dev
description: Comprehensive assistance for Obsidian plugin development using TypeScript, React, and the Obsidian API.
---

# Obsidian Plugin Development Skill

This skill provides comprehensive assistance for developing Obsidian plugins using Claude Code. It's tailored for the Yearly Glance project but applicable to any Obsidian plugin development.

## Project Overview

Yearly Glance is an Obsidian community plugin built with:
- **TypeScript** - Primary development language with strict mode
- **React 19** - UI framework for complex components
- **esbuild** - Fast bundler for TypeScript and React
- **npm** - Package manager and script runner
- **Jest** - Testing framework
- **ESLint** - Code linting and formatting

The plugin provides a yearly calendar view for managing events, holidays, and birthdays with support for both solar and lunar calendars.

## Development Commands

### Essential Commands

- **Development**: `npm run dev` - Starts TypeScript compilation in watch mode with esbuild
- **Production build**: `npm run build` - Type checks and builds the plugin
- **Local testing**: `npm run build:local` - Builds and copies to your vault (requires `.env` with `VAULT_PATH`)
- **Lint**: `npm run lint:fix` - Fix linting issues automatically
- **Test**: `npm test` - Run Jest tests
- **Test watch**: `npm run test:watch` - Run tests in watch mode

### Release Management

- **Version bump**: `npm run version` - Updates version across all manifest files
- **Generate changelog**: `npm run changelog:u` - Updates changelog with conventional commits
- **AI-translated changelog**: `npm run changelog:uT` - Generates bilingual changelogs (requires OpenAI API key in `.env`)
- **Create release**: `npm run release:pre` - Build, bump version, and update changelog

### Before Committing

Always run:
```bash
npm run lint:fix  # Fix linting issues
npm test          # Ensure tests pass
npm run build     # Verify production build works
```

## Plugin Architecture

### Core Structure

The plugin follows these key architectural principles:

1. **Minimal main.ts**: Keep `main.ts` focused on plugin lifecycle only
2. **Modular organization**: Split functionality across separate modules
3. **Type safety**: Strong typing with TypeScript interfaces
4. **React integration**: Use React for complex UI components
5. **Data validation**: Validate all data at entry points
6. **Event-driven communication**: Use EventBus for cross-component updates

### Directory Structure

```
src/
  main.ts              # Plugin entry point, lifecycle management
  type/                # TypeScript interfaces and types
    Config.ts          # Plugin configuration
    Events.ts          # Event types (Holiday, Birthday, CustomEvent)
    Date.ts            # Date handling interfaces
    Settings.ts        # Settings interfaces
  components/          # React components
    Base/              # Reusable UI primitives (Button, Input, Select, etc.)
    YearlyCalendar/    # Main calendar view
    EventManager/      # Event management UI
    EventForm/         # Event creation/editing forms
    Settings/          # Settings UI components
    DataPort/          # Import/export functionality
  hooks/               # React custom hooks
    useYearlyGlanceConfig.ts  # Main configuration hook
    useEventBus.ts     # Event communication
    useYearlyCalendar.ts      # Calendar state management
  service/             # Business logic services
    DateParseService.ts
    JsonService.ts
    MarkdownService.ts
    iCalendarService.ts
  utils/               # Utility functions
    dateValidator.ts   # Date validation
    eventCalculator.ts # Event date calculations
    lunarLibrary.ts    # Lunar calendar conversions
    migrateData.ts     # Data migration between versions
    uniqueEventId.ts   # ID generation
    specialHoliday.ts  # Holiday calculations
    isoUtils.ts        # ISO date utilities
    frontMatter.ts     # Front matter handling
  i18n/                # Internationalization
    i18n.ts            # Main i18n setup
    locales/           # Translation files
      en.ts            # English
      zh.ts            # Simplified Chinese
      zh-TW.ts         # Traditional Chinese
  views/               # Obsidian views
    YearlyGlanceView.ts    # Main calendar view
    GlanceManagerView.ts   # Event manager view
  context/             # React contexts
    obsidianAppContext.tsx # App context provider
```

### Plugin Lifecycle

```typescript
export default class YearlyGlancePlugin extends Plugin {
  settings: YearlyGlanceConfig;

  async onload() {
    // 1. Load settings
    await this.loadSettings();

    // 2. Register views
    this.registerLeafViews();

    // 3. Register commands
    this.registerCommands();
    this.registerRibbonCommands();

    // 4. Add settings tab
    this.addSettingTab(new YearlyGlanceSettingsTab(this.app, this));
  }

  onunload() {
    // Cleanup handled automatically by register methods
  }

  async loadSettings() {
    const savedData = await this.loadData();
    this.settings = this.validateAndMergeSettings(savedData);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

### Event Storage Architecture

Events are stored in three separate arrays within the plugin settings:
- `settings.data.events.holidays[]` - Holiday events with optional `foundDate` for anniversaries
- `settings.data.events.birthdays[]` - Birthday events with calculated `age`, `zodiac`, and `animal`
- `settings.data.events.customEvents[]` - User-defined events with `isRepeat` flag

Each event extends `BaseEvent`:
```typescript
interface BaseEvent {
  id: string;           // Unique identifier
  text: string;         // Display text
  eventDate: EventDate; // Original date with calendar type
  dateArr?: string[];   // Calculated dates for current year
  emoji?: string;       // Display emoji
  color?: string;       // Display color
  remark?: string;      // Additional notes
  isHidden?: boolean;   // Visibility flag
}
```

### Event Processing Flow

1. **Data Entry**: User creates/edits event via EventForm
2. **Validation**: `dateValidator.ts` validates date formats and values
3. **Calculation**: `EventCalculator` computes actual dates for current year
4. **Storage**: Save events to settings and persist via `saveData()`
5. **Broadcast**: EventBus notifies all components of changes
6. **Display**: `YearlyCalendar` re-renders with updated events

### Date Handling System

The plugin supports both solar and lunar calendar dates:
- `EventDate` interface stores original date and calendar type: `{ isoDate: string, calendar: 'SOLAR' | 'LUNAR' }`
- `lunarLibrary.ts` handles lunar-solar conversions using lunar-typescript library
- `eventCalculator.ts` computes actual dates for the current year
- All calculated dates are cached in `dateArr` property for performance
- Special holidays and floating dates are handled by `specialHoliday.ts`

Date calculation process:
```typescript
// Original date stored by user
const eventDate: EventDate = {
  isoDate: '1990-05-15',
  calendar: 'LUNAR'
};

// Calculated for current year by EventCalculator
const calculatedDates = EventCalculator.calculateEventDates(event, currentYear);
// Result: ['2024-06-20', '2025-06-09'] // Lunar 5/15 maps to these solar dates
```

## React Integration

### Mounting Components in Views

```typescript
import { StrictMode } from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';

export class YearlyGlanceView extends ItemView {
  root: Root | null = null;
  calendarView: YearlyCalendar;

  async onOpen() {
    this.root = createRoot(this.contentEl);
    this.root.render(
      <StrictMode>
        <YearlyCalendar />
      </StrictMode>
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}
```

### App Context Setup

Access Obsidian App instance from React components:

```typescript
// context.ts
import { createContext } from 'react';
import { App } from 'obsidian';

export const AppContext = createContext<App | undefined>(undefined);

// hooks.ts (useApp hook)
import { useContext } from 'react';
import { AppContext } from './context';

export const useApp = (): App | undefined => {
  return useContext(AppContext);
};

// Usage in view
this.root.render(
  <AppContext.Provider value={this.app}>
    <YearlyCalendar plugin={this.plugin} />
  </AppContext.Provider>
);

// Usage in component
const app = useApp();
const files = app.vault.getMarkdownFiles();
```

### Event Bus System

Cross-component communication via `YearlyGlanceBus`:

```typescript
import { YearlyGlanceBus } from "./hooks/useYearlyGlanceConfig";

// Emit event with data
YearlyGlanceBus.emit("eventCreated", { event: newEvent });
YearlyGlanceBus.emit("eventUpdated", { eventId, updates });
YearlyGlanceBus.emit("eventDeleted", { eventId });
YearlyGlanceBus.emit("settingsChanged", { settings });

// Listen to event in React component
useEffect(() => {
  const handleEventCreated = (data) => {
    refreshCalendar();
    showNotification('Event created');
  };

  YearlyGlanceBus.on("eventCreated", handleEventCreated);

  return () => {
    YearlyGlanceBus.off("eventCreated", handleEventCreated);
  };
}, []);
```

### Custom Hooks

Example pattern for plugin-specific hooks:

```typescript
// useYearlyGlanceConfig.ts
export const useYearlyGlanceConfig = () => {
  const plugin = useContext(PluginContext);

  const createEvent = async (eventData) => {
    const event = await plugin.createEvent(eventData);
    YearlyGlanceBus.emit("eventCreated", { event });
    return event;
  };

  return {
    config: plugin.settings,
    createEvent,
    updateEvent: plugin.updateEvent,
    deleteEvent: plugin.deleteEvent,
  };
};
```

## Obsidian API Integration

### Commands

Add commands accessible via command palette:

```typescript
this.addCommand({
  id: 'open-yearly-glance',
  name: 'Open Yearly Glance',
  callback: () => {
    this.activateView();
  },
  hotkeys: [{
    modifiers: ['Mod', 'Shift'],
    key: 'Y',
  }]
});

this.addCommand({
  id: 'add-event',
  name: 'Add new event',
  callback: () => {
    new EventFormModal(this.app, this).open();
  }
});
```

### Ribbon Icons

Add icon to left ribbon:

```typescript
this.addRibbonIcon('telescope', 'Open Yearly Glance', () => {
  this.activateView();
});

// With state management
const ribbonIcon = this.addRibbonIcon('calendar', 'Today\'s Events', () => {
  this.showTodaysEvents();
});

// Update icon later
ribbonIcon.removeClass('has-events');
ribbonIcon.addClass('has-events');
```

### Status Bar

Add item to status bar:

```typescript
const statusBarItem = this.addStatusBarItem();
statusBarItem.createEl('span', { text: 'YG: 5 events today' });

// Update status
statusBarItem.empty();
statusBarItem.createEl('span', { text: 'New status' });
```

### Modals

Create custom modals:

```typescript
import { Modal } from 'obsidian';

export class EventFormModal extends Modal {
  eventData: Partial<EventData>;
  onSave: (event: EventData) => void;

  constructor(app: App, event?: EventData) {
    super(app);
    this.eventData = event || {};
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: this.eventData.id ? 'Edit Event' : 'Create Event' });

    // Build form
    const form = contentEl.createEl('form');
    // ... form elements

    // Add save button
    new Setting(form)
      .addButton(btn => btn
        .setButtonText('Save')
        .setCta()
        .onClick(() => this.save())
      );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  save() {
    const event = this.buildEventFromForm();
    this.onSave(event);
    this.close();
  }
}
```

### Settings Tab

Register settings in Obsidian settings:

```typescript
// In main.ts
this.addSettingTab(new YearlyGlanceSettingsTab(this.app, this));

// Settings implementation
export class YearlyGlanceSettingsTab extends PluginSettingTab {
  plugin: YearlyGlancePlugin;

  constructor(app: App, plugin: YearlyGlancePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Section heading
    containerEl.createEl('h2', { text: 'Yearly Glance Settings' });

    // Boolean setting with toggle
    new Setting(containerEl)
      .setName('Show emoji before tab name')
      .setDesc('Display emoji icon in tab header')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showEmojiBeforeTabName)
        .onChange(async (value) => {
          this.plugin.settings.showEmojiBeforeTabName = value;
          await this.plugin.saveSettings();
          // Refresh UI to reflect change
          this.plugin.updateAllViews();
        })
      );

    // Text input
    new Setting(containerEl)
      .setName('Default event color')
      .setDesc('Color for new events (CSS color value)')
      .addText(text => text
        .setPlaceholder('#ff0000')
        .setValue(this.plugin.settings.defaultColor)
        .onChange(async (value) => {
          this.plugin.settings.defaultColor = value;
          await this.plugin.saveSettings();
        })
      );

    // Dropdown selection
    new Setting(containerEl)
      .setName('First day of week')
      .addDropdown(dropdown => dropdown
        .addOption('0', 'Sunday')
        .addOption('1', 'Monday')
        .setValue(this.plugin.settings.firstDayOfWeek.toString())
        .onChange(async (value) => {
          this.plugin.settings.firstDayOfWeek = parseInt(value);
          await this.plugin.saveSettings();
          YearlyGlanceBus.emit("settingsChanged", { settings: this.plugin.settings });
        })
      );

    // Button with action
    new Setting(containerEl)
      .setName('Import events')
      .setDesc('Import events from JSON file')
      .addButton(btn => btn
        .setButtonText('Choose file...')
        .setCta()
        .onClick(() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = (e) => {
            const file = e.target.files[0];
            this.importEvents(file);
          };
          input.click();
        })
      );
  }
}
```

### Registering Events Safely

Always use register methods for automatic cleanup:

```typescript
// Register Obsidian events
this.registerEvent(
  this.app.vault.on('create', (file) => {
    console.log('File created:', file.path);
    this.handleFileCreated(file);
  })
);

this.registerEvent(
  this.app.workspace.on('file-open', (file) => {
    console.log('File opened:', file?.path);
  })
);

// Register DOM events (auto-cleanup)
this.registerDomEvent(window, 'resize', () => {
  this.handleResize();
});

this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
  this.handleClick(evt);
});

// Register intervals (auto-cleanup)
this.registerInterval(
  window.setInterval(() => {
    this.checkForUpdates();
  }, 60000)
);

// Register timeouts
this.registerInterval(
  window.setTimeout(() => {
    this.initializeDelayed();
  }, 1000)
);
```

### Vault Operations

Common vault operations:

```typescript
// Read file content
const content = await this.app.vault.read(file);

// Create new file
await this.app.vault.create('path/to/file.md', '# New File\n\nContent');

// Modify existing file
await this.app.vault.modify(file, 'new content');

// Delete file
await this.app.vault.delete(file);

// Check if file exists
const exists = await this.app.vault.adapter.exists('path/to/file.md');

// Create folder
await this.app.vault.createFolder('path/to/folder');

// List files in folder
const files = this.app.vault.getFiles().filter(f => f.path.startsWith('folder/'));

// Get file metadata
const metadata = this.app.metadataCache.getFileCache(file);
const frontmatter = metadata?.frontmatter;
const headings = metadata?.headings;
```

### Workspace Operations

```typescript
// Get active file
const activeFile = this.app.workspace.getActiveFile();

// Open file in new leaf
await this.app.workspace.openLinkText('note.md', '', true);

// Get active view
const view = this.app.workspace.getActiveViewOfType(MarkdownView);

// Create new leaf
const leaf = this.app.workspace.getRightLeaf(false);
await leaf.setViewState({ type: VIEW_TYPE });

// Reveal leaf
this.app.workspace.revealLeaf(leaf);

// Iterate all leaves
this.app.workspace.iterateAllLeaves((leaf) => {
  if (leaf.view instanceof MyView) {
    leaf.view.update();
  }
});
```

## CSS and Styling

### CSS Variables System

Obsidian provides extensive CSS variables for consistent theming:

```css
/* Colors - adaptive to light/dark themes */
--color-base-00: #ffffff;
--color-base-20: #fafafa;
--color-base-25: #f5f5f5;
--color-base-30: #f0f0f0;
--color-base-35: #e6e6e6;
--color-base-40: #d9d9d9;

--color-accent: #7c3aed;
--color-accent-hover: #6d28d9;

--text-normal: #dcddde;
--text-muted: #999;
--text-faint: #666;
--text-error: #e16a6a;
--text-success: #4caf50;

/* Typography */
--font-ui-small: 13px;
--font-ui-medium: 15px;
--font-ui-large: 20px;

--font-mono: 'Source Code Pro', monospace;

/* Spacing scale */
--size-4-1: 4px;
--size-4-2: 8px;
--size-4-3: 12px;
--size-4-4: 16px;
--size-4-5: 20px;
--size-4-6: 24px;
--size-4-8: 32px;

/* Border radius */
--radius-s: 4px;
--radius-m: 8px;
--radius-l: 12px;
--radius-xl: 16px;

/* Interactive elements */
--interactive-accent: #7c3aed;
--interactive-accent-hover: #6d28d9;
--interactive-success: #4caf50;

--clickable-icon-radius: var(--radius-s);
--icon-size: 16px;
--icon-stroke: var(--icon-size);

/* Shadows */
--shadow-s: 0px 1px 1px rgba(0, 0, 0, 0.05);
--shadow-m: 0px 2px 4px rgba(0, 0, 0, 0.1);
--shadow-l: 0px 4px 8px rgba(0, 0, 0, 0.15);

/* Modal */
--modal-background: var(--color-base-20);
--modal-border-color: var(--color-base-30);
--modal-border-width: 1px;
--modal-radius: var(--radius-l);

/* Editor */
--line-width: 40rem;
--line-height: 1.5;
--max-width: 90%;
--icon-opacity: 0.8;
--icon-opacity-hover: 1;

/* Mobile */
--mobile-left-sidebar-width: 280pt;
--mobile-right-sidebar-width: 240pt;
```

For specialized styling, refer to `.claude/skills/references/obsidian-developer-docs/Reference/CSS variables/`.

### Writing Plugin CSS

Use `styles.css` for plugin-specific styles with proper namespacing:

```css
/* Plugin container with namespace */
.yg-view {
  padding: var(--size-4-3);
  font-size: var(--font-ui-medium);
}

/* Event items */
.yg-event-item {
  background: var(--color-base-20);
  border-radius: var(--radius-m);
  padding: var(--size-4-2);
  margin-bottom: var(--size-4-2);
  border-left: 4px solid var(--interactive-accent);
}

/* Interactive elements */
.yg-button {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border: none;
  border-radius: var(--clickable-icon-radius);
  padding: var(--size-4-2) var(--size-4-4);
  cursor: pointer;
  font-size: var(--font-ui-small);
}

.yg-button:hover {
  background: var(--interactive-accent-hover);
}

/* Form elements */
.yg-input {
  background: var(--color-base-25);
  border: 1px solid var(--color-base-30);
  border-radius: var(--radius-s);
  padding: var(--size-4-2);
  color: var(--text-normal);
}

.yg-input:focus {
  border-color: var(--color-accent);
  outline: none;
}

/* Modal styling */
.yg-modal {
  background: var(--modal-background);
  border: var(--modal-border-width) solid var(--modal-border-color);
  border-radius: var(--modal-radius);
  padding: var(--size-4-4);
}

/* Dark theme specific */
.theme-dark .yg-event-item {
  background: var(--color-base-25);
  border-color: var(--color-base-35);
}

/* Responsive design */
@media (max-width: 768px) {
  .yg-calendar {
    grid-template-columns: 1fr;
    gap: var(--size-4-2);
  }

  .yg-event-item {
    padding: var(--size-4-1);
  }
}

/* Animations */
@keyframes yg-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.yg-fade-in {
  animation: yg-fade-in 0.3s ease-out;
}
```

### Using Obsidian's Built-in Components

Leverage built-in component styles for consistency:

```css
/* Button styling to match Obsidian */
.yg-button {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
  border-radius: var(--clickable-icon-radius);
  padding: var(--size-4-2) var(--size-4-4);
  font-size: var(--font-ui-small);
  cursor: pointer;
}

/* Modal matching Obsidian style */
.yg-modal {
  background: var(--modal-background);
  border: var(--modal-border-width) solid var(--modal-border-color);
  border-radius: var(--modal-radius);
  box-shadow: var(--shadow-l);
}

/* Settings item style */
.yg-setting {
  padding: var(--size-4-3) 0;
  border-bottom: 1px solid var(--color-base-30);
}

.yg-setting:last-child {
  border-bottom: none;
}

/* Icon buttons */
.yg-icon-button {
  width: var(--size-4-6);
  height: var(--size-4-6);
  padding: var(--size-4-1);
  border-radius: var(--clickable-icon-radius);
  cursor: pointer;
  opacity: var(--icon-opacity);
}

.yg-icon-button:hover {
  background: var(--color-base-30);
  opacity: var(--icon-opacity-hover);
}
```

Focus the component styling documentation in the Obsidian developer docs at `.claude/skills/references/obsidian-developer-docs/Reference/CSS variables/Components/`.

## Testing Guidelines

### Unit Tests

Focus on testing:
- Date calculation logic
- Input validation
- Event processing and transformation
- Utility functions
- Service layer business logic

```typescript
import { EventCalculator } from '../src/utils/eventCalculator';
import { DateValidator } from '../src/utils/dateValidator';

describe('EventCalculator', () => {
  test('calculates birthday age correctly', () => {
    const birthday = {
      eventDate: { isoDate: '1990-05-15', calendar: 'SOLAR' },
      text: 'Test Birthday',
      id: 'test-id'
    };

    const now = new Date('2024-05-16');
    const result = EventCalculator.calculateAge(birthday, now);
    expect(result).toBe(34);
  });

  test('calculates lunar date conversion', () => {
    const event = {
      eventDate: { isoDate: '1990-05-15', calendar: 'LUNAR' },
      text: 'Lunar Event',
      id: 'test-id'
    };

    const result = EventCalculator.calculateEventDates(event, 2024);
    expect(result.dateArr).toContain('2024-06-20');
  });
});

describe('DateValidator', () => {
  test('validates correct ISO date format', () => {
    expect(DateValidator.isValidISODate('2024-12-25')).toBe(true);
    expect(DateValidator.isValidISODate('2024-02-30')).toBe(false); // Invalid date
    expect(DateValidator.isValidISODate('12/25/2024')).toBe(false); // Wrong format
  });
});
```

### Mocking Obsidian API

```typescript
// Mock plugin instance
const createMockPlugin = () => ({
  app: {
    vault: {
      read: jest.fn().mockResolvedValue('file content'),
      write: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue({ path: 'new-file.md' }),
      getFiles: jest.fn().mockReturnValue([]),
    },
    workspace: {
      getActiveFile: jest.fn().mockReturnValue(null),
      openLinkText: jest.fn().mockResolvedValue(undefined),
      getRightLeaf: jest.fn().mockReturnValue({
        setViewState: jest.fn().mockResolvedValue(undefined),
      }),
      revealLeaf: jest.fn(),
    },
    metadataCache: {
      getFileCache: jest.fn().mockReturnValue(null),
    },
  },
  settings: DEFAULT_CONFIG,
  saveSettings: jest.fn().mockResolvedValue(undefined),
  loadSettings: jest.fn().mockResolvedValue(undefined),
} as any);

// Mock Obsidian classes
jest.mock('obsidian', () => ({
  Plugin: class {},
  Modal: class {
    contentEl = { empty: jest.fn(), createEl: jest.fn() };
    open = jest.fn();
    close = jest.fn();
  },
  Setting: class {
    setName = jest.fn().mockReturnThis();
    setDesc = jest.fn().mockReturnThis();
    addText = jest.fn().mockReturnThis();
    addToggle = jest.fn().mockReturnThis();
    addButton = jest.fn().mockReturnThis();
  },
  Notice: jest.fn(),
}));
```

### Test Structure

```typescript
describe('Component: YearlyCalendar', () => {
  let plugin: YearlyGlancePlugin;
  let container: HTMLElement;

  beforeEach(() => {
    plugin = createMockPlugin();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  test('renders calendar grid', () => {
    const calendar = new YearlyCalendar(container, plugin);
    calendar.render();

    const grid = container.querySelector('.yg-calendar-grid');
    expect(grid).toBeTruthy();
    expect(grid.children.length).toBe(12); // 12 months
  });

  test('displays events in correct dates', () => {
    plugin.settings.data.events.holidays = [{
      id: 'test-holiday',
      text: 'Test Holiday',
      eventDate: { isoDate: '2024-12-25', calendar: 'SOLAR' },
      dateArr: ['2024-12-25']
    }];

    const calendar = new YearlyCalendar(container, plugin);
    calendar.render();

    const dec25 = container.querySelector('[data-date="2024-12-25"]');
    expect(dec25?.textContent).toContain('Test Holiday');
  });
});
```

### Integration Tests

Test component interactions:

```typescript
describe('Event management flow', () => {
  test('creating event updates calendar', async () => {
    const plugin = createMockPlugin();
    const calendar = new YearlyCalendar(container, plugin);
    const eventBusSpy = jest.spyOn(YearlyGlanceBus, 'emit');

    calendar.render();
    const initialEventCount = calendar.getAllEvents().length;

    // Create new event
    const newEvent = {
      text: 'New Event',
      eventDate: { isoDate: '2024-12-31', calendar: 'SOLAR' }
    };

    await plugin.createEvent(newEvent);

    // Verify event bus notification
    expect(eventBusSpy).toHaveBeenCalledWith('eventCreated', expect.any(Object));

    // Verify calendar updated
    const updatedEvents = calendar.getAllEvents();
    expect(updatedEvents.length).toBe(initialEventCount + 1);
    expect(updatedEvents).toContainEqual(expect.objectContaining({
      text: 'New Event'
    }));
  });
});
```

## Development Workflow

### Setting Up Development Environment

1. **Clone repository**:
   ```bash
   git clone https://github.com/Moyf/yearly-glance.git
   cd yearly-glance
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   # Edit .env and set your vault path
   # VAULT_PATH=/path/to/your/test/vault
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

5. **Set up Hot-Reload (optional but recommended)**:
   - Install Hot-Reload plugin in Obsidian
   - Enable in test vault
   - Set plugin ID to `yearly-glance`
   - Auto-reload will trigger on build changes

6. **Initial build and copy**:
   ```bash
   npm run build:local  # Copies to vault after build
   ```

### Testing Changes

1. **Make changes to source code** in `src/`
2. **Build automatically runs** via `npm run dev` watch mode
3. **Check terminal** for TypeScript or linting errors
4. **Hot reload triggers** in Obsidian (if plugin installed)
5. **Test manually** in Obsidian development vault
6. **Check browser console** for runtime errors
7. **Verify all views** update correctly
8. **Test settings changes** persist after reload

### Debugging Techniques

1. **Enable DevTools**:
   - In Obsidian: View → Toggle Developer Tools
   - Or press `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)

2. **Debug TypeScript**:
   - Source maps are generated in dev mode
   - Set breakpoints in original `.ts` files
   - Use debugger statement: `debugger;`

3. **React DevTools**:
   - Install React Developer Tools browser extension
   - Debug component hierarchy and props
   - Profile component renders

4. **Console logging**:
   ```typescript
   console.log('Debug info:', variable);
   console.error('Error occurred:', error);
   console.warn('Warning:', warning);
   ```
   Note: Console logs are removed in production builds

5. **VS Code debugging**:
   - Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Attach to Obsidian",
         "type": "chrome",
         "request": "attach",
         "port": 9222,
         "webRoot": "${workspaceFolder}",
         "sourceMaps": true
       }
     ]
   }
   ```
   - Start Obsidian with remote debugging: `--remote-debugging-port=9222`

6. **Profile performance**:
   - Use Chrome DevTools Performance tab
   - Identify render bottlenecks
   - Check for unnecessary re-renders

### Common Pitfalls

1. **Settings not loading**: Ensure `loadData()` is awaited and merged with defaults
2. **Memory leaks**: Always clean up event listeners and intervals
3. **React not updating**: Ensure state is immutable, use spread operators
4. **Date calculations wrong**: Check timezone handling, use ISO dates
5. **Events disappearing**: Verify data is saved before view updates
6. **Type errors**: Check for `any` types, enable strict mode
7. **Mobile issues**: Avoid desktop-only APIs, test on mobile
8. **Performance issues**: Use React.memo, virtualize long lists

## Release Process

### Pre-Release Checklist

Before releasing, verify:

- [ ] All tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Production build works: `npm run build`
- [ ] Version updated in `manifest.json` and `versions.json`
- [ ] Changelog updated with new features/fixes
- [ ] README.md updated if needed
- [ ] Translations updated (i18n files)
- [ ] Test in clean vault
- [ ] Test on mobile (if applicable)
- [ ] Verify settings persist
- [ ] Check performance with many events
- [ ] Verify all views open correctly
- [ ] Test import/export functionality

### Creating a Release

1. **Prepare release**:
   ```bash
   npm run release:pre
   # This runs: build → version bump → changelog update
   ```

2. **Review changes**:
   ```bash
   git diff  # Check all modified files
   git add .
   ```

3. **Commit and tag**:
   ```bash
   git commit -m "release: version x.y.z"
   npm run release:tag  # Creates git tag
   ```

4. **Push to GitHub**:
   ```bash
   git push origin master
   git push origin --tags
   ```

5. **Create GitHub release**:
   - Go to GitHub repository
   - Click "Releases" → "Draft a new release"
   - Select the new tag
   - Add release notes from CHANGELOG.md
   - Attach assets:
     - `main.js`
     - `manifest.json`
     - `styles.css` (if present)
   - Publish release

6. **Submit to community plugins** (first time only):
   - Fork https://github.com/obsidianmd/obsidian-releases
   - Add plugin to `community-plugins.json`
   - Create PR with plugin information

### Version Management

- Use **Semantic Versioning** (x.y.z):
  - `x` - Major: Breaking changes
  - `y` - Minor: New features
  - `z` - Patch: Bug fixes

- Update in these files:
  - `manifest.json` - Main version
  - `manifest-beta.json` - Beta version
  - `versions.json` - Version history with minAppVersion
  - `package.json` - Node.js version

- Tag format: `x.y.z` (no leading 'v')
- Keep `minAppVersion` accurate when using new APIs

## Common Development Patterns

### Adding New Event Types

1. **Define type** in `src/type/Events.ts`:
   ```typescript
   export interface Anniversary extends BaseEvent {
     type: 'anniversary';
     spouseName?: string;
   }
   ```

2. **Update Events interface**:
   ```typescript
   export interface Events {
     holidays: Holiday[];
     birthdays: Birthday[];
     customEvents: CustomEvent[];
     anniversaries: Anniversary[]; // Add new array
   }
   ```

3. **Add default values**:
   ```typescript
   export const DEFAULT_EVENTS: Events = {
     holidays: [],
     birthdays: [],
     customEvents: [],
     anniversaries: [], // Initialize empty
   };
   ```

4. **Update calculator logic** in `eventCalculator.ts`:
   ```typescript
   static calculateEventDates(event: Anniversary, year: number): string[] {
     // Special calculation for anniversaries
     if (event.type === 'anniversary') {
       return this.calculateAnniversary(event, year);
     }
     // ... other logic
   }
   ```

5. **Update validation** in `dateValidator.ts`
6. **Add UI components** for managing the new type
7. **Update i18n** translations
8. **Add icons/colors** in `EVENT_TYPE_DEFAULT`

### Adding Import/Export Formats

1. **Create service** in `src/service/`:
   ```typescript
   export class CSVService {
     static export(events: Events): string {
       const rows = [];
       rows.push(['Type', 'Date', 'Text', 'Description'].join(','));

       // Add all events
       [...events.holidays, ...events.birthdays, ...events.customEvents].forEach(event => {
         rows.push([
           event.type,
           event.eventDate.isoDate,
           `"${event.text}"`,
           `"${event.remark || ''}"`
         ].join(','));
       });

       return rows.join('\n');
     }

     static import(csv: string): Events {
       const lines = csv.split('\n');
       const events = DEFAULT_EVENTS;

       // Skip header row
       for (let i = 1; i < lines.length; i++) {
         const [type, date, text, description] = lines[i].split(',');
         // Parse and add to appropriate array
         // ...
       }

       return events;
     }
   }
   ```

2. **Update DataPortManager** component:
   ```typescript
   const formatOptions = [
     { value: 'json', label: 'JSON', extensions: ['.json'] },
     { value: 'csv', label: 'CSV', extensions: ['.csv'] }, // Add new format
     { value: 'ical', label: 'iCalendar', extensions: ['.ics'] },
     { value: 'markdown', label: 'Markdown', extensions: ['.md'] },
   ];
   ```

3. **Add file filters** and format detection
4. **Handle encoding** issues (UTF-8, BOM)
5. **Add validation** for imported data

### Creating Reusable Components

Follow these patterns for new components:

```typescript
// src/components/Base/NewComponent.tsx
import { cn } from '@/src/utils/classNames';

interface NewComponentProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  value,
  onChange,
  className,
  disabled = false,
  placeholder
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={cn('yg-new-component', className, { disabled })}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="yg-new-component-input"
      />
    </div>
  );
};

// Use in other components
import { NewComponent } from '@/src/components/Base/NewComponent';

const ParentComponent: React.FC = () => {
  const [value, setValue] = useState('');

  return (
    <NewComponent
      value={value}
      onChange={setValue}
      placeholder="Enter value..."
      className="custom-class"
    />
  );
};
```

## Performance Best Practices

### Optimization Techniques

1. **Cache expensive calculations**:
   ```typescript
   const calculateEventDates = useMemo(() => {
     return EventCalculator.calculateForYear(year);
   }, [year, events]);
   ```

2. **Use React.memo for components**:
   ```typescript
   const EventItem = React.memo(({ event, onClick }: EventItemProps) => {
     return (
       <div onClick={onClick}>
         {event.text}
       </div>
     );
   });
   ```

3. **Virtualize long lists**:
   Use libraries like `react-window` or `react-virtualized` for lists with 100+ items

4. **Batch state updates**:
   ```typescript
   // Instead of multiple setState
   setEvents([...events, newEvent]);
   setHasChanges(true);
   setLastModified(Date.now());

   // Batch them
   const updates = {
     events: [...events, newEvent],
     hasChanges: true,
     lastModified: Date.now()
   };
   applyUpdates(updates);
   ```

5. **Defer heavy operations**:
   ```typescript
   useEffect(() => {
     const timer = setTimeout(() => {
       performHeavyCalculation();
     }, 100);

     return () => clearTimeout(timer);
   }, [dependency]);
   ```

6. **Register events properly for cleanup**:
   Always use `this.registerEvent()` instead of direct subscriptions

7. **Avoid large in-memory structures**:
   - Process files as streams when possible
   - Use pagination or virtual scrolling
   - Clear caches when not needed

### Mobile Performance

- Test on actual devices, not just emulators
- Reduce animations on mobile
- Optimize images and icons
- Minimize DOM nodes
- Avoid excessive re-renders

## Mobile Considerations

### Mobile-Specific Code

```typescript
// Check if mobile
import { Platform } from 'obsidian';

if (Platform.isMobile) {
  // Use mobile-friendly UI
  this.showMobileView();
} else {
  // Use desktop UI
  this.showDesktopView();
}

// Set isDesktopOnly in manifest if needed
{
  "id": "yearly-glance",
  "isDesktopOnly": false  // Set true for desktop-only features
}
```

### Mobile UI Patterns

- Larger touch targets (min 44x44pt)
- Simplified navigation
- Reduce hover effects
- Optimize for small screens
- Test gestures and swipes

### Mobile API Limitations

- Some Node.js APIs unavailable
- File system access limited
- Reduced memory/storage
- Slower processing power

## Security and Privacy

### Best Practices

1. **Never send vault contents without explicit consent**
2. **Disclose network usage clearly** in README and settings
3. **Opt-in for analytics/telemetry**, never default on
4. **Don't execute remote code** (eval, Function constructor)
5. **Validate all inputs** (filenames, user input, imported data)
6. **Escape HTML** when rendering user content
7. **Don't expose API keys** in client-side code
8. **Follow Obsidian Developer Policies**

### Network Requests

```typescript
// Always ask for permission
if (!plugin.settings.allowNetworkAccess) {
  new Notice('Network access is disabled in settings');
  return;
}

// Clear disclosure
// Example: "This feature downloads holiday data from example.com"
```

### Data Collection

If collecting usage data:
```typescript
// Document in README.md
## Privacy
This plugin collects anonymous usage statistics to improve the product.
You can opt-out in settings at any time.

// Make it opt-in
const DEFAULT_SETTINGS = {
  // ... other settings
  allowAnalytics: false, // Default to false
};
```

## Troubleshooting

### Plugin Won't Load

**Symptoms**: Plugin doesn't appear in community plugins list

**Checklist**:
- [ ] `manifest.json` is valid JSON (no trailing commas)
- [ ] `main.js` exists in plugin folder
- [ ] Plugin ID matches folder name: `/.obsidian/plugins/yearly-glance/`
- [ ] `minAppVersion` is not higher than installed Obsidian version
- [ ] Check console for errors: `View → Toggle Developer Tools`
- [ ] Verify file permissions on plugin folder
- [ ] Try restarting Obsidian

### Imports Not Found

**Error**: `Cannot find module 'obsidian'` or similar

**Solutions**:
1. Run `npm install` in project root
2. Check `tsconfig.json` paths configuration
3. Verify `import` statements use correct paths
4. Ensure `@types/obsidian` is installed
5. Restart TypeScript language server in VS Code

### Commands Not Appearing

**Symptoms**: Commands don't show in command palette

**Checklist**:
- [ ] `addCommand` is called in `onload()` (not constructor)
- [ ] Command IDs are unique
- [ ] Plugin is enabled in community plugins
- [ ] Restart Obsidian after changes
- [ ] Check for errors in console
- [ ] Verify plugin loaded successfully

### Settings Not Saving

**Symptoms**: Settings reset after reload

**Checklist**:
- [ ] `saveData()` is awaited: `await this.saveData(this.settings)`
- [ ] Settings object is serializable (no functions, classes)
- [ ] No circular references in settings
- [ ] Default settings merged correctly
- [ ] Check plugin folder permissions
- [ ] Look for errors in console when saving

### React Components Not Rendering

**Symptoms**: Blank view or errors in console

**Checklist**:
- [ ] React is properly mounted in `onOpen()`
- [ ] `createRoot()` called on valid HTML element
- [ ] Component imports are correct
- [ ] `StrictMode` wrapper is present
- [ ] Check console for React errors
- [ ] Verify CSS is loaded
- [ ] Ensure proper cleanup in `onClose()`

### Build Errors

**Common errors and solutions**:

```bash
# SyntaxError: Cannot use import statement outside module
Solution: Check file extension is .ts/.tsx, not .js

# Type 'X' is not assignable to type 'Y'
Solution: Add proper type annotations, check compatibility

# Cannot find module
Solution: Run npm install, check import paths

# Property 'X' does not exist on type
Solution: Add type declaration or cast to correct type
```

### Performance Issues

**Calendar rendering slowly**:
- Limit number of displayed events per day
- Use virtual scrolling for month view
- Cache calculated dates
- Debounce user input

**Startup time slow**:
- Defer heavy calculations
- Lazy load views until opened
- Minimize initial data loading

**Memory usage high**:
- Clean up event listeners properly
- Remove unused references
- Limit cached data size

### Mobile-Specific Issues

**Keyboard not appearing**:
- Ensure inputs have proper types
- Check if element is focused programmatically

**Touch events not working**:
- Use proper touch event handlers
- Check for CSS `touch-action` conflicts
- Verify element is not covered by other elements

**Layout broken on small screens**:
- Add responsive CSS breakpoints
- Test with different screen sizes
- Use relative units (%, rem, vw)

### Data Migration Issues

**After plugin update**:
- Check `migrateData.ts` for proper version handling
- Ensure backward compatibility
- Test migration from old versions
- Log migration steps to console

## Design and UX Guidelines

### UI Principles

1. **Follow Obsidian patterns**: Use similar UI to core Obsidian
2. **Consistent with theme**: Respect user's theme choices
3. **Mobile-friendly**: Work on all devices
4. **Accessible**: Support keyboard navigation and screen readers
5. **Fast**: Respond quickly to interactions
6. **Intuitive**: Don't make users think
7. **Error-tolerant**: Prevent errors when possible, handle gracefully

### Text and Copy

- Use **sentence case** for headings, buttons, and labels
- Use clear, action-oriented imperatives
- Use **bold** for literal UI labels
- Use arrow notation for navigation: **Settings → Community plugins**
- Keep text short and jargon-free
- Provide helpful tooltips

### Visual Hierarchy

- Use consistent spacing
- Group related items
- Use typography to indicate importance
- Highlight primary actions
- Use appropriate contrast

## Helpful Resources

### Official Documentation

- [Obsidian Developer Docs](https://docs.obsidian.md)
- [Obsidian TypeScript API Reference](https://docs.obsidian.md/Reference/TypeScript+API)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Plugin Guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Developer Policies](https://docs.obsidian.md/Developer+policies)

### Community Resources

- [Community Forum](https://forum.obsidian.md/c/developers-api/14)
- [Discord #plugin-dev](https://discord.gg/obsidianmd)
- [Share & Showcase](https://forum.obsidian.md/c/share-showcase/9)
- [Plugin Ideas](https://forum.obsidian.md/c/plugin-ideas/11)

### Development Tools

- [Hot-Reload](https://github.com/pjeby/hot-reload)
- [Obsidian Debugger](https://github.com/hipstersmoothie/obsidian-debugger)
- [Plugin Dev Tools](https://github.com/sponsors/hipstersmoothie)
- [TypeScript Config](https://www.typescriptlang.org/tsconfig/)

### Documentation in Repository

This skill references documentation in:
- `.claude/skills/references/AGENTS.md` - Community plugin development guide
- `.claude/skills/references/obsidian-developer-docs/` - Complete Obsidian documentation mirror
  - `Plugins/Getting started/` - Plugin basics
  - `Plugins/User interface/` - UI components
  - `Plugins/Guides/Build a Bases view.md` - Creating custom Bases views
  - `Reference/CSS variables/` - Styling reference
  - `Reference/TypeScript API/` - API reference
- `.claude/skills/references/BASES_REFERENCE.md` - Comprehensive guide to Bases plugin system
  - Bases syntax and YAML structure
  - Creating custom Bases views
  - Formula and function reference
  - Best practices for view development

For detailed information on specific topics, refer to these documentation files.
