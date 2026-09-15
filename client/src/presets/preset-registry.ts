import type {
  AppearanceMode,
  AppearancePreferenceDocument,
  AppearancePresetId,
  CustomAppearanceColors,
} from '../models';
import {
  HIGH_CONTRAST_TEXT_TARGET_RATIO,
  TEXT_MINIMUM_RATIO,
  autoForeground,
  contrastRatioHex,
} from '../contrast/contrast-engine';
import { ensureRatio, isDark, mix } from '../tokens/uui-token-map';

export interface PresetDefinition {
  id: AppearancePresetId;
  displayName: string;
  description: string;
  colors?: CustomAppearanceColors;
  variants?: Record<AppearanceMode, CustomAppearanceColors>;
  textRatio: number;
  /**
   * Leave Umbraco's native danger/warning/positive hues alone. Monochrome themes set this so
   * status still carries colour meaning instead of collapsing into grey.
   */
  keepNativeStatusColors?: boolean;
}

export const PRESETS: Record<AppearancePresetId, PresetDefinition> = {
  none: {
    id: 'none',
    displayName: 'Umbraco default',
    description: 'No package overrides. Native Umbraco appearance only.',
    textRatio: TEXT_MINIMUM_RATIO,
  },
  light: {
    id: 'light',
    displayName: 'Light',
    description: 'Indigo chrome over white panels.',
    textRatio: TEXT_MINIMUM_RATIO,
    colors: {
      shellBackground: '#243157',
      shellForeground: '#ffffff',
      surfaceBackground: '#ffffff',
      surfaceForeground: '#1a1d23',
      accentBackground: '#2f5bd7',
      accentForeground: '#ffffff',
      link: '#1a4fc4',
      border: '#767d8a',
      focusRing: '#1a4fc4',
      selectedBackground: '#dbe4fb',
      selectedForeground: '#10254f',
      hoverBackground: '#f1f3f7',
      activeBackground: '#e4e8f0',
    },
  },
  dark: {
    id: 'dark',
    displayName: 'Dark',
    description: 'Cool dark chrome. Protected editors stay light.',
    textRatio: TEXT_MINIMUM_RATIO,
    colors: {
      shellBackground: '#181d24',
      shellForeground: '#e9eef4',
      surfaceBackground: '#212832',
      surfaceForeground: '#e9eef4',
      accentBackground: '#3b74d1',
      accentForeground: '#ffffff',
      link: '#82b6f7',
      border: '#6e7887',
      focusRing: '#ffd24d',
      selectedBackground: '#2d4f80',
      selectedForeground: '#ffffff',
      hoverBackground: '#2a313b',
      activeBackground: '#333b46',
    },
  },
  dim: {
    id: 'dim',
    displayName: 'Dimmed',
    description: 'Lower-luminance dark shell for reduced glare. Not a medical eye-protection claim.',
    textRatio: TEXT_MINIMUM_RATIO,
    colors: {
      shellBackground: '#1b2027',
      shellForeground: '#e8edf3',
      surfaceBackground: '#22272e',
      surfaceForeground: '#e8edf3',
      accentBackground: '#3b74d1',
      accentForeground: '#ffffff',
      link: '#7cb2f5',
      border: '#6e7887',
      focusRing: '#ffd24d',
      selectedBackground: '#2d4f80',
      selectedForeground: '#ffffff',
      hoverBackground: '#2b313a',
      activeBackground: '#343b45',
    },
  },
  warmComfort: {
    id: 'warmComfort',
    displayName: 'Eye Comfort',
    description:
      'Warm, low-blue neutrals for a personal comfort preference. Not a medical claim.',
    textRatio: TEXT_MINIMUM_RATIO,
    colors: {
      shellBackground: '#1f1a14',
      shellForeground: '#f5ead6',
      surfaceBackground: '#2a231b',
      surfaceForeground: '#f5ead6',
      accentBackground: '#a9662a',
      accentForeground: '#ffffff',
      link: '#f0b968',
      border: '#7d6b52',
      focusRing: '#ffd27a',
      selectedBackground: '#6b4a24',
      selectedForeground: '#fff7ea',
      hoverBackground: '#352c22',
      activeBackground: '#403528',
    },
  },
  colorVisionFriendly: {
    id: 'colorVisionFriendly',
    displayName: 'Colour Vision Support',
    description:
      'Blue/orange signalling from the Okabe-Ito palette, chosen to stay distinguishable without relying on red-green discrimination. Not a colour-blindness correction.',
    textRatio: TEXT_MINIMUM_RATIO,
    colors: {
      shellBackground: '#004c73',
      shellForeground: '#ffffff',
      surfaceBackground: '#ffffff',
      surfaceForeground: '#16191d',
      accentBackground: '#0072b2',
      accentForeground: '#ffffff',
      link: '#005b8f',
      border: '#5b6773',
      focusRing: '#d55e00',
      selectedBackground: '#cde6f5',
      selectedForeground: '#003350',
      hoverBackground: '#f0f4f7',
      activeBackground: '#e1e9ef',
    },
  },
  highContrast: {
    id: 'highContrast',
    displayName: 'High Contrast',
    description: 'Targets 7:1 or better for normal interface text where package tokens apply.',
    textRatio: HIGH_CONTRAST_TEXT_TARGET_RATIO,
    colors: {
      shellBackground: '#000000',
      shellForeground: '#ffffff',
      surfaceBackground: '#1a1a1a',
      surfaceForeground: '#ffffff',
      accentBackground: '#ffff00',
      accentForeground: '#000000',
      link: '#66ffff',
      border: '#c8c8c8',
      focusRing: '#ffff00',
      // Selection inverts to white rather than reusing the yellow accent: Umbraco paints the
      // "current" colour behind whole navigation rows, and a full-width yellow row is both
      // garish and indistinguishable from a focused control.
      selectedBackground: '#ffffff',
      selectedForeground: '#000000',
      hoverBackground: '#2e2e2e',
      activeBackground: '#3d3d3d',
    },
  },
  blackAndWhite: {
    id: 'blackAndWhite',
    displayName: 'Black & White',
    description:
      'Fully desaturated light theme: black chrome, white panels, grey-step hierarchy. Status colours stay native so meaning is never carried by lightness alone.',
    textRatio: TEXT_MINIMUM_RATIO,
    keepNativeStatusColors: true,
    colors: {
      shellBackground: '#1a1a1a',
      shellForeground: '#ffffff',
      surfaceBackground: '#ffffff',
      surfaceForeground: '#141414',
      accentBackground: '#1a1a1a',
      accentForeground: '#ffffff',
      link: '#3d3d3d',
      border: '#5c5c5c',
      focusRing: '#000000',
      selectedBackground: '#d4d4d4',
      selectedForeground: '#141414',
      hoverBackground: '#f0f0f0',
      activeBackground: '#e0e0e0',
    },
  },
  kids: {
    id: 'kids',
    displayName: 'Kids',
    description:
      'Bright blue, orange, and yellow — playful and friendly. A visual style only; it encodes no assumption about who is using it.',
    textRatio: TEXT_MINIMUM_RATIO,
    colors: {
      shellBackground: '#1f6fb2',
      shellForeground: '#ffffff',
      surfaceBackground: '#ffffff',
      surfaceForeground: '#1b2430',
      accentBackground: '#c2410c',
      accentForeground: '#ffffff',
      link: '#1256a0',
      border: '#5a6b7d',
      focusRing: '#c2410c',
      selectedBackground: '#ffe08a',
      selectedForeground: '#3d2b00',
      hoverBackground: '#f2f7fb',
      activeBackground: '#e3edf6',
    },
    variants: {
      light: {
        shellBackground: '#1f6fb2',
        shellForeground: '#ffffff',
        surfaceBackground: '#ffffff',
        surfaceForeground: '#1b2430',
        accentBackground: '#c2410c',
        accentForeground: '#ffffff',
        link: '#1256a0',
        border: '#5a6b7d',
        focusRing: '#c2410c',
        selectedBackground: '#ffe08a',
        selectedForeground: '#3d2b00',
        hoverBackground: '#f2f7fb',
        activeBackground: '#e3edf6',
      },
      dark: {
        shellBackground: '#082a4a',
        shellForeground: '#ffffff',
        surfaceBackground: '#10263a',
        surfaceForeground: '#f7fbff',
        accentBackground: '#b64000',
        accentForeground: '#ffffff',
        link: '#7fc8ff',
        border: '#71899e',
        focusRing: '#ffd24a',
        selectedBackground: '#704b00',
        selectedForeground: '#fff4cc',
        hoverBackground: '#173248',
        activeBackground: '#203d54',
      },
    },
  },
  teenagers: {
    id: 'teenagers',
    displayName: 'Teens',
    description:
      'Violet, mint, and pink — modern and vibrant. A visual style only; it encodes no assumption about who is using it.',
    textRatio: TEXT_MINIMUM_RATIO,
    colors: {
      shellBackground: '#5b2a86',
      shellForeground: '#ffffff',
      surfaceBackground: '#ffffff',
      surfaceForeground: '#241b2f',
      accentBackground: '#a62e6a',
      accentForeground: '#ffffff',
      link: '#5b2a86',
      border: '#76697f',
      focusRing: '#007a70',
      selectedBackground: '#cff7ea',
      selectedForeground: '#183c33',
      hoverBackground: '#faf4fc',
      activeBackground: '#f1e7f5',
    },
    variants: {
      light: {
        shellBackground: '#5b2a86',
        shellForeground: '#ffffff',
        surfaceBackground: '#ffffff',
        surfaceForeground: '#241b2f',
        accentBackground: '#a62e6a',
        accentForeground: '#ffffff',
        link: '#5b2a86',
        border: '#76697f',
        focusRing: '#007a70',
        selectedBackground: '#cff7ea',
        selectedForeground: '#183c33',
        hoverBackground: '#faf4fc',
        activeBackground: '#f1e7f5',
      },
      dark: {
        shellBackground: '#25152f',
        shellForeground: '#faf5ff',
        surfaceBackground: '#30203b',
        surfaceForeground: '#faf5ff',
        accentBackground: '#a92f72',
        accentForeground: '#ffffff',
        link: '#e0a8ff',
        border: '#90799d',
        focusRing: '#62d9be',
        selectedBackground: '#653074',
        selectedForeground: '#ffffff',
        hoverBackground: '#3b2947',
        activeBackground: '#463253',
      },
    },
  },
  adults: {
    id: 'adults',
    displayName: 'Standard',
    description:
      'Navy, deep teal, and gold — clean and professional. A visual style only; it encodes no assumption about who is using it.',
    textRatio: TEXT_MINIMUM_RATIO,
    colors: {
      shellBackground: '#172b4d',
      shellForeground: '#ffffff',
      surfaceBackground: '#ffffff',
      surfaceForeground: '#1f262e',
      accentBackground: '#146c60',
      accentForeground: '#ffffff',
      link: '#155e52',
      border: '#69778a',
      focusRing: '#9a6500',
      selectedBackground: '#f4e5b5',
      selectedForeground: '#2f260b',
      hoverBackground: '#f4f6f8',
      activeBackground: '#e8ecf0',
    },
    variants: {
      light: {
        shellBackground: '#172b4d',
        shellForeground: '#ffffff',
        surfaceBackground: '#ffffff',
        surfaceForeground: '#1f262e',
        accentBackground: '#146c60',
        accentForeground: '#ffffff',
        link: '#155e52',
        border: '#69778a',
        focusRing: '#9a6500',
        selectedBackground: '#f4e5b5',
        selectedForeground: '#2f260b',
        hoverBackground: '#f4f6f8',
        activeBackground: '#e8ecf0',
      },
      dark: {
        shellBackground: '#101f35',
        shellForeground: '#f5f8fc',
        surfaceBackground: '#17283a',
        surfaceForeground: '#f5f8fc',
        accentBackground: '#176b60',
        accentForeground: '#ffffff',
        link: '#72d4c5',
        border: '#77899b',
        focusRing: '#ffd166',
        selectedBackground: '#294f57',
        selectedForeground: '#ffffff',
        hoverBackground: '#203448',
        activeBackground: '#294055',
      },
    },
  },
  followSystem: {
    id: 'followSystem',
    displayName: 'Follow System',
    description: 'Resolves to Light or Dark from prefers-color-scheme at runtime.',
    textRatio: TEXT_MINIMUM_RATIO,
  },
  custom: {
    id: 'custom',
    displayName: 'Custom',
    description: 'User-defined opaque colors validated by the contrast engine.',
    textRatio: TEXT_MINIMUM_RATIO,
  },
};

