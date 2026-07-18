# Keep Cook Web Design System

## 1. Atmosphere & Identity

Keep Cook is a calm, practical kitchen companion: clear enough for a quick recipe decision and warm enough to feel at home in a daily routine. Its signature is fresh green used sparingly against soft neutral surfaces, with rounded, tactile controls and compact information hierarchy.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|---|---|---|---|---|
| App surface | `--bg-app` | `#f8f9fa` | `#1a1b21` | Page background |
| Card surface | `--bg-card` | `#ffffff` | `#2a2b33` | Cards and documents |
| Alternate surface | `--bg-card-alt` | `#f1f3f5` | `#23242c` | Secondary panels |
| Primary text | `--text` | `#2a2b33` | `#f8f9fa` | Headlines and body text |
| Secondary text | `--text-secondary` | `#6c757d` | `#ced4da` | Supporting copy |
| Tertiary text | `--text-tertiary` | `#adb5bd` | `#adb5bd` | Labels and muted metadata |
| Border | `--border` | `#dee2e6` | `#34353f` | Surface separation |
| Brand | `--primary` | `#00cd80` | `#00cd80` | Interactive emphasis and focus |
| Brand pressed | `--primary-pressed` | `#00a866` | `#66deb1` | Active controls |
| Brand soft | `--green-50` | `#e6faf2` | `#e6faf2` | Gentle branded backdrop |
| Warning | `--warning` | `#f5a623` | `#f5a623` | Caution status |
| Danger | `--danger` | `#f03e3e` | `#f03e3e` | Destructive status |

### Rules

- Use semantic tokens only; raw values remain defined in `src/styles/base.css`.
- Brand green signals an actionable or reassuring state, never decoration alone.
- The site supports light and dark themes through semantic-token remapping.

## 3. Typography

### Scale

| Level | Size | Weight | Line height | Usage |
|---|---:|---:|---:|---|
| Display | 32px | 800 | 40px | Marketing and primary page heading |
| H1 | 24px | 800 | 32px | Page and section heading |
| H2 | 20px | 800 | 28px | Section heading |
| H3 | 18px | 700 | 26px | Card heading |
| Body | 16px | 400 | 24px | Default copy |
| Small | 14px | 400 | 20px | Supporting copy |
| Caption | 12px | 500 | 18px | Labels and metadata |

### Font Stack

- Primary: `Pretendard Variable`, `Apple SD Gothic Neo`, `Noto Sans KR`, system sans-serif.
- Mono: system monospace only when code is displayed.

## 4. Spacing & Layout

### Base Unit

All spacing is a multiple of 4px: `--space-xs` (4px), `--space-sm` (8px), `--space-md` (12px), `--space-lg` (16px), `--space-xl` (20px), `--space-2xl` (24px), `--space-3xl` (32px), `--space-4xl` (40px), and `--space-5xl` (48px).

### Grid

- Content width: use `min()` with a 16px mobile gutter and 32px desktop gutter. The compact status panel uses `--content-narrow` (480px).
- Responsive breakpoint: 768px is the primary compact-to-wide transition.
- Full-height screens use `min-height: 100dvh`.

## 5. Components

### Branded status panel

- **Structure**: semantic `main` with a compact brand mark, heading, supporting text, and legal link.
- **Spacing**: `--space-md` through `--space-5xl`.
- **States**: static status only; the legal link has hover, active, and `:focus-visible` states.
- **Accessibility**: one `h1`, readable copy, a descriptive link, and visible keyboard focus.
- **Motion**: no decorative animation; reduced motion requires no alternate behavior.

### Site header

- **Structure**: branded home link, language/theme controls, optional app CTA.
- **States**: default, hover, active, focus-visible, and dark theme.
- **Accessibility**: icon controls provide text labels through `aria-label`.

## 6. Motion & Interaction

Use 150ms ease-out for control feedback and 200ms ease-in-out for surface transitions. Animate only opacity, transform, or filter. Respect `prefers-reduced-motion`; nonessential movement is omitted.

## 7. Depth & Surface

The strategy is mixed: soft tonal shifts establish page layers, with `--border` for durable document separation and `--shadow-card` only for elevated interactive cards. Rounded corners use the existing radius scale from 8px through 50px.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Target WCAG 2.2 AA: 4.5:1 contrast for body text, visible focus, semantic landmarks, and keyboard-reachable links and controls.
- Support `prefers-reduced-motion` and the app's existing light/dark theme behavior.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
|---|---|---|---|
| Legacy policy company name and contact details | `src/components/PrivacyPolicyPage.tsx` | Legal copy must be confirmed by the owner before alteration | Update only with confirmed legal entity details |
