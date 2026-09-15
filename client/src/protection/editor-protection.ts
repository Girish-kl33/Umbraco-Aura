/**
 * Editor protection policy.
 * Never rewrite private Shadow DOM, never monkey-patch components,
 * never use persistent MutationObservers for styling, never apply page filters.
 */
export const PROTECTED_EDITOR_SELECTORS = [
  'textarea',
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])',
  '[contenteditable="true"]',
  'umb-input',
  'umb-input-text',
  'umb-code-editor',
  'umb-rte',
  '.cm-editor',
  '.tox-tinymce',
  '.tox-toolbar',
  '.umb-preview',
  'iframe',
] as const;
