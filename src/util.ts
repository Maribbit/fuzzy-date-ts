// src/util.ts
export function isEmpty(value: unknown): boolean {
    return value === undefined || value === null || Number.isNaN(value);
  }