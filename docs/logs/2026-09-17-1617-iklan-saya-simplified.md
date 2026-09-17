---
task: simplify the Iklan Saya table for readability (frontend-design pass)
run: manual
units: 1
status: pass
files: [src/features/ringkasan/AdList.tsx]
---
## units
- table | pass | filters collapsed from 3 rows to 1 (title + count, search, Tipe select, Status select replaces 6 chips) plus the tab strip; columns reordered Iklan · ROAS · Laba · Biaya · Penjualan · Penilaian · action; only ROAS keeps a delta and is set large + toned (danger <1,5x, success >4x); Biaya/Penjualan muted compact Rupiah with full value on title; Laba compact bold; verdict = colored dot + one word, reason moved to Tooltip; Tanya AI = ghost icon button revealed on row hover/focus; period moved to title attr; uppercase 11px tracking header; staggered row fade-in (tw-animate-css, 40ms steps) | check: npx tsc -b && npm run build && Chrome + hover tooltip + Tanya AI reveal
## audit
- table | logic:pass review:pass | repaired:no
## issues-open
- src/features/ringkasan/AdList.tsx | low | Tanya AI icon only appears on hover; touch devices never hover, so show it always below lg if mobile matters in phase 1
## next
- Chat screen (F3.1–F3.3)
