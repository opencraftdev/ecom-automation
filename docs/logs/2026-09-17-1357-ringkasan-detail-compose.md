---
task: compose 6 detail widgets into Ringkasan and fix visual defects found in browser
run: manual
units: 1
status: pass
files: [src/features/ringkasan/RingkasanPage.tsx, src/features/ringkasan/SpendByTypeDonut.tsx, src/features/ringkasan/TopCampaigns.tsx, src/features/ringkasan/BestHoursHeatmap.tsx, src/features/ringkasan/BudgetCard.tsx, src/features/ringkasan/RoasSpendChart.tsx, src/mocks/shopee-ads.ts, src/lib/format.ts, src/index.css, .claude/workflows/build.js, .claude/agents/graph-engineer.md]
---
## units
- compose | pass | 4-row 12-col layout (5/7, 5/4/3, 8/4, 7/5); duplicate h1 removed; workflow unit cap 6→8 with dropped-unit warning | check: npx tsc -b && npm run build && Chrome screenshots light+dark
## audit
- compose | logic:pass review:pass | repaired:no
## issues-open
- src/mocks/shopee-ads.ts | low | hourly GMV uses convWeight (evening 1.35x, night 0.35x) so hourly ROAS varies; sums still reconcile (asserted); revisit when real hourly API lands
- src/features/ringkasan/MetricRow.tsx | low | tile layout duplicated from StatTiles; extract shared StatCard when a third tile card appears
- src/features/ringkasan/RoasSpendChart.tsx, SpendByTypeDonut.tsx | low | isAnimationActive=false because Recharts 3 entry animation did not start until user interaction in headless capture; re-enable if wanted
## next
- build Iklan screen (F1.5, F1.6): campaign table + drawer; reuse CampaignSummary and TopCampaigns badges
