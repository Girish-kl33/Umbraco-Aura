# Shipped palettes and measured contrast

Every ratio below is computed with the WCAG relative-luminance formula by
`client/tests/native-theme.spec.ts`, which fails the build if any pair drops below its target.
Regenerate with `npx vitest run tests/native-theme.spec.ts` from `client/`.

Targets: **4.5:1** for interface text, **7:1** for High Contrast, **3:1** for borders and other
meaningful non-text indicators.

## Dropdown entries

| Dropdown name | Preset id | Polarity | Source |
|---|---|---|---|
| Light | `light` | light | Umbraco's own `umb-light-theme` |
| Dark (Experimental) | `dark` | dark | Umbraco's own `umb-dark-theme` |
| High contrast (Experimental) | — | light | Umbraco's own `umb-high-contrast-theme` |
| Follow System | `followSystem` | both | this package |
| Standard Light / Standard Dark | `adults` | both | this package |
| Kids Light / Kids Dark | `kids` | both | this package |
| Teens Light / Teens Dark | `teenagers` | both | this package |
| Dimmed | `dim` | dark | this package |
| Eye Comfort | `warmComfort` | dark | this package |
| Black & White | `blackAndWhite` | light | this package |
| Colour Vision Support | `colorVisionFriendly` | light | this package |
| High Contrast | `highContrast` | dark | this package |
| *user's theme name* | `custom` | either | Appearance Studio |

`light` and `dark` map onto Umbraco's built-in themes deliberately: where Umbraco already ships an
equivalent, the package adds no overrides of its own.

## Measured ratios

### Dimmed — glare-reduced neutral dark
Cool grey-blue, the safest general-purpose dark option. Desaturated surfaces avoid the
"vibrating" look that saturated dark themes get at low luminance.

| Pair | Colours | Ratio |
|---|---|---|
| Shell text on chrome | `#e8edf3` on `#1b2027` | 13.91:1 |
| Panel text on surface | `#e8edf3` on `#22272e` | 12.76:1 |
| Accent button label | `#ffffff` on `#3b74d1` | 4.56:1 |
| Selected item label | `#ffffff` on `#2d4f80` | 8.26:1 |
| Link on surface | `#7cb2f5` on `#22272e` | 6.83:1 |
| Border | `#6e7887` on `#22272e` | 3.36:1 |

### Eye Comfort (Warm) — low-blue warm dark
Amber-shifted neutrals for users who prefer less blue in the evening. **Not** a medical
eye-protection claim and not a blue-light filter; it is a colour preference.

| Pair | Colours | Ratio |
|---|---|---|
| Shell text on chrome | `#f5ead6` on `#1f1a14` | 14.49:1 |
| Panel text on surface | `#f5ead6` on `#2a231b` | 13.01:1 |
| Accent button label | `#ffffff` on `#a9662a` | 4.54:1 |
| Selected item label | `#fff7ea` on `#6b4a24` | 7.51:1 |
| Link on surface | `#f0b968` on `#2a231b` | 8.74:1 |
| Border | `#7d6b52` on `#2a231b` | 3.02:1 |

### Colour Vision Support — blue/orange signalling
Accent and focus colours come from the **Okabe-Ito** palette, which is designed to stay
distinguishable without relying on red-green discrimination. Focus uses vermillion `#d55e00`
against blue `#0072b2` so the two never collapse together under protanopia or deuteranopia.
This is a colour *choice*, **not** a colour-blindness correction.

| Pair | Colours | Ratio |
|---|---|---|
| Shell text on chrome | `#ffffff` on `#004c73` | 9.21:1 |
| Panel text on surface | `#16191d` on `#ffffff` | 17.63:1 |
| Accent button label | `#ffffff` on `#0072b2` | 5.19:1 |
| Selected item label | `#003350` on `#cde6f5` | 10.21:1 |
| Link on surface | `#005b8f` on `#ffffff` | 7.26:1 |
| Border | `#5b6773` on `#ffffff` | 5.78:1 |

### High Contrast — 7:1 target, enhanced focus on
Maximum separation. Enables the enhanced focus ring by default. Regions are split with
dark-white rules (`#c8c8c8`): header and section tabs, sidebar, cards, and dialogs.

| Pair | Colours | Ratio |
|---|---|---|
| Shell text on chrome | `#ffffff` on `#000000` | 21.00:1 |
| Panel text on surface | `#ffffff` on `#1a1a1a` | 17.40:1 |
| Accent button label | `#000000` on `#ffff00` | 19.56:1 |
| Selected item label | `#000000` on `#ffffff` | 21.00:1 |
| Link on surface | `#66ffff` on `#1a1a1a` | 14.35:1 |
| Border | `#c8c8c8` on `#1a1a1a` | 10.40:1 |

