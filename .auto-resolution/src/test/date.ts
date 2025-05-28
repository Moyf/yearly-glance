// 测试tyme4的相关输出
import {
	Lunar,
	LunarMonth,
	LunarYear,
	Solar,
	SolarMonth,
	SolarYear,
} from "lunar-typescript";

export class lunarTest {
	constructor() {}

	static test() {
		// this.testLunarDay();
		// this.testSolarDay();
	}

	static testLunarDay() {
		console.debug("---lunarTest---");

		const lunarDay = Lunar.fromYmd(2025, 6, 1);
		const lunarDayWithLeap = Lunar.fromYmd(2025, -6, 1);
		const lunarMonth = LunarMonth.fromYm(2025, 6);
		const lunarYear = LunarYear.fromYear(2025);

		console.debug("lunarMonth", lunarMonth);
		console.debug("lunarYear", lunarYear);
		console.debug("lunarMonths", lunarYear.getMonths());
		console.debug("lunarMonthsInYear", lunarYear.getMonthsInYear());

		console.debug("lunarDay", lunarDay);
		console.debug("lunarDayString", lunarDay.toString());
		// 二〇二五年六月初一
		console.debug("lunarDay To SolarDay", lunarDay.getSolar());
		// {_year: 2025, _month: 6, _day: 25, _hour: 0, _minute: 0, ...}

		console.debug("lunarDayWithLeap", lunarDayWithLeap);
		console.debug("lunarDayWithLeapString", lunarDayWithLeap.toString());
		// 二〇二五年闰六月初一
		console.debug(
			"lunarDayWithLeap To SolarDay",
			lunarDayWithLeap.getSolar()
		);
		// {_year: 2025, _month: 7, _day: 25, _hour: 0, _minute: 0, ...}
	}

	static testSolarDay() {
		console.debug("---solarTest---");

		const solarDay = Solar.fromYmd(2025, 6, 25);
		const solarDayWithLeap = Solar.fromYmd(2025, 7, 25);
		const solarMonth = SolarMonth.fromYm(2025, 6);
		const solarYear = SolarYear.fromYear(2025);

		console.debug("solarMonth", solarMonth);
		console.debug("solarYear", solarYear);
		console.debug("solarMonths", solarYear.getMonths());

		console.debug("solarDay", solarDay);
		console.debug("solarDayString", solarDay.toString());
		// 2025-06-25
		console.debug("solarDay To LunarDay", solarDay.getLunar());
		// {_year: 2025, _month: 6, _day: 1, _hour: 0, _minute: 0, ...}

		console.debug("solarDayWithLeap", solarDayWithLeap);
		console.debug("solarDayWithLeapString", solarDayWithLeap.toString());
		// 2025-07-25
		console.debug(
			"solarDayWithLeap To LunarDay",
			solarDayWithLeap.getLunar()
		);
		// {_year: 2025, _month: -6, _day: 1, _hour: 0, _minute: 0, ...}
	}
}
