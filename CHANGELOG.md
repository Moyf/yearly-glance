## [4.0.0-beta.1](https://github.com/Moyf/yearly-glance/compare/3.2.0...4.0.0-beta.1) (2025-04-29) (Pre Release)

## 🎉 Major Release — v4.0

This release is a significant upgrade focusing on **Daily Note Events**, **Note Event Path Formatting**, **Context Menus**, and a comprehensive UI/UX overhaul across all views.

### English

#### 🚀 Added

- **Daily Note Events**: Full lifecycle support — create, edit, delete events stored in daily note frontmatter properties. Events are read from the daily note's property list and displayed on the calendar alongside other event types.
- **Daily Note Date Migration**: When editing a daily note event and changing its date, the event is automatically moved from the old daily note file to the new one (creating the file if needed).
- **Note Event File Name Format**: New setting `basesEventFileNameFormat` allows configuring how note event files are named using `{event_name}` placeholder and moment.js date tokens (YYYY, MM, DD, etc.). Supports `[literal]` brackets and nested subdirectories. Live preview in settings.
- **Right-Click Context Menu**: Right-clicking an event shows a native Obsidian menu with "Edit", "Open Note" (for note-based events), and "Delete" options.
- **Delete Button in Edit Modal**: A delete button in the bottom-left of the edit form allows direct event deletion with confirmation dialog. Supports all event types (config events removed from data, note events trashed, daily note events removed from frontmatter).
- **Remember Last Event Type**: The event creation form remembers your last selected event type (customEvent, basesEvent, dailyNoteEvent, etc.) and defaults to it next time.
- **Color Selector Circle Hints**: Preset color dropdown now shows a colored circle before each option label for quick visual identification.
- **NavTabs Responsive Emoji Mode**: Event type tabs show emoji + text at normal width, and collapse to emoji-only when space is insufficient (via container query).
- **Multi-Day Event Support**: Events can span multiple days with duration field, displayed with connected borders across day cells.
- **Bases View Integration**: Full integration with Obsidian Bases — use `.base` files to create filtered calendar views with customizable property mapping.
- **Date Validation**: Invalid dates like `2026-04-220` are now properly rejected with error messages.

#### ⚡ Changed

- **Simplified "From Note" Display**: Event preview tooltip now shows only the filename (e.g., `my-event.md`) instead of the full path. Full path shown on hover via unified Tooltip component.
- **Unified Tooltip Component**: All native `title` attributes on buttons replaced with the project's custom Tooltip component for consistent hover hint styling.
- **Title Styling**: Year number uses serif font at 1.5em with underline decoration and accent color on hover. Title aligned at baseline.
- **Event Manager Header**: Wraps to second line when space is insufficient instead of clipping buttons.
- **Event Specific Info**: Only shows attributes with meaningful values (hidden events, repeat, foundDate). No longer renders empty "Hidden: ✘" rows.
- **Calendar Legend**: Collapses to emoji-only at container width ≤600px.
- **Add Event Button**: Changed from pill-shaped accent button to circular icon button (✏️) matching adjacent action buttons.
- **Delete Button Style**: Subtle background with error-colored text instead of intense red fill.
- **DailyNote Hints in Form**: Shows specific daily note filename, property name, auto-creation warning, and date migration warning.

#### 🐛 Fixed

- **Daily Note Date Change Bug**: Changing a daily note event's date now properly migrates the property between daily note files instead of only updating the title in the old file.
- **Daily Note Creation ENOENT**: Fixed crash when creating daily note events with format paths containing subdirectories (e.g., `YYYY-MM/YYYY-MM-DD`). Now creates intermediate directories automatically.
- **Optional Fields Locked**: Fixed bug where switching away from dailyNoteEvent type in the form still kept optional fields disabled (was caused by stale `isDailyNoteEventProp` reference).
- **Context Menu Order**: Uses proper item ordering without `setSection("danger")` which caused Obsidian to reorder items.
- **i18n Interpolation**: Fixed template variables using single braces `{name}` when the system requires double braces `{{name}}`.

---

### 中文

#### 🚀 新增

- **日记事件**：完整的生命周期支持 — 创建、编辑、删除存储在日记 frontmatter 属性中的事件。从日记的属性列表读取事件并显示在年历上。
- **日记事件日期迁移**：编辑日记事件并修改日期时，事件会自动从旧日记文件迁移到新日记文件（如果新文件不存在会自动创建）。
- **笔记事件文件名格式**：新设置项 `basesEventFileNameFormat`，支持用 `{event_name}` 占位符和 moment 日期通配符（YYYY、MM、DD 等）定义文件路径。支持 `[字面量]` 括号和嵌套子目录，设置页实时预览。
- **右键菜单**：右键点击事件显示 Obsidian 原生菜单，包含「编辑」「打开笔记」（仅笔记类事件）「删除」选项。
- **编辑窗删除按钮**：编辑表单左下角新增删除按钮，支持确认对话框。适配所有事件类型（配置事件移除数据、笔记事件删除文件、日记事件移除 frontmatter 属性值）。
- **记住上次事件类型**：创建事件时自动默认为上次选择的事件类型。
- **颜色选择器圆形色块**：预设颜色下拉选项前显示对应颜色的圆形标识。
- **标签页响应式 Emoji 模式**：事件类型标签在正常宽度显示 emoji + 文字，空间不足时自动切换为仅显示 emoji（通过容器查询实现）。
- **多日事件支持**：事件可设置持续天数，在日历中以连接边框跨日显示。
- **Bases 视图集成**：完整集成 Obsidian Bases — 使用 `.base` 文件创建带自定义属性映射的筛选日历视图。
- **日期校验增强**：`2026-04-220` 等非法日期现在会正确报错。

