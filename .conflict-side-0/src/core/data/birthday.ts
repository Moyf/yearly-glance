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
