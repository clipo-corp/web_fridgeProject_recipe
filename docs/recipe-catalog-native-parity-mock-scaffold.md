# Recipe Catalog Native Parity Mock Scaffold

Use this scaffold to rebuild `web_fridgeProject_recipe` so public recipe search
uses the same read/search business contract as the FreshKeeper native app.

AI private recipe generation and AI recipe creation are excluded. Everything
below is public read/search/catalog logic.

## Suggested File Plan

Create or replace these files:

```text
src/lib/recipeCatalogTypes.ts
src/lib/recipeCatalogFilters.ts
src/lib/recipeCatalogEmoji.ts
src/lib/recipeCatalogLabels.ts
src/lib/recipeCatalogMock.ts
src/lib/recipeCatalogRegion.ts
src/lib/recipeCatalogRequest.ts
src/lib/recipeCatalogMock.test.ts
```

Keep UI files consuming these modules:

```text
src/components/RecipeCatalogPage.tsx
src/components/FilterBar.tsx
src/components/RecipeCard.tsx
src/components/RecipeDetail.tsx
```

## Canonical Types

```ts
export type RecipeSearchSort = "latest" | "popular" | "hot_month";

export type RecipeSearchRegionScope = "country" | "city" | "district";

export type RecipeSearchRegion = {
  readonly scope: RecipeSearchRegionScope | "none" | null;
  readonly countryCode: string | null;
  readonly country: string | null;
  readonly city: string | null;
  readonly district: string | null;
  readonly cityKey: string | null;
  readonly districtKey: string | null;
};

export type RecipeRegionOption = {
  readonly regionScope: RecipeSearchRegionScope;
  readonly country: string | null;
  readonly countryCode: string;
  readonly city: string | null;
  readonly cityKey: string | null;
  readonly district: string | null;
  readonly districtKey: string | null;
  readonly canonicalCountry: string | null;
  readonly canonicalCity: string | null;
  readonly canonicalDistrict: string | null;
  readonly recipeCount: number;
};

export type RecipeFilterKey =
  | "recipeType"
  | "cookingMethod"
  | "technique"
  | "dietaryGoal"
  | "dietaryRestriction"
  | "primaryIngredient"
  | "category"
  | "occasion"
  | "difficulty"
  | "cookingTime"
  | "cuisineRegion"
  | "servings"
  | "requiredTool";

export type RecipeSource = "ai" | "user";
export type RecipeVisibility = "private" | "shared" | "public";

export type RecipeIngredient = {
  readonly masterId: number;
  readonly quantity: number;
  readonly unit: string;
  readonly description?: string | null;
  readonly name?: string | null;
};

export type RecipeStep = {
  readonly way: string;
  readonly imageUrl: string | null;
  readonly stepNumber: number;
  readonly cookingTip?: string | null;
};

export type PublicRecipeRecord = {
  readonly recipeId: number | string;
  readonly title: string;
  readonly titleImageUrl: string | null;
  readonly description: string | null;
  readonly cookingTip: string | null;
  readonly ingredients: readonly RecipeIngredient[];
  readonly steps: readonly RecipeStep[];
  readonly writtenLang: string;
  readonly requestedDisplayLang: string;
  readonly displayLang: string;
  readonly availableLangs: readonly string[];
  readonly isOriginal?: boolean;
  readonly isTranslated?: boolean;
  readonly translationStatus?: "original" | "translated" | "fallback_original";
  readonly source: RecipeSource | null;
  readonly visibility: RecipeVisibility | null;
  readonly isUseLocalData: boolean;
  readonly likeCount: number | null;
  readonly viewCount: number | null;
  readonly isFavorite: boolean;
  readonly isSaved: boolean;
  readonly isWriter: boolean;
  readonly country: string | null;
  readonly countryCode: string | null;
  readonly city: string | null;
  readonly district: string | null;
  readonly canonicalCountry: string | null;
  readonly canonicalCity: string | null;
  readonly canonicalDistrict: string | null;
  readonly cityKey: string | null;
  readonly districtKey: string | null;
  readonly createdAt: string | null;
  readonly recipeType: string | null;
  readonly cookingMethod: string | null;
  readonly technique: string | null;
  readonly dietaryGoal: string | null;
  readonly dietaryRestriction: string | null;
  readonly primaryIngredient: string | null;
  readonly category: string | null;
  readonly occasion: string | null;
  readonly difficulty: string | null;
  readonly cookingTime: string | null;
  readonly cuisineRegion: string | null;
  readonly servings: string | null;
  readonly requiredTool: string | null;
};
```

## Filter State

```ts
export type PublicRecipeCatalogFilters = {
  readonly query: string;
  readonly sort: RecipeSearchSort;
  readonly writtenLang: "all" | "ko-KR" | "en-US";
  readonly region: RecipeSearchRegion;
  readonly isUseLocalData: "all" | "local" | "original";
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

export const INITIAL_PUBLIC_RECIPE_FILTERS: PublicRecipeCatalogFilters = {
  query: "",
  sort: "latest",
  writtenLang: "all",
  region: {
    scope: "none",
    countryCode: null,
    country: null,
    city: null,
    district: null,
    cityKey: null,
    districtKey: null,
  },
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
  requiredTool: "all",
};
```

