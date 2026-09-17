---
task: post-workflow fixes for the Shopee-style Ringkasan (deltas, select labels, axis clipping, Indonesian label)
run: manual
units: 1
status: pass
files: [src/mocks/shopee-ads.ts, src/features/ringkasan/AdList.tsx, src/features/ringkasan/HourlyChart.tsx, src/features/ringkasan/RingkasanPage.tsx, src/components/ui/select.tsx]
---
## units
- followup | pass | mock DAYS 30→60 so the 30-day default has a full previous period (deltas were all 0,00%); base-ui Select given `items` maps so triggers show "Semua Tipe"/"Semua Status Diagnosis"/"20 / halaman" instead of raw values; XAxis padding so 00:00 is not clipped; "Download Data"→"Unduh Data"; sm Select trigger pill | check: npx tsc -b && npm run build && Chrome: deltas, selects, axis, status filter, metric toggle
## audit
- followup | logic:pass review:pass | repaired:no
## issues-open
- src/api/ads.ts | low | useAdsSummary/useAdsDaily/useCampaigns/useAttention/useSpendByType/useBestHours/useTopCampaigns/useBudget now have no UI consumers; keep until Review Produk decides, else delete
- src/features/ringkasan/PerformanceCards.tsx | low | ROAS shown as 3,28 (Shopee style) while lib/format formatRoas gives 3,3x; unify when Iklan screen lands
- src/features/ringkasan/RingkasanPage.tsx | low | Unduh Data and Metrik Lainnya are no-op buttons (demo)
## next
- Iklan screen can reuse AdList directly; Ringkasan may later show a trimmed list
