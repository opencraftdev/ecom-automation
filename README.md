# ecom-automation

Multi-tenant SaaS for Shopee sellers: ads performance (ROAS, spend), catalogue reviewer driven by ads data, and an AI marketing chat grounded in digital-marketing e-books (RAG) plus the seller's own ads numbers.

App UI language: **Bahasa Indonesia**. Code, docs, and agent records: English.

Stack: Vite + React + TypeScript, Tailwind, shadcn/ui · Supabase (Postgres, Auth, RLS, Edge Functions, pgvector) · Claude API · Shopee Open Platform Ads API.

## Owner checklist

Feature map: `docs/plan/features.md` (IDs F1–F6, phase and status per feature).

### Phase 1 — UI demo with mock data (now)
- [x] Read `docs/plan/phase-1-ui-demo.md`, then collect UI references per its reference brief (2 refs in `docs/plan/refs/`, design spec written)
- [ ] Run `/build scaffold Vite React app with dashboard layout and mock ROAS data` to start
- [ ] Review the demo screens: ads dashboard, catalogue reviewer, chat shell
- [ ] Decide product name, logo, and primary color for the UI
- [ ] Write the Indonesian copy you want for empty states and onboarding (or approve agent drafts)

### Shopee access (in progress, parallel to Phase 1)
- [ ] Finish Shopee Open Platform registration
- [ ] Request Ads API + Product API scopes
- [ ] Receive `partner_id` and `partner_key`
- [ ] Store both in Supabase secrets, never in the repo or frontend `.env`

### Phase 2 — Supabase, auth, multi-tenant
- [ ] Pick Midtrans vs Xendit (fees, QRIS/VA support, webhook)
- [ ] Create the Supabase project, put URL + anon key in `.env`
- [ ] Decide pricing tiers: number of shops, chats per month
- [ ] Approve the tenant/RLS schema before migration

### Phase 3 — RAG chat
- [ ] Collect the digital-marketing e-books as PDF, drop them in `rag/sources/` (gitignored)
- [ ] Mark which e-books may be quoted to users and which are internal only
- [ ] Approve the chat answer style (length, citation format, Indonesian tone)

### Phase 4 — Shopee live
- [ ] Pick WhatsApp provider for alerts (Fonnte or WA Business API) and set up Resend for email
- [ ] Connect one real shop via Shopee OAuth and compare live numbers against mocks
- [ ] Sign off the swap from `src/mocks/` to Edge Functions

### Phase 5 — Catalogue reviewer
- [ ] Define the scoring rules: when to cut budget, raise budget, fix listing
- [ ] Validate scores against 10 real products before release

## Working with agents here
- `/build <task>` runs plan → parallel workers → audit → summary. Details in `.claude/`.
- Agents run `scripts/prerun.sh <keywords>` before any task (CodeGraph + prior decisions).
- `docs/logs/` and `docs/decisions/` are written by agents, for agents. Do not edit by hand.

## Run
```bash
npm install
npm run dev
```
