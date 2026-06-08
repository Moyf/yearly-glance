import YearlyGlancePlugin from "@/src/main";
import { YearlyGlanceConfig } from "@/src/type/Config";
import { reverseTranslationToKey } from "@/src/i18n/birthday";

export class MigrateData {
	/**
	 * v2.x -> v3.x 的数据迁移更新
	 * @param data v2.x 的数据对象
	 * @returns 迁移后的 v3.x 数据对象
	 */
	static migrateV2(plugin: YearlyGlancePlugin): YearlyGlanceConfig {
		const data = plugin.settings;
		if (!data) return data;

		const migratedData = structuredClone(data);

		if (typeof migratedData.config.showEmojiBeforeTabName === "boolean") {
			migratedData.config.showEmojiBeforeTabName = migratedData.config.showEmojiBeforeTabName ? "emoji" : "none";
		}

		if (!migratedData.config.customEmojiKeywords) {
			migratedData.config.customEmojiKeywords = {};
		}

		this.migrateBirthdayTranslations(migratedData);

		if (!Array.isArray(migratedData.config.eventPresetTypes)) {
			migratedData.config.eventPresetTypes = [];
		}
		if (!migratedData.config.basesEventPresetTypeProp) {
			migratedData.config.basesEventPresetTypeProp = "event_type";
		}

		return migratedData;
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
