import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/type/Config";
import { BaseEvent, Birthday } from "@/src/type/Events";
import { CalendarType } from "@/src/type/Date";
import { parseUserDateInput } from "@/src/service/DateParseService";
import { reverseTranslationToKey } from "@/src/i18n/birthday";

interface LegacyEvent extends BaseEvent {
	date?: string;
	dateType?: "SOLAR" | "LUNAR";
}

export class MigrateData {
	/**
	 * v2.x -> v3.x 的数据迁移更新
	 * 1. 将旧的 dateType: SOLAR -> calendar: GREGORIAN
	 * 2. 将旧的 dateType: LUNAR -> calendar: LUNAR 或 LUNAR_LEAP (根据闰月判断)
	 * 3. 创建新的 EventDate 结构，包含 core 和 userInput
	 * @param data v2.x 的数据对象
	 * @returns 迁移后的 v3.x 数据对象
	 */
	static migrateV2(plugin: YearlyGlancePlugin): YearlyGlanceConfig {
		const data = plugin.settings;
		if (!data) return data;

		// 创建数据的深拷贝，避免修改原始数据
		const migratedData = structuredClone(data);

		// 迁移 showEmojiBeforeTabName 配置
		if (typeof migratedData.config.showEmojiBeforeTabName === "boolean") {
			migratedData.config.showEmojiBeforeTabName = migratedData.config.showEmojiBeforeTabName ? "emoji" : "none";
		}

		// 迁移 customEmojiKeywords 字段
		if (!migratedData.config.customEmojiKeywords) {
			migratedData.config.customEmojiKeywords = {};
		}

		const eventTypes = ["holidays", "birthdays", "customEvents"];

		for (const type of eventTypes) {
			// 检查当前类型的事件是否为数组
			const events = migratedData.data[type];
			if (Array.isArray(events)) {
				// 对数组中的每个事件进行迁移
				for (const event of events) {
					this.migrateEventV2(event);
				}
			}
		}

		// 迁移生日的 zodiac/animal 字段到 key-based 格式
		this.migrateBirthdayTranslations(migratedData);

		// Ensure new config fields have defaults (belt-and-suspenders alongside DEFAULT_SETTINGS spread)
		if (!Array.isArray(migratedData.config.eventPresetTypes)) {
			migratedData.config.eventPresetTypes = [];
		}
		if (!migratedData.config.basesEventPresetTypeProp) {
			migratedData.config.basesEventPresetTypeProp = "event_type";
		}

		return migratedData;
	}

	/**
	 * 迁移单个事件到新的结构
	 * @param event 需要迁移的事件对象
	 */
	private static migrateEventV2(event: LegacyEvent): void {
		if (!event) return;

		const oldDate = event.date;
		const oldDateType = event.dateType;

		if (!oldDate || !oldDateType) return;

		// 迁移dateType到新的calendar类型
		let calendar: CalendarType;
		const dateInput = oldDate;

		// 1. SOLAR -> GREGORIAN
		if (oldDateType === "SOLAR") {
			calendar = "GREGORIAN";
		}

		// 2. LUNAR -> LUNAR 或 LUNAR_LEAP
		else if (oldDateType === "LUNAR") {
			if (oldDate.includes("-")) {
				calendar = "LUNAR_LEAP";
			} else {
				calendar = "LUNAR";
			}
		} else {
			// 未知类型，默认为公历
			calendar = "GREGORIAN";
		}

		// 3. 创建新的EventDate结构
		const standardDate = parseUserDateInput(dateInput, calendar);

		event.eventDate = {
			...standardDate,
			userInput: {
				input: dateInput,
				calendar: calendar,
			},
		};
	}

	/**
	 * 迁移生日的 zodiac/animal 字段从翻译文本到 key-based 格式
	 * 检测方式：如果值中不包含 ":" 和 "-" 组合（新格式 animal），
	 * 或者值不是纯英文小写（新格式 zodiac），则需要迁移
	 */
	private static migrateBirthdayTranslations(data: YearlyGlanceConfig): void {
		const birthdays = data.data.birthdays;
		if (!Array.isArray(birthdays)) return;

		for (const birthday of birthdays) {
			// 迁移 zodiac
			if (birthday.zodiac && !this.isZodiacKey(birthday.zodiac)) {
				const key = reverseTranslationToKey(birthday.zodiac, "zodiac");
				if (key) {
					birthday.zodiac = key;
				}
			}

			// 迁移 animal
			if (birthday.animal && !this.isAnimalKey(birthday.animal)) {
				const key = reverseTranslationToKey(birthday.animal, "animal");
				if (key) {
					birthday.animal = key;
				}
			}
		}
	}

	/**
	 * 检测 zodiac 值是否已经是 key 格式（纯英文小写）
	 */
	private static isZodiacKey(value: string): boolean {
		const ZODIAC_KEYS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
			"libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
		return ZODIAC_KEYS.includes(value);
	}

	/**
	 * 检测 animal 值是否已经是 key 格式（包含 ":" 分隔符）
	 */
	private static isAnimalKey(value: string): boolean {
		// 新格式: "jia-zi:rat"
		return value.includes(":") && value.includes("-");
	}
}
