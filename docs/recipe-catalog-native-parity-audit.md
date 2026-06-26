# Recipe Catalog Native Parity Audit

This audit compares the current `web_fridgeProject_recipe` `/recipe-catalog`
implementation with the Keep Cook native app's recipe read/search business
logic. Private AI recipe generation and AI recipe creation are intentionally
out of scope. Public read, search, filter, region, localization, card, and
detail behavior should match.

## Current Web Implementation Summary

Current route:

- `/recipe-catalog`

Current data source:

- `src/data/recipe_seed_mock_100.json`
- `loadMockRecipes()` and `filterRecipes()` in `src/lib/recipeMockData.ts`

Current UI:

- Hero keyword search
- Category rail
- Browsing sections
- Country chips
- Ingredient chips
- Detailed filter panel
- Active filter chips
- Recipe card grid
- Recipe detail side panel
- App install CTA

Current implementation is a good public browsing baseline, but it is not yet
business-logic equivalent to the native app recipe search/read flow.

## Parity Verdict

| Area | Current Web Status | Native Parity |
|---|---|---|
| Public recipe browsing | Present | Partial |
| Keyword search | Present, frontend substring only | Partial |
| Sort | `recommended`, `popular`, `latest` | Mismatch |
| Region search | Simple `cuisineRegion`/`country` only | Missing |
| Original language filter | Missing | Missing |
| Local ingredient naming toggle | Missing | Missing |
| Full filter schema | Partial | Missing |
| Recipe cards | Present | Partial |
| Recipe detail read | Present | Partial |
| Translation/original-language metadata | Missing | Missing |
| Pagination | Missing | Missing |
| Server response shape | Missing | Missing |
| App-only CTA positioning | Present | Partial |

## Native Read/Search Contract To Mirror

The native app search request shape is conceptually:

```ts
type RecipeSearchPayload = {
  ingredients: RecipeSearchPayloadIngredient[];
  searchValue: string | null;
  writtenLang?: string | null;
  sort?: "latest" | "popular" | "hot_month" | null;
  regionScope?: "country" | "city" | "district" | null;
  countryCode?: string | null;
  country?: string | null;
  city?: string | null;
  district?: string | null;
  cityKey?: string | null;
  districtKey?: string | null;
  region?: RecipeSearchRegion | null;
  recipeType?: string | null;
  cookingMethod?: string | null;
  technique?: string | null;
  dietaryGoal?: string | null;
  dietaryRestriction?: string | null;
  primaryIngredient?: string | null;
  category?: string | null;
  occasion?: string | null;
  difficulty?: string | null;
  cookingTime?: string | null;
  cuisineRegion?: string | null;
  servings?: string | null;
  requiredTool?: string | null;
  recipeSource?: "ai" | "user" | null;
  recipeVisibility?: "private" | "shared" | "public" | null;
  isUseLocalData?: boolean | null;
};
```

For public web catalog search:

- `recipeVisibility` should default to `public`.
- `recipeSource` can usually be `null` unless a public page wants source tabs.
- `ingredients` should usually be empty unless the web catalog adds a public
  ingredient-first mode.
- AI private generation and AI recipe creation are excluded.

## Required Filter Parity

The current web filter state:

```ts
type RecipeFilters = {
  query: string;
  category: string;
  country: string;
  region?: string;
  time?: string;
  difficulty?: string;
  recipeType?: string;
  ingredient?: string;
  sort?: "recommended" | "popular" | "latest";
};
```

Should become closer to:

```ts
type PublicRecipeCatalogFilters = {
  readonly query: string;
  readonly sort: "latest" | "popular" | "hot_month";
  readonly writtenLang: "all" | "ko-KR" | "en-US";
  readonly region: RecipeCatalogRegionSelection;
  readonly isUseLocalData: boolean | "all";
  readonly recipeType: string | "all";
  readonly cookingMethod: string | "all";
  readonly technique: string | "all";
  readonly dietaryGoal: string | "all";
  readonly dietaryRestriction: string | "all";
  readonly primaryIngredient: string | "all";
  readonly category: string | "all";
  readonly occasion: string | "all";
  readonly difficulty: string | "all";
  readonly cookingTime: string | "all";
  readonly cuisineRegion: string | "all";
  readonly servings: string | "all";
  readonly requiredTool: string | "all";
};
```

### Missing Filters

Add these missing filter controls:

- Original language: all, Korean, English
- Local ingredient naming: all, local ingredients, original ingredients
- Cooking method
- Technique
- Dietary goal
- Dietary restriction
- Occasion
- Servings
- Required tool
- Hot this month sort

### Sort Mismatch

Current web:

- `recommended`
- `popular`
- `latest`

Native read/search:

- `latest`
- `popular`
- `hot_month`

Recommended action:

- Remove `recommended` from results/search mode.
- Use `latest` as the default public search sort.
- Keep curated browsing sections for editorial/recommended presentation.

## Region Parity

Current web only has:

- `country`
- `cuisineRegion`

Native app supports recipe region selection:

- All regions
- My location preset
- My country preset
- Country
- City
- District

Web should implement the same conceptual filter without relying on a logged-in
house. For public web, use:

