import { Search } from "lucide-react";
import type { SearchSuggestion } from "../lib/recipeSearchSuggestions";

type HomeQuickChipsProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly suggestions: readonly SearchSuggestion[];
  readonly onSuggestionSelect: (suggestion: SearchSuggestion) => void;
};

const skeletonChipWidths = [80, 64, 96, 72, 88, 60, 104, 76];

export function HomeQuickChips({
  eyebrow,
  title,
  suggestions,
  onSuggestionSelect,
}: HomeQuickChipsProps): JSX.Element {
  const visibleSuggestions = suggestions.slice(0, 10);
  const isLoading = visibleSuggestions.length === 0;

  return (
    <section className="home-chip-section" aria-label={title}>
      {isLoading ? (
        <div className="skeleton-section-head" aria-hidden="true">
          <span className="skeleton-eyebrow skeleton-shimmer" />
          <span className="skeleton-heading skeleton-shimmer" />
        </div>
      ) : (
        <div className="home-chip-section__head">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      )}

      <div className="home-chip-row" aria-busy={isLoading}>
        {isLoading
          ? skeletonChipWidths.map((w, i) => (
              <span
                key={i}
                className="skeleton-chip skeleton-shimmer"
                aria-hidden="true"
                style={{ width: w }}
              />
            ))
          : visibleSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="home-chip"
                onClick={() => onSuggestionSelect(suggestion)}
              >
                <Search size={14} aria-hidden="true" />
                <span>{suggestion.label}</span>
              </button>
            ))}
      </div>
    </section>
  );
}
