Views allow you to organize the information in a [Base](https://help.obsidian.md/bases) in multiple ways. A base can contain several views, and each view can have a unique configuration to display, sort, and filter files.

For example, you may want to create a base called "Books" that has separate views for "Reading list" and "Recently finished".

## Toolbar

At the top of a base is a toolbar that lets you interact with views and their results.

## Add and switch views

There are two ways to add a view to a base:

-   Click the view name in the top left and select ![lucide-plus.svg > icon](Views%20-%20Obsidian%20Help/lucide-plus.svg) **Add view**.
-   Use the [command palette](https://help.obsidian.md/plugins/command-palette) and select **Bases: Add view**.

The first view in your list of views will load by default. Drag views by their icon to change their order.

## View settings

Each view has its own configuration options. To edit view settings:

1.  Click the view name in the top left.
2.  Click the right arrow next to the view you want to configure.

Alternatively _right-click_ the view name in the base's toolbar to quickly access the view settings.

## Layout

Views can be displayed with different layouts including as ![lucide-table.svg > icon](Views%20-%20Obsidian%20Help/lucide-table.svg) **table**, ![lucide-list.svg > icon](Views%20-%20Obsidian%20Help/lucide-list.svg) **list**, ![lucide-layout-grid.svg > icon](Views%20-%20Obsidian%20Help/lucide-layout-grid.svg) **cards**, and ![lucide-map.svg > icon](Views%20-%20Obsidian%20Help/lucide-map.svg) **map**. Additional layouts can be added by [Community plugins](https://help.obsidian.md/community-plugins). Some layouts are still being developed and require [early access versions](https://help.obsidian.md/early-access) of Obsidian.

| Layout | Description | App version |
| --- | --- | --- |
| [Table](https://help.obsidian.md/bases/views/table) | Display files as rows in a table. Columns are populated from [properties](https://help.obsidian.md/properties) in your notes. | 1.9 |
| [Cards](https://help.obsidian.md/bases/views/cards) | Display files as a grid of cards. Lets you create gallery-like views with images. | 1.9 |
| [List](https://help.obsidian.md/bases/views/list) | Display files as a [list](https://help.obsidian.md/syntax#Lists) with bulleted or numbered markers. | 1.10 |
| [Map](https://help.obsidian.md/bases/views/map) | Display files as pins on an interactive map. Requires the Maps plugin. | 1.10 |

## Filters

Open the ![lucide-list-filter.svg > icon](Views%20-%20Obsidian%20Help/lucide-list-filter.svg) **Filter** menu at the top of a base to add filters.

A base without filters shows all the files in your vault. Filters narrow down the results to only show files that meet specific criteria. For example, you can use filters to only display files with a specific [tag](https://help.obsidian.md/tags) or within a specific folder. Many filter types are available.

Filters can be applied to all views in a base, or just a single view by choosing from the two sections in the ![lucide-list-filter.svg > icon](Views%20-%20Obsidian%20Help/lucide-list-filter.svg) **Filter** menu.

-   **All views** applies filters to all views in the base.
-   **This view** applies filters to the active view.

#### Components of a filter

Filters have three components:

1.  **Property** — lets you choose a [property](https://help.obsidian.md/properties) in your vault, including [file properties](https://help.obsidian.md/bases/syntax#File%20properties).
2.  **Operator** — lets you choose how to compare the conditions. The list of available operators depends on the property type (text, date, number, etc)
3.  **Value** — lets you choose the value you are comparing to. Values can include math and [functions](https://help.obsidian.md/bases/functions).

#### Conjunctions

-   **All the following are true** is an `and` statement — results will only be shown if _all_ conditions in the filter group are met.
-   **Any of the following are true** is an `or` statement — results will be shown if _any_ of the conditions in the filter group are met.
-   **None of the following are true** is a `not` statement — results will not be shown if _any_ of the conditions in the filter group are met.

#### Filter groups

Filter groups allow you to create more complex logic by creating combinations on conjunctions.

#### Advanced filter editor

Click the code button ![lucide-code-xml.svg > icon](Views%20-%20Obsidian%20Help/lucide-code-xml.svg) to use the **advanced filter** editor. This displays the raw [syntax](https://help.obsidian.md/bases/syntax) for the filter, and can be used with more complex [functions](https://help.obsidian.md/bases/functions) that cannot be displayed using the point-and-click interface.

## Sort and group results

Open the ![lucide-arrow-up-down.svg > icon](Views%20-%20Obsidian%20Help/lucide-arrow-up-down.svg) **Sort** menu to sort and group the results in a view.

You can arrange results by one or more properties in ascending or descending order. This makes it easy to list notes by name, last edited time, or any other property — including formulas.

You can also group results by a property to organize similar items into visually distinct sections. Currently, Obsidian supports grouping by only one property.

### Add a sort

The options for ordering results depend on the property type:

-   **Text**: sort _alphabetically_ (A→Z) or in _reverse alphabetical order_ (Z→A).
-   **Number**: sort from _smallest to largest_ (0→1) or _largest to smallest_ (1→0).
-   **Date and time**: sort by _old to new_, or _new to old_.

### Remove a sort

## Limit, copy, and export results

### Limit results

The _results_ menu shows the number of results in view. Click the results button to limit the number of results, and access additional actions.

### Copy to clipboard

This action copies the view to your clipboard. Once in your clipboard you can paste it into a Markdown file, or into other document apps including spreadsheets like Google Sheets, Excel, and Numbers.

### Export CSV

This action saves a CSV of your current view.

## Embed a view

You can embed base files in [any other file](https://help.obsidian.md/embeds) using the `![[File.base]]` syntax. The first view in the list will be used. You can change the order by dragging views in the view menu.

To specify the default view for an embed use `![[File.base#View]]`.