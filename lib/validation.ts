import type { Category, Item } from './types';

function isValidItem(v: unknown): v is Item {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.label === 'string' &&
    typeof obj.checked === 'boolean' &&
    (obj.note === undefined || typeof obj.note === 'string') &&
    (obj.tag === undefined || obj.tag === 'must' || obj.tag === 'opt') &&
    (obj.quantity === undefined ||
      (typeof obj.quantity === 'number' &&
        Number.isInteger(obj.quantity) &&
        obj.quantity >= 1))
  );
}

export function isValidCategories(data: unknown): data is Category[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (c) =>
      typeof c === 'object' &&
      c !== null &&
      typeof (c as Record<string, unknown>).id === 'string' &&
      typeof (c as Record<string, unknown>).name === 'string' &&
      Array.isArray((c as Record<string, unknown>).items) &&
      ((c as Record<string, unknown>).items as unknown[]).every(isValidItem) &&
      ((c as Record<string, unknown>).icon === undefined ||
        typeof (c as Record<string, unknown>).icon === 'string')
  );
}

export function isValidCollapseState(
  data: unknown
): data is Record<string, boolean> {
  if (typeof data !== 'object' || data === null || Array.isArray(data))
    return false;
  return Object.entries(data as Record<string, unknown>).every(
    ([key, val]) => typeof key === 'string' && typeof val === 'boolean'
  );
}

export function isValidNotifiedDates(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((v) => typeof v === 'string');
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00');
  return !isNaN(date.getTime());
}
