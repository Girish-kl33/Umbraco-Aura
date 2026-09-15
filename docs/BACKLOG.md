# Prioritized backlog

## P0 — Feasibility prototype (complete in this repo)

1. Profile entry (`Appearance & Accessibility`)
2. Personal preference storage interface + `IUserDataService` implementation
3. Themed shell region + label via semantic tokens
4. Protected textbox/RTE left native
5. Dual-major package split (17 / 18) with OpenAPI adapters

## P1 — First release product surface

1. Preset cards: Light, Dark, Dim, Warm Comfort, High Contrast, Follow System, Custom
2. Custom color controls + auto foreground + contrast report
3. Approved font selection
4. Independent accessibility toggles
5. Preview / Save for me / Cancel / Reset
6. Server-side validation mirroring client rules
7. Concurrency token + schema version
8. Installation / upgrade / recovery docs

## P2 — Hardening

1. Example host apps for 17.6.2 and 18.1.1 with scripted smoke tests
2. Multi-user isolation integration tests
3. Invalid API payload contract tests against running Management API
4. Playwright visual regression for shell vs protected editors
5. Keyboard / focus / zoom / text-spacing checks
6. 17 → 18 upgrade rehearsal (preference JSON round-trip)

## P3 — Enhancements (explicitly out of first release unless pulled forward)

1. Additional approved fonts (still catalog-only)
2. Per-section intensity controls
3. Admin-readable analytics (counts only — never other users’ palettes without consent/policy)
4. Optional custom table if user-data store becomes a bottleneck

## Explicit non-backlog

- Medical claims / diagnosis features
- Uploaded fonts
- Arbitrary CSS/JS injection
- Styling website output or content previews
- Weakening editor protection to increase coverage
