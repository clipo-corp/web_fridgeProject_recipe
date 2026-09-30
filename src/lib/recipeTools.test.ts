import { describe, expect, it } from "vitest";

import { formatToolGroupLabel, groupRecipeTools } from "./recipeTools";
import type { RecipeTool } from "./recipeCatalogTypes";

function tool(code: string, fields: Partial<RecipeTool> = {}): RecipeTool {
  return {
    code,
    labelKo: null,
    labelEn: null,
    basic: false,
    stepNumbers: [],
    optional: false,
    altGroup: null,
    ...fields,
  };
}

describe("groupRecipeTools", () => {
  it("returns nothing when the recipe has no tools list", () => {
    expect(groupRecipeTools(undefined, "ko")).toEqual([]);
    expect(groupRecipeTools([], "ko")).toEqual([]);
  });

  it("hides basic tools", () => {
    const groups = groupRecipeTools(
      [tool("knife", { basic: true, labelKo: "칼" }), tool("pot", { labelKo: "냄비" })],
      "ko",
    );

    expect(groups.map((group) => group.labels)).toEqual([["냄비"]]);
  });

  it("joins an alt group into one entry at the first member's position", () => {
    const groups = groupRecipeTools(
      [
        tool("oven", { labelKo: "오븐", labelEn: "Oven", altGroup: "bake" }),
        tool("pan", { labelKo: "팬", labelEn: "Pan" }),
        tool("air_fryer", { labelKo: "에어프라이어", labelEn: "Air fryer", altGroup: "bake" }),
      ],
      "ko",
    );

    expect(groups.map((group) => formatToolGroupLabel(group, "ko"))).toEqual([
      "오븐 또는 에어프라이어",
      "팬",
    ]);
  });

  it("uses the English label on English pages", () => {
    const groups = groupRecipeTools(
      [
        tool("oven", { labelKo: "오븐", labelEn: "Oven", altGroup: "bake" }),
        tool("air_fryer", { labelKo: "에어프라이어", labelEn: "Air fryer", altGroup: "bake" }),
      ],
      "en",
    );

    expect(formatToolGroupLabel(groups[0]!, "en")).toBe("Oven or Air fryer");
  });

  it("drops a whole alt group when a basic tool is one of the alternatives", () => {
    const groups = groupRecipeTools(
      [
        tool("pan", { basic: true, altGroup: "fry" }),
        tool("wok", { labelKo: "웍", altGroup: "fry" }),
        tool("blender", { labelKo: "믹서" }),
      ],
      "ko",
    );

    expect(groups.map((group) => group.labels)).toEqual([["믹서"]]);
  });

  it("marks a group optional only when every member is optional", () => {
    const groups = groupRecipeTools(
      [
        tool("torch", { labelKo: "토치", optional: true }),
        tool("oven", { labelKo: "오븐", altGroup: "bake", optional: true }),
        tool("air_fryer", { labelKo: "에어프라이어", altGroup: "bake" }),
      ],
      "ko",
    );

    expect(groups.map((group) => group.optional)).toEqual([true, false]);
  });

  it("lists a repeated code once and falls back to a code label", () => {
    const groups = groupRecipeTools(
      [tool("steamer"), tool("steamer")],
      "ko",
      (code) => `label:${code}`,
    );

    expect(groups.map((group) => group.labels)).toEqual([["label:steamer"]]);
  });
});
