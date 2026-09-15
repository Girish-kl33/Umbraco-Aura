# Example hosts

These hosts are the intended integration targets for **tested** compatibility:

| Host folder | Umbraco | Package project |
|-------------|---------|-----------------|
| `Umbraco17.Host` | 17.6.2 | `Our.Umbraco.PersonalAppearance.v17` |
| `Umbraco18.Host` | 18.1.1 | `Our.Umbraco.PersonalAppearance.v18` |

## Create a host (one-time)

```bash
# Umbraco 17
dotnet new install Umbraco.Templates::17.6.2
dotnet new umbraco -n Umbraco17.Host -o hosts/Umbraco17.Host --version 17.6.2
dotnet add hosts/Umbraco17.Host reference ../../src/Our.Umbraco.PersonalAppearance.v17/Our.Umbraco.PersonalAppearance.v17.csproj

# Umbraco 18
dotnet new install Umbraco.Templates::18.1.1
dotnet new umbraco -n Umbraco18.Host -o hosts/Umbraco18.Host --version 18.1.1
dotnet add hosts/Umbraco18.Host reference ../../src/Our.Umbraco.PersonalAppearance.v18/Our.Umbraco.PersonalAppearance.v18.csproj
```

Then:

```bash
cd client && npm run build
dotnet run --project hosts/Umbraco17.Host
```

## Feasibility checklist on a live host

1. Log in as User A → Profile → **Appearance & Accessibility** is present
2. Choose Dark → Preview → shell label/header region changes; textbox/RTE interiors stay native
3. Save for me → reload → preference returns
4. Log in as User B → native appearance (isolation)
5. Reset → preference deleted; zero package overrides
6. PUT invalid hex / low contrast → 400; live shell unchanged
7. Confirm content node is not dirty after theme changes

Until hosts are generated in this environment, host verification is marked **not executed** in `docs/VERIFICATION-REPORT.md`.
