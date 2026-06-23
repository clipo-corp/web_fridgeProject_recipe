import { describe, expect, it } from "vitest";
import { appRouteForPath, detailPathForRecipe } from "./routes";

describe("appRouteForPath", () => {
  it("routes privacy policy paths explicitly", () => {
    expect(appRouteForPath("/privacy")).toEqual({ kind: "privacy" });
    expect(appRouteForPath("/privacy-policy")).toEqual({ kind: "privacy" });
  });

  it("routes install and recipe detail paths explicitly", () => {
    expect(appRouteForPath("/install")).toEqual({ kind: "install" });
    expect(appRouteForPath("/recipe-catalog/seed_china_beverage")).toEqual({
      kind: "recipe-detail",
      recipeId: "seed_china_beverage",
    });
    expect(appRouteForPath("/recipe-catalog")).toEqual({ kind: "catalog" });
    expect(appRouteForPath("/recipe-catalog/")).toEqual({ kind: "catalog" });
  });
});

describe("detailPathForRecipe", () => {
  it("encodes recipe ids for direct recipe detail pages", () => {
    expect(detailPathForRecipe("mock id/with slash")).toBe(
      "/recipe-catalog/mock%20id%2Fwith%20slash",
    );
  });

  it("falls back to the catalog path when the recipe id is empty", () => {
    expect(detailPathForRecipe("")).toBe("/recipe-catalog");
  });
});
