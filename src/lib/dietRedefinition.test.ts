import { describe, expect, it } from "vitest";
import {
  filterPublicRecipes,
  initialCatalogFilters,
  loadPublicMockRecipes,
  toPublicRecipeSearchRequest,
} from "./recipeCatalogMock";
import {
  UnsupportedDietFilterError,
  labelFor,
  selectableDietaryRestrictionOptions,
} from "./recipeLabels";
import { filtersFromSearchParams } from "./recipeCatalogUrlSync";
import { emojiFor } from "./recipeFilterMeta";
import type { PublicRecipeCatalogFilters } from "./recipeCatalogTypes";

function withDiet(dietaryRestriction: string): PublicRecipeCatalogFilters {
  return { ...initialCatalogFilters, dietaryRestriction };
}

function expectUnsupported(run: () => unknown, value: string): void {
  try {
    run();
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(UnsupportedDietFilterError);
    if (!(error instanceof UnsupportedDietFilterError)) {
      throw error;
    }
    expect(error.value).toBe(value);
    return;
  }
  throw new Error(`expected UnsupportedDietFilterError for ${value}`);
}

describe("diet filter request boundary", () => {
  it("sends all as no filter and preserves the known none value", () => {
    expect(toPublicRecipeSearchRequest(withDiet("all"), 0, "ko-KR").dietaryRestriction).toBeNull();
    expect(toPublicRecipeSearchRequest(withDiet("none"), 0, "ko-KR").dietaryRestriction).toBe("none");
  });

  it("normalizes the legacy vegetarian filter value to vegan", () => {
    expect(toPublicRecipeSearchRequest(withDiet("vegetarian"), 0, "ko-KR").dietaryRestriction)
      .toBe("vegan");
  });

  it("throws for lacto_ovo, gluten-free, lactose-free, and an unknown filter", () => {
    for (const value of ["lacto_ovo", "gluten-free", "lactose-free", "future-diet"]) {
      expectUnsupported(
        () => toPublicRecipeSearchRequest(withDiet(value), 0, "ko-KR"),
        value,
      );
    }
  });
});

describe("mock filter boundary", () => {
  it("normalizes only the selected legacy value and leaves the recipe author tag raw", async () => {
    const recipes = await loadPublicMockRecipes();
    const base = recipes[0];
    if (base === undefined) {
      throw new Error("mock catalog is empty");
    }
    const vegan = { ...base, recipeId: "fixture-vegan", dietaryRestriction: "vegan" };
    const oldAuthorTag = {
      ...base,
      recipeId: "fixture-old-author-vegetarian",
      dietaryRestriction: "vegetarian",
    };

    const matched = filterPublicRecipes([vegan, oldAuthorTag], withDiet("vegetarian"));
    expect(matched.map((recipe) => recipe.recipeId)).toEqual(["fixture-vegan"]);
    expect(oldAuthorTag.dietaryRestriction).toBe("vegetarian");

    const unfiltered = filterPublicRecipes([oldAuthorTag], withDiet("all"));
    expect(unfiltered[0]?.dietaryRestriction).toBe("vegetarian");
  });

  it("throws instead of running the mock catalog unfiltered for GF/LF", () => {
    for (const value of ["gluten-free", "lactose-free"]) {
      expectUnsupported(
        () => filterPublicRecipes([], withDiet(value)),
        value,
      );
    }
  });
});

describe("URL rehydration boundary", () => {
  it("treats absent and exact empty as all, and keeps whitespace as an opaque unknown", () => {
    expect(filtersFromSearchParams("").dietaryRestriction).toBe("all");
    expect(filtersFromSearchParams("?dietaryRestriction=").dietaryRestriction).toBe("all");

    const spaced = filtersFromSearchParams("?dietaryRestriction=%20").dietaryRestriction;
    expect(spaced).toBe(" ");
    expectUnsupported(
      () => toPublicRecipeSearchRequest(withDiet(spaced), 0, "ko-KR"),
      " ",
    );
  });

  it("normalizes only the legacy filter value and keeps inherited names as strings", () => {
    expect(filtersFromSearchParams("?dietaryRestriction=vegetarian").dietaryRestriction)
      .toBe("vegan");

    for (const value of ["__proto__", "constructor", "toString"]) {
      const parsed = filtersFromSearchParams(
        `?dietaryRestriction=${encodeURIComponent(value)}`,
      ).dietaryRestriction;
      expect(typeof parsed).toBe("string");
      expect(parsed).toBe(value);
      expectUnsupported(
        () => toPublicRecipeSearchRequest(withDiet(parsed), 0, "ko-KR"),
        value,
      );
    }
  });

  it("production label and emoji lookups never return an inherited object", () => {
    for (const value of ["__proto__", "constructor", "toString"]) {
      expect(typeof labelFor(value, "ko")).toBe("string");
      expect(labelFor(value, "ko")).toBe(value);
      expect(emojiFor(value)).toBe("");
    }
  });
});

describe("diet labels and selectable options", () => {
  it("labels the new diet values and does not present an author vegetarian tag as vegan", () => {
    expect(labelFor("vegan", "ko")).toBe("비건(완전 채식)");
    expect(labelFor("lacto_ovo", "ko")).toBe("락토오보");
    expect(labelFor("pescatarian", "ko")).toBe("페스코");
    expect(labelFor("vegetarian", "ko")).toBe("채식(작성자 태그·미검증)");
    expect(labelFor("vegetarian", "ko")).not.toBe(labelFor("vegan", "ko"));
  });

  it("never offers GF/LF, deprecated, or unknown author values as selectable options", () => {
    expect(selectableDietaryRestrictionOptions([
      "vegan",
      "gluten-free",
      "lactose-free",
      "vegetarian",
      "lacto_ovo",
      "future-diet",
      "none",
    ])).toEqual(["vegan", "none"]);
  });
});
