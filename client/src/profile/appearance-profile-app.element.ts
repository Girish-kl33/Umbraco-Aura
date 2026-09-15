import { LitElement, css, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AppearanceRuntime } from '../context/appearance-runtime';
import {
  emptyPreference,
  type AppearancePreferenceDocument,
  type AppearancePresetId,
  type CustomAppearanceColors,
} from '../models';
import {
  AUDIENCE_HUES,
  AUDIENCE_PRESETS,
  PRESETS,
  isAudiencePreset,
  resolveColors,
} from '../presets/preset-registry';
import { APPROVED_FONTS } from '../presets/font-catalog';
import { validatePreference } from '../presets/validate-preference';
import { autoForeground } from '../contrast/contrast-engine';

const STUDIO_OTHER_PRESETS: AppearancePresetId[] = [
  'followSystem',
  'dim',
  'warmComfort',
  'blackAndWhite',
  'colorVisionFriendly',
  'highContrast',
  'custom',
  'none',
];

@customElement('our-pa-appearance-profile-app')
export class OurPaAppearanceProfileAppElement extends LitElement {
  @state() private draft: AppearancePreferenceDocument = emptyPreference();
  @state() private statusMessage = '';
  @state() private errorMessage = '';
  @state() private busy = false;

  connectedCallback(): void {
    super.connectedCallback();
    const runtime = AppearanceRuntime.get();
    const effective = runtime?.getEffective() ?? emptyPreference();
    this.draft = {
      ...effective,
      appearanceMode: effective.appearanceMode ?? 'light',
      accessibility: {
        ...effective.accessibility,
        highContrast: effective.accessibility.highContrast ?? false,
      },
    };
    if (this.draft.preset === 'custom' && !this.draft.customColors) {
      this.draft = {
        ...this.draft,
        customColors: structuredClone(PRESETS.dark.colors!),
      };
    }
  }

  private get validation() {
    return validatePreference(this.draft);
  }

  private selectPreset(preset: AppearancePresetId): void {
    const next = structuredClone(this.draft);
    next.preset = preset;
    if (preset === 'custom' && !next.customColors) {
      next.customColors = structuredClone(PRESETS.dark.colors!);
    }
    this.draft = next;
    this.errorMessage = '';
  }

  private updateCustomColor(key: keyof CustomAppearanceColors, value: string): void {
    if (!this.draft.customColors) return;
    this.draft = {
      ...this.draft,
      preset: 'custom',
      customColors: { ...this.draft.customColors, [key]: value },
    };
  }

  private autoFixForeground(bgKey: keyof CustomAppearanceColors, fgKey: keyof CustomAppearanceColors): void {
    if (!this.draft.customColors) return;
    const bg = this.draft.customColors[bgKey];
    try {
      this.updateCustomColor(fgKey, autoForeground(bg));
    } catch {
      this.errorMessage = 'Could not auto-select foreground for that background.';
    }
  }

  private async onPreview(): Promise<void> {
    const runtime = AppearanceRuntime.get();
    if (!runtime) return;
    const result = runtime.setPreview(this.draft);
    if (!result.ok) {
      this.errorMessage = result.reason ?? 'Preview blocked — draft is invalid.';
      this.statusMessage = '';
      return;
    }
    this.errorMessage = '';
    this.statusMessage = 'Preview applied to this tab only. It is not saved.';
  }

  private async onSave(): Promise<void> {
    const runtime = AppearanceRuntime.get();
    if (!runtime) return;
    if (!this.validation.isValid) {
      this.errorMessage = 'Fix contrast/validation problems before saving. Invalid drafts are not persisted.';
      return;
    }
    this.busy = true;
    try {
      const saved = await runtime.save(this.draft);
      this.draft = saved;
      this.statusMessage = 'Saved for you. Preferences are personal and server-persisted.';
      this.errorMessage = '';
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'Save failed.';
    } finally {
      this.busy = false;
    }
  }

  private onCancel(): void {
    const runtime = AppearanceRuntime.get();
    runtime?.cancelPreview();
    this.draft = runtime?.getSaved() ?? emptyPreference();
    this.statusMessage = 'Cancelled. Restored your last saved preference in this tab.';
    this.errorMessage = '';
  }

  private async onReset(): Promise<void> {
    const runtime = AppearanceRuntime.get();
    if (!runtime) return;
    this.busy = true;
    try {
      await runtime.reset();
      this.draft = emptyPreference();
      this.statusMessage = 'Reset to Umbraco default. Preference removed; all package overrides cleared.';
      this.errorMessage = '';
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'Reset failed.';
    } finally {
      this.busy = false;
    }
  }

