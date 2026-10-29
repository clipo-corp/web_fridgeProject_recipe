# Typography

Keep Cook web and the native app deliberately use **different typefaces** but the
**same semantic role names**. A designer or engineer moving between the two should be
able to say "this is `h5`" and have it mean the same thing on both sides.

## Typeface

| Platform | Stack | Why |
|---|---|---|
| Web | `Pretendard Variable` → `Apple SD Gothic Neo` → `Noto Sans KR` → system | Pretendard renders Korean body text noticeably better than the browser default across Windows and Android |
| Native | `system-ui` (iOS `ui-serif`/`ui-rounded`/`ui-monospace` variants) | No bundled font files; the platform face is already tuned for the OS |

Unifying the typeface was considered and rejected: shipping Pretendard to native means
bundling font files and an `expo-font` load step, and dropping it on web regresses Korean
readability on non-Apple platforms. The scale is what needed to agree, not the face.

## Role tokens

Defined in `src/styles/base.css`. Each mirrors `Typography` in
`smart-fridge-native/client/constants/theme.ts`.

| Role | Size | Line height | Weight | Typical use |
|---|---:|---:|---:|---|
| `hero` | 32 | 40 | 800 | Landing headline |
| `banner` | 28 | — | 800 | Section banner |
| `h1` | 24 | 32 | 800 | Page title |
| `h2` | 20 | — | 800 | Card / section title |
| `h3` | 18 | — | 800 | Subsection |
| `h4` | 16 | — | 800 | Inline heading |
| `h5` | 14 | — | 800 | Step section heading, eyebrow |
| `h6` | 11 | — | 800 | Smallest label |
| `boldtitle` | 16 | 24 | 800 | Emphasised body-size title |
| `body` | 16 | 24 | 400 | Default copy |
| `link` | 16 | 24 | 400 | Inline link |
| `small` | 14 | 20 | 400 | Secondary copy |
| `caption` | 12 | 18 | 400 | Metadata, timestamps |

Usage:

```css
.step-group__title {
  font-size: var(--type-h5-size);
  font-weight: var(--type-weight-heading);
}
```

## Known gap

Roughly 100 raw `font-size` declarations still live in `src/styles/*.css`
(`14px` ×13, `11px` ×10, `17px` ×9, `13px` ×9, …). They predate these tokens and were
**not** migrated in one sweep: the public site currently renders only the pre-launch page
(`App.tsx`), so a global typography change cannot be visually verified right now.

Migrate opportunistically — when you touch a rule, move it to the nearest role. Values
that do not map cleanly (`17px`, `13px`, `19px`, `31px`, `34px`, `42px`) are the ones
worth raising with design rather than silently rounding.
