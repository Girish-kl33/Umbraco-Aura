# Known limitations

## Editor isolation

- Protected native editing fields **may remain light inside a dark interface**. This is intentional.
- Textbox interiors, entered text, placeholders, caret/selection, RTE toolbar/content, code-editor presentation, content previews, media, and website output are **not** restyled.
- Safe public styling hooks are incomplete for many Lit/UUI shadow trees; those components stay native rather than being rewritten.

## Techniques explicitly disallowed

- Global page filters
- Broad inherited font/color changes beyond tokenized shell selectors
- Private Shadow DOM rewriting
- Component monkey-patching
- Persistent DOM-scanning observers for styling
- Modifications to Umbraco core files

## Theme context

Activating Umbraco’s native Dark theme does **not** by itself satisfy this package’s editor-isolation requirements.

## Claims we do not make

- No personality inference
- No medical eye-protection claims (Dim / Warm Comfort are comfort preferences)
- No universal color-blindness-correction claims (Color-vision-friendly is a safe accent bias only)

## Compatibility honesty

Intended support for Umbraco 17 and 18 is **not** the same as fully host-verified support. See `VERIFICATION-REPORT.md` for exactly what was compiled, executed, and verified.
