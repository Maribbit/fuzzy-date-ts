import { FuzzyDate, PreciseDateOptions } from "../../src/fuzzyDate";

describe("FuzzyDate.getEarliestPaddingOptions", () => {
  test("should pad month, day, and time parts when only year is specified", () => {
    const fuzzyDate = new FuzzyDate({ year: 2023 });
    
    const expected: PreciseDateOptions = {
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
    
    const expected: PreciseDateOptions = {
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
    
    const expected: PreciseDateOptions = {
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
    
    const expected: PreciseDateOptions = {
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

describe("FuzzyDate.getLatestPaddingOptions", () => {
    // Edge case 1: Year boundary
    test("should handle year boundaries correctly", () => {
      const fuzzyDate = new FuzzyDate({ year: 2023 });
      const expected: PreciseDateOptions = {
        year: 2023,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 2: Month with fewer days (February)
    test("should handle February correctly", () => {
      const fuzzyDate = new FuzzyDate({ year: 2023, month: 2 });
      const expected: PreciseDateOptions = {
        year: 2023,
        month: 2,
        day: 28, // Non-leap year
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 3: Leap year February
    test("should handle February in a leap year correctly", () => {
      const fuzzyDate = new FuzzyDate({ year: 2024, month: 2 });
      const expected: PreciseDateOptions = {
        year: 2024,
        month: 2,
        day: 29, // Leap year
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 4: Month rollover - December to January
    test("should handle December to January rollover correctly", () => {
      const fuzzyDate = new FuzzyDate({ year: 2023, month: 12 });
      const expected: PreciseDateOptions = {
        year: 2023,
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 5: Month with 30 days
    test("should handle months with 30 days correctly", () => {
      const fuzzyDate = new FuzzyDate({ year: 2023, month: 4 }); // April
      const expected: PreciseDateOptions = {
        year: 2023,
        month: 4,
        day: 30,
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 6: Day rollover at month end
    test("should handle day rollover at month end correctly", () => {
      const fuzzyDate = new FuzzyDate({ year: 2023, month: 3, day: 31 });
      const expected: PreciseDateOptions = {
        year: 2023,
        month: 3,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 7: Hour rollover at day end
    test("should handle hour rollover at day end correctly", () => {
      const fuzzyDate = new FuzzyDate({ year: 2023, month: 3, day: 15, hour: 23 });
      const expected: PreciseDateOptions = {
        year: 2023,
        month: 3,
        day: 15,
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 8: Minute rollover at hour end
    test("should handle minute rollover at hour end correctly", () => {
      const fuzzyDate = new FuzzyDate({ 
        year: 2023, month: 3, day: 15, hour: 14, minute: 59 
      });
      const expected: PreciseDateOptions = {
        year: 2023,
        month: 3,
        day: 15,
        hour: 14,
        minute: 59,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 9: Second rollover at minute end
    test("should handle second rollover at minute end correctly", () => {
      const fuzzyDate = new FuzzyDate({ 
        year: 2023, month: 3, day: 15, hour: 14, minute: 30, second: 59 
      });
      const expected: PreciseDateOptions = {
        year: 2023,
        month: 3,
        day: 15,
        hour: 14,
        minute: 30,
        second: 59,
        millisecond: 999
      };
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
    
    // Edge case 10: Full precision date (should return exact values)
    test("should return exact values for full precision date", () => {
      const options = { 
        year: 2023, month: 3, day: 15, hour: 14, minute: 30, second: 45, millisecond: 500 
      };
      const fuzzyDate = new FuzzyDate(options);
      const expected: PreciseDateOptions = {...options};
      
      const result = fuzzyDate.getLatestPaddingOptions();
      expect(result).toEqual(expected);
    });
  });