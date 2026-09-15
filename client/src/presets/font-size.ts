import type { AppearanceFontSizeId } from '../models';

export type { AppearanceFontSizeId };

export interface FontSizeOption {
  id: AppearanceFontSizeId;
  displayName: string;
  /** Umbraco's default type size is 14px; each step is one line of body text. */
  defaultSizePx: number;
  smallSizePx: number;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'low', displayName: 'Low', defaultSizePx: 12, smallSizePx: 11 },
  { id: 'normal', displayName: 'Normal', defaultSizePx: 14, smallSizePx: 12 },
  { id: 'large', displayName: 'Large', defaultSizePx: 18, smallSizePx: 15 },
];

export const DEFAULT_FONT_SIZE_ID: AppearanceFontSizeId = 'normal';

/** Accepts client ids, PascalCase enum names, and numeric CLR enum values. */
export function coerceFontSizeId(value: unknown): AppearanceFontSizeId {
  if (value == null || value === '') return DEFAULT_FONT_SIZE_ID;
  const key = String(value).trim().toLowerCase();
  if (key === 'low' || key === '1') return 'low';
  if (key === 'large' || key === '2') return 'large';
  if (key === 'normal' || key === '0') return 'normal';
  return DEFAULT_FONT_SIZE_ID;
}

export function isFontSizeId(value: unknown): value is AppearanceFontSizeId {
  if (value == null || value === '') return false;
  const key = String(value).trim().toLowerCase();
  return key === 'low' || key === 'normal' || key === 'large' || key === '0' || key === '1' || key === '2';
}

export function resolveFontSize(id: unknown): FontSizeOption {
  const resolved = coerceFontSizeId(id);
  return FONT_SIZE_OPTIONS.find((option) => option.id === resolved) ?? FONT_SIZE_OPTIONS[1];
}
