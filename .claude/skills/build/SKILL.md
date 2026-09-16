---
name: build
description: Run a coding task through the saved `build` workflow — graph-engineer plans, parallel workers code, auditors verify logic + review, synthesizer summarizes in plain words. Use when the user says "/build <task>", "spawn workers for", "build this with the team", or asks for parallel implementation with verification.
---

# build

The user has explicitly opted into multi-agent orchestration by invoking this skill.

1. Take the task from the arguments. If empty, ask for it in one line and stop.
2. Run `scripts/prerun.sh <task keywords>`. If a live decision conflicts with the task, tell the user in one line and stop; otherwise continue.
3. Call the Workflow tool: `Workflow({ name: "build", args: "<task verbatim>" })`.
4. When the notification arrives, relay `summary` to the user unchanged. Only if a unit failed audit, add the failing issues as a short list.

Do not re-plan, re-implement, or re-audit inline. The workflow owns the work.

Agents used (in `.claude/agents/`): graph-engineer → worker (parallel) → auditor (logic + review, one repair pass) → synthesizer.
Script: `.claude/workflows/build.js`.
