import { t } from "@/src/i18n/i18n";
import { TranslationKeys } from "@/src/i18n/types";

// Define interfaces for our data types
interface birthdayTranslate {
	name: string;
	i18nKey: string;
}

const ANIMAL: birthdayTranslate[] = [
	{
		name: "鼠",
		i18nKey: "data.animal.rat",
	},
	{
		name: "牛",
		i18nKey: "data.animal.ox",
	},
	{
		name: "虎",
		i18nKey: "data.animal.tiger",
	},
	{
		name: "兔",
		i18nKey: "data.animal.rabbit",
	},
	{
		name: "龙",
		i18nKey: "data.animal.dragon",
	},
	{
		name: "蛇",
		i18nKey: "data.animal.snake",
	},
	{
		name: "马",
		i18nKey: "data.animal.horse",
	},
	{
		name: "羊",
		i18nKey: "data.animal.sheep",
	},
	{
		name: "猴",
		i18nKey: "data.animal.monkey",
	},
	{
		name: "鸡",
		i18nKey: "data.animal.rooster",
	},
	{
		name: "狗",
		i18nKey: "data.animal.dog",
	},
	{
		name: "猪",
		i18nKey: "data.animal.pig",
	},
];

const ZODIAC: birthdayTranslate[] = [
	{
		name: "白羊",
		i18nKey: "data.zodiac.aries",
	},
	{
		name: "金牛",
		i18nKey: "data.zodiac.taurus",
	},
	{
		name: "双子",
		i18nKey: "data.zodiac.gemini",
	},
	{
		name: "巨蟹",
		i18nKey: "data.zodiac.cancer",
	},
	{
		name: "狮子",
		i18nKey: "data.zodiac.leo",
	},
	{
		name: "处女",
		i18nKey: "data.zodiac.virgo",
	},
	{
		name: "天秤",
		i18nKey: "data.zodiac.libra",
	},
	{
		name: "天蝎",
		i18nKey: "data.zodiac.scorpio",
	},
	{
		name: "射手",
		i18nKey: "data.zodiac.sagittarius",
	},
	{
		name: "摩羯",
		i18nKey: "data.zodiac.capricorn",
	},
	{
		name: "水瓶",
		i18nKey: "data.zodiac.aquarius",
	},
	{
		name: "双鱼",
		i18nKey: "data.zodiac.pisces",
	},
];

const GAN: birthdayTranslate[] = [
	{
		name: "甲",
		i18nKey: "data.gan.jia",
	},
	{
		name: "乙",
		i18nKey: "data.gan.yi",
	},
	{
		name: "丙",
		i18nKey: "data.gan.bing",
	},
	{
		name: "丁",
		i18nKey: "data.gan.ding",
	},
	{
		name: "戊",
		i18nKey: "data.gan.wu",
	},
	{
		name: "己",
		i18nKey: "data.gan.ji",
	},
	{
		name: "庚",
		i18nKey: "data.gan.geng",
	},
	{
		name: "辛",
		i18nKey: "data.gan.xin",
	},
	{
		name: "壬",
		i18nKey: "data.gan.ren",
	},
	{
		name: "癸",
		i18nKey: "data.gan.gui",
	},
];

const ZHI: birthdayTranslate[] = [
	{
		name: "子",
		i18nKey: "data.zhi.zi",
	},
	{
		name: "丑",
		i18nKey: "data.zhi.chou",
	},
	{
		name: "寅",
		i18nKey: "data.zhi.yin",
	},
	{
		name: "卯",
		i18nKey: "data.zhi.mao",
	},
	{
		name: "辰",
		i18nKey: "data.zhi.chen",
	},
	{
		name: "巳",
		i18nKey: "data.zhi.si",
	},
	{
		name: "午",
		i18nKey: "data.zhi.wu",
	},
	{
		name: "未",
		i18nKey: "data.zhi.wei",
	},
	{
		name: "申",
		i18nKey: "data.zhi.shen",
	},
	{
		name: "酉",
		i18nKey: "data.zhi.you",
	},
	{
		name: "戌",
		i18nKey: "data.zhi.xu",
	},
	{
		name: "亥",
		i18nKey: "data.zhi.hai",
	},
];
function getTranslatedAnimal(name: string): string {
	const animal = ANIMAL.find((item) => item.name === name);
	return t(animal?.i18nKey as TranslationKeys);
}

function getTranslatedZodiac(name: string): string {
	const zodiac = ZODIAC.find((item) => item.name === name);
	return t(zodiac?.i18nKey as TranslationKeys);
}

function getTranslatedGanzhi(name: string): string {
	const [gan, zhi] = name.split("");

	const translatedGan = GAN.find((item) => item.name === gan);
	const translatedZhi = ZHI.find((item) => item.name === zhi);

	return `${t(translatedGan?.i18nKey as TranslationKeys)}${t(
		translatedZhi?.i18nKey as TranslationKeys
	)}`;
}

/**
 * @deprecated 使用 getBirthdayKeyId + translateBirthdayDisplay 替代
 * 保留用于兼容旧逻辑
 */
export function getBirthdayTranslation(name: string, type: string): string {
	switch (type) {
		case "animal":
			return getTranslatedAnimal(name);
		case "zodiac":
			return getTranslatedZodiac(name);
		case "ganzhi":
			return getTranslatedGanzhi(name);
		default:
			return "null";
	}
}

// ======== 新的 key-based 存储/翻译系统 ========

