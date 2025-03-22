import { isEmpty } from "./util";

/**
 * Options for creating a FuzzyDuration
 */
export interface FuzzyDurationOptions {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/**
 * Represents a fuzzy time duration with varying levels of precision
 */
export class FuzzyDuration {
  readonly years: number;
  readonly months: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;

  // Precision indicates the finest level of granularity in this duration
  readonly precision: keyof FuzzyDurationOptions;

  constructor(options: FuzzyDurationOptions) {
    // Set all fields with default of 0 (unlike FuzzyDate where fields can be undefined)
    this.years = options.years ?? 0;
    this.months = options.months ?? 0;
    this.days = options.days ?? 0;
    this.hours = options.hours ?? 0;
    this.minutes = options.minutes ?? 0;
    this.seconds = options.seconds ?? 0;
    this.milliseconds = options.milliseconds ?? 0;
    this.precision = FuzzyDuration.calculatePrecision(options);
  }

  // Calculate the finest level of precision specified in the options
  private static calculatePrecision(
    options: FuzzyDurationOptions
  ): keyof FuzzyDurationOptions {
    if (!isEmpty(options.milliseconds)) return "milliseconds";
    if (!isEmpty(options.seconds)) return "seconds";
    if (!isEmpty(options.minutes)) return "minutes";
    if (!isEmpty(options.hours)) return "hours";
    if (!isEmpty(options.days)) return "days";
    if (!isEmpty(options.months)) return "months";
    return "years";
  }
}
