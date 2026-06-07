import { Languages, Leaf, Moon, Smartphone, Sun } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useTheme } from "../lib/theme";

export function SiteHeader(): JSX.Element {
  const { t, lang, toggleLang } = useI18n();
  const { resolved, toggle } = useTheme();
  const dark = resolved === "dark";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="/recipe-catalog">
          <span className="brand__mark">
            <Leaf size={20} aria-hidden="true" />
          </span>
          <span className="brand__text">
            FreshKeeper
            <small>{t("header.tag")}</small>
          </span>
        </a>
        <div className="site-header__controls">
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
          <a className="header-cta" href="#app-download">
            <Smartphone size={18} aria-hidden="true" />
            <span>{t("header.install")}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
