export function isEmpty(value: unknown): value is undefined {
  return value === undefined || value === null || Number.isNaN(value);
}