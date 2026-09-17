// mock: replace in phase 4
// Shopee Ads API v2 daily performance shape (ads.get_all_cpc_ads_daily_performance).
// Field names per docs/plan/phase-1-ui-demo.md — verify once partner access is granted.

export type ShopeeAdType = "product" | "shop";
export type ShopeeAdStatus = "ongoing" | "paused" | "ended";

export interface ShopeeAdDailyPerformance {
  campaign_id: string;
  ad_name: string;
  ad_type: ShopeeAdType;
  status: ShopeeAdStatus;
  date: string; // YYYY-MM-DD
  impression: number;
  clicks: number;
  ctr: number; // percent, e.g. 1.02 means 1.02%
  expense: number; // IDR
  cpc: number; // IDR
  broad_gmv: number; // IDR
  broad_order: number;
  broad_roi: number;
  direct_gmv: number; // IDR
  direct_order: number;
  direct_roi: number;
}

interface CampaignSeed {
  campaign_id: string;
  ad_name: string;
  ad_type: ShopeeAdType;
  status: ShopeeAdStatus;
  // tuning knobs so the 12 campaigns span winners, losers, and a paused/ended one
  dailyImpressionBase: number;
  ctrBase: number; // percent
  cpcBase: number; // IDR
  roasBase: number; // broad_roi target
}

const CAMPAIGN_SEEDS: CampaignSeed[] = [
  { campaign_id: "cmp-1001", ad_name: "Iklan Produk - Tas Wanita Kanvas", ad_type: "product", status: "ongoing", dailyImpressionBase: 12000, ctrBase: 1.8, cpcBase: 850, roasBase: 5.2 },
  { campaign_id: "cmp-1002", ad_name: "Iklan Produk - Sepatu Sneakers Pria", ad_type: "product", status: "ongoing", dailyImpressionBase: 9500, ctrBase: 1.4, cpcBase: 1200, roasBase: 3.8 },
  { campaign_id: "cmp-1003", ad_name: "Iklan Toko - Flash Sale Mingguan", ad_type: "shop", status: "ongoing", dailyImpressionBase: 20000, ctrBase: 0.9, cpcBase: 600, roasBase: 2.6 },
  { campaign_id: "cmp-1004", ad_name: "Iklan Produk - Skincare Serum Wajah", ad_type: "product", status: "ongoing", dailyImpressionBase: 15000, ctrBase: 2.1, cpcBase: 950, roasBase: 6.1 },
  { campaign_id: "cmp-1005", ad_name: "Iklan Produk - Baju Koko Anak", ad_type: "product", status: "paused", dailyImpressionBase: 4000, ctrBase: 0.6, cpcBase: 700, roasBase: 1.1 },
  { campaign_id: "cmp-1006", ad_name: "Iklan Toko - Promo Gudang", ad_type: "shop", status: "ongoing", dailyImpressionBase: 22000, ctrBase: 1.8, cpcBase: 500, roasBase: 1.3 },
  { campaign_id: "cmp-1007", ad_name: "Iklan Produk - Aksesoris HP", ad_type: "product", status: "ongoing", dailyImpressionBase: 18000, ctrBase: 2.5, cpcBase: 400, roasBase: 4.4 },
  { campaign_id: "cmp-1008", ad_name: "Iklan Produk - Peralatan Dapur Set", ad_type: "product", status: "ongoing", dailyImpressionBase: 16000, ctrBase: 1.4, cpcBase: 1100, roasBase: 1.4 },
  { campaign_id: "cmp-1009", ad_name: "Iklan Toko - Koleksi Baru", ad_type: "shop", status: "ended", dailyImpressionBase: 6000, ctrBase: 1.3, cpcBase: 750, roasBase: 2.9 },
  { campaign_id: "cmp-1010", ad_name: "Iklan Produk - Mainan Edukasi Anak", ad_type: "product", status: "ongoing", dailyImpressionBase: 13000, ctrBase: 1.7, cpcBase: 650, roasBase: 3.2 },
  { campaign_id: "cmp-1011", ad_name: "Iklan Produk - Jam Tangan Wanita", ad_type: "product", status: "ongoing", dailyImpressionBase: 10000, ctrBase: 1.6, cpcBase: 900, roasBase: 4.9 },
  { campaign_id: "cmp-1012", ad_name: "Iklan Toko - Gratis Ongkir", ad_type: "shop", status: "ongoing", dailyImpressionBase: 40000, ctrBase: 1.2, cpcBase: 550, roasBase: 1.2 },
];

const DAYS = 30;

// ponytail: mulberry32 PRNG so the 360 mock rows are stable across renders in a session
// without a random-utils dependency; real variance comes from live Ads API in phase 4.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function buildRows(): ShopeeAdDailyPerformance[] {
  const rows: ShopeeAdDailyPerformance[] = [];

  CAMPAIGN_SEEDS.forEach((seed, campaignIndex) => {
    const rand = mulberry32(campaignIndex * 1000 + 7);

    for (let dayOffset = DAYS - 1; dayOffset >= 0; dayOffset--) {
      const jitter = 0.85 + rand() * 0.3; // +/-15%
      const impression = Math.round(seed.dailyImpressionBase * jitter);
      const ctr = round2(seed.ctrBase * (0.85 + rand() * 0.3));
      const clicks = Math.max(0, Math.round((impression * ctr) / 100));
      const cpc = Math.round(seed.cpcBase * (0.9 + rand() * 0.2));
      const expense = clicks * cpc;

      const roasJitter = 0.8 + rand() * 0.4;
      const broad_roi = round2(seed.roasBase * roasJitter);
      const broad_gmv = Math.round(expense * broad_roi);
      const broad_order = Math.max(0, Math.round(broad_gmv / (80000 + rand() * 40000)));

      const direct_roi = round2(broad_roi * (0.5 + rand() * 0.2));
      const direct_gmv = Math.round(expense * direct_roi);
      const direct_order = Math.max(0, Math.round(direct_gmv / (80000 + rand() * 40000)));

      rows.push({
        campaign_id: seed.campaign_id,
        ad_name: seed.ad_name,
        ad_type: seed.ad_type,
        status: seed.status,
        date: dateNDaysAgo(dayOffset),
        impression,
        clicks,
        ctr,
        expense,
        cpc,
        broad_gmv,
        broad_order,
        broad_roi,
        direct_gmv,
        direct_order,
        direct_roi,
      });
    }
  });

  return rows;
}

// mock: replace in phase 4 — 12 campaigns x 30 days = 360 rows
export const shopeeAdsDaily: ShopeeAdDailyPerformance[] = buildRows();
