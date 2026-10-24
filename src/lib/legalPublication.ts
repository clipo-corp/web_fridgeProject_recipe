/**
 * 처리방침(/privacy)·이용약관(/terms) 공개 스위치. 기본 꺼짐.
 *
 * 꺼져 있으면 모든 경로가 지금처럼 '준비 중' 화면이고, 새 문구는 번들에도 들어가지 않는다.
 * 켜는 방법: Netlify 빌드 환경변수 `VITE_LEGAL_PAGES_PUBLIC=true`. 남은 `[확인 필요: …]` 가
 * 하나라도 있으면 빌드가 멈춘다(vite.config.ts `legalPublishGuard`).
 */
export const LEGAL_PAGES_PUBLIC = import.meta.env.VITE_LEGAL_PAGES_PUBLIC === "true";

/**
 * 〔출시 때〕 조항(AI 대화·음성 명령·요청 판정·재료 이름 판정·이용 제한 기록). 공개 스위치와 함께 켜진다.
 * 공개를 그 기능들의 운영 반영보다 먼저 해야 할 때만 `VITE_LEGAL_LAUNCH_CLAUSES=false` 로 따로 끈다.
 */
export const LEGAL_LAUNCH_CLAUSES =
  LEGAL_PAGES_PUBLIC && import.meta.env.VITE_LEGAL_LAUNCH_CLAUSES !== "false";

/**
 * 문구 정본은 한국어다. 앱 언어 중 아래는 사람 검수를 거친 번역이 없어 번역 필요 상태다.
 * 자동 번역을 정본처럼 넣지 않는다. 약관을 7개 언어로 낼지는 아직 결정 전이다(설계 9A-4 7번).
 */
export const LEGAL_TRANSLATION_NEEDED = ["en", "ja", "fr", "zh-HK", "th", "it"] as const;