export function resolveColors(
  preset: AppearancePresetId,
  custom: CustomAppearanceColors | undefined,
  prefersDark: boolean,
  mode?: AppearanceMode,
): CustomAppearanceColors {
  if (preset === 'custom') {
    return custom ?? PRESETS.dark.colors!;
  }
  if (preset === 'followSystem') {
    return prefersDark ? PRESETS.adults.variants!.dark : PRESETS.adults.variants!.light;
  }
  if (preset === 'none') {
    return PRESETS.light.colors!;
  }
  const definition = PRESETS[preset];
  return definition.variants?.[mode ?? 'light'] ?? definition.colors ?? PRESETS.light.colors!;
}

export const AUDIENCE_PRESETS = ['kids', 'teenagers', 'adults'] as const;

export const AUDIENCE_HUES: Record<(typeof AUDIENCE_PRESETS)[number], string[]> = {
  kids: ['Bright blue', 'Orange', 'Yellow'],
  teenagers: ['Violet', 'Mint', 'Pink'],
  adults: ['Navy', 'Deep teal', 'Gold'],
};

export function isAudiencePreset(
  preset: AppearancePresetId,
): preset is (typeof AUDIENCE_PRESETS)[number] {
  return (AUDIENCE_PRESETS as readonly AppearancePresetId[]).includes(preset);
}