- `All regions`
- `Country`
- `City`
- `District`
- Optional browser/user locale preset if available

Expected region value:

```ts
type RecipeCatalogRegionSelection =
  | { readonly scope: "none" }
  | {
      readonly scope: "country";
      readonly countryCode: string;
      readonly country: string;
    }
  | {
      readonly scope: "city";
      readonly countryCode: string;
      readonly country: string;
      readonly city: string;
      readonly cityKey: string;
    }
  | {
      readonly scope: "district";
      readonly countryCode: string;
      readonly country: string;
      readonly city: string;
      readonly cityKey: string;
      readonly district: string;
      readonly districtKey: string;
    };
```

Mock region options can be derived from recipe seed fields after normalization.
The current seed already contains some canonical region fields in the recipe
shape in native data; the web normalizer currently ignores most of them.

## Data Shape Gaps

Current `Recipe` omits several native read fields:

- `recipeId`
- `titleImageUrl` naming parity
- `writtenLang`
- `requestedDisplayLang`
- `displayLang`
- `availableLangs`
- `isOriginal`
- `isTranslated`
- `translationStatus`
- `source`
- `visibility`
- `isUseLocalData`
- `likeCount`
- `viewCount`
- `isFavorite`
- `isSaved`
- `isWriter`
- `countryCode`
- `city`
- `district`
- `canonicalCountry`
- `canonicalCity`
- `canonicalDistrict`
- `cityKey`
- `districtKey`
- `createdAt`
- full filter fields: `cookingMethod`, `technique`, `dietaryGoal`,
  `dietaryRestriction`, `occasion`, `servings`, `requiredTool`

Recommended action:

- Replace the current simplified `Recipe` type with a public web normalized
  item that mirrors native `RecipeSearchResponseRecipe`.
- Keep web-only computed fields only as derived view model fields, not as the
  canonical recipe record.

## UI Parity Gaps

### Filter UI

Current filter UI is close to the requested square selector card style, but the
filter set is incomplete.

Recommended layout:

1. Top row:
   - Sort
   - Original language
   - Recipe region
2. Secondary row:
   - Cuisine region
   - Cooking time
   - Difficulty
3. Advanced drawer:
   - Recipe type
   - Cooking method
   - Technique
   - Dietary goal
   - Dietary restriction
   - Primary ingredient
   - Category
   - Occasion
   - Servings
   - Required tool
   - Local ingredient naming

### Cards

Current cards show:

- category badge
- country badge
- title
- description
- ingredient preview
- time
- difficulty
- likes

Native public read/search cards should show:

- image or same media-box fallback
- translated title prefix emoji when relevant
- title with wrapping, not truncation
- time
- difficulty
- servings where available
- at most two compact filter chips on dense cards
- local/original language badge when useful
- saved/favorite state only if public web supports auth later; otherwise hide

### Detail Panel

Current detail panel shows ingredients, steps, time, difficulty, category, and
likes. It should also support:

- original language/translation metadata
- servings
- source/visibility only if useful for public context
- region hierarchy
- full filter chips
- local ingredient naming state
- app CTA messages tied to app-only value:
  - match this recipe with my fridge
  - save to personal recipe book
  - get expiry-aware recommendations

## Search Behavior Gaps

Current search is frontend substring matching. For mock parity, this is okay as
a temporary substitute, but the filter semantics should mirror native:

- Query maps to `searchValue`.
- Ingredient mention query may become structured ingredients in app; public web
  can keep it as text unless ingredient chips are added.
- Filters should be sent as schema fields, not ad-hoc web-only names.
- Cooking time may need soft matching in mock mode, e.g. a `10min` filter can
  match exact `10min`; app mock utilities also support time filter matching.
- Region matching should use `countryCode`, `cityKey`, and `districtKey`, not
  display labels.

## Implementation Priorities

### P0: Contract parity foundation

- Expand `Recipe` normalization to include native response fields.
- Replace web sort values with native sort values.
- Add full filter keys to `RecipeFilters`.
- Add original language and local ingredient controls.
- Add region object selection.
- Update active filter chips to include every filter.
- Update tests for every filter family.

### P1: UI parity

- Restructure filter panel into top row, secondary row, advanced drawer.
- Add emoji mappings from native `FILTER_CHIP_EMOJI`.
- Update recipe cards to display time, difficulty, servings, and compact filter
  chips.
- Update detail panel metadata and CTA copy.

### P2: Mock/server bridge

- Add mock `searchPublicRecipes()` that accepts a native-shaped request.
- Keep frontend mock search and future backend search behind the same
  contract.
- Add mock region catalog helpers.
- Add pagination fields: `isPrev`, `isAfter`, `pageNumber`.

## Acceptance Criteria

- `/recipe-catalog` can be implemented with the same public read/search request
  contract as native, excluding AI private/generation flows.
- All visible filters have matching value IDs, labels, and emojis.
- Active chips clear one filter at a time.
- Region filters support all/country/city/district shape.
- Language filter supports all/Korean/English.
- Local ingredient naming filter is represented.
- Cards and detail can render translated/original language metadata.
- Mock and future backend implementations share the same request/response
  types.
