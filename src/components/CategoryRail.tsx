import { useI18n } from "../lib/i18n";

type CategoryRailProps = {
  readonly categories: readonly string[];
  readonly selectedCategory: string;
  readonly onSelectCategory: (category: string) => void;
};

export function CategoryRail({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryRailProps): JSX.Element {
  const { t, labelFor } = useI18n();

  return (
    <nav className="category-rail" aria-label={t("rail.aria")}>
      <div className="category-rail__track">
        <button
          className={`chip ${selectedCategory === "all" ? "chip--active" : ""}`}
          type="button"
          onClick={() => onSelectCategory("all")}
        >
          {t("rail.all")}
        </button>
        {categories.map((category) => (
          <button
            className={`chip ${selectedCategory === category ? "chip--active" : ""}`}
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
          >
            {labelFor(category)}
          </button>
        ))}
      </div>
    </nav>
  );
}
