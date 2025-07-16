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
				desc: "Show lunar day in view",
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
				manager: "Open event manager",
				limitListHeight: "Limit list height",
				hideEmptyDates: "Hide empty dates",
				emojiOnTop: "Display emoji on top",
				wrapText: "Toggle text wrapping",
				showTooltips: "Mouse hover to show full event name",
			},
		},
		eventManager: {
			name: "Event manager",
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
				eventDateType: "Event date type",
				optional: "Optional",
				eventHidden: "Event hidden",
				eventEmoji: "Event emoji",
				eventColor: "Event color",
				eventRemark: "Event remark",
				save: "Save",
				cancel: "Cancel",
				reset: "Reset",
				submit: "Submit",
				selectPresetColor: "Select preset",
			},
			dateError: {
				emptyDate: "Date cannot be empty, please enter a date",
				invalidZeroDate:
					"The year, month, and day values in a date cannot be zero: {{input}}. Please check the date format",
				insufficientDate:
					"Insufficient numbers in input: {{input}}. Expected at least 2 numbers",
				invalidFormatDate:
					"Invalid date format: {{input}}. Expected MM-DD format, but got possible YYYY-MM or YYYY-DD format",
				invalidRangeDate:
					"Invalid date format: {{input}}. Numbers out of valid range for MM-DD format",
				unexpectedNumberLength:
					"Unexpected numbers length: {{length}}. Expected 2 or 3 numbers",
				invalidLunarDate:
					"Cannot parse lunar date: {{input}}. Please check the lunar date format",
				unknownChineseDigit:
					"Cannot recognize Chinese digit: {{char}}. Please check the Chinese digit format",
			},
			help: {
				eventName: "Event display name, cannot be empty",
				eventDate:
					"Event date, must follow YMD order<br>" +
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
					"Event hidden, will not be displayed in the yearly calendar",
				eventRemark: "Event notes",
				customEventRepeat:
					"Custom event repeat, events that occur every year can be set to repeat",
				holidayFoundDate:
					"Holiday founding date, will be used to calculate holiday anniversaries in future plans",
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
				repeat: "Event repeat",
			},
		},
	},
	command: {
		openYearlyGlance: "Open yearly glance",
		openEventManager: "Open events manager",
		addEvent: "Add event",
		reloadPlugin: "Reload plugin",
	},
	common: {
		confirm: "Confirm",
		cancel: "Cancel",
	},
	data: {
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
