import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/i18n", () => ({
  useI18n: () => ({ lang: "ko" }),
}));

import { IngredientAmount } from "./IngredientAmount";
import { toPublicRecipeRecord } from "../lib/recipeServerAdapter";
import type { ServerRecipeInfo } from "../lib/recipeServerTypes";

function jacksonGet(body: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(body, (_key, value) => (value === null ? undefined : value)),
  ) as Record<string, unknown>;
}

function serverRecipe(patch: Partial<ServerRecipeInfo>): ServerRecipeInfo {
  return {
    recipeId: 1,
    title: "테스트 레시피",
    steps: [{ stepNumber: 1, way: "끓입니다." }],
    ...patch,
  } as ServerRecipeInfo;
}

function renderAmount(ingredient: Parameters<typeof IngredientAmount>[0]["ingredient"]): string {
  return renderToStaticMarkup(
    createElement(IngredientAmount, {
      ingredient,
      className: "ingredient-list__amount",
      amountFallback: "적당량",
    }),
  );
}

describe("IngredientAmount live GET wire → renderer", () => {
  it("shows preparation 100 g and intake 25 g", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        ingredients: [
          jacksonGet({
            masterId: 1,
            name: "물",
            quantity: 100,
            unit: "g",
            role: "preparation",
            consumedQuantity: 25,
          }),
        ] as ServerRecipeInfo["ingredients"],
      }),
    );
    const html = renderAmount(record.ingredients[0]!);
    expect(html).toContain("100 g");
    expect(html).toContain("섭취 25 g");
    expect(html).not.toContain("섭취 제외");
  });

  it("separates CQ 0, role-only exclude, unknown, and legacy omit", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        ingredients: [
          jacksonGet({
            masterId: 1,
            name: "얼음",
            quantity: 150,
            unit: "g",
            role: "discarded",
            consumedQuantity: 0,
          }),
          jacksonGet({
            masterId: 2,
            name: "데침물",
            quantity: 4000,
            unit: "ml",
            role: "preparation",
          }),
          jacksonGet({
            masterId: 3,
            name: "육수",
            quantity: 500,
            unit: "ml",
            role: "unknown",
          }),
          jacksonGet({
            masterId: 4,
            name: "소금",
            quantity: 200,
            unit: "g",
          }),
        ] as ServerRecipeInfo["ingredients"],
      }),
    );
    const [zero, roleOnly, unknown, legacy] = record.ingredients.map(renderAmount);
    expect(zero).toContain("150 g");
    expect(zero).toContain("섭취 제외");
    expect(roleOnly).toContain("4 L");
    expect(roleOnly).toContain("섭취 제외");
    expect(unknown).toContain("500 ml");
    expect(unknown).toContain("추정 섭취");
    expect(legacy).toContain("200 g");
    expect(legacy).not.toContain("섭취");
    expect(legacy).not.toContain("추정");
  });

  it("keeps unresolved alternatives visible with full required amounts", () => {
    const record = toPublicRecipeRecord(
      serverRecipe({
        ingredients: [
          jacksonGet({
            masterId: 3,
            name: "잼",
            quantity: 200,
            unit: "g",
            alternativeGroup: "filling",
            alternativeOf: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          }),
          jacksonGet({
            masterId: 4,
            name: "커스터드",
            quantity: 200,
            unit: "g",
            alternativeGroup: "filling",
          }),
        ] as ServerRecipeInfo["ingredients"],
      }),
    );
    const jam = renderAmount(record.ingredients[0]!);
    const custard = renderAmount(record.ingredients[1]!);
    expect(jam).toContain("200 g");
    expect(custard).toContain("200 g");
    expect(jam).not.toContain("섭취");
    expect(custard).not.toContain("섭취");
    expect(jam).not.toContain("선택 완료");
  });
});
