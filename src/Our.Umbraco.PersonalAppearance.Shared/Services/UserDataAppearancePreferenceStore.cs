using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Our.Umbraco.PersonalAppearance.Core.Models;
using Our.Umbraco.PersonalAppearance.Core.Validation;
using Our.Umbraco.PersonalAppearance.Persistence;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Persistence.Querying;

namespace Our.Umbraco.PersonalAppearance.Services;

/// <summary>
/// Persists preferences via Umbraco IUserDataService (native user-data store).
/// Ownership is always resolved from the authenticated backoffice user — never from a client-supplied user id.
/// </summary>
public sealed class UserDataAppearancePreferenceStore : IAppearancePreferenceStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
        WriteIndented = false
    };

    private readonly IUserDataService _userDataService;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly ILogger<UserDataAppearancePreferenceStore> _logger;

    public UserDataAppearancePreferenceStore(
        IUserDataService userDataService,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
        ILogger<UserDataAppearancePreferenceStore> logger)
    {
        _userDataService = userDataService;
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _logger = logger;
    }

    public async Task<AppearancePreferenceResponse> GetForCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        var userKey = RequireCurrentUserKey();
        var existing = await FindAsync(userKey);
        if (existing?.Value is null)
        {
            return new AppearancePreferenceResponse { HasPreference = false };
        }

        var document = Deserialize(existing.Value);
        return new AppearancePreferenceResponse
        {
            HasPreference = document is not null && document.Preset != AppearancePresetId.None,
            Preference = document
        };
    }

    public async Task<AppearancePreferenceSaveResult> SaveForCurrentUserAsync(
        AppearancePreferenceDocument document,
        CancellationToken cancellationToken = default)
    {
        var userKey = RequireCurrentUserKey();

        if (document.Preset == AppearancePresetId.None)
        {
            var deleted = await DeleteForCurrentUserAsync(cancellationToken);
            return new AppearancePreferenceSaveResult
            {
                Success = deleted.Success,
                StatusCode = deleted.StatusCode,
                ErrorCode = deleted.ErrorCode,
                ErrorMessage = deleted.ErrorMessage,
                Preference = null
            };
        }

        var validation = AppearancePreferenceValidator.Validate(document, forPersistence: true);
        if (!validation.IsValid)
        {
            return new AppearancePreferenceSaveResult
            {
                Success = false,
                StatusCode = 400,
                Validation = validation,
                ErrorCode = "validation_failed",
                ErrorMessage = "Preference failed validation and was not saved."
            };
        }

        var existing = await FindAsync(userKey);
        if (existing is not null)
        {
            var current = Deserialize(existing.Value);
            if (current is not null &&
                !string.IsNullOrEmpty(current.ConcurrencyToken) &&
                !string.Equals(current.ConcurrencyToken, document.ConcurrencyToken, StringComparison.Ordinal))
            {
                return new AppearancePreferenceSaveResult
                {
                    Success = false,
                    StatusCode = 409,
                    ErrorCode = "concurrency_conflict",
                    ErrorMessage = "The preference was modified elsewhere. Reload and try again.",
                    Preference = current
                };
            }
        }

        document.SchemaVersion = AppearancePreferenceDocument.CurrentSchemaVersion;
        document.ConcurrencyToken = Guid.NewGuid().ToString("N");
        document.UpdatedAtUtc = DateTimeOffset.UtcNow;
        document.Accessibility ??= new AccessibilityOptions();

        var payload = JsonSerializer.Serialize(document, JsonOptions);

        if (existing is null)
        {
            var create = new UserData
            {
                Key = Guid.NewGuid(),
                UserKey = userKey,
                Group = AppearanceUserDataKeys.Group,
                Identifier = AppearanceUserDataKeys.Identifier,
                Value = payload
            };

            var createAttempt = await _userDataService.CreateAsync(create);
            if (!createAttempt.Success)
            {
                _logger.LogWarning("Failed to create appearance preference for user {UserKey}: {Status}", userKey, createAttempt.Status);
                return new AppearancePreferenceSaveResult
                {
                    Success = false,
                    StatusCode = 500,
                    ErrorCode = "persist_failed",
                    ErrorMessage = "Could not create preference."
                };
            }
        }
        else
        {
            existing.Value = payload;
            var updateAttempt = await _userDataService.UpdateAsync(existing);
            if (!updateAttempt.Success)
            {
                _logger.LogWarning("Failed to update appearance preference for user {UserKey}: {Status}", userKey, updateAttempt.Status);
                return new AppearancePreferenceSaveResult
                {
                    Success = false,
                    StatusCode = 500,
                    ErrorCode = "persist_failed",
                    ErrorMessage = "Could not update preference."
                };
            }
        }

        return new AppearancePreferenceSaveResult
        {
            Success = true,
            StatusCode = 200,
            Preference = document,
            Validation = validation
        };
    }

    public async Task<AppearancePreferenceDeleteResult> DeleteForCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        var userKey = RequireCurrentUserKey();
        var existing = await FindAsync(userKey);
        if (existing is null)
        {
            return new AppearancePreferenceDeleteResult { Success = true, StatusCode = 204 };
        }

        var attempt = await _userDataService.DeleteAsync(existing.Key);
        if (!attempt.Success)
        {
            return new AppearancePreferenceDeleteResult
            {
                Success = false,
                StatusCode = 500,
                ErrorCode = "delete_failed",
                ErrorMessage = "Could not delete preference."
            };
        }

        return new AppearancePreferenceDeleteResult { Success = true, StatusCode = 204 };
    }

    private Guid RequireCurrentUserKey()
    {
        var user = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser
                   ?? throw new UnauthorizedAccessException("Authenticated backoffice user is required.");
        return user.Key;
    }

    private async Task<IUserData?> FindAsync(Guid userKey)
    {
        var filter = new UserDataFilter
        {
            UserKeys = new List<Guid> { userKey },
            Groups = new List<string> { AppearanceUserDataKeys.Group },
            Identifiers = new List<string> { AppearanceUserDataKeys.Identifier }
        };

        var page = await _userDataService.GetAsync(0, 1, filter);
        return page.Items.FirstOrDefault();
    }

    private static AppearancePreferenceDocument? Deserialize(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<AppearancePreferenceDocument>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }
}
