import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbContextConsumerController } from '@umbraco-cms/backoffice/context-api';
import { UMB_THEME_CONTEXT, type UmbThemeContext } from '@umbraco-cms/backoffice/themes';
import type { Subscription } from 'rxjs';
import type { UmbExtensionRegistry } from '../types/umbraco-ambient';
import type { AppearancePreferenceDocument } from '../models';
import { emptyPreference } from '../models';
import { AppearanceApiClient } from '../api/appearance-api-client';
import { compileCss, compileFontSizeCss, FONT_SIZE_ATTRIBUTE, FONT_SIZE_STYLE_ID, ROOT_ATTRIBUTE, STYLE_ELEMENT_ID } from '../tokens/semantic-token-compiler';
import { validatePreference } from '../presets/validate-preference';
import { VersionAdapter } from '../adapters/version-adapter';
import {
  CUSTOM_THEME_ALIAS,
  registerCurrentUserCustomTheme,
} from '../manifests';
import { needsConfiguredTheme } from '../themes/theme-manifests';
import { DEFAULT_FONT_SIZE_ID, coerceFontSizeId, resolveFontSize } from '../presets/font-size';
import { applyFontSizeOverlay } from '../presets/font-size-overlay';

type RuntimeMode = 'idle' | 'loading' | 'ready' | 'preview' | 'unsupported' | 'error';

type PresetId = AppearancePreferenceDocument['preset'];

/**
 * Single source of truth linking a stored preset to its entry in Umbraco's native theme dropdown.
 * `light` and `dark` deliberately map to Umbraco's own themes so we add no overrides where
 * Umbraco already ships an equivalent. `custom` is handled separately via CUSTOM_THEME_ALIAS.
 */
const PRESET_THEME_ALIASES: Partial<Record<PresetId, string>> = {
  light: 'umb-light-theme',
  dark: 'umb-dark-theme',
  dim: 'Our.PersonalAppearance.Theme.Dim',
  warmComfort: 'Our.PersonalAppearance.Theme.EyeComfort',
  colorVisionFriendly: 'Our.PersonalAppearance.Theme.ColorVisionFriendly',
  highContrast: 'Our.PersonalAppearance.Theme.HighContrast',
  blackAndWhite: 'Our.PersonalAppearance.Theme.BlackAndWhite',
  followSystem: 'Our.PersonalAppearance.Theme.FollowSystem',
};

const THEME_SELECTIONS: Record<string, { preset: PresetId; mode?: 'light' | 'dark' }> = {
  ...Object.fromEntries(
    Object.entries(PRESET_THEME_ALIASES).map(([preset, alias]) => [
      alias,
      { preset: preset as PresetId },
    ]),
  ),
  'Our.PersonalAppearance.Theme.Kids.Light': { preset: 'kids', mode: 'light' },
  'Our.PersonalAppearance.Theme.Kids.Dark': { preset: 'kids', mode: 'dark' },
  'Our.PersonalAppearance.Theme.Teenagers.Light': { preset: 'teenagers', mode: 'light' },
  'Our.PersonalAppearance.Theme.Teenagers.Dark': { preset: 'teenagers', mode: 'dark' },
  'Our.PersonalAppearance.Theme.Adults.Light': { preset: 'adults', mode: 'light' },
  'Our.PersonalAppearance.Theme.Adults.Dark': { preset: 'adults', mode: 'dark' },
};

/**
 * Applies personal appearance only after authenticated identity is established.
 * Preview is tab-local. Saved preferences are server-persisted.
 */
export class AppearanceRuntime {
  private static instance: AppearanceRuntime | null = null;

  private readonly api = new AppearanceApiClient();
  private mode: RuntimeMode = 'idle';
  private saved: AppearancePreferenceDocument = emptyPreference();
  private preview: AppearancePreferenceDocument | null = null;
  private mediaQuery?: MediaQueryList;
  private mediaListener?: (event: MediaQueryListEvent) => void;
  private identityReady = false;
  private extensionRegistry?: UmbExtensionRegistry;
  private themeContext?: UmbThemeContext;
  private themeSubscription?: Subscription;
  private themeConsumer?: UmbContextConsumerController<UmbThemeContext, UmbThemeContext>;
  private ignoreNextThemeChange = false;

  static start(
    host: UmbControllerHost,
    extensionRegistry: UmbExtensionRegistry,
  ): AppearanceRuntime {
    if (!this.instance) {
      this.instance = new AppearanceRuntime();
    }
    this.instance.extensionRegistry = extensionRegistry;
    this.instance.bootstrap(host);
    window.__OUR_PA_RUNTIME__ = this.instance;
    return this.instance;
  }

  static stop(): void {
    this.instance?.teardown();
    this.instance = null;
    delete window.__OUR_PA_RUNTIME__;
  }

  static get(): AppearanceRuntime | null {
    return this.instance;
  }

