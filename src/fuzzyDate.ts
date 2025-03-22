import { DateTime, Interval } from "luxon";
import { isEmpty } from "./util";

/**
 * Specific error types for FuzzyDate validation issues
 */
export class FuzzyDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FuzzyDateError';
  }
}

export class FuzzyDateHierarchyError extends FuzzyDateError {
  constructor() {
    super('FuzzyDate fields must be filled in order');
    this.name = 'FuzzyDateHierarchyError';
  }
}

export class FuzzyDateCalendarError extends FuzzyDateError {
  constructor() {
    super('FuzzyDate must represent a valid calendar date');
    this.name = 'FuzzyDateCalendarError';
  }
}

/**
 * Options for creating a FuzzyDate
 */
export interface FuzzyDateOptions {
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

/**
 * Represents a fuzzy date with optional data fields
 */
export class FuzzyDate {
  readonly year: number;
  readonly month?: number;
  readonly day?: number;
  readonly hour?: number;
  readonly minute?: number;
  readonly second?: number;
  readonly millisecond?: number;

  /**
   * Create a new FuzzyDate instance
   * @throws {FuzzyDateHierarchyError} When fields aren't filled in hierarchical order
   * @throws {FuzzyDateCalendarError} When date isn't a valid calendar date
   */
  constructor(options: FuzzyDateOptions) {
    this.year = options.year;
    this.month = options.month;
    this.day = options.day;
    this.hour = options.hour;
    this.minute = options.minute;
    this.second = options.second;
    this.millisecond = options.millisecond;
    
    if (!isFuzzyDateFieldsFilledInHierarchy(this)) {
      throw new FuzzyDateHierarchyError();
    }
    if (!isFuzzyDateOnCalendar(this)) {
      throw new FuzzyDateCalendarError();
    }
  }
  
  /**
   * Get the earliest possible DateTime that this FuzzyDate represents
   */
  getEarliestDateTime(): DateTime {
    return DateTime.fromObject({
      year: this.year,
      month: this.month ?? 1,
      day: this.day ?? 1,
      hour: this.hour ?? 0,
      minute: this.minute ?? 0,
      second: this.second ?? 0,
      millisecond: this.millisecond ?? 0
    });
  }

  /**
   * Gets the latest possible DateTime that this FuzzyDate represents
   */
  getLatestDateTime(): DateTime {
    if (isEmpty(this.month)) {
      // Last millisecond of the year
      return DateTime.fromObject({ year: this.year + 1 }).minus({ milliseconds: 1 });
    }
    
    // Continue with other cases...
    return this.getEarliestDateTime();
  }

  toDateRange(): Interval {
    return Interval.fromDateTimes(this.getEarliestDateTime(), this.getLatestDateTime());
  }
}

/**
 * Checks if a fuzzy date's fields are filled in the correct hierarchy
 */
function isFuzzyDateFieldsFilledInHierarchy(fuzzyDate: FuzzyDate): boolean {
  const fields = ['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'] as const;
  
  const firstEmptyIndex = fields.findIndex(field => isEmpty(fuzzyDate[field]));
  
  if (firstEmptyIndex === -1) {
    return true;
  }
  
  return fields.slice(firstEmptyIndex).every(field => isEmpty(fuzzyDate[field]));
}

/**
 * Checks if a fuzzy date represents a valid calendar date
 */
function isFuzzyDateOnCalendar(fuzzyDate: FuzzyDate): boolean {
  const dt = DateTime.fromObject({
    year: fuzzyDate.year,
    month: fuzzyDate.month ?? 1,
    day: fuzzyDate.day ?? 1,
    hour: fuzzyDate.hour ?? 0,
    minute: fuzzyDate.minute ?? 0,
    second: fuzzyDate.second ?? 0,
    millisecond: fuzzyDate.millisecond ?? 0
  });

  return dt.isValid;
}