## Request Builder

```ts
const toNullableFilter = (value: string | "all"): string | null =>
  value === "all" ? null : value;

export function toPublicRecipeSearchRequest(
  filters: PublicRecipeCatalogFilters,
  pageNumber: number,
  displayLang: string,
) {
  const region = filters.region;

  return {
    pageNumber,
    displayLang,
    payload: {
      ingredients: [],
      searchValue: filters.query.trim() || null,
      writtenLang: filters.writtenLang === "all" ? null : filters.writtenLang,
      sort: filters.sort,
      regionScope: region.scope === "none" ? null : region.scope,
      countryCode: region.countryCode,
      country: region.country,
      city: region.city,
      district: region.district,
      cityKey: region.cityKey,
      districtKey: region.districtKey,
      recipeType: toNullableFilter(filters.recipeType),
      cookingMethod: toNullableFilter(filters.cookingMethod),
      technique: toNullableFilter(filters.technique),
      dietaryGoal: toNullableFilter(filters.dietaryGoal),
      dietaryRestriction: toNullableFilter(filters.dietaryRestriction),
      primaryIngredient: toNullableFilter(filters.primaryIngredient),
      category: toNullableFilter(filters.category),
      occasion: toNullableFilter(filters.occasion),
      difficulty: toNullableFilter(filters.difficulty),
      cookingTime: toNullableFilter(filters.cookingTime),
      cuisineRegion: toNullableFilter(filters.cuisineRegion),
      servings: toNullableFilter(filters.servings),
      requiredTool: toNullableFilter(filters.requiredTool),
      recipeSource: null,
      recipeVisibility: "public",
      isUseLocalData:
        filters.isUseLocalData === "all"
          ? null
          : filters.isUseLocalData === "local",
    },
  };
}
```

## Mock Search Engine

```ts
const isAll = (value: string | null | undefined): boolean =>
  value == null || value === "" || value === "all";

const includesSoft = (actual: string | null | undefined, selected: string): boolean =>
  actual != null && actual.toLowerCase() === selected.toLowerCase();

function matchesRegion(recipe: PublicRecipeRecord, region: RecipeSearchRegion): boolean {
  if (region.scope === "none" || region.scope == null) return true;
  if (region.scope === "country") {
    return recipe.countryCode === region.countryCode;
  }
  if (region.scope === "city") {
    return recipe.countryCode === region.countryCode && recipe.cityKey === region.cityKey;
  }
  if (region.scope === "district") {
    return (
      recipe.countryCode === region.countryCode &&
      recipe.cityKey === region.cityKey &&
      recipe.districtKey === region.districtKey
    );
  }
  return true;
}

export function searchMockPublicRecipes(
  recipes: readonly PublicRecipeRecord[],
  filters: PublicRecipeCatalogFilters,
): readonly PublicRecipeRecord[] {
  const query = filters.query.trim().toLocaleLowerCase("ko-KR");

  const filtered = recipes.filter((recipe) => {
    const searchable = [
      recipe.title,
      recipe.description,
      recipe.cookingTip,
      recipe.ingredients.map((ingredient) => ingredient.name ?? ingredient.description).join(" "),
    ]
      .join(" ")
      .toLocaleLowerCase("ko-KR");

    return (
      (query.length === 0 || searchable.includes(query)) &&
      (filters.writtenLang === "all" || recipe.writtenLang === filters.writtenLang) &&
      (filters.isUseLocalData === "all" ||
        recipe.isUseLocalData === (filters.isUseLocalData === "local")) &&
      matchesRegion(recipe, filters.region) &&
      (isAll(filters.recipeType) || includesSoft(recipe.recipeType, filters.recipeType)) &&
      (isAll(filters.cookingMethod) || includesSoft(recipe.cookingMethod, filters.cookingMethod)) &&
      (isAll(filters.technique) || includesSoft(recipe.technique, filters.technique)) &&
      (isAll(filters.dietaryGoal) || includesSoft(recipe.dietaryGoal, filters.dietaryGoal)) &&
      (isAll(filters.dietaryRestriction) ||
        includesSoft(recipe.dietaryRestriction, filters.dietaryRestriction)) &&
      (isAll(filters.primaryIngredient) ||
        includesSoft(recipe.primaryIngredient, filters.primaryIngredient)) &&
      (isAll(filters.category) || includesSoft(recipe.category, filters.category)) &&
      (isAll(filters.occasion) || includesSoft(recipe.occasion, filters.occasion)) &&
      (isAll(filters.difficulty) || includesSoft(recipe.difficulty, filters.difficulty)) &&
      (isAll(filters.cookingTime) || includesSoft(recipe.cookingTime, filters.cookingTime)) &&
      (isAll(filters.cuisineRegion) || includesSoft(recipe.cuisineRegion, filters.cuisineRegion)) &&
      (isAll(filters.servings) || includesSoft(recipe.servings, filters.servings)) &&
      (isAll(filters.requiredTool) || includesSoft(recipe.requiredTool, filters.requiredTool))
    );
  });

  if (filters.sort === "popular") {
    return [...filtered].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
  }

  if (filters.sort === "hot_month") {
    return [...filtered].sort((a, b) => {
      const bScore = (b.viewCount ?? 0) + (b.likeCount ?? 0) * 8;
      const aScore = (a.viewCount ?? 0) + (a.likeCount ?? 0) * 8;
      return bScore - aScore;
    });
  }

  return [...filtered].sort((a, b) => {
    const bTime = Date.parse(b.createdAt ?? "") || 0;
    const aTime = Date.parse(a.createdAt ?? "") || 0;
    return bTime - aTime;
  });
}
```

