using Microsoft.Extensions.DependencyInjection;
using Our.Umbraco.PersonalAppearance.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

namespace Our.Umbraco.PersonalAppearance.Composers;

public sealed class PersonalAppearanceComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddUnique<IAppearancePreferenceStore, UserDataAppearancePreferenceStore>();
        PersonalAppearanceOpenApiRegistration.Register(builder);
    }
}
