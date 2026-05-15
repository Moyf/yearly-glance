# Development Patterns

## Adding a New Setting

1. **Define in interface** (`src/type/Settings.ts`):
   ```typescript
   export interface YearlyGlanceSettings {
     // ... existing fields
     myNewSetting: "option1" | "option2" | "option3";
   }
   ```

2. **Set default** (`src/type/Settings.ts`):
   ```typescript
   export const DEFAULT_SETTINGS: YearlyGlanceSettings = {
     // ... existing defaults
     myNewSetting: "option1",
   };
   ```

3. **Add i18n keys** (all 3 locale files in `src/i18n/locales/`):
   ```typescript
   setting: {
     general: {
       myNewSetting: {
         name: "Setting Name",
         desc: "Setting description",
         options: { option1: "Option 1", ... }
       }
     }
   }
   ```

4. **Add UI in ViewSettings.tsx**:
   ```tsx
   <SettingsItem name={t("setting.general.myNewSetting.name")} desc={...}>
     <Select options={...} value={config.myNewSetting} onValueChange={...} />
   </SettingsItem>
   ```

5. **Data migration** (if needed): Update `MigrateData.migrateV2()` in `src/utils/migrateData.ts`

## Adding Event Bus Topic

1. Add to `RefreshTopic` type in `src/hooks/useYearlyGlanceConfig.ts`
2. Subscribe in relevant components via `YearlyGlanceBus.subscribeTopics([...], callback)`
3. Publish where data changes: `YearlyGlanceBus.publish('my-topic')`

## Color System

- Preset colors defined in `DEFAULT_PRESET_COLORS` (Settings.ts)
- Each has: `{ label: string, value: string (hex), enable: boolean, id?: string }`
- Built-in colors have `id` (e.g., "red", "blue") → label displayed via `t("data.color.${id}")`
- Custom colors have no `id` → label is user-editable

## Birthday Translation Pattern

The `birthday.ts` file maps Chinese characters to i18n keys:
- `ANIMAL[]`: `{ name: "鼠", i18nKey: "data.animal.rat" }`
- `ZODIAC[]`: `{ name: "摩羯", i18nKey: "data.zodiac.capricorn" }`
- `getBirthdayTranslation(name, type)` → looks up Chinese name → returns translated string

**Current issue**: `eventCalculator.ts` calls `getBirthdayTranslation()` which returns the TRANSLATED string and stores it in `birthday.zodiac`/`birthday.animal` fields in data.json. This means stored values change with language.

**Fix approach**: Store the i18n KEY (or English identifier) in data.json, translate at display time only.

## File Watcher Pattern (Obsidian API)

```typescript
// In plugin onload():
this.registerEvent(
  this.app.metadataCache.on("changed", (file: TFile) => {
    // Check if file is in watched folder
    if (file.path.startsWith(watchedFolder)) {
      YearlyGlanceBus.publish('bases-data');
    }
  })
);
```

## Modal Pattern

```typescript
class MyModal extends Modal {
  private root: Root | null = null;
  
  onOpen() {
    const { contentEl } = this;
    this.root = createRoot(contentEl);
    this.root.render(<MyComponent />);
  }
  
  onClose() {
    this.root?.unmount();
  }
}
```

## Settings Group Pattern

Settings are organized in `SettingsBlock` components:
```tsx
<SettingsBlock name={...} desc={...} collapsible defaultCollapsed={false}>
  <SettingsItem name={...} desc={...}>
    <Toggle/Select/Input ... />
  </SettingsItem>
</SettingsBlock>
```
