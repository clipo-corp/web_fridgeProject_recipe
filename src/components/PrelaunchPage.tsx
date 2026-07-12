import { Clock3 } from "lucide-react";
import { AppLogo } from "./AppLogo";

export function PrelaunchPage(): JSX.Element {
  return (
    <main className="prelaunch-page" aria-labelledby="prelaunch-title">
      <section className="prelaunch-panel">
        <div className="prelaunch-brand" aria-label="Keep Cook by Palmeir Lab">
          <span className="prelaunch-mark">
            <AppLogo size={40} />
          </span>
          <span className="prelaunch-brand__copy">
            <strong>Keep Cook</strong>
            <small>by Palmeir Lab</small>
          </span>
        </div>
        <p className="prelaunch-status">
          <Clock3 size={16} aria-hidden="true" />
          서비스 준비 중
        </p>
        <h1 id="prelaunch-title">Keep Cook 웹사이트를 준비하고 있습니다.</h1>
        <p className="prelaunch-copy">
          Keep Cook은 Palmeir Lab이 만드는 식생활 관리 서비스입니다.
          <br />
          현재 웹 기능은 공개하지 않고 있으며, 곧 새로운 모습으로 찾아뵙겠습니다.
        </p>
        <footer className="prelaunch-footer">Palmeir Lab | Keep Cook Service</footer>
      </section>
    </main>
  );
}
