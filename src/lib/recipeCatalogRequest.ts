import { recipeFilterKeys } from "./recipeCatalogTypes";
import { primaryIngredientValueForSearchText } from "./recipeLabels";
import type {
  PublicRecipeCatalogFilters,
  PublicRecipeSearchRequest,
  RecipeCatalogRegion,
} from "./recipeCatalogTypes";

export const initialCatalogFilters: PublicRecipeCatalogFilters = {
  query: "",
  searchScope: "all",
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
  requiredTool: "all",
};

export function toPublicRecipeSearchRequest(
  filters: PublicRecipeCatalogFilters,
  pageNumber: number,
  displayLang: string,
): PublicRecipeSearchRequest {
  const region = regionPayload(filters.region);
  const nativeFilters = Object.fromEntries(
    recipeFilterKeys.map((key) => [key, nullableFilter(filters[key])]),
  ) as Record<(typeof recipeFilterKeys)[number], string | null>;
  const primaryIngredientFromQuery =
    nativeFilters.primaryIngredient === null && filters.searchScope !== "recipe"
      ? primaryIngredientValueForSearchText(filters.query)
      : null;

  return {
    ...nativeFilters,
    primaryIngredient: nativeFilters.primaryIngredient ?? primaryIngredientFromQuery,
    ingredients: [],
    searchValue: primaryIngredientFromQuery === null ? nullableText(filters.query) : null,
    pageNumber,
    displayLang,
    writtenLang: writtenLangPayload(filters.writtenLang),
    sort: filters.sort,
    recipeVisibility: "public",
    isUseLocalData: localDataPayload(filters.isUseLocalData),
    ...region,
  };
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableFilter(value: string): string | null {
  return value.length > 0 && value !== "all" ? value : null;
}

function writtenLangPayload(value: PublicRecipeCatalogFilters["writtenLang"]): string | null {
  if (value === "ko") {
    return "ko-KR";
  }
  if (value === "en") {
    return "en-US";
  }
  return null;
}

function localDataPayload(value: PublicRecipeCatalogFilters["isUseLocalData"]): boolean | null {
  if (value === "local") {
    return true;
  }
  if (value === "original") {
    return false;
  }
  return null;
}

function regionPayload(region: RecipeCatalogRegion): Pick<
  PublicRecipeSearchRequest,
  "regionScope" | "countryCode" | "country" | "city" | "district" | "cityKey" | "districtKey"
> {
  if (region.scope === "country") {
    return {
      regionScope: "country",
      countryCode: region.countryCode,
      country: region.country,
      city: null,
      district: null,
      cityKey: null,
      districtKey: null,
    };
  }

  if (region.scope === "city") {
    return {
      regionScope: "city",
      countryCode: region.countryCode,
      country: region.country,
      city: region.city,
      district: null,
      cityKey: region.cityKey,
      districtKey: null,
    };
  }

  if (region.scope === "district") {
    return {
      regionScope: "district",
      countryCode: region.countryCode,
      country: region.country,
      city: region.city,
      district: region.district,
      cityKey: region.cityKey,
      districtKey: region.districtKey,
    };
  }

  return {
    regionScope: null,
    countryCode: null,
    country: null,
    city: null,
    district: null,
    cityKey: null,
    districtKey: null,
  };
}
