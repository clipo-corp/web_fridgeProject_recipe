import { ArrowLeft, Clock, Download, Flame, Globe, Heart, Languages, MapPin, Play, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IngredientAmount } from "./IngredientAmount";
import { IngredientFormHint } from "./IngredientFormHint";
import { RecipeCreatorSource } from "./RecipeCreatorSource";
import { RecipeVisual } from "./RecipeVisual";
import { SkeletonDetailPage } from "./SkeletonDetailPage";
import { StepIngredientList } from "./StepIngredientList";
import {
  enrichPublicRecipeIngredientNames,
  loadPublicRecipeDetail,
  requestRecipeTranslation,
} from "../lib/recipeApi";
import { videoCreatorSummary, youtubeVideoId } from "../lib/recipeCreatorSource";
import { formatIngredientAmount } from "../lib/recipeIngredientAmount";
import {
  formatTimestamp,
  groupRecipeSteps,
  isSeekableVideoRecipe,
  isValidYoutubeVideoId,
  sectionLabel,
  shouldRenderSectionHeadings,
  stageKicker,
  youtubeEmbedUrl,
} from "../lib/recipeStepSections";
import { formatToolGroupLabel, groupRecipeTools } from "../lib/recipeTools";
import { recipeIngredientEmoji } from "../lib/recipeIngredientEmoji";
import { isServerRecipeId } from "../lib/recipeServerAdapter";
import { useI18n } from "../lib/i18n";
import type { DisplayLanguage } from "../lib/languagePreference";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type RecipeDetailPageProps = {
  readonly recipeId: string;
};

type TranslationPhase = "idle" | "requesting" | "processing" | "error";

function normalizeWrittenLang(writtenLang: string): DisplayLanguage {
  return writtenLang === "ko" ? "ko-KR" : "en-US";
}

function langLabel(displayLang: DisplayLanguage): string {
  return displayLang === "ko-KR" ? "한국어" : "English";
}

