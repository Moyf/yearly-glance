# Bases Reference Guide

This document provides comprehensive information about Obsidian Bases, a powerful plugin for creating dynamic views of your notes. This guide covers both the core concepts of Bases and how to develop custom Bases views.

## What are Bases?

Bases is a core Obsidian plugin that displays dynamic views of your notes as tables, cards, lists, and more. Unlike static note collections, Bases automatically update based on filters, formulas, and your vault's content.

**Key Features:**
- Dynamic note collections based on filters and properties
- Multiple view layouts (table, cards, list, map)
- Formula-based calculated properties
- Real-time updates as your vault changes
- Plugin-extensible with custom views

## Bases File Structure

Bases are saved as `.base` files with YAML syntax. Here's the complete structure:

```yaml
# Base configuration
filters:                          # Global filters applied to all views
  or:
    - file.hasTag("tag")
    - and:
        - file.hasTag("book")
        - file.hasLink("Textbook")
    - not:
        - file.hasTag("book")
        - file.inFolder("Required Reading")

formulas:                         # Custom formula properties
  formatted_price: 'if(price, price.toFixed(2) + " dollars")'
  ppu: "(price / age).toFixed(2)"

properties:                       # Property display configuration
  status:
    displayName: Status
  formula.formatted_price:
    displayName: "Price"
  file.ext:
    displayName: Extension

summaries:                        # Custom summary formulas
  customAverage: 'values.mean().round(3)'

views:                            # View configurations
  - type: table
    name: "My table"
    limit: 10
    groupBy:
      property: note.age
      direction: DESC
    filters:                        # View-specific filters
      and:
        - 'status != "done"'
        - or:
            - "formula.ppu > 5"
            - "price > 2.1"
    order:                          # Sort order
      - file.name
      - file.ext
      - note.age
      - formula.ppu
      - formula.formatted_price
    summaries:                      # Property summaries
      formula.ppu: Average
```

## Core Components

### Filters

Filters determine which notes appear in your Base. They can be applied globally (affecting all views) or per-view.

**Filter Structure:**
```yaml
filters:
  or:           # Logical OR
    - condition1
    - condition2
  and:          # Logical AND
    - condition1
    - condition2
  not:          # Logical NOT
    - condition
```

**Filter Types:**

1. **Basic Comparisons:**
   ```yaml
   - 'note.property > 10'
   - 'note.status == "active"'
   - 'note.tags contains "important"'
   ```

2. **File Functions:**
   ```yaml
   - file.hasTag("book")
   - file.hasLink("[[Note]]")
   - file.inFolder("folder/path")
   - file.ext == "md"
   ```

3. **Property Checks:**
   ```yaml
   - note.price > 0
   - note.status != "done"
   - note.tags.length > 0
   ```

### Formulas

Formulas create calculated properties that can be used across all views.

**Formula Structure:**
```yaml
formulas:
  formula_name: "calculation expression"
```

**Property References:**
- `note.property` - Note frontmatter properties
- `file.property` - File metadata (size, ext, name, etc.)
- `formula.other_formula` - Other formula properties
- No prefix defaults to `note.property`

**Example Formulas:**
```yaml
formulas:
  # Basic arithmetic
  total: "price * quantity"

  # String formatting
  display_name: 'first_name + " " + last_name'

  # Conditional logic
  status_class: 'if(due_date < now(), "overdue", "active")'

  # Date calculations
  days_until_due: "(due_date - now()).days"

  # Array operations
  tag_count: "tags.length"
```

**Important Notes:**
- Formulas are stored as strings in YAML
- Use single quotes for formulas containing double quotes
- Output type is determined by calculation result
- Avoid circular references between formulas

### Properties

The `properties` section configures how properties display in views:

```yaml
properties:
  note.priority:
    displayName: "Priority Level"  # Custom display name

  formula.total_price:
    displayName: "Total"

  file.name:
    displayName: "Filename"
```

**Note:** Display names are for presentation only and cannot be used in filters or formulas.

### Views

Views define how your filtered data is presented. Each view can have its own filters, sorting, and grouping.

**View Structure:**
```yaml
views:
  - type: table          # View type: table, list, cards, map
    name: "View Name"    # Display name
    limit: 50            # Maximum items to show
    groupBy:             # Grouping configuration
      property: note.tag
      direction: DESC
    filters: {...}       # View-specific filters
    order: [...]         # Sort order
    summaries: {...}     # Property summaries
```

**View Types:**

1. **Table View** (`type: table`)
   - Display notes as rows in a table
   - Columns map to properties
   - Supports sorting and column reordering

