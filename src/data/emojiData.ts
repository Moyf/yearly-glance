export interface EmojiEntry {
	emoji: string;
	keywords: string[];
}

export interface EmojiCategory {
	name: string;
	emojis: EmojiEntry[];
}

export const EMOJI_DATA: EmojiCategory[] = [
	{
		name: "常用",
		emojis: [
			{ emoji: "🎉", keywords: ["庆祝", "party", "恭喜", "congratulations"] },
			{ emoji: "🎂", keywords: ["蛋糕", "birthday", "生日", "cake"] },
			{ emoji: "🎄", keywords: ["圣诞", "christmas", "节日", "holiday"] },
			{ emoji: "🎓", keywords: ["毕业", "graduation", "学位", "degree"] },
			{ emoji: "💐", keywords: ["花束", "flowers", "感谢", "thanks"] },
			{ emoji: "🎊", keywords: ["彩纸", "confetti", "庆祝", "celebrate"] },
			{ emoji: "🎁", keywords: ["礼物", "gift", "赠送", "present"] },
			{ emoji: "💝", keywords: ["爱心", "love", "喜欢", "heart"] },
			{ emoji: "🏆", keywords: ["奖杯", "trophy", "胜利", "champion"] },
			{ emoji: "🎈", keywords: ["气球", "balloon", "派对", "party"] },
			{ emoji: "🥂", keywords: ["干杯", "cheers", "祝贺", "toast"] },
			{ emoji: "💒", keywords: ["婚礼", "wedding", "结婚", "marriage"] },
			{ emoji: "🎯", keywords: ["目标", "target", "命中", "goal"] },
			{ emoji: "📅", keywords: ["日历", "calendar", "日期", "date"] },
			{ emoji: "✨", keywords: ["闪光", "sparkle", "特效", "magic"] },
			{ emoji: "🎀", keywords: ["蝴蝶结", "ribbon", "装饰", "decoration"] },
			{ emoji: "🏅", keywords: ["奖牌", "medal", "荣誉", "honor"] },
			{ emoji: "🎇", keywords: ["烟花", "firework", "夜空", "night"] },
			{ emoji: "🎆", keywords: ["焰火", "fireworks", "庆典", "festival"] },
		],
	},
	{
		name: "活动",
		emojis: [
			{ emoji: "✈️", keywords: ["飞机", "flight", "旅行", "travel"] },
			{ emoji: "🚗", keywords: ["汽车", "car", "出行", "drive"] },
			{ emoji: "🏠", keywords: ["家", "home", "房屋", "house"] },
			{ emoji: "🏢", keywords: ["办公", "office", "公司", "company"] },
			{ emoji: "🏥", keywords: ["医院", "hospital", "医疗", "medical"] },
			{ emoji: "🎬", keywords: ["电影", "movie", "拍摄", "film"] },
			{ emoji: "🎮", keywords: ["游戏", "game", "娱乐", "play"] },
			{ emoji: "📚", keywords: ["书籍", "books", "学习", "study"] },
			{ emoji: "🎵", keywords: ["音乐", "music", "旋律", "melody"] },
			{ emoji: "🎤", keywords: ["唱歌", "microphone", "表演", "sing"] },
			{ emoji: "🏋️", keywords: ["健身", "fitness", "锻炼", "exercise"] },
			{ emoji: "🏊", keywords: ["游泳", "swimming", "水上", "swim"] },
			{ emoji: "🚴", keywords: ["骑行", "cycling", "自行车", "bike"] },
			{ emoji: "🧘", keywords: ["瑜伽", "yoga", "冥想", "meditation"] },
			{ emoji: "🎨", keywords: ["画画", "painting", "艺术", "art"] },
			{ emoji: "📷", keywords: ["拍照", "camera", "摄影", "photo"] },
			{ emoji: "🎣", keywords: ["钓鱼", "fishing", "休闲", "leisure"] },
			{ emoji: "⛷️", keywords: ["滑雪", "skiing", "冬季", "winter"] },
			{ emoji: "🏕️", keywords: ["露营", "camping", "户外", "outdoor"] },
			{ emoji: "🎭", keywords: ["戏剧", "theater", "表演", "drama"] },
			{ emoji: "🍳", keywords: ["烹饪", "cooking", "厨艺", "cook"] },
			{ emoji: "🎒", keywords: ["背包", "backpack", "旅行", "school"] },
		],
	},
	{
		name: "数码",
		emojis: [
			{ emoji: "💻", keywords: ["电脑", "computer", "笔记本", "laptop"] },
			{ emoji: "📱", keywords: ["手机", "phone", "移动", "mobile"] },
			{ emoji: "⌨️", keywords: ["键盘", "keyboard", "输入", "type"] },
			{ emoji: "🖱️", keywords: ["鼠标", "mouse", "点击", "click"] },
			{ emoji: "🖥️", keywords: ["台式", "desktop", "显示器", "monitor"] },
			{ emoji: "🔋", keywords: ["电池", "battery", "充电", "charge"] },
			{ emoji: "💾", keywords: ["存储", "storage", "保存", "save"] },
			{ emoji: "📡", keywords: ["天线", "antenna", "信号", "signal"] },
			{ emoji: "🔌", keywords: ["插头", "plug", "电源", "power"] },
			{ emoji: "🎧", keywords: ["耳机", "headphone", "音频", "audio"] },
			{ emoji: "🎙️", keywords: ["录音", "microphone", "播客", "podcast"] },
		],
	},
	{
		name: "表情",
		emojis: [
			{ emoji: "❤️", keywords: ["爱心", "love", "喜欢", "heart"] },
			{ emoji: "👍", keywords: ["赞", "like", "好的", "thumbsup"] },
			{ emoji: "🙏", keywords: ["祈祷", "pray", "感谢", "thanks"] },
			{ emoji: "😊", keywords: ["开心", "happy", "微笑", "smile"] },
			{ emoji: "😢", keywords: ["伤心", "sad", "哭泣", "cry"] },
			{ emoji: "💪", keywords: ["加油", "strong", "力量", "muscle"] },
			{ emoji: "🤝", keywords: ["握手", "handshake", "合作", "deal"] },
			{ emoji: "✅", keywords: ["完成", "done", "确认", "check"] },
			{ emoji: "❌", keywords: ["取消", "cancel", "错误", "wrong"] },
			{ emoji: "⭐", keywords: ["星星", "star", "收藏", "favorite"] },
			{ emoji: "🔔", keywords: ["铃铛", "bell", "提醒", "notification"] },
			{ emoji: "💡", keywords: ["灯泡", "idea", "想法", "light"] },
			{ emoji: "⚠️", keywords: ["警告", "warning", "注意", "caution"] },
			{ emoji: "🔄", keywords: ["刷新", "refresh", "循环", "cycle"] },
			{ emoji: "💛", keywords: ["黄心", "yellowheart", "友谊", "friendship"] },
			{ emoji: "😂", keywords: ["笑哭", "lol", "开心", "laugh"] },
			{ emoji: "🥲", keywords: ["苦笑", "bittersmile", "无奈", "awkward"] },
			{ emoji: "😍", keywords: ["花痴", "loveeyes", "喜欢", "adore"] },
			{ emoji: "🥰", keywords: ["喜爱", "love", "温暖", "warm"] },
			{ emoji: "😤", keywords: ["生气", "angry", "不满", "huff"] },
			{ emoji: "😡", keywords: ["愤怒", "rage", "生气", "mad"] },
			{ emoji: "😭", keywords: ["大哭", "crying", "悲伤", "sob"] },
			{ emoji: "🤣", keywords: ["大笑", "rofl", "笑死", "hilarious"] },
			{ emoji: "😎", keywords: ["酷", "cool", "自信", "sunglasses"] },
			{ emoji: "🤔", keywords: ["思考", "think", "疑问", "wonder"] },
			{ emoji: "😱", keywords: ["惊恐", "scream", "震惊", "shocked"] },
			{ emoji: "😴", keywords: ["睡觉", "sleep", "困", "zzz"] },
			{ emoji: "🤗", keywords: ["拥抱", "hug", "温暖", "welcome"] },
			{ emoji: "😈", keywords: ["邪恶", "devil", "调皮", "mischievous"] },
			{ emoji: "🫡", keywords: ["敬礼", "salute", "尊重", "respect"] },
			{ emoji: "🫶", keywords: ["比心", "heart hands", "爱", "love"] },
			{ emoji: "💯", keywords: ["满分", "perfect", "一百", "hundred"] },
			{ emoji: "💢", keywords: ["怒气", "anger", "不满", "annoyed"] },
			{ emoji: "🥳", keywords: ["派对", "party", "庆祝", "celebrate"] },
			{ emoji: "😏", keywords: ["得意", "smirk", "自信", "sly"] },
		],
	},
	{
		name: "自然",
		emojis: [
			{ emoji: "☀️", keywords: ["太阳", "sun", "晴天", "sunny"] },
			{ emoji: "🌤️", keywords: ["多云", "partlycloudy", "晴朗", "fair"] },
			{ emoji: "🌧️", keywords: ["下雨", "rain", "雨天", "rainy"] },
			{ emoji: "⛈️", keywords: ["雷暴", "storm", "暴风雨", "thunder"] },
			{ emoji: "🌈", keywords: ["彩虹", "rainbow", "雨后", "colorful"] },
			{ emoji: "❄️", keywords: ["雪花", "snow", "冬天", "winter"] },
			{ emoji: "🌙", keywords: ["月亮", "moon", "夜晚", "night"] },
			{ emoji: "🌊", keywords: ["海浪", "wave", "海洋", "ocean"] },
			{ emoji: "🔥", keywords: ["火焰", "fire", "热门", "hot"] },
			{ emoji: "🍂", keywords: ["落叶", "autumn", "秋天", "fall"] },
			{ emoji: "🌸", keywords: ["樱花", "cherryblossom", "春天", "spring"] },
			{ emoji: "🌺", keywords: ["花", "hibiscus", "热带", "tropical"] },
			{ emoji: "🌱", keywords: ["幼苗", "seedling", "成长", "growth"] },
			{ emoji: "💧", keywords: ["水滴", "water", "液体", "drop"] },
		],
	},
	{
		name: "餐饮",
		emojis: [
			{ emoji: "☕", keywords: ["咖啡", "coffee", "热饮", "drink"] },
			{ emoji: "🍺", keywords: ["啤酒", "beer", "喝酒", "pub"] },
			{ emoji: "🍷", keywords: ["红酒", "wine", "品酒", "dinner"] },
			{ emoji: "🍰", keywords: ["蛋糕", "cake", "甜品", "dessert"] },
			{ emoji: "🍕", keywords: ["披萨", "pizza", "快餐", "food"] },
			{ emoji: "🍣", keywords: ["寿司", "sushi", "日料", "japanese"] },
			{ emoji: "🍜", keywords: ["面条", "noodle", "拉面", "ramen"] },
			{ emoji: "🍎", keywords: ["苹果", "apple", "水果", "fruit"] },
			{ emoji: "🥗", keywords: ["沙拉", "salad", "健康", "healthy"] },
			{ emoji: "🧁", keywords: ["纸杯蛋糕", "cupcake", "甜点", "sweet"] },
			{ emoji: "🍫", keywords: ["巧克力", "chocolate", "零食", "snack"] },
			{ emoji: "🍵", keywords: ["茶", "tea", "绿茶", "greentea"] },
			{ emoji: "🍩", keywords: ["甜甜圈", "donut", "甜食", "pastry"] },
		],
	},
	{
		name: "其他",
		emojis: [
			{ emoji: "📌", keywords: ["图钉", "pin", "标记", "mark"] },
			{ emoji: "📎", keywords: ["回形针", "clip", "附件", "attach"] },
			{ emoji: "🔖", keywords: ["书签", "bookmark", "标记", "label"] },
			{ emoji: "💰", keywords: ["钱", "money", "财富", "wealth"] },
			{ emoji: "🎫", keywords: ["票", "ticket", "入场", "entrance"] },
			{ emoji: "📋", keywords: ["剪贴板", "clipboard", "清单", "list"] },
			{ emoji: "🗓️", keywords: ["日历", "calendar", "日程", "schedule"] },
			{ emoji: "📝", keywords: ["备忘", "memo", "笔记", "note"] },
			{ emoji: "🏷️", keywords: ["标签", "label", "分类", "tag"] },
			{ emoji: "📰", keywords: ["新闻", "news", "报纸", "article"] },
		],
	},
];

/** Build a flat map from emoji to its keywords (built-in only) */
export function buildEmojiKeywordMap(): Record<string, string[]> {
	const map: Record<string, string[]> = {};
	for (const category of EMOJI_DATA) {
		for (const entry of category.emojis) {
			if (!map[entry.emoji]) {
				map[entry.emoji] = [...entry.keywords];
			}
		}
	}
	return map;
}
