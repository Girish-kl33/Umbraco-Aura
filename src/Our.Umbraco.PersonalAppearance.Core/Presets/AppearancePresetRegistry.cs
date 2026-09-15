using Our.Umbraco.PersonalAppearance.Core.Contrast;
using Our.Umbraco.PersonalAppearance.Core.Models;

namespace Our.Umbraco.PersonalAppearance.Core.Presets;

/// <summary>
/// Server-side mirror of <c>client/src/presets/preset-registry.ts</c>. Both sides must stay in
/// sync so a preference validated in the browser validates identically on the server.
/// </summary>
public static class AppearancePresetRegistry
{
    public static IReadOnlyDictionary<AppearancePresetId, AppearancePresetDefinition> All { get; } =
        new Dictionary<AppearancePresetId, AppearancePresetDefinition>
        {
            [AppearancePresetId.None] = new(
                AppearancePresetId.None,
                "Umbraco default",
                "No package overrides. Native Umbraco appearance only.",
                null,
                TextRatio: ContrastEngine.TextMinimumRatio),

            [AppearancePresetId.Light] = new(
                AppearancePresetId.Light,
                "Light",
                "Indigo chrome over white panels.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#243157",
                    ShellForeground = "#ffffff",
                    SurfaceBackground = "#ffffff",
                    SurfaceForeground = "#1a1d23",
                    AccentBackground = "#2f5bd7",
                    AccentForeground = "#ffffff",
                    Link = "#1a4fc4",
                    Border = "#767d8a",
                    FocusRing = "#1a4fc4",
                    SelectedBackground = "#dbe4fb",
                    SelectedForeground = "#10254f",
                    HoverBackground = "#f1f3f7",
                    ActiveBackground = "#e4e8f0"
                },
                ContrastEngine.TextMinimumRatio),

