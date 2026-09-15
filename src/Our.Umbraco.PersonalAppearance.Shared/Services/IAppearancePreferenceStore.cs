using Our.Umbraco.PersonalAppearance.Core.Models;
using Our.Umbraco.PersonalAppearance.Core.Validation;

namespace Our.Umbraco.PersonalAppearance.Services;

public interface IAppearancePreferenceStore
{
    Task<AppearancePreferenceResponse> GetForCurrentUserAsync(CancellationToken cancellationToken = default);

    Task<AppearancePreferenceSaveResult> SaveForCurrentUserAsync(
        AppearancePreferenceDocument document,
        CancellationToken cancellationToken = default);

    Task<AppearancePreferenceDeleteResult> DeleteForCurrentUserAsync(CancellationToken cancellationToken = default);
}

public sealed class AppearancePreferenceSaveResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public AppearancePreferenceDocument? Preference { get; init; }
    public AppearanceValidationResult? Validation { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
}

public sealed class AppearancePreferenceDeleteResult
{
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
}
