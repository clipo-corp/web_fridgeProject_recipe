import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "../lib/i18n";
import type { RecipeSearchScope } from "../lib/recipeCatalogTypes";

type SearchScopeSelectProps = {
  readonly value: RecipeSearchScope;
  readonly className?: string;
  readonly onChange: (value: RecipeSearchScope) => void;
  readonly onActiveChange?: (active: boolean) => void;
};

export function SearchScopeSelect({
  value,
  className,
  onChange,
  onActiveChange,
}: SearchScopeSelectProps): JSX.Element {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootClassName = className === undefined ? "search-scope" : `search-scope ${className}`;
  const options: readonly { value: RecipeSearchScope; label: string }[] = [
    { value: "all", label: t("hero.searchScopeAll") },
    { value: "recipe", label: t("hero.searchScopeRecipe") },
    { value: "ingredient", label: t("hero.searchScopeIngredient") },
  ];
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? t("hero.searchScopeAll");

  return (
    <div
      className={open ? `${rootClassName} search-scope--open` : rootClassName}
      onFocusCapture={() => onActiveChange?.(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          onActiveChange?.(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      }}
    >
      <span className="sr-only">{t("hero.searchScopeLabel")}</span>
      <button
        type="button"
        className="search-scope__button"
        aria-label={t("hero.searchScopeLabel")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          onActiveChange?.(true);
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <div className="search-scope__menu" role="listbox" aria-label={t("hero.searchScopeLabel")}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              option.value === value
                ? "search-scope__option search-scope__option--selected"
                : "search-scope__option"
            }
            role="option"
            aria-selected={option.value === value}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
              onActiveChange?.(true);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
