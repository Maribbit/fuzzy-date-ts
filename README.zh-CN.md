# fuzzy-date-ts

一个用于处理模糊日期的 TypeScript 库，支持从年级精度到毫秒级精度。

[![npm version](https://img.shields.io/npm/v/fuzzy-date-ts.svg)](https://www.npmjs.com/package/fuzzy-date-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/maribbit/fuzzy-date-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/maribbit/fuzzy-date-ts)

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

例如，"2023年3月"代表从当月1日 00:00:00.000 到31日 23:59:59.999 的整个月份。

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

`fuzzy-date-ts` 设计为可与任何日期库或原生 JavaScript 日期良好协作。该库提供了与以下库的集成示例：

- 原生 JavaScript Date
- Luxon
- Day.js
- Moment.js

有关详细的集成示例和转换工具，请参阅[兼容性测试](tests/fuzzyDate/compatibility.test.ts)。

## 序列化格式

`FuzzyDate` 使用自定义的 Fuzzy Date String 格式进行序列化。该格式设计为：
- 人类可读
- 可排序
- 足够灵活以表示不同的精度级别

该格式支持以下精度级别：
- 年： "2023"
- 年月： "2023-05"
- 年月日： "2023-05-15"
- 年月日 时： "2023-05-15T10"
- 年月日 时:分： "2023-05-15T10:30"
- 年月日 时:分:秒： "2023-05-15T10:30:45"
- 年月日 时:分:秒.毫秒： "2023-05-15T10:30:45.500"

边界值:
- 最早："-100000-01-01T00:00:00.000"
- 最晚："99999-12-31T23:59:59.999"

### 序列化示例

```typescript
// 将 FuzzyDate 转换为字符串
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

// 解析字符串为 FuzzyDate
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