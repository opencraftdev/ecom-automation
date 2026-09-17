---
task: sticky white header, real loading states, fluid splash screen
run: manual
units: 1
status: pass
files: [index.html, src/main.tsx, src/app/Layout.tsx, src/app/routes.tsx, src/app/PageSkeleton.tsx, src/api/ads.ts, src/index.css]
---
## units
- shell | pass | header sticky top-0 z-20 bg-card/95 backdrop-blur with global loading bar (useIsFetching); static splash in index.html (logo float + ring + slide bar, dark-aware via localStorage theme) faded out by main.tsx after first paint with 700ms minimum; routes lazy + Suspense with PageSkeleton; mock queryFns wrapped in withLatency 450-850ms so skeletons show | check: npx tsc -b && npm run build && Chrome capture of splash → skeleton → content, sticky header on scroll
## audit
- shell | logic:pass review:pass | repaired:no
## issues-open
- src/api/ads.ts | low | withLatency is mock-only (marked); remove in phase 4 when Edge Functions supply real latency
- console | low | "Encountered a script tag while rendering" comes from next-themes ThemeScript under React 19; harmless, theme class is also set pre-paint in index.html
## next
- build Iklan screen (F1.5, F1.6)
