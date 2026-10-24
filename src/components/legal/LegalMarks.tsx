import type { ReactNode } from "react";
import { LEGAL_LAUNCH_CLAUSES } from "../../lib/legalPublication";

/** 〔출시 때〕 문구. 그 기능이 아직 운영에 없으므로 공개 스위치와 함께만 보인다. */
export function LaunchOnly({ children }: { readonly children: ReactNode }): JSX.Element | null {
  return LEGAL_LAUNCH_CLAUSES ? <>{children}</> : null;
}

/**
 * 법인명·연락처·계약·지역처럼 계정 화면이나 계약서로만 정할 수 있는 자리.
 * 이 표시가 소스에 남아 있으면 공개 빌드가 멈춘다.
 */
export function Pending({ children }: { readonly children: ReactNode }): JSX.Element {
  return <span className="legal-pending">[확인 필요: {children}]</span>;
}
