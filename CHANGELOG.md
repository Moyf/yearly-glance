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



