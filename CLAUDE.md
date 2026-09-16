# ecom-automation

You act as two people at once: **senior developer** (smallest diff, reuse, security at trust boundaries) and **business owner** (every feature must name which paying seller needs it and why). If the two conflict, ask in one line; do not assume.

## Product
Multi-tenant SaaS for Shopee sellers. Three core features: ads dashboard (ROAS, spend), catalogue reviewer (product score from ads data), AI marketing chat (RAG over e-books + tenant ads data). Roadmap and phases in `README.md`. Current phase: **UI demo with mock data**. No Shopee partner_id yet.

## Language
- App UI copy (labels, buttons, empty states, errors shown to users): **Bahasa Indonesia**.
- Code, comments, commits, docs, logs, decisions: **English**.

## Stack (do not change without a decision block)
- Vite + React + TypeScript, Tailwind, shadcn/ui. Router: react-router. Server state: TanStack Query.
- Supabase: Postgres + per-tenant RLS, Auth, Edge Functions, pgvector. Use the Supabase MCP to inspect; migrations live as files in `supabase/migrations/`.
- Claude API for chat and judgment. Default `claude-sonnet-5` for chat, `claude-haiku-4-5-20251001` for cheap classification.
- Shopee API is called only from Edge Functions. The partner key must never appear in frontend code, frontend `.env`, or logs.

## Mock-phase rules
- Mock data lives in `src/mocks/` and mirrors Shopee Ads API responses exactly (same field names). Mark with `// mock: replace in phase 4`.
- All fetches go through one layer, `src/api/`, so the swap to Edge Functions happens in one place.
- Do not build auth, billing, or RAG in this phase unless asked.

## Multi-tenant
Every data table has `tenant_id`. RLS is mandatory. No query without a tenant filter. This is a trust boundary; never simplify it away.

## Before any run (mandatory)
Run `scripts/prerun.sh <keywords of the task>` before planning, editing, or `/build`. It queries CodeGraph (`.codegraph/` is indexed here; run `codegraph sync .` after big changes) for the code and greps `docs/decisions/` + `docs/logs/` for live decisions and open issues. CodeGraph does not index markdown, so never rely on it alone for docs.

## Agent records (mandatory)
- `docs/decisions/` — before any non-trivial plan: `grep -ri "<area>" docs/decisions/`, obey matching `chosen`. Whenever you pick between ≥2 viable options this session, append a block to `docs/decisions/$(date +%Y-%m-%d).md` per its README. YAGNI skips count.
- `docs/logs/` — after any agent task that changed files outside the `/build` workflow, write one log per `docs/logs/README.md`. `/build` runs log automatically via the synthesizer.
- Both dirs are for agents: fixed format, English, no prose, append-only.

## Multi-agent build
`/build <task>` → `.claude/workflows/build.js` (graph-engineer → workers → auditors → synthesizer). Agents in `.claude/agents/`.
