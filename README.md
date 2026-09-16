# ecom-automation

SaaS untuk seller Shopee: pantau performa iklan, review katalog produk berdasarkan data iklan, dan tanya AI marketing yang menjawab dari e-book digital marketing + data toko sendiri.

## Apa yang dibangun

| Fitur | Isi | Sumber data |
|---|---|---|
| Ads dashboard | ROAS, spend, revenue, CTR per campaign dan per hari | Shopee Ads API (mock dulu) |
| Catalogue reviewer | Skor tiap produk dari performa iklannya: turunkan budget, naikkan, perbaiki listing | Shopee Ads + Product API (mock dulu) |
| AI marketing chat | Chat dengan AI. Jawaban di-ground ke e-book digital marketing (RAG) dan angka iklan toko user | pgvector + Claude |
| Multi-tenant | Seller daftar, connect toko Shopee sendiri, data terpisah per tenant | Supabase Auth + RLS |

## Stack

- Frontend: Vite + React + TypeScript, Tailwind, shadcn/ui
- Backend: Supabase (Postgres, Auth, RLS, Edge Functions, pgvector)
- AI: Claude API untuk chat, embeddings untuk RAG
- Shopee: Open Platform Ads API, dipanggil dari Edge Functions agar partner key tidak pernah sampai ke browser

## Fase

1. **UI demo dengan mock data** ← sekarang. Semua layar jalan pakai data palsu yang bentuknya sama dengan response Shopee. Tujuan: bisa didemokan sebelum partner_id keluar.
2. **Supabase + Auth + multi-tenant.** Login, tabel per tenant, RLS.
3. **RAG chat.** Ingest e-book (PDF) → chunk → embed → pgvector. Chat menjawab dengan sitasi bab e-book.
4. **Shopee live.** Ganti mock dengan Edge Function yang memanggil Ads API. OAuth per seller.
5. **Catalogue reviewer.** Aturan skor produk dari data iklan nyata.

## Yang harus kamu (owner) lakukan

- Selesaikan registrasi Shopee Open Platform, minta akses Ads API. Simpan `partner_id` + `partner_key` di Supabase secrets, bukan di repo.
- Siapkan e-book digital marketing dalam PDF, taruh di `rag/sources/` (di-gitignore). Sebutkan mana yang boleh dikutip ke user.
- Tentukan harga dan batas tier (jumlah toko, jumlah chat per bulan) sebelum fase 2.
- Buat project Supabase, kasih URL + anon key ke `.env`.

## Cara kerja dengan agent di repo ini

- `/build <task>` menjalankan tim agent: plan → workers paralel → audit → ringkasan. Detail di `.claude/`.
- Sebelum tugas apa pun agent menjalankan `scripts/prerun.sh <keyword>` untuk baca kode via CodeGraph dan keputusan lama di `docs/decisions/`.
- `docs/logs/` dan `docs/decisions/` ditulis agent, untuk agent. Jangan diedit manual.

## Menjalankan

```bash
npm install
npm run dev
```
