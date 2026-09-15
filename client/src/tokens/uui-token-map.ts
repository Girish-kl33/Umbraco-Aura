import type { CustomAppearanceColors } from '../models';
import {
  HIGH_CONTRAST_TEXT_TARGET_RATIO,
  NON_TEXT_MINIMUM_RATIO,
  TEXT_MINIMUM_RATIO,
  contrastRatio,
  relativeLuminance,
  toHex,
  tryParseOpaqueHex,
} from '../contrast/contrast-engine';

/**
 * Umbraco recolours the backoffice exclusively through `--uui-color-*` custom properties
 * declared on `:root` (see `dark.theme.css` / `high-contrast.theme.css` in Umbraco.Cms.StaticAssets).
 * Custom properties inherit across shadow boundaries, so this is the only supported way to
 * reach shell chrome without selecting anything inside a component's shadow root.
 */

/**
 * Umbraco's own light-theme values for the tokens that reach editor interiors.
 *
 * `--uui-color-scheme` matters as much as the colours: `uui-input` declares
 * `color-scheme: var(--uui-color-scheme, normal)`, so leaving it on `dark` hands placeholder
 * and caret rendering to the browser's dark defaults. Those land around #6d6d6d, which
 * measured 4.06:1 on a dark surface and is not something CSS can correct. Pinning it back to
 * `normal` keeps placeholders and the caret exactly as Umbraco ships them.
 */
export const NATIVE_EDITOR_TOKENS: Record<string, string> = {
  '--uui-color-scheme': 'normal',
  '--uui-color-surface': '#ffffff',
  '--uui-color-surface-alt': '#ffffff',
  '--uui-color-surface-emphasis': '#dadada',
  '--uui-color-text': '#060606',
  '--uui-color-text-alt': '#2e2b29',
};

/**
 * Status hues stay on Umbraco's native values so "danger" and "positive" never change meaning.
 * Only their luminance is adjusted, and only when a themed surface would drop them below 4.5:1.
 */
const NATIVE_STATUS_HUES = {
  danger: '#c60239',
  warning: '#ffd621',
  positive: '#0d8844',
} as const;

/**
 * Interpolating the native hues toward white to reach 7:1 desaturates them badly — the red
 * arrives as pink and the green as sage. High-contrast themes use these purpose-picked hues
 * instead: each clears 7:1 against black while staying unmistakably red, yellow and green.
 */
const HIGH_CONTRAST_STATUS_HUES = {
  danger: '#ff6b6b',
  warning: '#ffd621',
  positive: '#3ddc84',
} as const;

type StatusRole = keyof typeof NATIVE_STATUS_HUES;

export interface UuiThemeInput {
  colors: CustomAppearanceColors;
  /** 4.5 normally, 7 for High Contrast. */
  textRatio: number;
  /** Skip status-colour overrides entirely, keeping Umbraco's native hues (monochrome themes). */
  keepNativeStatusColors?: boolean;
  fontStack?: string;
}

