import type { Plugin } from "vite";

// `[확인 필요: …]`·`〔확인필요〕` 등 표기와 상관없이 잡는다.
const pendingMarker = /확인\s*필요/;

function decodeUnicodeEscapes(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
}

/**
 * 처리방침·약관 공개 안전장치. 소스가 아니라 빌드 결과물을 검사한다.
 * - 결과물(모든 chunk·asset)에 `확인 필요` 가 남아 있으면 빌드를 멈춘다. 스위치가 꺼져 있으면
 *   문구가 번들에 들어가지 않으므로, 이 검사는 실제로 내보낼 것에만 걸린다.
 * - 약관만 공개하고 처리방침은 닫은 빌드를 멈춘다(약관 제A8조 ③ 이 처리방침을 가리킨다).
 * env 는 Vite 가 실제로 읽은 값(`config.env`, root/envDir 기준)을 쓴다.
 */
export function legalPublishGuard(): Plugin {
  let env: Record<string, unknown> = {};

  return {
    name: "legal-publish-guard",
    apply: "build",
    configResolved(config) {
      env = config.env;
    },
    buildStart() {
      if (env["VITE_LEGAL_TERMS_PUBLIC"] === "true" && env["VITE_LEGAL_PRIVACY_PUBLIC"] !== "true") {
        this.error(
          "VITE_LEGAL_TERMS_PUBLIC=true requires VITE_LEGAL_PRIVACY_PUBLIC=true (terms refer to the privacy policy)",
        );
      }
    },
    generateBundle(_options, bundle) {
      const offending = Object.values(bundle)
        .filter((output) => {
          const text =
            output.type === "chunk"
              ? output.code
              : typeof output.source === "string"
                ? output.source
                : new TextDecoder().decode(output.source);
          return pendingMarker.test(decodeUnicodeEscapes(text));
        })
        .map((output) => output.fileName);

      if (offending.length > 0) {
        this.error(`[확인 필요] is still in the build output: ${offending.join(", ")}`);
      }
    },
  };
}
