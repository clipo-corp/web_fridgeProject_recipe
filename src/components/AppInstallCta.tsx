import { Download, Refrigerator, Sparkles } from "lucide-react";

export function AppInstallCta(): JSX.Element {
  return (
    <>
      <aside className="install-card" aria-label="FreshKeeper 앱 설치">
        <div className="install-icon">
          <Refrigerator size={22} aria-hidden="true" />
        </div>
        <div>
          <strong>앱에서 냉장고 재료로 추천받기</strong>
          <p>저장, 재료 관리, 맞춤 추천은 FreshKeeper 앱에서 이어집니다.</p>
        </div>
        <a className="install-button" href="#app-download">
          <Download size={18} aria-hidden="true" />
          앱 설치
        </a>
      </aside>
      <a className="mobile-install" href="#app-download">
        <Sparkles size={18} aria-hidden="true" />
        앱에서 저장하고 추천받기
      </a>
    </>
  );
}
