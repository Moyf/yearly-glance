import { SpecialHoliday } from "../src/core/utils/specialHoliday";

describe("SpecialHoliday", () => {
  describe("solarTerm", () => {
    test("冬至", () => {
      const date = SpecialHoliday.solarTerm(2024, "冬至").toYmd();
      expect(date).toBe("2024-12-21");
    });
  });
});