import type { PublicRecipeRecord, RecipeCatalogRegion } from "./recipeCatalogTypes";

export type RecipeCountryOption = {
  readonly countryCode: string;
  readonly country: string;
};

export type RecipeCityOption = RecipeCountryOption & {
  readonly city: string;
  readonly cityKey: string;
};

export type RecipeDistrictOption = RecipeCityOption & {
  readonly district: string;
  readonly districtKey: string;
};

export type RecipeRegionOptions = {
  readonly countries: readonly RecipeCountryOption[];
  readonly cities: readonly RecipeCityOption[];
  readonly districts: readonly RecipeDistrictOption[];
};

const countryCodes: Record<string, string> = {
  China: "CN",
  France: "FR",
  India: "IN",
  Italy: "IT",
  Japan: "JP",
  Korea: "KR",
  America: "US",
  USA: "US",
  "United States": "US",
  "United States of America": "US",
  Global: "GL",
};

export function countryCodeFor(country: string): string {
  return countryCodes[country] ?? country.slice(0, 2).toUpperCase();
}

export function makeRegionKey(...parts: readonly string[]): string {
  return parts
    .map((part) => part.trim().replace(/\s+/g, "-"))
    .filter((part) => part.length > 0)
    .join("-");
}

export function collectRegionOptions(
  recipes: readonly PublicRecipeRecord[],
): RecipeRegionOptions {
  const countryMap = new Map<string, RecipeCountryOption>();
  const cityMap = new Map<string, RecipeCityOption>();
  const districtMap = new Map<string, RecipeDistrictOption>();

  for (const recipe of recipes) {
    countryMap.set(recipe.countryCode, {
      countryCode: recipe.countryCode,
      country: recipe.country,
    });

    if (recipe.city !== null && recipe.cityKey !== null) {
      cityMap.set(recipe.cityKey, {
        countryCode: recipe.countryCode,
        country: recipe.country,
        city: recipe.city,
        cityKey: recipe.cityKey,
      });
    }

    if (
      recipe.city !== null &&
      recipe.cityKey !== null &&
      recipe.district !== null &&
      recipe.districtKey !== null
    ) {
      districtMap.set(recipe.districtKey, {
        countryCode: recipe.countryCode,
        country: recipe.country,
        city: recipe.city,
        cityKey: recipe.cityKey,
        district: recipe.district,
        districtKey: recipe.districtKey,
      });
    }
  }

  return {
    countries: sortByLabel(Array.from(countryMap.values()), (option) => option.country),
    cities: sortByLabel(Array.from(cityMap.values()), (option) => `${option.country}-${option.city}`),
    districts: sortByLabel(
      Array.from(districtMap.values()),
      (option) => `${option.country}-${option.city}-${option.district}`,
    ),
  };
}

export function regionToSelectValue(region: RecipeCatalogRegion): string {
  if (region.scope === "country") {
    return `country:${region.countryCode}`;
  }
  if (region.scope === "city") {
    return `city:${region.cityKey}`;
  }
  if (region.scope === "district") {
    return `district:${region.districtKey}`;
  }
  return "all";
}

function sortByLabel<T>(values: readonly T[], labelFor: (value: T) => string): readonly T[] {
  return [...values].sort((a, b) => labelFor(a).localeCompare(labelFor(b)));
}