#### ⚡ 变更

- **简化来源笔记显示**：事件预览弹窗仅显示文件名，hover 时通过统一 Tooltip 显示完整路径。
- **统一 Tooltip 组件**：所有按钮的原生 `title` 属性替换为项目统一的 Tooltip 组件。
- **标题样式**：年份数字使用衬线字体 1.5em，带下划线装饰，hover 时变为强调色。标题 baseline 对齐。
- **事件管理器头部**：空间不足时操作按钮换行显示，不再被裁切。
- **事件详情精简**：仅显示有意义的属性值（隐藏、重复、创始日期），不再显示 "Hidden: ✘" 等默认状态行。
- **日历图例**：容器宽度 ≤600px 时折叠为仅 emoji 模式。
- **添加事件按钮**：从胶囊形强调按钮改为与相邻按钮一致的圆形图标按钮（✏️）。
- **删除按钮样式**：柔和背景配错误色文字，替代此前浓烈的红色填充。
- **日记事件表单提示**：显示具体日记文件名、属性名、自动创建提示、日期变更迁移提示。

#### 🐛 修复

- **日记事件日期变更 Bug**：修改日期后事件属性正确迁移到新日记文件，而非仅更新旧文件中的标题。
- **日记事件创建 ENOENT**：修复格式路径含子目录时（如 `YYYY-MM/YYYY-MM-DD`）创建失败的问题，现在自动创建中间目录。
- **可选字段被锁定**：修复从 dailyNoteEvent 切换到其他类型后可选字段仍不可编辑的问题。
- **右键菜单顺序**：移除 `setSection("danger")` 避免 Obsidian 自动重排菜单项。
- **i18n 插值**：修复模板变量使用单花括号 `{name}` 而系统要求双花括号 `{{name}}` 的问题。

---

# [3.2.0](https://github.com/Moyf/yearly-glance/compare/3.1.6...3.2.0) (2025-08-21)


### ♻️ Refactor

