---
task: Build phase-1 demo dashboard (Ringkasan screen) - tokens/shell, mock data, api/format layer, ringkasan screen
run: build
units: 4
status: partial
files: [src/index.css, src/app/Layout.tsx, src/app/routes.tsx, src/app/pages/Iklan.tsx, src/app/pages/Produk.tsx, src/app/pages/Chat.tsx, src/app/pages/Pengaturan.tsx, src/main.tsx, src/App.tsx, src/components/ui/kbd.tsx, src/mocks/shopee-ads.ts, src/api/ads.ts, src/lib/format.ts, src/features/ringkasan/RingkasanPage.tsx, src/features/ringkasan/StatTiles.tsx, src/features/ringkasan/RoasSpendChart.tsx, src/features/ringkasan/AttentionList.tsx, src/features/ringkasan/DateRangePicker.tsx]
---
## units
- tokens-shell | pass | tokens + app shell + routes + sidebar/top bar | check: tsc -b && npm run build
- mock-data | pass | 12 campaigns x 30 days Shopee Ads v2 mock rows | check: tsc -b + ad-hoc row-count check
- api-format-layer | pass | TanStack Query hooks + id-ID formatters | check: tsc -b && npm run build
- ringkasan-screen | fail | Ringkasan dashboard screen (tiles/chart/attention/insight) | check: tsc -b only, build not run in report

## audit
- tokens-shell | logic:pass review:fail | repaired:yes
- mock-data | logic:pass review:pass | repaired:no
- api-format-layer | logic:pass review:pass | repaired:no
- ringkasan-screen | logic:fail review:pass | repaired:yes

## issues-open
- src/features/ringkasan/RingkasanPage.tsx:32-41 | low | stat-tile totals use full selected range while 7d delta always compares trailing 7 vs prior 7 days regardless of range length; add clarifying comment or align windows.
- src/api/ads.ts:151 | low | sort comparator `b.spend - b.gmv - (a.spend - a.gmv)` reads ambiguous, needs explicit parens on both sides.
- src/api/ads.ts:146-153 | medium | median/ROAS-filter/loss-sort logic (F1.4 attention rule) has no persisted test, only ad-hoc verification.
- N/A (process) | low | worker report for ringkasan-screen only ran tsc -b, not npm run build, so acceptance coverage was incomplete in the report (build does pass manually).

## next
- Wire RingkasanPage into routes.tsx index route ("/") so the built screen is reachable; this was the blocking finding for ringkasan-screen and requires a routes.tsx edit outside that unit's file scope.
