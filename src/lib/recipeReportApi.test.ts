import { describe, expect, it } from "vitest";
import {
  recipeReportDetailMaxLength,
  validateRecipeReportInput,
} from "./recipeReportApi";

describe("validateRecipeReportInput", () => {
  it("requires at least one report reason", () => {
    expect(validateRecipeReportInput([], "")).toBe("신고 사유를 하나 이상 선택해 주세요.");
  });

  it("requires detail when ETC is selected", () => {
    expect(validateRecipeReportInput(["ETC"], "   ")).toBe(
      "기타 사유를 선택했다면 상세 내용을 입력해 주세요.",
    );
  });

  it("limits detail length to the server contract", () => {
    expect(validateRecipeReportInput(["SPAM_OR_MISLEADING"], "a".repeat(recipeReportDetailMaxLength + 1))).toBe(
      `상세 내용은 ${recipeReportDetailMaxLength}자 이내로 입력해 주세요.`,
    );
  });

  it("accepts multiple reasons with optional detail", () => {
    expect(validateRecipeReportInput(["SPAM_OR_MISLEADING", "WRONG_INFORMATION"], "")).toBe(null);
  });
});
