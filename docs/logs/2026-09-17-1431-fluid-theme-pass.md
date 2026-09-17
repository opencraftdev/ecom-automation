---
task: fluid visual pass from owner reference (ref-3): borderless cards, pill controls, navy dark, header theme toggle
run: manual
units: 1
status: pass
files: [src/index.css, src/components/ui/card.tsx, src/components/ui/button.tsx, src/components/ui/input.tsx, src/components/ui/toggle.tsx, src/components/ui/toggle-group.tsx, src/components/ui/select.tsx, src/components/ui/popover.tsx, src/components/ui/skeleton.tsx, src/components/ui/empty.tsx, src/components/ui/sidebar.tsx, src/app/Layout.tsx, docs/plan/phase-1-ui-demo.md]
---
## units
- theme | pass | tokens: radius 0.875rem, --shadow-card light/dark, navy dark palette; core ui: card shadow no ring, button/input/select/toggle/sidebar-item rounded-full, toggle on-state brand tint; Layout: sun/moon toggle in header, footer toggle removed, header border removed | check: npx tsc -b && npm run build && Chrome screenshots light+dark
## audit
- theme | logic:pass review:pass | repaired:no
## issues-open
- src/components/ui/*.tsx | low | these are shadcn registry files with local edits; `npx shadcn add <name> -o` will overwrite them, re-apply the pill/shadow edits or diff first
- src/features/ringkasan/AttentionList.tsx | low | ROAS badge in dark mode is low-contrast dark red on navy; consider outline variant
## next
- build Iklan screen (F1.5, F1.6) using the pill/borderless system
