import { describe, expect, it } from "vitest";

import { toPublicRecipeRecord } from "./recipeServerAdapter";
import type { ServerRecipeInfo } from "./recipeServerTypes";

function serverRecipe(patch: Partial<ServerRecipeInfo>): ServerRecipeInfo {
  return {
    recipeId: 1,
    title: "테스트 레시피",
    steps: [{ stepNumber: 1, way: "끓입니다." }],
    ...patch,
  } as ServerRecipeInfo;
}

describe("toPublicRecipeRecord — multimedia fields", () => {
  it("defaults the enums when the server omits them", () => {
    const record = toPublicRecipeRecord(serverRecipe({}));

    expect(record.sourcePlatform).toBe("OWNED");
    expect(record.sourceMediaType).toBe("PHOTO");
    expect(record.timelineCapability).toBe("NONE");
    expect(record.sections).toEqual([]);
  });

  it("reads the enums from camelCase and snake_case alike", () => {
    expect(
      toPublicRecipeRecord(serverRecipe({ sourcePlatform: "youtube" })).sourcePlatform,
    ).toBe("YOUTUBE");
    expect(
      toPublicRecipeRecord(serverRecipe({ timeline_capability: "SEEKABLE" })).timelineCapability,
    ).toBe("SEEKABLE");
  });

  it("falls back to OWNED for an unrecognized platform", () => {
    expect(
      toPublicRecipeRecord(serverRecipe({ sourcePlatform: "VIMEO" })).sourcePlatform,
    ).toBe("OWNED");
  });

  it("defaults a missing step section to MAIN and uppercases the rest", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        steps: [
          { stepNumber: 1, way: "썹니다." },
          { stepNumber: 2, way: "볶습니다.", section: "prep" },
        ],
      }),
    );

    expect(record.steps.map((step) => step.section)).toEqual(["MAIN", "PREP"]);
  });
});

describe("toPublicRecipeRecord — timestamp handling", () => {
  const seekableSteps = [{ stepNumber: 1, way: "끓입니다.", startSeconds: 30, endSeconds: 75 }];

  it("keeps timestamps on a SEEKABLE recipe", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({ timelineCapability: "SEEKABLE", steps: seekableSteps }),
    );

    expect(record.steps[0]?.startSeconds).toBe(30);
    expect(record.steps[0]?.endSeconds).toBe(75);
  });

  it("drops timestamps when the recipe is only PLAYABLE_ONLY", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({ timelineCapability: "PLAYABLE_ONLY", steps: seekableSteps }),
    );

    expect(record.steps[0]?.startSeconds).toBeNull();
    expect(record.steps[0]?.endSeconds).toBeNull();
  });

  it("drops timestamps entirely when the capability is absent", () => {
    const record = toPublicRecipeRecord(serverRecipe({ steps: seekableSteps }));

    expect(record.steps[0]?.startSeconds).toBeNull();
  });

  it("drops an end that precedes its start but keeps the start", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        timelineCapability: "SEEKABLE",
        steps: [{ stepNumber: 1, way: "끓입니다.", startSeconds: 90, endSeconds: 10 }],
      }),
    );

    expect(record.steps[0]?.startSeconds).toBe(90);
    expect(record.steps[0]?.endSeconds).toBeNull();
  });

  it("rejects negative and fractional seconds", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        timelineCapability: "SEEKABLE",
        steps: [
          { stepNumber: 1, way: "a", startSeconds: -5 },
          { stepNumber: 2, way: "b", startSeconds: 12.5 },
        ],
      }),
    );

    expect(record.steps[0]?.startSeconds).toBeNull();
    expect(record.steps[1]?.startSeconds).toBeNull();
  });

  it("normalizes recipe-level sections alongside the steps", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        timelineCapability: "SEEKABLE",
        sections: [{ section: "prep", title: "재료 준비", start_seconds: 0 }],
      }),
    );

    expect(record.sections[0]?.section).toBe("PREP");
    expect(record.sections[0]?.title).toBe("재료 준비");
    expect(record.sections[0]?.startSeconds).toBe(0);
  });
});

describe("toPublicRecipeRecord — display amounts, tools, stages", () => {
  it("carries ingredient display fields and passes them to step chips", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        ingredients: [
          {
            masterId: 10,
            name: "밥",
            quantity: 1,
            unit: "count",
            displayQuantity: 1,
            displayUnitLabel: " 공기 ",
            sourceText: "밥 1공기",
            convertedGrams: 210,
            conversionMethod: "portion_standard",
            conversionReviewRequired: false,
          },
        ],
        steps: [{ stepNumber: 1, way: "담습니다.", ingredientMasterIds: [10] }],
      }),
    );

    expect(record.ingredients[0]).toMatchObject({
      displayQuantity: 1,
      displayUnitLabel: "공기",
      sourceText: "밥 1공기",
      convertedGrams: 210,
      conversionMethod: "portion_standard",
      conversionReviewRequired: false,
    });
    expect(record.steps[0]?.ingredientChips[0]?.displayUnitLabel).toBe("공기");
  });

  it("omits display fields the server did not send", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({ ingredients: [{ masterId: 1, name: "소금", quantity: 1, unit: "pinch" }] }),
    );

    expect(record.ingredients[0]).not.toHaveProperty("displayQuantity");
    expect(record.ingredients[0]).not.toHaveProperty("convertedGrams");
  });

  it("normalizes tools and drops entries without a code", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        requiredTool: "oven",
        tools: [
          { code: "oven", labelKo: "오븐", labelEn: "Oven", basic: false, stepNumbers: [2, "3"], optional: false, altGroup: "bake" },
          { code: " ", labelKo: "없음" },
          { code: "knife", basic: true },
        ],
      }),
    );

    expect(record.tools).toEqual([
      { code: "oven", labelKo: "오븐", labelEn: "Oven", basic: false, stepNumbers: [2, 3], optional: false, altGroup: "bake" },
      { code: "knife", labelKo: null, labelEn: null, basic: true, stepNumbers: [], optional: false, altGroup: null },
    ]);
  });

  it("leaves tools undefined when the server sends none", () => {
    expect(toPublicRecipeRecord(serverRecipe({})).tools).toBeUndefined();
  });

  it("keeps numeric stage keys from steps and sections", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        steps: [
          { stepNumber: 1, way: "손질합니다.", section: 1 },
          { stepNumber: 2, way: "끓입니다.", section: "2" },
        ],
        sections: [{ section: 1, title: "육수 끓이기" }],
      }),
    );

    expect(record.steps.map((step) => step.section)).toEqual(["1", "2"]);
    expect(record.sections[0]?.section).toBe("1");
  });

  it("prefers the ko-KR section title on Korean pages and the localized one elsewhere", () => {
    const sections = [
      { section: 1, title: "Make the broth", titles: { "ko-KR": "육수 끓이기", "en-US": "Broth" } },
      { section: 2, title: "Season", titleKo: "간하기" },
    ];

    const ko = toPublicRecipeRecord(serverRecipe({ sections }), "ko-KR");
    expect(ko.sections.map((section) => section.title)).toEqual(["육수 끓이기", "간하기"]);

    const en = toPublicRecipeRecord(serverRecipe({ sections }), "en-US");
    expect(en.sections.map((section) => section.title)).toEqual(["Broth", "Season"]);
  });
});