export function RecipeDetailPage({ recipeId }: RecipeDetailPageProps): JSX.Element {
  const { t, lang, displayLang, labelFor, countryLabel, timeLabel } = useI18n();
  // The nonce is what makes a repeat press work. Seeking is done by remounting the
  // iframe, and remounting is driven by the React key; keying on the seconds alone
  // means pressing the same chip twice sets an identical value, React bails out, and
  // the player never moves — dead exactly on the "watch that bit again" gesture.
  const [seek, setSeek] = useState<{ seconds: number; nonce: number } | null>(null);
  const videoRef = useRef<HTMLDivElement | null>(null);
  const [recipe, setRecipe] = useState<PublicRecipeRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [translationPhase, setTranslationPhase] = useState<TranslationPhase>("idle");
  const [langReloading, setLangReloading] = useState(false);
  const translationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (translationTimerRef.current !== null) {
        window.clearTimeout(translationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    void loadPublicRecipeDetail(recipeId, displayLang).then((nextRecipe) => {
      if (!cancelled) {
        setRecipe(nextRecipe);
        setLoaded(true);
      }
      if (nextRecipe === null || cancelled) {
        return;
      }

      void enrichPublicRecipeIngredientNames(nextRecipe, displayLang).then((enrichedRecipe) => {
        if (!cancelled) {
          setRecipe((current) => (
            current?.recipeId === enrichedRecipe.recipeId &&
            current.displayLang === enrichedRecipe.displayLang
              ? enrichedRecipe
              : current
          ));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [displayLang, recipeId]);

  const handleTranslationRequest = useCallback(async (): Promise<void> => {
    if (translationTimerRef.current !== null) {
      window.clearTimeout(translationTimerRef.current);
      translationTimerRef.current = null;
    }
    setTranslationPhase("requesting");

    const poll = async (): Promise<void> => {
      try {
        const result = await requestRecipeTranslation(recipeId, displayLang);
        if (result.status === "COMPLETED") {
          const next = await loadPublicRecipeDetail(recipeId, displayLang);
          if (next !== null) setRecipe(next);
          setTranslationPhase("idle");
        } else {
          setTranslationPhase("processing");
          const retryMs = (result.retryAfterSeconds ?? 4) * 1000;
          translationTimerRef.current = window.setTimeout(() => {
            translationTimerRef.current = null;
            void poll();
          }, retryMs);
        }
      } catch {
        setTranslationPhase("error");
      }
    };

    await poll();
  }, [recipeId, displayLang]);

  const handleLangToggle = useCallback(async (): Promise<void> => {
    if (recipe === null) return;
    const writtenLangFull = normalizeWrittenLang(recipe.writtenLang);
    const targetLang = recipe.translationStatus === "translated" ? writtenLangFull : displayLang;
    setLangReloading(true);
    try {
      const next = await loadPublicRecipeDetail(recipeId, targetLang);
      if (next !== null) setRecipe(next);
    } finally {
      setLangReloading(false);
    }
  }, [recipe, recipeId, displayLang]);

  if (!loaded) {
    return <SkeletonDetailPage />;
  }

  if (recipe === null) {
    return (
      <main className="page detail-page detail-page--empty">
        <a className="btn btn--ghost" href="/recipe-catalog">
          <ArrowLeft size={17} aria-hidden="true" />
          {t("detail.back")}
        </a>
        <h1>{t("detail.notFound")}</h1>
      </main>
    );
  }

  const videoSummary = videoCreatorSummary(recipe.creatorSource);

  const writtenLangFull = normalizeWrittenLang(recipe.writtenLang);
  const showingTranslation = recipe.translationStatus === "translated";
  const hasTranslation = recipe.availableLangs.includes(displayLang) && displayLang !== writtenLangFull;
  const canRequestTranslation =
    isServerRecipeId(recipeId) &&
    recipe.writtenLang.length > 0 &&
    displayLang !== writtenLangFull &&
    !showingTranslation &&
    !hasTranslation;
  const ingredientsLabel = t("detail.ingredients");
  const amountFallback = t("detail.toTaste");
  const hasStepIngredientChips = recipe.steps.some((step) => step.ingredientChips.length > 0);
  const toolGroups = groupRecipeTools(recipe.tools, lang, labelFor);
  const showConversionNote = recipe.ingredients.some(
    (ingredient) => formatIngredientAmount(ingredient, lang, amountFallback).approxGrams !== null,
  );

  const stepGroups = groupRecipeSteps(recipe.steps, recipe.sections);
  const showSectionHeadings = shouldRenderSectionHeadings(stepGroups);
  const candidateVideoId = isSeekableVideoRecipe(recipe)
    ? youtubeVideoId(recipe.creatorSource?.sourceId ?? null, recipe.creatorSource?.sourceUrl ?? null)
    : null;
  const videoId = isValidYoutubeVideoId(candidateVideoId) ? candidateVideoId : null;

  const renderStep = (
    step: PublicRecipeRecord["steps"][number],
    displayNumber?: number,
  ): JSX.Element => (
    <li
      key={step.stepNumber}
      className={step.imageUrl === null ? "step-list__item" : "step-list__item step-list__item--media"}
    >
      <span className="step-list__num">{displayNumber ?? step.stepNumber}</span>
      {step.imageUrl !== null ? (
        <img className="step-list__image" src={step.imageUrl} alt="" loading="lazy" />
      ) : null}
      <div className="step-list__content">
        <p>{step.way}</p>
        {videoId !== null && step.startSeconds !== null ? (
          <button
            className="step-list__seek"
            type="button"
            onClick={() => {
              setSeek((current) => ({
                seconds: step.startSeconds as number,
                nonce: (current?.nonce ?? 0) + 1,
              }));
              // The player sits above the steps, so a press from further down the
              // list would otherwise reload it entirely off-screen with no visible
              // feedback.
              videoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            aria-label={t("detail.watchFrom", { time: formatTimestamp(step.startSeconds) })}
          >
            {formatTimestamp(step.startSeconds)}
          </button>
        ) : null}
        {step.cookingTip !== null && step.cookingTip.length > 0 ? <small>{step.cookingTip}</small> : null}
        <StepIngredientList
          ingredients={step.ingredientChips}
          label={ingredientsLabel}
          amountFallback={amountFallback}
        />
      </div>
    </li>
  );

  return (
    <main className="page detail-page">
      <a className="btn btn--ghost detail-page__back" href="/recipe-catalog">
        <ArrowLeft size={17} aria-hidden="true" />
        {t("detail.back")}
      </a>

      {videoSummary?.previewImageUrl !== null && videoSummary?.previewImageUrl !== undefined ? (
        <a
          className="detail-source-preview"
          href={videoSummary.url ?? undefined}
          target={videoSummary.url === null ? undefined : "_blank"}
          rel={videoSummary.url === null ? undefined : "noreferrer"}
        >
          <img src={videoSummary.previewImageUrl} alt={`${videoSummary.name} 영상 미리보기`} loading="lazy" />
          <span className="detail-source-preview__play" aria-hidden="true">
            <Play size={24} fill="currentColor" />
          </span>
        </a>
      ) : (
        <section className="detail-media-card" aria-label={recipe.title}>
          <RecipeVisual recipe={recipe} size="detail" />
        </section>
      )}

      <div className="detail-page__summary">
          <div className="detail-page__badges">
            <span className="brand-badge">
              {labelFor(recipe.cuisineRegion)} · {labelFor(recipe.category)}
            </span>
            {showingTranslation && (
              <span className="translation-indicator">
                <Globe size={12} aria-hidden="true" />
                {displayLang === "ko-KR" ? "번역됨" : "Translated"}
              </span>
            )}
          </div>
          <h1>{recipe.title}</h1>
          <p>{recipe.description}</p>
          <RecipeCreatorSource recipe={recipe} variant="detail" showPreview={false} />

          <div className="detail-meta">
            <span>
              <Clock size={16} aria-hidden="true" />
              {timeLabel(recipe.cookingTime)}
            </span>
            <span>
              <Flame size={16} aria-hidden="true" />
              {labelFor(recipe.difficulty)}
            </span>
            <span>
              <Users size={16} aria-hidden="true" />
              {recipe.servings}
            </span>
            <span>
              <Heart size={16} aria-hidden="true" />
              {recipe.likeCount}
            </span>
            <span>
              <Languages size={16} aria-hidden="true" />
              {recipe.isTranslated ? labelFor(recipe.writtenLang) : labelFor("original")}
            </span>
            <span>
              <MapPin size={16} aria-hidden="true" />
              {formatRegion(recipe, countryLabel)}
            </span>
          </div>

          <div className="detail-chips">
            {[recipe.category, recipe.recipeType, recipe.cookingMethod, recipe.technique]
              .concat(toolGroups.length > 0 ? [] : [recipe.requiredTool])
              .filter((value) => value.length > 0 && value !== "unknown")
              .map((value) => (
                <span className="badge badge--muted" key={value}>
                  {labelFor(value)}
                </span>
              ))}
          </div>

          {toolGroups.length > 0 ? (
            <div className="detail-tools">
              <span className="detail-tools__label" id="detail-tools-label">
                {t("detail.tools")}
              </span>
              <ul className="detail-tools__list" aria-labelledby="detail-tools-label">
                {toolGroups.map((group) => (
                  <li key={group.key}>
                    {formatToolGroupLabel(group, lang)}
                    {group.optional ? (
                      <span className="detail-tools__optional"> {t("detail.toolOptional")}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {recipe.cookingTip.length > 0 ? <p className="detail-tip">{recipe.cookingTip}</p> : null}

          {translationPhase === "processing" && (
            <div className="translation-status translation-status--processing">
              <span className="translation-status__dot" aria-hidden="true" />
              {displayLang === "ko-KR" ? "AI가 번역하고 있어요..." : "Generating translation..."}
            </div>
          )}
          {translationPhase === "error" && (
            <div className="translation-status translation-status--error">
              {displayLang === "ko-KR" ? "번역 요청에 실패했어요. 다시 시도해주세요." : "Translation failed. Please try again."}
            </div>
          )}
          {translationPhase === "idle" && canRequestTranslation && (
            <button
              className="btn btn--translation"
              onClick={() => { void handleTranslationRequest(); }}
              type="button"
            >
              <Languages size={15} aria-hidden="true" />
              {langLabel(displayLang)}
              {displayLang === "ko-KR" ? "로 번역" : " translation"}
            </button>
          )}
          {translationPhase === "requesting" && (
            <button className="btn btn--translation btn--translation--loading" disabled type="button">
              <span className="btn-spinner" aria-hidden="true" />
              {displayLang === "ko-KR" ? "번역 요청 중..." : "Requesting translation..."}
            </button>
          )}
          {translationPhase === "idle" && hasTranslation && (
            <button
              className="btn btn--ghost btn--translation-toggle"
              onClick={() => { void handleLangToggle(); }}
              disabled={langReloading}
              type="button"
            >
              {langReloading
                ? <span className="btn-spinner" aria-hidden="true" />
                : null}
              {showingTranslation
                ? (displayLang === "ko-KR" ? "원문 보기" : "View original")
                : (displayLang === "ko-KR" ? "번역 보기" : "View translation")}
            </button>
          )}
        </div>

        <section className="detail-section detail-card">
          <h2>{ingredientsLabel}</h2>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={`${ingredient.name}-${index}`}>
                <span className="ingredient-list__emoji" aria-hidden="true">
                  {recipeIngredientEmoji(ingredient)}
                </span>
                <span className="ingredient-list__copy">
                  <span className="ingredient-list__name">
                    <IngredientFormHint ingredient={ingredient} />
                    {ingredient.name}
                  </span>
                  {ingredient.description.length > 0 ? (
                    <small>{ingredient.description}</small>
                  ) : null}
                </span>
                <IngredientAmount
                  ingredient={ingredient}
                  className="ingredient-list__amount"
                  amountFallback={amountFallback}
                />
              </li>
            ))}
          </ul>
          {showConversionNote ? (
            <p className="ingredient-conversion-note">
              <strong>{t("detail.conversionNoteTitle")}</strong>
              {" "}
              {t("detail.conversionNote")}
            </p>
          ) : null}
        </section>

        {videoId !== null ? (
          <section className="detail-section detail-card">
            <h2>{t("detail.videoSection")}</h2>
            <div className="recipe-video" ref={videoRef}>
              <iframe
                key={seek?.nonce ?? "start"}
                src={youtubeEmbedUrl(videoId, seek?.seconds ?? null)}
                title={recipe.title}
                // Eager once a seek is pending: a lazily-loaded replacement may defer
                // its request while off-screen, so the seek would appear to do nothing.
                loading={seek === null ? "lazy" : "eager"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        <section className="detail-section detail-card">
          <h2>{t("detail.steps")}</h2>
          {showSectionHeadings ? (
            stepGroups.map((group, index) => {
              const heading = sectionLabel(group.section, group.title, lang);
              return (
                <div className="step-group" key={`${group.section}-${index}`}>
                  <h3 className="step-group__title">
                    <span className="step-group__kicker">{stageKicker(index, lang)}</span>
                    {heading !== null ? (
                      <>
                        {" "}
                        <span className="step-group__name">{heading}</span>
                      </>
                    ) : null}
                  </h3>
                  <ol className="step-list">{group.steps.map((step, i) => renderStep(step, group.displayNumbers[i]))}</ol>
                </div>
              );
            })
          ) : (
            <ol className="step-list">{recipe.steps.map((step) => renderStep(step))}</ol>
          )}
          {!hasStepIngredientChips && recipe.ingredients.length > 0 ? (
            <StepIngredientList
              ingredients={recipe.ingredients}
              label={ingredientsLabel}
              amountFallback={amountFallback}
              className="step-ingredients--summary"
            />
          ) : null}
        </section>

        <a className="btn btn--primary detail-install" href="/install">
          <Download size={18} aria-hidden="true" />
          {t("detail.install")}
        </a>
    </main>
  );
}

function formatRegion(
  recipe: PublicRecipeRecord,
  countryLabel: (country: string) => string,
): string {
  const country = recipe.canonicalCountry ?? recipe.country;
  const city = recipe.canonicalCity ?? recipe.city;
  const district = recipe.canonicalDistrict ?? recipe.district;
  const parts = [countryLabel(country), city, district].filter(
    (value): value is string => value !== null && value.length > 0,
  );
  return parts.join(" · ");
}
