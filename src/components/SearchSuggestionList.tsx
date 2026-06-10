import { Clock3, Sparkles } from "lucide-react";
import type { SearchSuggestion } from "../lib/recipeSearchSuggestions";

type SearchSuggestionListProps = {
  readonly label: string;
  readonly suggestions: readonly SearchSuggestion[];
  readonly onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  readonly className?: string;
};

export function SearchSuggestionList({
  label,
  suggestions,
  onSuggestionSelect,
  className,
}: SearchSuggestionListProps): JSX.Element | null {
  if (suggestions.length === 0) {
    return null;
  }

  const rootClassName =
    className === undefined ? "search-suggestions" : `search-suggestions ${className}`;

  return (
    <div className={rootClassName} role="listbox" aria-label={label}>
      <span className="search-suggestions__eyebrow">
        <Sparkles size={14} aria-hidden="true" />
        {label}
      </span>
      {suggestions.slice(0, 7).map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          className="search-suggestion"
          role="option"
          aria-selected="false"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSuggestionSelect(suggestion)}
        >
          <Clock3 size={16} aria-hidden="true" />
          <span>{suggestion.label}</span>
          <small>{suggestion.note}</small>
        </button>
      ))}
    </div>
  );
}
