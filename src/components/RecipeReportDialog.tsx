import { useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import { ApiResponseError } from "../lib/recipeGuestAuth";
import {
  createRecipeReport,
  recipeReportDetailMaxLength,
  recipeReportReasons,
  validateRecipeReportInput,
} from "../lib/recipeReportApi";
import type { RecipeReportReason } from "../lib/recipeReportApi";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type RecipeReportDialogProps = {
  readonly recipe: PublicRecipeRecord;
  readonly onClose: () => void;
};

type SubmitState =
  | { readonly kind: "idle" }
  | { readonly kind: "submitting" }
  | { readonly kind: "success"; readonly message: string }
  | { readonly kind: "notice"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

const reasonLabels = {
  SPAM_OR_MISLEADING: "스팸 또는 오해를 유도하는 내용",
  HARMFUL_OR_DANGEROUS: "위험하거나 따라 하기 어려운 조리법",
  INAPPROPRIATE_CONTENT: "부적절한 내용",
  HATE_OR_ABUSE: "혐오 또는 괴롭힘",
  COPYRIGHT: "저작권 침해",
  WRONG_INFORMATION: "잘못된 정보",
  ETC: "기타",
} satisfies Record<RecipeReportReason, string>;

export function RecipeReportDialog({ recipe, onClose }: RecipeReportDialogProps): JSX.Element {
  const [selectedReasons, setSelectedReasons] = useState<readonly RecipeReportReason[]>([]);
  const [detail, setDetail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });
  const validationMessage = validateRecipeReportInput(selectedReasons, detail);
  const isSubmitting = submitState.kind === "submitting";
  const canSubmit = validationMessage === null && !isSubmitting && submitState.kind !== "success";

  const toggleReason = (reason: RecipeReportReason): void => {
    setSubmitState({ kind: "idle" });
    setSelectedReasons((currentReasons) =>
      currentReasons.includes(reason)
        ? currentReasons.filter((currentReason) => currentReason !== reason)
        : [...currentReasons, reason],
    );
  };

  const submitReport = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (validationMessage !== null) {
      setSubmitState({ kind: "notice", message: validationMessage });
      return;
    }

    setSubmitState({ kind: "submitting" });

    try {
      await createRecipeReport(recipe.recipeId, {
        reasons: selectedReasons,
        detail: detail.trim().length > 0 ? detail.trim() : null,
      });
      setSubmitState({ kind: "success", message: "신고가 접수됐어요. 검토 후 필요한 조치를 진행할게요." });
    } catch (error: unknown) {
      if (error instanceof ApiResponseError) {
        setSubmitState(messageForApiError(error));
        return;
      }

      if (error instanceof Error) {
        setSubmitState({ kind: "error", message: "신고를 접수하지 못했어요. 잠시 후 다시 시도해 주세요." });
        return;
      }

      throw error;
    }
  };

  return (
    <div className="recipe-report-dialog-backdrop" role="presentation" onClick={(event) => closeFromBackdrop(event, onClose)}>
      <form
        className="recipe-report-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-report-title"
        onClick={stopPropagation}
        onSubmit={submitReport}
      >
        <div className="recipe-report-dialog__header">
          <div>
            <p className="recipe-report-dialog__eyebrow">Recipe report</p>
            <h3 id="recipe-report-title">레시피 신고</h3>
            <p>{recipe.title}</p>
          </div>
          <button className="recipe-report-dialog__close" type="button" aria-label="신고 창 닫기" onClick={onClose}>
            ×
          </button>
        </div>

        <fieldset className="recipe-report-dialog__reasons">
          <legend>신고 사유를 선택해 주세요.</legend>
          {recipeReportReasons.map((reason) => (
            <label className="recipe-report-dialog__reason" key={reason}>
              <input
                type="checkbox"
                checked={selectedReasons.includes(reason)}
                onChange={() => toggleReason(reason)}
              />
              <span>{reasonLabels[reason]}</span>
            </label>
          ))}
        </fieldset>

        <label className="recipe-report-dialog__detail">
          <span>상세 내용</span>
          <textarea
            value={detail}
            maxLength={recipeReportDetailMaxLength}
            placeholder="문제가 되는 내용이나 이유를 적어 주세요."
            onChange={(event) => {
              setSubmitState({ kind: "idle" });
              setDetail(event.currentTarget.value);
            }}
          />
          <small>
            {detail.trim().length}/{recipeReportDetailMaxLength}
          </small>
        </label>

        {submitState.kind !== "idle" && submitState.kind !== "submitting" ? (
          <div className={`recipe-report-dialog__message recipe-report-dialog__message--${submitState.kind}`}>
            {submitState.message}
            {submitState.kind === "notice" && submitState.message.includes("로그인") ? (
              <a href="#app-download">앱에서 열기</a>
            ) : null}
          </div>
        ) : null}

        <div className="recipe-report-dialog__actions">
          <button className="btn btn--secondary" type="button" onClick={onClose}>
            취소
          </button>
          <button className="btn btn--primary" type="submit" disabled={!canSubmit}>
            {isSubmitting ? "접수 중" : "신고 접수"}
          </button>
        </div>
      </form>
    </div>
  );
}

function messageForApiError(error: ApiResponseError): SubmitState {
  if (error.code === "ALREADY_REPORTED_RECIPE") {
    return { kind: "notice", message: "이미 신고한 레시피예요." };
  }

  if (error.status === 401 || error.status === 403) {
    return { kind: "notice", message: "앱에서 로그인 후 신고해 주세요." };
  }

  return { kind: "error", message: error.message };
}

function stopPropagation(event: MouseEvent): void {
  event.stopPropagation();
}

function closeFromBackdrop(event: MouseEvent, onClose: () => void): void {
  event.stopPropagation();
  onClose();
}
