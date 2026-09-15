/**
 * Capability probes for Umbraco 17 / 18 backoffice surfaces.
 * Intended compatibility ≠ tested compatibility — see docs/CAPABILITY-MATRIX.md.
 */
export class VersionAdapter {
  static isSupported(): boolean {
    const meta = document.querySelector('meta[name="umbraco-version"]')?.getAttribute('content');
    if (meta?.startsWith('17.') || meta?.startsWith('18.')) return true;
    return Boolean(customElements.get('umb-app') || document.querySelector('umb-backoffice') || document.body);
  }
}
