import { describe, expect, it } from "vitest";
import {
  composeSupportDescription,
  createSupportMailtoHref,
  supportContactEmail,
  validateSupportReportInput,
} from "./supportApi";

describe("composeSupportDescription", () => {
  it("prepends optional contact email without changing the support API payload shape", () => {
    expect(composeSupportDescription("앱에서 저장 버튼을 누르면 오류가 납니다.", "user@example.com")).toBe(
      "Contact email: user@example.com\n\n앱에서 저장 버튼을 누르면 오류가 납니다.",
    );
  });

  it("keeps the description only when contact email is blank", () => {
    expect(composeSupportDescription("앱에서 저장 버튼을 누르면 오류가 납니다.", " ")).toBe(
      "앱에서 저장 버튼을 누르면 오류가 납니다.",
    );
  });
});

describe("validateSupportReportInput", () => {
  it("requires a useful description", () => {
    expect(validateSupportReportInput("짧음", "")).toBe("문의 내용을 10자 이상 입력해 주세요.");
  });

  it("validates optional contact email", () => {
    expect(validateSupportReportInput("앱에서 저장 버튼을 누르면 오류가 납니다.", "wrong-email")).toBe(
      "답변 받을 이메일 형식을 확인해 주세요.",
    );
  });
});

describe("createSupportMailtoHref", () => {
  it("creates a support email fallback with the selected category and description", () => {
    const href = createSupportMailtoHref({
      category: "BUG",
      description: "앱에서 저장 버튼을 누르면 오류가 납니다.",
      contactEmail: "user@example.com",
    });

    expect(href.startsWith(`mailto:${supportContactEmail}?`)).toBe(true);
    expect(decodeURIComponent(href)).toContain("[keepcook support] BUG");
    expect(decodeURIComponent(href)).toContain("Contact email: user@example.com");
    expect(decodeURIComponent(href)).toContain("앱에서 저장 버튼을 누르면 오류가 납니다.");
  });
});
