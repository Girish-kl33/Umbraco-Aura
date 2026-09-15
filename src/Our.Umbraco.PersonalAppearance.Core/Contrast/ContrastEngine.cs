using System.Globalization;

namespace Our.Umbraco.PersonalAppearance.Core.Contrast;

/// <summary>
/// WCAG 2 relative-luminance contrast engine.
/// Uses the sRGB → linear → relative luminance formula; not RGB averages or HSL lightness.
/// </summary>
public static class ContrastEngine
{
    public const double TextMinimumRatio = 4.5;
    public const double NonTextMinimumRatio = 3.0;
    public const double HighContrastTextTargetRatio = 7.0;

    public static bool TryParseOpaqueHex(string? value, out RgbColor color)
    {
        color = default;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var hex = value.Trim();
        if (hex.StartsWith('#'))
        {
            hex = hex[1..];
        }

        if (hex.Length is not (3 or 6))
        {
            return false;
        }

        if (hex.Length == 3)
        {
            hex = string.Concat(hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]);
        }

        if (!int.TryParse(hex[..2], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var r) ||
            !int.TryParse(hex[2..4], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var g) ||
            !int.TryParse(hex[4..6], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var b))
        {
            return false;
        }

        color = new RgbColor(r, g, b);
        return true;
    }

    public static double RelativeLuminance(RgbColor color)
    {
        var r = SrgbChannelToLinear(color.R / 255.0);
        var g = SrgbChannelToLinear(color.G / 255.0);
        var b = SrgbChannelToLinear(color.B / 255.0);
        return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
    }

    public static double ContrastRatio(RgbColor a, RgbColor b)
    {
        var l1 = RelativeLuminance(a);
        var l2 = RelativeLuminance(b);
        var lighter = Math.Max(l1, l2);
        var darker = Math.Min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    public static double ContrastRatio(string hexA, string hexB)
    {
        if (!TryParseOpaqueHex(hexA, out var a) || !TryParseOpaqueHex(hexB, out var b))
        {
            throw new ArgumentException("Both colors must be opaque hex values.");
        }

        return ContrastRatio(a, b);
    }

    /// <summary>
    /// Chooses black or white foreground for the given background to maximize contrast.
    /// </summary>
    public static string AutoForeground(string backgroundHex)
    {
        if (!TryParseOpaqueHex(backgroundHex, out var background))
        {
            throw new ArgumentException("Background must be an opaque hex color.", nameof(backgroundHex));
        }

        var black = new RgbColor(0, 0, 0);
        var white = new RgbColor(255, 255, 255);
        var blackRatio = ContrastRatio(black, background);
        var whiteRatio = ContrastRatio(white, background);
        return whiteRatio >= blackRatio ? "#ffffff" : "#000000";
    }

    public static bool MeetsRatio(string foregroundHex, string backgroundHex, double required)
    {
        if (!TryParseOpaqueHex(foregroundHex, out var fg) || !TryParseOpaqueHex(backgroundHex, out var bg))
        {
            return false;
        }

        return ContrastRatio(fg, bg) + 0.0001 >= required;
    }

    public static string ToHex(RgbColor color) =>
        $"#{color.R:X2}{color.G:X2}{color.B:X2}".ToLowerInvariant();

    private static double SrgbChannelToLinear(double channel) =>
        channel <= 0.04045
            ? channel / 12.92
            : Math.Pow((channel + 0.055) / 1.055, 2.4);
}

public readonly record struct RgbColor(int R, int G, int B);
