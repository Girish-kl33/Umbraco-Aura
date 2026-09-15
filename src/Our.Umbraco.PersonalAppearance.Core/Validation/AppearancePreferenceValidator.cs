using Our.Umbraco.PersonalAppearance.Core.Contrast;
using Our.Umbraco.PersonalAppearance.Core.Fonts;
using Our.Umbraco.PersonalAppearance.Core.Models;
using Our.Umbraco.PersonalAppearance.Core.Presets;

namespace Our.Umbraco.PersonalAppearance.Core.Validation;

public static class AppearancePreferenceValidator
{
    private static readonly HashSet<string> ForbiddenPayloadMarkers = new(StringComparer.OrdinalIgnoreCase)
    {
        "url(",
        "javascript:",
        "expression(",
        "@import",
        "<script",
        "gradient(",
        "var(--",
        "calc("
    };

    public static AppearanceValidationResult Validate(AppearancePreferenceDocument document, bool forPersistence)
    {
        var result = new AppearanceValidationResult();

        if (document.SchemaVersion != AppearancePreferenceDocument.CurrentSchemaVersion)
        {
            result.Problems.Add(new AppearanceValidationProblem
            {
                Code = "schema_version",
                Message = $"Unsupported schema version {document.SchemaVersion}. Expected {AppearancePreferenceDocument.CurrentSchemaVersion}.",
                Path = "schemaVersion",
                CorrectionOptions = [$"Set schemaVersion to {AppearancePreferenceDocument.CurrentSchemaVersion}."]
            });
        }

        if (!Enum.IsDefined(document.Preset))
        {
            result.Problems.Add(new AppearanceValidationProblem
            {
                Code = "preset_invalid",
                Message = "Unknown appearance preset.",
                Path = "preset",
                CorrectionOptions = Enum.GetNames<AppearancePresetId>().ToList()
            });
            return result;
        }

        if (!Enum.IsDefined(document.AppearanceMode))
        {
            result.Problems.Add(new AppearanceValidationProblem
            {
                Code = "appearance_mode_invalid",
                Message = "Unknown light/dark appearance mode.",
                Path = "appearanceMode",
                CorrectionOptions = Enum.GetNames<AppearanceMode>().ToList()
            });
            return result;
        }

        if (document.Preset == AppearancePresetId.None)
        {
            if (!Enum.IsDefined(document.FontSizeId))
            {
                result.Problems.Add(new AppearanceValidationProblem
                {
                    Code = "font_size_invalid",
                    Message = "Font size must be low, normal, or large.",
                    Path = "fontSizeId",
                    CorrectionOptions = Enum.GetNames<AppearanceFontSize>().ToList()
                });
            }
            // None means delete / no colour overrides — empty body is fine for DELETE; for PUT treat as reset intent.
            return result;
        }

        if (!Enum.IsDefined(document.FontSizeId))
        {
            result.Problems.Add(new AppearanceValidationProblem
            {
                Code = "font_size_invalid",
                Message = "Font size must be low, normal, or large.",
                Path = "fontSizeId",
                CorrectionOptions = Enum.GetNames<AppearanceFontSize>().ToList()
            });
        }

        if (!string.IsNullOrWhiteSpace(document.FontFamilyId) && !ApprovedFontCatalog.IsApproved(document.FontFamilyId))
        {
            result.Problems.Add(new AppearanceValidationProblem
            {
                Code = "font_not_approved",
                Message = "Font family must be an approved font ID. Arbitrary CSS stacks and uploaded fonts are rejected.",
                Path = "fontFamilyId",
                CorrectionOptions = ApprovedFontCatalog.All.Keys.OrderBy(x => x).ToList()
            });
        }

        if (ContainsForbiddenPayload(document))
        {
            result.Problems.Add(new AppearanceValidationProblem
            {
                Code = "payload_forbidden",
                Message = "Arbitrary CSS, JavaScript, URLs, gradients, and uploaded fonts are not accepted.",
                Path = "$",
                CorrectionOptions = ["Use opaque hex colors (#RRGGBB) and approved font IDs only."]
            });
        }

        CustomAppearanceColors? colors = null;
        if (document.Preset == AppearancePresetId.Custom)
        {
            if (string.IsNullOrWhiteSpace(document.CustomThemeName) ||
                document.CustomThemeName.Length > 60 ||
                document.CustomThemeName.Any(char.IsControl))
            {
                result.Problems.Add(new AppearanceValidationProblem
                {
                    Code = "custom_theme_name_invalid",
                    Message = "Custom theme name is required and must be 60 characters or fewer.",
                    Path = "customThemeName",
                    CorrectionOptions = ["Enter a short plain-text theme name."]
                });
            }

            if (document.CustomColors is null)
            {
                result.Problems.Add(new AppearanceValidationProblem
                {
                    Code = "custom_colors_required",
                    Message = "Custom appearance requires customColors.",
                    Path = "customColors",
                    CorrectionOptions = ["Provide opaque hex colors for all custom color fields."]
                });
                return result;
            }

            colors = document.CustomColors;
        }
        else if (document.Preset is not AppearancePresetId.FollowSystem)
        {
            colors = AppearancePresetRegistry.ResolveColors(document, document.AppearanceMode == AppearanceMode.Dark);
        }
        else
        {
            // Follow system resolves at runtime; validate both light and dark targets.
            var required = document.Accessibility.HighContrast
                ? ContrastEngine.HighContrastTextTargetRatio
                : ContrastEngine.TextMinimumRatio;
            ValidateColorSet(AppearancePresetRegistry.ResolveColors(document, false), required, result, "followSystem.light");
            ValidateColorSet(AppearancePresetRegistry.ResolveColors(document, true), required, result, "followSystem.dark");
            return result;
        }

        if (colors is not null)
        {
            if (document.Preset == AppearancePresetId.Custom)
            {
                colors = AppearancePresetRegistry.ResolveColors(document, document.AppearanceMode == AppearanceMode.Dark);
            }

            var requiredText = document.Preset == AppearancePresetId.HighContrast || document.Accessibility.HighContrast
                ? ContrastEngine.HighContrastTextTargetRatio
                : ContrastEngine.TextMinimumRatio;
            ValidateColorSet(colors, requiredText, result, "colors");
        }

        if (forPersistence && string.IsNullOrWhiteSpace(document.ConcurrencyToken) is false)
        {
            // Concurrency presence is OK; emptiness on create is handled by the service.
        }

        return result;
    }

