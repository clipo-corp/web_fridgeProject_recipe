import { describe, expect, it } from "vitest";

import {
  formatTimestamp,
  groupRecipeSteps,
  sectionLabel,
  shouldRenderSectionHeadings,
  youtubeEmbedUrl,
} from "./recipeStepSections";
import type { RecipeSection, RecipeStep } from "./recipeCatalogTypes";

function step(stepNumber: number, section: string, startSeconds: number | null = null): RecipeStep {
  return {
    stepNumber,
    way: `step ${stepNumber}`,
    cookingTip: null,
    imageUrl: null,
    ingredientMasterIds: null,
    ingredientChips: [],
    section,
    startSeconds,
    endSeconds: null,
  };
}

function section(key: string, title: string | null): RecipeSection {
  return { section: key, title, startSeconds: null, endSeconds: null };
}

describe("groupRecipeSteps", () => {
  it("groups consecutive steps that share a section", () => {
    const groups = groupRecipeSteps([
      step(1, "PREP"),
      step(2, "PREP"),
      step(3, "MAIN"),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.section).toBe("PREP");
    expect(groups[0]?.steps.map((s) => s.stepNumber)).toEqual([1, 2]);
    expect(groups[1]?.steps.map((s) => s.stepNumber)).toEqual([3]);
  });

  it("keeps a repeated section as a separate run so step order survives", () => {
    const groups = groupRecipeSteps([
      step(1, "MAIN"),
      step(2, "PREP"),
      step(3, "MAIN"),
    ]);

    expect(groups.map((group) => group.section)).toEqual(["MAIN", "PREP", "MAIN"]);
  });

  it("normalizes casing and falls back to MAIN when the section is missing", () => {
    const groups = groupRecipeSteps([step(1, "  prep "), step(2, "")]);

    expect(groups.map((group) => group.section)).toEqual(["PREP", "MAIN"]);
  });

  it("carries a custom section title through", () => {
    const groups = groupRecipeSteps([step(1, "MAIN")], [section("MAIN", "Simmer and Finish")]);

    expect(groups[0]?.title).toBe("Simmer and Finish");
  });

  it("drops a title that merely repeats the built-in default label", () => {
    const groups = groupRecipeSteps([step(1, "MAIN")], [section("MAIN", "조리")]);

    expect(groups[0]?.title).toBeNull();
  });
});

describe("shouldRenderSectionHeadings", () => {
  it("suppresses headings for a single untitled MAIN run", () => {
    expect(shouldRenderSectionHeadings(groupRecipeSteps([step(1, "MAIN"), step(2, "MAIN")]))).toBe(
      false,
    );
  });

  it("renders headings once a second section exists", () => {
    expect(shouldRenderSectionHeadings(groupRecipeSteps([step(1, "PREP"), step(2, "MAIN")]))).toBe(
      true,
    );
  });

  it("renders headings for a single run with a custom title", () => {
    const groups = groupRecipeSteps([step(1, "MAIN")], [section("MAIN", "Simmer and Finish")]);
    expect(shouldRenderSectionHeadings(groups)).toBe(true);
  });

  it("returns false when there are no steps", () => {
    expect(shouldRenderSectionHeadings([])).toBe(false);
  });
});

describe("sectionLabel", () => {
  it("prefers an explicit title", () => {
    expect(sectionLabel("PREP", "Mise en place", "ko-KR")).toBe("Mise en place");
  });

  it("falls back to a localized default label", () => {
    expect(sectionLabel("PREP", null, "ko-KR")).toBe("재료 준비");
    expect(sectionLabel("PREP", null, "en-US")).toBe("Preparation");
  });

  it("returns null for an unknown key with no title", () => {
    expect(sectionLabel("PLATING", null, "ko-KR")).toBeNull();
  });
});

describe("formatTimestamp", () => {
  it("formats under an hour as m:ss", () => {
    expect(formatTimestamp(0)).toBe("0:00");
    expect(formatTimestamp(93)).toBe("1:33");
    expect(formatTimestamp(600)).toBe("10:00");
  });

  it("formats an hour or more as h:mm:ss", () => {
    expect(formatTimestamp(3723)).toBe("1:02:03");
  });

  it("clamps negatives and truncates fractions", () => {
    expect(formatTimestamp(-5)).toBe("0:00");
    expect(formatTimestamp(61.9)).toBe("1:01");
  });
});

describe("youtubeEmbedUrl", () => {
  it("omits autoplay when there is no seek target", () => {
    const url = youtubeEmbedUrl("abc123", null);
    expect(url).toContain("/embed/abc123");
    expect(url).not.toContain("autoplay");
    expect(url).not.toContain("start=");
  });

  it("adds a start offset and autoplay when seeking", () => {
    const url = youtubeEmbedUrl("abc123", 93);
    expect(url).toContain("start=93");
    expect(url).toContain("autoplay=1");
  });
});
