import { fetchWithGuestAuth } from "./recipeGuestAuth";

export const supportReportCategories = [
  "BUG",
  "INQUIRY",
  "PAYMENT",
  "ACCOUNT",
  "FEATURE_REQUEST",
  "ETC",
] as const;

export type SupportReportCategory = (typeof supportReportCategories)[number];

export type SupportReportCreatePayload = {
  readonly category: SupportReportCategory;
  readonly description: string;
};

export type SupportReportCreateData = {
  readonly reportId: number;
};

export const supportDescriptionMinLength = 10;
export const supportDescriptionMaxLength = 3000;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createSupportReport(
  payload: SupportReportCreatePayload,
): Promise<SupportReportCreateData> {
  return fetchWithGuestAuth<SupportReportCreateData>("/api/support/reports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function composeSupportDescription(description: string, contactEmail: string): string {
  const trimmedDescription = description.trim();
  const trimmedContactEmail = contactEmail.trim();

  if (trimmedContactEmail.length === 0) {
    return trimmedDescription;
  }

  return `Contact email: ${trimmedContactEmail}\n\n${trimmedDescription}`;
}

export function validateSupportReportInput(
  description: string,
  contactEmail: string,
): string | null {
  const trimmedDescription = description.trim();
  const trimmedContactEmail = contactEmail.trim();

  if (trimmedDescription.length < supportDescriptionMinLength) {
    return `문의 내용을 ${supportDescriptionMinLength}자 이상 입력해 주세요.`;
  }

  if (trimmedContactEmail.length > 0 && !emailPattern.test(trimmedContactEmail)) {
    return "답변 받을 이메일 형식을 확인해 주세요.";
  }

  if (composeSupportDescription(trimmedDescription, trimmedContactEmail).length > supportDescriptionMaxLength) {
    return `문의 내용은 연락처 포함 ${supportDescriptionMaxLength}자 이내로 입력해 주세요.`;
  }

  return null;
}
