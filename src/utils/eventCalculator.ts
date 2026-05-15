import { Lunar, Solar } from "lunar-typescript";
import { Birthday, CustomEvent, EventType, Holiday } from "@/src/type/Events";
import { getBirthdayKeyId } from "@/src/i18n/birthday";
import { IsoUtils } from "./isoUtils";
import { LunarLibrary } from "./lunarLibrary";
import { SpecialHoliday } from "./specialHoliday";
import { CalendarType } from "@/src/type/Date";

export class EventCalculator {
	/**
	 * 计算当前选择年份下事件日期数组
	 * @param eventType 事件类型
	 * @param isoDate ISO日期字符串
	 * @param calendar 日期类型
	 * @param yearSelected 当前选择的年份
	 * @param isRepeat 是否为重复事件，针对customEvent
	 * @returns 日期数组
	 *
	 * 优化逻辑：
	 * 1. 对于不重复的自定义事件且有年份：不随yearSelected变动，直接计算出公历日期
	 * 2. 对于生日：当yearSelected小于出生日期公历的年份时不计算
	 * 3. 其他情况：正常使用yearSelected来计算
	 */
	static calculateDateArr(
		eventType: EventType,
		isoDate: string,
		calendar: CalendarType,
		yearSelected: number,
		isRepeat?: boolean | undefined
	) {
		if (!isoDate) return [];

		let parsed;
		try {
			parsed = IsoUtils.parse(isoDate, calendar);
		} catch (e) {
			console.warn(`[YearlyGlance] Failed to parse date "${isoDate}":`, e);
			return [];
		}
		const { year, month, day } = parsed;

		// Basic validation: month must be 1-12, day must be 1-31
		if (month < 1 || month > 12 || day < 1 || day > 31) {
			console.warn(`[YearlyGlance] Invalid date values in "${isoDate}": month=${month}, day=${day}`);
			return [];
		}

		// 对于不重复的自定义事件且有年份，只需要计算出公历日期，不随yearSelected变动
		if (
			eventType === "customEvent" &&
			(isRepeat === undefined || isRepeat === false) &&
			year !== undefined
		) {
			if (calendar === "GREGORIAN") {
				return [Solar.fromYmd(year, month, day).toString()];
			} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
				const monthL = calendar === "LUNAR_LEAP" ? -month : month;
				return [Lunar.fromYmd(year, monthL, day).getSolar().toString()];
			} else {
				return [];
			}
		}

		// 对于生日，当yearSelected小于出生日期公历的年份时不计算
		if (eventType === "birthday" && year !== undefined) {
			let birthYearInGregorian = year;

			// 如果是农历生日，需要先转换为公历年份进行比较
			if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
				const monthL = calendar === "LUNAR_LEAP" ? -month : month;
				const lunarBirth = Lunar.fromYmd(year, monthL, day);
				birthYearInGregorian = lunarBirth.getSolar().getYear();
			}

