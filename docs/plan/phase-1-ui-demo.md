# Phase 1 — UI demo with mock data

Goal: a clickable demo a Shopee seller understands in 2 minutes. No auth, no backend. Indonesian UI.

## Screens (5)

| # | Route | Purpose | Key widgets |
|---|---|---|---|
| 1 | `/` Ringkasan | Health of the shop's ads in one glance | 4 stat tiles (ROAS, Spend, Revenue, Orders) with 7d delta · ROAS vs Spend line chart (30d) · "Perlu perhatian" list: top 3 products losing money · date-range picker |
| 2 | `/iklan` Iklan | Campaign table | Sortable table: campaign, status, spend, GMV, ROAS, CTR, CPC · filter status/type · row click → drawer with daily chart |
| 3 | `/produk` Review Produk | Catalogue reviewer | Card grid or table per product: image, name, spend, ROAS, verdict badge (Naikkan / Tahan / Turunkan / Perbaiki listing) with one-line reason · filter by verdict |
| 4 | `/chat` Konsultan AI | AI marketing chat | Thread list left · messages right · answer shows citation chips (e-book chapter) and inline metric chips (pulled from shop data) · 3 suggested prompts on empty state |
| 5 | `/pengaturan` Pengaturan | Shop connection | "Hubungkan toko Shopee" card (disabled, coming soon) · shop switcher placeholder for multi-tenant |

Layout: left sidebar (collapsible) + top bar with shop switcher and date range. Mobile: bottom tab bar.

## Metrics and mock shape

Mock mirrors Shopee Ads API v2 daily performance (`ads.get_all_cpc_ads_daily_performance`). Field names to verify once partner access is granted:

```
campaign_id, ad_name, ad_type (product|shop), status (ongoing|paused|ended),
date, impression, clicks, ctr, expense, cpc,
broad_gmv, broad_order, broad_roi,
direct_gmv, direct_order, direct_roi
```

Derived in `src/api/`: ROAS = broad_gmv / expense; spend = expense; verdict rules (mock phase, hard-coded):
- ROAS < 1.5 and spend > median → **Turunkan**
- ROAS > 4 and impression share low → **Naikkan**
- CTR < 0.8% → **Perbaiki listing**
- else → **Tahan**

Mock volume: 1 shop, 12 campaigns, 40 products, 30 days. Currency IDR, locale `id-ID`.

## Components (shadcn)
Sidebar, Card, Table, Badge, Tabs, Sheet (drawer), DatePicker, Select, Skeleton, Toast. Charts: Recharts. Everything else exists in shadcn; add nothing custom until a screen proves the need.

## Build order
1. Shell: sidebar, top bar, routes, empty pages
2. `src/mocks/` + `src/api/` with TanStack Query hooks
3. Ringkasan
4. Iklan table + drawer
5. Review Produk
6. Chat shell (static replies from a canned list, RAG comes in phase 3)
7. Pengaturan
8. Loading/empty/error states in Indonesian

## Reference brief (what to look for)

Look for screens, not whole products. Save screenshots under `docs/plan/refs/` (gitignored is fine) with the screen number they inform.

| Screen | Look at | Why |
|---|---|---|
| 1 Ringkasan | Shopee Ads Manager overview, Meta Ads Manager overview, Triple Whale summary, Northbeam | Stat tiles with deltas, ROAS trend framing, "needs attention" pattern |
| 2 Iklan | Google Ads campaign table, Meta Ads Manager table, Linear issues table | Dense sortable table with sticky columns and inline status |
| 3 Review Produk | Shopee Seller Centre product list, Amazon Seller Central inventory health, Notion gallery view | Verdict badge + reason on cards; filter by verdict |
| 4 Chat | ChatGPT, Perplexity (citations), Linear/Notion AI side panel | Citation chips and inline data chips inside an answer |
| Overall | Vercel dashboard, Supabase dashboard, Mercury banking | Calm dense dashboards; sidebar + top bar; dark/light both |

Questions to answer while browsing: card grid or table for products? How do they show "money lost" without scaring the user? How do citations look inline? Mobbin (mobbin.com) has Shopee and Meta Ads flows; the Mobbin MCP is connected in this session if you want agents to pull screens.

## Out of scope for phase 1
Auth, billing, real Shopee calls, RAG, multi-shop data, export, notifications.
