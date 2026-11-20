# Diet redefinition — web client (W-D1, repaired)

Date: 2026-11-16
Repo: `web_fridgeProject_recipe`
Worktree: `/Users/hyunwu/.paseo/worktrees/1th6dcup/diet-redefinition-web-1116`
Branch: `c127/diet-redefinition-web-1116`
Base: `18c2a5289f36351586585f7e213fec6e13b7add8`

## What this web client actually has

- The web has **no diet profile and no verified-diet selection**. Its only diet-like search field is
  `dietaryRestriction`, which is the recipe author/catalog restriction (`none`, `vegan`, `halal`,
  `gluten-free`, `lactose-free`). It is **not** the server's verified `dietFilter`.
- `lacto_ovo` and `pescatarian` are labels for recipe data, not selectable values of this author-tag
  filter. Adding them as author-tag filter options would send an enum value the current server filter
  does not accept.
- Data can be either mock/static (`isMockMode`) or the live server. This change was type-checked
  (`tsc --noEmit`) and statically diff-checked here. The focused behavior test file is prepared for
  SER5 train 29; it was not run as acceptance evidence in this repair. No browser, mock screen, or live
  server response was rendered here.

## Changed files

| File | Change |
|---|---|
| `src/lib/recipeLabels.ts` | ko/en labels, typed unsupported error, selectable-option guard, deprecated author tag label |
| `src/components/FilterBar.tsx` | normalized selected value, guarded options, explicit unsupported notice |
| `src/components/RecipeCatalogPage.tsx` | typed unsupported error state from load/mock failures |
| `src/components/RecipeCatalogResultsContent.tsx` | explicit unsupported-filter error block |
| `src/lib/recipeCatalogRequest.ts` | throws typed error instead of returning null for unsupported; legacy `vegetarian`→`vegan` |
| `src/lib/recipeCatalogMock.ts` | validates selected filter, compares it to raw recipe author values, never promotes recipe tags |
| `src/lib/recipeCatalogUrlSync.ts` | legacy filter `vegetarian`→`vegan` at URL rehydration |
| `src/lib/recipeCatalogTypes.ts` | comment: `dietaryRestriction` is author/catalog restriction |
| `src/lib/recipeApi.ts` | accepts `dietDefinitionVersion` from filter-options |
| `src/lib/recipeServerTypes.ts` | optional `dietDefinitionVersion` filter-options field |
| `src/lib/recipeGuestAuth.ts` | common `X-KeepCook-Diet-Contract: 2` header |
| `src/components/InstallPage.tsx` | marketing mock tag `채식` → `비건(완전 채식)` |
| `src/lib/dietRedefinition.test.ts` | focused contract tests for the filter boundary |

## Labels

Korean:

| value | label |
|---|---|
| `vegan` | `비건(완전 채식)` |
| `lacto_ovo` | `락토오보` |
| `pescatarian` | `페스코` |
| `halal` | `할랄` |
| `gluten-free` | `글루텐프리` |
| `lactose-free` | `락토프리` |
| `none` | `제한 없음` |
| `vegetarian` (author tag) | `채식(작성자 태그·미검증)` — not a verified vegan label |

English:

| value | label |
|---|---|
| `vegan` | `Vegan` |
| `lacto_ovo` | `Vegetarian (lacto-ovo)` |
| `pescatarian` | `Pescatarian (plant-based + seafood)` |
| `halal` | `Halal` |
| `gluten-free` | `Gluten-free` |
| `lactose-free` | `Lactose-free` |
| `none` | `None` |
| `vegetarian` (author tag) | `Vegetarian (author tag, unverified)` |

`labelFor("vegetarian")` is deliberately not the vegan label. A recipe author tag is not verified
evidence, and the old `vegetarian` author value must not be promoted to vegan.

## Filter boundary

- Default selectable author-tag options: `vegan`, `halal`, `none`.
- `gluten-free`, `lactose-free`, deprecated `vegetarian`, and unknown/new values are **never offered**
  as selectable options.
- A legacy URL `vegetarian` is normalized to `vegan` only at the filter/URL state boundary. Recipe
  author tags and evidence stay raw.
- Search/suggestion/category transitions preserve the current `dietaryRestriction`; only an explicit
  `All`, reset, or the chip's own clear releases it. The query-suggestion fetch also carries the current
  value and is skipped entirely for an unsupported value.
