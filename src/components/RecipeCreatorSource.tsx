import { ExternalLink, Music2, Play, UserRound, Youtube } from "lucide-react";
import { videoCreatorSummary } from "../lib/recipeCreatorSource";
import type { PublicRecipeRecord } from "../lib/recipeCatalogTypes";

type RecipeCreatorSourceProps = {
  readonly recipe: PublicRecipeRecord;
  readonly variant: "card" | "detail";
  readonly showPreview?: boolean;
};

export function RecipeCreatorSource({
  recipe,
  variant,
  showPreview = true,
}: RecipeCreatorSourceProps): JSX.Element | null {
  const summary = videoCreatorSummary(recipe.creatorSource);
  if (summary === null) {
    return null;
  }

  const className = `creator-source creator-source--${summary.platform} creator-source--${variant}`;
  const icon = summary.platform === "youtube" ? <Youtube size={18} /> : <Music2 size={18} />;
  const shouldShowPreview = showPreview && variant === "detail" && summary.previewImageUrl !== null;
  const content = (
    <>
      {shouldShowPreview ? (
        <span className="creator-source__preview">
          <img src={summary.previewImageUrl} alt={`${summary.name} 영상 미리보기`} loading="lazy" />
          <span className="creator-source__play" aria-hidden="true">
            <Play size={18} fill="currentColor" />
          </span>
        </span>
      ) : (
        <span className="creator-source__mark" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="creator-source__copy">
        <small>{summary.eyebrow}</small>
        <strong>{summary.name}</strong>
        {variant === "detail" ? (
          <span>{summary.creatorName ?? "영상 미리보기"}</span>
        ) : null}
      </span>
      {summary.url !== null ? (
        <span className="creator-source__visit" aria-hidden="true">
          {variant === "detail" ? "원본 영상" : null}
          <ExternalLink size={15} />
        </span>
      ) : (
        <UserRound className="creator-source__visit" size={15} aria-hidden="true" />
      )}
    </>
  );

  if (summary.url === null || variant === "card") {
    return <div className={className}>{content}</div>;
  }

  return (
    <a className={className} href={summary.url} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}
