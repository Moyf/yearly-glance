export type HolidayDisplayType = "public" | "public-work" | "solar-term" | "festival";

export const HOLIDAY_EMOJI: Record<HolidayDisplayType, string> = {
	public: "🎉",
	"public-work": "💼",
	"solar-term": "🌿",
	festival: "🌿",
};

export const HOLIDAY_COLOR: Record<HolidayDisplayType, string> = {
	public: "#ff7875",
	"public-work": "#ff4d4f",
	"solar-term": "#b8b8b8",
	festival: "#b8b8b8",
};
