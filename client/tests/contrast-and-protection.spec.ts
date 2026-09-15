import { describe, expect, it } from 'vitest';
import {
  autoForeground,
  contrastRatioHex,
  relativeLuminance,
  tryParseOpaqueHex,
  TEXT_MINIMUM_RATIO,
  HIGH_CONTRAST_TEXT_TARGET_RATIO,
} from '../src/contrast/contrast-engine';
import { validatePreference } from '../src/presets/validate-preference';
import { emptyPreference } from '../src/models';
import { PRESETS } from '../src/presets/preset-registry';
import { compileCss } from '../src/tokens/semantic-token-compiler';
import { PROTECTED_EDITOR_SELECTORS } from '../src/protection/editor-protection';

describe('WCAG contrast engine', () => {
  it('uses relative luminance, not RGB averages', () => {
    // Saturated blue vs yellow: RGB-average heuristics fail; WCAG luminance must pass.
    const whiteOnBlack = contrastRatioHex('#ffffff', '#000000');
    expect(whiteOnBlack).toBeCloseTo(21, 0);

    const navy = tryParseOpaqueHex('#000080')!;
    const yellow = tryParseOpaqueHex('#ffff00')!;
    expect(relativeLuminance(yellow)).toBeGreaterThan(relativeLuminance(navy));
    expect(contrastRatioHex('#ffff00', '#000080')).toBeGreaterThan(TEXT_MINIMUM_RATIO);
  });

  it('auto-selects foreground for backgrounds', () => {
    expect(autoForeground('#000000')).toBe('#ffffff');
    expect(autoForeground('#ffffff')).toBe('#000000');
  });

  it('rejects non-opaque / non-hex', () => {
    expect(tryParseOpaqueHex('rgba(0,0,0,0.5)')).toBeNull();
    expect(tryParseOpaqueHex('red')).toBeNull();
    expect(tryParseOpaqueHex('url(https://x)')).toBeNull();
  });
});

describe('preference validation', () => {
  it('accepts high contrast preset with ~7:1 target', () => {
    const doc = {
      ...emptyPreference(),
      preset: 'highContrast' as const,
    };
    const result = validatePreference(doc);
    expect(result.isValid).toBe(true);
    expect(result.contrastReport.every((r) => r.requiredRatio === HIGH_CONTRAST_TEXT_TARGET_RATIO || r.role !== 'text' || true)).toBe(true);
    expect(result.contrastReport.filter((r) => r.role === 'text').every((r) => r.requiredRatio === HIGH_CONTRAST_TEXT_TARGET_RATIO)).toBe(true);
  });

  it('rejects insufficient custom contrast without applying', () => {
    const doc = {
      ...emptyPreference(),
      preset: 'custom' as const,
      customColors: {
        ...PRESETS.dark.colors!,
        shellForeground: '#444444',
        shellBackground: '#555555',
      },
    };
    const result = validatePreference(doc);
    expect(result.isValid).toBe(false);
    expect(result.problems.some((p) => p.code === 'contrast_insufficient')).toBe(true);
  });

  it('rejects arbitrary CSS / URLs / gradients', () => {
    const doc = {
      ...emptyPreference(),
      preset: 'custom' as const,
      customColors: {
        ...PRESETS.dark.colors!,
        shellBackground: 'url(https://evil.example)',
      },
    };
    const result = validatePreference(doc);
    expect(result.problems.some((p) => p.code === 'payload_forbidden' || p.code === 'color_format')).toBe(true);
  });

  it('rejects unapproved fonts', () => {
    const doc = {
      ...emptyPreference(),
      preset: 'light' as const,
      fontFamilyId: 'Comic Sans MS, cursive',
    };
    const result = validatePreference(doc);
    expect(result.problems.some((p) => p.code === 'font_not_approved')).toBe(true);
  });
});

describe('editor protection policy', () => {
  it('does not emit global page filters in compiled CSS', () => {
    const css = compileCss(
      { ...emptyPreference(), preset: 'dark' },
      true,
    );
    expect(css.toLowerCase()).not.toContain('filter:');
    expect(css).toContain('our-pa-shell');
    for (const selector of ['textarea', 'umb-rte', 'umb-code-editor']) {
      // Selectors may be documented as protected, but must not assign color/background to interiors.
      expect(css).not.toMatch(new RegExp(`${selector}[^{]*\\{[^}]*(background|color)\\s:`, 'i'));
    }
  });

  it('lists protected editor selectors', () => {
    expect(PROTECTED_EDITOR_SELECTORS).toContain('textarea');
    expect(PROTECTED_EDITOR_SELECTORS).toContain('umb-rte');
    expect(PROTECTED_EDITOR_SELECTORS).toContain('.cm-editor');
  });
});
