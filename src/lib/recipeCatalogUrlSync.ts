import { initialCatalogFilters } from "./recipeCatalogRequest";
import type {
  LocalDataMode,
  PublicRecipeCatalogFilters,
  RecipeCatalogRegion,
  RecipeSearchScope,
  RecipeSearchSort,
  RecipeWrittenLang,
} from "./recipeCatalogTypes";
import { recipeFilterKeys } from "./recipeCatalogTypes";

export function filtersToSearchParams(filters: PublicRecipeCatalogFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query.trim().length > 0) {
    params.set("q", filters.query.trim());
  }
  if (filters.searchScope !== "all") {
    params.set("scope", filters.searchScope);
  }
  if (filters.sort !== "latest") {
    params.set("sort", filters.sort);
  }
  if (filters.writtenLang !== "all") {
    params.set("lang", filters.writtenLang);
  }
  if (filters.isUseLocalData !== "all") {
    params.set("local", filters.isUseLocalData);
  }

  if (filters.region.scope !== "none") {
    params.set("regionScope", filters.region.scope);
    params.set("regionCountryCode", filters.region.countryCode);
    params.set("regionCountry", filters.region.country);
    if (filters.region.scope === "city" || filters.region.scope === "district") {
      params.set("regionCity", filters.region.city);
      params.set("regionCityKey", filters.region.cityKey);
    }
    if (filters.region.scope === "district") {
      params.set("regionDistrict", filters.region.district);
      params.set("regionDistrictKey", filters.region.districtKey);
    }
  }

  for (const key of recipeFilterKeys) {
    if (filters[key] !== "all" && filters[key].length > 0) {
      params.set(key, filters[key]);
    }
  }

  return params;
}

export function filtersFromSearchParams(search: string): PublicRecipeCatalogFilters {
  const params = new URLSearchParams(search);

  const q = params.get("q");
  const scope = params.get("scope");
  const sort = params.get("sort");
  const lang = params.get("lang");
  const local = params.get("local");
  const regionScope = params.get("regionScope");

  let region: RecipeCatalogRegion = { scope: "none" };
  if (regionScope === "country") {
    region = {
      scope: "country",
      countryCode: params.get("regionCountryCode") ?? "",
      country: params.get("regionCountry") ?? "",
    };
  } else if (regionScope === "city") {
    region = {
      scope: "city",
      countryCode: params.get("regionCountryCode") ?? "",
      country: params.get("regionCountry") ?? "",
      city: params.get("regionCity") ?? "",
      cityKey: params.get("regionCityKey") ?? "",
    };
  } else if (regionScope === "district") {
    region = {
      scope: "district",
      countryCode: params.get("regionCountryCode") ?? "",
      country: params.get("regionCountry") ?? "",
      city: params.get("regionCity") ?? "",
      cityKey: params.get("regionCityKey") ?? "",
      district: params.get("regionDistrict") ?? "",
      districtKey: params.get("regionDistrictKey") ?? "",
    };
  }

  const recipeKeyOverrides = Object.fromEntries(
    recipeFilterKeys.map((key) => {
      const val = params.get(key);
      return [key, val ?? initialCatalogFilters[key]];
    }),
  ) as Record<(typeof recipeFilterKeys)[number], string>;

  return {
    ...initialCatalogFilters,
    ...recipeKeyOverrides,
    query: q ?? initialCatalogFilters.query,
    searchScope: scope === "recipe" || scope === "ingredient" || scope === "all"
      ? (scope as RecipeSearchScope)
      : initialCatalogFilters.searchScope,
    sort: sort === "popular" || sort === "hot_month" || sort === "latest"
      ? (sort as RecipeSearchSort)
      : initialCatalogFilters.sort,
    writtenLang: lang === "ko" || lang === "en" || lang === "all"
      ? (lang as RecipeWrittenLang)
      : initialCatalogFilters.writtenLang,
    isUseLocalData: local === "local" || local === "original" || local === "all"
      ? (local as LocalDataMode)
      : initialCatalogFilters.isUseLocalData,
    region,
  };
}
