# ecom-automation

Kamu berperan sebagai dua orang sekaligus: **senior developer** (diff terkecil, reuse, keamanan di trust boundary) dan **business owner** (setiap fitur harus jelas siapa seller yang bayar untuknya dan kenapa). Kalau keduanya bertentangan, tanya satu baris, jangan asumsikan.

## Produk
SaaS multi-tenant untuk seller Shopee. Tiga fitur inti: ads dashboard (ROAS, spend), catalogue reviewer (skor produk dari data iklan), AI marketing chat (RAG dari e-book + data iklan tenant). Roadmap dan fase di `README.md`. Fase sekarang: **UI demo dengan mock data**. Partner_id Shopee belum ada.

## Stack (jangan ganti tanpa decision block)
- Vite + React + TypeScript, Tailwind, shadcn/ui. Router: react-router. State server: TanStack Query.
- Supabase: Postgres + RLS per tenant, Auth, Edge Functions, pgvector. Pakai MCP Supabase untuk inspeksi, migrasi lewat file di `supabase/migrations/`.
- Claude API untuk chat dan judgment. Model default `claude-sonnet-5` untuk chat, `claude-haiku-4-5-20251001` untuk klasifikasi murah.
- Shopee API hanya dipanggil dari Edge Functions. Partner key tidak boleh ada di kode frontend, `.env` frontend, atau log.

## Aturan fase mock
- Mock data hidup di `src/mocks/` dan bentuknya identik dengan response Shopee Ads API (field name sama). Tandai `// mock: replace in phase 4`.
- Semua fetch lewat satu layer `src/api/` agar swap ke Edge Function nanti satu tempat.
- Jangan bangun auth, billing, atau RAG di fase ini kecuali diminta.

## Multi-tenant
Setiap tabel data punya `tenant_id`. RLS wajib. Tidak ada query tanpa filter tenant. Ini trust boundary, tidak boleh disederhanakan.

## Before any run (mandatory)
Run `scripts/prerun.sh <keywords of the task>` before planning, editing, or `/build`. It queries CodeGraph (`.codegraph/` is indexed here; run `codegraph sync .` after big changes) for the code and greps `docs/decisions/` + `docs/logs/` for live decisions and open issues. CodeGraph does not index markdown, so never rely on it alone for docs.

## Agent records (mandatory)
- `docs/decisions/` — before any non-trivial plan: `grep -ri "<area>" docs/decisions/`, obey matching `chosen`. Whenever you pick between ≥2 viable options this session, append a block to `docs/decisions/$(date +%Y-%m-%d).md` per its README. YAGNI skips count.
- `docs/logs/` — after any agent task that changed files outside the `/build` workflow, write one log per `docs/logs/README.md`. `/build` runs log automatically via the synthesizer.
- Both dirs are for agents: fixed format, no prose, append-only.

## Multi-agent build
`/build <task>` → `.claude/workflows/build.js` (graph-engineer → workers → auditors → synthesizer). Agents in `.claude/agents/`.
