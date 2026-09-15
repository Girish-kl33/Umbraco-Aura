# Schema & API contracts

## Preference JSON (schemaVersion = 1)

```json
{
  "schemaVersion": 1,
  "concurrencyToken": "32hex",
  "updatedAtUtc": "2026-09-14T00:00:00Z",
  "preset": "dark",
  "customColors": {
    "shellBackground": "#1b1b1b",
    "shellForeground": "#f5f5f5",
    "surfaceBackground": "#2a2a2a",
    "surfaceForeground": "#f5f5f5",
    "accentBackground": "#4ea1ff",
    "accentForeground": "#041018",
    "link": "#8ec7ff",
    "border": "#8a8a8a",
    "focusRing": "#ffe066",
    "selectedBackground": "#1b6ec2",
    "selectedForeground": "#ffffff",
    "hoverBackground": "#3a3a3a",
    "activeBackground": "#454545"
  },
  "fontFamilyId": "system-ui",
  "fontSizeId": "normal",
  "accessibility": {
    "colorVisionFriendly": false,
    "reducedMotion": false,
    "enhancedFocus": false
  }
}
```

### Preset enum (camelCase wire format)

`none` | `light` | `dark` | `dim` | `warmComfort` | `highContrast` | `followSystem` | `custom`

`none` means no preference / native Umbraco appearance.

### Font size

`low` | `normal` | `large` — one-line steps from Umbraco's 14px default (12 / 14 / 18). Applies to menus, fields, and messages. Omitted values are `normal`.

### Accepted color format

- Opaque hex only: `#RGB` or `#RRGGBB`
- Rejected: alpha hex, named colors, `rgb()`, `hsl()`, gradients, `url()`, `var()`, `calc()`, JS

### Accepted fonts

Approved IDs only (see `ApprovedFontCatalog` / client `APPROVED_FONTS`).

## HTTP API

Base: `/umbraco/management/api/v1/our-personal-appearance`  
Auth: backoffice authenticated user  
OpenAPI document name: `our-personal-appearance`

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/preference` | Returns `{ hasPreference, preference }` for **current user** |
| PUT | `/preference` | Validates + upserts current user preference atomically |
| DELETE | `/preference` | Deletes preference; client must clear overrides |

### PUT semantics

1. Resolve `UserKey` from server auth (ignore any client user id — none is accepted)
2. Validate payload (format + contrast)
3. If invalid → **400** with `problems` + `contrastReport` (not saved)
4. If `concurrencyToken` mismatches existing → **409** with current preference
5. Else write new `concurrencyToken` + `updatedAtUtc` and persist

### DELETE / reset semantics

Removes the user-data row. Equivalent to native Umbraco appearance with zero package overrides.

## Contrast rules

| Pair type | Minimum |
|-----------|---------|
| Configurable interface text | 4.5:1 |
| Meaningful non-text (borders/focus) | 3:1 |
| High Contrast normal interface text target | 7:1 |

Formula: WCAG 2 relative luminance — `(L1 + 0.05) / (L2 + 0.05)`.

## Preview vs save

| Action | Persistence | Scope |
|--------|-------------|-------|
| Preview | None | Current tab only |
| Save for me | Server | Current user |
| Cancel | None | Reverts tab to last saved |
| Reset | Deletes server preference | Current user |