/**
 * Resolves all independent choices in a deterministic order:
 * family + light/dark, then the alternate blue/amber palette, then contrast.
 */
export function resolvePreferenceColors(
  preference: AppearancePreferenceDocument,
  prefersDark: boolean,
): CustomAppearanceColors {
  let colors = resolveColors(
    preference.preset,
    preference.customColors,
    prefersDark,
    preference.appearanceMode,
  );

  if (preference.accessibility.colorVisionFriendly) {
    colors = applyBlueAmberPalette(colors);
  }
  if (preference.accessibility.highContrast) {
    colors = applyHighContrast(colors);
  }
  return colors;
}

/** Alternate palette avoids red/green-only signalling and always keeps text/icon labels. */
export function applyBlueAmberPalette(
  colors: CustomAppearanceColors,
): CustomAppearanceColors {
  const dark = isDark(colors.surfaceBackground);
  return dark
    ? {
        ...colors,
        accentBackground: '#2563eb',
        accentForeground: '#ffffff',
        link: '#8ec5ff',
        focusRing: '#ffc857',
        selectedBackground: '#7a4a00',
        selectedForeground: '#ffffff',
      }
    : {
        ...colors,
        accentBackground: '#005ea8',
        accentForeground: '#ffffff',
        link: '#005ea8',
        focusRing: '#a65a00',
        selectedBackground: '#ffe08a',
        selectedForeground: '#352400',
      };
}

