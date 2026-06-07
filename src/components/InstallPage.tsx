import { CheckCircle2, Download, Refrigerator, Sparkles, Smartphone } from "lucide-react";
import { MobileInstallCta } from "./AppInstallCta";
import { useI18n } from "../lib/i18n";

export function InstallPage(): JSX.Element {
  const { t } = useI18n();

  return (
    <>
      <main className="install-page">
        <section className="install-hero" id="app-download">
          <div className="install-hero__copy">
            <span className="brand-badge">{t("installPage.badge")}</span>
            <h1>{t("installPage.title")}</h1>
            <p>{t("installPage.body")}</p>
            <div className="install-actions">
              <a className="btn btn--primary" href="https://freshkeeper.app" target="_blank" rel="noreferrer">
                <Download size={18} aria-hidden="true" />
                {t("installPage.primary")}
              </a>
              <a className="btn btn--ghost" href="/recipe-catalog">
                {t("installPage.secondary")}
              </a>
            </div>
          </div>
          <div className="install-phone" aria-hidden="true">
            <div className="install-phone__bar" />
            <div className="install-phone__screen">
              <Sparkles size={22} />
              <strong>{t("installPage.phoneTitle")}</strong>
              <span>{t("installPage.phoneBody")}</span>
            </div>
          </div>
        </section>

        <section className="install-feature-grid" aria-label={t("installPage.features")}>
          <Feature icon={<Refrigerator size={20} />} title={t("installPage.feature1")} />
          <Feature icon={<CheckCircle2 size={20} />} title={t("installPage.feature2")} />
          <Feature icon={<Smartphone size={20} />} title={t("installPage.feature3")} />
        </section>
      </main>
      <MobileInstallCta />
    </>
  );
}

type FeatureProps = {
  readonly icon: JSX.Element;
  readonly title: string;
};

function Feature({ icon, title }: FeatureProps): JSX.Element {
  return (
    <div className="install-feature">
      {icon}
      <strong>{title}</strong>
    </div>
  );
}
