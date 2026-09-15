import type {
  AppearanceMode,
  AppearancePreferenceDocument,
  AppearancePresetId,
} from '../models';
import { emptyPreference } from '../models';
import { compileNativeThemeCss } from '../tokens/semantic-token-compiler';

export const CUSTOM_THEME_ALIAS = 'Our.PersonalAppearance.Theme.Configured.CurrentUser';

/**
 * Umbraco's `loadManifestPlainCss` accepts a raw string, or a *module-like object* exposing
 * `css` or `default`. A bare string returned from an async `css` function is silently
 * discarded, so every payload here must be wrapped.
 */
const cssModule = (css: string) => ({ default: css });

const prefersDark = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const presetTheme = (
  alias: string,
  name: string,
  preset: AppearancePresetId,
  weight: number,
  options?: {
    mode?: AppearanceMode;
    colorVisionFriendly?: boolean;
    highContrast?: boolean;
    enhancedFocus?: boolean;
  },
) => ({
  type: 'theme',
  alias,
  name,
  weight,
  css: async () => {
    const preference = emptyPreference();
    preference.preset = preset;
    preference.appearanceMode = options?.mode ?? 'light';
    preference.accessibility.colorVisionFriendly = options?.colorVisionFriendly ?? false;
    preference.accessibility.highContrast = options?.highContrast ?? false;
    preference.accessibility.enhancedFocus = options?.enhancedFocus ?? false;
    return cssModule(compileNativeThemeCss(preference, prefersDark()));
  },
});

/**
 * Dropdown order is by descending `weight`. Package names and order are the product list.
 * Weights sit above Umbraco's Light (300) / Dark (200) / High contrast (100).
 */
export const themeManifests = () => {
  let weight = 400;
  const nextWeight = () => weight--;

  return [
    {
      type: 'theme',
      alias: 'Our.PersonalAppearance.Theme.FollowSystem',
      name: 'Follow System',
      weight: nextWeight(),
      css: async () => {
        const light = emptyPreference();
        light.preset = 'adults';
        light.appearanceMode = 'light';
        const dark = emptyPreference();
        dark.preset = 'adults';
        dark.appearanceMode = 'dark';
        return cssModule(
          `${compileNativeThemeCss(light, false)}

@media (prefers-color-scheme: dark) {
${compileNativeThemeCss(dark, true)}
}`,
        );
      },
    },
    presetTheme(
      'Our.PersonalAppearance.Theme.Adults.Light',
      'Standard Light',
      'adults',
      nextWeight(),
      { mode: 'light' },
    ),
    presetTheme(
      'Our.PersonalAppearance.Theme.Adults.Dark',
      'Standard Dark',
      'adults',
      nextWeight(),
      { mode: 'dark' },
    ),
    presetTheme('Our.PersonalAppearance.Theme.Kids.Light', 'Kids Light', 'kids', nextWeight(), {
      mode: 'light',
    }),
    presetTheme('Our.PersonalAppearance.Theme.Kids.Dark', 'Kids Dark', 'kids', nextWeight(), {
      mode: 'dark',
    }),
    presetTheme(
      'Our.PersonalAppearance.Theme.Teenagers.Light',
      'Teens Light',
      'teenagers',
      nextWeight(),
      { mode: 'light' },
    ),
    presetTheme(
      'Our.PersonalAppearance.Theme.Teenagers.Dark',
      'Teens Dark',
      'teenagers',
      nextWeight(),
      { mode: 'dark' },
    ),
    presetTheme('Our.PersonalAppearance.Theme.Dim', 'Dimmed', 'dim', nextWeight()),
    presetTheme('Our.PersonalAppearance.Theme.EyeComfort', 'Eye Comfort', 'warmComfort', nextWeight()),
    presetTheme(
      'Our.PersonalAppearance.Theme.BlackAndWhite',
      'Black & White',
      'blackAndWhite',
      nextWeight(),
    ),
    presetTheme(
      'Our.PersonalAppearance.Theme.ColorVisionFriendly',
      'Colour Vision Support',
      'colorVisionFriendly',
      nextWeight(),
    ),
    presetTheme('Our.PersonalAppearance.Theme.HighContrast', 'High Contrast', 'highContrast', nextWeight(), {
      enhancedFocus: true,
    }),
  ];
};

export const DROPDOWN_THEME_NAMES = [
  'Follow System',
  'Standard Light',
  'Standard Dark',
  'Kids Light',
  'Kids Dark',
  'Teens Light',
  'Teens Dark',
  'Dimmed',
  'Eye Comfort',
  'Black & White',
  'Colour Vision Support',
  'High Contrast',
] as const;

export function needsConfiguredTheme(preference: AppearancePreferenceDocument): boolean {
  return (
    preference.preset === 'custom' ||
    preference.accessibility.colorVisionFriendly ||
    preference.accessibility.highContrast ||
    preference.accessibility.reducedMotion ||
    preference.accessibility.enhancedFocus ||
    (!!preference.fontFamilyId && preference.fontFamilyId !== 'umbraco-default')
  );
}

/** The signed-in user's configured combination, surfaced as one native dropdown entry. */
export const customThemeManifest = (preference: AppearancePreferenceDocument) => ({
  type: 'theme',
  alias: CUSTOM_THEME_ALIAS,
  name:
    preference.preset === 'custom'
      ? preference.customThemeName?.trim() || 'My custom theme'
      : `My ${PRESET_LABELS[preference.preset] ?? 'configured'} theme`,
  weight: 410,
  css: async () => cssModule(compileNativeThemeCss(preference, prefersDark())),
});

const PRESET_LABELS: Partial<Record<AppearancePresetId, string>> = {
  followSystem: 'Follow System',
  adults: 'Standard',
  kids: 'Kids',
  teenagers: 'Teens',
  dim: 'Dimmed',
  warmComfort: 'Eye Comfort',
  blackAndWhite: 'Black & White',
  colorVisionFriendly: 'Colour Vision Support',
  highContrast: 'High Contrast',
};
