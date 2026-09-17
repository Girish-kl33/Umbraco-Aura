# Installation, upgrade, and recovery

## Install (Umbraco 17)

```bash
dotnet add package Umbraco.Aura.v17 --version 0.1.1-umbraco17
```

Or project reference the `src/Our.Umbraco.PersonalAppearance.v17` project from a 17.x site.

The v17 package declares **17.4.2** as its minimum Umbraco version. NuGet resolves to the highest version in the graph, so a site on 17.4.x or 17.6.x both work.

Build client assets first:

```bash
cd client && npm ci && npm run build
```

Restart the site, log in, open the user profile → **Appearance & Accessibility**.

## Install (Umbraco 18)

```bash
dotnet add package Umbraco.Aura.v18 --version 0.1.1-umbraco18
```

Umbraco 18 registers a dedicated OpenAPI document via `AddBackOfficeOpenApiDocument("our-personal-appearance")`.

## Upgrade 17 → 18

1. Remove `Umbraco.Aura.v17`
2. Add `Umbraco.Aura.v18`
3. Preference JSON in `IUserDataService` is major-agnostic (`schemaVersion: 1`) and should round-trip unchanged
4. Re-verify OpenAPI UI lists **Umbraco Aura API**
5. Confirm protected editors remain native under Dark / Custom

Do **not** rely on a single floating NuGet range spanning 17–18.

## Recovery

| Symptom | Action |
|---------|--------|
| Unusable custom palette | Use **Reset to Umbraco default** (recovery controls stay outside custom palette dependency) |
| Stuck preview | **Cancel** (tab-local only) or reload |
| API failures / unsupported version | Runtime clears overrides automatically |
| Manual DB recovery | Delete user-data rows where `Group = Our.Umbraco.PersonalAppearance` and `Identifier = appearance-preference` for the affected user |

## Security notes

- Endpoints require backoffice authentication
- Server resolves ownership from the authenticated user
- Arbitrary CSS/JS/URLs/gradients/uploaded fonts are rejected client-side and server-side
