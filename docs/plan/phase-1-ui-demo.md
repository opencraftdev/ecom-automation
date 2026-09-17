# Phase 1 — UI demo with mock data

Goal: a clickable demo a Shopee seller understands in 2 minutes. No auth, no backend. Indonesian UI.

## Screens (5)

| # | Route | Purpose | Key widgets |
|---|---|---|---|
| 1 | `/` Ringkasan | Health of the shop's ads in one glance | Fixed 12-col grid, rows: (1) 4 KPI cards, each primary metric + 7d delta + paired efficiency metric (ROAS/CTR, Spend/CPC, Revenue/impressions, Orders/clicks); (2) ROAS vs Spend dual-axis area chart (8) + Budget card with Produk/Toko allocation bars (4); (3) best-hours heatmap full width; (4) Top campaigns, Perlu perhatian, Wawasan at 4/4/4. Date-range picker in the page toolbar |
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

## Design spec (from owner references, 2026-09-17)

References: `docs/plan/refs/ref-1-bankly.png`, `docs/plan/refs/ref-2-gotics.png`. Match this look; do not invent another one.

### Layout
- Page background light gray; content in white cards, 1px border, radius 16px, no heavy shadow.
- Left sidebar 240px, white, 1px right border. Logo top-left. Nav items: icon + label, active item = brand tint background + brand text. "Others" group below (Pengaturan, Bantuan). Bottom: Light/Dark segmented toggle.
- Top bar: page title left; search input with `⌘K` hint, bell with dot, avatar right.
- Grid: 12 columns, 24px gap, max content width 1400px. Rows use only 8/4, 12, or 4/4/4 splits; every card in a row stretches to the row height (`[&>*>*]:h-full`). No 5/7 or 5/4/3 rows.
- Mobile: sidebar collapses to bottom tab bar, cards stack.

### Components as seen in refs
- Stat tile: small outlined icon circle → label → big number (32px, tabular) → delta line `▲ 1,02% dari minggu lalu` green, or `▼` red. Tiles inside one card separated by 1px dividers, not separate cards.
- Line/area chart: single brand-colored line, gradient fill fading to transparent, hover tooltip card with date + value, vertical highlight band on hovered point. Day / Bulan / Tahun segmented control bottom-left, "Lihat laporan →" outline button bottom-right.
- Donut: thick ring in brand shades, center big number + caption, legend rows below with icon, label, percent right-aligned.
- Heatmap: 7 rows × hours grid, brand color scale in 5 steps, legend bar underneath. Use for "Jam tayang iklan terbaik".
- List rows: 40px icon, title + date, amount right. Use for "Perlu perhatian" and recent campaigns.
- Insight rows: brand-tint icon, sentence with bold numbers, "Lihat" link right. Use on Ringkasan bottom-left.

### Color tokens (Shopee)
```
--brand:        #EE4D2D   Shopee orange, primary buttons, active nav, chart line
--brand-hover:  #D73211
--brand-tint:   #FEF0EC   active nav bg, icon circles, tooltip band
--brand-2:      #FF7A5C   second chart series
--brand-3:      #FFB39F   third series / donut light segment
--brand-4:      #FFD9CF   heatmap low
--bg:           #F5F6F8   page
--card:         #FFFFFF
--border:       #E6E8EC
--text:         #111827
--text-muted:   #6B7280
--success:      #16A34A   positive delta
--danger:       #B91C1C   negative delta (dark red so it never reads as brand orange)
```
Dark mode: `--bg #0F1115`, `--card #171A21`, `--border #262A33`, text inverted, brand unchanged.

### Typography
Inter (or system fallback), 14px base, 32px stat numbers with `font-variant-numeric: tabular-nums`, 18px card titles, 12px muted captions.

### Rules
- Orange is the only hue for data by default; use blue nowhere. Green/red only for deltas and verdict badges.
- One chart style per chart type across all screens.
- Money format `Rp 21.234.740`, no decimals; ROAS `3,2x`; percentages `1,02%` (id-ID).
