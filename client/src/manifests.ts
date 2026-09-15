import type { UmbExtensionRegistry } from './types/umbraco-ambient';
import type { AppearancePreferenceDocument } from './models';
import {
  CUSTOM_THEME_ALIAS,
  customThemeManifest,
  needsConfiguredTheme,
  themeManifests,
} from './themes/theme-manifests';
import './profile/appearance-profile-app.element';
import './profile/appearance-font-size-app.element';

export const APPEARANCE_SECTION_ALIAS = 'Our.PersonalAppearance.Section';
export { CUSTOM_THEME_ALIAS };

export function registerManifests(extensionRegistry: UmbExtensionRegistry): void {
  const manifests = [
    {
      type: 'section',
      alias: APPEARANCE_SECTION_ALIAS,
      name: 'Appearance Studio',
      weight: 75,
      meta: {
        label: 'Appearance',
        pathname: 'personal-appearance',
      },
    },
    {
      type: 'sectionView',
      alias: 'Our.PersonalAppearance.SectionView.Studio',
      name: 'Appearance Studio',
      elementName: 'our-pa-appearance-profile-app',
      weight: 1000,
      meta: {
        label: 'Theme Studio',
        pathname: 'studio',
        icon: 'icon-palette',
      },
      conditions: [
        {
          alias: 'Umb.Condition.SectionAlias',
          match: APPEARANCE_SECTION_ALIAS,
        },
      ],
    },
    {
      type: 'userProfileApp',
      alias: 'Our.PersonalAppearance.UserProfileApp.FontSize',
      name: 'Font size',
      elementName: 'our-pa-font-size-user-profile-app',
      weight: 190,
      meta: {
        label: 'Font size',
        pathname: 'font-size',
      },
    },
    ...themeManifests(),
  ];

  if (typeof extensionRegistry.registerMany === 'function') {
    extensionRegistry.registerMany(manifests);
  } else {
    for (const manifest of manifests) {
      extensionRegistry.register(manifest);
    }
  }
}

export function registerCurrentUserCustomTheme(
  extensionRegistry: UmbExtensionRegistry,
  preference: AppearancePreferenceDocument,
): void {
  extensionRegistry.unregister?.(CUSTOM_THEME_ALIAS);
  if (!needsConfiguredTheme(preference)) return;
  if (preference.preset === 'custom' && !preference.customColors) return;

  extensionRegistry.register(customThemeManifest(preference));
}