2. **List View** (`type: list`)
   - Display notes as bulleted or numbered lists
   - Configurable property display
   - Supports grouping

3. **Cards View** (`type: cards`)
   - Grid layout of cards
   - Supports images and rich content
   - Gallery-style presentation

4. **Map View** (`type: map`)
   - Display notes as pins on a map
   - Requires location data
   - Interactive map interface

**View Configuration Options:**

```yaml
views:
  - type: table
    name: "My Books"
    limit: 100                    # Max items (optional)

    # Group results
    groupBy:
      property: note.status
      direction: DESC             # DESC or ASC

    # Filters (combined with global filters using AND)
    filters:
      and:
        - note.status != "archived"
        - note.rating >= 3

    # Sort order
    order:
      - note.created_date
      - file.name
      - formula.priority_score

    # Property summaries (aggregations)
    summaries:
      note.price: Average
      note.rating: Median
      formula.total: Sum
```

### Summaries

Summaries provide aggregate calculations across all items in a view.

**Global Summaries** (apply to all views):
```yaml
summaries:
  customAverage: 'values.mean().round(3)'
```

**View-Specific Summaries**:
```yaml
views:
  - type: table
    summaries:
      note.price: Average
      note.rating: Median
      note.status: Unique         # Count unique values
```

**Default Summary Formulas:**

| Name | Input Type | Description |
|------|-----------|-------------|
| Average | Number | Mathematical mean |
| Min | Number | Smallest number |
| Max | Number | Largest number |
| Sum | Number | Sum of all numbers |
| Range | Number | Difference between Max and Min |
| Median | Number | Mathematical median |
| Stddev | Number | Standard deviation |
| Earliest | Date | Earliest date |
| Latest | Date | Latest date |
| Checked | Boolean | Count of true values |
| Unchecked | Boolean | Count of false values |
| Empty | Any | Count of empty values |
| Filled | Any | Count of non-empty values |
| Unique | Any | Count of unique values |

## Developing Custom Bases Views

### Prerequisites

- Obsidian plugin development environment
- Node.js and npm
- TypeScript knowledge
- Understanding of the Obsidian API

### Basic Setup

1. Create your plugin structure (see [[Build a plugin]] guide)
2. Keep `main.ts` minimal:

```typescript
export default class MyPlugin extends Plugin {
  async onload() {
    // Plugin setup will go here
  }
}
```

### Registering a Bases View

Use `registerBasesView()` to add your custom view:

```typescript
export const MY_VIEW_TYPE = 'my-custom-view';

export default class MyPlugin extends Plugin {
  async onload() {
    this.registerBasesView(MY_VIEW_TYPE, {
      name: 'Custom View',           // Display name
      icon: 'lucide-star',           // Lucide icon name
      factory: (controller, containerEl) => {
        new MyCustomView(controller, containerEl);
      },
      options: () => ([              // Configuration options
        {
          type: 'text',
          displayName: 'Separator',
          key: 'separator',
          default: ' - ',
        },
        {
          type: 'toggle',
          displayName: 'Show icons',
          key: 'showIcons',
          default: true,
        },
      ]),
    });
  }
}
```

**View Option Types:**

1. **Text Input** (`type: 'text'`)
   ```typescript
   {
     type: 'text',
     displayName: 'Property separator',
     key: 'separator',
     default: ' - ',
   }
   ```

2. **Toggle** (`type: 'toggle'`)
   ```typescript
   {
     type: 'toggle',
     displayName: 'Show icons',
     key: 'showIcons',
     default: true,
   }
   ```

3. **Dropdown** (`type: 'dropdown'`)
   ```typescript
   {
     type: 'dropdown',
     displayName: 'Layout',
     key: 'layout',
     default: 'horizontal',
     options: [
       { value: 'horizontal', label: 'Horizontal' },
       { value: 'vertical', label: 'Vertical' },
     ],
   }
   ```

User settings are automatically saved in the Base configuration file.

### Creating the View Class

Extend `BasesView` and implement the required functionality:

```typescript
import { BasesView, QueryController } from 'obsidian';

export class MyCustomView extends BasesView {
  readonly type = MY_VIEW_TYPE;
  private containerEl: HTMLElement;

  constructor(controller: QueryController, parentEl: HTMLElement) {
    super(controller);
    this.containerEl = parentEl.createDiv('my-custom-view');
  }

  // Called when data or configuration changes
  public onDataUpdated(): void {
    this.render();
  }

  private render(): void {
    // Clear previous content
    this.containerEl.empty();

    // Get user configuration
    const separator = this.config.get('separator') || ' - ';
    const showIcons = this.config.get('showIcons') !== false;

    // Get sort order
    const order = this.config.getOrder();

    // Render data
    for (const group of this.data.groupedData) {
      this.renderGroup(group, separator, showIcons, order);
    }
  }
}
```

