---
task: Make the Ringkasan dashboard more detailed (frontend units) per docs/plan/phase-1-ui-demo.md
run: build
units: 6
status: partial
files: [src/features/ringkasan/MetricRow.tsx, src/features/ringkasan/RoasSpendChart.tsx, src/features/ringkasan/SpendByTypeDonut.tsx, src/features/ringkasan/BestHoursHeatmap.tsx, src/features/ringkasan/TopCampaigns.tsx, src/features/ringkasan/BudgetCard.tsx, src/components/ui/progress.tsx]
---
## units
- metric-row | pass | 2nd stat card: Tayangan/Klik/CTR/CPC tiles | check: tsc -b + build pass
- chart-legend | pass | dual-axis ROAS/Pengeluaran legend on RoasSpendChart | check: tsc -b + build pass
- spend-donut | pass | donut chart Produk vs Toko spend by type | check: tsc -b + build pass
- best-hours | pass | 7x24 CSS-grid heatmap of best ad hours | check: tsc -b + build pass
- top-campaigns | pass | shadcn table of top 5 campaigns w/ footer link | check: tsc -b + build pass
- budget | pass | monthly budget card w/ shadcn Progress | check: tsc -b + build pass
- compose | fail | wire all widgets + new 12-col layout into RingkasanPage.tsx | check: none (unit never ran)
## audit
- metric-row | logic:pass review:pass | repaired:no
- chart-legend | logic:pass review:pass | repaired:no
- spend-donut | logic:pass review:pass | repaired:no
- best-hours | logic:pass review:pass | repaired:no
- top-campaigns | logic:pass review:pass | repaired:no
- budget | logic:pass review:pass | repaired:no
## issues-open
- src/features/ringkasan/RingkasanPage.tsx:87 | high | old duplicate h1 "Ringkasan" still present, new widgets (MetricRow/SpendByTypeDonut/BestHoursHeatmap/TopCampaigns/BudgetCard) not imported/rendered — compose unit never executed
- src/features/ringkasan/MetricRow.tsx:17-131 | med | tile-card layout duplicated byte-for-byte from StatTiles.tsx instead of a shared generic component
- src/features/ringkasan/BestHoursHeatmap.tsx:26 | low | comment says bucket colors run --brand-4 to --brand but code starts at bg-brand-tint (stale comment)
- src/index.css:105-141 (.dark) | low | --brand-tint has no dark override; large-area use in heatmap bucket 0 may look wrong in dark theme
- src/features/ringkasan/SpendByTypeDonut.tsx:27 | low | chartConfig.spend entry appears unused
- src/features/ringkasan/TopCampaigns.tsx:114 | low | footer links to /iklan; confirm route is in scope for this phase
## next
- Run the compose unit: edit RingkasanPage.tsx to remove the duplicate h1 and wire MetricRow, SpendByTypeDonut, BudgetCard, BestHoursHeatmap, TopCampaigns into the specified 12-col row layout.
