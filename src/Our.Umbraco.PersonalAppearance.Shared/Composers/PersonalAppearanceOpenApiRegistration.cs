using Umbraco.Cms.Core.DependencyInjection;

namespace Our.Umbraco.PersonalAppearance.Composers;

/// <summary>
/// Version-specific OpenAPI registration. Implemented differently for Umbraco 17 and 18.
/// </summary>
internal static partial class PersonalAppearanceOpenApiRegistration
{
    public static void Register(IUmbracoBuilder builder) => RegisterCore(builder);

    static partial void RegisterCore(IUmbracoBuilder builder);
}