  render() {
    const validation = this.validation;
    const colors = this.draft.customColors;

    return html`
      <section class="panel our-pa-shell-surface" aria-labelledby="our-pa-title">
        <header class="header our-pa-recovery">
          <h2 id="our-pa-title" class="our-pa-shell-label">Appearance Studio</h2>
          <p class="lede">
            Build personal color combinations for your account. Saved custom themes are added to
            Umbraco's existing Theme dropdown. No permission to manage other users is required.
          </p>
          <p class="note">
            Protected native editing fields (text boxes, rich text, code editors) may remain light inside
            a dark interface. Theme changes never modify stored content or mark documents dirty.
          </p>
        </header>

        <section aria-labelledby="our-pa-audience-heading">
          <h3 id="our-pa-audience-heading">Audience palettes</h3>
          <p class="note">
            Each palette has light and dark modes. High contrast and the blue-and-amber colour-vision
            option are independent and combine with either mode.
          </p>
          <div class="presets" role="list">
            ${AUDIENCE_PRESETS.map((id) => this.presetCard(id, AUDIENCE_HUES[id]))}
          </div>
        </section>

        <section aria-labelledby="our-pa-other-heading">
          <h3 id="our-pa-other-heading">Other appearances</h3>
          <div class="presets" role="list">
            ${STUDIO_OTHER_PRESETS.map((id) => this.presetCard(id))}
          </div>
        </section>

        ${isAudiencePreset(this.draft.preset)
          ? html`
              <fieldset>
                <legend>Mode</legend>
                <div class="choices">
                  ${(['light', 'dark'] as const).map(
                    (mode) => html`
                      <label class="check">
                        <input
                          type="radio"
                          name="appearance-mode"
                          value=${mode}
                          .checked=${this.draft.appearanceMode === mode}
                          @change=${() => {
                            this.draft = { ...this.draft, appearanceMode: mode };
                          }}
                        />
                        ${mode === 'light' ? 'Light mode' : 'Dark mode'}
                      </label>
                    `,
                  )}
                </div>
              </fieldset>
            `
          : nothing}

        ${this.draft.preset === 'custom' && colors
          ? html`
              <fieldset class="custom">
                <legend>Custom theme (opaque hex only)</legend>
                <label>
                  Theme name
                  <input
                    type="text"
                    maxlength="60"
                    .value=${this.draft.customThemeName ?? ''}
                    @input=${(e: Event) => {
                      this.draft = {
                        ...this.draft,
                        customThemeName: (e.target as HTMLInputElement).value,
                      };
                    }}
                  />
                </label>
                ${this.colorField('Shell background', 'shellBackground', 'shellForeground')}
                ${this.colorField('Surface background', 'surfaceBackground', 'surfaceForeground')}
                ${this.colorField('Accent background', 'accentBackground', 'accentForeground')}
                ${this.colorField('Selected background', 'selectedBackground', 'selectedForeground')}
                <label>
                  Link
                  <input
                    type="text"
                    .value=${colors.link}
                    @input=${(e: Event) =>
                      this.updateCustomColor('link', (e.target as HTMLInputElement).value)}
                  />
                </label>
                <label>
                  Border
                  <input
                    type="text"
                    .value=${colors.border}
                    @input=${(e: Event) =>
                      this.updateCustomColor('border', (e.target as HTMLInputElement).value)}
                  />
                </label>
                <label>
                  Focus ring
                  <input
                    type="text"
                    .value=${colors.focusRing}
                    @input=${(e: Event) =>
                      this.updateCustomColor('focusRing', (e.target as HTMLInputElement).value)}
                  />
                </label>
              </fieldset>
            `
          : nothing}

        <fieldset>
          <legend>Font family</legend>
          <select
            .value=${this.draft.fontFamilyId ?? 'umbraco-default'}
            @change=${(e: Event) => {
              this.draft = {
                ...this.draft,
                fontFamilyId: (e.target as HTMLSelectElement).value,
              };
            }}
          >
            ${APPROVED_FONTS.map(
              (font) => html`<option value=${font.id}>${font.displayName}</option>`,
            )}
          </select>
        </fieldset>

        <fieldset>
          <legend>Accessibility options (independently combinable)</legend>
          <label class="check">
            <input
              type="checkbox"
              .checked=${this.draft.accessibility.highContrast}
              @change=${(e: Event) => {
                this.draft = {
                  ...this.draft,
                  accessibility: {
                    ...this.draft.accessibility,
                    highContrast: (e.target as HTMLInputElement).checked,
                  },
                };
              }}
            />
            High contrast (targets 7:1 for interface text)
          </label>
          <label class="check">
            <input
              type="checkbox"
              .checked=${this.draft.accessibility.colorVisionFriendly}
              @change=${(e: Event) => {
                this.draft = {
                  ...this.draft,
                  accessibility: {
                    ...this.draft.accessibility,
                    colorVisionFriendly: (e.target as HTMLInputElement).checked,
                  },
                };
              }}
            />
            Alternate blue-and-amber palette (does not rely on red/green distinction)
          </label>
          <label class="check">
            <input
              type="checkbox"
              .checked=${this.draft.accessibility.reducedMotion}
              @change=${(e: Event) => {
                this.draft = {
                  ...this.draft,
                  accessibility: {
                    ...this.draft.accessibility,
                    reducedMotion: (e.target as HTMLInputElement).checked,
                  },
                };
              }}
            />
            Reduced motion
          </label>
          <label class="check">
            <input
              type="checkbox"
              .checked=${this.draft.accessibility.enhancedFocus}
              @change=${(e: Event) => {
                this.draft = {
                  ...this.draft,
                  accessibility: {
                    ...this.draft.accessibility,
                    enhancedFocus: (e.target as HTMLInputElement).checked,
                  },
                };
              }}
            />
            Enhanced focus indicators
          </label>
        </fieldset>

        <section class="report" aria-live="polite">
          <h3>Contrast report</h3>
          ${validation.contrastReport.length === 0
            ? html`<p>No package color pairs to report for this preset.</p>`
            : html`
                <table>
                  <thead>
                    <tr>
                      <th>Pair</th>
                      <th>Ratio</th>
                      <th>Required</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${validation.contrastReport.map(
                      (item) => html`
                        <tr>
                          <td>${item.label}</td>
                          <td>${item.ratio}:1</td>
                          <td>${item.requiredRatio}:1</td>
                        <td>${item.passes ? '✓ Pass' : '! Fail'}</td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              `}
          ${validation.problems.length
            ? html`
                <ul class="problems">
                  ${validation.problems.map(
                    (problem) => html`
                      <li>
                        <strong>${problem.message}</strong>
                        ${problem.correctionOptions?.length
                          ? html`<div>Options: ${problem.correctionOptions.join(' · ')}</div>`
                          : nothing}
                      </li>
                    `,
                  )}
                </ul>
              `
            : nothing}
        </section>

        <section class="preview-box our-pa-shell-surface" aria-label="Contained preview">
          <div class="our-pa-shell-label">Shell label sample</div>
          <a href="#">Navigation link sample</a>
          <div class="our-pa-selected" aria-selected="true">Selected state sample</div>
          <div class="status-row" aria-label="Status samples. Colour is never the only signal.">
            <span class="status-chip danger"><span aria-hidden="true">!</span> Error</span>
            <span class="status-chip warning"><span aria-hidden="true">i</span> Warning</span>
            <span class="status-chip positive"><span aria-hidden="true">✓</span> Success</span>
          </div>
          <p class="note">Editors below stay native on purpose:</p>
          <label>
            Protected textbox
            <input type="text" value="Native editing surface" readonly />
          </label>
          <label>
            Protected textarea
            <textarea readonly>RTE / textarea interiors are not restyled.</textarea>
          </label>
        </section>

        <div class="actions our-pa-recovery">
          <button type="button" ?disabled=${this.busy} @click=${this.onPreview}>Preview</button>
          <button type="button" class="primary" ?disabled=${this.busy} @click=${this.onSave}>
            Save for me
          </button>
          <button type="button" ?disabled=${this.busy} @click=${this.onCancel}>Cancel</button>
          <button type="button" ?disabled=${this.busy} @click=${this.onReset}>
            Reset to Umbraco default
          </button>
        </div>

        ${this.statusMessage
          ? html`<p class="status" role="status"><strong>✓ Success:</strong> ${this.statusMessage}</p>`
          : nothing}
        ${this.errorMessage
          ? html`<p class="error" role="alert"><strong>! Error:</strong> ${this.errorMessage}</p>`
          : nothing}
      </section>
    `;
  }

  private presetCard(id: AppearancePresetId, hues?: string[]) {
    const preset = PRESETS[id];
    return html`
      <button
        type="button"
        class="preset-card ${this.draft.preset === id ? 'selected our-pa-selected' : ''}"
        role="listitem"
        aria-pressed=${this.draft.preset === id}
        @click=${() => this.selectPreset(id)}
      >
        <span class="swatch" style=${this.swatchStyle(id)}></span>
        <strong>${preset.displayName}</strong>
        ${hues
          ? html`
              <span class="hues" aria-label=${`Hues: ${hues.join(', ')}`}>
                ${hues.map((hue) => html`<span class="hue-label">${hue}</span>`)}
              </span>
            `
          : nothing}
        <span>${preset.description}</span>
      </button>
    `;
  }

  private colorField(
    label: string,
    bgKey: keyof CustomAppearanceColors,
    fgKey: keyof CustomAppearanceColors,
  ) {
    const colors = this.draft.customColors!;
    return html`
      <div class="color-row">
        <label>
          ${label}
          <input
            type="text"
            .value=${colors[bgKey]}
            @input=${(e: Event) => this.updateCustomColor(bgKey, (e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          Foreground
          <input
            type="text"
            .value=${colors[fgKey]}
            @input=${(e: Event) => this.updateCustomColor(fgKey, (e.target as HTMLInputElement).value)}
          />
        </label>
        <button type="button" class="our-pa-recovery" @click=${() => this.autoFixForeground(bgKey, fgKey)}>
          Auto foreground
        </button>
      </div>
    `;
  }

  private swatchStyle(preset: AppearancePresetId): string {
    const colors = resolveColors(
      preset,
      undefined,
      this.draft.appearanceMode === 'dark',
      this.draft.appearanceMode,
    );
    return `background: linear-gradient(90deg, ${colors.shellBackground} 50%, ${colors.accentBackground} 50%);`;
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--our-pa-font-family, inherit);
      color: var(--our-pa-shell-fg, inherit);
    }
    .panel {
      display: grid;
      gap: 1.25rem;
      padding: 1rem;
      border: 1px solid var(--our-pa-border, #6e6e6e);
      background: var(--our-pa-surface-bg, transparent);
    }
    .lede,
    .note {
      max-width: 68ch;
      line-height: 1.45;
    }
    .note {
      opacity: 0.9;
      font-size: 0.95rem;
    }
    .presets {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
    }
    .preset-card {
      display: grid;
      gap: 0.35rem;
      text-align: left;
      padding: 0.75rem;
      border: 1px solid var(--our-pa-border, #6e6e6e);
      background: var(--our-pa-shell-bg, transparent);
      color: inherit;
      cursor: pointer;
    }
    .preset-card.selected {
      outline: 2px solid var(--our-pa-focus-ring, #0b57d0);
    }
    .swatch {
      height: 28px;
      border: 1px solid var(--our-pa-border, #6e6e6e);
    }
    .hues {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .hue-label {
      font-size: 0.75rem;
      border: 1px solid var(--our-pa-color-border, #6e6e6e);
      padding: 0.1rem 0.35rem;
    }
    .status-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--our-pa-color-border, #6e6e6e);
    }
    .status-chip.danger {
      background: var(--our-pa-color-status-danger-background, #c60239);
      color: var(--our-pa-color-status-danger-text, #fff);
    }
    .status-chip.warning {
      background: var(--our-pa-color-status-warning-background, #ffd621);
      color: var(--our-pa-color-status-warning-text, #000);
    }
    .status-chip.positive {
      background: var(--our-pa-color-status-positive-background, #0d8844);
      color: var(--our-pa-color-status-positive-text, #fff);
    }
    fieldset {
      border: 1px solid var(--our-pa-border, #6e6e6e);
      padding: 0.75rem;
      display: grid;
      gap: 0.5rem;
    }
    label {
      display: grid;
      gap: 0.25rem;
    }
    label.check {
      grid-template-columns: auto 1fr;
      align-items: start;
      gap: 0.5rem;
    }
    .choices {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    input[type='text'],
    textarea,
    select {
      /* Protected editing interiors — leave native presentation */
      font: inherit;
    }
    .color-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 0.5rem;
      align-items: end;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      border-bottom: 1px solid var(--our-pa-border, #6e6e6e);
      text-align: left;
      padding: 0.35rem 0.25rem;
    }
    .preview-box {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border: 1px dashed var(--our-pa-border, #6e6e6e);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    button {
      font: inherit;
      padding: 0.45rem 0.8rem;
      cursor: pointer;
    }
    button.primary {
      background: var(--our-pa-accent-bg, #1b6ec2);
      color: var(--our-pa-accent-fg, #fff);
      border: 1px solid var(--our-pa-border, #6e6e6e);
    }
    .status {
      color: var(--our-pa-status-positive-fg, inherit);
      background: var(--our-pa-status-positive-bg, transparent);
      padding: 0.65rem;
    }
    .error {
      color: var(--our-pa-status-danger-fg, #ffffff);
      background: var(--our-pa-status-danger-bg, #b00020);
      padding: 0.65rem;
    }
    .problems {
      color: var(--our-pa-surface-fg, inherit);
    }
    @media (max-width: 720px) {
      .color-row {
        grid-template-columns: 1fr;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'our-pa-appearance-profile-app': OurPaAppearanceProfileAppElement;
  }
}
