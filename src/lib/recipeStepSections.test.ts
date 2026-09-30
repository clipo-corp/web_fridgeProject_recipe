import { describe, expect, it } from "vitest";

import {
  formatTimestamp,
  groupRecipeSteps,
  sectionLabel,
  isValidYoutubeVideoId,
  shouldRenderSectionHeadings,
  stageKicker,
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

  it("falls back to the key itself for an unknown section", () => {
    // Server-side `section` is free text, so an unrecognized key must still produce a
    // heading — otherwise the group renders as an unexplained gap in the step list.
    expect(sectionLabel("PLATING", null, "ko-KR")).toBe("PLATING");
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

describe("regressions from review", () => {
  it("gives a repeated section run its own title instead of the first one's", () => {
    // sections[] describes runs, not unique keys — each entry carries its own
    // start/end seconds, so a recipe returning to PREP sends two PREP entries.
    const groups = groupRecipeSteps(
      [step(1, "PREP"), step(2, "MAIN"), step(3, "PREP")],
      [
        section("PREP", "채소 손질"),
        section("MAIN", "끓이기"),
        section("PREP", "고명 준비"),
      ],
    );

    expect(groups.map((group) => group.title)).toEqual([
      "채소 손질",
      "끓이기",
      "고명 준비",
    ]);
  });

  it("leaves a run untitled once the matching entries are used up", () => {
    const groups = groupRecipeSteps(
      [step(1, "PREP"), step(2, "MAIN"), step(3, "PREP")],
      [section("PREP", "채소 손질"), section("MAIN", "끓이기")],
    );

    expect(groups[2]?.title).toBeNull();
  });

  it("labels an unknown section key with the key rather than nothing", () => {
    // recipe_step.section is free text on the server; returning null would split the
    // steps into blocks with no heading, which reads as a layout glitch.
    expect(sectionLabel("DOUGH", null, "ko-KR")).toBe("DOUGH");
    expect(sectionLabel("   ", null, "ko-KR")).toBeNull();
  });

  it("never leaves a rendered group without a heading", () => {
    const groups = groupRecipeSteps([step(1, "DOUGH"), step(2, "FILLING")]);

    expect(shouldRenderSectionHeadings(groups)).toBe(true);
    for (const group of groups) {
      expect(sectionLabel(group.section, group.title, "ko-KR")).not.toBeNull();
    }
  });
});

describe("isValidYoutubeVideoId", () => {
  it("accepts a real video id", () => {
    expect(isValidYoutubeVideoId("dQw4w9WgXcQ")).toBe(true);
  });

  it("rejects values that would break out of the embed path", () => {
    for (const bad of [null, "", "../../evil", "abc/def", "a?b=c", "x".repeat(64)]) {
      expect(isValidYoutubeVideoId(bad)).toBe(false);
    }
  });

  it("percent-encodes whatever it is given anyway", () => {
    expect(youtubeEmbedUrl("a/b", null)).toContain("/embed/a%2Fb");
  });
});

describe("numeric stages (stage 1 = prep)", () => {
  it("groups numeric stages into runs and titles them from sections[]", () => {
    const groups = groupRecipeSteps(
      [step(1, "1"), step(2, "2"), step(3, "2"), step(4, "3")],
      [section("1", "육수 끓이기"), section("2", "우거지 손질과 양념하기"), section("3", "끓여 완성하기")],
    );

    expect(groups.map((group) => group.section)).toEqual(["1", "2", "3"]);
    expect(groups.map((group) => group.title)).toEqual([
      "육수 끓이기",
      "우거지 손질과 양념하기",
      "끓여 완성하기",
    ]);
    expect(shouldRenderSectionHeadings(groups)).toBe(true);
  });

  it("labels an untitled stage 1 as prep and later stages as cooking", () => {
    const groups = groupRecipeSteps([step(1, "1"), step(2, "2"), step(3, "3")]);

    expect(groups.map((group) => sectionLabel(group.section, group.title, "ko"))).toEqual([
      "재료 준비",
      "조리",
      "조리",
    ]);
    expect(sectionLabel("1", null, "en")).toBe("Preparation");
  });

  it("drops stage titles that only restate the default or the stage number", () => {
    const groups = groupRecipeSteps(
      [step(1, "1"), step(2, "2"), step(3, "3")],
      [section("1", "준비"), section("2", "2단계"), section("3", "3단계 끓이기")],
    );

    expect(groups.map((group) => group.title)).toEqual([null, null, "끓이기"]);
  });

  it("treats the app's default labels as defaults for canonical keys too", () => {
    const groups = groupRecipeSteps(
      [step(1, "PREP"), step(2, "MAIN")],
      [section("PREP", "준비"), section("MAIN", "본 조리")],
    );

    expect(groups.map((group) => group.title)).toEqual([null, null]);
  });
});

describe("stageKicker", () => {
  it("numbers groups by position", () => {
    expect(stageKicker(0, "ko")).toBe("1단계");
    expect(stageKicker(2, "ko-KR")).toBe("3단계");
    expect(stageKicker(1, "en")).toBe("Part 2");
  });
});
