namespace Our.Umbraco.PersonalAppearance.Core.Models;

/// <summary>Versioned personal appearance preference document.</summary>
public sealed class AppearancePreferenceDocument
{
    public const int CurrentSchemaVersion = 1;

    public int SchemaVersion { get; set; } = CurrentSchemaVersion;

    /// <summary>Optimistic concurrency token. Client must echo the last known value on PUT.</summary>
    public string ConcurrencyToken { get; set; } = string.Empty;

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public AppearancePresetId Preset { get; set; } = AppearancePresetId.None;

    public AppearanceMode AppearanceMode { get; set; } = AppearanceMode.Light;

    /// <summary>Display name for the current user's custom theme in Umbraco's native theme dropdown.</summary>
    public string? CustomThemeName { get; set; }

    public CustomAppearanceColors? CustomColors { get; set; }

    public string? FontFamilyId { get; set; }

    /// <summary>Low, Normal, or Large. Missing values deserialize to Normal.</summary>
    public AppearanceFontSize FontSizeId { get; set; } = AppearanceFontSize.Normal;

    public AccessibilityOptions Accessibility { get; set; } = new();
}

public enum AppearancePresetId
{
    /// <summary>No package preference — native Umbraco appearance only.</summary>
    None = 0,
    Light = 1,
    Dark = 2,
    Dim = 3,
    WarmComfort = 4,
    HighContrast = 5,
    FollowSystem = 6,
    Custom = 7,
    ColorVisionFriendly = 8,
    BlackAndWhite = 9,
    // 10 was BlackAndWhiteDark, removed before release. The slot stays unused so any stored
    // preference holding it deserialises to None rather than colliding with a new preset.
    Kids = 11,
    Adults = 12,
    Teenagers = 13
}

public enum AppearanceMode
{
    Light = 0,
    Dark = 1
}

public enum AppearanceFontSize
{
    /// <summary>Default. Must stay 0 so omitted JSON round-trips as Normal, not Low.</summary>
    Normal = 0,
    Low = 1,
    Large = 2
}

public sealed class CustomAppearanceColors
{
    public string ShellBackground { get; set; } = "#1b1b1b";
    public string ShellForeground { get; set; } = "#f5f5f5";
    public string SurfaceBackground { get; set; } = "#2a2a2a";
    public string SurfaceForeground { get; set; } = "#f5f5f5";
    public string AccentBackground { get; set; } = "#1b6ec2";
    public string AccentForeground { get; set; } = "#ffffff";
    public string Link { get; set; } = "#6cb6ff";
    public string Border { get; set; } = "#6e6e6e";
    public string FocusRing { get; set; } = "#ffe066";
    public string SelectedBackground { get; set; } = "#1b6ec2";
    public string SelectedForeground { get; set; } = "#ffffff";
    public string HoverBackground { get; set; } = "#3a3a3a";
    public string ActiveBackground { get; set; } = "#454545";
}

public sealed class AccessibilityOptions
{
    /// <summary>Color-vision-friendly palette bias. Does not claim medical color-blindness correction.</summary>
    public bool ColorVisionFriendly { get; set; }

    /// <summary>Raises normal interface text combinations to a 7:1 target.</summary>
    public bool HighContrast { get; set; }

    public bool ReducedMotion { get; set; }

    public bool EnhancedFocus { get; set; }
}

public sealed class AppearancePreferenceResponse
{
    public bool HasPreference { get; set; }

    public AppearancePreferenceDocument? Preference { get; set; }
}

public sealed class AppearanceValidationProblem
{
    public required string Code { get; init; }
    public required string Message { get; init; }
    public string? Path { get; init; }
    public double? ContrastRatio { get; init; }
    public double? RequiredRatio { get; init; }
    public IReadOnlyList<string> CorrectionOptions { get; init; } = [];
}

public sealed class AppearanceValidationResult
{
    public bool IsValid => Problems.Count == 0;
    public List<AppearanceValidationProblem> Problems { get; } = [];
    public List<ContrastReportItem> ContrastReport { get; } = [];
}

public sealed class ContrastReportItem
{
    public required string Label { get; init; }
    public required string Foreground { get; init; }
    public required string Background { get; init; }
    public required double Ratio { get; init; }
    public required double RequiredRatio { get; init; }
    public bool Passes => Ratio + 0.0001 >= RequiredRatio;
    public string? Role { get; init; }
}
