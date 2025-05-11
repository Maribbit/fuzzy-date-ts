import { FuzzyDate } from '../../src/fuzzyDate';
import { DateTime } from 'luxon';
import dayjs from 'dayjs';
import moment from 'moment';

describe('FuzzyDate Compatibility Tests', () => {
  describe('Native JavaScript Date', () => {
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

    // Convert from FuzzyDate to Date
    function fuzzyDateToDate(fuzzyDate: FuzzyDate): Date {
      const earliest = fuzzyDate.getEarliestPaddingOptions();
      return new Date(
        earliest.year, 
        earliest.month - 1,
        earliest.day,
        earliest.hour,
        earliest.minute,
        earliest.second,
        earliest.millisecond
      );
    }

    it('should convert between Date and FuzzyDate', () => {
      const now = new Date();
      const fuzzyMonth = dateToFuzzyDate(now, 'month');
      expect(fuzzyMonth.month).toBe(now.getMonth() + 1);

      const backToDate = fuzzyDateToDate(fuzzyMonth);
      expect(backToDate.getMonth()).toBe(now.getMonth());
      expect(backToDate.getDate()).toBe(1); // Should be first day of month
    });
  });

  describe('Luxon', () => {
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

    it('should convert between DateTime and FuzzyDate', () => {
      const now = DateTime.now();
      const fuzzyDay = dateTimeToFuzzyDate(now, 'day');

      const earliestPossible = fuzzyDateToDateTime(fuzzyDay, true);
      const latestPossible = fuzzyDateToDateTime(fuzzyDay, false);

      expect(earliestPossible.toISO()).toMatch(/T00:00:00.000/);
      expect(latestPossible.toISO()).toMatch(/T23:59:59.999/);
    });
  });

  describe('Day.js', () => {
    // Convert from FuzzyDate to Day.js
    function fuzzyDateToDayjs(fuzzyDate: FuzzyDate, useEarliest: boolean = true): dayjs.Dayjs {
      const options = useEarliest 
        ? fuzzyDate.getEarliestPaddingOptions() 
        : fuzzyDate.getLatestPaddingOptions();
        
      return dayjs()
        .year(options.year)
        .month(options.month - 1)
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
      
      options.month = date.month() + 1;
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

    it('should convert between Day.js and FuzzyDate', () => {
      const now = dayjs();
      const fuzzyMonth = dayjsToFuzzyDate(now, 'month');
      expect(fuzzyMonth.month).toBe(now.month() + 1);

      const startFuzzy = new FuzzyDate({ year: 2023, month: 1 });
      const endFuzzy = new FuzzyDate({ year: 2023, month: 6 });

      const startDayjs = fuzzyDateToDayjs(startFuzzy, true);
      const endDayjs = fuzzyDateToDayjs(endFuzzy, false);

      expect(endDayjs.diff(startDayjs, 'month')).toBe(5);
    });
  });

  describe('Moment.js', () => {
    // Convert from FuzzyDate to Moment
    function fuzzyDateToMoment(fuzzyDate: FuzzyDate, useEarliest: boolean = true): moment.Moment {
      const options = useEarliest 
        ? fuzzyDate.getEarliestPaddingOptions() 
        : fuzzyDate.getLatestPaddingOptions();
        
      return moment({
        year: options.year,
        month: options.month - 1,
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
      
      options.month = date.month() + 1;
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

    it('should convert between Moment and FuzzyDate', () => {
      const now = moment();
      const fuzzyMonth = momentToFuzzyDate(now, 'month');
      expect(fuzzyMonth.month).toBe(now.month() + 1);

      const event = new FuzzyDate({ year: 2023, month: 3 });
      const earliestMoment = fuzzyDateToMoment(event, true);
      const latestMoment = fuzzyDateToMoment(event, false);

      expect(earliestMoment.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-03-01 00:00:00');
      expect(latestMoment.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-03-31 23:59:59');

      const testDate = moment('2023-03-15');
      const isInRange = testDate.isBetween(earliestMoment, latestMoment, null, '[]');
      expect(isInRange).toBe(true);
    });
  });
});
