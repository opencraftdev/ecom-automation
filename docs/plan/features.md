# Feature map

Status: `demo` = mock UI (phase 1) · `planned` = has a phase · `backlog` = not scheduled.
v1 is **read-only**: the app reads Shopee data and advises; it never writes to Shopee. Ad types in scope: Product Ads (Search + Discovery) and Shop Ads. Live/Affiliate is backlog.

## F1 Ads Dashboard (Ringkasan, Iklan)
| ID | Feature | Phase | Status | Notes |
|---|---|---|---|---|
| F1.1 | Stat tiles: ROAS, Spend, Revenue (GMV), Orders, with 7d delta | 1 | demo | broad_* fields |
| F1.2 | ROAS vs Spend trend, 30d, Hari/Bulan/Tahun toggle | 1 | demo | Recharts via shadcn chart |
| F1.3 | Date-range picker, applies to all widgets | 1 | demo | |
| F1.4 | "Perlu perhatian": top 3 money-losing campaigns/products | 1 | demo | rule: ROAS < 1.5 and spend > median |
| F1.5 | Campaign table: name, type (Produk/Toko), status, spend, GMV, ROAS, CTR, CPC; sort + filter | 1 | demo | |
| F1.6 | Campaign drawer: daily chart + product breakdown | 1 | demo | Shop Ads have no product breakdown |
| F1.7 | Best ad hours heatmap (7 days × hours) | 1 | demo | needs hourly data; verify API supports it, else derive from daily |
| F1.8 | Insight rows (plain-language sentences with numbers) | 1 | demo | generated from rules in phase 1, from AI in phase 3 |
| F1.9 | Live data via Edge Function + daily sync job | 4 | planned | `ads.get_all_cpc_ads_daily_performance` |

## F2 Catalogue Reviewer (Review Produk)
| ID | Feature | Phase | Status | Notes |
|---|---|---|---|---|
| F2.1 | Product grid: image, name, spend, ROAS, orders | 1 | demo | Product Ads only |
| F2.2 | Verdict badge: Naikkan / Tahan / Turunkan / Perbaiki listing + one-line reason | 1 | demo | rules in phase-1 plan |
| F2.3 | Filter by verdict, sort by spend/ROAS | 1 | demo | |
| F2.4 | Product detail: 30d chart, verdict history | 1 | demo | |
| F2.5 | Recommendation card: what to do in Seller Centre, step by step | 1 | demo | read-only v1: no "Terapkan" button |
| F2.6 | Scoring rules on live data, validated on 10 real products | 5 | planned | owner sign-off |
| F2.7 | Listing quality checks (title, images, price) | – | backlog | not ads-driven |
| F2.8 | Apply recommendation to Shopee (write) | – | backlog | needs write scope + audit log |

## F3 Konsultan AI (Chat)
| ID | Feature | Phase | Status | Notes |
|---|---|---|---|---|
| F3.1 | Chat shell: thread list, messages, suggested prompts, Indonesian | 1 | demo | canned replies in phase 1 |
| F3.2 | Citation chips linking to e-book chapter | 1 | demo | static in phase 1 |
| F3.3 | Metric chips: answer pulls tenant ROAS/spend inline | 1 | demo | |
| F3.4 | E-book ingestion: PDF → chunks → embeddings → pgvector | 3 | planned | `rag/sources/` gitignored |
| F3.5 | RAG answer with Claude, tenant-scoped retrieval | 3 | planned | `claude-sonnet-5` |
| F3.6 | "Explain this campaign" entry point from F1.6 drawer | 3 | planned | |
| F3.7 | Chat quota per tier | 3 | planned | ties to F5.3 |

## F4 Tenant & Toko
| ID | Feature | Phase | Status | Notes |
|---|---|---|---|---|
| F4.1 | Sign up / login (email + Google) | 2 | planned | Supabase Auth |
| F4.2 | Tenant creation + RLS on every table | 2 | planned | trust boundary |
| F4.3 | Connect Shopee shop via OAuth, token stored server-side | 4 | planned | Edge Function only |
| F4.4 | Shop switcher (multi-shop per tenant) | 2 | planned | UI placeholder in phase 1 |
| F4.5 | Pengaturan: profile, shop list, disconnect | 1 | demo | |
| F4.6 | Team members with roles | – | backlog | |

## F5 Platform & Billing
| ID | Feature | Phase | Status | Notes |
|---|---|---|---|---|
| F5.1 | Sidebar + top bar shell, ⌘K search, light/dark | 1 | demo | design spec |
| F5.2 | id-ID formats (Rp, 3,2x, 1,02%) | 1 | demo | |
| F5.3 | Pricing tiers: shops, chats/month | 2 | planned | owner defines |
| F5.4 | Billing via Midtrans/Xendit (QRIS, VA, e-wallet) | 2 | planned | webhook → Edge Function |
| F5.5 | Usage metering (chats, synced shops) | 2 | planned | |

## F6 Alerts & Reports
| ID | Feature | Phase | Status | Notes |
|---|---|---|---|---|
| F6.1 | ROAS-drop alert: threshold per campaign, WhatsApp + email | 4 | planned | WhatsApp provider TBD (Fonnte or WA Business API); email via Resend |
| F6.2 | Budget-exhausted alert | 4 | planned | |
| F6.3 | Alert settings UI | 1 | demo | |
| F6.4 | Weekly report: PDF + email, ROAS/spend/top products/verdict changes | 4 | planned | cron Edge Function |
| F6.5 | Report preview page | 1 | demo | |

## Backlog (not scheduled)
Shopee Live / Affiliate (AMS) data · TikTok Shop / Tokopedia · listing quality checks · write actions to Shopee · team roles · CSV export.

## Phase 1 demo checklist (derived)
F1.1–F1.8, F2.1–F2.5, F3.1–F3.3, F4.5, F5.1–F5.2, F6.3, F6.5.
