import { describe, expect, it } from 'vitest';
import {
  NON_TEXT_MINIMUM_RATIO,
  contrastRatioHex,
} from '../src/contrast/contrast-engine';
import {
  AUDIENCE_PRESETS,
  PRESETS,
  resolvePreferenceColors,
} from '../src/presets/preset-registry';
import { emptyPreference } from '../src/models';
import type { AppearancePresetId } from '../src/models';
import { compileFontSizeCss, compileNativeThemeCss } from '../src/tokens/semantic-token-compiler';
import { buildUuiTokens, isDark } from '../src/tokens/uui-token-map';
import { DROPDOWN_THEME_NAMES, themeManifests } from '../src/themes/theme-manifests';

const THEMED_PRESETS = Object.values(PRESETS).filter((preset) => preset.colors);

/** Pairs that carry interface text, so the preset's text ratio applies. */
const textPairs = (colors: NonNullable<(typeof THEMED_PRESETS)[number]['colors']>) => [
  ['Shell text on chrome', colors.shellForeground, colors.shellBackground],
  ['Panel text on surface', colors.surfaceForeground, colors.surfaceBackground],
  ['Accent button label', colors.accentForeground, colors.accentBackground],
  ['Selected item label', colors.selectedForeground, colors.selectedBackground],
  ['Link on surface', colors.link, colors.surfaceBackground],
];

