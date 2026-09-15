import type { AppearancePreferenceDocument, AppearanceValidationResult, ContrastReportItem } from '../models';
import {
  HIGH_CONTRAST_TEXT_TARGET_RATIO,
  NON_TEXT_MINIMUM_RATIO,
  TEXT_MINIMUM_RATIO,
  autoForeground,
  contrastRatioHex,
  tryParseOpaqueHex,
} from '../contrast/contrast-engine';
import { isApprovedFont } from './font-catalog';
import { isFontSizeId } from './font-size';
import { PRESETS, resolvePreferenceColors } from './preset-registry';
import type { CustomAppearanceColors } from '../models';

const FORBIDDEN = ['url(', 'javascript:', 'expression(', '@import', '<script', 'gradient(', 'var(--', 'calc('];

export function validatePreference(doc: AppearancePreferenceDocument): AppearanceValidationResult {
  const problems: AppearanceValidationResult['problems'] = [];
  const contrastReport: ContrastReportItem[] = [];

  if (doc.schemaVersion !== 1) {
    problems.push({
      code: 'schema_version',
      message: `Unsupported schema version ${doc.schemaVersion}. Expected 1.`,
      path: 'schemaVersion',
      correctionOptions: ['Set schemaVersion to 1.'],
    });
  }

  if (!(doc.preset in PRESETS)) {
    problems.push({
      code: 'preset_invalid',
      message: 'Unknown appearance preset.',
      path: 'preset',
      correctionOptions: Object.keys(PRESETS),
    });
    return { isValid: false, problems, contrastReport };
  }

  if (doc.fontSizeId && !isFontSizeId(doc.fontSizeId)) {
    problems.push({
      code: 'font_size_invalid',
      message: 'Font size must be low, normal, or large.',
      path: 'fontSizeId',
      correctionOptions: ['low', 'normal', 'large'],
    });
  }

  if (doc.preset === 'none') {
    return { isValid: problems.length === 0, problems, contrastReport };
  }

  if (doc.fontFamilyId && !isApprovedFont(doc.fontFamilyId)) {
    problems.push({
      code: 'font_not_approved',
      message: 'Font family must be an approved font ID.',
      path: 'fontFamilyId',
      correctionOptions: ['Choose an approved font ID only.'],
    });
  }

  const blob = JSON.stringify(doc);
  if (FORBIDDEN.some((m) => blob.toLowerCase().includes(m))) {
    problems.push({
      code: 'payload_forbidden',
      message: 'Arbitrary CSS, JavaScript, URLs, gradients, and uploaded fonts are not accepted.',
      path: '$',
      correctionOptions: ['Use opaque hex colors (#RRGGBB) and approved font IDs only.'],
    });
  }

  if (doc.preset === 'followSystem') {
    const required = doc.accessibility.highContrast
      ? HIGH_CONTRAST_TEXT_TARGET_RATIO
      : TEXT_MINIMUM_RATIO;
    validateColorSet(resolvePreferenceColors(doc, false), required, contrastReport, problems);
    validateColorSet(resolvePreferenceColors(doc, true), required, contrastReport, problems);
    return { isValid: problems.length === 0, problems, contrastReport };
  }

  const colors = doc.preset === 'custom' && !doc.customColors
    ? undefined
    : resolvePreferenceColors(doc, doc.appearanceMode === 'dark');

  if (
    doc.preset === 'custom' &&
    (!doc.customThemeName?.trim() || doc.customThemeName.length > 60)
  ) {
    problems.push({
      code: 'custom_theme_name_invalid',
      message: 'Custom theme name is required and must be 60 characters or fewer.',
      path: 'customThemeName',
      correctionOptions: ['Enter a short plain-text theme name.'],
    });
  }

  if (doc.preset === 'custom' && !colors) {
    problems.push({
      code: 'custom_colors_required',
      message: 'Custom appearance requires customColors.',
      path: 'customColors',
      correctionOptions: ['Provide opaque hex colors for all custom color fields.'],
    });
    return { isValid: false, problems, contrastReport };
  }

  if (colors) {
    const required =
      doc.preset === 'highContrast' || doc.accessibility.highContrast
        ? HIGH_CONTRAST_TEXT_TARGET_RATIO
        : TEXT_MINIMUM_RATIO;
    validateColorSet(colors, required, contrastReport, problems);
  }

  return { isValid: problems.length === 0, problems, contrastReport };
}

function validateColorSet(
  colors: CustomAppearanceColors,
  textRatio: number,
  report: ContrastReportItem[],
  problems: AppearanceValidationResult['problems'],
): void {
  const fields = Object.entries(colors);
  for (const [key, value] of fields) {
    if (!tryParseOpaqueHex(value)) {
      problems.push({
        code: 'color_format',
        message: `'${value}' is not an accepted opaque hex color.`,
        path: key,
        correctionOptions: ['Use #RGB or #RRGGBB only.'],
      });
    }
  }
  if (problems.some((p) => p.code === 'color_format')) return;

  addPair('Shell text', colors.shellForeground, colors.shellBackground, textRatio, 'text', report, problems);
  addPair('Surface text', colors.surfaceForeground, colors.surfaceBackground, textRatio, 'text', report, problems);
  addPair('Accent text', colors.accentForeground, colors.accentBackground, textRatio, 'text', report, problems);
  addPair('Selected text', colors.selectedForeground, colors.selectedBackground, textRatio, 'text', report, problems);
  addPair('Link on surface', colors.link, colors.surfaceBackground, textRatio, 'link', report, problems);
  addPair('Border on shell', colors.border, colors.shellBackground, NON_TEXT_MINIMUM_RATIO, 'border', report, problems);
  addPair('Focus ring on workspace', colors.focusRing, colors.surfaceBackground, NON_TEXT_MINIMUM_RATIO, 'focus', report, problems);
  addPair('Hover surface text', colors.surfaceForeground, colors.hoverBackground, textRatio, 'hover', report, problems);
  addPair('Active surface text', colors.surfaceForeground, colors.activeBackground, textRatio, 'active', report, problems);
}

function addPair(
  label: string,
  foreground: string,
  background: string,
  required: number,
  role: string,
  report: ContrastReportItem[],
  problems: AppearanceValidationResult['problems'],
): void {
  const ratio = Math.round(contrastRatioHex(foreground, background) * 100) / 100;
  const passes = ratio + 0.0001 >= required;
  report.push({ label, foreground, background, ratio, requiredRatio: required, passes, role });
  if (!passes) {
    problems.push({
      code: 'contrast_insufficient',
      message: `${label} contrast is ${ratio}:1; required ${required}:1.`,
      path: role,
      contrastRatio: ratio,
      requiredRatio: required,
      correctionOptions: [
        `Auto-set foreground to ${autoForeground(background)}`,
        'Darken the background',
        'Lighten the background',
        'Choose High Contrast',
      ],
    });
  }
}
