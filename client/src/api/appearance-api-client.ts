import type { AppearancePreferenceDocument, AppearancePreferenceResponse } from '../models';

const API_BASE = '/umbraco/management/api/v1/our-personal-appearance';

export class AppearanceApiClient {
  private abort?: AbortController;

  cancel(): void {
    this.abort?.abort();
    this.abort = undefined;
  }

  private nextSignal(): AbortSignal {
    this.cancel();
    this.abort = new AbortController();
    return this.abort.signal;
  }

  async getPreference(): Promise<AppearancePreferenceResponse> {
    const response = await fetch(`${API_BASE}/preference`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      signal: this.nextSignal(),
    });
    if (response.status === 401) throw new Error('unauthorized');
    if (!response.ok) throw new Error(`get_failed:${response.status}`);
    return (await response.json()) as AppearancePreferenceResponse;
  }

  async putPreference(document: AppearancePreferenceDocument): Promise<AppearancePreferenceDocument> {
    const response = await fetch(`${API_BASE}/preference`, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(document),
      signal: this.nextSignal(),
    });

    if (response.status === 401) throw new Error('unauthorized');
    if (response.status === 409) {
      const problem = await response.json();
      throw Object.assign(new Error('concurrency_conflict'), { problem });
    }
    if (!response.ok) {
      const problem = await response.json().catch(() => null);
      throw Object.assign(new Error('validation_failed'), { problem, status: response.status });
    }
    return (await response.json()) as AppearancePreferenceDocument;
  }

  async deletePreference(): Promise<void> {
    const response = await fetch(`${API_BASE}/preference`, {
      method: 'DELETE',
      credentials: 'same-origin',
      signal: this.nextSignal(),
    });
    if (response.status === 401) throw new Error('unauthorized');
    if (!response.ok && response.status !== 204) {
      throw new Error(`delete_failed:${response.status}`);
    }
  }
}
