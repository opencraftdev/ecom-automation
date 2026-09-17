---
task: Rebuild the Ringkasan dashboard content to mirror Shopee Ads Manager (frontend units)
run: build
units: 5
status: pass
files: [src/index.css, src/features/ringkasan/PerformanceCards.tsx, src/features/ringkasan/HourlyChart.tsx, src/features/ringkasan/AdList.tsx, src/components/ui/input-group.tsx, src/features/ringkasan/RingkasanPage.tsx, src/features/ringkasan/KpiCards.tsx (removed), src/features/ringkasan/RoasSpendChart.tsx (removed), src/features/ringkasan/BudgetCard.tsx (removed), src/features/ringkasan/BestHoursHeatmap.tsx (removed), src/features/ringkasan/TopCampaigns.tsx (removed), src/features/ringkasan/AttentionList.tsx (removed)]
---
## units
- tokens | pass | Add series color CSS vars + Tailwind theme registration | check: npx tsc -b, npm run build
- performance-cards | pass | 2x4 Performa metric cards with tooltips, deltas, series toggle | check: npx tsc -b (clean re: this file)
- hourly-chart | pass | Normalized multi-series hourly LineChart with legend/tooltip | check: npx tsc -b (clean re: this file)
- ad-list | pass | Daftar Iklan Produk table with tabs, filters, pagination | check: npx tsc -b, npm run build
- compose | pass | Rewire RingkasanPage to compose Performa card + AdList, remove 6 old widgets | check: npx tsc -b, npm run build (final merged run: both clean)

## audit
- tokens | logic:pass review:pass | repaired:no
- performance-cards | logic:pass review:pass | repaired:no
- hourly-chart | logic:pass review:pass | repaired:no
- ad-list | logic:pass review:pass | repaired:no
- compose | logic:pass review:pass | repaired:no

## issues-open
- src/features/ringkasan/PerformanceCards.tsx:19-24 | med | ROAS uses a new local Intl formatter (2 decimals, no "x") instead of reusing/updating lib/format's formatRoas; contradicts docs/plan/phase-1-ui-demo.md:113 example "ROAS 3,2x" though matches ref-5 screenshot "15,12"; no decision block was written by the worker (added retroactively, see decisions D-20260917).
- src/features/ringkasan/PerformanceCards.tsx:107 | low | onKeyDown handler attached to non-selectable Cards too, which have no tabIndex/role and can never receive focus — dead wiring, harmless but should be conditioned on isSelectable.
- src/features/ringkasan/RingkasanPage.tsx:32-40 vs PerformanceCards.tsx:118-123 | low | HelpCircle TooltipTrigger render-prop pattern differs between the two files (icon nested in `render` vs passed as children) for the same idiom; align for consistency once visually testable.
- src/features/ringkasan/RingkasanPage.tsx:54 | low | "Download Data" button label uses the English word "Download" in user-facing UI copy; CLAUDE.md requires Bahasa Indonesia. docs/plan/phase-1-ui-demo.md also uses this exact label, so may need updating there too if changed.
- src/api/ads.ts | low | useAdsSummary/useAttention/useCampaigns hooks now have no remaining callers after old widgets were removed; flag for a follow-up cleanup/dead-code pass.

## next
- Follow-up cleanup pass: fix the three low-severity items above (conditional onKeyDown, consistent TooltipTrigger pattern, "Download Data" → Indonesian label) and confirm/remove now-unused src/api/ads.ts hooks.
