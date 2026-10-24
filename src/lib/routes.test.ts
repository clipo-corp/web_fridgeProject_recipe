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

  it("opens only the legal pages once the legal publication switch is on", () => {
    expect(appRouteForPath("/privacy", true)).toEqual({ kind: "privacy" });
    expect(appRouteForPath("/privacy-policy/", true)).toEqual({ kind: "privacy" });
    expect(appRouteForPath("/terms", true)).toEqual({ kind: "terms" });
    expect(appRouteForPath("/", true)).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/recipe-catalog", true)).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/support", true)).toEqual({ kind: "prelaunch" });
  });

  it("keeps the legal pages in the pre-launch state while the switch is off", () => {
    expect(appRouteForPath("/privacy", false)).toEqual({ kind: "prelaunch" });
    expect(appRouteForPath("/terms", false)).toEqual({ kind: "prelaunch" });
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
