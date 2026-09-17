---
task: make Ringkasan content our own (not a Shopee copy): data-layer verdicts, profit, tabs; post-workflow fixes
run: manual
units: 1
status: pass
files: [src/api/ads.ts, src/mocks/shopee-ads.ts, src/features/ringkasan/AdList.tsx, src/features/ringkasan/Highlights.tsx]
---
## units
- data | pass | usePerformance.profit; HourlyPoint.expense; AdListRow gets expenseDelta/gmvDelta/roasDelta/profit/ctr/verdict/verdictReason via F2.2 rules (scale_down: ROAS<1,5 & spend>median; fix_listing: CTR<0,8%; scale_up: ROAS>4; else hold); tab all/action/healthy | check: npx tsc -b && npm run build
- fixes | pass | nativeButton={false} on Link-rendered Buttons (Base UI warning); mock clicks/spend get their own hourly shapes so chart lines no longer overlap; hourly sums still reconcile (asserted) | check: Chrome light+dark
## audit
- data | logic:pass review:pass | repaired:no
## issues-open
- src/app/pages/Chat.tsx | med | "Tanya AI →" links carry ?ad=<campaign_id> but Chat does not read it yet; build with the Chat screen (F3.1)
- src/api/ads.ts | low | AdListParams.diagnosis still required but no UI sets it; make optional or drop with the Iklan screen
- src/features/ringkasan/Highlights.tsx | low | ad names in row 2 are not truncated for very long names
## next
- Chat screen (F3.1–F3.3) reading ?ad= for context; or Iklan screen reusing AdList
