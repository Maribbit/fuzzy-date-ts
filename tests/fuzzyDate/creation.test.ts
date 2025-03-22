import { FuzzyDate, FuzzyDateHierarchyError, FuzzyDateCalendarError } from "../../src/fuzzyDate";

describe("FuzzyDate creation", () => {
  test("should successfully create a FuzzyDate for valid dates", () => {
    const fuzzyDate = new FuzzyDate({ year: 2023, month: 5 });
    expect(fuzzyDate.year).toBe(2023);
    expect(fuzzyDate.month).toBe(5);
  });

  test("should throw FuzzyDateHierarchyError when month is specified without year", () => {
    expect(() => {
      new FuzzyDate({ month: 5 } as any);
    }).toThrow(FuzzyDateHierarchyError);
  });

  test("should throw FuzzyDateHierarchyError when fields aren't filled in order", () => {
    expect(() => {
      new FuzzyDate({ year: 2023, day: 15 }); // Missing month but has day
    }).toThrow(FuzzyDateHierarchyError);
  });

  test("should throw FuzzyDateCalendarError for invalid calendar dates", () => {
    expect(() => {
      new FuzzyDate({ year: 2023, month: 2, day: 30 }); // February doesn't have 30 days
    }).toThrow(FuzzyDateCalendarError);
  });

  test("should accept a complete date", () => {
    const fuzzyDate = new FuzzyDate({
      year: 2023,
      month: 6,
      day: 15,
      hour: 10,
      minute: 30,
      second: 45,
      millisecond: 500
    });
    
    expect(fuzzyDate.year).toBe(2023);
    expect(fuzzyDate.month).toBe(6);
    expect(fuzzyDate.day).toBe(15);
    expect(fuzzyDate.hour).toBe(10);
    expect(fuzzyDate.minute).toBe(30);
    expect(fuzzyDate.second).toBe(45);
    expect(fuzzyDate.millisecond).toBe(500);
  });
});