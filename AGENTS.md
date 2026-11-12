# web_fridgeProject_recipe — Agent Instructions

> **설계 맥락 먼저 (레시피·재료·영양·인분·알레르기·안전·챗봇 답 작업 전 필수)**: 워크스페이스 `.coordinator/README-DESIGN-CONTEXT.md`와 `.coordinator/DECISIONS-INDEX.md`를 읽는다(정한 것 + 버린 대안). core는 origin tip만 읽는다: `git -C core_data_master_db show origin/core/integration-1110:<path>`(먼저 fetch). 조사 보고서는 `.coordinator/REPORT-HEADER-TEMPLATE.md` 머리말을 붙인다.

**Keep Cook** web client (org `clipo-corp`). Vite · React · TypeScript. Deployed to
Netlify.

## First steps

- Run `git status --short --branch` before editing.
- Never stage or commit `.env`.
- Keep changes scoped to the request; leave unrelated dirty files alone.

## Build and run

```bash
npm install
npm run dev       # vite --host 0.0.0.0
npm run build     # tsc --noEmit && vite build
npm test          # vitest run
```

`npm run build` type-checks before bundling — a type error fails the build, so run it
before opening a PR.

## Deploy

Netlify builds `npm run build` and publishes `dist/`. `netlify.toml` sets an SPA redirect
(all paths → `index.html`) and sends `X-Robots-Tag: noindex, nofollow, noarchive` on every
response. **The site is intentionally unindexed** — do not remove that header without an
explicit product decision.

## Where this sits

Consumes the `fridgeServerMain` API (deployed on Render). `core_data_master_db` is the
upstream source of recipe and ingredient data. `smart-fridge-native` is the mobile client
and shares the same server contract — when a server field changes, check whether both
clients need updating.

## Design

`DESIGN.md` is the design system for this repo: color tokens, surfaces, brand green
(`--primary: #00cd80`), light and dark values. Read it before any UI, styling, or
redesign task. CSS custom properties in `src/styles/` are the source of truth; rendered
references and screenshots are not.

## Conventions

- **Branches:** `<handle>/<kebab-topic>` — e.g. `hyunwu/recipe-card-density`. No
  multi-commit work directly on `main`.
- **Commits:** Conventional Commits with a domain scope — `feat(recipe):`, `docs(recipe):`.
  English, imperative, no trailing period.
- **Pull requests:** see `.github/PULL_REQUEST_TEMPLATE.md`.
