import { describe, expect, it } from "vitest";

import {
  formatApproxGrams,
  formatIngredientAmount,
  formatKitchenQuantity,
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

    expect(amount).toEqual({ primary: "1 공기", approxGrams: "(약 210g)" });
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

  it("hides the weight hint for metric volume units too", () => {
    for (const label of ["ml", "L", "kg"]) {
      const amount = formatIngredientAmount(
        line({ displayQuantity: 2, displayUnitLabel: label, convertedGrams: 206.4, conversionMethod: "volume_density" }),
        "ko",
        toTaste,
      );
      expect(amount.approxGrams).toBeNull();
    }
  });

  it("shows portion-standard estimates even when flagged for review", () => {
    const rice = formatIngredientAmount(
      line({
        quantity: 0.7,
        unit: "count",
        displayQuantity: 1,
        displayUnitLabel: "공기",
        convertedGrams: 210,
        conversionMethod: "portion_standard",
        conversionReviewRequired: true,
      }),
      "ko",
      toTaste,
    );
    expect(rice).toEqual({ primary: "1 공기", approxGrams: "(약 210g)" });

    const herbs = formatIngredientAmount(
      line({ displayQuantity: 1, displayUnitLabel: "줌", convertedGrams: 20, conversionReviewRequired: true }),
      "en",
      toTaste,
    );
    expect(herbs).toEqual({ primary: "1 handful", approxGrams: "(about 20g)" });
  });

  it("hides the weight hint when there is no converted weight", () => {
    expect(
      formatIngredientAmount(line({ displayQuantity: 1, displayUnitLabel: "공기", convertedGrams: 0 }), "ko", toTaste)
        .approxGrams,
    ).toBeNull();
    expect(
      formatIngredientAmount(line({ displayQuantity: 1, displayUnitLabel: "공기" }), "ko", toTaste).approxGrams,
    ).toBeNull();
  });

  it("prints written amounts as kitchen fractions", () => {
    const format = (displayQuantity: number, displayUnitLabel: string) =>
      formatIngredientAmount(line({ displayQuantity, displayUnitLabel }), "ko", toTaste).primary;

    expect(format(0.333, "종이컵")).toBe("1/3 종이컵");
    expect(format(0.5, "큰술")).toBe("1/2 큰술");
    expect(format(1.5, "큰술")).toBe("1 1/2 큰술");
    expect(format(0.667, "컵")).toBe("2/3 컵");
    expect(format(0.3, "컵")).toBe("0.3 컵");
    expect(format(250, "ml")).toBe("250 ml");
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
    expect(format(0.5, "spoon")).toBe("1/2 스푼");
    expect(format(0.5, "g")).toBe("0.5 g");
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
    expect(formatApproxGrams(209.6, "ko")).toBe("(약 210g)");
    expect(formatApproxGrams(2.46, "ko")).toBe("(약 2.5g)");
    expect(formatApproxGrams(1250, "en")).toBe("(about 1.25kg)");
  });
});

describe("formatKitchenQuantity", () => {
  it("snaps to common fractions within ±0.01, otherwise one decimal", () => {
    expect(formatKitchenQuantity(0.333)).toBe("1/3");
    expect(formatKitchenQuantity(0.5)).toBe("1/2");
    expect(formatKitchenQuantity(0.25)).toBe("1/4");
    expect(formatKitchenQuantity(0.667)).toBe("2/3");
    expect(formatKitchenQuantity(0.75)).toBe("3/4");
    expect(formatKitchenQuantity(1.5)).toBe("1 1/2");
    expect(formatKitchenQuantity(2.34)).toBe("2 1/3");
    expect(formatKitchenQuantity(0.35)).toBe("0.4");
    expect(formatKitchenQuantity(1.26)).toBe("1 1/4");
    expect(formatKitchenQuantity(1.28)).toBe("1.3");
    expect(formatKitchenQuantity(2)).toBe("2");
    expect(formatKitchenQuantity(1.995)).toBe("2");
    expect(formatKitchenQuantity(0.03)).toBe("0.03");
    expect(formatKitchenQuantity(0)).toBe("0");
  });
});

describe("formatIngredientAmount — non-Korean pages", () => {
  const en = (fields: Partial<IngredientAmountSource>) => formatIngredientAmount(line(fields), "en", "To taste");

  it("translates known Korean labels", () => {
    expect(en({ displayQuantity: 1, displayUnitLabel: "공기", convertedGrams: 210 })).toEqual({
      primary: "1 bowl",
      approxGrams: "(about 210g)",
    });
    expect(en({ displayQuantity: 1, displayUnitLabel: "컵" }).primary).toBe("1 cup");
    expect(en({ displayQuantity: 0.333, displayUnitLabel: "종이컵" }).primary).toBe("1/3 paper cup");
    expect(en({ displayQuantity: 1, displayUnitLabel: "한 줌" }).primary).toBe("1 handful");
    expect(en({ displayQuantity: 2, displayUnitLabel: "큰술" }).primary).toBe("2 tbsp");
    expect(en({ displayQuantity: 1, displayUnitLabel: "작은술" }).primary).toBe("1 tsp");
    expect(en({ displayQuantity: 3, displayUnitLabel: "쪽" }).primary).toBe("3 clove");
    expect(en({ displayQuantity: 2, displayUnitLabel: "개" }).primary).toBe("2");
    expect(en({ displayQuantity: 1, displayUnitLabel: "적당량" }).primary).toBe("to taste");
  });

  it("falls back to quantity/unit for an unknown Korean label", () => {
    expect(en({ quantity: 2, unit: "count", displayQuantity: 1, displayUnitLabel: "주먹밥크기" }).primary).toBe("2");
    expect(en({ quantity: 30, unit: "g", displayQuantity: 1, displayUnitLabel: "움큼" })).toEqual({
      primary: "30 g",
      approxGrams: null,
    });
    expect(en({ displayQuantity: 1, displayUnitLabel: "움큼" }).primary).toBe("To taste");
  });

  it("keeps Korean labels on Korean pages and non-Korean labels everywhere", () => {
    expect(formatIngredientAmount(line({ displayQuantity: 1, displayUnitLabel: "움큼" }), "ko", toTaste).primary).toBe(
      "1 움큼",
    );
    expect(en({ displayQuantity: 2, displayUnitLabel: "slices" }).primary).toBe("2 slices");
  });
});
