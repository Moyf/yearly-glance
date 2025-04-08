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
				desc: "Customize annual event overview title, leave blank for default title",
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
			yearlyCalendar: "{year} Year Calendar",
			legend: {
				holiday: "Holiday",
				birthday: "Birthday",
				customEvent: "Custom Event",
			},
			actions: {
				form: "Add Event",
				manager: "Open Event Manager",
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
			actions: {
				add: "Add New Event",
				search: "Search Events...",
				clearSearch: "Clear Search",
				delete: "Delete Event",
				edit: "Edit",
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
				eventEmoji: "Event Emoji",
				eventColor: "Event Color",
				eventRemark: "Event Remark",
				save: "Save",
				cancel: "Cancel",
				reset: "Reset",
				eventDateHelp:
					"<b>Format:</b> YYYY,MM,DD or MM,DD" +
					"<b>Solar Calendar:</b>" +
					"• 2025,1,1 = January 1, 2025" +
					"<b>Lunar Calendar:</b>" +
					"• 2025,1,1 = First day of first month, 2025<br>" +
					"• 2025,-6,1 = First day of intercalary sixth month, 2025",
			},
			holiday: {
				name: "Holiday",
				type: "Type",
				isShow: "Is Show",
				foundDate: "Found Date",
				internat: "Internat",
				custom: "Custom",
			},
			birthday: {
				name: "Birthday",
				age: "Age",
				nextBirthday: "Next Birthday",
				animal: "Animal",
				zodiac: "Zodiac",
			},
			customEvent: {
				name: "Custom Event",
				repeat: "Repeat",
			},
		},
	},
	command: {
		openYearlyGlance: "Open Yearly Glance",
		openEventManager: "Open Yearly Glance Events Manager",
		addEvent: "Add Event",
	},
};

export default translations;
