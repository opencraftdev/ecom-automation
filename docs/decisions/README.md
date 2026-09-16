# docs/decisions — decision record (machine-readable)

Audience: agents. One file per session day: `docs/decisions/YYYY-MM-DD.md` (`date +%Y-%m-%d`). Append a block per decision; never rewrite past blocks.

A decision = a choice between ≥2 viable options that constrains future work (structure, dependency, convention, scope cut, deliberate skip).

Block format:

```md
## D-YYYYMMDD-<n> <short title>
- context: <why the choice came up, ≤2 lines>
- options: <A> | <B> | <C>
- chosen: <A>
- because: <one line>
- revisit-when: <trigger, or "never">
- touches: [files or areas]
```

Rules: before any non-trivial plan, `grep -ri "<area or file>" docs/decisions/` and obey matching `chosen` unless `revisit-when` fired. If overriding, add a new block with `supersedes: D-...`. Skipping something on purpose (YAGNI) is a decision — record it.