## Seed Normalizer Requirements

The current seed includes more fields than the current web schema consumes.
Update the seed schema to parse at least:

```ts
recipe: {
  houseId?: number | null;
  title: string;
  titleImageUrl?: string | null;
  recipeType?: string | null;
  writtenLang?: string | null;
  category?: string | null;
  cookingMethod?: string | null;
  technique?: string | null;
  dietaryGoal?: string | null;
  dietaryRestriction?: string | null;
  primaryIngredient?: string | null;
  occasion?: string | null;
  difficulty?: string | null;
  cookingTime?: string | null;
  cuisineRegion?: string | null;
  servings?: string | null;
  requiredTool?: string | null;
  cookingTip?: string | null;
  description?: string | null;
  source?: "ai" | "user" | null;
  visibility?: "private" | "shared" | "public" | null;
  isUseLocalData?: boolean | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}
_mockMeta?: {
  id?: string;
  country?: string;
  category?: string;
  path?: string;
}
```

When seed fields are absent, use stable mock defaults:

```ts
{
  writtenLang: "ko-KR",
  requestedDisplayLang: "ko-KR",
  displayLang: "ko-KR",
  availableLangs: ["ko-KR"],
  source: "user",
  visibility: "public",
  isUseLocalData: true,
  likeCount: 24 + index * 3,
  viewCount: 320 + index * 17,
  isFavorite: false,
  isSaved: false,
  isWriter: false,
  countryCode: inferCountryCode(_mockMeta.country),
  country: _mockMeta.country ?? "Global",
  createdAt: mockCreatedAt(index),
}
```

## Emoji Map

Copy the native emoji map into `src/lib/recipeCatalogEmoji.ts`.

Required filter groups:

- recipeType
- cookingMethod
- technique
- dietaryGoal
- dietaryRestriction
- primaryIngredient
- category
- occasion
- difficulty
- cookingTime
- cuisineRegion
- servings
- requiredTool

Server controls without dedicated native emoji:

```ts
export const serverControlEmoji = {
  sort: "↕️",
  writtenLang: "🌐",
  region: "📍",
  isUseLocalData: "🥬",
} as const;
```

## UI Component Requirements

### FilterBar

Must support:

- Always visible selector cards:
  - Sort
  - Original language
  - Recipe region
  - Cuisine region
  - Cooking time
  - Difficulty
- Advanced selector cards:
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

Selector card anatomy:

```text
Small muted label
[emoji] Selected value                         chevron-down
```

### Active Chips

Active chips must include every active filter:

```text
[emoji] Label [x]
```

Clearing one chip must only clear that filter.

### RecipeCard

Recipe cards should render:

- media box with `img cover center` or fallback centered in the same box
- title, wrapped
- time
- difficulty
- servings if available
- up to two filter chips
- language/translation prefix if relevant

### RecipeDetail

Recipe detail should render:

- image/fallback media
- title and description
- time, difficulty, servings
- original language or translation badge
- region hierarchy
- filter chips
- ingredients
- steps
- contextual app install CTA

## Suggested Tests

Add tests for:

- Seed normalizes 100 records with native-compatible fields.
- Query matches title, description, tip, and ingredient names.
- `latest`, `popular`, and `hot_month` sort correctly.
- `writtenLang` filters correctly.
- `isUseLocalData` filters correctly.
- Country/city/district region scopes filter correctly.
- Every detailed filter key filters correctly.
- Active chips include every active filter and clear only one value.
- Request builder outputs native-compatible payload shape.

## Migration Order

1. Add canonical types and mock normalizer.
2. Add request builder and tests.
3. Replace `RecipeFilters` with `PublicRecipeCatalogFilters`.
4. Replace `filterRecipes()` with `searchMockPublicRecipes()`.
5. Update `FilterBar`.
6. Update `RecipeCard` and `RecipeDetail`.
7. Update `recipe-catalog-search-spec.md` to point at the new contract.
8. Run:

```bash
npm test
npm run build
```
