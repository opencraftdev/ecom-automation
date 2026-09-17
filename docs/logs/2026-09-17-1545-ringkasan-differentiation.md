---
task: Make the Ringkasan dashboard content our own instead of a Shopee copy (frontend units) — ROAS/profit/verdict framing, bridge to /chat, 5 units
run: build
units: 5
status: pass
files: [src/features/ringkasan/PerformanceCards.tsx, src/features/ringkasan/HourlyChart.tsx, src/features/ringkasan/AdList.tsx, src/features/ringkasan/Highlights.tsx, src/features/ringkasan/RingkasanPage.tsx]
---
## units
- performance-cards | pass | Reorder cards to ROAS/Laba/Biaya/Penjualan/... with new series mapping | check: tsc -b clean for file
- hourly-chart | pass | Rename series to gmv/expense/clicks/impressions + caption | check: tsc -b clean for file
- ad-list | pass | Rewrite filters/table/verdict badges, drop Diagnosis, add Tanya AI link | check: tsc -b + npm run build pass
- highlights | pass | New Sorotan widget: ROAS/action-needed/profit rows + AI consultant CTA | check: tsc -b clean for file
- compose | pass | Wire units into RingkasanPage, new header, default selected metrics | check: tsc -b + npm run build pass
## audit
- performance-cards | logic:pass review:pass | repaired:no
- hourly-chart | logic:pass review:pass | repaired:no
- ad-list | logic:pass review:pass | repaired:no
- highlights | logic:pass review:pass | repaired:no
- compose | logic:pass review:pass | repaired:no
## issues-open
- src/features/ringkasan/HourlyChart.tsx:104-142 | low | JSX indentation under LineChart not realigned after wrapping div; cosmetic only.
- src/features/ringkasan/AdList.tsx:143-150 | low | "Tanya AI" link passes ?ad=<campaign_id> but src/app/pages/Chat.tsx does not read it yet; ad context is dropped on arrival.
- src/features/ringkasan/AdList.tsx:192 | low | diagnosis filter hardcoded to 'all' and dropped from UI but AdListParams/useAdList still require it; dead plumbing.
- src/features/ringkasan/Highlights.tsx:53 | low | action-needed ad names joined unescaped/untruncated; could overflow compact 3-col row with long names.
## next
- Read ?ad=<campaign_id> in src/app/pages/Chat.tsx so the "Tanya AI" link actually carries context into the AI consultant.
