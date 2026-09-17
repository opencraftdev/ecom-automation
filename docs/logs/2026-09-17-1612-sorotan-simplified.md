---
task: simplify the Sorotan AI banner (owner: too crowded)
run: manual
units: 1
status: pass
files: [src/features/ringkasan/Highlights.tsx]
---
## units
- banner | pass | three paragraph chips replaced by one headline ("<n> iklan perlu tindakan. ROAS naik/turun x% dari periode sebelumnya.") plus one stats line (ROAS · Laba iklan compact · Perlu tindakan) with inline deltas; title and subtitle dropped, logo mark kept; one decorative blob | check: npx tsc -b && npm run build && Chrome light+dark
## audit
- banner | logic:pass review:pass | repaired:no
## issues-open
- none
## next
- Chat screen (F3.1–F3.3)
