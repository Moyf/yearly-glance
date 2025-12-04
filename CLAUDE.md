# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yearly Glance is an Obsidian plugin that provides a visual and customizable overview of annual events. It supports holidays, birthdays, and custom events with features like lunar calendar support and multi-language (English, Chinese simplified/traditional).

## Development Commands

### Building and Running
- **Development mode**: `npm run dev` - Starts TypeScript compilation in watch mode with esbuild
- **Production build**: `npm run build` - Type checks and builds the plugin
- **Local development**: `npm run build:local` - Builds and automatically copies to your vault (requires `.env` file with `VAULT_PATH`)

### Testing and Linting
- **Run tests**: `npm test` - Runs Jest tests
- **Watch tests**: `npm run test:watch` - Runs tests in watch mode
- **Lint**: `npm run lint` - Runs ESLint on TypeScript files
- **Fix lint issues**: `npm run lint:fix` - Runs ESLint with auto-fix

### Release Management
- **Version bump**: `npm run version` - Updates version across all manifest files
- **Generate changelog**: `npm run changelog:u` - Updates changelog with new commits (conventional commits)
- **AI-translated changelog**: `npm run changelog:uT` - Generates English and Chinese changelogs using AI translation (requires API key in `.env`)

## Architecture

### Core Plugin Structure

The plugin follows Obsidian's standard plugin architecture with React components for UI rendering:

- **Entry point**: `src/main.ts` - Plugin lifecycle management, command registration, and view registration
- **Views**:
  - `YearlyGlanceView` - The main calendar view registered as an Obsidian leaf view (`VIEW_TYPE_YEARLY_GLANCE`)
  - `GlanceManagerView` - Event management interface (`VIEW_TYPE_GLANCE_MANAGER`)
- **Settings**: `YearlyGlanceSettingsTab` - Plugin settings integration with Obsidian settings panel

### Type System

Located in `src/type/`:
- **Events**: Strongly-typed interfaces for `Holiday`, `Birthday`, and `CustomEvent` extending `BaseEvent`
- **EventDate**: Unified date handling with support for both solar and lunar calendar dates
- **Config**: Centralized configuration management

### Data Storage

Events are stored in three separate arrays within the plugin settings:
- `events.holidays[]` - Holiday events with optional `foundDate` for anniversary calculation
- `events.birthdays[]` - Birthday events with calculated `age`, `zodiac`, and `animal` attributes
- `events.customEvents[]` - User-defined events with `isRepeat` flag

### Event Processing Pipeline

1. **Date Calculation**: `EventCalculator` class computes actual dates for the current year, handling:
   - Solar/lunar calendar conversion via `lunarLibrary.ts`
   - Repeating events (yearly recurrence)
   - Birthday age and zodiac calculations

2. **Date Validation**: `dateValidator.ts` ensures all dates are properly formatted and valid

3. **Event Display**: `YearlyCalendar` React component renders events using calculated dates

### Key Utilities

- **i18n**: Multi-language support with English (`en.ts`), simplified Chinese (`zh.ts`), and traditional Chinese (`zh-TW.ts`)
- **Unique IDs**: `generateEventId()` creates consistent IDs across sessions
- **Migration**: `MigrateData` utility handles versioning and data format upgrades
- **Event Bus**: `YearlyGlanceBus` enables inter-component communication

### UI Components

React-based component architecture in `src/components/`:
- **Base components**: Reusable UI primitives (Button, Input, Select, etc.)
- **DataPort**: Import/export functionality (JSON, Markdown, iCalendar formats)
- **EventForm**: Modal-based event creation/editing
- **EventManager**: List-based event management interface
- **YearlyCalendar**: Main calendar rendering component

### Build System

Custom build scripts in `scripts/`:
- **esbuild.config.mjs**: Handles TypeScript compilation and React JSX transformation
- **copy-to-vault.mjs**: Automates plugin deployment to local Obsidian vault
- **version-bump.mjs**: Synchronizes version across all manifest files

## Obsidian Plugin Integration

The plugin registers:
- **Commands**: Multiple commands accessible via command palette for opening views and managing events
- **Ribbon icon**: Telescope icon for quick access to main view
- **Settings tab**: Integration with Obsidian's settings system
- **Leaf views**: Custom views that integrate with Obsidian's workspace system

## Testing Strategy

- Unit tests focus on date calculation and validation logic
- Jest configuration supports TypeScript and ES modules
- Test files located near the code they test (following `*.test.ts` pattern)