Selection inverts to white rather than reusing the yellow accent. Umbraco paints the "current"
colour behind whole navigation rows, and a full-width yellow row was both garish and
indistinguishable from a focused control.

### Black & White — fully desaturated light
Zero saturation in the chrome: black header, white panels, grey steps for hierarchy.

| Pair | Colours | Ratio |
|---|---|---|
| Shell text on chrome | `#ffffff` on `#1a1a1a` | 17.40:1 |
| Panel text on surface | `#141414` on `#ffffff` | 18.42:1 |
| Accent button label | `#ffffff` on `#1a1a1a` | 17.40:1 |
| Selected item label | `#141414` on `#d4d4d4` | 12.43:1 |
| Link on surface | `#3d3d3d` on `#ffffff` | 10.86:1 |
| Border | `#5c5c5c` on `#ffffff` | 6.69:1 |

### Audience families

Each family is a visual style only. Light and dark are first-class modes. High contrast (7:1)
and the blue-and-amber colour-vision palette are independent options and combine with either
mode — 3 × 2 × 2 × 2 = 24 audited combinations.

| Family | Hues | Light chrome / accent / highlight | Dark chrome / accent / highlight |
|---|---|---|---|
| Kids | Bright blue, orange, yellow | `#1f6fb2` / `#c2410c` / `#ffe08a` | `#082a4a` / `#b64000` / `#704b00` |
| Teens | Violet, mint, pink | `#5b2a86` / `#a62e6a` / `#cff7ea` | `#25152f` / `#a92f72` / `#653074` |
| Standard | Navy, deep teal, gold | `#172b4d` / `#146c60` / `#f4e5b5` | `#101f35` / `#176b60` / `#294f57` |

The blue-and-amber option replaces accent, link, focus and selection with Okabe–Ito blue
`#005ea8` / `#2563eb` and amber `#a65a00` / `#ffc857`. It is not a colour-blindness correction.

Status meaning is never colour-only: Studio previews and saved-state messages always include a
text label (`Error`, `Warning`, `Success`) next to the hue.

## Why the monochrome theme keeps native status colours

Black & White sets `keepNativeStatusColors`, so `--uui-color-danger`,
`--uui-color-warning` and `--uui-color-positive` are left entirely untouched.

Desaturating status colours would leave grey as the only difference between "saved" and
"failed", which is a real accessibility regression: it removes a redundant channel rather than
adding one. The chrome is monochrome; success and error keep their hue.

## How status colours are handled in the other themes

Umbraco exposes each status role as four tokens, and they are not interchangeable:

- `--uui-color-{role}` is a **fill** (badge or button background). It keeps Umbraco's native hue,
  so warning stays yellow rather than being darkened into olive to satisfy a text ratio.
- `--uui-color-{role}-contrast` is the label drawn on that fill, chosen automatically as black or
  white for the better ratio.
- `--uui-color-{role}-standalone` is the variant Umbraco paints **directly onto a surface** as text
  or an icon, so this is the one raised until it clears the theme's text target against that
  surface.

High Contrast substitutes purpose-picked hues (`#ff6b6b`, `#ffd621`, `#3ddc84`) rather than
brightening the native ones. Interpolating `#c60239` and `#0d8844` toward white to reach 7:1
desaturates them into pink and sage; the substitutes clear 7:1 on black while staying
unmistakably red, yellow and green.

## Visibility fixes from screenshot analysis

A reported High Contrast screenshot was sampled pixel-by-pixel (see
`client/scripts/sample-screenshot.ps1`) and compared against the WCAG formula. Findings:

| Element | Measured | Cause | Fix |
|---|---|---|---|
| Input placeholders | 4.06:1 | `uui-input` declares `color-scheme: var(--uui-color-scheme, normal)`, so `dark` handed placeholder and caret rendering to the browser's own mid-grey | Re-pin `--uui-color-scheme: normal` on the protected editor hosts |
| Secondary / alias text | 6.92:1 | `--uui-color-text-alt` was softened toward the surface, then dimmed again by Umbraco's own opacity | Keep secondary text at full strength when the target is 7:1 |
| Muted labels on disabled fills | ~5:1 | `--uui-color-disabled-contrast` was held to the 3:1 non-text floor, but Umbraco reuses it for muted labels | Hold it to the text floor instead |
| Submit button fill | 5.16:1 | Native `positive` green against pure black, with dark label text | Hold status fills to the theme target in high-contrast themes |
| Navigation selection | 5.11:1 | `#ffff00` behind whole rows, halved to olive `#808200` by the modal scrim | Selection inverts to white |

One measurement was **not** a defect: the entire main region sampled at almost exactly half
luminance (`#808200` is half of `#ffff00`, `#7b7d7c` half of `#ffffff`). That is Umbraco's modal
scrim dimming the content behind the open "Edit property" dialog. Content deliberately obscured
by a modal is not required to meet contrast minimums, so it is left alone.
