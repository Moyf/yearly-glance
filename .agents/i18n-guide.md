# i18n Guide

## File Locations

- `src/i18n/i18n.ts` - Singleton I18n class, exports `t()` function
- `src/i18n/types.ts` - TypeScript type definitions for all translation keys
- `src/i18n/birthday.ts` - Birthday-specific translations (zodiac, animal, ganzhi)
- `src/i18n/locales/en.ts` - English translations
- `src/i18n/locales/zh.ts` - Simplified Chinese translations
- `src/i18n/locales/zh-TW.ts` - Traditional Chinese translations

## Usage

```typescript
import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";

// Simple usage
t("view.yearlyGlance.name")

// With parameters
t("view.eventManager.actions.deleteConfirm", { name: event.text })

// Dynamic key (cast needed)
t(`setting.general.viewType.options.${viewType}` as TranslationKeys)
```

## Adding New Keys

1. Add to ALL locale files (`en.ts`, `zh.ts`, `zh-TW.ts`) - same nested structure
2. Add type definition in `src/i18n/types.ts` at the corresponding path
3. Keys are flattened at runtime with dot notation

## Key Structure

```
setting.                    → Settings UI strings
  general.{settingName}.name/desc/options
  group.{groupName}.name/desc
view.                       → View UI strings
  yearlyGlance./eventManager./basesView.
command.                    → Command palette strings
data.                       → Data display strings
  month./week./animal./zodiac./gan./zhi./color.
```

## Preset Color Labels

Built-in colors use `id` field for i18n lookup:
- `data.color.red` / `data.color.blue` / etc.
- Colors with `id` have their label auto-translated
- Custom colors (no `id`) store user-input label directly

## Birthday Zodiac/Animal

Current flow:
1. `EventCalculator` computes zodiac using lunar-javascript library
2. Gets Chinese char result (e.g., "摩羯")
3. Calls `getBirthdayTranslation("摩羯", "zodiac")` which looks up i18n key and returns translated string
4. Stores translated string in `birthday.zodiac` field

**Problem**: The stored value is locale-dependent. Switching language causes data to contain mixed-language values.
