---
task: Extend dashboard data layer (backend units only) for Ringkasan detail: shopeeAdsHourly, shopeeMonthlyBudget mocks; AdsSummary extras, useSpendByType, useBestHours, useTopCampaigns, useBudget hooks
run: build
units: 2
status: pass
files: [src/mocks/shopee-ads.ts, src/api/ads.ts]
---
## units
- mock | pass | Add shopeeAdsHourly (24h split, weekday×hour weights) + shopeeMonthlyBudget | check: npx tsc -b + tsx assert sums equal daily rows
- api | pass | Extend AdsSummary + useSpendByType/useBestHours/useTopCampaigns/useBudget | check: npx tsc -b + tsx assert cells.length===168, usedFraction 0.7-0.95

## audit
- mock | logic:pass review:pass | repaired:no
- api | logic:pass review:pass | repaired:no

## issues-open
- src/mocks/shopee-ads.ts:158 | low | hourWeight derives weekday via Date#getDay() (UTC, Sun=0) while src/api/ads.ts:230 computeBestHours derives weekday via date-fns getISODay (local, Mon=0); harmless today since sums still reconcile and volume shaping is independent of stored weekday, but the two conventions could confuse a future edit.
- src/api/ads.ts:226-268 | med | Worker's acceptance check for useBestHours/useBudget re-implements the math in a standalone tsx script rather than exercising the actual (unexported) computeBestHours/computeBudget, so a regression in shipped code wouldn't be caught by that check.

## next
- Export computeBestHours/computeBudget (or add a QueryClientProvider test harness) so the self-check in src/api/ads.ts exercises the real code path, not a re-implementation.