/**
 * Raises every text-bearing pair to 7:1 while preserving the palette's hue and polarity.
 * Borders/focus remain meaningful non-text indicators and are held to 3:1.
 */
export function applyHighContrast(colors: CustomAppearanceColors): CustomAppearanceColors {
  const result = { ...colors };
  result.shellBackground = ensureBackgroundRatio(
    result.shellBackground,
    result.shellForeground,
    HIGH_CONTRAST_TEXT_TARGET_RATIO,
  );
  result.surfaceBackground = ensureBackgroundRatio(
    result.surfaceBackground,
    result.surfaceForeground,
    HIGH_CONTRAST_TEXT_TARGET_RATIO,
  );
  result.accentForeground = autoForeground(result.accentBackground);
  result.accentBackground = ensureBackgroundRatio(
    result.accentBackground,
    result.accentForeground,
    HIGH_CONTRAST_TEXT_TARGET_RATIO,
  );
  result.selectedForeground = autoForeground(result.selectedBackground);
  result.selectedBackground = ensureBackgroundRatio(
    result.selectedBackground,
    result.selectedForeground,
    HIGH_CONTRAST_TEXT_TARGET_RATIO,
  );
  result.link = ensureRatio(
    result.link,
    result.surfaceBackground,
    HIGH_CONTRAST_TEXT_TARGET_RATIO,
  );
  result.hoverBackground = ensureBackgroundRatio(
    result.hoverBackground,
    result.surfaceForeground,
    HIGH_CONTRAST_TEXT_TARGET_RATIO,
  );
  result.activeBackground = ensureBackgroundRatio(
    result.activeBackground,
    result.surfaceForeground,
    HIGH_CONTRAST_TEXT_TARGET_RATIO,
  );
  result.border = ensureRatio(result.border, result.surfaceBackground, 3);
  result.focusRing = ensureRatio(result.focusRing, result.surfaceBackground, 3);
  return result;
}

function ensureBackgroundRatio(background: string, foreground: string, target: number): string {
  if (contrastRatioHex(background, foreground) >= target) return background;
  const endpoint = isDark(foreground) ? '#ffffff' : '#000000';
  for (let step = 1; step <= 100; step++) {
    const candidate = mix(background, endpoint, step / 100);
    if (contrastRatioHex(candidate, foreground) >= target) return candidate;
  }
  return endpoint;
}
