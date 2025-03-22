# fuzzy-date-ts

A TypeScript library for handling dates with variable precision, from year-level to millisecond-level accuracy.

[![npm version](https://img.shields.io/npm/v/fuzzy-date-ts.svg)](https://www.npmjs.com/package/fuzzy-date-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

`fuzzy-date-ts` provides a solution for working with dates that have varying levels of precision. Whether you're dealing with historical dates like "2023", "March 2023", or precise timestamps like "March 22, 2023, 10:30:45.500", `FuzzyDate` handles them all with type safety and validation.

## Installation

```bash
npm install fuzzy-date-ts
# or
yarn add fuzzy-date-ts
```

## Basic Usage

### Creating Fuzzy Dates

```typescript
import { FuzzyDate } from 'fuzzy-date-ts';

// Year precision
const yearOnly = new FuzzyDate({ year: 2023 });

// Month precision
const monthPrecision = new FuzzyDate({ year: 2023, month: 3 }); // March 2023

// Day precision
const dayPrecision = new FuzzyDate({ year: 2023, month: 3, day: 22 }); // March 22, 2023

// Full timestamp precision
const fullPrecision = new FuzzyDate({
  year: 2023, 
  month: 3, 
  day: 22, 
  hour: 10, 
  minute: 30, 
  second: 45, 
  millisecond: 500
});
```

### Checking Precision

```typescript
const date = new FuzzyDate({ year: 2023, month: 3 });
console.log(date.getPrecision()); // 'month'

const fullDate = new FuzzyDate({
  year: 2023, month: 3, day: 22, hour: 10, minute: 30
});
console.log(fullDate.getPrecision()); // 'minute'
```

### Getting Date Ranges

Every fuzzy date represents a range of possible times. For example, "March 2023" represents the entire month from the 1st at 00:00:00.000 to the 31st at 23:59:59.999.

```typescript
// Get earliest possible date (e.g., March 1, 2023, 00:00:00.000)
const earliest = date.getEarliestPaddingOptions();
console.log(earliest); 
// { year: 2023, month: 3, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }

// Get latest possible date (e.g., March 31, 2023, 23:59:59.999)
const latest = date.getLatestPaddingOptions();
console.log(latest);
// { year: 2023, month: 3, day: 31, hour: 23, minute: 59, second: 59, millisecond: 999 }
```

## Advanced Usage

### Input Validation

`FuzzyDate` enforces hierarchical date fields and validates calendar correctness:

```typescript
// This will throw FuzzyDateHierarchyError because day is specified without month
try {
  new FuzzyDate({ year: 2023, day: 15 });
} catch (error) {
  console.log(error.name); // 'FuzzyDateHierarchyError'
}

// This will throw FuzzyDateCalendarError because February 30 doesn't exist
try {
  new FuzzyDate({ year: 2023, month: 2, day: 30 });
} catch (error) {
  console.log(error.name); // 'FuzzyDateCalendarError'
}
```

## Integrating with Other Libraries

### Working with Native JavaScript Date

`FuzzyDate` is designed to be library-agnostic. Here's how to convert between `FuzzyDate` and native JavaScript `Date`:

```typescript
// Convert from Date to FuzzyDate
function dateToFuzzyDate(date: Date, precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'): FuzzyDate {
  const options: any = { year: date.getFullYear() };
  
  if (precision === 'year') return new FuzzyDate(options);
  
  options.month = date.getMonth() + 1; // JavaScript months are 0-indexed
  if (precision === 'month') return new FuzzyDate(options);
  
  options.day = date.getDate();
  if (precision === 'day') return new FuzzyDate(options);
  
  options.hour = date.getHours();
  if (precision === 'hour') return new FuzzyDate(options);
  
  options.minute = date.getMinutes();
  if (precision === 'minute') return new FuzzyDate(options);
  
  options.second = date.getSeconds();
  if (precision === 'second') return new FuzzyDate(options);
  
  options.millisecond = date.getMilliseconds();
  return new FuzzyDate(options);
}

// Convert from FuzzyDate to Date (using earliest possible time)
function fuzzyDateToDate(fuzzyDate: FuzzyDate): Date {
  const earliest = fuzzyDate.getEarliestPaddingOptions();
  return new Date(
    earliest.year, 
    earliest.month - 1, // Convert to 0-indexed month
    earliest.day,
    earliest.hour,
    earliest.minute,
    earliest.second,
    earliest.millisecond
  );
}

// Example usage
const now = new Date();
const fuzzyMonth = dateToFuzzyDate(now, 'month');
console.log(fuzzyMonth.month); // Current month

const backToDate = fuzzyDateToDate(fuzzyMonth);
console.log(backToDate); // First day of current month
```

### Using with Luxon

Luxon is used internally by `fuzzy-date-ts`, but you can easily convert to/from Luxon's `DateTime`:

```typescript
import { DateTime } from 'luxon';

// Convert from FuzzyDate to Luxon DateTime
function fuzzyDateToDateTime(fuzzyDate: FuzzyDate, useEarliest: boolean = true): DateTime {
  const options = useEarliest 
    ? fuzzyDate.getEarliestPaddingOptions() 
    : fuzzyDate.getLatestPaddingOptions();
    
  return DateTime.fromObject(options);
}

// Convert from Luxon DateTime to FuzzyDate
function dateTimeToFuzzyDate(
  dateTime: DateTime, 
  precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
): FuzzyDate {
  const options: any = { year: dateTime.year };
  
  if (precision === 'year') return new FuzzyDate(options);
  
  options.month = dateTime.month;
  if (precision === 'month') return new FuzzyDate(options);
  
  options.day = dateTime.day;
  if (precision === 'day') return new FuzzyDate(options);
  
  // Continue with other precision levels...
  
  return new FuzzyDate(options);
}

// Example usage
const now = DateTime.now();
const fuzzyDay = dateTimeToFuzzyDate(now, 'day');

const earliestPossible = fuzzyDateToDateTime(fuzzyDay, true);
const latestPossible = fuzzyDateToDateTime(fuzzyDay, false);

console.log(earliestPossible.toISO()); // Today at 00:00:00.000
console.log(latestPossible.toISO());   // Today at 23:59:59.999
```

### Calculating Date Differences

To calculate the difference between two fuzzy dates, you can leverage the padding methods:

```typescript
import { DateTime, Interval } from 'luxon';

// Function to get the range of possible durations between two fuzzy dates
function getDurationRange(start: FuzzyDate, end: FuzzyDate) {
  // Minimum duration: latest possible start to earliest possible end
  const startLatest = DateTime.fromObject(start.getLatestPaddingOptions());
  const endEarliest = DateTime.fromObject(end.getEarliestPaddingOptions());
  
  // Maximum duration: earliest possible start to latest possible end
  const startEarliest = DateTime.fromObject(start.getEarliestPaddingOptions());
  const endLatest = DateTime.fromObject(end.getLatestPaddingOptions());
  
  // Calculate durations (only if end is later than start)
  let minDuration = null;
  if (endEarliest > startLatest) {
    minDuration = endEarliest.diff(startLatest);
  }
  
  const maxDuration = endLatest.diff(startEarliest);
  
  return { minDuration, maxDuration };
}

// Example
const event1 = new FuzzyDate({ year: 2023, month: 1 }); // January 2023
const event2 = new FuzzyDate({ year: 2023, month: 3 }); // March 2023

const { minDuration, maxDuration } = getDurationRange(event1, event2);

console.log(`Minimum duration: ${minDuration?.toFormat('M months, d days')}`);
// e.g., "Minimum duration: 1 month, 29 days"

console.log(`Maximum duration: ${maxDuration.toFormat('M months, d days')}`);
// e.g., "Maximum duration: 2 months, 30 days"
```

## Library Independence

While `fuzzy-date-ts` uses Luxon internally for calendar calculations, it's designed to work well with any date library or native JavaScript dates:

- **No Exposed Dependencies**: The public API doesn't expose Luxon types
- **Simple Data Structure**: All inputs and outputs are plain JavaScript objects
- **Explicit Precision Control**: You always know exactly what level of detail you're working with
- **Range-Based Approach**: Acknowledges and handles the inherent uncertainty in fuzzy dates

This design allows you to combine `fuzzy-date-ts` with other date libraries as needed, while providing solid representations for dates with varying precision.

## Use Cases

`fuzzy-date-ts` is particularly useful for:

- **Historical dates**: When you only know the year or month
- **Form data**: When users might provide partial date information
- **Data migration**: When source data has inconsistent precision
- **Content management**: For scheduling content with varying precision
- **Date ranges**: When you need to represent an entire month, year, etc.

## Error Handling

`fuzzy-date-ts` provides specific error types for validation issues:

```typescript
import { FuzzyDateHierarchyError, FuzzyDateCalendarError } from 'fuzzy-date-ts';

try {
  const invalidDate = new FuzzyDate({ year: 2023, month: 13 });
} catch (error) {
  if (error instanceof FuzzyDateCalendarError) {
    console.log('Invalid calendar date');
  } else if (error instanceof FuzzyDateHierarchyError) {
    console.log('Invalid field hierarchy');
  } else {
    console.log('Other error:', error);
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.