  getSaved(): AppearancePreferenceDocument {
    return structuredClone(this.saved);
  }

  getEffective(): AppearancePreferenceDocument {
    return structuredClone(this.preview ?? this.saved);
  }

  async setFontSize(fontSizeId: AppearancePreferenceDocument['fontSizeId']): Promise<void> {
    const next = structuredClone(this.saved);
    next.fontSizeId = coerceFontSizeId(fontSizeId);
    this.applyFontSize(next.fontSizeId);
    if (next.preset === 'none') {
      this.saved = next;
      return;
    }
    try {
      this.saved = normalizePreference(await this.api.putPreference(next));
      this.applyFontSize(this.saved.fontSizeId);
    } catch {
      this.saved = next;
      this.applyFontSize(next.fontSizeId);
    }
  }

  async bootstrap(_host: UmbControllerHost): Promise<void> {
    if (!VersionAdapter.isSupported()) {
      this.mode = 'unsupported';
      this.clearOverrides();
      return;
    }

    this.identityReady = false;
    this.clearOverrides();
    this.mode = 'loading';
    this.bindSystemPreference();
    this.consumeThemeContext(_host);

    try {
      // Do not apply cached preferences until identity is established via authenticated API.
      const response = await this.api.getPreference();
      this.identityReady = true;
      this.saved =
        response.hasPreference && response.preference
          ? normalizePreference(response.preference)
          : emptyPreference();
      this.preview = null;
      this.registerCustomTheme();
      this.activateSavedTheme();
      this.applyFontSize(this.saved.fontSizeId);
      this.mode = 'ready';
    } catch {
      this.mode = 'error';
      this.clearOverrides();
    }
  }

  setPreview(document: AppearancePreferenceDocument): { ok: boolean; reason?: string } {
    const validation = validatePreference(document);
    if (!validation.isValid) {
      // Invalid drafts must not affect the live shell.
      return { ok: false, reason: validation.problems[0]?.message ?? 'Invalid draft' };
    }
    this.preview = structuredClone(document);
    this.mode = 'preview';
    this.applyEffective();
    return { ok: true };
  }

  cancelPreview(): void {
    this.preview = null;
    this.mode = 'ready';
    this.applyEffective();
  }

  async save(document: AppearancePreferenceDocument): Promise<AppearancePreferenceDocument> {
    const validation = validatePreference(document);
    if (!validation.isValid) {
      throw Object.assign(new Error('validation_failed'), { validation });
    }
    const saved = normalizePreference(await this.api.putPreference(document));
    this.saved = saved;
    this.preview = null;
    this.registerCustomTheme();
    this.mode = 'ready';
    this.activateSavedTheme();
    return saved;
  }

  async reset(): Promise<void> {
    await this.api.deletePreference();
    this.saved = emptyPreference();
    this.preview = null;
    this.mode = 'ready';
    this.extensionRegistry?.unregister?.(CUSTOM_THEME_ALIAS);
    this.ignoreNextThemeChange = true;
    this.themeContext?.setThemeByAlias('umb-light-theme');
    this.clearOverrides();
  }

  onLogoutOrSessionChange(): void {
    this.api.cancel();
    this.identityReady = false;
    this.saved = emptyPreference();
    this.preview = null;
    this.clearOverrides();
    this.mode = 'idle';
  }

  private applyEffective(): void {
    if (!this.identityReady && !this.preview) {
      this.clearOverrides();
      return;
    }

    const effective = this.preview ?? this.saved;
    const validation = validatePreference(effective);
    if (!validation.isValid) {
      // Never apply invalid values to the live shell.
      return;
    }

    this.applyFontSize(effective.fontSizeId);

    if (effective.preset === 'none') {
      this.clearColorOverrides();
      return;
    }

    const prefersDark = this.mediaQuery?.matches ?? false;
    const css = compileCss(effective, prefersDark);
    this.ensureStyleElement().textContent = css;
    document.documentElement.setAttribute(ROOT_ATTRIBUTE, 'on');
    document.documentElement.setAttribute(
      'data-our-pa-enhanced-focus',
      effective.accessibility.enhancedFocus ? 'on' : 'off',
    );
    document.documentElement.setAttribute(
      'data-our-pa-reduced-motion',
      effective.accessibility.reducedMotion ? 'on' : 'off',
    );
  }

  private applyFontSize(fontSizeId: string | undefined): void {
    const css = compileFontSizeCss(fontSizeId);
    const resolved = coerceFontSizeId(fontSizeId);
    const option = resolveFontSize(resolved);
    if (!css) {
      document.getElementById(FONT_SIZE_STYLE_ID)?.remove();
      document.documentElement.removeAttribute(FONT_SIZE_ATTRIBUTE);
      applyFontSizeOverlay(null);
      return;
    }
    let el = document.getElementById(FONT_SIZE_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = FONT_SIZE_STYLE_ID;
    }
    el.textContent = css;
    document.head.appendChild(el);
    document.documentElement.setAttribute(FONT_SIZE_ATTRIBUTE, resolved);
    applyFontSizeOverlay(`${option.defaultSizePx}px`);
  }

