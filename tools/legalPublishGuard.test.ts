import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { build } from "vite";
import { legalPublishGuard } from "./legalPublishGuard";

const legalMarks = resolve(__dirname, "../src/components/legal/LegalMarks.tsx");
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

// cwd 와 다른 임시 root 에 작은 프로젝트를 만들어 실제 vite build 를 돌린다.
async function buildFixture(files: Record<string, string>): Promise<void> {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "legal-guard-")));
  roots.push(root);
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, name)), { recursive: true });
    writeFileSync(join(root, name), content);
  }
  const html = "index.html" in files;
  await build({
    root,
    configFile: false,
    logLevel: "silent",
    plugins: [legalPublishGuard()],
    build: {
      write: false,
      ...(html ? {} : { rollupOptions: { input: join(root, "main.ts") } }),
    },
  });
}

const pendingFailure = /\[확인 필요\] is still in the build output/;

describe("legalPublishGuard", () => {
  it("passes a build without pending markers", async () => {
    await expect(buildFixture({ "main.ts": 'console.log("개인정보처리방침");' })).resolves.toBeUndefined();
  });

  it("fails when Pending is imported under another name", async () => {
    await expect(
      buildFixture({
        "main.ts": `import { Pending as Hold } from ${JSON.stringify(legalMarks)};\nconsole.log(Hold({ children: "계약 법인명" }));`,
      }),
    ).rejects.toThrow(pendingFailure);
  });

  it("fails when the marker is written as plain text in any notation", async () => {
    await expect(buildFixture({ "main.ts": 'console.log("[확인 필요: 연락처]");' })).rejects.toThrow(
      pendingFailure,
    );
    await expect(buildFixture({ "main.ts": 'console.log("〔확인필요〕");' })).rejects.toThrow(
      pendingFailure,
    );
  });

  it("fails when the marker is spaced with nbsp or split into JSX pieces", async () => {
    await expect(buildFixture({ "main.ts": 'console.log("[확인\\u00a0필요: 지역]");' })).rejects.toThrow(
      pendingFailure,
    );
    await expect(buildFixture({ "main.ts": 'console.log(["확인", " ", "필요"]);' })).rejects.toThrow(
      pendingFailure,
    );
    await expect(
      buildFixture({ "main.ts": 'console.log(["확인", `\\u00a0`, "필요"].join(""));' }),
    ).rejects.toThrow(pendingFailure);
  });

  it("fails when the marker is in index.html or public/", async () => {
    const main = 'console.log("ok");';
    await expect(
      buildFixture({
        "index.html": '<!doctype html><p>[확인&nbsp;필요: 시행일]</p><script type="module" src="./main.ts"></script>',
        "main.ts": main,
      }),
    ).rejects.toThrow(pendingFailure);
    await expect(
      buildFixture({ "public/robots.txt": "# 확인 필요\n", "main.ts": main }),
    ).rejects.toThrow(pendingFailure);
    await expect(
      buildFixture({
        "index.html": '<!doctype html><p>ok</p><script type="module" src="./main.ts"></script>',
        "public/robots.txt": "User-agent: *\n",
        "main.ts": main,
      }),
    ).resolves.toBeUndefined();
  });

  it("fails when the marker lives in a separate file", async () => {
    await expect(
      buildFixture({
        "clause.ts": `import { Pending } from ${JSON.stringify(legalMarks)};\nexport const clause = Pending({ children: "보관 기간" });`,
        "main.ts": 'import { clause } from "./clause";\nconsole.log(clause);',
      }),
    ).rejects.toThrow(pendingFailure);
  });

  it("reads the switch from the .env in the project root, not the current directory", async () => {
    const gated = `if (import.meta.env.VITE_LEGAL_PRIVACY_PUBLIC === "true") console.log("[확인 필요: 지역]");`;
    await expect(buildFixture({ "main.ts": gated })).resolves.toBeUndefined();
    await expect(
      buildFixture({ ".env": "VITE_LEGAL_PRIVACY_PUBLIC=true\n", "main.ts": gated }),
    ).rejects.toThrow(pendingFailure);
  });

  it("fails when the terms are public but the privacy policy is not", async () => {
    await expect(
      buildFixture({ ".env": "VITE_LEGAL_TERMS_PUBLIC=true\n", "main.ts": 'console.log("ok");' }),
    ).rejects.toThrow(/requires VITE_LEGAL_PRIVACY_PUBLIC=true/);
    await expect(
      buildFixture({
        ".env": "VITE_LEGAL_TERMS_PUBLIC=true\nVITE_LEGAL_PRIVACY_PUBLIC=true\n",
        "main.ts": 'console.log("ok");',
      }),
    ).resolves.toBeUndefined();
  });
});
