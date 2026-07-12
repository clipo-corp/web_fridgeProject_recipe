import { describe, expect, it } from "vitest";
import { appRouteForPath, detailPathForRecipe } from "./routes";

describe("appRouteForPath", () => {
  it("keeps every public path in the pre-launch state", () => {
    expect(appRouteForPath("/")).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/install")).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/recipe-catalog")).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/recipe-catalog/seed_china_beverage")).toEqual({
      kind: "prelaunch",
    });
    expect(appRouteForPath("/privacy")).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/privacy-policy")).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/support")).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/help")).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/anything-else")).toEqual({ kind: "prelaunch" });
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