- A URL `dietaryRestriction` that is absent or exactly empty is `all` (no filter). A whitespace value is
  an opaque unknown and is rejected, not auto-released.
- If the current filter is unsupported (`lacto_ovo`, `pescatarian`, `gluten-free`, `lactose-free`,
  unknown), the state is preserved and FilterBar shows an explicit notice. The page does not show it as
  `all` and does not execute an unfiltered search.
- `normalizeDietaryRestrictionRequestValue` returns `null` only for `all`/absent. `none` is sent as
  `"none"`. Any other non-executable value throws `UnsupportedDietFilterError`; HTTP and mock paths catch
  it through the same page error path.
- The throw is never in render/`useMemo`: `filterPublicRecipes` is called only inside the async
  `loadCatalog*` functions, and `toPublicRecipeSearchRequest` only inside the async fetch path. The page
  catch keeps the opaque selected filter, shows the explicit error, and does **not** retry with null/all.
  Only a user action (`All`/reset) clears it.
- Mock filtering validates the selected filter before filtering; the recipe author value is compared
  raw. A legacy `vegetarian` filter therefore matches `vegan` recipes, not old author-tagged
  `vegetarian` recipes.
- Legacy alias and label/emoji lookups are own-key only. URL values such as `__proto__`, `constructor`,
  or `toString` stay strings, render as text, and are rejected at the request boundary; they never
  return an inherited object.
- The FilterBar notice and page error use the existing `t()` keys (`filters.unsupportedDiet`,
  `results.unsupportedDietTitle`, `results.unsupportedDietBody`) and do not print the raw code.

## HTTP contract / server readiness

- Common HTTP requests now send `X-KeepCook-Diet-Contract: 2` (`src/lib/recipeGuestAuth.ts`).
- `ServerRecipeFilterOptionsResponse` accepts optional `dietDefinitionVersion`; `loadCatalogFilterOptions`
  stores it in `CatalogFilterOptions.dietDefinitionVersion` (mock/static is `null`).
- The server authored fixture `docs/fixtures/diet-definition-v2/filter-options.json` (29c8c508) carries
  `dietDefinitionVersion: 2` and `dietaryRestriction: ["vegan","halal","none"]`, which matches this web
  parser/selectable set. It is an authored fixture, not an actual serializer response; SER5 owns the
  equality run.
- The header is not readiness proof. The web still does not send `lacto_ovo`; it has no verified diet
  selection. Server `29c8c508` confirmed: filter-options is readable without the header, and
  `data.dietDefinitionVersion: 2` is the only v2 support signal. When v2 is ON, all consumers must send
  the header. The web sends it now; a v2 selection surface is still out of this card.

## Commands run

```bash
./node_modules/.bin/tsc --noEmit
# exit 0

git diff --check
# exit 0

# Behavior QA is deferred to SER5 train 29; record only, do not use as local acceptance:
# ./node_modules/.bin/vitest run src/lib/dietRedefinition.test.ts src/lib/recipeCatalogMock.test.ts
```

`npm ci` was not re-run in this repair (dependency install already existed). One focused vitest run
occurred during the repair before the execution-boundary correction; it is preserved as an execution
fact, not acceptance evidence, and must be re-run on SER5. `npm run build` (full Vite bundle), Vite dev,
browser rendering, simulator/device QA, and live API calls were not run.

## Compatibility limits

1. The web's only diet-like filter is author/catalog `dietaryRestriction`; it is not verified
   `dietFilter`. `lacto_ovo`/`pescatarian` are labels only, not selectable values here.
2. GF/LF are hidden from options and are treated as unsupported when selected from a legacy URL; the
   page shows an explicit error rather than running unfiltered.
3. A stale URL may still contain `vegetarian`; URL rehydration normalizes it to `vegan`, but this is a
   filter-state normalization only. Recipe author tags are not normalized.
4. Recipe-card tag rendering (`src/components/RecipeCard.tsx`, not owned here) is unchanged. A wholly
   unknown future author code would still render raw on a card, though it cannot become a filter chip.
5. The header is sent, but server readiness is still `dietDefinitionVersion: 2`; no new diet wire value
   is sent by this web client.
6. No product layout or visual design was added. The error/notice uses the existing `empty-state` and
   `filter-panel__subtitle` styles.
