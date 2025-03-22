import { DateTime } from "luxon";
import { isEmpty } from "./util";

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

export interface PreciseDateOptions extends FuzzyDateOptions {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
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
    
    if (!FuzzyDate.isOptionsFilledInHierarchy(options)) {
      throw new FuzzyDateHierarchyError();
    }
    if (!FuzzyDate.isOptionsOnCalendar(this)) {
      throw new FuzzyDateCalendarError();
    }
  }

  private static isOptionsFilledInHierarchy(options: FuzzyDateOptions): boolean {
    const fields = ['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'] as const;
  
    const firstEmptyIndex = fields.findIndex(field => isEmpty(options[field]));
    
    if (firstEmptyIndex === -1) {
      return true;
    }
    
    return fields.slice(firstEmptyIndex).every(field => isEmpty(options[field]));
  }

  private static isOptionsOnCalendar(options: FuzzyDateOptions): boolean {
    const dt = DateTime.fromObject({
      year: options.year,
      month: options.month ?? 1,
      day: options.day ?? 1,
      hour: options.hour ?? 0,
      minute: options.minute ?? 0,
      second: options.second ?? 0,
      millisecond: options.millisecond ?? 0
    });
  
    return dt.isValid;
  }

  /**
   * Get the earliest possible date options that this FuzzyDate represents
   */
  getEarliestPaddingOptions(): PreciseDateOptions {
    return {
      year: this.year,
      month: this.month ?? 1,
      day: this.day ?? 1,
      hour: this.hour ?? 0,
      minute: this.minute ?? 0,
      second: this.second ?? 0,
      millisecond: this.millisecond ?? 0
    };
  }

  /**
   * Get precision level of this FuzzyDate
   */
  getPrecision(): keyof FuzzyDateOptions {
    if (!isEmpty(this.millisecond)) {
      return 'millisecond';
    }
    if (!isEmpty(this.second)) {
      return 'second';
    }
    if (!isEmpty(this.minute)) {
      return 'minute';
    }
    if (!isEmpty(this.hour)) {
      return 'hour';
    }
    if (!isEmpty(this.day)) {
      return 'day';
    }
    if (!isEmpty(this.month)) {
      return 'month';
    }
    return 'year';
  }

  /**
   * Get the latest possible date options that this FuzzyDate represents
   */
  getLatestPaddingOptions(): PreciseDateOptions {
    let dt: DateTime;
    
    if (isEmpty(this.month)) {
      dt = DateTime.fromObject({ year: this.year + 1 }).minus({ milliseconds: 1 });
    } else if (isEmpty(this.day)) {
      const month = this.month as number; // ensured by isFuzzyDateFieldsFilledInHierarchy
      const nextMonth = month + 1 > 12 ? 1 : month + 1;
      const nextMonthYear = month + 1 > 12 ? this.year + 1 : this.year;
      dt = DateTime.fromObject({ year: nextMonthYear, month: nextMonth }).minus({ milliseconds: 1 });
    } else if (isEmpty(this.hour)) {
      dt = DateTime.fromObject({ 
        year: this.year, 
        month: this.month, 
        day: this.day 
      }).plus({ days: 1 }).minus({ milliseconds: 1 });
    } else if (isEmpty(this.minute)) {
      dt = DateTime.fromObject({ 
        year: this.year, 
        month: this.month, 
        day: this.day, 
        hour: this.hour 
      }).plus({ hours: 1 }).minus({ milliseconds: 1 });
    } else if (isEmpty(this.second)) {
      dt = DateTime.fromObject({ 
        year: this.year, 
        month: this.month, 
        day: this.day, 
        hour: this.hour, 
        minute: this.minute 
      }).plus({ minutes: 1 }).minus({ milliseconds: 1 });
    } else if (isEmpty(this.millisecond)) {
      dt = DateTime.fromObject({ 
        year: this.year, 
        month: this.month, 
        day: this.day, 
        hour: this.hour, 
        minute: this.minute, 
        second: this.second 
      }).plus({ seconds: 1 }).minus({ milliseconds: 1 });
    } else {
      dt = DateTime.fromObject({ 
        year: this.year, 
        month: this.month, 
        day: this.day, 
        hour: this.hour, 
        minute: this.minute, 
        second: this.second, 
        millisecond: this.millisecond 
      });
    }

    return {
      year: dt.year,
      month: dt.month,
      day: dt.day,
      hour: dt.hour,
      minute: dt.minute,
      second: dt.second,
      millisecond: dt.millisecond
    };
  }
}