import type { ReactNode } from "react";

/**
 * 법인명·연락처·계약·지역처럼 계정 화면이나 계약서로만 정할 수 있는 자리.
 * 이 표시가 빌드 결과물에 남아 있으면 빌드가 멈춘다(tools/legalPublishGuard.ts).
 */
export function Pending({ children }: { readonly children: ReactNode }): JSX.Element {
  return <span className="legal-pending">[확인 필요: {children}]</span>;
}

/**
 * 법적 판단(민감정보 별도 동의 등)이라 사용자가 정해야 하는 자리. `Pending` 과 같이 결과물에 남아
 * 있으면 빌드가 멈춘다.
 */
export function UserCheck({ children }: { readonly children: ReactNode }): JSX.Element {
  return <span className="legal-pending">[사용자 확인: {children}]</span>;
}
