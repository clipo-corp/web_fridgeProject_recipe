import { Search } from "lucide-react";
import type { SearchSuggestion } from "../lib/recipeSearchSuggestions";

type HomeQuickChipsProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly suggestions: readonly SearchSuggestion[];
  readonly onSuggestionSelect: (suggestion: SearchSuggestion) => void;
};

export function HomeQuickChips({
  eyebrow,
  title,
  suggestions,
  onSuggestionSelect,
}: HomeQuickChipsProps): JSX.Element | null {
  const visibleSuggestions = suggestions.slice(0, 10);

  if (visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <section className="home-chip-section" aria-labelledby="home-chip-section-title">
      <div className="home-chip-section__head">
        <span className="eyebrow">{eyebrow}</span>
        <h2 id="home-chip-section-title">{title}</h2>
      </div>
      <div className="home-chip-row">
        {visibleSuggestions.map((suggestion) => (
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
