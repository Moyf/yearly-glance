import { BaseMessage } from "../types";

const translations: BaseMessage = {
	setting: {
		title: "Yearly glance",
		desc: "View <a href='https://docs.ravenhogwarts.top/obsidian-yearly-glance/' target='_blank'>wiki documentation</a> to learn more features",
		general: {
			name: "Calendar",
			desc: "Basic of the calendar",
			title: {
				name: "Title",
				desc: "Use {{year}} placeholder when customizing, otherwise use the default title",
			},
			layout: {
				name: "Layout",
				desc: "Grid layout (rows × columns)",
			},
			viewType: {
				name: "View type",
				desc: "Select the view type",
				options: {
					calendar: "Calendar",
					list: "List",
				},
			},
			showWeekdays: {
				name: "Show weekdays",
				desc: "Show weekdays in view",
			},
			highlightToday: {
				name: "Highlight today",
				desc: "Highlight today in view",
			},
			highlightWeekends: {
				name: "Highlight weekends",
				desc: "Highlight weekends in view",
			},
			showLegend: {
				name: "Show legend",
				desc: "Show event type legend",
			},
			limitListHeight: {
				name: "Limit list height",
				desc: "Limit the height of the list view",
			},
			eventFontSize: {
				name: "Event font size",
				desc: "Set the font size of the event text",
				options: {
					small: "Small",
					medium: "Medium",
					large: "Large",
				},
			},
			showHolidays: {
				name: "Show holidays",
				desc: "Show holidays in view",
			},
			showBirthdays: {
				name: "Show birthdays",
				desc: "Show birthdays in view",
			},
			showCustomEvents: {
				name: "Show custom events",
				desc: "Show custom events in view",
			},
			showBasesEvents: {
				name: "Show note events",
				desc: "Show events from notes' properties in view",
			},
			mondayFirst: {
				name: "Start week on Monday",
				desc: "Use Monday as the first day of the week",
			},
			showTooltips: {
				name: "Event tooltips",
				desc: "Display details when hovering events",
			},
			eventClickAction: {
				name: "Event click action",
				desc: "Action to perform when clicking an event",
				options: {
					showTooltip: "Show preview (default)",
					editEvent: "Edit event",
					openNote: "Open note (for note events only)",
				},
			},
			colorful: {
				name: "Colorful theme",
				desc: "Use different colors for each month",
			},
			showLunarDay: {
				name: "Show lunar day",
				desc: "Show lunar date in view",
			},
			showEmojiBeforeTabName: {
				name: "Tab icon display",
				desc: "Choose how to display tab icons",
				options: {
					none: "No icon",
					lucide: "Lucide icon",
					emoji: "Emoji icon",
				},
			},
			showDebugInfo: {
				name: "Debug information",
				desc: "Show debug information for development",
			},
			presetColors: {
				name: "Preset colors",
				desc: "Color presets for different events",
				newColor: "New color",
			},
			gregorianDisplayFormat: {
				name: "Gregorian display format",
				desc: "Global display format for gregorian dates",
				options: {
					iso: "ISO Standard Format (1949-10-01)",
					usSlash: "US Format (01/10/1949)",
					euSlash: "European Format (10/01/1949)",
					jpSlash: "Japanese Format (1949/10/01)",
					deDot: "German Format (01.10.1949)",
					usDash: "US Dash Format (01-10-1949)",
					euDash: "European Dash Format (10-01-1949)",
					chinese: "Chinese Format (1949年10月01日)",
					enShortMdy: "English Month-Day-Year (Oct 01, 1949)",
					enShortDmy: "English Day-Month-Year (01 Oct 1949)",
					enFullMdy: "Full English Month-Day-Year (October 1, 1949)",
					enFullDmy: "Full English Day-Month-Year (1 October 1949)",
				},
			},
			defaultBasesEventPath: {
				name: "Default note event path",
				desc: "Notes with event properties in this folder will appear in the calendar. Use \"/\" to scan the entire vault, or leave empty to disable note event scanning.",
				placeholder: "Leave empty to disable scanning",
			},
			basesEventFileNameFormat: {
				name: "File Name Format",
				desc: "Format for note event file names. Use {event_name} for the event title, date tokens (YYYY, MM, DD), and [text] for literal characters.",
				preview: "Preview",
			},
			basesEventTitleProp: {
				name: "Title property name",
				desc: "Property name in note properties for storing event title",
				placeholder: "Default: title",
			},
			basesEventDateProp: {
				name: "Date property name",
				desc: "Property name in note properties for storing event date",
				placeholder: "Default: event_date",
			},
			basesEventDurationProp: {
				name: "Duration property name",
				desc: "Property name in note properties for storing event duration",
				placeholder: "Default: duration",
			},
			basesEventIconProp: {
				name: "Icon property name",
				desc: "Property name in note properties for storing event icon",
				placeholder: "Default: icon",
			},
			basesEventColorProp: {
				name: "Color property name",
				desc: "Property name in note properties for storing event color",
				placeholder: "Default: color",
			},
		basesEventDescriptionProp: {
			name: "Description property name",
			desc: "Property name in note properties for storing event description",
			placeholder: "Default: description",
		},
			basesEventPresetTypeProp: {
				name: "Event type property",
				desc: "Frontmatter property name used to assign a preset event type to note events",
				placeholder: "event_type",
			},
			eventPresetTypes: {
				name: "Event type presets",
				desc: "Define icon and color combinations, assign to events, and filter by group",
				tooltip: "Assign a type to events to apply its emoji and color. You can still override emoji/color on individual events.",
				addNew: "Add type",
				namePlaceholder: "Type name (e.g. Travel)",
				deleteConfirm: "This type is used by {count} events. Deleting it will fall back to default colors. Continue?",
				usedByCount: "Used by {count} events",
			},
			showDailyNoteEvents: {
				name: "Show daily note events",
				desc: "Display events from daily notes on the calendar",
			},
			dailyNoteSource: {
				name: "Daily note source",
				desc: "Select which plugin to use for daily notes",
				options: {
					dailyNotes: "Core Daily Notes",
					periodicNotes: "Periodic Notes",
				},
			},
			dailyNoteEventProp: {
				name: "Events property name",
				desc: "The frontmatter property name that contains events list in daily notes",
				placeholder: "Default: events",
			},
			dailyNoteShowEmoji: {
				name: "Show emoji prefix",
				desc: "Display emoji prefix from daily note event text (e.g. 🧩 in '🧩 Dev work')",
			},
			dailyNoteWarning: {
				name: "",
				desc: "",
				noPlugin: "Neither Daily Notes nor Periodic Notes plugin is enabled",
				noDailyNotes: "Core Daily Notes plugin is not enabled",
				noPeriodicNotes: "Periodic Notes plugin is not installed",
			},
			customEmojiKeywords: {
				name: "Emoji keywords mapping",
				desc: "Add custom search keywords for emoji. Format: emoji: keyword1, keyword2 (one per line)"
			},
		},
		events: {
			name: "Events",
			desc: "Event management",
		},
		group: {
			basic: {
				name: "Basic",
				desc: "Configure the basic information of the calendar.",
			},
			basesEvent: {
				name: "Note Events",
				desc: "Use notes with specific properties as event sources. Notes in the default path will appear in the Year Calendar view. You can also add a Yearly Glance Bases view for advanced filtering. See docs for details.",
			},
			noteEventProps: {
				name: "Note Properties",
				desc: "Configure the frontmatter property names used to read note event data",
			},
			dailyNoteEvent: {
				name: "Daily Note Events",
				desc: "Read events from daily note frontmatter list properties",
			},
			layout: {
				name: "Layout",
				desc: "Overall layout and view type of the calendar.",
			},
			style: {
				name: "Style",
				desc: "Appearance-related options for the calendar.",
			},
			eventDisplay: {
				name: "Event Display",
				desc: "Settings for events, holidays, birthdays, etc.",
			},
			customEmoji: {
				name: "Custom Emoji",
				desc: "Emoji configured here will appear in the icon selection window (you can also directly add keywords in the emoji selector of the event editing interface)",
			},
			colorSets: {
				name: "Color presets",
				desc: "Define color values for quick selection",
			},
			presets: {
				name: "Presets",
				desc: "Color presets and event type presets",
			},
		},
	},
	view: {
		basesView: {
			name: "Yearly Glance",
			options: {
				embeddedHeight: "Embedded height",
				limitHeight: "Limit height",
				maxHeight: "Maximum height",
				properties: "Properties",
				extendedProperties: "Extended properties",
				display: "Display",
				propTitle: "Title property",
				propDate: "Date property",
				propDuration: "Duration property",
				propIcon: "Icon property",
				propColor: "Color property",
				propDescription: "Description property",
				inheritPluginData: "Inherit plugin data",
			},
		},
		glanceManager: {
			name: "Glance manager",
			events: "Events",
			settings: "Settings",
			dataPort: "Data",
		},
		yearlyGlance: {
			name: "Yearly glance",
			yearlyCalendar: "Year Glance",
			legend: {
				holiday: "Holiday",
				birthday: "Birthday",
				customEvent: "Custom event",
				basesEvent: "Note event",
				dailyNoteEvent: "Daily event",
			},
			viewPreset: {
				yearOverview: "Year overview",
				classicCalendar: "Classic calendar",
				custom: "Custom layout",
			},
			actions: {
				clickToShow: "Click to show ",
				clickToHide: "Click to hide ",
				form: "Add event",
				manager: "Open glance manager",
				limitListHeight: "Limit list height",
				hideEmptyDates: "Hide empty dates",
				emojiOnTop: "Display emoji on top",
				wrapText: "Toggle text wrapping",
				showTooltips: "Mouse hover to show full event name",
				hidePreviousMonths: "Hide previous months",
				showPreviousMonths: "Show previous months",
				previousMonths: "Past",
				hideFutureMonths: "Hide future months",
				showFutureMonths: "Show future months",
				futureMonths: "Future",
			},
		},
		emojiPicker: {
			searchPlaceholder: "Search emoji...",
			customCategory: "Custom",
			noResults: "No matching emoji found",
			categoryCommon: "Common",
			categoryActivity: "Activity",
			categoryHoliday: "Holiday",
			categoryEmotion: "Emotion",
			categoryNature: "Nature",
			categoryFood: "Food",
			categoryTech: "Tech",
			categoryOther: "Other",
			keywordManager: "Keyword manager",
			keywordEmpty: "No custom keywords yet",
			keywordRemove: "Remove",
			keywordEmojiPlaceholder: "emoji",
			keywordTextPlaceholder: "Keyword",
			keywordSettingsHint: "Tip: Batch edit in Settings → Custom Emoji Keywords",
		},
		eventManager: {
			solar: "Solar",
			lunar: "Lunar",
			date: "Date",
			calendar: {
				auto: "Auto detect",
				gregorian: "Gregorian",
				lunar: "Lunar",
				lunar_leap: "Lunar leap month",
			},
			actions: {
				add: "Add a new event",
				search: "Search events...",
				clearSearch: "Clear search",
				delete: "Delete event",
				edit: "Edit",
				yearlyCalendar: "Open yearly calendar",
				deleteConfirm: "Are you sure you want to delete this event?",
				location: "Open in event manager",
				openOriginalNote: "Open original note",
				toggleBuiltinEventHidden: "Toggle built-in events hidden",
				sort: {
					label: "Sort",
					name: "Event name",
					date: "Event date",
					asc: "Ascending",
					desc: "Descending",
				},
			},
			empty: {
				text: "No events found",
				subtext: "Click 'Add new event' to get started",
			},
			form: {
				edit: "Edit ",
				add: "Add ",
				editBasesEvent: "Edit note event",
				addBasesEvent: "Add note event",
				editDailyNoteEvent: "Edit daily note event",
				addDailyNoteEvent: "Add daily note event",
				dailyNoteDisabledField: "Not supported for daily note events",
				eventType: "Event type",
				eventName: "Event name",
				eventDate: "Event date",
				eventDuration: "Event duration",
				eventDurationInvalid: "Event duration must be an integer greater than or equal to 1. It will be saved as 1 day.",
				eventDurationEndDate: "Ends on: {{date}}",
				eventDateType: "Date type",
				optional: "Optional",
				eventHidden: "Hidden",
				eventEmoji: "Emoji",
				eventColor: "Color",
				eventRemark: "Remark",
				save: "Save",
				saving: "Saving...",
				cancel: "Cancel",
				reset: "Reset",
				submit: "Submit",
				selectPresetColor: "Select preset",
				eventCreated: "Event created",
				eventUpdated: "Event updated",
				eventDeleted: "Event deleted",
				saveFailed: "Failed to save: {{error}}",
			},
			dateError: {
				emptyDate: "Date cannot be empty, please enter a date",
				invalidZeroDate:
					"Year, month, and day cannot be zero: {{input}}, please check the date format",
				insufficientDate:
					"Incomplete date information: {{input}}, at least month and day are required",
				invalidFormatDate:
					"Incorrect date format: {{input}}, expected format is <b>month-day</b>, but input may be <b>year-month</b> or <b>year-day</b> format",
				invalidRangeDate:
					"Date out of valid range: {{input}}, expected format is <b>month-day</b>, but month or day values exceed normal range",
				unexpectedNumberLength:
					"Date value length does not meet requirements: {{length}} digits, expected <b>month-day</b> (2 digits) or <b>year-month-day</b> (3 digits) format",
				invalidLunarDate:
					"Unrecognized lunar date: {{input}}, please check if the lunar date format is correct",
				unknownChineseDigit:
					"Unrecognized Chinese digit: {{char}}, please check if the Chinese digit is written correctly",
			},
			help: {
				eventName: "Event name (cannot be empty)",
				eventDate:
					"Event date, must follow the order of year, month, and day.<br>" +
					"<b>Gregorian Calendar</b>:<br>" +
					"Standard format: 2025-01-01, 2025/01/01, 2025.01.01, 01-01, 01/01, 01.01<br>" +
					"Legacy format: 2025,01,01, 01,01<br>" +
					"Chinese format: 2025年01月01日, 01月01日<br>" +
					"<b>Lunar Calendar</b>:<br>" +
					"Standard format: 2025-01-01, 2025/01/01, 2025.01.01, 01-01, 01/01, 01.01<br>" +
					"Legacy format: 2025,6,1  2025,-6,1  6,1  -6,1<br>" +
					"Chinese format: 2025年正月初一, 正月初一, 闰二月初一, 二〇二五年闰六月初一",
				eventDuration:
					"Set the duration of the event in days<br>" +
					"Default is 1 day (single-day event)<br>" +
					"When set to a number greater than 1, the event will be displayed across multiple consecutive days. For example, setting it to 3 will display the event for 3 consecutive days",
				eventDateType:
					"Event date type, auto-detect or manually select<br>" +
					"<b>Auto detect</b>: Automatically determine if the input date is Gregorian, lunar, or lunar leap month<br>" +
					"<b>Gregorian</b>: Gregorian calendar date<br>" +
					"<b>Lunar</b>: Lunar calendar date<br>" +
					"<b>Lunar leap month</b>: Lunar leap month date, will automatically convert to lunar date if leap month doesn't exist",
				eventEmoji: "Event icon, currently supports using emoji",
				eventColor:
					"Event color, you can select preset colors or custom colors<br>" +
					"Preset colors are added in plugin settings",
				eventHidden:
					"Whether to hide the event (not displayed in the overview)<br>" +
					"Note: The event will still be visible in the event manager",
				eventRemark:
					"Additional information about the event, can be viewed when clicking on the event (or in the event manager)",
				customEventRepeat:
					"When selected, the event will repeat every year on the same date",
				holidayFoundDate:
					"Holiday founding date, will be used to calculate holiday anniversaries in future plans",
				frontmatterSync: "Sync to note's properties (frontmatter)",
				basesEventCreate: {
					label: "Create new note",
					text: "A new note will be created in the {{path}} folder after saving. Configure default path in plugin settings.",
					textWithName: "Will be saved as:",
				},
				basesEventEdit: {
					label: "Event Source",
					notePrefix: "This event is from note",
					syncText: "Changes will be synced to the original note's properties.",
				},
				dailyNoteEventCreate: {
					label: "Daily note event",
					text: "The event will be added to the daily note's frontmatter list",
					textDetailed: "The event will be added to the \"{{prop}}\" property in the daily note {{filename}}.",
					fileNotExist: "The daily note file does not exist yet and will be created automatically.",
				},
				dailyNoteEventEdit: {
					label: "Daily note event",
					text: "Changes will be written back to the daily note's frontmatter",
					dateChanged: "The event will be moved from the original daily note ({{oldDate}}) to the new daily note.",
				},
			},
			holiday: {
				name: "Holiday",
				foundDate: "Found date",
			},
			birthday: {
				name: "Birthday",
				age: "Age",
				nextBirthday: "Next birthday",
				animal: "Chinese zodiac",
				zodiac: "Zodiac",
				noYear: "Full year information required",
			},
			customEvent: {
				name: "Custom event",
				repeat: "Repeat",
			},
			basesEvent: {
				name: "Note event",
				sourceNote: "From note",
			},
			dailyNoteEvent: {
				name: "Daily event",
				sourceNote: "From daily note",
			},
			source: {
				bases: "From note",
				dailynote: "From daily note",
			},
			presetType: {
				label: "Type",
				none: "No type",
			},
		},
		dataPortView: {
			common: {
				actions: {
					selectAll: "Select all ",
					reverseAll: "Deselect all ",
					selectSummary: "Selected {{count}} events",
				},
			},
			export: {
				name: "Export",
				type: {
					configure: " Configure",
					markdown: {
						folderLabel: "Export folder",
						fieldsTitle: "Export fields",
						success:
							"Successfully exported {{count}} events to markdown files",
						failure:
							"Failed to export {{count}} events, please check the logs",
					},
				},
				actions: {
					handle: "Export selected events",
				},
				config: {
					fileName: "Export file name",
					year: "Export year",
					id: "ID",
					isoDate: "ISO date",
					calendar: "Calendar type",
					dateArr: "Date array",
					emoji: "Emoji",
					color: "Color",
					remark: "Remark",
					isHidden: "Is hidden",
					foundDate: "Found date",
					nextBirthday: "Next birthday",
					age: "Age",
					animal: "Chinese zodiac",
					zodiac: "Zodiac",
					isRepeat: "Is repeat",
				},
				empty: {
					text: "No data to export",
					subtext: "Please add events first",
					noDate: "No date",
					noSelectedEvents: "No events selected for export",
				},
			},
			import: {
				name: "Import",
				actions: {
					reset: "Reset selection",
					handle: "Import selected events",
					parseSummary:
						"Found {{validCount}} valid events, {{invalidCount}} invalid events",
				},
				type: {
					json: {
						title: "JSON File Import",
						format_example: "Example of valid JSON format",
						message:
							"<ul>" +
							"<li>File must be in JSON format</li>" +
							"<li>Events must contain <code>text</code> and <code>userInput</code> fields</li>" +
							"<li>Supports three event types: <code>holidays</code>, <code>birthdays</code>, <code>customEvents</code></li>" +
							"<ul>",
						upload: "Choose",
						paste: "Paste",
						pastePlaceholder: "Paste JSON content here",
						pasteError: "Parse error: {{error}}",
						submitPaste: "Parse JSON",
						success: "Successfully imported {{count}} events",
					},
				},
				empty: {
					text: "No importable events found",
					subtext: "Please check file content or file format",
				},
				warn: {
					invalidEvents: "Invalid events",
					nullText: "Missing event text",
					nullDate: "Missing user input date",
					duplicateEvent: "Event may already exist",
				},
			},
		},
	},
	command: {
		openYearlyGlance: "Open yearly glance",
		openGlanceManager: "Open glance manager",
		addEvent: "Add event",
		reloadPlugin: "Reload plugin",
	},
	common: {
		confirm: "Confirm",
		cancel: "Cancel",
		color: "Color",
		delete: "Delete",
		edit: "Edit",
	},
	notice: {
		setDefaultBasesEventPath: "Tip: Please select the default note event path in plugin settings",
		invalidFolderPath: "Folder \"{{path}}\" does not exist in the vault",
	},
	warning: {
		invalidDuration: "{{count}} event(s) have invalid duration values and will be treated as 1 day. Check the console for details.",
	},
	data: {
		sampleEvent: {
			text: "Install YG plugin",
			remark: "Welcome to use Yearly Glance plugin! This is a sample event. You can hide or delete it as needed.",
		},
		month: {
			jan: "January",
			feb: "February",
			mar: "March",
			apr: "April",
			may: "May",
			jun: "June",
			jul: "July",
			aug: "August",
			sep: "September",
			oct: "October",
			nov: "November",
			dec: "December",
		},

		week: {
			sun: "Sun.",
			mon: "Mon.",
			tue: "Tue.",
			wed: "Wed.",
			thu: "Thu.",
			fri: "Fri.",
			sat: "Sat.",
		},
		animal: {
			rat: "Rat",
			ox: "Ox",
			tiger: "Tiger",
			rabbit: "Rabbit",
			dragon: "Dragon",
			snake: "Snake",
			horse: "Horse",
			sheep: "Sheep",
			monkey: "Monkey",
			rooster: "Rooster",
			dog: "Dog",
			pig: "Pig",
		},
		zodiac: {
			aries: "Aries",
			taurus: "Taurus",
			gemini: "Gemini",
			cancer: "Cancer",
			leo: "Leo",
			virgo: "Virgo",
			libra: "Libra",
			scorpio: "Scorpio",
			sagittarius: "Sagittarius",
			capricorn: "Capricorn",
			aquarius: "Aquarius",
			pisces: "Pisces",
		},
		gan: {
			jia: "Jiǎ ",
			yi: "Yǐ ",
			bing: "Bǐng ",
			ding: "Dīng ",
			wu: "Wù ",
			ji: "Jǐ ",
			geng: "Gēng ",
			xin: "Xīn ",
			ren: "Rén ",
			gui: "Guǐ ",
		},
		zhi: {
			zi: "Zǐ ",
			chou: "Chǒu ",
			yin: "Yīn ",
			mao: "Mǎo ",
			chen: "Chén ",
			si: "Sì ",
			wu: "Wǔ ",
			wei: "Wèi ",
			shen: "Shēn ",
			you: "Yǒu ",
			xu: "Xū ",
			hai: "Hài ",
		},
		color: {
			red: "Red",
			orange: "Orange",
			yellow: "Yellow",
			green: "Green",
			blue: "Blue",
			purple: "Purple",
			brown: "Brown",
		},
	},
};

export default translations;