export function buildUuiTokens(input: UuiThemeInput): Record<string, string> {
  const { colors, textRatio } = input;
  const surface = colors.surfaceBackground;
  const dark = isDark(surface);

  const tokens: Record<string, string> = {
    // App canvas sits a few percent off the panel surface so panels stay readable as panels.
    '--uui-color-background': mix(surface, colors.shellBackground, 0.06),
    '--uui-color-surface': surface,
    '--uui-color-surface-alt': surface,
    '--uui-color-surface-emphasis': colors.hoverBackground,
    '--uui-color-text': colors.surfaceForeground,
    // Secondary text is normally softened toward the surface, but a 7:1 theme has no room for
    // that: Umbraco also dims muted text with its own opacity, and the two reductions compound
    // into a measured 6.92:1. High-contrast themes therefore keep secondary text at full strength.
    '--uui-color-text-alt':
      textRatio >= HIGH_CONTRAST_TEXT_TARGET_RATIO
        ? colors.surfaceForeground
        : ensureRatio(mix(colors.surfaceForeground, surface, 0.18), surface, textRatio),

    '--uui-color-header-surface': colors.shellBackground,
    '--uui-color-header-contrast': colors.shellForeground,
    '--uui-color-header-contrast-emphasis': colors.shellForeground,

    '--uui-color-interactive': ensureRatio(colors.link, surface, textRatio),
    '--uui-color-interactive-emphasis': ensureRatio(colors.accentBackground, surface, textRatio),

    '--uui-color-default': colors.accentBackground,
    '--uui-color-default-emphasis': shade(colors.accentBackground, dark ? 0.12 : -0.12),
    '--uui-color-default-standalone': ensureRatio(colors.accentBackground, surface, textRatio),
    '--uui-color-default-contrast': colors.accentForeground,

    '--uui-color-selected': colors.selectedBackground,
    '--uui-color-selected-emphasis': shade(colors.selectedBackground, dark ? 0.12 : -0.08),
    '--uui-color-selected-standalone': ensureRatio(
      colors.selectedBackground,
      surface,
      NON_TEXT_MINIMUM_RATIO,
    ),
    '--uui-color-selected-contrast': colors.selectedForeground,

    // Umbraco uses "current" for the active tree/nav item; mirror "selected" so they agree.
    '--uui-color-current': colors.selectedBackground,
    '--uui-color-current-emphasis': shade(colors.selectedBackground, dark ? 0.12 : -0.08),
    '--uui-color-current-standalone': ensureRatio(
      colors.selectedBackground,
      surface,
      NON_TEXT_MINIMUM_RATIO,
    ),
    '--uui-color-current-contrast': colors.selectedForeground,

    '--uui-color-focus': colors.focusRing,

    // Borders and dividers are non-text indicators: 3:1 is the floor that applies.
    '--uui-color-border': colors.border,
    '--uui-color-border-standalone': ensureRatio(colors.border, surface, NON_TEXT_MINIMUM_RATIO),
    '--uui-color-border-emphasis': ensureRatio(colors.border, surface, NON_TEXT_MINIMUM_RATIO + 1),
    '--uui-color-divider': mix(colors.border, surface, 0.5),
    '--uui-color-divider-standalone': colors.border,
    '--uui-color-divider-emphasis': ensureRatio(colors.border, surface, NON_TEXT_MINIMUM_RATIO),

    '--uui-color-disabled': colors.activeBackground,
    '--uui-color-disabled-standalone': mix(colors.activeBackground, colors.border, 0.4),
    // Umbraco reuses this for muted labels and aliases, not only for disabled controls, so it
    // is held to the text floor rather than the 3:1 non-text floor.
    '--uui-color-disabled-contrast': ensureRatio(
      mix(colors.surfaceForeground, surface, 0.45),
      colors.activeBackground,
      Math.max(textRatio, TEXT_MINIMUM_RATIO),
    ),

    '--uui-color-scheme': dark ? 'dark' : 'light',
  };

  // High Contrast uses yellow fills with black labels. Header apps are `look="primary"` with a
  // transparent fill, so they inherit that black as icon/logo colour onto the black bar.
  // Keep yellow as the standalone/focus accent; paint default chrome with shell contrast so
  // header marks and section icons stay visible. Custom properties inherit into shadow roots.
  if (textRatio >= HIGH_CONTRAST_TEXT_TARGET_RATIO && isDark(colors.shellBackground)) {
    tokens['--uui-color-default'] = colors.shellBackground;
    tokens['--uui-color-default-emphasis'] = colors.hoverBackground;
    tokens['--uui-color-default-contrast'] = colors.shellForeground;
    tokens['--uui-color-default-standalone'] = colors.accentBackground;

    // One flat black makes header, sidebar, workspace and dialogs indistinguishable.
    // Lift the canvas, keep chrome darker, and use dark-white (#c8c8c8) edges so
    // regions stay visible without bright wireframe boxes.
    const offWhite = colors.border;
    const canvas = mix(colors.surfaceBackground, '#ffffff', 0.1);
    tokens['--uui-color-background'] = canvas;
    tokens['--uui-color-header-background'] = colors.shellBackground;
    tokens['--uui-color-divider'] = offWhite;
    tokens['--uui-color-divider-standalone'] = offWhite;
    tokens['--uui-color-divider-emphasis'] = offWhite;
    tokens['--uui-tab-divider'] = offWhite;
    tokens['--uui-box-border-width'] = '1px';
    tokens['--uui-box-border-color'] = offWhite;
    tokens['--uui-box-box-shadow'] = 'none';
    const edge = `0 1px 0 ${offWhite}`;
    tokens['--uui-shadow-depth-1'] = edge;
    tokens['--uui-shadow-depth-2'] = edge;
    tokens['--uui-shadow-depth-3'] = `0 2px 0 ${offWhite}`;
    tokens['--uui-shadow-depth-4'] = `-1px 0 0 ${offWhite}`;
    tokens['--uui-shadow-depth-5'] = `-2px 0 0 0 ${offWhite}`;
    tokens['--uui-modal-color-backdrop'] = 'rgba(255, 255, 255, 0.18)';
  }

  if (!input.keepNativeStatusColors) {
    const highContrast = textRatio >= HIGH_CONTRAST_TEXT_TARGET_RATIO;

    for (const role of Object.keys(NATIVE_STATUS_HUES) as StatusRole[]) {
      const source = highContrast ? HIGH_CONTRAST_STATUS_HUES[role] : NATIVE_STATUS_HUES[role];

      // The base token is a fill (badge/button background), so it normally keeps its hue as-is —
      // darkening it to hit a text ratio would turn "warning" from yellow into olive, and
      // readability of the label on top is handled by `-contrast`.
      //
      // High-contrast themes are the exception. Umbraco's native `positive` green measured
      // 5.16:1 against pure black, leaving the Submit button as a dark block with dark text, so
      // there the fill itself is held to the theme's target.
      const fill = highContrast ? ensureRatio(source, surface, textRatio) : source;

      tokens[`--uui-color-${role}`] = fill;
      tokens[`--uui-color-${role}-emphasis`] = shade(fill, dark ? 0.1 : -0.1);
      tokens[`--uui-color-${role}-contrast`] = autoContrastOn(fill);
      // `-standalone` is the variant Umbraco paints directly onto a surface as text or an
      // icon, so this is the one that has to clear the text ratio against that surface.
      tokens[`--uui-color-${role}-standalone`] = ensureRatio(source, surface, textRatio);
    }
  }

  // 'inherit' is the catalogue's "native font" entry; emitting it as a token would be a no-op.
  if (input.fontStack && input.fontStack !== 'inherit') {
    tokens['--uui-font-family'] = input.fontStack;
  }

  return tokens;
}

