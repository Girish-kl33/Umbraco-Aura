import type { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { AppearanceRuntime } from './context/appearance-runtime';
import { registerManifests } from './manifests';

export const onInit: UmbEntryPointOnInit = (host, extensionRegistry) => {
  registerManifests(extensionRegistry);
  AppearanceRuntime.start(host, extensionRegistry);
};

export const onUnload = () => {
  AppearanceRuntime.stop();
};
