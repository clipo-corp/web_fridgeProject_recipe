import { AlertCircle, CheckCircle2, ChevronLeft, HelpCircle, Send } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  composeSupportDescription,
  createSupportReport,
  supportDescriptionMaxLength,
  supportReportCategories,
  type SupportReportCategory,
} from "../lib/supportApi";
import { validateSupportReportInput } from "../lib/supportApi";

type SupportCategoryOption = {
  readonly value: SupportReportCategory;
  readonly label: string;
  readonly description: string;
};

type SubmitState =
  | { readonly kind: "idle" }
  | { readonly kind: "submitting" }
  | { readonly kind: "success"; readonly reportId: number }
  | { readonly kind: "error"; readonly message: string };

const supportCategoryOptions: readonly SupportCategoryOption[] = [
  { value: "BUG", label: "오류/버그", description: "앱이 멈추거나 기능이 제대로 작동하지 않을 때" },
  { value: "INQUIRY", label: "일반 문의", description: "서비스 이용 중 궁금한 점이 있을 때" },
  { value: "PAYMENT", label: "결제/구독", description: "결제, 구독, 티켓 지급 관련 문제가 있을 때" },
  { value: "ACCOUNT", label: "계정", description: "로그인, 회원 정보, 탈퇴 관련 도움이 필요할 때" },
  {
    value: "FEATURE_REQUEST",
    label: "기능 제안",
    description: "keepcook에 추가되면 좋은 기능을 제안할 때",
  },
  { value: "ETC", label: "기타", description: "위 항목에 해당하지 않는 문의" },
];

const defaultCategory: SupportReportCategory = "BUG";

export function SupportPage(): JSX.Element {
  const [category, setCategory] = useState<SupportReportCategory>(defaultCategory);
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  const selectedCategory = supportCategoryOptions.find((option) => option.value === category);
  const composedDescriptionLength = composeSupportDescription(description, contactEmail).length;
  const isSubmitting = submitState.kind === "submitting";

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextCategory = supportReportCategories.find((item) => item === event.target.value);
    if (nextCategory !== undefined) {
      setCategory(nextCategory);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const validationMessage = validateSupportReportInput(description, contactEmail);
    if (validationMessage !== null) {
      setSubmitState({ kind: "error", message: validationMessage });
      return;
    }

    setSubmitState({ kind: "submitting" });

    try {
      const response = await createSupportReport({
        category,
        description: composeSupportDescription(description, contactEmail),
      });
      setSubmitState({ kind: "success", reportId: response.reportId });
      setDescription("");
    } catch (error) {
      setSubmitState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  }

  return (
    <main className="support-page">
      <section className="support-shell" aria-labelledby="support-title">
        <a className="support-back-link" href="/">
          <ChevronLeft size={18} aria-hidden="true" />
          레시피 둘러보기
        </a>

        <div className="support-layout">
          <header className="support-intro">
            <p className="support-eyebrow">keepcook support</p>
            <h1 id="support-title">오류 신고와 문의를 접수합니다</h1>
            <p>
              앱 이용 중 발생한 문제, 계정, 결제, 기능 제안을 남겨 주세요. 답변이 필요한 경우
              이메일을 함께 적어 주시면 확인 후 연락드릴 수 있습니다.
            </p>

            <div className="support-contact-box">
              <HelpCircle size={22} aria-hidden="true" />
              <div>
                <strong>이메일 문의</strong>
                <a href="mailto:clipocor@gmail.com">clipocor@gmail.com</a>
              </div>
            </div>
          </header>

          <form className="support-form" onSubmit={handleSubmit}>
            <label className="support-field">
              <span>문의 유형</span>
              <select value={category} onChange={handleCategoryChange} disabled={isSubmitting}>
                {supportCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small>{selectedCategory?.description ?? "문의 유형을 선택해 주세요."}</small>
            </label>

            <label className="support-field">
              <span>답변 받을 이메일 선택 입력</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                placeholder="name@example.com"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </label>

            <label className="support-field">
              <span>문의 내용</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="문제가 발생한 화면, 재현 방법, 기대한 동작을 함께 적어 주세요."
                maxLength={supportDescriptionMaxLength}
                disabled={isSubmitting}
                rows={9}
              />
              <small>
                {Math.min(composedDescriptionLength, supportDescriptionMaxLength)} /{" "}
                {supportDescriptionMaxLength}
              </small>
            </label>

            <div className="support-status" aria-live="polite">
              {submitState.kind === "success" ? (
                <p className="support-status__success">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  접수되었습니다. 접수 번호는 #{submitState.reportId}입니다.
                </p>
              ) : null}
              {submitState.kind === "error" ? (
                <p className="support-status__error">
                  <AlertCircle size={18} aria-hidden="true" />
                  {submitState.message}
                </p>
              ) : null}
            </div>

            <button className="support-submit" type="submit" disabled={isSubmitting}>
              <Send size={18} aria-hidden="true" />
              {isSubmitting ? "접수 중" : "문의 접수"}
            </button>

            <p className="support-privacy-note">
              문의 처리에 필요한 정보만 확인하며, 자세한 내용은{" "}
              <a href="/privacy">개인정보처리방침</a>에서 확인할 수 있습니다.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
