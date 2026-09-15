# Architecture decisions

## ADR-001 — Separate packages per Umbraco major

**Decision:** Ship `Our.Umbraco.PersonalAppearance.v17` and `.v18` that share Core + Shared sources.

**Why:** Umbraco 18 replaces Swashbuckle-era OpenAPI registration with `AddBackOfficeOpenApiDocument` / Microsoft.AspNetCore.OpenApi. A single NuGet version range cannot honestly claim cross-major compatibility.

## ADR-002 — Persist via `IUserDataService`, not a custom table

**Decision:** Evaluate and use Umbraco-native user-data persistence behind `IAppearancePreferenceStore`.

**Why:** Preferences are personal key/value JSON. Native user-data already scopes by `UserKey` + `Group` + `Identifier` without modifying the core user schema. Custom tables remain a future option if querying/reporting requirements outgrow this store.

**Keys:**
- Group: `Our.Umbraco.PersonalAppearance`
- Identifier: `appearance-preference`

## ADR-003 — Ownership always from authenticated server user

**Decision:** GET/PUT/DELETE operate on the current backoffice user only. Controllers never accept a target user id.

**Why:** Preference management must not require “manage users” permission and must not allow cross-user writes.

## ADR-004 — Semantic tokens on verified shell surfaces only

**Decision:** Compile preferences to CSS custom properties and apply them to documented shell selectors. Do not use global page filters, broad inherited font/color cascades, private Shadow DOM rewriting, component monkey-patching, or persistent DOM-scanning observers.

**Why:** Protect editing integrity and content cleanliness. Prefer leaving components native when public styling hooks are unavailable.

## ADR-005 — Native theme context is complementary, not sufficient

**Decision:** Do not assume `UMB_THEME_CONTEXT` / `umb-dark-theme` satisfies editor isolation.

**Why:** Core themes can still affect broader surfaces. This package keeps an explicit editor-protection policy and its own token application path.

## ADR-006 — Invalid drafts stay local

**Decision:** Client preview/save and server PUT re-validate. Invalid values may remain in the draft UI but must not affect the live shell and must not be persisted.

## ADR-007 — Versioned preference JSON + optimistic concurrency

**Decision:** `schemaVersion` + `concurrencyToken`. PUT with a stale token returns 409. DELETE removes the row (native Umbraco appearance).

## ADR-008 — Apply only after identity is established

**Decision:** Runtime clears overrides until authenticated GET succeeds. Cancel in-flight requests and remove overrides on logout, session change, reset, unsupported version, or failure.

## ADR-009 — Extend Umbraco's native Theme dropdown

**Decision:** Presets are public `theme` manifests. The current user's validated custom
theme is registered dynamically after authenticated preference loading. Umbraco's public
ThemeContext owns activation and stylesheet removal; package code observes selections to
persist them for the current user.

## ADR-010 — Dedicated Appearance Studio section

**Decision:** Palette authoring is a top-level `section` + `sectionView`, rather than a
second theme control in the profile panel. Section access is configured through normal
Umbraco user-group section access and does not grant permission to manage other users.

## Layer map

| Layer | Location |
|-------|----------|
| Profile UI | `client/src/profile` |
| Appearance context / runtime | `client/src/context` |
| Preset registry | Core + `client/src/presets` |
| Semantic-token compiler | Core + `client/src/tokens` |
| Contrast engine | Core + `client/src/contrast` |
| Version adapters | `client/src/adapters` + package OpenAPI partials |
| Editor protection | `client/src/protection` + token CSS policy |
| Management API | `Shared/Controllers` |
| Persistence | `Shared/Services/UserDataAppearancePreferenceStore` |
| Tests | `tests/` + `client/tests/` |
