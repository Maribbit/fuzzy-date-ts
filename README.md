# fuzzy-date-ts

A TypeScript library for handling fuzzy dates with precision levels from year to millisecond.

[![npm version](https://img.shields.io/npm/v/fuzzy-date-ts.svg)](https://www.npmjs.com/package/fuzzy-date-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [中文](README.zh-CN.md)

## Overview

`fuzzy-date-ts` provides a lightweight solution for handling dates with varying precision. Whether you're dealing with historical dates like "2023", "March 2023", or precise timestamps like "March 22, 2023, 10:30:45.500", `FuzzyDate` handles them all with type safety and validation.

While `fuzzy-date-ts` uses Luxon internally for calendar calculations, it's designed to work well with any date library or native JavaScript dates:

- No exposed dependencies: The public API doesn't expose Luxon types
- Simple data structure: All inputs and outputs are plain JavaScript objects
- Explicit precision control: You always know exactly what level of detail you're working with
- Range-based approach: Acknowledges and handles the inherent uncertainty in fuzzy dates

This design allows you to combine `fuzzy-date-ts` with other date libraries as needed, while providing solid representations for dates with varying precision.

See more details in the Integration with Other Libraries section.

## Use Cases

`fuzzy-date-ts` is particularly useful for:

- Historical dates: When you only know the year or month
- Form data: When users might provide partial date information
- Data migration: When source data has inconsistent precision
- Content management: For scheduling content with varying precision
- Date ranges: When you need to represent an entire month, year, etc.

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

### Input Validation

`FuzzyDate` enforces the following validations:

1. Date field hierarchy validation: precision must be filled from low to high
2. Calendar correctness validation: the date must exist on the calendar

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

### Checking Precision

```typescript
const date = new FuzzyDate({ year: 2023, month: 3 });
console.log(date.getPrecision()); // 'month'

const fullDate = new FuzzyDate({
  year: 2023, month: 3, day: 22, hour: 10, minute: 30
});
console.log(fullDate.getPrecision()); // 'minute'
```

### Padding to Precise Dates

Each fuzzy date actually represents a range of time: from the earliest possible date to the latest possible date.

For example, "March 2023" represents the entire month from the 1st at 00:00:00.000 to the 31st at 23:59:59.999.

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

### Calculating Date Differences

`FuzzyDate` doesn't provide calculation methods because the difference between two `FuzzyDate` objects cannot be measured precisely.

However, you can use padding methods to calculate a range for this difference. Here's an example using the Luxon library:

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

## Integration with Other Libraries

### Working with Native JavaScript Date

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
  
  options.hour = dateTime.hour;
  if (precision === 'hour') return new FuzzyDate(options);
  
  options.minute = dateTime.minute;
  if (precision === 'minute') return new FuzzyDate(options);
  
  options.second = dateTime.second;
  if (precision === 'second') return new FuzzyDate(options);
  
  options.millisecond = dateTime.millisecond;
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

### Using with Day.js

```typescript
import dayjs from 'dayjs';

// Convert from FuzzyDate to Day.js
function fuzzyDateToDayjs(fuzzyDate: FuzzyDate, useEarliest: boolean = true): dayjs.Dayjs {
  const options = useEarliest 
    ? fuzzyDate.getEarliestPaddingOptions() 
    : fuzzyDate.getLatestPaddingOptions();
    
  return dayjs()
    .year(options.year)
    .month(options.month - 1) // Day.js months are 0-indexed
    .date(options.day)
    .hour(options.hour)
    .minute(options.minute)
    .second(options.second)
    .millisecond(options.millisecond);
}

// Convert from Day.js to FuzzyDate
function dayjsToFuzzyDate(
  date: dayjs.Dayjs, 
  precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
): FuzzyDate {
  const options: any = { year: date.year() };
  
  if (precision === 'year') return new FuzzyDate(options);
  
  options.month = date.month() + 1; // Day.js months are 0-indexed
  if (precision === 'month') return new FuzzyDate(options);
  
  options.day = date.date();
  if (precision === 'day') return new FuzzyDate(options);
  
  options.hour = date.hour();
  if (precision === 'hour') return new FuzzyDate(options);
  
  options.minute = date.minute();
  if (precision === 'minute') return new FuzzyDate(options);
  
  options.second = date.second();
  if (precision === 'second') return new FuzzyDate(options);
  
  options.millisecond = date.millisecond();
  return new FuzzyDate(options);
}

// Example usage
const now = dayjs();
const fuzzyMonth = dayjsToFuzzyDate(now, 'month');
console.log(fuzzyMonth.month); // Current month

// Calculate the difference between two dates
const startFuzzy = new FuzzyDate({ year: 2023, month: 1 });
const endFuzzy = new FuzzyDate({ year: 2023, month: 6 });

const startDayjs = fuzzyDateToDayjs(startFuzzy, true); // Earliest possible time
const endDayjs = fuzzyDateToDayjs(endFuzzy, false);    // Latest possible time

console.log(endDayjs.diff(startDayjs, 'month')); // Shows month difference
console.log(endDayjs.diff(startDayjs, 'day'));   // Shows day difference
```

### Using with Moment.js

```typescript
import moment from 'moment';

// Convert from FuzzyDate to Moment
function fuzzyDateToMoment(fuzzyDate: FuzzyDate, useEarliest: boolean = true): moment.Moment {
  const options = useEarliest 
    ? fuzzyDate.getEarliestPaddingOptions() 
    : fuzzyDate.getLatestPaddingOptions();
    
  return moment({
    year: options.year,
    month: options.month - 1,  // Moment months are 0-indexed
    date: options.day,
    hour: options.hour,
    minute: options.minute,
    second: options.second,
    millisecond: options.millisecond
  });
}

// Convert from Moment to FuzzyDate
function momentToFuzzyDate(
  date: moment.Moment, 
  precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
): FuzzyDate {
  const options: any = { year: date.year() };
  
  if (precision === 'year') return new FuzzyDate(options);
  
  options.month = date.month() + 1; // Moment months are 0-indexed
  if (precision === 'month') return new FuzzyDate(options);
  
  options.day = date.date();
  if (precision === 'day') return new FuzzyDate(options);
  
  options.hour = date.hour();
  if (precision === 'hour') return new FuzzyDate(options);
  
  options.minute = date.minute();
  if (precision === 'minute') return new FuzzyDate(options);
  
  options.second = date.second();
  if (precision === 'second') return new FuzzyDate(options);
  
  options.millisecond = date.millisecond();
  return new FuzzyDate(options);
}

// Example usage
const now = moment();
const fuzzyMonth = momentToFuzzyDate(now, 'month');
console.log(fuzzyMonth.month); // Current month

// Calculate date range
const event = new FuzzyDate({ year: 2023, month: 3 }); // March 2023
const earliestMoment = fuzzyDateToMoment(event, true);
const latestMoment = fuzzyDateToMoment(event, false);

console.log(earliestMoment.format('YYYY-MM-DD HH:mm:ss')); // 2023-03-01 00:00:00
console.log(latestMoment.format('YYYY-MM-DD HH:mm:ss'));   // 2023-03-31 23:59:59

// Check if a specific date is within the fuzzy date range
const testDate = moment('2023-03-15');
const isInRange = testDate.isBetween(earliestMoment, latestMoment, null, '[]');
console.log(isInRange ? 'Date is in range' : 'Date is not in range'); // Date is in range
```

## Serialization Format

`FuzzyDate` uses a custom Fuzzy Date String format for serialization. This format is designed to be:
- Human-readable
- Sortable
- Flexible enough to represent varying levels of precision

The format supports the following precision levels:
- Year: "2023"
- Year-Month: "2023-05"
- Year-Month-Day: "2023-05-15"
- Year-Month-Day Hour: "2023-05-15T10"
- Year-Month-Day Hour:Minute: "2023-05-15T10:30"
- Year-Month-Day Hour:Minute:Second: "2023-05-15T10:30:45"
- Year-Month-Day Hour:Minute:Second.Millisecond: "2023-05-15T10:30:45.500"

Edge cases:
- Earliest Date: "-100000-01-01T00:00:00.000"
- Latest Date: "99999-12-31T23:59:59.999"

### Serialization Examples

```typescript
// Convert FuzzyDate to string
const yearOnly = new FuzzyDate({ year: 2023 });
console.log(yearOnly.toString()); // "2023"

const monthPrecision = new FuzzyDate({ year: 2023, month: 5 });
console.log(monthPrecision.toString()); // "2023-05"

const fullPrecision = new FuzzyDate({
  year: 2023, 
  month: 5, 
  day: 15, 
  hour: 10, 
  minute: 30, 
  second: 45, 
  millisecond: 500
});
console.log(fullPrecision.toString()); // "2023-05-15T10:30:45.500"

// Parse string to FuzzyDate
const fromYear = FuzzyDate.fromString("2023");
console.log(fromYear.year); // 2023
console.log(fromYear.month); // undefined

const fromMonth = FuzzyDate.fromString("2023-05");
console.log(fromMonth.year); // 2023
console.log(fromMonth.month); // 5
console.log(fromMonth.day); // undefined

const fromFull = FuzzyDate.fromString("2023-05-15T10:30:45.500");
console.log(fromFull.year); // 2023
console.log(fromFull.month); // 5
console.log(fromFull.day); // 15
console.log(fromFull.hour); // 10
console.log(fromFull.minute); // 30
console.log(fromFull.second); // 45
console.log(fromFull.millisecond); // 500
```

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