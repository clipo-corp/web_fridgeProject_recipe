import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Languages, Leaf, Moon, Smartphone, Sun } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useTheme } from "../lib/theme";

type SiteHeaderProps = {
  readonly cuisineRegionOptions: readonly string[];
  readonly selectedCuisineRegion: string;
  readonly onCuisineRegionChange: (cuisineRegion: string) => void;
};

export function SiteHeader({
  cuisineRegionOptions,
  selectedCuisineRegion,
  onCuisineRegionChange,
}: SiteHeaderProps): JSX.Element {
  const { t, lang, toggleLang, labelFor } = useI18n();
  const { resolved, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const cuisineMenuRef = useRef<HTMLDivElement | null>(null);
  const dark = resolved === "dark";
  const cuisineOptions = useMemo(
    () => ["all", ...cuisineRegionOptions.filter((option) => option !== "all")],
    [cuisineRegionOptions],
  );
  const selectedCuisineLabel =
    selectedCuisineRegion === "all" ? t("filters.all") : labelFor(selectedCuisineRegion);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent): void => {
      if (
        cuisineMenuRef.current !== null &&
        event.target instanceof Node &&
        !cuisineMenuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const selectCuisineRegion = (cuisineRegion: string): void => {
    onCuisineRegionChange(cuisineRegion);
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="/recipe-catalog">
          <span className="brand__mark">
            <Leaf size={20} aria-hidden="true" />
          </span>
          <span className="brand__text">
            Keep Cook
            <small>{t("header.tag")}</small>
          </span>
        </a>
        <div className="site-header__controls">
          <div className="header-cuisine" ref={cuisineMenuRef}>
            <button
              type="button"
              className="header-cuisine__button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              aria-label={t("filters.cuisineRegion")}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="header-cuisine__icon">
                <Globe2 size={16} aria-hidden="true" />
              </span>
              <span className="header-cuisine__label">{selectedCuisineLabel}</span>
              <ChevronDown
                className={menuOpen ? "header-cuisine__chevron header-cuisine__chevron--open" : "header-cuisine__chevron"}
                size={15}
                aria-hidden="true"
              />
            </button>
            {menuOpen ? (
              <div className="header-cuisine__menu" role="listbox" aria-label={t("filters.cuisineRegion")}>
                {cuisineOptions.map((option) => {
                  const selected = option === selectedCuisineRegion;
                  const optionLabel = option === "all" ? t("filters.all") : labelFor(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      className={selected ? "header-cuisine__option header-cuisine__option--selected" : "header-cuisine__option"}
                      role="option"
                      aria-selected={selected}
                      onClick={() => selectCuisineRegion(option)}
                    >
                      <span>{optionLabel}</span>
                      {selected ? <Check size={15} aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="header-toggle"
            onClick={toggleLang}
            aria-label={t("header.langAria")}
          >
            <Languages size={16} aria-hidden="true" />
            <span>{lang === "ko" ? "EN" : "KO"}</span>
          </button>
          <button
            type="button"
            className="header-toggle header-toggle--icon"
            onClick={toggle}
            aria-label={dark ? t("header.themeToLight") : t("header.themeToDark")}
          >
            {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
          <a className="header-cta" href="/install">
            <Smartphone size={18} aria-hidden="true" />
            <span>{t("header.install")}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
