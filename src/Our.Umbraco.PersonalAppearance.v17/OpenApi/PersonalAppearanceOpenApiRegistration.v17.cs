using Our.Umbraco.PersonalAppearance.Controllers;
using Umbraco.Cms.Core.DependencyInjection;

namespace Our.Umbraco.PersonalAppearance.Composers;

internal static partial class PersonalAppearanceOpenApiRegistration
{
    /// <summary>
    /// Umbraco 17: controllers use ManagementApiControllerBase + MapToApi.
    /// AddBackOfficeOpenApiDocument is an Umbraco 18 API — do not call it here.
    /// </summary>
    static partial void RegisterCore(IUmbracoBuilder builder)
    {
        _ = PersonalAppearanceApiConstants.ApiName;
        _ = builder;
    }
}
