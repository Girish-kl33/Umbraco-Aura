# Umbraco Aura

Umbraco Aura lets each backoffice user pick their own look: light, dark, high contrast, and more. Preferences are saved per user and do not change the published website.

Works with **Umbraco 17** and **Umbraco 18**. Install the package that matches your Umbraco version.

## Install

**Umbraco 17** (17.4.2 or later):

```bash
dotnet add package Umbraco.Aura.v17 --version 0.1.1-umbraco17
```

**Umbraco 18**:

```bash
dotnet add package Umbraco.Aura.v18 --version 0.1.1-umbraco18
```

Restart the site, then log in to the backoffice.

Use only one package. Do not install both.

## How to use

1. Open the backoffice and log in.
2. Open the **Theme** dropdown in your user profile and choose a look, or go to **Appearance** in the main navigation.
3. Try a preset, or open **Appearance Studio** to build a custom palette.
4. Use **Preview** to try it, **Save for me** to keep it, or **Reset** to go back to the Umbraco default.

Your choice is saved for you only. Other editors keep their own settings.

### Themes you can pick

Follow System, Standard Light, Standard Dark, Kids Light/Dark, Teens Light/Dark, Dimmed, Eye Comfort, Black & White, Colour Vision Support, High Contrast, and a personal custom theme.

## What it changes — and what it does not

Aura restyles backoffice chrome such as navigation, labels, and headings.

It does **not** restyle:

- text boxes, the rich text editor, or code editors
- content previews, media, or the live website

That is intentional, so editing stays clear and familiar.

## Upgrade from Umbraco 17 to 18

1. Remove `Umbraco.Aura.v17`
2. Add `Umbraco.Aura.v18`
3. Restart the site

Saved preferences carry over. You do not need to set them again.

## If something looks wrong

- Custom colours feel unusable → use **Reset to Umbraco default**
- Preview looks stuck → click **Cancel** or reload the page

## More detail

- [Installation, upgrade, and recovery](docs/INSTALLATION.md)
- [Known limitations](docs/LIMITATIONS.md)
- [Architecture](docs/ARCHITECTURE.md)
