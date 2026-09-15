import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AppearanceRuntime } from '../context/appearance-runtime';
import { FONT_SIZE_OPTIONS, type AppearanceFontSizeId } from '../presets/font-size';

@customElement('our-pa-font-size-user-profile-app')
export class OurPaFontSizeUserProfileAppElement extends LitElement {
  @state() private fontSizeId: AppearanceFontSizeId = 'normal';
  @state() private busy = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.fontSizeId = AppearanceRuntime.get()?.getSaved().fontSizeId ?? 'normal';
  }

  private async onSelect(id: AppearanceFontSizeId): Promise<void> {
    if (this.busy || this.fontSizeId === id) return;
    this.busy = true;
    this.fontSizeId = id;
    try {
      await AppearanceRuntime.get()?.setFontSize(id);
    } finally {
      this.busy = false;
    }
  }

  render() {
    return html`
      <uui-box headline="Font size">
        <div class="row" role="radiogroup" aria-label="Font size">
          ${FONT_SIZE_OPTIONS.map(
            (option) => html`
              <uui-button
                type="button"
                look=${this.fontSizeId === option.id ? 'primary' : 'outline'}
                label=${option.displayName}
                compact
                role="radio"
                aria-checked=${this.fontSizeId === option.id}
                ?disabled=${this.busy}
                @click=${() => this.onSelect(option.id)}
              >
                ${option.displayName}
              </uui-button>
            `,
          )}
        </div>
      </uui-box>
    `;
  }

  static styles = css`
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    uui-button {
      flex: 1 1 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'our-pa-font-size-user-profile-app': OurPaFontSizeUserProfileAppElement;
  }
}
