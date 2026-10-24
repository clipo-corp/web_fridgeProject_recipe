import { readFileSync } from "node:fs";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const apiBaseUrl = "https://smart-fridge-server-dbvf.onrender.com";

const legalSourceFiles = ["src/components/PrivacyPolicyPage.tsx", "src/components/TermsPage.tsx"];

// 처리방침·약관 공개 스위치를 켠 빌드에 `[확인 필요: …]`(<Pending>)가 남아 있으면 멈춘다.
function legalPublishGuard(mode: string): Plugin {
  return {
    name: "legal-publish-guard",
    apply: "build",
    buildStart() {
      const env = loadEnv(mode, process.cwd(), "VITE_");
      if (env["VITE_LEGAL_PAGES_PUBLIC"] !== "true") {
        return;
      }
      const unresolved = legalSourceFiles.filter((file) =>
        readFileSync(file, "utf8").includes("<Pending"),
      );
      if (unresolved.length > 0) {
        this.error(
          `VITE_LEGAL_PAGES_PUBLIC=true but [확인 필요] is still in: ${unresolved.join(", ")}`,
        );
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), legalPublishGuard(mode)],
  server: {
    port: 8091,
    proxy: {
      "/api": {
        target: apiBaseUrl,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Origin", apiBaseUrl);
          });
        },
      },
    },
  },
}));
