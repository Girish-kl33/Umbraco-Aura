using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Our.Umbraco.PersonalAppearance.Core.Models;
using Our.Umbraco.PersonalAppearance.Services;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Web.Common.Authorization;

namespace Our.Umbraco.PersonalAppearance.Controllers;

/// <summary>
/// Current-user-only appearance preference API.
/// Ownership is resolved server-side from the authenticated user; no target user ID is accepted.
/// </summary>
[ApiExplorerSettings(GroupName = "Personal Appearance")]
[MapToApi(PersonalAppearanceApiConstants.ApiName)]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[Route("umbraco/management/api/v1/our-personal-appearance")]
public sealed class AppearancePreferenceController : ManagementApiControllerBase
{
    private readonly IAppearancePreferenceStore _store;

    public AppearancePreferenceController(IAppearancePreferenceStore store) => _store = store;

    [HttpGet("preference")]
    [ProducesResponseType(typeof(AppearancePreferenceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var response = await _store.GetForCurrentUserAsync(cancellationToken);
        return Ok(response);
    }

    [HttpPut("preference")]
    [ProducesResponseType(typeof(AppearancePreferenceDocument), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Put([FromBody] AppearancePreferenceDocument document, CancellationToken cancellationToken)
    {
        if (document is null)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid payload",
                Detail = "Request body is required.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var result = await _store.SaveForCurrentUserAsync(document, cancellationToken);
        if (result.Success)
        {
            return Ok(result.Preference);
        }

        if (result.StatusCode == StatusCodes.Status409Conflict)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Concurrency conflict",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status409Conflict,
                Extensions = { ["preference"] = result.Preference, ["code"] = result.ErrorCode }
            });
        }

        return BadRequest(new ProblemDetails
        {
            Title = "Validation failed",
            Detail = result.ErrorMessage,
            Status = StatusCodes.Status400BadRequest,
            Extensions =
            {
                ["code"] = result.ErrorCode,
                ["problems"] = result.Validation?.Problems,
                ["contrastReport"] = result.Validation?.ContrastReport
            }
        });
    }

    [HttpDelete("preference")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Delete(CancellationToken cancellationToken)
    {
        var result = await _store.DeleteForCurrentUserAsync(cancellationToken);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new ProblemDetails
            {
                Title = "Delete failed",
                Detail = result.ErrorMessage,
                Status = result.StatusCode,
                Extensions = { ["code"] = result.ErrorCode }
            });
        }

        return NoContent();
    }
}

public static class PersonalAppearanceApiConstants
{
    public const string ApiName = "our-personal-appearance";
}
