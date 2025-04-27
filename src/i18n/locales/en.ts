import { BaseMessage } from "../types";

const translations: BaseMessage = {
	setting: {
		title: "Yearly Glance",
		desc: "Customize annual event overview",
		general: {
			name: "General",
			desc: "View configuration",
			title: {
				name: "Title",
				desc: "Use {{year}} placeholder when customizing, otherwise use the default title",
			},
			layout: {
				name: "Layout",
				desc: "Layout, row x column",
			},
			viewType: {
				name: "View Type",
				desc: "Select the view type",
				options: {
					calendar: "Calendar",
					list: "List",
				},
			},
			showWeekdays: {
				name: "Show Weekdays",
				desc: "Show weekdays in calendar view",
			},
			highlightToday: {
				name: "Highlight Today",
				desc: "Highlight today in calendar view",
			},
			highlightWeekends: {
				name: "Highlight Weekends",
				desc: "Highlight weekends in calendar view",
			},
			showLegend: {
				name: "Show Legend",
				desc: "Show event type legend",
			},
			limitListHeight: {
				name: "Limit List Height",
				desc: "Limit the height of the list view",
			},
			eventFontSize: {
				name: "Event Font Size",
				desc: "Set the font size of the event text",
				options: {
					small: "Small",
					medium: "Medium",
					large: "Large",
				},
			},
			showHolidays: {
				name: "Show Holidays",
				desc: "Show holidays in calendar view",
			},
			showBirthdays: {
				name: "Show Birthdays",
				desc: "Show birthdays in calendar view",
			},
			showCustomEvents: {
				name: "Show Custom Events",
				desc: "Show custom events in calendar view",
			},
			mondayFirst: {
				name: "Monday as the first day of the week",
				desc: "Set Monday (instead of Sunday) as the first day of the week",
			},
			showTooltips: {
				name: "Show Event Tooltips",
				desc: "Show event details when hovering over an event",
			},
			colorful: {
				name: "Colorful Theme",
				desc: "Use different colors for each month",
			},
		},
		events: {
			name: "Events",
			desc: "Event management",
		},
	},
	view: {
		yearlyGlance: {
			name: "Yearly Glance",
			yearlyCalendar: " Year Calendar",
			legend: {
				holiday: "Holiday",
				birthday: "Birthday",
				customEvent: "Custom Event",
			},
			viewPreset: {
				yearOverview: "Year Overview",
				classicCalendar: "Classic Calendar",
				custom: "Custom layout",
			},
			actions: {
				clickToShow: "Click to Show ",
				clickToHide: "Click to Hide ",
				form: "Add Event",
				manager: "Open Event Manager",
				limitListHeight: "Limit List Height",
				hideEmptyDates: "Hide Empty Dates",
				// other actions
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
		},
		eventManager: {
			name: "Event Manager",
			solar: "Solar",
			lunar: "Lunar",
			date: "Date",
			actions: {
				add: "Add New Event",
				search: "Search Events...",
				clearSearch: "Clear Search",
				delete: "Delete Event",
				edit: "Edit",
				yearlyCalendar: "Open Yearly Calendar",
				deleteConfirm: "Are you sure you want to delete this event?",
				location: "Open in Event Manager",
				toggleBuiltinEventHidden: "Toggle Builtin Event Hidden",
				sort: {
					name: "Event Name",
					date: "Event Date",
					asc: "Ascending",
					desc: "Descending",
				},
			},
			empty: {
				text: "No Events",
				subtext: "Click the 'Add New Event' button above to create",
			},
			form: {
				edit: "Edit",
				add: "Add",
				eventType: "Event Type",
				eventName: "Name Field",
				eventDate: "Event Date",
				eventDateType: "Event Date Type",
				optional: "Optional",
				eventRepeat: "Repeat",
				eventHidden: "Hidden",
				eventEmoji: "Event Emoji",
				eventColor: "Event Color",
				eventRemark: "Event Remark",
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
			},
			holiday: {
				name: "Holiday",
				type: "Type",
				foundDate: "Found Date",
				builtin: "Builtin Holiday",
				custom: "Custom Holiday",
			},
			birthday: {
				name: "Birthday",
				age: "Age",
				nextBirthday: "Next Birthday",
				animal: "Chinese Zodiac",
				zodiac: "Zodiac",
				noYear: "Need to fill in the full year data",
			},
			customEvent: {
				name: "Custom Event",
				repeat: "Repeat",
			},
		},
	},
	command: {
		openYearlyGlance: "Open Yearly Glance",
		openEventManager: "Open Events Manager",
		addEvent: "Add Event",
		reloadPlugin: "Reload Plugin",
	},
	common: {
		confirm: "Confirm",
		cancel: "Cancel",
	},
	data: {
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
	},
};

export default translations;
