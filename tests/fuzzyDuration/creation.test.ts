import { FuzzyDuration } from "../../src/fuzzyDuration";

describe("FuzzyDuration precision", () => {
  test("should correctly identify years precision", () => {
    const duration = new FuzzyDuration({ years: 2 });
    expect(duration.precision).toBe('years');
    expect(duration.years).toBe(2);
    expect(duration.months).toBe(0);
    expect(duration.days).toBe(0);
    expect(duration.hours).toBe(0);
    expect(duration.minutes).toBe(0);
    expect(duration.seconds).toBe(0);
    expect(duration.milliseconds).toBe(0);
  });

  test("should correctly identify months precision", () => {
    const duration = new FuzzyDuration({ years: 2, months: 3 });
    expect(duration.precision).toBe('months');
    expect(duration.years).toBe(2);
    expect(duration.months).toBe(3);
    expect(duration.days).toBe(0);
  });

  test("should correctly identify days precision", () => {
    const duration = new FuzzyDuration({ months: 3, days: 15 });
    expect(duration.precision).toBe('days');
    expect(duration.months).toBe(3);
    expect(duration.days).toBe(15);
    expect(duration.hours).toBe(0);
  });

  test("should correctly identify hours precision", () => {
    const duration = new FuzzyDuration({ days: 5, hours: 12 });
    expect(duration.precision).toBe('hours');
    expect(duration.days).toBe(5);
    expect(duration.hours).toBe(12);
    expect(duration.minutes).toBe(0);
  });

  test("should correctly identify minutes precision", () => {
    const duration = new FuzzyDuration({ hours: 2, minutes: 30 });
    expect(duration.precision).toBe('minutes');
    expect(duration.hours).toBe(2);
    expect(duration.minutes).toBe(30);
    expect(duration.seconds).toBe(0);
  });

  test("should correctly identify seconds precision", () => {
    const duration = new FuzzyDuration({ minutes: 5, seconds: 45 });
    expect(duration.precision).toBe('seconds');
    expect(duration.minutes).toBe(5);
    expect(duration.seconds).toBe(45);
    expect(duration.milliseconds).toBe(0);
  });

  test("should correctly identify milliseconds precision", () => {
    const duration = new FuzzyDuration({ seconds: 10, milliseconds: 500 });
    expect(duration.precision).toBe('milliseconds');
    expect(duration.seconds).toBe(10);
    expect(duration.milliseconds).toBe(500);
  });

  test("should use most precise unit when multiple units are specified", () => {
    const duration = new FuzzyDuration({
      years: 1,
      months: 6,
      days: 15,
      hours: 12,
      minutes: 30,
      seconds: 45,
      milliseconds: 500
    });
    expect(duration.precision).toBe('milliseconds');
  });

  test("should default to years precision when no units are specified", () => {
    const duration = new FuzzyDuration({});
    expect(duration.precision).toBe('years');
    expect(duration.years).toBe(0);
  });

  test("should handle zero values correctly for precision determination", () => {
    const duration = new FuzzyDuration({ years: 1, months: 0, days: 0, hours: 0, seconds: 20 });
    expect(duration.precision).toBe('seconds');
    expect(duration.years).toBe(1);
    expect(duration.months).toBe(0);
    expect(duration.days).toBe(0);
    expect(duration.hours).toBe(0);
    expect(duration.seconds).toBe(20);
  });
});