            [AppearancePresetId.Dark] = new(
                AppearancePresetId.Dark,
                "Dark",
                "Cool dark chrome. Protected editors stay light.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#181d24",
                    ShellForeground = "#e9eef4",
                    SurfaceBackground = "#212832",
                    SurfaceForeground = "#e9eef4",
                    AccentBackground = "#3b74d1",
                    AccentForeground = "#ffffff",
                    Link = "#82b6f7",
                    Border = "#6e7887",
                    FocusRing = "#ffd24d",
                    SelectedBackground = "#2d4f80",
                    SelectedForeground = "#ffffff",
                    HoverBackground = "#2a313b",
                    ActiveBackground = "#333b46"
                },
                ContrastEngine.TextMinimumRatio),

            [AppearancePresetId.Dim] = new(
                AppearancePresetId.Dim,
                "Dimmed",
                "Lower-luminance dark shell for reduced glare. Not a medical eye-protection claim.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#1b2027",
                    ShellForeground = "#e8edf3",
                    SurfaceBackground = "#22272e",
                    SurfaceForeground = "#e8edf3",
                    AccentBackground = "#3b74d1",
                    AccentForeground = "#ffffff",
                    Link = "#7cb2f5",
                    Border = "#6e7887",
                    FocusRing = "#ffd24d",
                    SelectedBackground = "#2d4f80",
                    SelectedForeground = "#ffffff",
                    HoverBackground = "#2b313a",
                    ActiveBackground = "#343b45"
                },
                ContrastEngine.TextMinimumRatio),

            [AppearancePresetId.WarmComfort] = new(
                AppearancePresetId.WarmComfort,
                "Eye Comfort",
                "Warm, low-blue neutrals for a personal comfort preference. Not a medical claim.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#1f1a14",
                    ShellForeground = "#f5ead6",
                    SurfaceBackground = "#2a231b",
                    SurfaceForeground = "#f5ead6",
                    AccentBackground = "#a9662a",
                    AccentForeground = "#ffffff",
                    Link = "#f0b968",
                    Border = "#7d6b52",
                    FocusRing = "#ffd27a",
                    SelectedBackground = "#6b4a24",
                    SelectedForeground = "#fff7ea",
                    HoverBackground = "#352c22",
                    ActiveBackground = "#403528"
                },
                ContrastEngine.TextMinimumRatio),

            [AppearancePresetId.ColorVisionFriendly] = new(
                AppearancePresetId.ColorVisionFriendly,
                "Colour Vision Support",
                "Blue/orange signalling from the Okabe-Ito palette, chosen to stay distinguishable "
                + "without relying on red-green discrimination. Not a colour-blindness correction.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#004c73",
                    ShellForeground = "#ffffff",
                    SurfaceBackground = "#ffffff",
                    SurfaceForeground = "#16191d",
                    AccentBackground = "#0072b2",
                    AccentForeground = "#ffffff",
                    Link = "#005b8f",
                    Border = "#5b6773",
                    FocusRing = "#d55e00",
                    SelectedBackground = "#cde6f5",
                    SelectedForeground = "#003350",
                    HoverBackground = "#f0f4f7",
                    ActiveBackground = "#e1e9ef"
                },
                ContrastEngine.TextMinimumRatio),

            [AppearancePresetId.HighContrast] = new(
                AppearancePresetId.HighContrast,
                "High Contrast",
                "Targets 7:1 or better for normal interface text where package tokens apply.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#000000",
                    ShellForeground = "#ffffff",
                    SurfaceBackground = "#1a1a1a",
                    SurfaceForeground = "#ffffff",
                    AccentBackground = "#ffff00",
                    AccentForeground = "#000000",
                    Link = "#66ffff",
                    Border = "#c8c8c8",
                    FocusRing = "#ffff00",
                    // Selection inverts to white rather than reusing the yellow accent: Umbraco
                    // paints the "current" colour behind whole navigation rows, and a full-width
                    // yellow row is both garish and indistinguishable from a focused control.
                    SelectedBackground = "#ffffff",
                    SelectedForeground = "#000000",
                    HoverBackground = "#2e2e2e",
                    ActiveBackground = "#3d3d3d"
                },
                ContrastEngine.HighContrastTextTargetRatio),

            [AppearancePresetId.BlackAndWhite] = new(
                AppearancePresetId.BlackAndWhite,
                "Black & White",
                "Fully desaturated light theme: black chrome, white panels, grey-step hierarchy. "
                + "Status colours stay native so meaning is never carried by lightness alone.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#1a1a1a",
                    ShellForeground = "#ffffff",
                    SurfaceBackground = "#ffffff",
                    SurfaceForeground = "#141414",
                    AccentBackground = "#1a1a1a",
                    AccentForeground = "#ffffff",
                    Link = "#3d3d3d",
                    Border = "#5c5c5c",
                    FocusRing = "#000000",
                    SelectedBackground = "#d4d4d4",
                    SelectedForeground = "#141414",
                    HoverBackground = "#f0f0f0",
                    ActiveBackground = "#e0e0e0"
                },
                ContrastEngine.TextMinimumRatio,
                KeepNativeStatusColors: true),

            [AppearancePresetId.Kids] = new(
                AppearancePresetId.Kids,
                "Kids",
                "Bright blue, orange, and yellow — playful and friendly. "
                + "A visual style only; it encodes no assumption about who is using it.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#1f6fb2",
                    ShellForeground = "#ffffff",
                    SurfaceBackground = "#ffffff",
                    SurfaceForeground = "#1b2430",
                    AccentBackground = "#c2410c",
                    AccentForeground = "#ffffff",
                    Link = "#1256a0",
                    Border = "#5a6b7d",
                    FocusRing = "#c2410c",
                    SelectedBackground = "#ffe08a",
                    SelectedForeground = "#3d2b00",
                    HoverBackground = "#f2f7fb",
                    ActiveBackground = "#e3edf6"
                },
                ContrastEngine.TextMinimumRatio,
                Variants: new Dictionary<AppearanceMode, CustomAppearanceColors>
                {
                    [AppearanceMode.Light] = Colors(
                        "#1f6fb2", "#ffffff", "#ffffff", "#1b2430", "#c2410c", "#ffffff",
                        "#1256a0", "#5a6b7d", "#c2410c", "#ffe08a", "#3d2b00", "#f2f7fb", "#e3edf6"),
                    [AppearanceMode.Dark] = Colors(
                        "#082a4a", "#ffffff", "#10263a", "#f7fbff", "#b64000", "#ffffff",
                        "#7fc8ff", "#71899e", "#ffd24a", "#704b00", "#fff4cc", "#173248", "#203d54")
                }),

            [AppearancePresetId.Teenagers] = new(
                AppearancePresetId.Teenagers,
                "Teens",
                "Violet, mint, and pink — modern and vibrant. "
                + "A visual style only; it encodes no assumption about who is using it.",
                Colors(
                    "#5b2a86", "#ffffff", "#ffffff", "#241b2f", "#a62e6a", "#ffffff",
                    "#5b2a86", "#76697f", "#007a70", "#cff7ea", "#183c33", "#faf4fc", "#f1e7f5"),
                ContrastEngine.TextMinimumRatio,
                Variants: new Dictionary<AppearanceMode, CustomAppearanceColors>
                {
                    [AppearanceMode.Light] = Colors(
                        "#5b2a86", "#ffffff", "#ffffff", "#241b2f", "#a62e6a", "#ffffff",
                        "#5b2a86", "#76697f", "#007a70", "#cff7ea", "#183c33", "#faf4fc", "#f1e7f5"),
                    [AppearanceMode.Dark] = Colors(
                        "#25152f", "#faf5ff", "#30203b", "#faf5ff", "#a92f72", "#ffffff",
                        "#e0a8ff", "#90799d", "#62d9be", "#653074", "#ffffff", "#3b2947", "#463253")
                }),

            [AppearancePresetId.Adults] = new(
                AppearancePresetId.Adults,
                "Standard",
                "Navy, deep teal, and gold — clean and professional. "
                + "A visual style only; it encodes no assumption about who is using it.",
                new CustomAppearanceColors
                {
                    ShellBackground = "#172b4d",
                    ShellForeground = "#ffffff",
                    SurfaceBackground = "#ffffff",
                    SurfaceForeground = "#1f262e",
                    AccentBackground = "#146c60",
                    AccentForeground = "#ffffff",
                    Link = "#155e52",
                    Border = "#69778a",
                    FocusRing = "#9a6500",
                    SelectedBackground = "#f4e5b5",
                    SelectedForeground = "#2f260b",
                    HoverBackground = "#f4f6f8",
                    ActiveBackground = "#e8ecf0"
                },
                ContrastEngine.TextMinimumRatio,
                Variants: new Dictionary<AppearanceMode, CustomAppearanceColors>
                {
                    [AppearanceMode.Light] = Colors(
                        "#172b4d", "#ffffff", "#ffffff", "#1f262e", "#146c60", "#ffffff",
                        "#155e52", "#69778a", "#9a6500", "#f4e5b5", "#2f260b", "#f4f6f8", "#e8ecf0"),
                    [AppearanceMode.Dark] = Colors(
                        "#101f35", "#f5f8fc", "#17283a", "#f5f8fc", "#176b60", "#ffffff",
                        "#72d4c5", "#77899b", "#ffd166", "#294f57", "#ffffff", "#203448", "#294055")
                }),

            [AppearancePresetId.FollowSystem] = new(
                AppearancePresetId.FollowSystem,
                "Follow System",
                "Resolves to Light or Dark from prefers-color-scheme at runtime.",
                null,
                ContrastEngine.TextMinimumRatio),

            [AppearancePresetId.Custom] = new(
                AppearancePresetId.Custom,
                "Custom",
                "User-defined opaque colors validated by the contrast engine.",
                null,
                ContrastEngine.TextMinimumRatio)
        };

    public static AppearancePresetDefinition Get(AppearancePresetId id) => All[id];

    public static CustomAppearanceColors ResolveColors(
        AppearancePresetId preset,
        CustomAppearanceColors? custom,
        bool prefersDark,
        AppearanceMode mode = AppearanceMode.Light)
    {
        var colors = preset switch
        {
            AppearancePresetId.None => All[AppearancePresetId.Light].Colors!,
            AppearancePresetId.FollowSystem => prefersDark
                ? All[AppearancePresetId.Adults].Variants![AppearanceMode.Dark]
                : All[AppearancePresetId.Adults].Variants![AppearanceMode.Light],
            AppearancePresetId.Custom => custom ?? All[AppearancePresetId.Dark].Colors!,
            _ => All[preset].Variants?.GetValueOrDefault(mode)
                ?? All[preset].Colors
                ?? All[AppearancePresetId.Light].Colors!
        };
        return Clone(colors);
    }

    public static CustomAppearanceColors ResolveColors(
        AppearancePreferenceDocument preference,
        bool prefersDark)
    {
        var colors = ResolveColors(
            preference.Preset,
            preference.CustomColors,
            prefersDark,
            preference.AppearanceMode);

        if (preference.Accessibility.ColorVisionFriendly)
        {
            colors = ApplyBlueAmberPalette(colors);
        }

        if (preference.Accessibility.HighContrast)
        {
            colors = ApplyHighContrast(colors);
        }

        return colors;
    }

    public static CustomAppearanceColors ApplyBlueAmberPalette(CustomAppearanceColors source)
    {
        var colors = Clone(source);
        var dark = IsDark(colors.SurfaceBackground);
        colors.AccentBackground = dark ? "#2563eb" : "#005ea8";
        colors.AccentForeground = "#ffffff";
        colors.Link = dark ? "#8ec5ff" : "#005ea8";
        colors.FocusRing = dark ? "#ffc857" : "#a65a00";
        colors.SelectedBackground = dark ? "#7a4a00" : "#ffe08a";
        colors.SelectedForeground = dark ? "#ffffff" : "#352400";
        return colors;
    }

    public static CustomAppearanceColors ApplyHighContrast(CustomAppearanceColors source)
    {
        var colors = Clone(source);
        const double target = ContrastEngine.HighContrastTextTargetRatio;
        colors.ShellBackground = EnsureBackgroundRatio(colors.ShellBackground, colors.ShellForeground, target);
        colors.SurfaceBackground = EnsureBackgroundRatio(colors.SurfaceBackground, colors.SurfaceForeground, target);
        colors.AccentForeground = ContrastEngine.AutoForeground(colors.AccentBackground);
        colors.AccentBackground = EnsureBackgroundRatio(colors.AccentBackground, colors.AccentForeground, target);
        colors.SelectedForeground = ContrastEngine.AutoForeground(colors.SelectedBackground);
        colors.SelectedBackground = EnsureBackgroundRatio(colors.SelectedBackground, colors.SelectedForeground, target);
        colors.Link = EnsureForegroundRatio(colors.Link, colors.SurfaceBackground, target);
        colors.HoverBackground = EnsureBackgroundRatio(colors.HoverBackground, colors.SurfaceForeground, target);
        colors.ActiveBackground = EnsureBackgroundRatio(colors.ActiveBackground, colors.SurfaceForeground, target);
        colors.Border = EnsureForegroundRatio(colors.Border, colors.SurfaceBackground, ContrastEngine.NonTextMinimumRatio);
        colors.FocusRing = EnsureForegroundRatio(colors.FocusRing, colors.SurfaceBackground, ContrastEngine.NonTextMinimumRatio);
        return colors;
    }

    private static CustomAppearanceColors Colors(
        string shellBackground, string shellForeground,
        string surfaceBackground, string surfaceForeground,
        string accentBackground, string accentForeground,
        string link, string border, string focusRing,
        string selectedBackground, string selectedForeground,
        string hoverBackground, string activeBackground) => new()
        {
            ShellBackground = shellBackground,
            ShellForeground = shellForeground,
            SurfaceBackground = surfaceBackground,
            SurfaceForeground = surfaceForeground,
            AccentBackground = accentBackground,
            AccentForeground = accentForeground,
            Link = link,
            Border = border,
            FocusRing = focusRing,
            SelectedBackground = selectedBackground,
            SelectedForeground = selectedForeground,
            HoverBackground = hoverBackground,
            ActiveBackground = activeBackground
        };

    private static CustomAppearanceColors Clone(CustomAppearanceColors colors) => Colors(
        colors.ShellBackground, colors.ShellForeground,
        colors.SurfaceBackground, colors.SurfaceForeground,
        colors.AccentBackground, colors.AccentForeground,
        colors.Link, colors.Border, colors.FocusRing,
        colors.SelectedBackground, colors.SelectedForeground,
        colors.HoverBackground, colors.ActiveBackground);

    private static bool IsDark(string hex)
    {
        return ContrastEngine.TryParseOpaqueHex(hex, out var rgb)
            && ContrastEngine.RelativeLuminance(rgb) < 0.5;
    }

    private static string EnsureForegroundRatio(string color, string background, double target)
    {
        if (ContrastEngine.MeetsRatio(color, background, target))
        {
            return color;
        }

        var endpoint = IsDark(background) ? "#ffffff" : "#000000";
        return EnsureMixedRatio(color, endpoint, background, target);
    }

    private static string EnsureBackgroundRatio(string background, string foreground, double target)
    {
        if (ContrastEngine.MeetsRatio(background, foreground, target))
        {
            return background;
        }

        var endpoint = IsDark(foreground) ? "#ffffff" : "#000000";
        return EnsureMixedRatio(background, endpoint, foreground, target);
    }

    private static string EnsureMixedRatio(string start, string endpoint, string counterpart, double target)
    {
        ContrastEngine.TryParseOpaqueHex(start, out var a);
        ContrastEngine.TryParseOpaqueHex(endpoint, out var b);
        for (var step = 1; step <= 100; step++)
        {
            var amount = step / 100.0;
            var candidate = ContrastEngine.ToHex(new RgbColor(
                (int)Math.Round(a.R + ((b.R - a.R) * amount)),
                (int)Math.Round(a.G + ((b.G - a.G) * amount)),
                (int)Math.Round(a.B + ((b.B - a.B) * amount))));
            if (ContrastEngine.MeetsRatio(candidate, counterpart, target))
            {
                return candidate;
            }
        }
        return endpoint;
    }
}

public sealed record AppearancePresetDefinition(
    AppearancePresetId Id,
    string DisplayName,
    string Description,
    CustomAppearanceColors? Colors,
    double TextRatio,
    bool KeepNativeStatusColors = false,
    IReadOnlyDictionary<AppearanceMode, CustomAppearanceColors>? Variants = null);
