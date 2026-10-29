import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

// `[확인 필요: …]`·`〔확인필요〕`·nbsp 로 띄운 것·JSX 조각으로 나뉜 `확인{" "}필요` 까지 잡는다.
// 법적 판단을 남긴 `[사용자 확인: …]`(UserCheck)도 같이 잡는다.
// 조각은 결과물에서 `"확인"," ","필요"` 처럼 따옴표·쉼표로 이어지므로 그것도 공백처럼 본다.
const pendingMarker = /확인[\s"'`,+]*필요|사용자[\s"'`,+]*확인/u;

function normalize(text: string): string {
  return text
    .replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})/g, (_, braced, u4, x2) =>
      String.fromCodePoint(Number.parseInt((braced ?? u4 ?? x2) as string, 16)),
    )
    .replace(/&nbsp;|&#160;|&#x0*a0;/gi, " ");
}

function hasPendingMarker(text: string): boolean {
  return pendingMarker.test(normalize(text));
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

/**
 * 처리방침·약관 공개 안전장치. 소스가 아니라 실제로 내보내는 것을 검사한다.
 * - 결과물(모든 chunk·asset, index.html)과 그대로 복사되는 public/ 에 `확인 필요` 가 남아
 *   있으면 빌드를 멈춘다. 스위치가 꺼져 있으면 문구가 번들에 들어가지 않으므로, 이 검사는
 *   실제로 내보낼 것에만 걸린다.
 * - 약관만 공개하고 처리방침은 닫은 빌드를 멈춘다(약관 제A8조 ③ 이 처리방침을 가리킨다).
 * env·경로는 Vite 가 실제로 쓰는 값(`config.env`, `config.publicDir`)을 쓴다.
 */
export function legalPublishGuard(): Plugin {
  let config: ResolvedConfig | undefined;

  return {
    name: "legal-publish-guard",
    apply: "build",
    // index.html 이 결과물에 들어간 뒤에 검사하도록 맨 뒤에서 돈다.
    enforce: "post",
    configResolved(resolved) {
      config = resolved;
    },
    buildStart() {
      const env = config?.env ?? {};
      if (env["VITE_LEGAL_TERMS_PUBLIC"] === "true" && env["VITE_LEGAL_PRIVACY_PUBLIC"] !== "true") {
        this.error(
          "VITE_LEGAL_TERMS_PUBLIC=true requires VITE_LEGAL_PRIVACY_PUBLIC=true (terms refer to the privacy policy)",
        );
      }
    },
    generateBundle(_options, bundle) {
      const offending = Object.values(bundle)
        .filter((output) =>
          hasPendingMarker(
            output.type === "chunk"
              ? output.code
              : typeof output.source === "string"
                ? output.source
                : new TextDecoder().decode(output.source),
          ),
        )
        .map((output) => output.fileName);

      const publicDir = config?.publicDir;
      if (config?.build.copyPublicDir !== false && publicDir && existsSync(publicDir)) {
        for (const file of filesUnder(publicDir)) {
          if (hasPendingMarker(readFileSync(file).toString("utf8"))) {
            offending.push(`public/${relative(publicDir, file)}`);
          }
        }
      }

      if (offending.length > 0) {
        this.error(`[확인 필요] is still in the build output: ${offending.join(", ")}`);
      }
    },
  };
}
