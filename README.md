# Personal Backoffice Appearance

Personal, server-persisted **Appearance & Accessibility** preferences for Umbraco backoffice users (17 and 18).

## What this package does

- Extends Umbraco's native **Theme** dropdown with Follow System, Standard Light/Dark,
  Kids Light/Dark, Teens Light/Dark, Dimmed, Eye Comfort, Black & White,
  Colour Vision Support, High Contrast, and a personal custom theme
- Adds a top-level **Appearance Studio** section for building and validating a custom palette
- Persists preferences with Umbraco's native `IUserDataService` (no core user-schema changes, no custom table in v1)
- Themes verified shell surfaces (navigation, labels, headings, helper text, external borders)
- Leaves protected editors native (textboxes, RTE, code editors, previews, media, website output)
- Validates colors with the **WCAG relative-luminance** contrast formula
- Ships **separate NuGet packages per major** — do not treat a single version range as cross-major proof

## Tested compatibility (explicit)

| Target | Package | Status |
|--------|---------|--------|
| Umbraco **17.6.2** | `Our.Umbraco.PersonalAppearance.v17` | Intended + unit/client tests executed in this repo |
| Umbraco **18.1.1** | `Our.Umbraco.PersonalAppearance.v18` | Intended + unit/client tests executed in this repo |

Full host integration (login, multi-user isolation, visual regression) requires the example hosts under `hosts/` — see [docs/VERIFICATION-REPORT.md](docs/VERIFICATION-REPORT.md).

## Quick start

```bash
# Client
cd client && npm install && npm run build && npm test

# .NET
dotnet test PersonalBackofficeAppearance.sln
dotnet build src/Our.Umbraco.PersonalAppearance.v17
dotnet build src/Our.Umbraco.PersonalAppearance.v18
```

Install the package matching your Umbraco major into a site. Use the existing Theme
dropdown to select a mode, or open **Appearance** in the top navigation to build a
personal custom theme.

## Documentation

- [Architecture decisions](docs/ARCHITECTURE.md)
- [Support / capability matrix](docs/CAPABILITY-MATRIX.md)
- [Prioritized backlog](docs/BACKLOG.md)
- [Schema & API contracts](docs/API-CONTRACTS.md)
- [Installation / upgrade / recovery](docs/INSTALLATION.md)
- [Known limitations](docs/LIMITATIONS.md)
- [Verification report](docs/VERIFICATION-REPORT.md)

## Non-goals / claims we do not make

- No personality or medical-condition inference
- No medical eye-protection claims
- No universal color-blindness-correction claims
- Native Dark theme alone is **not** treated as editor isolation
