import { fetchWithGuestAuth } from "./recipeGuestAuth";

export const recipeReportReasons = [
  "SPAM_OR_MISLEADING",
  "HARMFUL_OR_DANGEROUS",
  "INAPPROPRIATE_CONTENT",
  "HATE_OR_ABUSE",
  "COPYRIGHT",
  "WRONG_INFORMATION",
  "ETC",
] as const;

export type RecipeReportReason = (typeof recipeReportReasons)[number];

export type RecipeReportCreatePayload = {
  readonly reasons: readonly RecipeReportReason[];
  readonly detail: string | null;
};

export type RecipeReportCreateData = {
  readonly reportId: number;
  readonly status?: string;
  readonly createdAt?: string;
};

export const recipeReportDetailMaxLength = 2000;

const etcReason = "ETC" satisfies RecipeReportReason;

export function createRecipeReport(
  recipeId: string | number,
  payload: RecipeReportCreatePayload,
): Promise<RecipeReportCreateData> {
  return fetchWithGuestAuth<RecipeReportCreateData>(
    `/api/recipes/${encodeURIComponent(String(recipeId))}/reports`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function validateRecipeReportInput(
  reasons: readonly RecipeReportReason[],
  detail: string,
): string | null {
  const trimmedDetail = detail.trim();

  if (reasons.length === 0) {
    return "신고 사유를 하나 이상 선택해 주세요.";
  }

  if (reasons.includes(etcReason) && trimmedDetail.length === 0) {
    return "기타 사유를 선택했다면 상세 내용을 입력해 주세요.";
  }

  if (trimmedDetail.length > recipeReportDetailMaxLength) {
    return `상세 내용은 ${recipeReportDetailMaxLength}자 이내로 입력해 주세요.`;
  }

  return null;
}
