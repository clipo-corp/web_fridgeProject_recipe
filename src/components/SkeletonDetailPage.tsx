import { ArrowLeft } from "lucide-react";
import { useI18n } from "../lib/i18n";

export function SkeletonDetailPage(): JSX.Element {
  const { t } = useI18n();

  return (
    <main className="page detail-page" aria-busy="true">
      <a className="btn btn--ghost detail-page__back" href="/recipe-catalog">
        <ArrowLeft size={17} aria-hidden="true" />
        {t("detail.back")}
      </a>

      <section className="detail-media-card" aria-hidden="true">
        <div
          className="skeleton-shimmer"
          style={{ width: "100%", aspectRatio: "16 / 10", minHeight: 300, borderRadius: "var(--radius-lg)" }}
        />
      </section>

      <div className="detail-page__summary" aria-hidden="true">
        <span className="skeleton-shimmer" style={{ display: "block", width: 128, height: 28, borderRadius: 9999 }} />

        <div style={{ display: "grid", gap: 10, margin: "16px 0 10px" }}>
          <span className="skeleton-line skeleton-shimmer" style={{ width: "70%", height: 36 }} />
          <span className="skeleton-line skeleton-shimmer" style={{ width: "46%", height: 36 }} />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <span className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: 14 }} />
          <span className="skeleton-line skeleton-shimmer" style={{ width: "88%", height: 14 }} />
          <span className="skeleton-line skeleton-shimmer" style={{ width: "60%", height: 14 }} />
        </div>

        <div className="detail-meta">
          {[72, 56, 44, 88, 68, 96].map((w, i) => (
            <span key={i} className="skeleton-shimmer" style={{ display: "inline-block", width: w, height: 20, borderRadius: 9999 }} />
          ))}
        </div>

        <div className="detail-chips">
          {[60, 72, 52, 80].map((w, i) => (
            <span key={i} className="skeleton-shimmer" style={{ display: "inline-block", width: w, height: 26, borderRadius: 9999 }} />
          ))}
        </div>

        <div className="skeleton-shimmer" style={{ height: 52, borderRadius: "var(--radius-sm)", marginTop: 12 }} />
      </div>

      <section className="detail-card" aria-hidden="true">
        <span className="skeleton-line skeleton-shimmer" style={{ display: "block", width: 80, height: 20, marginBottom: 16 }} />
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <span className="skeleton-shimmer" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: "var(--radius-sm)" }} />
              <div style={{ flex: 1, display: "grid", gap: 5 }}>
                <span className="skeleton-line skeleton-shimmer" style={{ width: `${55 + (i % 3) * 15}%`, height: 13 }} />
                <span className="skeleton-line skeleton-shimmer" style={{ width: `${35 + (i % 4) * 10}%`, height: 11, opacity: 0.65 }} />
              </div>
              <span className="skeleton-line skeleton-shimmer" style={{ flexShrink: 0, width: 46, height: 13 }} />
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-card" aria-hidden="true">
        <span className="skeleton-line skeleton-shimmer" style={{ display: "block", width: 72, height: 20, marginBottom: 16 }} />
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 0 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
              <span className="skeleton-shimmer" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 9999 }} />
              <div style={{ flex: 1, display: "grid", gap: 7, paddingTop: 4 }}>
                <span className="skeleton-line skeleton-shimmer" style={{ width: `${88 - i * 6}%`, height: 14 }} />
                <span className="skeleton-line skeleton-shimmer" style={{ width: `${68 - i * 5}%`, height: 14 }} />
                {i % 2 === 0 && <span className="skeleton-line skeleton-shimmer" style={{ width: "45%", height: 12, opacity: 0.6 }} />}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
