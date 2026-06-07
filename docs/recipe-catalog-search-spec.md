# Recipe Catalog Search Spec

This document describes the current frontend-only search behavior for
`/recipe-catalog` in `web_fridgeProject_recipe`.

## Scope

- Route: `/recipe-catalog`
- Data source: bundled mock seed at `src/data/recipe_seed_mock_100.json`
- Runtime loader: `loadPublicMockRecipes()` in `src/lib/recipeCatalogMock.ts`
- Search/filter engine: `filterPublicRecipes()` in `src/lib/recipeCatalogMock.ts`
- Request mapper: `toPublicRecipeSearchRequest()` in `src/lib/recipeCatalogRequest.ts`

The page is public, read-only, and frontend-only. It does not perform login,
signup, save, fridge inventory, or backend search requests. The mock contract is
shaped to mirror the native public recipe search payload so the web UI can move
to a real public API later with minimal UI changes.

## Canonical Record Shape

Seed entries are parsed through `seedFileSchema` and normalized into
`PublicRecipeRecord`.

Important fields after normalization:

| Field | Meaning | Fallback |
| --- | --- | --- |
| `recipeId` | Stable card/detail key | `importSource.sourceId` or `mock-{index}` |
| `titleImageUrl` | Card/detail image URL | `null` |
| `writtenLang` | Original recipe language | `ko` |
| `displayLang` | Current display language | `ko-KR` |
| `translationStatus` | `original` or `translated` display state | derived from `writtenLang` |
| `visibility` | Public/private/shared state | coerced to `public` unless seed says otherwise |
| `isUseLocalData` | Local ingredient-name mode | `true` |
| `likeCount` | Mock popularity metric | `24 + index * 3` |
| `viewCount` | Mock hot-month metric | `320 + index * 17` |
| `createdAt` | Mock latest metric | deterministic descending 2026 date |
| `country/city/district` | Region hierarchy | country from `_mockMeta`, city/district synthesized from seed metadata |
| 13 filter fields | Native filter schema | seed value or stable fallback |

## Filter State

`PublicRecipeCatalogFilters` is the canonical UI filter state.

```ts
type PublicRecipeCatalogFilters = {
  readonly query: string;
  readonly sort: "latest" | "popular" | "hot_month";
  readonly writtenLang: "all" | "ko" | "en";
  readonly region: RecipeCatalogRegion;
  readonly isUseLocalData: "all" | "local" | "original";
  readonly recipeType: string;
  readonly cookingMethod: string;
  readonly technique: string;
  readonly dietaryGoal: string;
  readonly dietaryRestriction: string;
  readonly primaryIngredient: string;
  readonly category: string;
  readonly occasion: string;
  readonly difficulty: string;
  readonly cookingTime: string;
  readonly cuisineRegion: string;
  readonly servings: string;
  readonly requiredTool: string;
};
```

Initial state:

```ts
{
  query: "",
  sort: "latest",
  writtenLang: "all",
  region: { scope: "none" },
  isUseLocalData: "all",
  recipeType: "all",
  cookingMethod: "all",
  technique: "all",
  dietaryGoal: "all",
  dietaryRestriction: "all",
  primaryIngredient: "all",
  category: "all",
  occasion: "all",
  difficulty: "all",
  cookingTime: "all",
  cuisineRegion: "all",
  servings: "all",
  requiredTool: "all"
}
```

`"all"` means no filter for select fields.

## Native Request Mapping

`toPublicRecipeSearchRequest(filters, pageNumber, displayLang)` maps UI filters
to a native-shaped public payload.

- `query.trim() === ""` maps to `searchValue: null`
- `"all"` select filters map to `null`
- `recipeVisibility` is always `"public"`
- `isUseLocalData` maps as:
  - `"all"` -> `null`
  - `"local"` -> `true`
  - `"original"` -> `false`
- `region.scope` maps to `regionScope`, `countryCode`, `country`, `city`,
  `district`, `cityKey`, and `districtKey`

## Query Search

The text query is normalized with:

```ts
filters.query.trim().toLocaleLowerCase("ko-KR")
```

The query matches if it is included in any of:

- recipe title
- recipe description
- recipe cooking tip
- ingredient names
- ingredient descriptions

Search is substring-based. It is not tokenized, ranked, fuzzy, typo-tolerant, or
server-backed.

## Exact-Match Filters

All non-query filters are exact string matches against normalized record fields.
Multiple active filters are combined with AND semantics.

The native filter keys are:

- `recipeType`
- `cookingMethod`
- `technique`
- `dietaryGoal`
- `dietaryRestriction`
- `primaryIngredient`
- `category`
- `occasion`
- `difficulty`
- `cookingTime`
- `cuisineRegion`
- `servings`
- `requiredTool`

Additional exact filters:

- `writtenLang`
- `isUseLocalData`
- `region` at country, city, or district scope

## Sorting

Sorting runs after filtering.

| Sort | Behavior |
| --- | --- |
| `latest` | Sort by `createdAt` descending |
| `popular` | Sort by `likeCount` descending |
| `hot_month` | Sort by `viewCount` descending |

There is no web-only `recommended` sort.

## Browsing vs Results Mode

The page shows curated browsing sections when all filters are default:

- query is empty
- sort is `latest`
- written language is `all`
- region scope is `none`
- local-data mode is `all`
- all native filter keys are `all`

Any active query, filter, or non-default sort switches to results mode.

## Active Filter Chips

Results mode shows active filter chips for query, sort, language, region,
local-data mode, and all native filter keys.

Clicking an active chip clears only that filter:

- query clears to `""`
- sort clears to `latest`
- region clears to `{ scope: "none" }`
- select filters clear to `"all"`

The "전체 보기" / "Clear all" button resets the full filter state to the initial
state.

## UI Metadata

Cards and detail views read directly from `PublicRecipeRecord`.

- Cards show title, visual/photo fallback, category, country, time, difficulty,
  servings, like count, and translation language chip when translated.
- Detail shows region hierarchy, time, difficulty, servings, like count,
  translation/original state, representative filter chips, ingredients, steps,
  and the app install CTA.

## Current Limitations

- Search is frontend-only and mock-data-only.
- No backend API request is made.
- No pagination or infinite loading.
- No fuzzy matching, stemming, synonym expansion, typo correction, or ranking.
- Current seed has no real image URLs; cards use `RecipeVisual` placeholders.
- Current seed has no real city/district fields, so mock city/district options
  are synthesized from `_mockMeta.category` and `_mockMeta.dishSlug`.
- Detailed filter options are derived only from values present in the loaded
  seed.

## Acceptance Checks

Run these after changing search behavior:

```bash
npm test
npm run build
npm audit --audit-level=moderate
git diff --check
```

Manual QA:

- `/recipe-catalog` loads 100 mock recipes.
- Searching `두유` switches to results mode.
- Sort options are `latest`, `popular`, and `hot_month`.
- Language, local-data, country/city/district, and all 13 native filters render.
- Selecting `조리법=boil` narrows results.
- Opening a recipe detail shows servings, translation/original state, region,
  filter chips, ingredients, steps, and install CTA.
- Mobile viewport has no horizontal overflow and keeps the sticky app CTA.
