import { Download, Refrigerator, Sparkles } from "lucide-react";
import { useI18n } from "../lib/i18n";

export function InstallBand(): JSX.Element {
  const { t } = useI18n();

  return (
    <section className="install-band" id="app-download" aria-label={t("installBand.title")}>
      <div className="install-band__icon">
        <Refrigerator size={26} aria-hidden="true" />
      </div>
      <div className="install-band__copy">
        <strong>{t("installBand.title")}</strong>
        <p>{t("installBand.body")}</p>
      </div>
      <a className="btn btn--primary install-band__cta" href="/install">
        <Download size={18} aria-hidden="true" />
        {t("installBand.cta")}
      </a>
    </section>
  );
}

export function MobileInstallCta(): JSX.Element {
  const { t } = useI18n();

  return (
    <a className="mobile-install" href="/install">
      <Sparkles size={18} aria-hidden="true" />
      {t("mobileCta")}
    </a>
  );
}
