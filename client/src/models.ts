export interface CustomAppearanceColors {
  shellBackground: string;
  shellForeground: string;
  surfaceBackground: string;
  surfaceForeground: string;
  accentBackground: string;
  accentForeground: string;
  link: string;
  border: string;
  focusRing: string;
  selectedBackground: string;
  selectedForeground: string;
  hoverBackground: string;
  activeBackground: string;
}

export type AppearancePresetId =
  | 'none'
  | 'light'
  | 'dark'
  | 'dim'
  | 'warmComfort'
  | 'colorVisionFriendly'
  | 'highContrast'
  | 'blackAndWhite'
  | 'kids'
  | 'teenagers'
  | 'adults'
  | 'followSystem'
  | 'custom';

export type AppearanceMode = 'light' | 'dark';

export type AppearanceFontSizeId = 'low' | 'normal' | 'large';

export interface AccessibilityOptions {
  colorVisionFriendly: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  enhancedFocus: boolean;
}

export interface AppearancePreferenceDocument {
  schemaVersion: number;
  concurrencyToken: string;
  updatedAtUtc?: string;
  preset: AppearancePresetId;
  appearanceMode: AppearanceMode;
  customThemeName?: string;
  customColors?: CustomAppearanceColors;
  fontFamilyId?: string;
  fontSizeId?: AppearanceFontSizeId;
  accessibility: AccessibilityOptions;
}

export interface AppearancePreferenceResponse {
  hasPreference: boolean;
  preference?: AppearancePreferenceDocument | null;
}

export interface ContrastReportItem {
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  requiredRatio: number;
  passes: boolean;
  role?: string;
}

export interface AppearanceValidationProblem {
  code: string;
  message: string;
  path?: string;
  contrastRatio?: number;
  requiredRatio?: number;
  correctionOptions: string[];
}

export interface AppearanceValidationResult {
  isValid: boolean;
  problems: AppearanceValidationProblem[];
  contrastReport: ContrastReportItem[];
}

export const SCHEMA_VERSION = 1;

export function emptyPreference(): AppearancePreferenceDocument {
  return {
    schemaVersion: SCHEMA_VERSION,
    concurrencyToken: '',
    preset: 'none',
    appearanceMode: 'light',
    customThemeName: 'My custom theme',
    fontFamilyId: 'umbraco-default',
    fontSizeId: 'normal',
    accessibility: {
      colorVisionFriendly: false,
      highContrast: false,
      reducedMotion: false,
      enhancedFocus: false,
    },
  };
}
