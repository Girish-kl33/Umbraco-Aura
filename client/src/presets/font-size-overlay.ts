/**
 * Applies Low/Normal/Large type size across Umbraco chrome and property editors.
 *
 * `--our-pa-type-size` inherits into shadow roots, but hosts often hardcode 14px.
 * A shared constructable sheet is adopted onto open shadows so `:host` and `.uui-text`
 * follow that token. No page zoom (that clipped header apps).
 */

let typeSheet: CSSStyleSheet | null = null;
let observer: MutationObserver | null = null;

function typeSizeSheet(): CSSStyleSheet {
  if (!typeSheet) {
    typeSheet = new CSSStyleSheet();
    typeSheet.replaceSync(`
:host {
  font-size: var(--our-pa-type-size) !important;
}
.uui-text,
.uui-h5,
.uui-p {
  font-size: var(--our-pa-type-size) !important;
  line-height: 1.45;
}
.uui-small,
.uui-text small {
  font-size: var(--uui-type-small-size, var(--our-pa-type-size)) !important;
}
`);
  }
  return typeSheet;
}

function adopt(root: ShadowRoot, enable: boolean): void {
  const next = typeSizeSheet();
  const current = root.adoptedStyleSheets ?? [];
  const has = current.includes(next);
  if (enable && !has) {
    root.adoptedStyleSheets = [...current, next];
  } else if (!enable && has) {
    root.adoptedStyleSheets = current.filter((item) => item !== next);
  }
}

function visit(root: ParentNode, enable: boolean): void {
  if (root instanceof ShadowRoot) {
    adopt(root, enable);
    if (enable && observer) {
      observer.observe(root, { childList: true, subtree: true });
    }
  }
  const elements = root.querySelectorAll('*');
  for (const node of elements) {
    if (node.shadowRoot) visit(node.shadowRoot, enable);
  }
}

function ensureObserver(): MutationObserver {
  if (observer) return observer;
  observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.shadowRoot) visit(node.shadowRoot, true);
        visit(node, true);
      }
    }
  });
  return observer;
}

export function applyFontSizeOverlay(px: string | null): void {
  if (!px) {
    observer?.disconnect();
    observer = null;
    visit(document, false);
    document.documentElement.style.removeProperty('--our-pa-type-size');
    return;
  }

  document.documentElement.style.setProperty('--our-pa-type-size', px);
  ensureObserver();
  observer?.observe(document.documentElement, { childList: true, subtree: true });
  visit(document, true);
  const app = document.querySelector('umb-app');
  if (app?.shadowRoot) {
    observer?.observe(app.shadowRoot, { childList: true, subtree: true });
  }
  requestAnimationFrame(() => visit(document, true));
  window.setTimeout(() => visit(document, true), 300);
}