### Accessing Data

The view receives data through `this.data`:

```typescript
public onDataUpdated(): void {
  // Access all entries (ungrouped)
  const allEntries = this.data.ungroupedData;

  // Access grouped entries
  for (const group of this.data.groupedData) {
    const groupName = group.key;      // Group key value
    const entries = group.entries;    // Array of entries

    for (const entry of entries) {
      // Access file information
      const file = entry.file;
      const filePath = file.path;
      const fileName = file.name;

      // Get property values
      const value = entry.getValue('property.name');
      const isEmpty = value.isEmpty();
    }
  }
}
```

### Working with Properties

**Getting Property Values:**
```typescript
// Get raw property value
const value = entry.getValue('note.price');
const value = entry.getValue('file.name');
const value = entry.getValue('formula.total');

// Check if empty
if (value.isEmpty()) {
  // Handle empty value
}

// Convert to string
const text = value.toString();

// Check type
const type = value.type;  // 'string', 'number', 'date', etc.
```

**Parsing Property IDs:**
```typescript
import { parsePropertyId } from 'obsidian';

const { type, name } = parsePropertyId('formula.total_price');
// type: 'formula', name: 'total_price'

const { type, name } = parsePropertyId('file.name');
// type: 'file', name: 'name'

const { type, name } = parsePropertyId('note.tags');
// type: 'note', name: 'tags'
```

### Rendering Content

**Basic Text Rendering:**
```typescript
el.createSpan({
  cls: 'my-view-text',
  text: value.toString()
});
```

**Using Value.renderTo():**
For rich content (links, images, icons), use the built-in renderer:

```typescript
// In an HTMLElement context
value.renderTo(el);
```

**Handling Special Properties:**

1. **File Links (File.name):**
   ```typescript
   if (name === 'name' && type === 'file') {
     const linkEl = el.createEl('a', {
       text: String(entry.file.name)
     });

     linkEl.onClickEvent((evt) => {
       if (evt.button !== 0 && evt.button !== 1) return;
       evt.preventDefault();

       const path = entry.file.path;
       const modEvent = Keymap.isModEvent(evt);
       void app.workspace.openLinkText(path, '', modEvent);
     });
   }
   ```

2. **Hover Preview:**
   Implement `HoverParent` interface for link previews:
   ```typescript
   import { BasesView, HoverParent, HoverPopover } from 'obsidian';

   export class MyView extends BasesView implements HoverParent {
     hoverPopover: HoverPopover | null;

     // ... rest of implementation

     private addHoverPreview(el: HTMLElement, filePath: string) {
       el.addEventListener('mouseover', (evt) => {
         app.workspace.trigger('hover-link', {
           event: evt,
           source: 'bases',
           hoverParent: this,
           targetEl: el,
           linktext: filePath,
         });
       });
     }
   }
   ```

### Handling Configuration

Access user-configured options:

```typescript
public onDataUpdated(): void {
  // Get configuration values
  const separator = String(this.config.get('separator')) || ' - ';
  const showIcons = Boolean(this.config.get('showIcons'));
  const maxItems = Number(this.config.get('maxItems')) || 100;

  // Get sort order
  const order = this.config.getOrder();

  // Render with configuration
  this.render(separator, showIcons, maxItems, order);
}
```

### Performance Best Practices

1. **Element Reuse:**
   ```typescript
   // Instead of emptying and recreating
   this.containerEl.empty();

   // Try to reuse existing elements
   const existingElements = this.containerEl.querySelectorAll('.item');
   // Update existing elements rather than recreating
   ```

2. **Lazy Rendering:**
   ```typescript
   // Only render visible items
   const visibleItems = items.slice(0, 100);

   // Use intersection observer for infinite scroll
   this.setupInfiniteScroll();
   ```

3. **Debounced Updates:**
   ```typescript
   private renderDebounceTimer: number | null = null;

   public onDataUpdated(): void {
     if (this.renderDebounceTimer) {
       window.clearTimeout(this.renderDebounceTimer);
     }

     this.renderDebounceTimer = window.setTimeout(() => {
       this.render();
     }, 100);
   }
   ```

4. **Efficient DOM Updates:**
   ```typescript
   // Use document fragments for batch updates
   const fragment = document.createDocumentFragment();

   for (const item of items) {
     const element = this.createItemElement(item);
     fragment.appendChild(element);
   }

   this.containerEl.appendChild(fragment);
   ```

### Best Practices for Custom Views

