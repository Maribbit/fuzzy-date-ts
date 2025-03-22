import { FuzzyDate, FuzzyDateOptions } from "../../src/fuzzyDate";

describe("FuzzyDate.getPrecision", () => {
  // Test cases for each precision level
  const testCases: Array<{
    description: string;
    options: FuzzyDateOptions;
    expectedPrecision: keyof FuzzyDateOptions;
  }> = [
    {
      description: "should return 'year' when only year is provided",
      options: { year: 2023 },
      expectedPrecision: 'year'
    },
    {
      description: "should return 'month' when year and month are provided",
      options: { year: 2023, month: 5 },
      expectedPrecision: 'month'
    },
    {
      description: "should return 'day' when year, month, and day are provided",
      options: { year: 2023, month: 5, day: 15 },
      expectedPrecision: 'day'
    },
    {
      description: "should return 'hour' when date with hour is provided",
      options: { year: 2023, month: 5, day: 15, hour: 10 },
      expectedPrecision: 'hour'
    },
    {
      description: "should return 'minute' when date with minute is provided",
      options: { year: 2023, month: 5, day: 15, hour: 10, minute: 30 },
      expectedPrecision: 'minute'
    },
    {
      description: "should return 'second' when date with second is provided",
      options: { year: 2023, month: 5, day: 15, hour: 10, minute: 30, second: 45 },
      expectedPrecision: 'second'
    },
    {
      description: "should return 'millisecond' when complete date-time is provided",
      options: { year: 2023, month: 5, day: 15, hour: 10, minute: 30, second: 45, millisecond: 500 },
      expectedPrecision: 'millisecond'
    }
  ];

  // Run each test case
  test.each(testCases)("$description", ({ options, expectedPrecision }) => {
    const fuzzyDate = new FuzzyDate(options);
    expect(fuzzyDate.getPrecision()).toBe(expectedPrecision);
  });

  // Edge cases and special tests
  test("should handle BC/negative years correctly", () => {
    const ancientDate = new FuzzyDate({ year: -500, month: 3 });
    expect(ancientDate.getPrecision()).toBe('month');
  });

  test("should handle extreme future dates correctly", () => {
    const futureDate = new FuzzyDate({ year: 10000, month: 6, day: 15 });
    expect(futureDate.getPrecision()).toBe('day');
  });

  test("should handle leap year dates correctly", () => {
    // February 29 in leap year
    const leapYearDate = new FuzzyDate({ year: 2024, month: 2, day: 29 });
    expect(leapYearDate.getPrecision()).toBe('day');
  });

  test("should handle zero values correctly", () => {
    // Zero values are still considered defined
    const dateWithZeroHour = new FuzzyDate({ year: 2023, month: 5, day: 15, hour: 0 });
    expect(dateWithZeroHour.getPrecision()).toBe('hour');

    const dateWithZeroMinute = new FuzzyDate({ year: 2023, month: 5, day: 15, hour: 0, minute: 0 });
    expect(dateWithZeroMinute.getPrecision()).toBe('minute');
  });
});