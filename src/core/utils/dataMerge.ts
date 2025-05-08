import { YearlyGlanceConfig } from "../interfaces/types";
import { BUILTIN_HOLIDAYS } from "../data/builtinHolidays";
import { Holiday } from "../interfaces/Events";
import YearlyGlancePlugin from "@/src/main";

/**
 * 数据迁移工具：将配置数据升级到最新版本
 * @param savedData 从存储中加载的原始数据
 * @returns 迁移后的数据
 */
export function migrateData(plugin: YearlyGlancePlugin): YearlyGlanceConfig {
	const savedData = plugin.settings;
	if (!savedData) return savedData;

	// 创建数据的深拷贝，避免修改原始数据
	const migratedData = structuredClone(savedData);

	// 执行各种迁移操作
	migrateHolidayTypes(migratedData.data);
	migrateDateObjToDateArr(migratedData.data);
	migrateBuiltinHolidays(migratedData.data, plugin.settings.config.year);

	return migratedData;
}

/**
 * 合并内置节日数据，确保添加新的内置节日同时保留用户自定义设置
 * @param data 需要合并内置节日的数据
 */
function migrateBuiltinHolidays(
	data: YearlyGlanceConfig["data"],
	year: number
): void {
	// 确保数据对象存在
	if (!data) {
		return;
	}

	// 如果holidays数组不存在，初始化为空数组
	if (!data.holidays) {
		data.holidays = [];
	}

	// 确保holidays是数组类型
	if (!Array.isArray(data.holidays)) {
		data.holidays = [];
	}

	// 创建用户节日的副本，我们将在此基础上进行修改
	const userHolidays = [...data.holidays];
	const finalHolidays = [...userHolidays]; // 最终的节日列表
	const newHolidayIds = new Set<string>(); // 用于跟踪新添加的节日ID

	// 遍历所有内置节日
	for (const builtinHoliday of BUILTIN_HOLIDAYS(year)) {
		let existingHoliday: Holiday | undefined;

		// 首先通过ID查找匹配
		existingHoliday = userHolidays.find(
			(holiday) => holiday.id === builtinHoliday.id
		);

		if (existingHoliday) {
			// 找到匹配ID的节日，确保类型为BUILTIN
			existingHoliday.type = "BUILTIN";
			continue; // 已存在，无需添加
		}

		// 其次通过text, date, dateType组合查找
		existingHoliday = userHolidays.find(
			(holiday) =>
				holiday.text === builtinHoliday.text &&
				holiday.date === builtinHoliday.date &&
				holiday.dateType === builtinHoliday.dateType
		);

		if (existingHoliday) {
			// 找到匹配属性的节日，更新其ID和类型
			existingHoliday.id = builtinHoliday.id;
			existingHoliday.type = "BUILTIN";
			continue; // 已处理，无需添加
		}

		// 如果没有找到匹配的节日，则需要添加新的内置节日
		// 创建新节日对象，确保类型安全
		if (!newHolidayIds.has(builtinHoliday.id)) {
			finalHolidays.push({
				...builtinHoliday,
				type: "BUILTIN", // 确保类型正确
			});
			newHolidayIds.add(builtinHoliday.id);
		}
	}

	// 更新数据中的节日列表
	if (finalHolidays.length > userHolidays.length) {
		data.holidays = finalHolidays;
	} else if (userHolidays.length === 0 && finalHolidays.length > 0) {
		data.holidays = finalHolidays;
	}
}

/**
 * 将节日类型从 INTERNAT 迁移到 BUILTIN
 * @param data 需要迁移的数据
 */
function migrateHolidayTypes(data: YearlyGlanceConfig["data"]): void {
	// 确保数据结构存在
	if (!data?.holidays || !Array.isArray(data.holidays)) {
		return;
	}

	// 遍历所有节日，替换类型
	for (const holiday of data.holidays) {
		// 使用类型断言解决类型不兼容问题
		// 因为我们正在处理的是旧版数据，可能包含不在当前类型定义中的值
		if ((holiday as { type: string }).type === "INTERNAT") {
			holiday.type = "BUILTIN";
		}
	}
}

/**
 * 将 BaseEvent 中的 dateObj 字段迁移为 dateArr
 * @param data 需要迁移的数据
 */
function migrateDateObjToDateArr(data: YearlyGlanceConfig["data"]): void {
	// 确保数据结构存在
	if (!data) {
		return;
	}

	// 需要迁移的事件类型数组
	const eventTypes = ["birthdays", "holidays", "customEvents"];

	// 遍历所有事件类型
	for (const type of eventTypes) {
		if (!data[type] || !Array.isArray(data[type])) {
			continue;
		}

		// 遍历该类型的所有事件
		for (const event of data[type]) {
			if (event.dateObj) {
				// 删除原有的 dateObj 字段
				delete event.dateObj;
			}
		}
	}
}
