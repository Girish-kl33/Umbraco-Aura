import type { AppearancePreferenceDocument } from '../models';
import { resolveFontStack } from '../presets/font-catalog';
import { DEFAULT_FONT_SIZE_ID, resolveFontSize } from '../presets/font-size';
import { PRESETS, resolvePreferenceColors } from '../presets/preset-registry';
import { NATIVE_EDITOR_TOKENS, buildUuiTokens } from './uui-token-map';
import { HIGH_CONTRAST_TEXT_TARGET_RATIO } from '../contrast/contrast-engine';

export const STYLE_ELEMENT_ID = 'our-pa-appearance-tokens';
export const FONT_SIZE_STYLE_ID = 'our-pa-font-size';
export const ROOT_ATTRIBUTE = 'data-our-pa-appearance';
export const FONT_SIZE_ATTRIBUTE = 'data-our-pa-font-size';

export function compileTokens(
  preference: AppearancePreferenceDocument,
  prefersDark: boolean,
): Record<string, string> {
  if (preference.preset === 'none') return {};

  const colors = resolvePreferenceColors(preference, prefersDark);

  return {
    '--our-pa-shell-bg': colors.shellBackground,
    '--our-pa-shell-fg': colors.shellForeground,
    '--our-pa-surface-bg': colors.surfaceBackground,
    '--our-pa-surface-fg': colors.surfaceForeground,
    '--our-pa-accent-bg': colors.accentBackground,
    '--our-pa-accent-fg': colors.accentForeground,
    '--our-pa-link': colors.link,
    '--our-pa-border': colors.border,
    '--our-pa-focus-ring': colors.focusRing,
    '--our-pa-selected-bg': colors.selectedBackground,
    '--our-pa-selected-fg': colors.selectedForeground,
    '--our-pa-hover-bg': colors.hoverBackground,
    '--our-pa-active-bg': colors.activeBackground,
    '--our-pa-status-danger-bg': '#c60239',
    '--our-pa-status-danger-fg': '#ffffff',
    '--our-pa-status-warning-bg': '#ffd621',
    '--our-pa-status-warning-fg': '#000000',
    '--our-pa-status-positive-bg': '#0d8844',
    '--our-pa-status-positive-fg': '#ffffff',
    '--our-pa-color-background': colors.shellBackground,
    '--our-pa-color-surface': colors.surfaceBackground,
    '--our-pa-color-text': colors.surfaceForeground,
    '--our-pa-color-link': colors.link,
    '--our-pa-color-button-background': colors.accentBackground,
    '--our-pa-color-button-text': colors.accentForeground,
    '--our-pa-color-border': colors.border,
    '--our-pa-color-focus': colors.focusRing,
    '--our-pa-color-status-danger-background': '#c60239',
    '--our-pa-color-status-danger-text': '#ffffff',
    '--our-pa-color-status-warning-background': '#ffd621',
    '--our-pa-color-status-warning-text': '#000000',
    '--our-pa-color-status-positive-background': '#0d8844',
    '--our-pa-color-status-positive-text': '#ffffff',
    '--our-pa-font-family': resolveFontStack(preference.fontFamilyId),
    '--our-pa-motion': preference.accessibility.reducedMotion ? '0.01ms' : 'initial',
    '--our-pa-focus-width': preference.accessibility.enhancedFocus ? '3px' : '2px',
  };
}

export function compileCss(preference: AppearancePreferenceDocument, prefersDark: boolean): string {
  const tokens = compileTokens(preference, prefersDark);
  if (Object.keys(tokens).length === 0) return '';

  const declarations = Object.entries(tokens)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  return `
:root[${ROOT_ATTRIBUTE}="on"] {
${declarations}
}

:root[${ROOT_ATTRIBUTE}="on"] .our-pa-shell-surface {
  background-color: var(--our-pa-shell-bg) !important;
  color: var(--our-pa-shell-fg) !important;
  border-color: var(--our-pa-border);
  font-family: var(--our-pa-font-family);
}

:root[${ROOT_ATTRIBUTE}="on"] .our-pa-shell-label {
  color: var(--our-pa-shell-fg);
}

:root[${ROOT_ATTRIBUTE}="on"] .our-pa-shell-surface a {
  color: var(--our-pa-link);
}

:root[${ROOT_ATTRIBUTE}="on"] .our-pa-shell-surface [aria-selected="true"],
:root[${ROOT_ATTRIBUTE}="on"] .our-pa-shell-surface .our-pa-selected {
  background-color: var(--our-pa-selected-bg);
  color: var(--our-pa-selected-fg);
}

:root[${ROOT_ATTRIBUTE}="on"][data-our-pa-enhanced-focus="on"] .our-pa-shell-surface :focus-visible,
:root[${ROOT_ATTRIBUTE}="on"][data-our-pa-enhanced-focus="on"] .our-pa-recovery :focus-visible {
  outline: var(--our-pa-focus-width) solid var(--our-pa-focus-ring) !important;
  outline-offset: 2px;
}

:root[${ROOT_ATTRIBUTE}="on"][data-our-pa-reduced-motion="on"] *,
:root[${ROOT_ATTRIBUTE}="on"][data-our-pa-reduced-motion="on"] *::before,
:root[${ROOT_ATTRIBUTE}="on"][data-our-pa-reduced-motion="on"] *::after {
  animation-duration: var(--our-pa-motion) !important;
  transition-duration: var(--our-pa-motion) !important;
  scroll-behavior: auto !important;
}
`.trim();
}

/**
 * Elements whose interiors must keep native presentation: textbox interiors and entered text,
 * rich-text content and toolbar, and code-editor surfaces. Re-declaring the tokens on the host
 * lets them inherit into the shadow root without selecting or rewriting anything inside it.
 */
