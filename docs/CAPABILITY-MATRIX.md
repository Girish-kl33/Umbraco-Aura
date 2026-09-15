# Support / capability matrix

Legend:
- **Intended** — designed for this surface
- **Verified in-repo** — covered by automated tests or static policy checks in this repository
- **Host-verified** — requires running Umbraco 17/18 example hosts (see VERIFICATION-REPORT)
- **Unavailable / native** — left unchanged when safe public hooks are missing

| Capability | U17.6.2 | U18.1.1 | Notes |
|------------|---------|---------|-------|
| Native `theme` manifest integration | Implemented | Intended | Presets appear in Umbraco's existing Theme dropdown |
| Appearance Studio `section` / `sectionView` | Implemented | Intended | Section access follows normal Umbraco user-group section access |
| Personal preference GET/PUT/DELETE | Intended | Intended | Current-user only Management API |
| `IUserDataService` persistence | Intended | Intended | No custom table; no user schema change |
| OpenAPI document registration | Intended (Management pipeline) | Intended (`AddBackOfficeOpenApiDocument`) | **Different per major** |
| Light / Dark / Dim / Warm Comfort / High Contrast | Intended + Verified in-repo (tokens/validation) | Same | |
| Follow System | Implemented | Intended | Native theme CSS uses `prefers-color-scheme` |
| Custom colors (opaque hex) | Intended + Verified in-repo | Same | |
| Approved font IDs | Intended + Verified in-repo | Same | Arbitrary stacks rejected |
| Color-vision-friendly bias | Intended | Intended | Not a medical correction claim |
| Reduced motion | Intended | Intended | |
| Enhanced focus | Intended | Intended | Recovery controls remain usable |
| WCAG luminance contrast 4.5:1 / 3:1 / 7:1 HC | Verified in-repo | Verified in-repo | |
| Shell chrome theming | Intended | Intended | Header/sidebar/labels/borders |
| Textbox interior styling | Unavailable / native | Same | Explicitly protected |
| RTE toolbar/content styling | Unavailable / native | Same | Explicitly protected |
| Code editor presentation | Unavailable / native | Same | Explicitly protected |
| Content preview / media / website output | Unavailable / native | Same | Out of scope |
| Shadow DOM private rewriting | Disallowed | Disallowed | |
| Global page `filter` | Disallowed + Verified in-repo | Same | |
| Native `umb-dark-theme` as isolation strategy | Insufficient alone | Insufficient alone | Documented limitation |

## Feasibility prototype gates

| Gate | Result in package design |
|------|--------------------------|
| Profile entry exists | `userProfileApp` + Lit profile element |
| Personal preference storage | `IUserDataService` store |
| Themed shell region + label | `.our-pa-shell-surface` / `.our-pa-shell-label` tokens |
| Unchanged textbox/RTE presentation | Editor protection policy + CSS non-styling of interiors |
| Content not dirtied | No content writes; preferences are user-data only |
