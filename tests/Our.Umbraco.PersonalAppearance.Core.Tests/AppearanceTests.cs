using Our.Umbraco.PersonalAppearance.Core.Contrast;
using Our.Umbraco.PersonalAppearance.Core.Models;
using Our.Umbraco.PersonalAppearance.Core.Presets;
using Our.Umbraco.PersonalAppearance.Core.Validation;
using Xunit;

namespace Our.Umbraco.PersonalAppearance.Core.Tests;

public class ContrastEngineTests
{
    [Fact]
    public void White_on_black_is_21_to_1()
    {
        var ratio = ContrastEngine.ContrastRatio("#ffffff", "#000000");
        Assert.Equal(21.0, ratio, 1);
    }

    [Fact]
    public void Uses_relative_luminance_not_rgb_average()
    {
        Assert.True(ContrastEngine.TryParseOpaqueHex("#000080", out var navy));
        Assert.True(ContrastEngine.TryParseOpaqueHex("#ffff00", out var yellow));
        Assert.True(ContrastEngine.RelativeLuminance(yellow) > ContrastEngine.RelativeLuminance(navy));
        Assert.True(ContrastEngine.ContrastRatio(yellow, navy) >= ContrastEngine.TextMinimumRatio);
    }

    [Fact]
    public void AutoForeground_picks_max_contrast()
    {
        Assert.Equal("#ffffff", ContrastEngine.AutoForeground("#000000"));
        Assert.Equal("#000000", ContrastEngine.AutoForeground("#ffffff"));
    }

    [Fact]
    public void Rejects_non_hex()
    {
        Assert.False(ContrastEngine.TryParseOpaqueHex("rgba(0,0,0,.5)", out _));
        Assert.False(ContrastEngine.TryParseOpaqueHex("red", out _));
    }
}

public class AppearancePreferenceValidatorTests
{
    [Fact]
    public void HighContrast_preset_validates()
    {
        var doc = new AppearancePreferenceDocument
        {
            Preset = AppearancePresetId.HighContrast
        };

        var result = AppearancePreferenceValidator.Validate(doc, forPersistence: true);
        Assert.True(result.IsValid);
        Assert.Contains(result.ContrastReport, x => x.RequiredRatio == ContrastEngine.HighContrastTextTargetRatio);
    }

    [Fact]
    public void Insufficient_custom_contrast_is_rejected()
    {
        var source = AppearancePresetRegistry.Get(AppearancePresetId.Dark).Colors!;
        var colors = new CustomAppearanceColors
        {
            ShellBackground = "#555555",
            ShellForeground = "#444444",
            SurfaceBackground = source.SurfaceBackground,
            SurfaceForeground = source.SurfaceForeground,
            AccentBackground = source.AccentBackground,
            AccentForeground = source.AccentForeground,
            Link = source.Link,
            Border = source.Border,
            FocusRing = source.FocusRing,
            SelectedBackground = source.SelectedBackground,
            SelectedForeground = source.SelectedForeground,
            HoverBackground = source.HoverBackground,
            ActiveBackground = source.ActiveBackground
        };

        var doc = new AppearancePreferenceDocument
        {
            Preset = AppearancePresetId.Custom,
            CustomColors = colors
        };

        var result = AppearancePreferenceValidator.Validate(doc, forPersistence: true);
        Assert.False(result.IsValid);
        Assert.Contains(result.Problems, p => p.Code == "contrast_insufficient");
    }

    [Fact]
    public void Forbidden_payload_markers_are_rejected()
    {
        var source = AppearancePresetRegistry.Get(AppearancePresetId.Dark).Colors!;
        var colors = new CustomAppearanceColors
        {
            ShellBackground = "url(https://evil.example)",
            ShellForeground = source.ShellForeground,
            SurfaceBackground = source.SurfaceBackground,
            SurfaceForeground = source.SurfaceForeground,
            AccentBackground = source.AccentBackground,
            AccentForeground = source.AccentForeground,
            Link = source.Link,
            Border = source.Border,
            FocusRing = source.FocusRing,
            SelectedBackground = source.SelectedBackground,
            SelectedForeground = source.SelectedForeground,
            HoverBackground = source.HoverBackground,
            ActiveBackground = source.ActiveBackground
        };

        var doc = new AppearancePreferenceDocument
        {
            Preset = AppearancePresetId.Custom,
            CustomColors = colors
        };

        var result = AppearancePreferenceValidator.Validate(doc, forPersistence: true);
        Assert.Contains(result.Problems, p => p.Code is "payload_forbidden" or "color_format");
    }

    [Fact]
    public void Unapproved_font_is_rejected()
    {
        var doc = new AppearancePreferenceDocument
        {
            Preset = AppearancePresetId.Light,
            FontFamilyId = "Comic Sans MS, cursive"
        };

        var result = AppearancePreferenceValidator.Validate(doc, forPersistence: true);
        Assert.Contains(result.Problems, p => p.Code == "font_not_approved");
    }
}
