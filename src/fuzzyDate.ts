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

export class FuzzyDateDeserializationError extends FuzzyDateError {
  constructor(message: string) {
    super(message);
    this.name = 'FuzzyDateDeserializationError';
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

  /**
   * Convert a FuzzyDate to a Fuzzy Date String
   * @returns Fuzzy Date String representation of the FuzzyDate
   * 
   * The format follows a subset of ISO 8601, allowing for partial precision:
   * - Year: "2023"
   * - Year-Month: "2023-05"
   * - Year-Month-Day: "2023-05-15"
   * - Year-Month-Day Hour: "2023-05-15T10"
   * - Year-Month-Day Hour:Minute: "2023-05-15T10:30"
   * - Year-Month-Day Hour:Minute:Second: "2023-05-15T10:30:45"
   * - Year-Month-Day Hour:Minute:Second.Millisecond: "2023-05-15T10:30:45.500"
   */
  toString(): string {
    const parts: string[] = [];
    
    // Handle BC years with negative sign
    parts.push(this.year.toString().padStart(4, '0'));
    
    if (this.month !== undefined) {
      parts.push('-');
      parts.push(this.month.toString().padStart(2, '0'));
      
      if (this.day !== undefined) {
        parts.push('-');
        parts.push(this.day.toString().padStart(2, '0'));
        
        if (this.hour !== undefined) {
          parts.push('T');
          parts.push(this.hour.toString().padStart(2, '0'));
          
          if (this.minute !== undefined) {
            parts.push(':');
            parts.push(this.minute.toString().padStart(2, '0'));
            
            if (this.second !== undefined) {
              parts.push(':');
              parts.push(this.second.toString().padStart(2, '0'));
              
              if (this.millisecond !== undefined) {
                parts.push('.');
                parts.push(this.millisecond.toString().padStart(3, '0'));
              }
            }
          }
        }
      }
    }
    
    return parts.join('');
  }

  /**
   * Create a FuzzyDate from a Fuzzy Date String
   * @param dateString Fuzzy Date String to parse
   * @throws {FuzzyDateDeserializationError} When the string is not a valid Fuzzy Date String format
   * @returns A new FuzzyDate instance
   * 
   * The format follows a subset of ISO 8601, allowing for partial precision:
   * - Year: "2023"
   * - Year-Month: "2023-05"
   * - Year-Month-Day: "2023-05-15"
   * - Year-Month-Day Hour: "2023-05-15T10"
   * - Year-Month-Day Hour:Minute: "2023-05-15T10:30"
   * - Year-Month-Day Hour:Minute:Second: "2023-05-15T10:30:45"
   * - Year-Month-Day Hour:Minute:Second.Millisecond: "2023-05-15T10:30:45.500"
   */
  static fromString(dateString: string): FuzzyDate {
    // Validate the overall format
    if (!/^-?\d+(-\d{2}(-\d{2}(T\d{2}(:\d{2}(:\d{2}(\.\d{3})?)?)?)?)?)?$/.test(dateString)) {
      throw new FuzzyDateDeserializationError('Invalid format');
    }

    // Split the string into date and time parts
    const [datePart, timePart] = dateString.split('T');
    
    // Handle negative year case
    const hasNegativeYear = datePart.startsWith('-');
    const dateParts = hasNegativeYear 
      ? ['-' + datePart.split('-')[1], ...datePart.split('-').slice(2)]
      : datePart.split('-');
    
    if (dateParts.length < 1 || dateParts.length > 3) {
      throw new FuzzyDateDeserializationError('Invalid format');
    }
    
    const options: FuzzyDateOptions = {
      year: parseInt(dateParts[0], 10)
    };
    
    if (isNaN(options.year)) {
      throw new FuzzyDateDeserializationError('Invalid format');
    }
    
    // Handle month and day parts
    if (dateParts.length > 1) {
      options.month = parseInt(dateParts[1], 10);
      if (isNaN(options.month)) {
        throw new FuzzyDateDeserializationError('Invalid format');
      }
    }
    
    if (dateParts.length > 2) {
      options.day = parseInt(dateParts[2], 10);
      if (isNaN(options.day)) {
        throw new FuzzyDateDeserializationError('Invalid format');
      }
    }
    
    if (timePart) {
      const timeParts = timePart.split(':');
      
      if (timeParts.length < 1 || timeParts.length > 3) {
        throw new FuzzyDateDeserializationError('Invalid format');
      }
      
      options.hour = parseInt(timeParts[0], 10);
      if (isNaN(options.hour)) {
        throw new FuzzyDateDeserializationError('Invalid format');
      }
      
      if (timeParts.length > 1) {
        options.minute = parseInt(timeParts[1], 10);
        if (isNaN(options.minute)) {
          throw new FuzzyDateDeserializationError('Invalid format');
        }
      }
      
      if (timeParts.length > 2) {
        const [second, millisecond] = timeParts[2].split('.');
        options.second = parseInt(second, 10);
        if (isNaN(options.second)) {
          throw new FuzzyDateDeserializationError('Invalid format');
        }
        
        if (millisecond) {
          options.millisecond = parseInt(millisecond, 10);
          if (isNaN(options.millisecond)) {
            throw new FuzzyDateDeserializationError('Invalid format');
          }
        }
      }
    }
    
    return new FuzzyDate(options);
  }
}