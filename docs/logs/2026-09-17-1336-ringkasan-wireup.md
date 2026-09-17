---
task: wire Ringkasan into "/" route and fix audit leftovers after build run 2026-09-17-1400
run: manual
units: 1
status: pass
files: [src/app/routes.tsx, src/mocks/shopee-ads.ts, src/api/ads.ts, src/app/Layout.tsx, src/features/ringkasan/StatTiles.tsx]
---
## units
- wireup | pass | route "/" renders RingkasanPage; 3 losing campaigns tuned above median spend; toggle labels Terang/Gelap; stat number 24px below 2xl | check: npx tsc -b && npm run build && Chrome screenshot light+dark
## audit
- wireup | logic:pass review:pass | repaired:no
## issues-open
- src/features/ringkasan/RingkasanPage.tsx | low | page h2 "Ringkasan" duplicates top-bar title; refs show title only in top bar
- src/mocks/shopee-ads.ts | low | dates use machine clock (rolling window); fine for demo
- src/api/ads.ts:146-153 | low | attention rule verified ad hoc only; add one assert-based check when rules go live (phase 5)
## next
- build Iklan screen (F1.5, F1.6) with campaign table + drawer
