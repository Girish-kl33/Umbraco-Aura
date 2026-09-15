namespace Our.Umbraco.PersonalAppearance.Core.Fonts;

/// <summary>Approved font catalog. Arbitrary CSS font stacks and uploaded fonts are rejected.</summary>
public static class ApprovedFontCatalog
{
    public static IReadOnlyDictionary<string, ApprovedFontDefinition> All { get; } =
        new Dictionary<string, ApprovedFontDefinition>(StringComparer.OrdinalIgnoreCase)
        {
            ["umbraco-default"] = new("umbraco-default", "Umbraco default", "inherit", "Native backoffice font stack"),
            ["system-ui"] = new("system-ui", "System UI", "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif", "Platform UI fonts"),
            ["source-sans"] = new("source-sans", "Source Sans 3", "\"Source Sans 3\", \"Segoe UI\", sans-serif", "Approved open UI font"),
            ["ibm-plex-sans"] = new("ibm-plex-sans", "IBM Plex Sans", "\"IBM Plex Sans\", \"Segoe UI\", sans-serif", "Approved open UI font"),
            ["atkinson-hyperlegible"] = new("atkinson-hyperlegible", "Atkinson Hyperlegible", "\"Atkinson Hyperlegible\", \"Segoe UI\", sans-serif", "Legibility-oriented approved font"),
            ["opendyslexic"] = new("opendyslexic", "OpenDyslexic", "OpenDyslexic, \"Segoe UI\", sans-serif", "Approved dyslexia-friendly option; not a medical claim"),
            ["georgia"] = new("georgia", "Georgia", "Georgia, \"Times New Roman\", serif", "Approved serif option"),
            ["verdana"] = new("verdana", "Verdana", "Verdana, Geneva, sans-serif", "Approved high-x-height sans")
        };

    public static bool IsApproved(string? fontFamilyId) =>
        !string.IsNullOrWhiteSpace(fontFamilyId) && All.ContainsKey(fontFamilyId);

    public static string ResolveCssStack(string? fontFamilyId) =>
        IsApproved(fontFamilyId) ? All[fontFamilyId!].CssStack : All["umbraco-default"].CssStack;
}

public sealed record ApprovedFontDefinition(
    string Id,
    string DisplayName,
    string CssStack,
    string Description);
