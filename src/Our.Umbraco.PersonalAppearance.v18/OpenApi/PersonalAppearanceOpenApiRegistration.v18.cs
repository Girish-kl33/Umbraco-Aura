using Our.Umbraco.PersonalAppearance.Controllers;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.DependencyInjection;

namespace Our.Umbraco.PersonalAppearance.Composers;

internal static partial class PersonalAppearanceOpenApiRegistration
{
    /// <summary>
    /// Umbraco 18: Microsoft.AspNetCore.OpenApi + AddBackOfficeOpenApiDocument.
    /// </summary>
    static partial void RegisterCore(IUmbracoBuilder builder)
    {
        builder.AddBackOfficeOpenApiDocument(
            PersonalAppearanceApiConstants.ApiName,
            document => document
                .WithTitle("Personal Appearance API")
                .WithBackOfficeAuthentication());
    }
}