const PROTECTED_EDITOR_HOSTS = [
  'uui-input',
  'uui-input-password',
  'uui-input-file',
  'uui-input-lock',
  'uui-textarea',
  'umb-input-tiptap',
  'umb-property-editor-ui-tiptap',
  'umb-code-block',
  'umb-code-editor',
  'umb-code-editor-modal',
];

/**
 * CSS payload for Umbraco's public `theme` extension loader.
 *
 * Umbraco owns insertion/removal of this stylesheet when the native dropdown changes, and it
 * only honours `--uui-color-*` on `:root` — element rules from a theme stylesheet cannot reach
 * shell chrome because that chrome lives inside shadow roots.
 */
export function compileNativeThemeCss(
  preference: AppearancePreferenceDocument,
  prefersDark: boolean,
): string {
  if (preference.preset === 'none') return '';

  const colors = resolvePreferenceColors(preference, prefersDark);

  const definition = PRESETS[preference.preset];
  const textRatio = preference.accessibility.highContrast
    ? HIGH_CONTRAST_TEXT_TARGET_RATIO
    : definition.textRatio;
  const uuiTokens = buildUuiTokens({
    colors,
    textRatio,
    keepNativeStatusColors: definition.keepNativeStatusColors,
    fontStack: resolveFontStack(preference.fontFamilyId),
  });
  const tokens = {
    ...uuiTokens,
    ...buildReusableSemanticTokens(colors, uuiTokens),
  };

  const blocks = [`:root {\n${declarationsOf(tokens)}\n}`];

  blocks.push(
    `${PROTECTED_EDITOR_HOSTS.join(',\n')} {\n${declarationsOf(NATIVE_EDITOR_TOKENS)}\n}`,
  );

  if (preference.accessibility.enhancedFocus) {
    blocks.push(`:root {\n  --uui-focus-outline-width: 3px;\n}`);
  }

  const highContrastChrome =
    preference.preset === 'highContrast' || preference.accessibility.highContrast;
  if (highContrastChrome) {
    // The dark-theme logo file follows the page color-scheme. Keep it on the light
    // scheme so the mark stays the light-on-dark artwork instead of a black glyph.
    // Off-white rules under the app header and section tabs, so the top chrome
    // does not melt into the workspace.
    blocks.push(`:root {
  color-scheme: light;
}

/* App header lives in a shadow tree, so host borders never match.
   One hairline under the 60px header. Do not draw a second full-width
   line — it cuts through the section tree. */
umb-app {
  position: relative;
}

umb-app::after {
  content: '';
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  height: 2px;
  z-index: 20;
  background: var(--uui-color-border);
}`);
  }

  if (preference.accessibility.reducedMotion) {
    blocks.push(
      `:root {\n  --uui-transition-duration: 0.01ms;\n  --uui-animation-duration: 0.01ms;\n  scroll-behavior: auto;\n}`,
    );
  }

  return blocks.join('\n\n');
}

function declarationsOf(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
}

function buildReusableSemanticTokens(
  colors: ReturnType<typeof resolvePreferenceColors>,
  uui: Record<string, string>,
): Record<string, string> {
  return {
    '--our-pa-color-background': uui['--uui-color-background'] ?? colors.shellBackground,
    '--our-pa-color-surface': colors.surfaceBackground,
    '--our-pa-color-text': colors.surfaceForeground,
    '--our-pa-color-text-muted': uui['--uui-color-text-alt'] ?? colors.surfaceForeground,
    '--our-pa-color-link': colors.link,
    '--our-pa-color-button-background': colors.accentBackground,
    '--our-pa-color-button-text': colors.accentForeground,
    '--our-pa-color-border': colors.border,
    '--our-pa-color-focus': colors.focusRing,
    '--our-pa-color-selected-background': colors.selectedBackground,
    '--our-pa-color-selected-text': colors.selectedForeground,
    '--our-pa-color-hover': colors.hoverBackground,
    '--our-pa-color-active': colors.activeBackground,
    '--our-pa-color-status-danger-background': uui['--uui-color-danger'] ?? '#c60239',
    '--our-pa-color-status-danger-text': uui['--uui-color-danger-contrast'] ?? '#ffffff',
    '--our-pa-color-status-warning-background': uui['--uui-color-warning'] ?? '#ffd621',
    '--our-pa-color-status-warning-text': uui['--uui-color-warning-contrast'] ?? '#000000',
    '--our-pa-color-status-positive-background': uui['--uui-color-positive'] ?? '#0d8844',
    '--our-pa-color-status-positive-text': uui['--uui-color-positive-contrast'] ?? '#ffffff',
  };
}

/**
 * Type-size overlay. Independent of the colour theme so it still applies when the user
 * is on Umbraco's own Light/Dark entries.
 *
 * Tokens inherit into shadow roots for components that read them. Hosts that hardcode
 * 14px are covered by `applyFontSizeOverlay`. Do not use `zoom` — it clips header apps.
 */
export function compileFontSizeCss(fontSizeId: unknown): string {
  const option = resolveFontSize(fontSizeId);
  if (option.id === DEFAULT_FONT_SIZE_ID) return '';

  return `:root {
  --our-pa-type-size: ${option.defaultSizePx}px;
  --uui-type-default-size: ${option.defaultSizePx}px;
  --uui-type-small-size: ${option.smallSizePx}px;
  --uui-type-h5-size: ${option.defaultSizePx}px;
  --uui-type-h6-size: ${option.smallSizePx}px;
  --uui-button-font-size: ${option.defaultSizePx}px;
}

html,
body,
umb-app {
  font-size: ${option.defaultSizePx}px;
  line-height: 1.45;
}`.trim();
}
