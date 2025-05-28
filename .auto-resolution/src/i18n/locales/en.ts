import { BaseMessage } from "../types";

const translations: BaseMessage = {
	setting: {
		title: "Yearly glance",
		desc: "Configure your yearly event overview",
		general: {
			name: "General",
			desc: "View configuration",
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
=======
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
				// other actions
			},
		},
		eventManager: {
			name: "Event manager",
			solar: "Solar",
			lunar: "Lunar",
			date: "Date",
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
				eventRepeat: "Repeat",
				eventHidden: "Hidden",
				eventEmoji: "Event emoji",
				eventColor: "Event color",
				eventRemark: "Event remark",
				save: "Save",
				cancel: "Cancel",
				reset: "Reset",
				submit: "Submit",
				eventDateHelp:
					"<b>Format:</b><br>" +
					"YYYY-M-D or M-D<br>" +
					"<b>Solar Calendar:</b><br>" +
					"• 2025-01-01 = January 1, 2025<br>" +
					"<b>Lunar Calendar:</b><br>" +
					"• 2025-01-01 = The 1st day of the 1st month, 2025<br>" +
					"• 2025-06-01! = The 1st day of the intercalary (leap) 6th month, 2025",
				selectDateType: "Select",
				previousDate: "Previous ",
				nextDate: "Next ",
				year: "Year",
				month: "Month",
				day: "Day",
				selectPresetColor: "Select preset",
			},
			holiday: {
				name: "Holiday",
				type: "Type",
				foundDate: "Found date",
				builtin: "Builtin holiday",
				custom: "Custom holiday",
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
			red: "System-Red",
			orange: "System-Orange",
			yellow: "System-Yellow",
			green: "System-Green",
			blue: "System-Blue",
			purple: "System-Purple",
			brown: "System-Brown",
		},
	},
};

export default translations;