			// 如果选择的年份小于出生年份，返回空数组
			if (yearSelected < birthYearInGregorian) {
				return [];
			}
		}

		// 对于节日、生日以及重复的自定义事件，均忽略date本身的year，而使用yearSelected
		if (calendar === "GREGORIAN") {
			return [Solar.fromYmd(yearSelected, month, day).toString()];
		} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
			const monthL = calendar === "LUNAR_LEAP" ? -month : month;
			const dateArr: string[] = [];

			const lunarCurrent = LunarLibrary.constructLunar(
				yearSelected,
				monthL,
				day
			);
			const lunarLast = LunarLibrary.constructLunar(
				yearSelected - 1,
				monthL,
				day
			);

			if (lunarCurrent.getSolar().getYear() === yearSelected) {
				dateArr.push(lunarCurrent.getSolar().toString());
			}

			if (lunarLast.getSolar().getYear() === yearSelected) {
				dateArr.push(lunarLast.getSolar().toString());
			}

			return dateArr.sort((a, b) => a.localeCompare(b));
		} else {
			return [];
		}
	}

	/**
	 * 更新节假日信息
	 * @param holidays 节假日数组
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的节假日数组
	 */
	static updateHolidaysInfo(holidays: Holiday[], yearSelected: number) {
		return holidays.map((holiday) =>
			this.updateHolidayInfo(holiday, yearSelected)
		);
	}

	/**
	 * 更新单个节假日信息
	 * @param holiday 节假日对象
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的节假日对象
	 */
	static updateHolidayInfo(holiday: Holiday, yearSelected: number) {
		const { id } = holiday;
		let isoDate: string = holiday.eventDate.isoDate;
		const calendar = holiday.eventDate.calendar;

		// 空值检查
		if (!isoDate) {
			console.warn("[YearlyGlance] Holiday isoDate is undefined, skipping update:", holiday);
			return holiday;
		}

		// TODO: 完善节气节日的处理
		if (id === "holi-wblqm") {
			// 清明节
			const qingMing = SpecialHoliday.solarTerm(yearSelected, "清明");
			isoDate = qingMing;
		} else if (id === "holi-wbldz") {
			// 冬至
			const dongZhi = SpecialHoliday.solarTerm(yearSelected, "冬至");
			isoDate = dongZhi;
		}

		const dateArr = this.calculateDateArr(
			"holiday",
			isoDate,
			calendar,
			yearSelected
		);

		// 如果 dateArr 为空，返回原始数据，避免覆盖 eventDate.isoDate
		if (dateArr.length === 0) {
			console.warn("[YearlyGlance] Holiday dateArr is empty, skipping update:", holiday);
			return holiday;
		}

		return {
			...holiday,
			dateArr,
		};
	}

	/**
	 * 更新自定义事件信息
	 * @param customEvents 自定义事件数组
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的自定义事件数组
	 */
	static updateCustomEventsInfo(
		customEvents: CustomEvent[],
		yearSelected: number
	) {
		return customEvents.map((customEvent) =>
			this.updateCustomEventInfo(customEvent, yearSelected)
		);
	}

	/**
	 * 更新单个自定义事件信息
	 * @param customEvent 自定义事件对象
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的自定义事件对象
	 */
	static updateCustomEventInfo(
		customEvent: CustomEvent,
		yearSelected: number
	) {
		const isoDate = customEvent.eventDate.isoDate;
		const calendar = customEvent.eventDate.calendar;

		// 空值检查
		if (!isoDate) {
			console.warn("[YearlyGlance] CustomEvent isoDate is undefined, skipping update:", customEvent);
			return customEvent;
		}

		const dateArr = this.calculateDateArr(
			"customEvent",
			isoDate,
			calendar,
			yearSelected,
			customEvent.isRepeat
		);

		// 如果 dateArr 为空，返回原始数据，避免覆盖 eventDate.isoDate
		if (dateArr.length === 0) {
			console.warn("[YearlyGlance] CustomEvent dateArr is empty, skipping update:", customEvent);
			return customEvent;
		}

		return {
			...customEvent,
			dateArr,
		};
	}

	/**
	 * 更新所有生日信息
	 * @param birthdays 生日数组
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的生日数组
	 */
	static updateBirthdaysInfo(birthdays: Birthday[], yearSelected: number) {
		return birthdays.map((birthday) =>
			this.updateBirthdayInfo(birthday, yearSelected)
		);
	}

	/**
	 * 更新单个生日信息
	 * @param birthday 生日对象
	 * @param yearSelected 当前选择的年份
	 * @returns 更新后的生日对象
	 */
	static updateBirthdayInfo(birthday: Birthday, yearSelected: number) {
		const isoDate = birthday.eventDate.isoDate;
		const calendar = birthday.eventDate.calendar;

		// 空值检查
		if (!isoDate) {
			console.warn("[YearlyGlance] Birthday isoDate is undefined, skipping update:", birthday);
			return birthday;
		}

		const dateArr = this.calculateDateArr(
			"birthday",
			isoDate,
			calendar,
			yearSelected
		);

		// 如果 dateArr 为空（例如 yearSelected < birthYear），返回原始数据，避免覆盖 eventDate.isoDate
		if (dateArr.length === 0) {
			console.warn("[YearlyGlance] Birthday dateArr is empty, skipping update:", birthday);
			return birthday;
		}

		// 从 eventDate.isoDate 解析出生年份，用于年龄和生肖计算
		// isoDate 是标准 ISO 格式（YYYY-MM-DD 或 MM-DD），userInput.input 是用户原始输入，不能直接 parse
		const { year, month, day } = IsoUtils.parse(isoDate, calendar);
		const todaySolar = Solar.fromDate(new Date());

			const dateArr = this.calculateDateArr(
				"birthday",
				isoDate,
				calendar,
				yearSelected
			);

			// 如果 dateArr 为空（例如 yearSelected < birthYear），返回原始数据，避免覆盖 eventDate.isoDate
			if (dateArr.length === 0) {
				console.warn("[YearlyGlance] Birthday dateArr is empty, skipping update:", birthday);
				return birthday;
			}

			if (year !== undefined) {
				const xingzuo = Solar.fromYmd(year, month, day).getXingZuo();
				zodiac = getBirthdayKeyId(xingzuo, "zodiac");

				const ganzhi = Solar.fromYmd(year, month, day)
					.getLunar()
					.getYearInGanZhi();
				const shengxiao = Solar.fromYmd(year, month, day)
					.getLunar()
					.getYearShengXiao();
				// 获取生肖：存储格式 "ganzhi_key:animal_key"
				const ganzhiKey = getBirthdayKeyId(ganzhi, "ganzhi");
				const animalKey = getBirthdayKeyId(shengxiao, "animal");
				animal = ganzhiKey && animalKey ? `${ganzhiKey}:${animalKey}` : null;
			} else {
				const xingzuo = Solar.fromYmd(
					yearSelected,
					month,
					day
				).getXingZuo();
				zodiac = getBirthdayKeyId(xingzuo, "zodiac");
				animal = null;
			}
		} else if (calendar === "LUNAR" || calendar === "LUNAR_LEAP") {
			currentYearBirthday = LunarLibrary.constructLunar(
				yearSelected,
				month,
				day
			).getSolar();
			nextYearBirthday = LunarLibrary.constructLunar(
				yearSelected + 1,
				month,
				day
			).getSolar();

			// 判断应该使用哪一个
			if (todaySolar.isBefore(currentYearBirthday)) {
				// 如果今年的农历生日还没到，使用今年的
				nextBirthday = currentYearBirthday.toString();
			} else {
				// 如果今年的农历生日已过，使用明年的
				nextBirthday = nextYearBirthday.toString();
			}

			if (year !== undefined) {
				const xingzuo = Lunar.fromYmd(year, month, day)
					.getSolar()
					.getXingZuo();
				zodiac = getBirthdayKeyId(xingzuo, "zodiac");

				const ganzhi = Lunar.fromYmd(
					year,
					month,
					day
				).getYearInGanZhi();
				const shengxiao = Lunar.fromYmd(
					year,
					month,
					day
				).getYearShengXiao();
				// 获取生肖：存储格式 "ganzhi_key:animal_key"
				const ganzhiKey = getBirthdayKeyId(ganzhi, "ganzhi");
				const animalKey = getBirthdayKeyId(shengxiao, "animal");
				animal = ganzhiKey && animalKey ? `${ganzhiKey}:${animalKey}` : null;
			} else {
				// 对于农历生日，如果没有年份，无法计算星座，生肖和干支
				zodiac = null;
				animal = null;
			}
		}

		// 计算年龄
		let age;
		if (year !== undefined) {
			// 当今天还未过生日时，年龄为当前年份减去出生年份再减1
			age = todaySolar.isBefore(currentYearBirthday)
				? todaySolar.getYear() - year - 1
				: todaySolar.getYear() - year;
		} else {
			age = null;
		}

		return {
			...birthday,
			dateArr,
			nextBirthday,
			age,
			animal,
			zodiac,
		};
		} catch (error) {
			console.warn(`[YearlyGlance] Failed to update birthday info for "${birthday.text}":`, error);
			return birthday;
		}
	}
}