* Remove the old event management view, add an overview management view (#100) ([9a9954a](https://github.com/Moyf/yearly-glance/commit/9a9954a4981d974c01c1724b16ba99b4faa09534)), closes [#100](https://github.com/Moyf/yearly-glance/issues/100)


### ✨ Features

* Support Ctrl+Enter / Cmd+Enter shortcut to submit form (#99) ([92b204e](https://github.com/Moyf/yearly-glance/commit/92b204eb43f544bc60737fd8788b1c7a49afe3c8)), closes [#99](https://github.com/Moyf/yearly-glance/issues/99)
* Support for event import and export (#86) ([b8619b7](https://github.com/Moyf/yearly-glance/commit/b8619b76e8a2daa42fd72c409589ca3dab7385a9)), closes [#86](https://github.com/Moyf/yearly-glance/issues/86)



## [3.1.6](https://github.com/Moyf/yearly-glance/compare/3.1.5...3.1.6) (2025-07-31)


### ✨ Features

* Uniformly use timezone-safe date handling methods (#96) ([10ce9fc](https://github.com/Moyf/yearly-glance/commit/10ce9fc34e1ff881071d79cffe92d2c58e78c0bc)), closes [#96](https://github.com/Moyf/yearly-glance/issues/96)
* Optimize event date calculation logic to support event type differentiation (#97) ([14555d5](https://github.com/Moyf/yearly-glance/commit/14555d5497fa50b3738d836c02b9bae94c0eb44f)), closes [#97](https://github.com/Moyf/yearly-glance/issues/97)



## [3.1.5](https://github.com/Moyf/yearly-glance/compare/3.1.4...3.1.5) (2025-07-28)


### ✨ Features

* Optimize event tooltip rendering method and style adjustments (#95) ([670a854](https://github.com/Moyf/yearly-glance/commit/670a854ddaa5ed1d824bd0741ac23267d409be7b)), closes [#95](https://github.com/Moyf/yearly-glance/issues/95)


### 🐛 Bug Fixes

* Optimize the calculation logic for zodiac signs and Chinese zodiac signs in birthday events (#94) ([a59a254](https://github.com/Moyf/yearly-glance/commit/a59a254aaf234e4a77f3201aec6051f90f397f34)), closes [#94](https://github.com/Moyf/yearly-glance/issues/94)



## [3.1.4](https://github.com/Moyf/yearly-glance/compare/3.1.3...3.1.4) (2025-07-27)


### 🐛 Bug Fixes

* Fixed the parameter type and passing of recurring events in the event calculator (#92) ([87fc96e](https://github.com/Moyf/yearly-glance/commit/87fc96e4ab42b514e536bf14ca81fd30f076f0c7)), closes [#92](https://github.com/Moyf/yearly-glance/issues/92)



## [3.1.3](https://github.com/Moyf/yearly-glance/compare/3.1.2...3.1.3) (2025-07-25)


### 🐛 Bug Fixes

* Fixed timezone issue in date comparison for useYearlyCalendar (#88) ([1e94f93](https://github.com/Moyf/yearly-glance/commit/1e94f93526e3941a435915f336ce8f910ed66b38)), closes [#88](https://github.com/Moyf/yearly-glance/issues/88)



## [3.1.2](https://github.com/Moyf/yearly-glance/compare/3.1.1...3.1.2) (2025-07-22)


### 🐛 Bug Fixes

* Uniformly use local date format and fix timezone issues (#83) ([f45a2a7](https://github.com/Moyf/yearly-glance/commit/f45a2a7ca1a418ce18cd0f57e7cd5bfe79b45640)), closes [#83](https://github.com/Moyf/yearly-glance/issues/83)
* **DateInput:** Supports HTML rendering of error messages (#84) ([d92e39c](https://github.com/Moyf/yearly-glance/commit/d92e39c9bae3049f0a12f85205753d409c8e2d9b)), closes [#84](https://github.com/Moyf/yearly-glance/issues/84)



## [3.1.1](https://github.com/Moyf/yearly-glance/compare/3.1.0...3.1.1) (2025-07-22)


### 🐛 Bug Fixes

* fix a typo ([94ce529](https://github.com/Moyf/yearly-glance/commit/94ce52978e9872eb6fd5944090538b08ec06eb2e))



# [3.1.0](https://github.com/Moyf/yearly-glance/compare/3.0.2...3.1.0) (2025-07-22)


### ✨ Features

* Add the ability to hide previous and next months in the yearly view ([d2bed8d](https://github.com/Moyf/yearly-glance/commit/d2bed8d04774affe411f393e6381c5c9d9b00ab7))
* Add an option for emoji before the title ([7754b08](https://github.com/Moyf/yearly-glance/commit/7754b088bcf5413a406104d0fbbd762190376bb7))


### 🎨 Styles
* Add fade-in animation to Tooltip for better user experience ([7b24340](https://github.com/Moyf/yearly-glance/commit/7b2434083f06082cd1c75037a1079c9b6fa75728))


## [3.0.2](https://github.com/Moyf/yearly-glance/compare/3.0.1...3.0.2) (2025-07-22)


### ✨ Features

* Add the ability to hide previous and next months in the yearly view ([d2bed8d](https://github.com/Moyf/yearly-glance/commit/d2bed8d04774affe411f393e6381c5c9d9b00ab7))


## [3.0.1](https://github.com/Moyf/yearly-glance/compare/3.0.0...3.0.1) (2025-07-21)


### ♻️ Refactor

* Add event hover tooltip toggle and optimize Tooltip styles (#76) ([a128778](https://github.com/Moyf/yearly-glance/commit/a128778780726c1020012e3a36bd9576cd537ecc)), closes [#76](https://github.com/Moyf/yearly-glance/issues/76)



# [3.0.0](https://github.com/Moyf/yearly-glance/compare/2.5.2...3.0.0) (2025-07-17)


### ♻️ Refactor

* Optimize responsive design of YearlyCalendar for PC using container-related properties ([ebee569](https://github.com/Moyf/yearly-glance/commit/ebee569b107c1c41cda377654206226dd3b42f7c))
* Data structure refactoring (#60) ([b7a872c](https://github.com/Moyf/yearly-glance/commit/b7a872c1c411723a7b71a09920dcff484c377516)), closes [#60](https://github.com/Moyf/yearly-glance/issues/60)


### ✨ Features

* Replace native title with Tooltip component for improved hint functionality (#71) ([161da04](https://github.com/Moyf/yearly-glance/commit/161da04600b099656ec6f46320d259161d75f515)), closes [#71](https://github.com/Moyf/yearly-glance/issues/71)
* Add custom display format for Gregorian dates (#75) ([38ef1b1](https://github.com/Moyf/yearly-glance/commit/38ef1b14ef117fb0dd15933dd6a483e064edcd01)), closes [#75](https://github.com/Moyf/yearly-glance/issues/75)
* Add settings view and related command support (#74) ([c4c330f](https://github.com/Moyf/yearly-glance/commit/c4c330fde5a31bb223be44b18e1c04ed23f87ee3)), closes [#74](https://github.com/Moyf/yearly-glance/issues/74)
* Add automatic example event creation on first installation (#72) ([bad92cc](https://github.com/Moyf/yearly-glance/commit/bad92cce75a08d15e336dd8488f871037365c155)), closes [#72](https://github.com/Moyf/yearly-glance/issues/72)
* **EventForm:** Auto-focus first input field to improve user experience (#73) ([a1d486a](https://github.com/Moyf/yearly-glance/commit/a1d486a850989575e218dbcd04256e9368c36651)), closes [#73](https://github.com/Moyf/yearly-glance/issues/73)


### 💥 BREAKING CHANGE

* Change event date structure and fix related bugs

* feat: Add date interface definitions supporting both Gregorian and lunar date processing

* feat: Refactor date interfaces and add intelligent date parser

* feat: Add Gregorian and lunar date validators with integrated validation logic

* feat: Optimize date processing and add test configuration

* fix: Optimize date validation logic, enhance Gregorian and lunar date validity checks

* feat: Add v2 to v3 data migration functionality

* feat: Add lunar utility class and extend ISO date parsing functionality

* feat: Refactor event date calculation logic, support solar term and festival updates

* refactor: Remove DatePicker related components and style code

* feat: Add ObsidianApp context and extend ISO date parsing support

* feat: Optimize event date processing and data structure migration

* fix: Unify event date structure, simplify date parsing return types

* feat: Unify date interfaces and optimize date processing logic

* fix(core): Update deprecated field comments, clarify replacement field descriptions

* fix: Fix several rendering and style issues in YearlyCalendar component

* feat: Add date input component and optimize yearly calendar event date processing

* style: Optimize date input component styles and state presentation

* test: Add unit tests for leap month handling fallback logic

* refactor: Simplify event list component, remove built-in holiday collapse functionality

* fix: Optimize date parsing logic, enhance input validation and error messages

* fix: Optimize event type determination and search filtering logic

* style: Adjust event form spacing and color picker styles

* feat(tooltip): Support disabled state and optimize styles with Portal rendering

* feat: Optimize date input component and improve multilingual hint messages

* feat: Enhance date parsing error messages, support multiple format validations

* fix(i18n): Optimize date and event hint text, improve expression accuracy



## [2.5.2](https://github.com/Moyf/yearly-glance/compare/2.5.1...2.5.2) (2025-07-13)


### 🐛 Bug Fixes

* adapt long text in event manager, fixed #39 ([94ca81f](https://github.com/Moyf/yearly-glance/commit/94ca81f8b5c77f273b587c99f7b0a5c85242bd94)), closes [#39](https://github.com/Moyf/yearly-glance/issues/39)

* Fix list view horizontal scrolling and layout options display issues ([a36a777](https://github.com/Moyf/yearly-glance/commit/a36a777b52495d6a802b0da12afe8aad03706c8f))
    - Adjust list view layout in YearlyCalendarView.css to prevent flex-wrap from taking effect, making list items scroll horizontally and improving user experience
    - Add max-width limit to prevent text from overflowing and affecting layout
    - Restore 1x12 layout options in ViewSettings.tsx for list and calendar views, ensuring consistency and completeness of layout options

## [2.5.1](https://github.com/Moyf/yearly-glance/compare/2.5.0...2.5.1) (2025-07-13)


### 🐛 Bug Fixes

* Fix list view horizontal scrolling and layout options display issues ([a36a777](https://github.com/Moyf/yearly-glance/commit/a36a777b52495d6a802b0da12afe8aad03706c8f))
    - Adjust list view layout in YearlyCalendarView.css to prevent flex-wrap from taking effect, making list items scroll horizontally and improving user experience
    - Add max-width limit to prevent text from overflowing and affecting layout
    - Restore 1x12 layout options in ViewSettings.tsx for list and calendar views, ensuring consistency and completeness of layout options
    

# [2.5.0](https://github.com/Moyf/yearly-glance/compare/2.4.2...2.5.0) (2025-07-12)


### ✨ Features

* **settings:** Filter layout options by view type ([7fb6821](https://github.com/Moyf/yearly-glance/commit/7fb6821a100593d0c6fa37120e7b6b3df9baca9d))


### 🎨 Styles

* Distinguish minimum width for list and calendar views ([f515e80](https://github.com/Moyf/yearly-glance/commit/f515e808ef3d69429dfdbe18048b3e122b9dcfcd))
* Optimize yearly calendar grid layout and styles, add more buttons for calendar ([f6eeac5](https://github.com/Moyf/yearly-glance/commit/f6eeac5be69b606239ee114f6ea41dda49af6bad))
    1. Set emoji on top
    2. Wrap text
    3. Howver to show tooltips
* Update CSS ([5ba7a43](https://github.com/Moyf/yearly-glance/commit/5ba7a43d16d976d72d7032c22f3d96b7455abc3b))


### 🐛 Bug Fixes

* Fix basic view types layout ([2c69661](https://github.com/Moyf/yearly-glance/commit/2c6966149007bfd5a9b15e5772a1fee75de79e07))



## [2.4.2](https://github.com/Moyf/yearly-glance/compare/2.4.1...2.4.2) (2025-07-10)


### ✨ Features

* **yearly-calendar:** Refactor yearly calendar view using CSS Grid ([bbf5505](https://github.com/Moyf/yearly-glance/commit/bbf550532c3dac8b8a6d72910d110c9212f93acd))


### 🐛 Bug Fixes

* **i18n:** Use English as default when language does not exist ([3aa293f](https://github.com/Moyf/yearly-glance/commit/3aa293f60c488017eb1b11c9586b8296fc628c37))



## [2.4.1](https://github.com/Moyf/yearly-glance/compare/2.4.0...2.4.1) (2025-06-13)


### ✨ Features

* Support mobile device usage, modify manifest configuration ([7ee52eb](https://github.com/Moyf/yearly-glance/commit/7ee52ebe21b5291435d23ad079dcb30be9e2cec1))



# [2.4.0](https://github.com/Moyf/yearly-glance/compare/2.3.0...2.4.0) (2025-06-06)


### ✨ Features
* Optimize input components and interface interaction experience ([321631c](https://github.com/Moyf/yearly-glance/commit/321631c09caad59e68e72a272d38723d73a7ed6b))
* Optimize preset color settings and interface interaction experience ([f0a8150](https://github.com/Moyf/yearly-glance/commit/f0a81503639761cb663cf2ca62fe1bd42c70a83c))
* Support defining event color presets (#47) ([1dc13d3](https://github.com/Moyf/yearly-glance/commit/1dc13d3528353eac541416e123936dddd4e0874f)), closes [#47](https://github.com/Moyf/yearly-glance/issues/47)


### 🐛 Bug Fixes

* Fix property loss caused by missing extension during props passing ([d86eaea](https://github.com/Moyf/yearly-glance/commit/d86eaea30d6c986cd3821de8cb69e12831a83bca))
* Optimize yearly calendar event type definitions and event handling logic ([1d93fd2](https://github.com/Moyf/yearly-glance/commit/1d93fd25a0c59d22bb64ee9f3926ae593e2a2183))
* **types:** Comment out calendar setting in group ([73e2721](https://github.com/Moyf/yearly-glance/commit/73e2721ebb852c5430d0d550e07949dcaa992a69))



# [2.3.0](https://github.com/Moyf/yearly-glance/compare/2.2.2...2.3.0) (2025-05-19)

### Features

* Add Chinese lunar date display and adjust multi-language description text ([5eb5e94](https://github.com/Moyf/yearly-glance/commit/5eb5e94c1f2cd15346e711084d3e94910f5f145d))
* Optimize build configuration and internationalization language acquisition logic ([71a9d8f](https://github.com/Moyf/yearly-glance/commit/71a9d8ffbc1fce320e87210af645fcb1f5bd1ad6))
* Reorganize the settings interface and add more groups ([6ae3457](https://github.com/Moyf/yearly-glance/commit/6ae3457fba7fd6b7c93aa1dacf43878a08538b75))


### Bug Fixes

* Optimize event date calculation logic and fix year judgment condition ([8352455](https://github.com/Moyf/yearly-glance/commit/8352455b92ba70e8fc7b93303a919c492ddef868))



## [2.2.2](https://github.com/Moyf/yearly-glance/compare/2.2.1...2.2.2) (2025-04-27)


### ✨ Features

* Add year control button functionality ([f02f83c](https://github.com/Moyf/yearly-glance/commit/f02f83cb97241a6a9e965d5c616f18b55ca2c497))
* Optimize solar term date calculation and data migration logic ([27b86dc](https://github.com/Moyf/yearly-glance/commit/27b86dc2c74412188b4d8a3c7c9bfb308e8c72ea))


### 🐛 Bug Fixes

* Optimize date handling and event icon display logic ([af83473](https://github.com/Moyf/yearly-glance/commit/af834737eec620a1cd7b8e702a5dd522010d30a0))



## [2.2.1](https://github.com/Moyf/yearly-glance/compare/2.2.0...2.2.1) (2025-04-25)


### ♻️ Refactor

* Split EventManager component from YearlyCalendar ([64223fb](https://github.com/Moyf/yearly-glance/commit/64223fb4822c37bffd4d351981bfc09192431a18))


### ✨ Features

* Add event list sorting functionality, supporting sorting by name and date ([43e5fc2](https://github.com/Moyf/yearly-glance/commit/43e5fc2beda63328a00d253953655e88503ae86e))
* **event-manager:** Add event sorting controls and related internationalization support ([42670a4](https://github.com/Moyf/yearly-glance/commit/42670a4fa43edf07bdba2a9286c936bb8eab98df))



# [2.2.0](https://github.com/Moyf/yearly-glance/compare/2.1.6...2.2.0) (2025-04-24)


### ♻️ Refactor

* Add date display and year option generation tools ([5d5db8c](https://github.com/Moyf/yearly-glance/commit/5d5db8cc9da65ba406f040535204918d4fb3aa47))
* Remove redundant fields and dependencies related to parseDate ([aacd258](https://github.com/Moyf/yearly-glance/commit/aacd2582d6ee2fac2190a92574a46f6623fc7eb9))
* Refactor event management interface and event form date selection logic ([41fd713](https://github.com/Moyf/yearly-glance/commit/41fd71313b1726f6e98efc5f9aa81550479c3c05))


### ✨ Features

* Merge built-in holiday data, support automatic addition of new holidays ([e37a2d6](https://github.com/Moyf/yearly-glance/commit/e37a2d69656b3b3116d0518b6c859430b86c60b7))
* Add a unified toggle in event management for displaying built-in holidays ([637576d](https://github.com/Moyf/yearly-glance/commit/637576d88fa0cda3610ba4857eacd10f333ad0ab))
* Standardize built-in holiday ID prefixes and add new holidays ([6145049](https://github.com/Moyf/yearly-glance/commit/614504916d5f388dd5ce863569d0ec311c34acdb))
* Optimize lunar date calculation logic, support leap months and edge cases ([876a27e](https://github.com/Moyf/yearly-glance/commit/876a27ee96d9b31117ac5b2ae92f4e598382b2f3))
* Optimize Select component style and implement virtual scrolling ([0f3a835](https://github.com/Moyf/yearly-glance/commit/0f3a83506da4a7f41be4ab3d43471651f20e4df5))
* Add command to reload plugin ([1c484ae](https://github.com/Moyf/yearly-glance/commit/1c484ae36956c2d6912897f61f117f1b68defb15))
* Refactor date selector and optimize event form functionality ([82c11cf](https://github.com/Moyf/yearly-glance/commit/82c11cfab8a631451ba63ae3f526860ac7ebb73d))


### 🎨 Styles

* **DateSelector:** Add date selector component and styles ([aa0b56b](https://github.com/Moyf/yearly-glance/commit/aa0b56bc38967e9e3c4c4fd5001ada2c88611cd5))


### 🐛 Bug Fixes

* Optimize solar term date calculation to avoid repeated date object creation ([ab06468](https://github.com/Moyf/yearly-glance/commit/ab064689709f2bdc09ff0736db7145ed95ce7f1e))
* **data:** Fix incorrect words in original built-in holidays and migrate data ([a49688f](https://github.com/Moyf/yearly-glance/commit/a49688facdf34a8a107830bdb4171d9c9e9e29f9))



## [2.1.6](https://github.com/Moyf/yearly-glance/compare/2.1.5...2.1.6) (2025-04-22)


### ♻️ Refactor

* **settings:** Change default settings to 2x6 list view ([040e716](https://github.com/Moyf/yearly-glance/commit/040e716dc25ea2ad827c3f91258e9f4d11ab811b))



## [2.1.5](https://github.com/Moyf/yearly-glance/compare/2.1.4...2.1.5) (2025-04-21)


### 🐛 Bug Fixes

* **event:** Fix the incorrect translation of Pisces in the birthday section ([d01e3bb](https://github.com/Moyf/yearly-glance/commit/d01e3bb107b4a7d5c5e87f988d45f41a0200660e))



## [2.1.4](https://github.com/Moyf/yearly-glance/compare/2.1.3...2.1.4) (2025-04-21)


### ✨ Features

* Keep today's display when hiding empty dates ([4a6adac](https://github.com/Moyf/yearly-glance/commit/4a6adacc757f3943390bc8d2297f03568cf5dc17))


### 🎨 Styles

* For birthdays without a year, display age and zodiac as empty, and place the original prompt message in the tooltip ([274dbc1](https://github.com/Moyf/yearly-glance/commit/274dbc14659ec88f74cd5b7555f0695aaf50d011))
* **tooltip:** In eventTooltip, null values are displayed as - ([24e5d13](https://github.com/Moyf/yearly-glance/commit/24e5d13972cdd10d8e98ba74a609cd46c5b69498))


### 🐛 Bug Fixes

* **eventmanager:** Fixed the issue where the event type was not correctly passed during search ([7d4c6d4](https://github.com/Moyf/yearly-glance/commit/7d4c6d4bfce62186abc9927912e97c5c9c957f19))



## [2.1.3](https://github.com/Moyf/yearly-glance/compare/2.1.2...2.1.3) (2025-04-19)


### ✨ Features

* Add the celestial stem and earthly branch prefix to the zodiac signs, and include corresponding i18n support ([229b2b6](https://github.com/Moyf/yearly-glance/commit/229b2b6c725b631af83579443899895549092f8a))


### 🐛 Bug Fixes

* Lunar Calendar Date Calculation and Display Issues [@linglilongyi](https://github.com/linglilongyi) (#30) ([d16512b](https://github.com/Moyf/yearly-glance/commit/d16512b608a589b51b83560e421cdbe34d1f2d76)), closes [#30](https://github.com/Moyf/yearly-glance/issues/30)
* Fix the display error for the next lunar birthday ([fe2a144](https://github.com/Moyf/yearly-glance/commit/fe2a144619378ead54466bbdfa6ac40c2311dafb))

### 👨‍💻 New Contributors

* [@linglilongyi](https://github.com/linglilongyi)

## [2.1.2](https://github.com/Moyf/yearly-glance/compare/2.1.1...2.1.2) (2025-04-18)


### 🐛 Bug Fixes

* Fixed the issue where the default icon for events was not displayed correctly in the overview view ([375cb38](https://github.com/Moyf/yearly-glance/commit/375cb3883ee12762ecfc556bdfb0cbfd17fce4ae))


### 📝 Documentation

* Added CONTRIBUTING.md (#29) ([91509a0](https://github.com/Moyf/yearly-glance/commit/91509a0b01b8a6c850f3f5099f08d8ce500bdb0d)), closes [#29](https://github.com/Moyf/yearly-glance/issues/29)
* **readme:** Updated and optimized README documentation ([d7c1d45](https://github.com/Moyf/yearly-glance/commit/d7c1d45200bcf0214f85a79b037d6e51e2fa2df4))


### 🔧 CI

* Adjusted the text format of the Release generated ([6e42481](https://github.com/Moyf/yearly-glance/commit/6e4248123905fa291be80f59423efe4514407955))



## [2.1.1](https://github.com/Moyf/yearly-glance/compare/2.1.0...2.1.1) (2025-04-18)


### 🐛 Bug Fixes

* **eventform:** Fixed the issue where event hiding was not displayed correctly in the birthday form ([273e0b4](https://github.com/Moyf/yearly-glance/commit/273e0b4f1b61b2018d954c40ca0e027caba0fe61))


### 📝 Documentation

* **CHANGELOG:** Fixed the changelog ([4605228](https://github.com/Moyf/yearly-glance/commit/4605228a9f25e5402b0be9896ef4d371f9542008))
* **manifest:** Updated the plugin description ([57ca2d4](https://github.com/Moyf/yearly-glance/commit/57ca2d40427d42cdcab1956f3ff530a8947c8749))


### 🔧 CI

* **scripts:** Removed the changelog:append command and some leftover husky commands ([bbf76d1](https://github.com/Moyf/yearly-glance/commit/bbf76d1e8bf8ab55c12b638482b33ba24b2aa7d6))
* **workflow:** Updated the changelog generation to include Chinese installation instructions ([b94f686](https://github.com/Moyf/yearly-glance/commit/b94f6860d70c67a337ebd47674c8122ce1729dc9))


# [2.1.0](https://github.com/Moyf/yearly-glance/compare/1.0.0...2.1.0) (2025-04-17)

## 2.1.0 Changes

### ✨ New Feature: Everything Can Be Hidden! 🙈

* **Hide Events:** Added a "hideable" property to all event types ([ae62f4d](https://github.com/Moyf/yearly-glance/commit/ae62f4dddcfba4e27c4afd28046c982c01b336c0)), closes [#25](https://github.com/Moyf/yearly-glance/issues/25)
* **Hide Empty Dates:** Added a "Hide Empty Dates" button in the list view, which can be used in combination with height restrictions and type filters to view a simplified, filtered view ([12831e5](https://github.com/Moyf/yearly-glance/commit/12831e59ed6b32f81948144ece735ee7d8be744b)), closes [#26](https://github.com/Moyf/yearly-glance/issues/26)

### 🎨 Styles

* **Event Manager:** Added a `datatype` attribute to different event pages (`event-list`) and adjusted button icons ([28a20c4](https://github.com/Moyf/yearly-glance/commit/28a20c4129e3e7cea33eef4316129e9c3512fe9c))
* **List View:** Fixed hover styles in list mode ([1b7508e](https://github.com/Moyf/yearly-glance/commit/1b7508e7e39d6042fd3f568cd33c763a7278d152))

### 📝 Documentation

* **CI:** Attempt to automatically add commits to the changelog upon submission ([73fbb82](https://github.com/Moyf/yearly-glance/commit/73fbb82397c0dbff6d16cf59e27a8b4fe76ecd28))
* **Standardization:** Fixed non-standard commits in the changelog ([ebe52a5](https://github.com/Moyf/yearly-glance/commit/ebe52a5f3859baeae677d48b0a9437e209771054) [e838743](https://github.com/Moyf/yearly-glance/commit/e8387439f63d96566a83bae4eb071271fe956b4e))

---

## 2.0.0 Major Update

### 💥 Breaking Changes: Data Structure Rewrite

* **Event ID:** Added UUIDs to all events, which may cause duplicate creation of built-in holidays (can be manually deleted in `data.json` or reset by deleting the `data.json` file).

### ♻️ Refactoring

* **Delete Confirmation:** Renamed `onCancel` to `onClose` for consistency ([b93750e](https://github.com/Moyf/yearly-glance/commit/b93750ebc9f664a3444f3903c22d17f412af546e))
* **Default Event Type:** Changed the default sorting of event types (Custom Events -> Birthdays -> Holidays) ([f562d9e](https://github.com/Moyf/yearly-glance/commit/f562d9ecf95cd14cdad1ca8a616646bef1e75a95))

### ✨ New Features

* **Color Picker:** Added a color picker component for customizing event colors ([cfbf6ca](https://github.com/Moyf/yearly-glance/commit/cfbf6ca5e76a04d544233534e3511d1c2a225576))
* **Delete Confirmation:** Implemented a `ConfirmDialog` component for event deletion confirmation ([24813f4](https://github.com/Moyf/yearly-glance/commit/24813f416a21fe695f2933fa7c1e48aa2330abdd))
* **Event Creation:** Enhanced event creation functionality with additional attributes ([c9b2943](https://github.com/Moyf/yearly-glance/commit/c9b2943e33e054679e85f07cb0f14c1b15fbe690))
* **Event Manager:** Implemented event search functionality and enhanced tooltip actions ([93bc380](https://github.com/Moyf/yearly-glance/commit/93bc380db806cd0d2313e2ed071258a317090cd4))
* **Event Details:** Added date display functionality to event tooltips ([4d4e789](https://github.com/Moyf/yearly-glance/commit/4d4e789d6262717f5d6ce04a5e2986a65f68e9c5))
* **UUID:** Integrated UUID generation for event IDs and strengthened event management ([17446e0](https://github.com/Moyf/yearly-glance/commit/17446e083d7883dc8d92f61b8621347dd48d9624))
* **View Options:** Added view preset options and configuration handling ([ee19736](https://github.com/Moyf/yearly-glance/commit/ee19736dd352520459d6bc34a9e00ccfa7f538c1))

### 🎨 Styles

* **Style Adjustments:** Added pointer cursor styles for adding events ([f1d3d0a](https://github.com/Moyf/yearly-glance/commit/f1d3d0a5a9b1d716909477a5075a020d75b8340e))
    * Adjusted flex values ([46beb47](https://github.com/Moyf/yearly-glance/commit/46beb47fa81a6d4e9ceb246bc778a193a560c944))
    * Adjusted form option styles ([60edc3a](https://github.com/Moyf/yearly-glance/commit/60edc3ad755d8e68895ec27b2827c6296b83009d))
    * Modified border styles ([fc9dd72](https://github.com/Moyf/yearly-glance/commit/fc9dd726d284fbbc4d9cd03e18a75a01265e4f8e))
    * **EventTooltip:** Increased spacing between action buttons for better layout ([08850c1](https://github.com/Moyf/yearly-glance/commit/08850c1b12c013fe55c1c755c7091bacf9b77e6a))
    * **yearlyglancelist:** Fixed hover styles in list mode ([1b7508e](https://github.com/Moyf/yearly-glance/commit/1b7508e7e39d6042fd3f568cd33c763a7278d152))
* **Overview View:** Adjusted month row spacing for improved layout consistency ([5de40e9](https://github.com/Moyf/yearly-glance/commit/5de40e9abca87d2552fa6a07e80ad2a873f66a06))
    * Refactored CSS for better readability and maintainability ([caab2e8](https://github.com/Moyf/yearly-glance/commit/caab2e8d49cb0fb6b49b99f3e6b7cc0825baa212))
    * Refactored tab components and optimized styles ([972b091](https://github.com/Moyf/yearly-glance/commit/972b091b0950233b2bae1777cdd3db809027725b))

### 🐛 Fixes

* Ensured consistent file import casing and updated TypeScript configuration ([a1b32aa](https://github.com/Moyf/yearly-glance/commit/a1b32aa33bcb8d90033badc39acc3b018d393259))
* Optimized the regex pattern for parsing commit messages in the release workflow ([ffc792d](https://github.com/Moyf/yearly-glance/commit/ffc792ddadc5570cbef82d88e4bacdf36d563bef))
* Updated event type references for consistency ([5efd7c0](https://github.com/Moyf/yearly-glance/commit/5efd7c0ba1b8d751c9266327ac3e59b51b62486e))
* Updated the regex for detecting breaking changes in the release workflow ([7462f0e](https://github.com/Moyf/yearly-glance/commit/7462f0ed2d6093bf1203b7a406eab5ae105a4148))

### 📝 Documentation

* **Changelog:** Added Chinese and English documentation for the 2.0.0 release ([80c28c3](https://github.com/Moyf/yearly-glance/commit/80c28c32eeba6e3b591ca91e5fcf7f0827e0704c))

### 🔧 CI

* Attempted to automatically add commits to the changelog upon submission ([24b6114](https://github.com/Moyf/yearly-glance/commit/24b61144c0cda6cfb32027b9e968b2aaf937041a))
* Changed the way release changelogs are generated ([17405bf](https://github.com/Moyf/yearly-glance/commit/17405bfd15531d52befd2c9c4c2176768881a685))
* Simplified commands: `changelog:unreleased` changed to `changelog:u` ([d413d4a](https://github.com/Moyf/yearly-glance/commit/d413d4a79a51fe2163ef5c94556b773c9bd4b85c))
* Refactored the way changelogs are generated ([343c0a1](https://github.com/Moyf/yearly-glance/commit/343c0a164f50cd306c54983f94e7de095bb7b047))
* **Scripts:** Updated the `version-bump` script to modify `manifest-beta.json` for beta versions ([80b04a8](https://github.com/Moyf/yearly-glance/commit/80b04a8c901b982d9c454357f305056b2dfbeb8e))

### 🔨 Miscellaneous

* **Commit Process:** Used conventional and commitizen tools ([829f5a8](https://github.com/Moyf/yearly-glance/commit/829f5a81c379c4bee09d4cf82b5ba78b662e8168))
* Updated date labels in tooltips and enhanced internationalization support ([6504060](https://github.com/Moyf/yearly-glance/commit/6504060a3f0bb9b7cc01c06fb95699aca3c3052c))

### ⏪ Reverts

* **CI:** Attempted to automatically add commits to the changelog upon submission ([73fbb82](https://github.com/Moyf/yearly-glance/commit/73fbb82397c0dbff6d16cf59e27a8b4fe76ecd28))
    

# [1.0.0](https://github.com/Moyf/yearly-glance/compare/2f988aaf5ac4f8118626d9badd8897d900737d1a...1.0.0) (2025-04-10)


### ♻️ Refactor

* **release.yml:** Enhance changelog generation with support for breaking changes and improved commit type categorization ([be2ee77](https://github.com/Moyf/yearly-glance/commit/be2ee779a6e6d8bfe25c01f50820c66ef49e09c5))


### ✨ Features

* **event:** Introduce tabbed interface for event type selection in EventFormModal ([ba8845e](https://github.com/Moyf/yearly-glance/commit/ba8845e8edd3fa39a52198b476b11cf52752f7ef))
* **script:** change the icon ([7f908a0](https://github.com/Moyf/yearly-glance/commit/7f908a0da166498a5cdbc1353fbcc6150d019188))
* **style:** update hover color in dark theme) ([635b834](https://github.com/Moyf/yearly-glance/commit/635b834798be9b9963bce88ffa4cd6aed582cd45))


### 🐛 Bug Fixes

* **script:** Add 'manifest.json' to the list of files to be copied to the vault ([b9c8af9](https://github.com/Moyf/yearly-glance/commit/b9c8af98014bf9c4691feba8c83ee83fe1a0b43a))


### 📝 Documentation

* **init:** Initialize plugin information. ([2f988aa](https://github.com/Moyf/yearly-glance/commit/2f988aaf5ac4f8118626d9badd8897d900737d1a))
* **manifest:** Add manifest-beta.json for Yearly Glance plugin ([6e831f0](https://github.com/Moyf/yearly-glance/commit/6e831f0a82f08eb203d01f5c4edcf357d2d511ec))
* **README:** Add badges for stars, downloads, license, issues, and last commit; include star history chart in both English and Chinese README files. ([f07c875](https://github.com/Moyf/yearly-glance/commit/f07c8751ea6c91da2f6f65df3a1d8ecc54b50749))


### 🔨 Chore

* **.gitignore:** Add 'styles.css' to the list of ignored files ([e99ec99](https://github.com/Moyf/yearly-glance/commit/e99ec99a0167c45a9125c00d83886f7c9666644c))
* **.gitignore:** Exclude Thumbs.db to prevent Windows Explorer view states from being tracked ([2f6924c](https://github.com/Moyf/yearly-glance/commit/2f6924c717a300c011ec29351259b3cd5b3cc985))
* **style:** remove tooltip CSS ([6dbca9e](https://github.com/Moyf/yearly-glance/commit/6dbca9e883fe2e29c0cf0d1e1f0d3a6959d351ab))



