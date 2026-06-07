import { emojiFor } from "../lib/recipeFilterMeta";
import type { FilterOptions } from "./FilterBar";
import type { Option } from "./FilterSelector";
import type { RecipeCatalogRegion } from "../lib/recipeCatalogTypes";

export function makeRegionOptions(
  options: FilterOptions,
  countryLabel: (value: string) => string,
): readonly Option[] {
  return options.region.countries.map((option) => ({
    value: `country:${option.countryCode}`,
    label: countryLabel(option.country),
    emoji: emojiFor(option.country),
  }));
}

export function parseRegion(value: string, options: FilterOptions): RecipeCatalogRegion {
  const country = options.region.countries.find((option) => `country:${option.countryCode}` === value);
  if (country !== undefined) {
    return { scope: "country", countryCode: country.countryCode, country: country.country };
  }

  const city = options.region.cities.find((option) => `city:${option.cityKey}` === value);
  if (city !== undefined) {
    return {
      scope: "city",
      countryCode: city.countryCode,
      country: city.country,
      city: city.city,
      cityKey: city.cityKey,
    };
  }

  const district = options.region.districts.find((option) => `district:${option.districtKey}` === value);
  if (district !== undefined) {
    return {
      scope: "district",
      countryCode: district.countryCode,
      country: district.country,
      city: district.city,
      cityKey: district.cityKey,
      district: district.district,
      districtKey: district.districtKey,
    };
  }

  return { scope: "none" };
}