1. **Handle Empty States:**
   ```typescript
   if (this.data.groupedData.length === 0) {
     this.containerEl.createDiv({
       text: 'No matching files found',
       cls: 'bases-empty-state'
     });
     return;
   }
   ```

2. **Respect User Configuration:**
   - Always honor the sort order from `this.config.getOrder()`
   - Use display names from property configuration
   - Respect filter and grouping settings

3. **Error Handling:**
   ```typescript
   try {
     this.render();
   } catch (error) {
     console.error('Error rendering view:', error);
     this.containerEl.createDiv({
       text: 'Error rendering view. Check console for details.',
       cls: 'bases-error-state'
     });
   }
   ```

4. **Accessibility:**
   ```typescript
   // Use semantic HTML
   const listEl = this.containerEl.createEl('ul', { cls: 'my-view-list' });

   // Add ARIA attributes
   listEl.setAttribute('role', 'list');

   // Keyboard navigation
   listEl.addEventListener('keydown', this.handleKeyDown.bind(this));
   ```

5. **Styling:**
   - Use Obsidian's CSS variables
   - Namespace your CSS classes
   - Support both light and dark themes

   ```css
   .my-custom-view {
     --item-padding: var(--size-4-2);
   }

   .theme-dark .my-custom-view {
     --item-background: var(--color-base-25);
   }
   ```

## Function Reference

Bases includes a rich set of functions for use in formulas and filters:

### Global Functions

| Function | Description | Example |
|----------|-------------|---------|
| `escapeHTML(html)` | Escape HTML special characters | `escapeHTML("<script>")` |
| `date(string)` | Parse date from string | `date("2024-01-15")` |
| `duration(string)` | Parse duration | `duration("1d")` |
| `file(path)` | Get file object | `file("path/to/note.md")` |
| `html(string)` | Convert to HTML | `html("<b>Bold</b>")` |
| `if(condition, true, false)` | Conditional logic | `if(price > 10, "Expensive", "Cheap")` |
| `image(path)` | Create image object | `image("photo.jpg")` |
| `icon(name)` | Create icon | `icon("star")` |
| `link(path, display)` | Create link | `link("[[Note]]", "Click here")` |
| `list(element)` | Wrap in list | `list("item")` |
| `max(value1, value2, ...)` | Maximum value | `max(10, 20, 30)` |
| `min(value1, value2, ...)` | Minimum value | `min(10, 20, 30)` |

### Type-Specific Functions

Functions are also available for specific types (String, Date, Number, List, Link, File, Object, RegExp). See `.claude/skills/references/bases/Functions - Obsidian Help.md` for the complete list.

## Troubleshooting

### Common Issues

1. **View not appearing in menu:**
   - Check view type is registered correctly
   - Verify plugin is enabled and loaded
   - Restart Obsidian

2. **Data not updating:**
   - Ensure `onDataUpdated()` is called
   - Check for errors in console
   - Verify filters aren't excluding all data

3. **Property values empty:**
   - Check property name spelling
   - Verify property exists in frontmatter
   - Use `parsePropertyId()` to validate property ID

4. **Performance issues:**
   - Implement element reuse
   - Use virtualization for large datasets
   - Debounce rapid updates

### Debug Tips

```typescript
// Log data structure
console.log('Data updated:', this.data);

// Inspect entries
for (const entry of this.data.ungroupedData) {
  console.log('Entry file:', entry.file.name);
  console.log('Properties:', entry.getValue('note.tags'));
}

// Debug configuration
console.log('Config:', this.config);
console.log('Order:', this.config.getOrder());
console.log('Options:', this.config.get('separator'));
```

## Additional Resources

- `.claude/skills/references/bases/Bases syntax - Obsidian Help.md` - Complete syntax reference
- `.claude/skills/references/bases/Functions - Obsidian Help.md` - Full function documentation
- `.claude/skills/references/bases/Views - Obsidian Help.md` - View type details
- `.claude/skills/references/obsidian-developer-docs/Plugins/Guides/Build a Bases view.md` - Tutorial

## Best Practices Summary

1. **Performance:** Reuse DOM elements, implement virtualization for large lists, debounce updates
2. **User Experience:** Handle empty states gracefully, provide clear error messages, ensure accessibility
3. **Compatibility:** Use Obsidian CSS variables, respect user themes, test on mobile
4. **Maintenance:** Follow TypeScript best practices, add comments, handle edge cases
5. **Integration:** Honor sort order, use display names, respect filters and grouping

---

This reference guide provides comprehensive information for both using Bases as a user and developing custom Bases views as a plugin developer. For the most up-to-date information, refer to the official Obsidian documentation in the references folder.
