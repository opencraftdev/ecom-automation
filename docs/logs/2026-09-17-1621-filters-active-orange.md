---
task: make filter controls feel alive with brand-orange active states
run: manual
units: 1
status: pass
files: [src/components/ui/tabs.tsx, src/components/ui/select.tsx, src/features/ringkasan/AdList.tsx]
---
## units
- filters | pass | core tabs: active trigger = solid brand bg, white text, soft brand shadow, pill radius on list + triggers, hover text-brand; core select trigger: hover border-brand/50, data-popup-open border+text brand; AdList: FILLED class (border-brand bg-brand-tint text-brand) applied to Tipe/Status selects when value != all and to the search InputGroup when non-empty | check: npx tsc -b && npm run build && Chrome (tab active, select open)
## audit
- filters | logic:pass review:pass | repaired:no
## issues-open
- src/features/ringkasan/AdList.tsx | low | filled-select and filled-search states verified by code only (page scroll jumped during capture); eyeball once in the Iklan screen build
## next
- Chat screen (F3.1–F3.3)
