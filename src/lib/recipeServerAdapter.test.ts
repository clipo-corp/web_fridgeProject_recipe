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
