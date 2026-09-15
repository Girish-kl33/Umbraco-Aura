/** Minimal ambient types so the package builds without full Umbraco backoffice packages installed. */

export type UmbControllerHost = object;

export interface UmbExtensionRegistry {
  // `any` keeps this structural adapter compatible with Umbraco 17/18's generic registry.
  // Manifests are still authored as typed objects in manifests.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: (manifest: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerMany?: (manifests: any[]) => void;
  unregister?: (alias: string) => void;
}

export type UmbEntryPointOnInit = (
  host: UmbControllerHost,
  extensionRegistry: UmbExtensionRegistry,
) => void;

declare global {
  interface Window {
    __OUR_PA_RUNTIME__?: unknown;
  }
}

export {};
