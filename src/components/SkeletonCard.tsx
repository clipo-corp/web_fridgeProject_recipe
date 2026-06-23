type SkeletonCardProps = {
  readonly variant?: "grid" | "spotlight";
};

export function SkeletonCard({ variant = "grid" }: SkeletonCardProps): JSX.Element {
  return (
    <article
      className={`skeleton-card skeleton-card--${variant}`}
      aria-hidden="true"
      aria-label="레시피 불러오는 중"
    >
      <div className="skeleton-card__visual skeleton-shimmer" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__badges">
          <span className="skeleton-line skeleton-line--badge skeleton-shimmer" />
          <span className="skeleton-line skeleton-line--badge skeleton-shimmer" style={{ width: 44 }} />
        </div>
        <span className="skeleton-line skeleton-line--title skeleton-shimmer" />
        <span className="skeleton-line skeleton-line--desc skeleton-shimmer" />
        <span className="skeleton-line skeleton-line--desc skeleton-shimmer" style={{ width: "68%" }} />
        <div className="skeleton-card__meta">
          <span className="skeleton-line skeleton-line--meta skeleton-shimmer" />
          <span className="skeleton-line skeleton-line--meta skeleton-shimmer" />
          <span className="skeleton-line skeleton-line--meta skeleton-shimmer" />
        </div>
      </div>
    </article>
  );
}
