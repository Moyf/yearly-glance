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
			mondayFirst: {
				name: "Start week on Monday",
				desc: "Use Monday as the first day of the week",
			},
			showTooltips: {
				name: "Event tooltips",
				desc: "Display details when hovering events",
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
				name: "Show emoji before tab name",
				desc: "Show emoji before tab names in the UI",
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
			layout: {
				name: "Layout",
				desc: "Overall layout and view type of the calendar.",
			},
			displayContent: {
				name: "Style",
				desc: "Appearance-related options for the calendar.",
			},
			eventDisplay: {
				name: "Event Display",
				desc: "Settings for events, holidays, birthdays, etc.",
			},
			colorSets: {
				name: "Color",
				desc: "Color configuration related content",
			},
		},
	},
	view: {
		basesView: {
			options: {
				propTitle: "Title Property",
				propDate: "Date Property",
				inheritPluginData: "Inherit Plugin Data",
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
			yearlyCalendar: "Year calendar",
			legend: {
				holiday: "Holiday",
				birthday: "Birthday",
				customEvent: "Custom event",
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
				toggleBuiltinEventHidden: "Toggle built-in events hidden",
				sort: {
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
				edit: "Edit",
				add: "Add",
				eventType: "Event type",
				eventName: "Event name",
				eventDate: "Event date",
				eventDateType: "Date type",
				optional: "Optional",
				eventHidden: "Hidden",
				eventEmoji: "Emoji",
				eventColor: "Color",
				eventRemark: "Remark",
				save: "Save",
				cancel: "Cancel",
				reset: "Reset",
				submit: "Submit",
				selectPresetColor: "Select preset",
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
				frontmatterSync: "Sync to note metadata (frontmatter)",
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
