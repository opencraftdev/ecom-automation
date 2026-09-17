---
task: move Sorotan to the top as a distinct hero banner with an AI logo (owner ref-7 Shopee ads banner)
run: manual
units: 1
status: pass
files: [src/features/ringkasan/Highlights.tsx, src/features/ringkasan/RingkasanPage.tsx, src/index.css]
---
## units
- banner | pass | Highlights rendered as <section> with brand gradient (--hero-from/via/to tokens, light + dark), two blurred brand blobs, 48px gradient logo mark (Sparkles + "AI" pill), title "Sorotan AI", three insight chips on translucent card bg, lg CTA; placed first in RingkasanPage | check: npx tsc -b && npm run build && Chrome light+dark, no console errors
## audit
- banner | logic:pass review:pass | repaired:no
## issues-open
- src/features/ringkasan/Highlights.tsx | low | chip text wraps to 4 lines at 1456px when ad names are long; truncate names in row 2 to 1 name + "+n lainnya" if it bothers the owner
## next
- Chat screen (F3.1–F3.3) so the banner CTA and Tanya AI links land somewhere