  private clearColorOverrides(): void {
    document.getElementById(STYLE_ELEMENT_ID)?.remove();
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    document.documentElement.removeAttribute('data-our-pa-enhanced-focus');
    document.documentElement.removeAttribute('data-our-pa-reduced-motion');
  }

  private clearOverrides(): void {
    this.clearColorOverrides();
    document.getElementById(FONT_SIZE_STYLE_ID)?.remove();
    document.documentElement.removeAttribute(FONT_SIZE_ATTRIBUTE);
    applyFontSizeOverlay(null);
  }

  private ensureStyleElement(): HTMLStyleElement {
    let el = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ELEMENT_ID;
      document.head.appendChild(el);
    }
    return el;
  }

  private bindSystemPreference(): void {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaListener = () => this.applyEffective();
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  private registerCustomTheme(): void {
    if (!this.extensionRegistry) return;
    registerCurrentUserCustomTheme(this.extensionRegistry, this.saved);
  }

  private consumeThemeContext(host: UmbControllerHost): void {
    this.themeConsumer?.destroy();
    this.themeConsumer = new UmbContextConsumerController(
      host,
      UMB_THEME_CONTEXT,
      (context) => {
        if (!context) return;
        this.themeContext = context;
        this.themeSubscription?.unsubscribe();
        this.themeSubscription = context.theme.subscribe((alias) => {
          if (!this.identityReady || this.ignoreNextThemeChange) {
            this.ignoreNextThemeChange = false;
            return;
          }
          void this.persistNativeThemeSelection(alias);
        });
        if (this.identityReady) this.activateSavedTheme();
      },
    );
  }

  private activateSavedTheme(): void {
    if (!this.themeContext || this.saved.preset === 'none') return;
    const alias = this.aliasForPreference(this.saved);
    if (!alias) return;
    this.ignoreNextThemeChange = true;
    this.themeContext.setThemeByAlias(alias);
    this.clearColorOverrides();
    this.applyFontSize(this.saved.fontSizeId);
  }

  private aliasForPreference(preference: AppearancePreferenceDocument): string | null {
    if (needsConfiguredTheme(preference)) return CUSTOM_THEME_ALIAS;
    if (preference.preset === 'kids') {
      return `Our.PersonalAppearance.Theme.Kids.${preference.appearanceMode === 'dark' ? 'Dark' : 'Light'}`;
    }
    if (preference.preset === 'teenagers') {
      return `Our.PersonalAppearance.Theme.Teenagers.${preference.appearanceMode === 'dark' ? 'Dark' : 'Light'}`;
    }
    if (preference.preset === 'adults') {
      return `Our.PersonalAppearance.Theme.Adults.${preference.appearanceMode === 'dark' ? 'Dark' : 'Light'}`;
    }
    return PRESET_THEME_ALIASES[preference.preset] ?? null;
  }

  private async persistNativeThemeSelection(alias: string): Promise<void> {
    if (alias === CUSTOM_THEME_ALIAS) return;
    const selection = THEME_SELECTIONS[alias];
    if (!selection) return;

    const next = structuredClone(this.saved);
    next.preset = selection.preset;
    next.appearanceMode = selection.mode ?? next.appearanceMode ?? 'light';
    next.customColors = undefined;
    next.fontFamilyId = 'umbraco-default';
    next.fontSizeId = this.saved.fontSizeId ?? DEFAULT_FONT_SIZE_ID;
    next.accessibility = {
      colorVisionFriendly: false,
      highContrast: false,
      reducedMotion: false,
      enhancedFocus: false,
    };
    try {
      this.saved = normalizePreference(await this.api.putPreference(next));
    } catch {
      // Umbraco still owns the local theme selection; persistence failure is non-destructive.
    }
  }

  private teardown(): void {
    this.api.cancel();
    this.themeSubscription?.unsubscribe();
    this.themeConsumer?.destroy();
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
    }
    this.clearOverrides();
  }
}

function normalizePreference(
  preference: AppearancePreferenceDocument,
): AppearancePreferenceDocument {
  return {
    ...preference,
    appearanceMode: preference.appearanceMode ?? 'light',
    fontSizeId: coerceFontSizeId(preference.fontSizeId),
    accessibility: {
      colorVisionFriendly: preference.accessibility?.colorVisionFriendly ?? false,
      highContrast: preference.accessibility?.highContrast ?? false,
      reducedMotion: preference.accessibility?.reducedMotion ?? false,
      enhancedFocus: preference.accessibility?.enhancedFocus ?? false,
    },
  };
}