/**
 * Raises `colorHex` towards white (on dark backgrounds) or black (on light backgrounds)
 * until it clears `target` against `backgroundHex`. Hue is preserved well enough that
 * status colours stay recognisable.
 */
export function ensureRatio(colorHex: string, backgroundHex: string, target: number): string {
  const color = tryParseOpaqueHex(colorHex);
  const background = tryParseOpaqueHex(backgroundHex);
  if (!color || !background) return colorHex;
  if (contrastRatio(color, background) >= target) return colorHex;

  const endpoint = relativeLuminance(background) < 0.5 ? 255 : 0;
  let candidate = color;
  for (let step = 1; step <= 100; step++) {
    const t = step / 100;
    candidate = {
      r: Math.round(color.r + (endpoint - color.r) * t),
      g: Math.round(color.g + (endpoint - color.g) * t),
      b: Math.round(color.b + (endpoint - color.b) * t),
    };
    if (contrastRatio(candidate, background) >= target) break;
  }
  return toHex(candidate);
}

export function isDark(hex: string): boolean {
  const rgb = tryParseOpaqueHex(hex);
  return rgb ? relativeLuminance(rgb) < 0.5 : false;
}

/** Linear blend of two opaque hex colours; `amount` is how much of `b` to fold into `a`. */
export function mix(aHex: string, bHex: string, amount: number): string {
  const a = tryParseOpaqueHex(aHex);
  const b = tryParseOpaqueHex(bHex);
  if (!a || !b) return aHex;
  return toHex({
    r: Math.round(a.r + (b.r - a.r) * amount),
    g: Math.round(a.g + (b.g - a.g) * amount),
    b: Math.round(a.b + (b.b - a.b) * amount),
  });
}

/** Positive `amount` lightens towards white, negative darkens towards black. */
function shade(hex: string, amount: number): string {
  return mix(hex, amount >= 0 ? '#ffffff' : '#000000', Math.abs(amount));
}

function autoContrastOn(hex: string): string {
  const rgb = tryParseOpaqueHex(hex);
  if (!rgb) return '#ffffff';
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  return contrastRatio(white, rgb) >= contrastRatio(black, rgb) ? '#ffffff' : '#000000';
}
