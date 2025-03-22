import { FuzzyDate, FuzzyDateHierarchyError, FuzzyDateCalendarError } from "../../src/fuzzyDate";

describe("FuzzyDate creation", () => {
  test("should successfully create a FuzzyDate at year precision", () => {
    const options = { year: 2025 };
    const fuzzyDate = new FuzzyDate(options);
    expect(fuzzyDate.year).toBe(options.year);
    expect(fuzzyDate.month).toBeUndefined();
    expect(fuzzyDate.day).toBeUndefined();
    expect(fuzzyDate.hour).toBeUndefined();
    expect(fuzzyDate.minute).toBeUndefined();
    expect(fuzzyDate.second).toBeUndefined();
    expect(fuzzyDate.millisecond).toBeUndefined();
  });

  test("should successfully create a FuzzyDate at month precision", () => {
    const options = { year: 2025, month: 3 };
    const fuzzyDate = new FuzzyDate(options);
    expect(fuzzyDate.year).toBe(options.year);
    expect(fuzzyDate.month).toBe(options.month);
    expect(fuzzyDate.day).toBeUndefined();
    expect(fuzzyDate.hour).toBeUndefined();
    expect(fuzzyDate.minute).toBeUndefined();
    expect(fuzzyDate.second).toBeUndefined();
    expect(fuzzyDate.millisecond).toBeUndefined();
  });

  test("should successfully create a FuzzyDate at day precision", () => {
    const options = { year: 2025, month: 3, day: 22 };
    const fuzzyDate = new FuzzyDate(options);
    expect(fuzzyDate.year).toBe(options.year);
    expect(fuzzyDate.month).toBe(options.month);
    expect(fuzzyDate.day).toBe(options.day);
    expect(fuzzyDate.hour).toBeUndefined();
    expect(fuzzyDate.minute).toBeUndefined();
    expect(fuzzyDate.second).toBeUndefined();
    expect(fuzzyDate.millisecond).toBeUndefined();
  });

  test("should successfully create a FuzzyDate at hour precision", () => {
    const options = { year: 2025, month: 3, day: 22, hour: 10 };
    const fuzzyDate = new FuzzyDate(options);
    expect(fuzzyDate.year).toBe(options.year);
    expect(fuzzyDate.month).toBe(options.month);
    expect(fuzzyDate.day).toBe(options.day);
    expect(fuzzyDate.hour).toBe(options.hour);
    expect(fuzzyDate.minute).toBeUndefined();
    expect(fuzzyDate.second).toBeUndefined();
    expect(fuzzyDate.millisecond).toBeUndefined();
  });

  test("should successfully create a FuzzyDate at minute precision", () => {
    const options = { year: 2025, month: 3, day: 22, hour: 10, minute: 30 };
    const fuzzyDate = new FuzzyDate(options);
    expect(fuzzyDate.year).toBe(options.year);
    expect(fuzzyDate.month).toBe(options.month);
    expect(fuzzyDate.day).toBe(options.day);
    expect(fuzzyDate.hour).toBe(options.hour);
    expect(fuzzyDate.minute).toBe(options.minute);
    expect(fuzzyDate.second).toBeUndefined();
    expect(fuzzyDate.millisecond).toBeUndefined();
  });

  test("should successfully create a FuzzyDate at second precision", () => {
    const options = { year: 2025, month: 3, day: 22, hour: 10, minute: 30, second: 45 };
    const fuzzyDate = new FuzzyDate(options);
    expect(fuzzyDate.year).toBe(options.year);
    expect(fuzzyDate.month).toBe(options.month);
    expect(fuzzyDate.day).toBe(options.day);
    expect(fuzzyDate.hour).toBe(options.hour);
    expect(fuzzyDate.minute).toBe(options.minute);
    expect(fuzzyDate.second).toBe(options.second);
    expect(fuzzyDate.millisecond).toBeUndefined();
  });

  test("should successfully create a FuzzyDate at millisecond precision", () => {
    const options = { year: 2025, month: 3, day: 22, hour: 10, minute: 30, second: 45, millisecond: 500 };
    const fuzzyDate = new FuzzyDate(options);
    expect(fuzzyDate.year).toBe(options.year);
    expect(fuzzyDate.month).toBe(options.month);
    expect(fuzzyDate.day).toBe(options.day);
    expect(fuzzyDate.hour).toBe(options.hour);
    expect(fuzzyDate.minute).toBe(options.minute);
    expect(fuzzyDate.second).toBe(options.second);
    expect(fuzzyDate.millisecond).toBe(options.millisecond);
  });

    describe("hierarchy validation", () => {
      const invalidHierarchyCases = [
        { 
          desc: "day without month", 
          options: { year: 2023, day: 15 } 
        },
        { 
          desc: "hour without day", 
          options: { year: 2023, month: 5, hour: 10 } 
        },
        { 
          desc: "minute without hour", 
          options: { year: 2023, month: 5, day: 15, minute: 30 } 
        },
        { 
          desc: "second without minute", 
          options: { year: 2023, month: 5, day: 15, hour: 10, second: 45 } 
        },
        { 
          desc: "millisecond without second", 
          options: { year: 2023, month: 5, day: 15, hour: 10, minute: 30, millisecond: 500 } 
        },
        { 
          desc: "gaps in middle (missing day)", 
          options: { year: 2023, month: 5, hour: 10, minute: 30 } 
        },
        { 
          desc: "multiple gaps", 
          options: { year: 2023, day: 15, second: 45 } 
        }
      ];
      
      test.each(invalidHierarchyCases)("should throw FuzzyDateHierarchyError when $desc", ({ options }) => {
        expect(() => {
          new FuzzyDate(options);
        }).toThrow(FuzzyDateHierarchyError);
      });
    });

    describe("calendar validation", () => {
      const invalidCalendarCases = [
        { 
          desc: "invalid month (13)", 
          options: { year: 2023, month: 13 } 
        },
        { 
          desc: "February 30th", 
          options: { year: 2023, month: 2, day: 30 } 
        },
        { 
          desc: "April 31st", 
          options: { year: 2023, month: 4, day: 31 } 
        },
        { 
          desc: "February 29th non-leap year", 
          options: { year: 2023, month: 2, day: 29 } 
        },
        { 
          desc: "hour out of range (24)", 
          options: { year: 2023, month: 5, day: 15, hour: 25 } 
        },
        { 
          desc: "minute out of range (60)", 
          options: { year: 2023, month: 5, day: 15, hour: 10, minute: 60 } 
        },
        { 
          desc: "second out of range (61)", 
          options: { year: 2023, month: 5, day: 15, hour: 10, minute: 30, second: 61 } 
        }
      ];
      
      test.each(invalidCalendarCases)("should throw FuzzyDateCalendarError for $desc", ({ options }) => {
        expect(() => {
          new FuzzyDate(options);
        }).toThrow(FuzzyDateCalendarError);
      });
    });
});