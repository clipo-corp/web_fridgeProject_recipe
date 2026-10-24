/**
 * 처리방침(/privacy)·이용약관(/terms) 공개 스위치. 둘 다 기본 꺼짐이고 따로 켠다
 * (스토어 심사 때문에 처리방침만 먼저 열 수 있다).
 *
 * 꺼져 있으면 그 경로는 지금처럼 '준비 중' 화면이고, 둘 다 꺼져 있으면 새 문구는 번들에도
 * 들어가지 않는다. 켜는 방법: Netlify 빌드 환경변수 `VITE_LEGAL_PRIVACY_PUBLIC=true`,
 * `VITE_LEGAL_TERMS_PUBLIC=true`. 결과물에 `[확인 필요: …]` 가 남아 있거나 약관만 켜면
 * 빌드가 멈춘다(tools/legalPublishGuard.ts).
 */
export const LEGAL_PRIVACY_PUBLIC = import.meta.env.VITE_LEGAL_PRIVACY_PUBLIC === "true";
export const LEGAL_TERMS_PUBLIC = import.meta.env.VITE_LEGAL_TERMS_PUBLIC === "true";
export const LEGAL_PAGES_PUBLIC = LEGAL_PRIVACY_PUBLIC || LEGAL_TERMS_PUBLIC;

/**
 * 〔출시 때〕 조항(AI 대화·음성 명령·요청 판정·재료 이름 판정). 공개 스위치와 함께 켜진다.
 * 공개를 그 기능들의 운영 반영보다 먼저 해야 할 때만 `VITE_LEGAL_LAUNCH_CLAUSES=false` 로 따로 끈다.
 */
export const LEGAL_LAUNCH_CLAUSES =
  LEGAL_PAGES_PUBLIC && import.meta.env.VITE_LEGAL_LAUNCH_CLAUSES !== "false";

/**
 * AI 이용 제한 짝: 약관 AI 기능 장(제A1~A8조)과 처리방침의 이용 제한 줄(제2조·제3조 덧붙임,
 * 제7조의5)은 서로를 가리키므로 늘 함께 켜지고 꺼진다. 약관이 공개되고 출시 조항이 켜졌을 때만이다.
 */
export const LEGAL_AI_SANCTION_CLAUSES = LEGAL_LAUNCH_CLAUSES && LEGAL_TERMS_PUBLIC;

/**
 * 문구 정본은 한국어다. 앱 언어 중 아래는 사람 검수를 거친 번역이 없어 번역 필요 상태다.
 * 자동 번역을 정본처럼 넣지 않는다. 약관을 7개 언어로 낼지는 아직 결정 전이다(설계 9A-4 7번).
 */
export const LEGAL_TRANSLATION_NEEDED = ["en", "ja", "fr", "zh-HK", "th", "it"] as const;