    public static void ValidateColorSet(
        CustomAppearanceColors colors,
        double textRatio,
        AppearanceValidationResult result,
        string pathPrefix)
    {
        ValidateHex(colors.ShellBackground, $"{pathPrefix}.shellBackground", result);
        ValidateHex(colors.ShellForeground, $"{pathPrefix}.shellForeground", result);
        ValidateHex(colors.SurfaceBackground, $"{pathPrefix}.surfaceBackground", result);
        ValidateHex(colors.SurfaceForeground, $"{pathPrefix}.surfaceForeground", result);
        ValidateHex(colors.AccentBackground, $"{pathPrefix}.accentBackground", result);
        ValidateHex(colors.AccentForeground, $"{pathPrefix}.accentForeground", result);
        ValidateHex(colors.Link, $"{pathPrefix}.link", result);
        ValidateHex(colors.Border, $"{pathPrefix}.border", result);
        ValidateHex(colors.FocusRing, $"{pathPrefix}.focusRing", result);
        ValidateHex(colors.SelectedBackground, $"{pathPrefix}.selectedBackground", result);
        ValidateHex(colors.SelectedForeground, $"{pathPrefix}.selectedForeground", result);
        ValidateHex(colors.HoverBackground, $"{pathPrefix}.hoverBackground", result);
        ValidateHex(colors.ActiveBackground, $"{pathPrefix}.activeBackground", result);

        if (result.Problems.Any(p => p.Code == "color_format"))
        {
            return;
        }

        AddPair("Shell text", colors.ShellForeground, colors.ShellBackground, textRatio, "text", result);
        AddPair("Surface text", colors.SurfaceForeground, colors.SurfaceBackground, textRatio, "text", result);
        AddPair("Accent text", colors.AccentForeground, colors.AccentBackground, textRatio, "text", result);
        AddPair("Selected text", colors.SelectedForeground, colors.SelectedBackground, textRatio, "text", result);
        AddPair("Link on surface", colors.Link, colors.SurfaceBackground, textRatio, "link", result);
        AddPair("Border on shell", colors.Border, colors.ShellBackground, ContrastEngine.NonTextMinimumRatio, "border", result);
        AddPair("Focus ring on workspace", colors.FocusRing, colors.SurfaceBackground, ContrastEngine.NonTextMinimumRatio, "focus", result);
        AddPair("Hover surface text", colors.SurfaceForeground, colors.HoverBackground, textRatio, "hover", result);
        AddPair("Active surface text", colors.SurfaceForeground, colors.ActiveBackground, textRatio, "active", result);
    }

    private static void AddPair(
        string label,
        string foreground,
        string background,
        double required,
        string role,
        AppearanceValidationResult result)
    {
        var ratio = ContrastEngine.ContrastRatio(foreground, background);
        var item = new ContrastReportItem
        {
            Label = label,
            Foreground = foreground,
            Background = background,
            Ratio = Math.Round(ratio, 2),
            RequiredRatio = required,
            Role = role
        };
        result.ContrastReport.Add(item);

        if (!item.Passes)
        {
            result.Problems.Add(new AppearanceValidationProblem
            {
                Code = "contrast_insufficient",
                Message = $"{label} contrast is {item.Ratio:0.##}:1; required {required:0.##}:1.",
                Path = role,
                ContrastRatio = item.Ratio,
                RequiredRatio = required,
                CorrectionOptions =
                [
                    $"Auto-set foreground to {ContrastEngine.AutoForeground(background)}",
                    "Darken the background",
                    "Lighten the background",
                    "Choose a higher-contrast preset such as High Contrast"
                ]
            });
        }
    }

    private static void ValidateHex(string value, string path, AppearanceValidationResult result)
    {
        if (!ContrastEngine.TryParseOpaqueHex(value, out _))
        {
            result.Problems.Add(new AppearanceValidationProblem
            {
                Code = "color_format",
                Message = $"'{value}' is not an accepted opaque hex color.",
                Path = path,
                CorrectionOptions = ["Use #RGB or #RRGGBB only. Alpha, named colors, and CSS functions are rejected."]
            });
        }
    }

    private static bool ContainsForbiddenPayload(AppearancePreferenceDocument document)
    {
        var blobs = new List<string?>
        {
            document.FontFamilyId,
            document.CustomColors?.ShellBackground,
            document.CustomColors?.ShellForeground,
            document.CustomColors?.SurfaceBackground,
            document.CustomColors?.SurfaceForeground,
            document.CustomColors?.AccentBackground,
            document.CustomColors?.AccentForeground,
            document.CustomColors?.Link,
            document.CustomColors?.Border,
            document.CustomColors?.FocusRing,
            document.CustomColors?.SelectedBackground,
            document.CustomColors?.SelectedForeground,
            document.CustomColors?.HoverBackground,
            document.CustomColors?.ActiveBackground
        };

        return blobs.Any(value =>
            !string.IsNullOrWhiteSpace(value) &&
            ForbiddenPayloadMarkers.Any(marker => value!.Contains(marker, StringComparison.OrdinalIgnoreCase)));
    }
}
