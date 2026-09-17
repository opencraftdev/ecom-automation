---
task: restructure Ringkasan into a strict grid and simplify for production
run: manual
units: 1
status: pass
files: [src/features/ringkasan/RingkasanPage.tsx, src/features/ringkasan/KpiCards.tsx, src/features/ringkasan/BudgetCard.tsx, src/lib/format.ts, docs/plan/phase-1-ui-demo.md]
---
## units
- grid | pass | rows: 4 KPI cards / chart 8 + budget 4 / heatmap 12 / lists 4-4-4; StatTiles+MetricRow merged into KpiCards; donut replaced by allocation bars inside BudgetCard; StatTiles.tsx, MetricRow.tsx, SpendByTypeDonut.tsx deleted | check: npx tsc -b && npm run build && Chrome screenshots
## audit
- grid | logic:pass review:pass | repaired:no
## issues-open
- src/features/ringkasan/BestHoursHeatmap.tsx | low | full-width cells are aspect-square so the card is ~470px tall; cap cell height if owner wants a shorter row
## next
- build Iklan screen (F1.5, F1.6): campaign table + drawer
