import { labelFor } from "../lib/recipeLabels";

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
  return (
    <nav className="category-rail" aria-label="레시피 카테고리">
      <button
        className={selectedCategory === "all" ? "is-active" : ""}
        type="button"
        onClick={() => onSelectCategory("all")}
      >
        전체
      </button>
      {categories.slice(0, 12).map((category) => (
        <button
          className={selectedCategory === category ? "is-active" : ""}
          key={category}
          type="button"
          onClick={() => onSelectCategory(category)}
        >
          {labelFor(category)}
        </button>
      ))}
    </nav>
  );
}
