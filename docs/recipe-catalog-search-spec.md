# Recipe Catalog Search Spec

This document describes the current frontend-only search behavior for
`/recipe-catalog` in `web_fridgeProject_recipe`.

## Scope

- Route: `/recipe-catalog`
- Data source: bundled mock seed at `src/data/recipe_seed_mock_100.json`
- Runtime loader: `loadMockRecipes()` in `src/lib/recipeMockData.ts`
- Search/filter engine: `filterRecipes()` in `src/lib/recipeMockData.ts`
- UI entry points:
  - hero search box
  - category rail
  - country chips
  - ingredient chips
  - detailed filter panel
  - active filter chips

The page is public, read-only, and frontend-only. It does not perform login,
signup, save, or backend search requests.

## Normalized Recipe Shape

Seed entries are parsed through `seedFileSchema` and normalized into `Recipe`.

Required frontend fields after normalization:

| Field | Meaning | Fallback |
| --- | --- | --- |
| `id` | Stable card/detail key | `importSource.sourceId` or `mock-{index}` |
| `title` | Recipe title | required by schema |
| `imageUrl` | Card/detail image URL | `null` |
| `description` | Card/detail summary | FreshKeeper mock fallback text |
| `cookingTip` | Searchable tip text | `""` |
| `category` | Category filter value | `_mockMeta.category` or `everyday` |
| `cuisineRegion` | Region filter value | `global` |
| `country` | Country filter value | `_mockMeta.country` or `Global` |
| `cookingTime` | Time filter value | `30min` |
| `difficulty` | Difficulty filter value | `beginner` |
| `recipeType` | Recipe type filter value | `everyday` |
| `primaryIngredient` | Ingredient filter value | `ingredient` |
| `likes` | Mock popularity metric | `24 + index * 3` |
| `views` | Mock view metric | `320 + index * 17` |

## Filter State

`RecipeFilters` is the canonical UI filter state.

```ts
type RecipeFilters = {
  readonly query: string;
  readonly category: string;
  readonly country: string;
  readonly region?: string;
  readonly time?: string;
  readonly difficulty?: string;
  readonly recipeType?: string;
  readonly ingredient?: string;
  readonly sort?: "recommended" | "popular" | "latest";
};
```

Initial state:

```ts
{
  query: "",
  category: "all",
  country: "all",
  region: "all",
  time: "all",
  difficulty: "all",
  recipeType: "all",
  ingredient: "all",
  sort: "recommended"
}
```

`undefined`, `""`, and `"all"` mean no filter for optional/select fields.

## Query Search

The text query is normalized with:

```ts
filters.query.trim().toLocaleLowerCase("ko-KR")
```

The query matches if it is included in any of:

- recipe title
- recipe description
- recipe cooking tip
- joined ingredient names

Search is substring-based. It is not tokenized, ranked, fuzzy, typo-tolerant, or
server-backed.

## Exact-Match Filters

All non-query filters are exact string matches against normalized recipe fields.

| UI label | Filter key | Recipe field |
| --- | --- | --- |
| Category rail | `category` | `recipe.category` |
| Country | `country` | `recipe.country` |
| Cuisine region | `region` | `recipe.cuisineRegion` |
| Cooking time | `time` | `recipe.cookingTime` |
| Difficulty | `difficulty` | `recipe.difficulty` |
| Recipe type | `recipeType` | `recipe.recipeType` |
| Main ingredient | `ingredient` | `recipe.primaryIngredient` |

Multiple active filters are combined with AND semantics.

## Sorting

Sorting runs after filtering.

| Sort | Behavior |
| --- | --- |
| `recommended` | Keep current mock order |
| `popular` | Sort by `likes` descending |
| `latest` | Reverse current mock order |

There is no date-based sort in the current frontend mock implementation.

## Browsing vs Results Mode

The page shows curated browsing sections when all of the following are true:

- `query` is empty after trim
- `category`, `country`, `region`, `time`, `difficulty`, `recipeType`,
  `ingredient` are inactive
- `sort` is `undefined` or `recommended`

Browsing mode sections:

- featured recipes: top 6 from `popularRecipes(recipes)`
- quick meals: top 10 from `quickRecipes(recipes)`
- country chips: all collected countries
- ingredient chips: top 9 primary ingredients by count
- popular mock recipes: top 8 from `popularRecipes(recipes)`

Any active query, filter, or non-default sort switches to results mode.

## Active Filter Chips

Results mode shows active filter chips for:

- query
- region
- country
- time
- difficulty
- recipe type
- category
- ingredient

Clicking an active chip clears only that filter:

- query clears to `""`
- select filters clear to `"all"`

The "전체 보기" / "Clear all" button resets the full filter state to the initial
state.

## Empty State

If `filterRecipes()` returns an empty array in results mode:

- show the friendly empty state
- keep the detailed filter panel available
- provide a reset button that restores the initial filter state

## Localization

Visible labels are localized through `I18nProvider`.

- Korean is the default language.
- English is available through the header language toggle.
- Filter values are translated by `labelFor`, `countryLabel`, and `timeLabel`.
- Emojis and display ordering for time/difficulty come from
  `src/lib/recipeFilterMeta.ts`.

## Current Limitations

- Search is frontend-only and mock-data-only.
- No backend API request is made.
- No pagination or infinite loading.
- No fuzzy matching, stemming, synonym expansion, typo correction, or ranking.
- `latest` is mock reverse order, not true created-at order.
- Current seed has no real image URLs; cards use `RecipeVisual` placeholders.
- Detailed filter options are derived only from values present in the loaded
  seed.

## Acceptance Checks

Run these after changing search behavior:

```bash
npm test
npm run build
npm audit --audit-level=moderate
```

Manual QA:

- `/recipe-catalog` loads 100 mock recipes.
- Searching `두유` returns "기본 두유 음료".
- Category rail switches into results mode.
- Country and ingredient chips apply exact filters.
- Detailed filter selects apply exact filters.
- Active filter chips clear one filter at a time.
- "전체 보기" resets all filters.
- Empty state appears for a query with no matches.
