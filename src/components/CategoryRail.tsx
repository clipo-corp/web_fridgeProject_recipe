import { useRef } from "react";
import {
  CakeSlice,
  ChevronLeft,
  ChevronRight,
  Cookie,
  Croissant,
  CupSoda,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
  Wheat,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "../lib/i18n";

type CategoryRailProps = {
  readonly categories: readonly string[];
  readonly selectedCategory: string;
  readonly variant?: "sticky" | "inline";
  readonly onSelectCategory: (category: string) => void;
};

export function CategoryRail({
  categories,
  selectedCategory,
  variant = "sticky",
  onSelectCategory,
}: CategoryRailProps): JSX.Element {
  const { t, labelFor } = useI18n();
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollCards = (direction: -1 | 1): void => {
    const track = trackRef.current;
    if (track === null) {
      return;
    }

    track.scrollBy({
      left: direction * Math.max(260, track.clientWidth * 0.75),
      behavior: "smooth",
    });
  };

  if (variant === "inline") {
    const categoryItems = [
      { value: "all", label: t("rail.all") },
      ...categories.map((category) => ({ value: category, label: labelFor(category) })),
    ];

    return (
      <nav className="category-rail category-rail--inline category-rail--visual" aria-label={t("rail.aria")}>
        <div className="category-rail__shell">
          <button
            className="category-rail__nav"
            type="button"
            aria-label="Scroll categories left"
            onClick={() => scrollCards(-1)}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>

          <div className="category-rail__track category-rail__track--cards" ref={trackRef}>
            {categoryItems.map((category) => {
              const visual = categoryVisualFor(category.value);
              const Icon = visual.Icon;

              return (
                <button
                  className={`category-card ${
                    selectedCategory === category.value ? "category-card--active" : ""
                  }`}
                  key={category.value}
                  type="button"
                  onClick={() => onSelectCategory(category.value)}
                >
                  <span
                    className={`category-card__picture category-card__picture--${visual.kind}`}
                    aria-hidden="true"
                  >
                    <Icon className="category-card__icon" size={42} strokeWidth={2.2} />
                  </span>
                  <span className="category-card__label">{category.label}</span>
                </button>
              );
            })}
          </div>

          <button
            className="category-rail__nav"
            type="button"
            aria-label="Scroll categories right"
            onClick={() => scrollCards(1)}
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      </nav>
    );
  }

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

type CategoryVisual = {
  readonly kind: string;
  readonly Icon: LucideIcon;
};

function categoryVisualFor(category: string): CategoryVisual {
  const normalized = category.toLocaleLowerCase();

  if (normalized === "all") {
    return { kind: "all", Icon: UtensilsCrossed };
  }
  if (normalized.includes("salad")) {
    return { kind: "salad", Icon: Salad };
  }
  if (normalized.includes("soup") || normalized.includes("stew")) {
    return { kind: "soup", Icon: Soup };
  }
  if (normalized.includes("rice") || normalized.includes("porridge")) {
    return { kind: "rice", Icon: Wheat };
  }
  if (normalized.includes("noodle") || normalized.includes("dumpling")) {
    return { kind: "noodle", Icon: Soup };
  }
  if (normalized.includes("cookie") || normalized.includes("snack")) {
    return { kind: "dessert", Icon: Cookie };
  }
  if (normalized.includes("dessert")) {
    return { kind: "dessert", Icon: CakeSlice };
  }
  if (normalized.includes("drink") || normalized.includes("alcohol")) {
    return { kind: "drink", Icon: normalized.includes("alcohol") ? Wine : CupSoda };
  }
  if (normalized.includes("bread")) {
    return { kind: "bread", Icon: Croissant };
  }
  if (normalized.includes("side")) {
    return { kind: "side", Icon: Sandwich };
  }
  if (normalized.includes("kimchi") || normalized.includes("paste")) {
    return { kind: "kimchi", Icon: Soup };
  }
  if (normalized.includes("main") || normalized.includes("dish")) {
    return { kind: "main", Icon: UtensilsCrossed };
  }

  return { kind: "mixed", Icon: UtensilsCrossed };
}