describe('preset palettes meet WCAG targets', () => {
  for (const preset of THEMED_PRESETS) {
    const colors = preset.colors!;

    it(`${preset.displayName}: interface text clears ${preset.textRatio}:1`, () => {
      for (const [label, fg, bg] of textPairs(colors)) {
        const ratio = contrastRatioHex(fg, bg);
        expect(
          ratio,
          `${preset.displayName} / ${label} (${fg} on ${bg}) = ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(preset.textRatio);
      }
    });

    it(`${preset.displayName}: borders clear ${NON_TEXT_MINIMUM_RATIO}:1 as non-text indicators`, () => {
      const ratio = contrastRatioHex(colors.border, colors.surfaceBackground);
      expect(ratio, `border ${colors.border} on ${colors.surfaceBackground}`).toBeGreaterThanOrEqual(
        NON_TEXT_MINIMUM_RATIO,
      );
    });

    it(`${preset.displayName}: hover and active stay on the surface side of the text`, () => {
      // Hover/active must not invert polarity, otherwise text on them becomes unreadable.
      expect(isDark(colors.hoverBackground)).toBe(isDark(colors.surfaceBackground));
      expect(isDark(colors.activeBackground)).toBe(isDark(colors.surfaceBackground));
    });
  }
});

describe('derived --uui-color-* tokens stay readable', () => {
  for (const preset of THEMED_PRESETS) {
    it(`${preset.displayName}: derived text and status tokens clear their targets`, () => {
      const tokens = buildUuiTokens({
        colors: preset.colors!,
        textRatio: preset.textRatio,
        keepNativeStatusColors: preset.keepNativeStatusColors,
      });
      const surface = tokens['--uui-color-surface'];

      expect(
        contrastRatioHex(tokens['--uui-color-text'], surface),
      ).toBeGreaterThanOrEqual(preset.textRatio);
      expect(
        contrastRatioHex(tokens['--uui-color-text-alt'], surface),
      ).toBeGreaterThanOrEqual(preset.textRatio);
      expect(
        contrastRatioHex(tokens['--uui-color-interactive'], surface),
      ).toBeGreaterThanOrEqual(preset.textRatio);

      // Umbraco reuses this for muted labels and aliases, so it carries the text floor too.
      expect(
        contrastRatioHex(
          tokens['--uui-color-disabled-contrast'],
          tokens['--uui-color-disabled'],
        ),
        `disabled-contrast on disabled fill`,
      ).toBeGreaterThanOrEqual(4.5);

      if (preset.keepNativeStatusColors) {
        // Monochrome themes must not touch status hues at all.
        expect(tokens['--uui-color-danger']).toBeUndefined();
        expect(tokens['--uui-color-positive']).toBeUndefined();
      } else {
        for (const role of ['danger', 'warning', 'positive']) {
          // The standalone variant is painted onto the surface, so it carries the text ratio.
          const onSurface = contrastRatioHex(tokens[`--uui-color-${role}-standalone`], surface);
          expect(onSurface, `${role}-standalone on ${surface}`).toBeGreaterThanOrEqual(
            preset.textRatio,
          );

          // In a 7:1 theme the fill is a large block on a near-black surface, so it is raised
          // to the same target rather than left at 3:1.
          if (preset.textRatio >= 7) {
            expect(
              contrastRatioHex(tokens[`--uui-color-${role}`], surface),
              `${role} fill on ${surface}`,
            ).toBeGreaterThanOrEqual(preset.textRatio);
          }
          // The base token is a fill, so its label must be readable against it.
          const onFill = contrastRatioHex(
            tokens[`--uui-color-${role}-contrast`],
            tokens[`--uui-color-${role}`],
          );
          expect(onFill, `${role}-contrast on ${role} fill`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});

describe('native theme CSS contract', () => {
  const cssFor = (preset: AppearancePresetId) =>
    compileNativeThemeCss({ ...emptyPreference(), preset }, false);

  it('targets :root with Umbraco tokens, because shell chrome lives in shadow roots', () => {
    const css = cssFor('dim');
    expect(css).toContain(':root {');
    expect(css).toContain('--uui-color-header-surface');
    expect(css).toContain('--uui-color-surface');
    expect(css).toContain('--uui-color-text');
    // Public UUI tokens drive Umbraco; reusable semantic aliases are also exposed to extensions.
    expect(css).toContain('--our-pa-color-background');
    expect(css).toContain('--our-pa-color-surface');
    expect(css).toContain('--our-pa-color-text');
    expect(css).toContain('--our-pa-color-button-background');
    expect(css).toContain('--our-pa-color-button-text');
    expect(css).toContain('--our-pa-color-border');
    expect(css).toContain('--our-pa-color-status-danger-background');
    expect(css).toContain('--our-pa-color-status-warning-text');
    expect(css).toContain('--our-pa-color-status-positive-background');
  });

  it('emits nothing when there is no preference', () => {
    expect(cssFor('none')).toBe('');
  });

  it('keeps High Contrast header icons visible via inherited default contrast', () => {
    const css = cssFor('highContrast');
    expect(css).toContain('--uui-color-default-contrast: #ffffff');
    expect(css).toContain('color-scheme: light');
    const tokens = buildUuiTokens({
      colors: PRESETS.highContrast.colors!,
      textRatio: PRESETS.highContrast.textRatio,
    });
    expect(tokens['--uui-color-default-contrast']).toBe('#ffffff');
    expect(
      contrastRatioHex(tokens['--uui-color-default-contrast'], tokens['--uui-color-header-surface']),
    ).toBeGreaterThanOrEqual(7);
  });

  it('separates High Contrast regions with stepped surfaces and off-white rules', () => {
    const tokens = buildUuiTokens({
      colors: PRESETS.highContrast.colors!,
      textRatio: PRESETS.highContrast.textRatio,
    });
    expect(tokens['--uui-color-header-surface']).toBe('#000000');
    expect(tokens['--uui-color-header-background']).toBe('#000000');
    expect(tokens['--uui-color-surface']).toBe('#1a1a1a');
    expect(tokens['--uui-color-background']).not.toBe(tokens['--uui-color-surface']);
    expect(tokens['--uui-color-background']).not.toBe(tokens['--uui-color-header-surface']);
    expect(tokens['--uui-color-divider']).toBe('#c8c8c8');
    expect(tokens['--uui-tab-divider']).toBe('#c8c8c8');
    expect(tokens['--uui-box-border-width']).toBe('1px');
    expect(tokens['--uui-box-border-color']).toBe('#c8c8c8');
    expect(tokens['--uui-shadow-depth-5']).toContain('#c8c8c8');
    expect(tokens['--uui-modal-color-backdrop']).toContain('255, 255, 255');
    expect(
      contrastRatioHex('#c8c8c8', tokens['--uui-color-background']),
    ).toBeGreaterThanOrEqual(3);
    const css = cssFor('highContrast');
    expect(css).toContain('umb-app::after');
    expect(css).toContain('top: 60px');
    expect(css).not.toContain('box-shadow: 0 var(--umb-header-layout-height');
  });

  it('re-pins native values on protected editor hosts', () => {
    const css = cssFor('dim');
    for (const host of ['uui-input', 'uui-textarea', 'umb-input-tiptap', 'umb-code-editor']) {
      expect(css).toContain(host);
    }
    // Re-pinned to Umbraco's light-theme values so textbox interiors and entered text stay native.
    const protectionBlock = css.slice(css.indexOf('uui-input'));
    expect(protectionBlock).toContain('--uui-color-surface: #ffffff;');
    expect(protectionBlock).toContain('--uui-color-text: #060606;');
  });

  it('keeps color-scheme native on editor hosts so placeholders and caret are untouched', () => {
    // uui-input declares `color-scheme: var(--uui-color-scheme, normal)`. Leaving it on `dark`
    // hands placeholder and caret rendering to the browser, which measured 4.06:1.
    for (const preset of THEMED_PRESETS) {
      const css = compileNativeThemeCss({ ...emptyPreference(), preset: preset.id }, false);
      const protectionBlock = css.slice(css.indexOf('uui-input'));
      expect(protectionBlock, preset.displayName).toContain('--uui-color-scheme: normal;');
    }
  });

  it('never reaches inside a shadow root or filters the page', () => {
    for (const preset of THEMED_PRESETS) {
      const css = compileNativeThemeCss({ ...emptyPreference(), preset: preset.id }, false);
      expect(css).not.toContain('::part');
      expect(css).not.toContain('>>>');
      expect(css.toLowerCase()).not.toContain('filter:');
    }
  });

});

describe('registered theme manifests', () => {
  const collect = () => themeManifests();

  it('registers a dropdown entry per shipped appearance', () => {
    const names = collect().map((m) => m.name);
    expect(names).toEqual([...DROPDOWN_THEME_NAMES]);
  });

  it('lists package themes in the product order', () => {
    const names = collect().map((m) => m.name);
    expect(names[0]).toBe('Follow System');
    expect(names.indexOf('Standard Light')).toBeLessThan(names.indexOf('Standard Dark'));
    expect(names.indexOf('Kids Light')).toBeLessThan(names.indexOf('Kids Dark'));
    expect(names.indexOf('Teens Light')).toBeLessThan(names.indexOf('Teens Dark'));
  });

  it('resolves css to a module-like object, which is all Umbraco accepts', async () => {
    // A bare string from an async `css` function is silently dropped by loadManifestPlainCss,
    // which is why selecting a package theme previously changed nothing.
    for (const manifest of collect()) {
      const resolved = await (manifest.css as () => Promise<unknown>)();
      expect(resolved, `${manifest.name} css payload`).toBeTypeOf('object');
      const css = (resolved as { default: string }).default;
      expect(css, `${manifest.name} default export`).toBeTypeOf('string');
      expect(css).toContain('--uui-color-');
    }
  });

  it('follow system ships both polarities behind prefers-color-scheme', async () => {
    const followSystem = collect().find((m) => m.name === 'Follow System')!;
    const { default: css } = (await (followSystem.css as () => Promise<{ default: string }>)());
    expect(css).toContain('@media (prefers-color-scheme: dark)');
  });
});

describe('audience theme option matrix', () => {
  for (const preset of AUDIENCE_PRESETS) {
    for (const appearanceMode of ['light', 'dark'] as const) {
      for (const colorVisionFriendly of [false, true]) {
        for (const highContrast of [false, true]) {
          const label = `${preset}/${appearanceMode}/blue-amber:${colorVisionFriendly}/HC:${highContrast}`;
          it(`${label} meets its text and non-text targets`, () => {
            const preference = {
              ...emptyPreference(),
              preset,
              appearanceMode,
              accessibility: {
                ...emptyPreference().accessibility,
                colorVisionFriendly,
                highContrast,
              },
            };
            const colors = resolvePreferenceColors(preference, appearanceMode === 'dark');
            const textTarget = highContrast ? 7 : 4.5;
            for (const [pairLabel, fg, bg] of textPairs(colors)) {
              expect(
                contrastRatioHex(fg, bg),
                `${label}: ${pairLabel} (${fg} on ${bg})`,
              ).toBeGreaterThanOrEqual(textTarget);
            }
            expect(
              contrastRatioHex(colors.border, colors.surfaceBackground),
              `${label}: border`,
            ).toBeGreaterThanOrEqual(3);
            expect(
              contrastRatioHex(colors.focusRing, colors.surfaceBackground),
              `${label}: focus on workspace`,
            ).toBeGreaterThanOrEqual(3);
          });
        }
      }
    }
  }
});

describe('font size overlay', () => {
  it('emits nothing for Normal so Umbraco type sizes stay native', () => {
    expect(compileFontSizeCss('normal')).toBe('');
    expect(compileFontSizeCss(undefined)).toBe('');
  });

  it('steps Low and Large by one line of body text across menus and fields', () => {
    const low = compileFontSizeCss('low');
    const large = compileFontSizeCss('large');
    expect(low).toContain('--uui-type-default-size: 12px');
    expect(large).toContain('--uui-type-default-size: 18px');
    expect(large).toContain('--our-pa-type-size: 18px');
    expect(low).toContain('--our-pa-type-size: 12px');
    expect(low).toContain('font-size: 12px');
    expect(large).toContain('font-size: 18px');
    expect(low.toLowerCase()).not.toContain('zoom:');
    expect(large.toLowerCase()).not.toContain('zoom:');
    expect(compileFontSizeCss(2)).toContain('font-size: 18px');
    expect(compileFontSizeCss('Low')).toContain('font-size: 12px');
  });
});

describe('contrast report', () => {
  it('prints the audited ratios for every shipped palette', () => {
    const lines: string[] = [];
    for (const preset of THEMED_PRESETS) {
      const colors = preset.colors!;
      lines.push(`\n${preset.displayName}  (target ${preset.textRatio}:1)`);
      for (const [label, fg, bg] of textPairs(colors)) {
        lines.push(`  ${label.padEnd(24)} ${fg} on ${bg}  ${contrastRatioHex(fg, bg).toFixed(2)}:1`);
      }
      lines.push(
        `  ${'Border'.padEnd(24)} ${colors.border} on ${colors.surfaceBackground}  ${contrastRatioHex(colors.border, colors.surfaceBackground).toFixed(2)}:1`,
      );
    }
    // eslint-disable-next-line no-console
    console.log(lines.join('\n'));
    expect(lines.length).toBeGreaterThan(0);
  });
});
