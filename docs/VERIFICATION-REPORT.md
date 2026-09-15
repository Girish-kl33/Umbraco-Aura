# Verification report

Date: 2026-09-14  
Package version: 0.1.0  
Explicitly targeted releases: **Umbraco 17.6.2** and **Umbraco 18.1.1**

## Distinction

| Kind | Meaning |
|------|---------|
| **Intended compatibility** | Designed and packaged for the listed majors |
| **Tested compatibility** | Evidence collected in this repository run |

This report does **not** claim full host-verified compatibility from a NuGet range alone.

## Compiled

| Artifact | Result |
|----------|--------|
| `Our.Umbraco.PersonalAppearance.Core` (net10.0) | Succeeded |
| `Our.Umbraco.PersonalAppearance.v17` against Umbraco packages 17.6.2 | Succeeded |
| `Our.Umbraco.PersonalAppearance.v17` against Umbraco packages 17.4.2 (declared floor) | Succeeded |
| `umbraco17test` host solution with v17 project reference (alternate unlocked output) | Succeeded |
| `Our.Umbraco.PersonalAppearance.v18` against Umbraco packages 18.1.1 | Succeeded |
| Client bundle `our-personal-appearance.js` (Vite/Lit) | Succeeded (copied into both package `wwwroot` folders) |

## Executed automated tests

| Suite | Result |
|-------|--------|
| `client` Vitest (`tests/contrast-and-protection.spec.ts`) | **9 passed** |
| `client` Vitest (`tests/native-theme.spec.ts`) | **40 passed** |
| `Our.Umbraco.PersonalAppearance.Core.Tests` (xUnit) | **8 passed** |

Covered by automation:

- WCAG relative-luminance contrast (not RGB averages)
- High Contrast 7:1 text target
- Invalid / low-contrast custom colors rejected
- Forbidden CSS/URL/gradient payloads rejected
- Unapproved fonts rejected
- Compiled CSS avoids global `filter` and does not assign colors to protected editor interiors
- Protected selector policy inventory
- Every shipped palette clears its text target on all five text pairs, and 3:1 for borders
- Derived `--uui-color-*` tokens (`text-alt`, `interactive`, status `-standalone`) clear their targets
- Native theme CSS targets `:root` only, never `::part`/`>>>`, and re-pins native values on editor hosts
- Every theme manifest resolves `css` to a module-like object (regression guard, see below)

## Theme application defect found and fixed

Package themes appeared in the native dropdown but selecting them changed nothing. Two
independent causes, both now covered by tests:

1. **Loader contract.** Umbraco's `loadManifestPlainCss` accepts a raw string or a *module-like
   object* exposing `css`/`default`. An async `css` function returning a bare string is silently
   discarded. Payloads are now wrapped as `{ default: css }`.
2. **Wrong styling hook.** The CSS styled elements such as `umb-backoffice-header` from outside.
   That chrome renders inside shadow roots, so those rules could never match. Umbraco's own
   `dark.theme.css` recolours purely by declaring `--uui-color-*` on `:root`, because custom
   properties inherit across shadow boundaries. The compiler now emits that token set instead.

## Feasibility prototype (design + in-repo implementation)

| Gate | Status |
|------|--------|
| Native Theme dropdown extensions + Appearance Studio section | Implemented |
| Personal preference storage (`IUserDataService` behind interface) | Implemented |
| Themed shell region + label tokens | Implemented via `--uui-color-*` on `:root` |
| Textbox/RTE left native (policy + CSS) | Implemented; host computed-style capture **not executed** in this run |
| Dual-major OpenAPI adapters | Implemented (17 Management pipeline vs 18 `AddBackOfficeOpenApiDocument`) |

The original profile-app UI has since been replaced by native `theme` dropdown extensions
and a dedicated **Appearance Studio** section. Live browser verification remains pending
until the currently running IIS Express host is restarted with the rebuilt package.

Editor interiors are kept native by re-declaring Umbraco's light-theme values for
`--uui-color-surface` / `--uui-color-text` on the editor host elements (`uui-input`,
`uui-textarea`, `umb-input-tiptap`, `umb-property-editor-ui-tiptap`, `umb-code-block`,
`umb-code-editor`). Re-declaring a custom property on a host inherits it into that host's
shadow root, so nothing inside is selected or rewritten. The visible consequence is
intentional and documented: **textbox interiors and rich-text content stay light inside a
dark interface.**

## Not executed in this environment

| Item | Status |
|------|--------|
| Live Umbraco 17 host smoke | In progress — package wired into `umbraco17test` (Umbraco 17.4.2) via project reference; restore + compile succeeded, backoffice run pending |
| Live Umbraco 18.1.1 host smoke | Not executed |
| Multi-user isolation against running DB | Not executed (store always uses authenticated `UserKey`; awaiting host) |
| Invalid API payloads against running Management API | Not executed (validator covered unit-side) |
| Protected-editor computed styles in real backoffice | Not executed |
| Content integrity / dirty-state on document workspace | Not executed |
| Keyboard/focus/zoom/text-spacing manual a11y pass | Not executed |
| Visual regression screenshots | Not executed |
| 17→18 upgrade rehearsal on a real site | Not executed |

## Editor protection stance

Editor protection was **not** weakened to increase styling coverage. Surfaces without safe public hooks remain native and are documented in `LIMITATIONS.md`.

## Intended vs tested summary

| Target | Intended | Tested in this run |
|--------|----------|--------------------|
| Umbraco 17.6.2 package compile | Yes | Yes (compile) |
| Umbraco 18.1.1 package compile | Yes | Yes (compile) |
| Contrast / validation / token policy | Yes | Yes (unit/client tests) |
| End-to-end backoffice UX on 17 & 18 | Yes | **No — pending example hosts** |
