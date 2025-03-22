# fuzzy-date-ts

一个用于处理模糊日期的 TypeScript 库，支持从年级精度到毫秒级精度。

[![npm version](https://img.shields.io/npm/v/fuzzy-date-ts.svg)](https://www.npmjs.com/package/fuzzy-date-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[English](README.md) | [中文](README.zh-CN.md)

## 概述

`fuzzy-date-ts` 提供了一种轻量级的、处理不同精度日期的解决方案。无论是处理像"2023年"、"2023年3月"这样的历史日期，还是像"2023年3月22日 10:30:45.500"这样的精确时间，`FuzzyDate` 都能够以类型安全的方式处理它们，并提供校验。

虽然 `fuzzy-date-ts` 内部使用 Luxon 进行日历计算，但它设计为可与任何日期库或原生 JavaScript 日期良好协作：

- 无公开依赖：公共 API 不暴露 Luxon 类型
- 简单数据结构：所有输入和输出都是普通 JavaScript 对象
- 显式精度控制：您始终清楚正在处理的详细级别
- 基于范围的方法：承认并处理模糊日期中的固有不确定性

这种设计允许您根据需要将 fuzzy-date-ts 与其他日期库结合使用，同时为具有不同精度的日期提供可靠的表示。

详情参照[与其他库集成](#与其他库集成)

## 使用场景

fuzzy-date-ts 特别适用于：

- 历史日期：当你只知道年份或月份时
- 表单数据：当用户可能提供部分日期信息时
- 数据迁移：当源数据具有不一致的精度时
- 内容管理：用于调度具有不同精度的内容
- 日期范围：当你需要表示整个月份、年份等时

## 安装

```bash
npm install fuzzy-date-ts
# 或者
yarn add fuzzy-date-ts
```

## 基本用法

### 创建模糊日期

```typescript
import { FuzzyDate } from 'fuzzy-date-ts';

// 年精度
const yearOnly = new FuzzyDate({ year: 2023 });

// 月精度
const monthPrecision = new FuzzyDate({ year: 2023, month: 3 }); // 2023年3月

// 日精度
const dayPrecision = new FuzzyDate({ year: 2023, month: 3, day: 22 }); // 2023年3月22日

// 完整时间戳精度
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

### 输入验证

`FuzzyDate` 强制执行以下验证：

1. 日期字段层级结构验证：精度必须从低到高依次填写
2. 日历正确性验证：所填日期必须在日历上存在

```typescript
// 这将抛出 FuzzyDateHierarchyError，因为指定了日期但没有指定月份
try {
  new FuzzyDate({ year: 2023, day: 15 });
} catch (error) {
  console.log(error.name); // 'FuzzyDateHierarchyError'
}

// 这将抛出 FuzzyDateCalendarError，因为2月30日不存在
try {
  new FuzzyDate({ year: 2023, month: 2, day: 30 });
} catch (error) {
  console.log(error.name); // 'FuzzyDateCalendarError'
}
```

### 检查精度

```typescript
const date = new FuzzyDate({ year: 2023, month: 3 });
console.log(date.getPrecision()); // 'month'

const fullDate = new FuzzyDate({
  year: 2023, month: 3, day: 22, hour: 10, minute: 30
});
console.log(fullDate.getPrecision()); // 'minute'
```

### 填充为精确日期

每个模糊日期实际上是代表了一个时间范围：从最早可能的日期，到最晚可能的日期。

例如，“2023年3月”代表从当月1日 00:00:00.000 到31日 23:59:59.999 的整个月份。

```typescript
// 获取最早可能的日期（如：2023年3月1日 00:00:00.000）
const earliest = date.getEarliestPaddingOptions();
console.log(earliest); 
// { year: 2023, month: 3, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }

// 获取最晚可能的日期（如：2023年3月31日 23:59:59.999）
const latest = date.getLatestPaddingOptions();
console.log(latest);
// { year: 2023, month: 3, day: 31, hour: 23, minute: 59, second: 59, millisecond: 999 }
```

## 高级用法

### 计算日期差异

`FuzzyDate`没有提供计算方法，这是因为两个`FuzzyDate`之间的差异无法准确衡量。

但是你可以使用填充方法来计算这个差异的范围。以下是使用Luxon库进行计算的示例：

```typescript
import { DateTime, Interval } from 'luxon';

// 获取两个模糊日期之间可能的持续时间范围的函数
function getDurationRange(start: FuzzyDate, end: FuzzyDate) {
  // 最小持续时间：最晚可能的开始时间到最早可能的结束时间
  const startLatest = DateTime.fromObject(start.getLatestPaddingOptions());
  const endEarliest = DateTime.fromObject(end.getEarliestPaddingOptions());
  
  // 最大持续时间：最早可能的开始时间到最晚可能的结束时间
  const startEarliest = DateTime.fromObject(start.getEarliestPaddingOptions());
  const endLatest = DateTime.fromObject(end.getLatestPaddingOptions());
  
  // 计算持续时间（仅当结束时间晚于开始时间时）
  let minDuration = null;
  if (endEarliest > startLatest) {
    minDuration = endEarliest.diff(startLatest);
  }
  
  const maxDuration = endLatest.diff(startEarliest);
  
  return { minDuration, maxDuration };
}

// 示例
const event1 = new FuzzyDate({ year: 2023, month: 1 }); // 2023年1月
const event2 = new FuzzyDate({ year: 2023, month: 3 }); // 2023年3月

const { minDuration, maxDuration } = getDurationRange(event1, event2);

console.log(`最小持续时间: ${minDuration?.toFormat('M个月, d天')}`);
// 例如："最小持续时间: 1个月, 29天"

console.log(`最大持续时间: ${maxDuration.toFormat('M个月, d天')}`);
// 例如："最大持续时间: 2个月, 30天"
```

## 与其他库集成

### 与原生 JavaScript Date 配合使用

```typescript
// 从 Date 转换为 FuzzyDate
function dateToFuzzyDate(date: Date, precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'): FuzzyDate {
  const options: any = { year: date.getFullYear() };
  
  if (precision === 'year') return new FuzzyDate(options);
  
  options.month = date.getMonth() + 1; // JavaScript 月份从 0 开始索引
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

// 从 FuzzyDate 转换为 Date（使用最早可能的时间）
function fuzzyDateToDate(fuzzyDate: FuzzyDate): Date {
  const earliest = fuzzyDate.getEarliestPaddingOptions();
  return new Date(
    earliest.year, 
    earliest.month - 1, // 转换为从 0 开始的月份
    earliest.day,
    earliest.hour,
    earliest.minute,
    earliest.second,
    earliest.millisecond
  );
}

// 使用示例
const now = new Date();
const fuzzyMonth = dateToFuzzyDate(now, 'month');
console.log(fuzzyMonth.month); // 当前月份

const backToDate = fuzzyDateToDate(fuzzyMonth);
console.log(backToDate); // 当月第一天
```

### 与 Luxon 一起使用

```typescript
import { DateTime } from 'luxon';

// 从 FuzzyDate 转换为 Luxon DateTime
function fuzzyDateToDateTime(fuzzyDate: FuzzyDate, useEarliest: boolean = true): DateTime {
  const options = useEarliest 
    ? fuzzyDate.getEarliestPaddingOptions() 
    : fuzzyDate.getLatestPaddingOptions();
    
  return DateTime.fromObject(options);
}

// 从 Luxon DateTime 转换为 FuzzyDate
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

// 使用示例
const now = DateTime.now();
const fuzzyDay = dateTimeToFuzzyDate(now, 'day');

const earliestPossible = fuzzyDateToDateTime(fuzzyDay, true);
const latestPossible = fuzzyDateToDateTime(fuzzyDay, false);

console.log(earliestPossible.toISO()); // 今天 00:00:00.000
console.log(latestPossible.toISO());   // 今天 23:59:59.999
```

### 与 Day.js 一起使用

```typescript
import dayjs from 'dayjs';

// 从 FuzzyDate 转换为 Day.js
function fuzzyDateToDayjs(fuzzyDate: FuzzyDate, useEarliest: boolean = true): dayjs.Dayjs {
  const options = useEarliest 
    ? fuzzyDate.getEarliestPaddingOptions() 
    : fuzzyDate.getLatestPaddingOptions();
    
  return dayjs()
    .year(options.year)
    .month(options.month - 1) // Day.js 中月份从 0 开始
    .date(options.day)
    .hour(options.hour)
    .minute(options.minute)
    .second(options.second)
    .millisecond(options.millisecond);
}

// 从 Day.js 转换为 FuzzyDate
function dayjsToFuzzyDate(
  date: dayjs.Dayjs, 
  precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
): FuzzyDate {
  const options: any = { year: date.year() };
  
  if (precision === 'year') return new FuzzyDate(options);
  
  options.month = date.month() + 1; // Day.js 月份是从 0 开始的
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

// 使用示例
const now = dayjs();
const fuzzyMonth = dayjsToFuzzyDate(now, 'month');
console.log(fuzzyMonth.month); // 当前月份

// 计算两个日期之间的差异
const startFuzzy = new FuzzyDate({ year: 2023, month: 1 });
const endFuzzy = new FuzzyDate({ year: 2023, month: 6 });

const startDayjs = fuzzyDateToDayjs(startFuzzy, true); // 最早可能时间
const endDayjs = fuzzyDateToDayjs(endFuzzy, false);    // 最晚可能时间

console.log(endDayjs.diff(startDayjs, 'month')); // 显示月份差异
console.log(endDayjs.diff(startDayjs, 'day'));   // 显示天数差异
```

### 与 Moment.js 一起使用

```typescript
import moment from 'moment';

// 从 FuzzyDate 转换为 Moment
function fuzzyDateToMoment(fuzzyDate: FuzzyDate, useEarliest: boolean = true): moment.Moment {
  const options = useEarliest 
    ? fuzzyDate.getEarliestPaddingOptions() 
    : fuzzyDate.getLatestPaddingOptions();
    
  return moment({
    year: options.year,
    month: options.month - 1,  // Moment 月份从 0 开始
    date: options.day,
    hour: options.hour,
    minute: options.minute,
    second: options.second,
    millisecond: options.millisecond
  });
}

// 从 Moment 转换为 FuzzyDate
function momentToFuzzyDate(
  date: moment.Moment, 
  precision: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
): FuzzyDate {
  const options: any = { year: date.year() };
  
  if (precision === 'year') return new FuzzyDate(options);
  
  options.month = date.month() + 1; // Moment 月份是从 0 开始的
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

// 使用示例
const now = moment();
const fuzzyMonth = momentToFuzzyDate(now, 'month');
console.log(fuzzyMonth.month); // 当前月份

// 计算日期范围
const event = new FuzzyDate({ year: 2023, month: 3 }); // 2023年3月
const earliestMoment = fuzzyDateToMoment(event, true);
const latestMoment = fuzzyDateToMoment(event, false);

console.log(earliestMoment.format('YYYY-MM-DD HH:mm:ss')); // 2023-03-01 00:00:00
console.log(latestMoment.format('YYYY-MM-DD HH:mm:ss'));   // 2023-03-31 23:59:59

// 检查某个确切日期是否在模糊日期范围内
const testDate = moment('2023-03-15');
const isInRange = testDate.isBetween(earliestMoment, latestMoment, null, '[]');
console.log(isInRange ? '日期在范围内' : '日期不在范围内'); // 日期在范围内
```

## 错误处理

`fuzzy-date-ts`为验证问题提供特定的错误类型：

```typescript
import { FuzzyDateHierarchyError, FuzzyDateCalendarError } from 'fuzzy-date-ts';

try {
  const invalidDate = new FuzzyDate({ year: 2023, month: 13 });
} catch (error) {
  if (error instanceof FuzzyDateCalendarError) {
    console.log('无效的日历日期');
  } else if (error instanceof FuzzyDateHierarchyError) {
    console.log('无效的字段层次结构');
  } else {
    console.log('其他错误:', error);
  }
}
```

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。