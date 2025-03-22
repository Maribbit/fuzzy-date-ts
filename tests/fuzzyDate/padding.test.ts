import { FuzzyDate, NonFuzzyDateOptions } from "../../src/fuzzyDate";

describe("FuzzyDate.getEarliestPaddingOptions", () => {
  test("should pad month, day, and time parts when only year is specified", () => {
    const fuzzyDate = new FuzzyDate({ year: 2023 });
    
    const expected: NonFuzzyDateOptions = {
      year: 2023,
      month: 1,    // January
      day: 1,      // 1st
      hour: 0,     // 00
      minute: 0,   // 00
      second: 0,   // 00
      millisecond: 0 // 000
    };
    
    expect(fuzzyDate.getEarliestPaddingOptions()).toEqual(expected);
  });

  test("should pad day and time parts when year and month are specified", () => {
    const fuzzyDate = new FuzzyDate({ year: 2023, month: 5 });
    
    const expected: NonFuzzyDateOptions = {
      year: 2023,
      month: 5,    // May
      day: 1,      // 1st
      hour: 0,     // 00
      minute: 0,   // 00
      second: 0,   // 00
      millisecond: 0 // 000
    };
    
    expect(fuzzyDate.getEarliestPaddingOptions()).toEqual(expected);
  });

  test("should pad time parts when date is fully specified", () => {
    const fuzzyDate = new FuzzyDate({ year: 2023, month: 5, day: 15 });
    
    const expected: NonFuzzyDateOptions = {
      year: 2023,
      month: 5,    // May
      day: 15,     // 15th
      hour: 0,     // 00
      minute: 0,   // 00
      second: 0,   // 00
      millisecond: 0 // 000
    };
    
    expect(fuzzyDate.getEarliestPaddingOptions()).toEqual(expected);
  });

  test("should pad remaining time parts when some time parts are specified", () => {
    const fuzzyDate = new FuzzyDate({ 
      year: 2023, month: 5, day: 15, hour: 10, minute: 30 
    });
    
    const expected: NonFuzzyDateOptions = {
      year: 2023,
      month: 5,    // May
      day: 15,     // 15th
      hour: 10,    // 10
      minute: 30,  // 30
      second: 0,   // 00
      millisecond: 0 // 000
    };
    
    expect(fuzzyDate.getEarliestPaddingOptions()).toEqual(expected);
  });

  test("should return original values when all fields are specified", () => {
    const options = { 
      year: 2023, 
      month: 5, 
      day: 15, 
      hour: 10, 
      minute: 30, 
      second: 45, 
      millisecond: 500 
    };
    const fuzzyDate = new FuzzyDate(options);
    
    expect(fuzzyDate.getEarliestPaddingOptions()).toEqual(options);
  });
});