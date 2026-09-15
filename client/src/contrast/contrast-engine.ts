export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export const TEXT_MINIMUM_RATIO = 4.5;
export const NON_TEXT_MINIMUM_RATIO = 3.0;
export const HIGH_CONTRAST_TEXT_TARGET_RATIO = 7.0;

export function tryParseOpaqueHex(value: string | null | undefined): RgbColor | null {
  if (!value) return null;
  let hex = value.trim();
  if (hex.startsWith('#')) hex = hex.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (hex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function srgbChannelToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(color: RgbColor): number {
  const r = srgbChannelToLinear(color.r / 255);
  const g = srgbChannelToLinear(color.g / 255);
  const b = srgbChannelToLinear(color.b / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: RgbColor, b: RgbColor): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastRatioHex(a: string, b: string): number {
  const ca = tryParseOpaqueHex(a);
  const cb = tryParseOpaqueHex(b);
  if (!ca || !cb) throw new Error('Both colors must be opaque hex values.');
  return contrastRatio(ca, cb);
}

export function autoForeground(backgroundHex: string): string {
  const background = tryParseOpaqueHex(backgroundHex);
  if (!background) throw new Error('Background must be opaque hex.');
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  return contrastRatio(white, background) >= contrastRatio(black, background) ? '#ffffff' : '#000000';
}

export function toHex(color: RgbColor): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(color.r)}${h(color.g)}${h(color.b)}`;
}
