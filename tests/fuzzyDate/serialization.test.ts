import { FuzzyDate, FuzzyDateDeserializationError, FuzzyDateCalendarError } from "../../src/fuzzyDate";

describe("FuzzyDate serialization", () => {
  describe("toISOString", () => {
    test("should serialize year-only date", () => {
      const date = new FuzzyDate({ year: 2023 });
      expect(date.toString()).toBe("2023");
    });

    test("should serialize BC year-only date", () => {
      const date = new FuzzyDate({ year: -2023 });
      expect(date.toString()).toBe("-2023");
    });

    test("should serialize BC year-month date", () => {
      const date = new FuzzyDate({ year: -2023, month: 5 });
      expect(date.toString()).toBe("-2023-05");
    });

    test("should serialize BC full date", () => {
      const date = new FuzzyDate({ year: -2023, month: 5, day: 15 });
      expect(date.toString()).toBe("-2023-05-15");
    });

    test("should serialize year-month date", () => {
      const date = new FuzzyDate({ year: 2023, month: 5 });
      expect(date.toString()).toBe("2023-05");
    });

    test("should serialize year-month-day date", () => {
      const date = new FuzzyDate({ year: 2023, month: 5, day: 15 });
      expect(date.toString()).toBe("2023-05-15");
    });

    test("should serialize date with hour", () => {
      const date = new FuzzyDate({ year: 2023, month: 5, day: 15, hour: 10 });
      expect(date.toString()).toBe("2023-05-15T10");
    });

    test("should serialize date with minute", () => {
      const date = new FuzzyDate({ year: 2023, month: 5, day: 15, hour: 10, minute: 30 });
      expect(date.toString()).toBe("2023-05-15T10:30");
    });

    test("should serialize date with second", () => {
      const date = new FuzzyDate({ year: 2023, month: 5, day: 15, hour: 10, minute: 30, second: 45 });
      expect(date.toString()).toBe("2023-05-15T10:30:45");
    });

    test("should serialize date with millisecond", () => {
      const date = new FuzzyDate({ year: 2023, month: 5, day: 15, hour: 10, minute: 30, second: 45, millisecond: 500 });
      expect(date.toString()).toBe("2023-05-15T10:30:45.500");
    });

    test("should pad single digits with zeros", () => {
      const date = new FuzzyDate({ year: 2023, month: 1, day: 1, hour: 1, minute: 1, second: 1, millisecond: 1 });
      expect(date.toString()).toBe("2023-01-01T01:01:01.001");
    });
  });

  describe("fromISOString", () => {
    test("should parse year-only date", () => {
      const date = FuzzyDate.fromString("2023");
      expect(date.year).toBe(2023);
      expect(date.month).toBeUndefined();
      expect(date.day).toBeUndefined();
    });

    test("should parse BC year-only date", () => {
      const date = FuzzyDate.fromString("-2023");
      expect(date.year).toBe(-2023);
      expect(date.month).toBeUndefined();
      expect(date.day).toBeUndefined();
    });

    test("should parse BC year-month date", () => {
      const date = FuzzyDate.fromString("-2023-05");
      expect(date.year).toBe(-2023);
      expect(date.month).toBe(5);
      expect(date.day).toBeUndefined();
    });

    test("should parse BC full date", () => {
      const date = FuzzyDate.fromString("-2023-05-15");
      expect(date.year).toBe(-2023);
      expect(date.month).toBe(5);
      expect(date.day).toBe(15);
    });

    test("should parse year-month date", () => {
      const date = FuzzyDate.fromString("2023-05");
      expect(date.year).toBe(2023);
      expect(date.month).toBe(5);
      expect(date.day).toBeUndefined();
    });

    test("should parse year-month-day date", () => {
      const date = FuzzyDate.fromString("2023-05-15");
      expect(date.year).toBe(2023);
      expect(date.month).toBe(5);
      expect(date.day).toBe(15);
      expect(date.hour).toBeUndefined();
    });

    test("should parse date with hour", () => {
      const date = FuzzyDate.fromString("2023-05-15T10");
      expect(date.year).toBe(2023);
      expect(date.month).toBe(5);
      expect(date.day).toBe(15);
      expect(date.hour).toBe(10);
      expect(date.minute).toBeUndefined();
    });

    test("should parse date with minute", () => {
      const date = FuzzyDate.fromString("2023-05-15T10:30");
      expect(date.year).toBe(2023);
      expect(date.month).toBe(5);
      expect(date.day).toBe(15);
      expect(date.hour).toBe(10);
      expect(date.minute).toBe(30);
      expect(date.second).toBeUndefined();
    });

    test("should parse date with second", () => {
      const date = FuzzyDate.fromString("2023-05-15T10:30:45");
      expect(date.year).toBe(2023);
      expect(date.month).toBe(5);
      expect(date.day).toBe(15);
      expect(date.hour).toBe(10);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(45);
      expect(date.millisecond).toBeUndefined();
    });

    test("should parse date with millisecond", () => {
      const date = FuzzyDate.fromString("2023-05-15T10:30:45.500");
      expect(date.year).toBe(2023);
      expect(date.month).toBe(5);
      expect(date.day).toBe(15);
      expect(date.hour).toBe(10);
      expect(date.minute).toBe(30);
      expect(date.second).toBe(45);
      expect(date.millisecond).toBe(500);
    });

    test("should handle single digit values", () => {
      const date = FuzzyDate.fromString("2023-01-01T01:01:01.001");
      expect(date.year).toBe(2023);
      expect(date.month).toBe(1);
      expect(date.day).toBe(1);
      expect(date.hour).toBe(1);
      expect(date.minute).toBe(1);
      expect(date.second).toBe(1);
      expect(date.millisecond).toBe(1);
    });

    test("should throw error for invalid format", () => {
      expect(() => FuzzyDate.fromString("2023-05-15T10:30:45.500-invalid")).toThrow(FuzzyDateDeserializationError);
      expect(() => FuzzyDate.fromString("2023-05-15T10:30:45.500-invalid")).toThrow("Invalid format");
    });

    test("should throw error for invalid year", () => {
      expect(() => FuzzyDate.fromString("invalid")).toThrow(FuzzyDateDeserializationError);
      expect(() => FuzzyDate.fromString("invalid")).toThrow("Invalid format");
    });

    test("should throw error for invalid month", () => {
      expect(() => FuzzyDate.fromString("2023-invalid")).toThrow(FuzzyDateDeserializationError);
      expect(() => FuzzyDate.fromString("2023-invalid")).toThrow("Invalid format");
    });

    test("should throw error for invalid day", () => {
      expect(() => FuzzyDate.fromString("2023-05-invalid")).toThrow(FuzzyDateDeserializationError);
      expect(() => FuzzyDate.fromString("2023-05-invalid")).toThrow("Invalid format");
    });

    test("should throw error for invalid hour", () => {
      expect(() => FuzzyDate.fromString("2023-05-15Tinvalid")).toThrow(FuzzyDateDeserializationError);
      expect(() => FuzzyDate.fromString("2023-05-15Tinvalid")).toThrow("Invalid format");
    });

    test("should throw error for invalid minute", () => {
      expect(() => FuzzyDate.fromString("2023-05-15T10:invalid")).toThrow(FuzzyDateDeserializationError);
      expect(() => FuzzyDate.fromString("2023-05-15T10:invalid")).toThrow("Invalid format");
    });

    test("should throw error for invalid second", () => {
      expect(() => FuzzyDate.fromString("2023-05-15T10:30:invalid")).toThrow(FuzzyDateDeserializationError);
      expect(() => FuzzyDate.fromString("2023-05-15T10:30:invalid")).toThrow("Invalid format");
    });

    test("should throw error for invalid millisecond", () => {
      expect(() => FuzzyDate.fromString("2023-05-15T10:30:45.invalid")).toThrow(FuzzyDateDeserializationError);
      expect(() => FuzzyDate.fromString("2023-05-15T10:30:45.invalid")).toThrow("Invalid format");
    });

    test("should delegate calendar validation to FuzzyDate constructor", () => {
      expect(() => FuzzyDate.fromString("2023-13-01")).toThrow(FuzzyDateCalendarError);
      expect(() => FuzzyDate.fromString("2023-02-30")).toThrow(FuzzyDateCalendarError);
      expect(() => FuzzyDate.fromString("2023-04-31")).toThrow(FuzzyDateCalendarError);
    });
  });

  describe("round-trip serialization", () => {
    test("should maintain precision through serialization round-trip", () => {
      const original = new FuzzyDate({ year: 2023, month: 5, day: 15, hour: 10, minute: 30, second: 45, millisecond: 500 });
      const serialized = original.toString();
      const deserialized = FuzzyDate.fromString(serialized);
      
      expect(deserialized.year).toBe(original.year);
      expect(deserialized.month).toBe(original.month);
      expect(deserialized.day).toBe(original.day);
      expect(deserialized.hour).toBe(original.hour);
      expect(deserialized.minute).toBe(original.minute);
      expect(deserialized.second).toBe(original.second);
      expect(deserialized.millisecond).toBe(original.millisecond);
    });

    test("should maintain partial precision through serialization round-trip", () => {
      const original = new FuzzyDate({ year: 2023, month: 5, day: 15 });
      const serialized = original.toString();
      const deserialized = FuzzyDate.fromString(serialized);
      
      expect(deserialized.year).toBe(original.year);
      expect(deserialized.month).toBe(original.month);
      expect(deserialized.day).toBe(original.day);
      expect(deserialized.hour).toBeUndefined();
      expect(deserialized.minute).toBeUndefined();
      expect(deserialized.second).toBeUndefined();
      expect(deserialized.millisecond).toBeUndefined();
    });
  });
});