/**
 * 从中文名称获取存储用的英文 key（不含翻译，用于持久化）
 * @param name 中文名（来自 lunar-typescript 库）
 * @param type "animal" | "zodiac" | "ganzhi"
 * @returns 英文 key identifier，如 "rat", "capricorn", "jia-zi"
 */
export function getBirthdayKeyId(name: string, type: string): string | null {
	switch (type) {
		case "animal": {
			const animal = ANIMAL.find((item) => item.name === name);
			// 从 i18nKey "data.animal.rat" 提取 "rat"
			return animal ? animal.i18nKey.split(".").pop()! : null;
		}
		case "zodiac": {
			const zodiac = ZODIAC.find((item) => item.name === name);
			// 从 i18nKey "data.zodiac.capricorn" 提取 "capricorn"
			return zodiac ? zodiac.i18nKey.split(".").pop()! : null;
		}
		case "ganzhi": {
			const [ganChar, zhiChar] = name.split("");
			const gan = GAN.find((item) => item.name === ganChar);
			const zhi = ZHI.find((item) => item.name === zhiChar);
			if (!gan || !zhi) return null;
			// 从 "data.gan.jia" 和 "data.zhi.zi" 提取 "jia-zi"
			return `${gan.i18nKey.split(".").pop()}-${zhi.i18nKey.split(".").pop()}`;
		}
		default:
			return null;
	}
}

/**
 * 将存储的英文 key 翻译为当前语言的显示文本
 * @param key 存储的 key（如 "capricorn", "jia-zi:rat"）
 * @param type "animal" | "zodiac"
 */
export function translateBirthdayDisplay(key: string | undefined | null, type: "animal" | "zodiac"): string {
	if (!key) return "-";
	switch (type) {
		case "zodiac":
			return t(`data.zodiac.${key}` as TranslationKeys);
		case "animal": {
			// animal key 格式: "ganzhi_key:animal_key" 如 "jia-zi:rat"
			const [ganzhiKey, animalKey] = key.split(":");
			if (!ganzhiKey || !animalKey) return key; // fallback 显示原始值
			// ganzhi key 格式: "jia-zi"
			const [ganKey, zhiKey] = ganzhiKey.split("-");
			const ganzhiText = `${t(`data.gan.${ganKey}` as TranslationKeys)}${t(`data.zhi.${zhiKey}` as TranslationKeys)}`;
			const animalText = t(`data.animal.${animalKey}` as TranslationKeys);
			return `${ganzhiText}${animalText}`;
		}
		default:
			return key;
	}
}

/**
 * 尝试将旧的翻译文本逆向映射为 key（用于数据迁移）
 * 支持所有三种语言的旧数据
 */
export function reverseTranslationToKey(value: string, type: "animal" | "zodiac"): string | null {
	if (!value || value === "-") return null;

	if (type === "zodiac") {
		// zodiac 直接匹配 ZODIAC 表中的中文名或通过翻译匹配
		const zodiac = ZODIAC.find((item) => {
			const translated = t(item.i18nKey as TranslationKeys);
			return translated === value || item.name === value || value.includes(item.name);
		});
		if (zodiac) return zodiac.i18nKey.split(".").pop()!;

		// 尝试匹配英文 key（可能已经是 key 格式）
		const ZODIAC_KEYS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
			"libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
		if (ZODIAC_KEYS.includes(value.toLowerCase())) return value.toLowerCase();

		return null;
	}

	if (type === "animal") {
		// animal 格式复杂："干支翻译+生肖翻译"
		// 先检查是否已是新格式 "jia-zi:rat"
		if (value.includes(":") && value.includes("-")) return value;

		// 尝试从翻译文本逆向映射
		// 先尝试匹配生肖部分
		let matchedAnimalKey: string | null = null;
		let matchedGanzhiKey: string | null = null;

		for (const animal of ANIMAL) {
			const translated = t(animal.i18nKey as TranslationKeys);
			if (value.endsWith(translated) || value.endsWith(animal.name)) {
				matchedAnimalKey = animal.i18nKey.split(".").pop()!;
				// 剩余部分是干支
				const remaining = value.endsWith(translated)
					? value.slice(0, -translated.length)
					: value.slice(0, -animal.name.length);
				if (remaining) {
					matchedGanzhiKey = reverseGanzhiToKey(remaining);
				}
				break;
			}
		}

		if (matchedAnimalKey && matchedGanzhiKey) {
			return `${matchedGanzhiKey}:${matchedAnimalKey}`;
		}

		return null;
	}

	return null;
}

/**
 * 将干支翻译文本逆向映射为 key（如 "甲子" → "jia-zi"）
 */
function reverseGanzhiToKey(value: string): string | null {
	// 先尝试匹配已翻译的干支
	for (const gan of GAN) {
		const ganTranslated = t(gan.i18nKey as TranslationKeys);
		for (const zhi of ZHI) {
			const zhiTranslated = t(zhi.i18nKey as TranslationKeys);
			if (value === `${ganTranslated}${zhiTranslated}` || value === `${gan.name}${zhi.name}`) {
				return `${gan.i18nKey.split(".").pop()}-${zhi.i18nKey.split(".").pop()}`;
			}
		}
	}
	// 尝试直接匹配中文原始干支（两个字符）
	if (value.length === 2) {
		const ganChar = value[0];
		const zhiChar = value[1];
		const gan = GAN.find((item) => item.name === ganChar);
		const zhi = ZHI.find((item) => item.name === zhiChar);
		if (gan && zhi) {
			return `${gan.i18nKey.split(".").pop()}-${zhi.i18nKey.split(".").pop()}`;
		}
	}
	return null;
}
