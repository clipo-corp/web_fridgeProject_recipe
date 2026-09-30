import { describe, expect, it } from "vitest";

import {
  formatApproxGrams,
  formatIngredientAmount,
  formatQuantityNumber,
  type IngredientAmountSource,
} from "./recipeIngredientAmount";

const toTaste = "적당량";

function line(fields: Partial<IngredientAmountSource>): IngredientAmountSource {
  return { quantity: null, unit: null, ...fields };
}

describe("formatQuantityNumber", () => {
  it("prints numbers without trailing zeros or float noise", () => {
    expect(formatQuantityNumber(1)).toBe("1");
    expect(formatQuantityNumber(0.5)).toBe("0.5");
    expect(formatQuantityNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatQuantityNumber(-0)).toBe("0");
  });
});

describe("formatIngredientAmount — display fields", () => {
  it("uses the recipe's own unit and adds the converted weight", () => {
    const amount = formatIngredientAmount(
      line({
        quantity: 1,
        unit: "count",
        displayQuantity: 1,
        displayUnitLabel: "공기",
        convertedGrams: 210,
        conversionMethod: "portion_standard",
      }),
      "ko",
      toTaste,
    );

    expect(amount).toEqual({ primary: "1 공기", approxGrams: "약 210g" });
  });

  it("localizes a display label that is really a unit enum", () => {
    expect(
      formatIngredientAmount(line({ displayQuantity: 5, displayUnitLabel: "count" }), "ko", toTaste).primary,
    ).toBe("5 개");
    expect(
      formatIngredientAmount(line({ displayQuantity: 1500, displayUnitLabel: "ml" }), "ko", toTaste).primary,
    ).toBe("1.5 L");
  });

  it("hides the weight hint when the line is already in grams", () => {
    const amount = formatIngredientAmount(
      line({ displayQuantity: 200, displayUnitLabel: "g", convertedGrams: 200 }),
      "ko",
      toTaste,
    );

    expect(amount).toEqual({ primary: "200 g", approxGrams: null });
  });

  it("keeps the weight hint for volume units", () => {
    const amount = formatIngredientAmount(
      line({ displayQuantity: 200, displayUnitLabel: "ml", convertedGrams: 206.4, conversionMethod: "volume_density" }),
      "ko",
      toTaste,
    );

    expect(amount.approxGrams).toBe("약 206g");
  });

  it("withholds an estimate that is flagged for review", () => {
    const amount = formatIngredientAmount(
      line({ displayQuantity: 1, displayUnitLabel: "줌", convertedGrams: 20, conversionReviewRequired: true }),
      "ko",
      toTaste,
    );

    expect(amount).toEqual({ primary: "1 줌", approxGrams: null });
  });

  it("falls back to quantity/unit when the display label is missing", () => {
    expect(
      formatIngredientAmount(line({ quantity: 2, unit: "spoon", displayQuantity: 2 }), "ko", toTaste).primary,
    ).toBe("2 스푼");
  });
});

describe("formatIngredientAmount — legacy quantity/unit", () => {
  it("follows the app's unit rules", () => {
    const format = (quantity: number | null, unit: string | null, lang: "ko" | "en" = "ko") =>
      formatIngredientAmount(line({ quantity, unit }), lang, toTaste).primary;

    expect(format(2, "count")).toBe("2 개");
    expect(format(2, null)).toBe("2 개");
    expect(format(2, "count", "en")).toBe("2");
    expect(format(1500, "g")).toBe("1.5 kg");
    expect(format(0.5, "spoon")).toBe("0.5 스푼");
    expect(format(1, "pinch", "en")).toBe("1 pinch");
    expect(format(1, "preference")).toBe("취향껏");
    expect(format(3, "amount")).toBe("3");
  });

  it("uses the to-taste fallback when there is no quantity", () => {
    expect(formatIngredientAmount(line({}), "ko", toTaste).primary).toBe(toTaste);
    expect(formatIngredientAmount(line({ unit: "preference" }), "en", "To taste").primary).toBe("to taste");
  });

  it("keeps an unknown server unit visible", () => {
    expect(formatIngredientAmount(line({ quantity: 1, unit: "sheet" }), "en", "To taste").primary).toBe("1 sheet");
  });
});

describe("formatApproxGrams", () => {
  it("rounds to whole grams from 10g, one decimal below, kg from 1000g", () => {
    expect(formatApproxGrams(209.6, "ko")).toBe("약 210g");
    expect(formatApproxGrams(2.46, "ko")).toBe("약 2.5g");
    expect(formatApproxGrams(1250, "en")).toBe("About 1.25kg");
  });
});
