# docs/logs — agent run log (machine-readable)

Audience: agents. Not prose. One file per workflow run or agent task that changed files.

File: `docs/logs/YYYY-MM-DD-HHmm-<slug>.md` (slug = kebab task summary, ≤5 words; get time via `date +%Y-%m-%d-%H%M`).

Format (frontmatter + fixed sections, no free text outside them):

```md
---
task: <verbatim task>
run: build|manual
units: <n>
status: pass|partial|fail
files: [a.ts, b.ts]
---
## units
- <id> | pass|fail | <goal ≤12 words> | check: <cmd or "none">
## audit
- <id> | logic:pass|fail review:pass|fail | repaired:yes|no
## issues-open
- <file:line> | <severity> | <one sentence>
## next
- <one line, or "none">
```

Rules: append-only, never edit past logs. `issues-open` lists only unresolved items. Before starting a related task, `grep -l "<file>" docs/logs/*.md` to find prior runs touching the same files and read only `issues-open` + `next`.
