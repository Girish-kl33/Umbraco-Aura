# Feasibility prototype notes

This repository’s first delivery slice is a **two-version feasibility prototype** plus the surrounding architecture package.

## Demonstrated in code

1. **Profile entry** — `userProfileApp` manifest registered from the backoffice entry point; Lit element `our-pa-appearance-profile-app`.
2. **Personal preference storage** — `IAppearancePreferenceStore` → `UserDataAppearancePreferenceStore` using Umbraco `IUserDataService` (no custom table, no user schema change).
3. **Themed shell region + label** — semantic tokens applied to `.our-pa-shell-surface` / `.our-pa-shell-label` and verified chrome selectors.
4. **Unchanged textbox/RTE presentation** — protection policy + CSS that does not restyle protected interiors; preview panel includes native inputs for visual confirmation.

## How to prove on hosts

Follow `hosts/README.md` feasibility checklist. Until hosts run, treat host rows in `VERIFICATION-REPORT.md` as not executed.
