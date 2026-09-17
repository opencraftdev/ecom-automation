// mock: replace in phase 4
// Shopee Ads API v2 daily performance shape (ads.get_all_cpc_ads_daily_performance).
// Field names per docs/plan/phase-1-ui-demo.md — verify once partner access is granted.

export type ShopeeAdType = "product" | "shop";
export type ShopeeAdStatus = "scheduled" | "ongoing" | "paused" | "ended" | "deleted";

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
  add_to_cart: number;
}

export type ShopeeAdBiddingMode = "gmv_max_auto" | "gmv_max_roas" | "manual";
export type ShopeeAdStage = 1 | 2;
export type ShopeeAdDiagnosis = "good" | "needs_attention" | "none";

export interface ShopeeAdCampaign {
  campaign_id: string;
  ad_name: string;
  ad_type: ShopeeAdType;
  status: ShopeeAdStatus;
  bidding_mode: ShopeeAdBiddingMode;
  stage: ShopeeAdStage; // 1 = Dapatkan Klik, 2 = Tingkatkan Penjualan
  daily_budget: number; // IDR, 0 = unlimited
  target_roas_min: number; // equal to max when bidding is roas-fixed, both 0 when n/a
  target_roas_max: number;
  start_date: string; // YYYY-MM-DD
  end_date: string; // '' = no end
  roas_protection: boolean;
  // ponytail: not a real Shopee Ads API field — UI-only placeholder thumbnail
  // (no ad creative asset in mock phase). Diverges from the "mirror the API
  // shape" rule deliberately; drop once real ad image URLs are available.
  thumbnail: { bg: string; initials: string };
  diagnosis: ShopeeAdDiagnosis;
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
  // per-campaign metadata (shopeeAdCampaigns export)
  bidding_mode: ShopeeAdBiddingMode;
  stage: ShopeeAdStage;
  daily_budget: number;
  target_roas_min: number;
  target_roas_max: number;
  startDaysAgo: number; // negative = future (scheduled)
  endDaysAgo: number | null; // null = no end
  roas_protection: boolean;
  thumbnail: { bg: string; initials: string };
  diagnosis: ShopeeAdDiagnosis;
}

const CAMPAIGN_SEEDS: CampaignSeed[] = [
  { campaign_id: "cmp-1001", ad_name: "Iklan Produk - Tas Wanita Kanvas", ad_type: "product", status: "ongoing", dailyImpressionBase: 12000, ctrBase: 1.8, cpcBase: 850, roasBase: 5.2, bidding_mode: "manual", stage: 2, daily_budget: 500000, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 60, endDaysAgo: null, roas_protection: false, thumbnail: { bg: "#F5A623", initials: "TW" }, diagnosis: "good" },
  { campaign_id: "cmp-1002", ad_name: "Iklan Produk - Sepatu Sneakers Pria", ad_type: "product", status: "ongoing", dailyImpressionBase: 9500, ctrBase: 1.4, cpcBase: 1200, roasBase: 3.8, bidding_mode: "gmv_max_auto", stage: 2, daily_budget: 0, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 60, endDaysAgo: null, roas_protection: true, thumbnail: { bg: "#4A90D9", initials: "SS" }, diagnosis: "good" },
  { campaign_id: "cmp-1003", ad_name: "Iklan Toko - Flash Sale Mingguan", ad_type: "shop", status: "ongoing", dailyImpressionBase: 20000, ctrBase: 0.9, cpcBase: 600, roasBase: 2.6, bidding_mode: "gmv_max_roas", stage: 2, daily_budget: 300000, target_roas_min: 2.5, target_roas_max: 2.5, startDaysAgo: 60, endDaysAgo: null, roas_protection: true, thumbnail: { bg: "#E8534E", initials: "FS" }, diagnosis: "needs_attention" },
  { campaign_id: "cmp-1004", ad_name: "Iklan Produk - Skincare Serum Wajah", ad_type: "product", status: "ongoing", dailyImpressionBase: 15000, ctrBase: 2.1, cpcBase: 950, roasBase: 6.1, bidding_mode: "manual", stage: 1, daily_budget: 800000, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 60, endDaysAgo: null, roas_protection: false, thumbnail: { bg: "#7ED957", initials: "SK" }, diagnosis: "good" },
  { campaign_id: "cmp-1005", ad_name: "Iklan Produk - Baju Koko Anak", ad_type: "product", status: "paused", dailyImpressionBase: 4000, ctrBase: 0.6, cpcBase: 700, roasBase: 1.1, bidding_mode: "manual", stage: 1, daily_budget: 200000, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 45, endDaysAgo: null, roas_protection: false, thumbnail: { bg: "#B78BDE", initials: "BK" }, diagnosis: "needs_attention" },
  { campaign_id: "cmp-1006", ad_name: "Iklan Toko - Promo Gudang", ad_type: "shop", status: "ongoing", dailyImpressionBase: 22000, ctrBase: 1.8, cpcBase: 500, roasBase: 1.3, bidding_mode: "gmv_max_auto", stage: 2, daily_budget: 0, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 60, endDaysAgo: null, roas_protection: true, thumbnail: { bg: "#F2994A", initials: "PG" }, diagnosis: "needs_attention" },
  { campaign_id: "cmp-1007", ad_name: "Iklan Produk - Aksesoris HP", ad_type: "product", status: "scheduled", dailyImpressionBase: 18000, ctrBase: 2.5, cpcBase: 400, roasBase: 4.4, bidding_mode: "manual", stage: 1, daily_budget: 400000, target_roas_min: 0, target_roas_max: 0, startDaysAgo: -7, endDaysAgo: null, roas_protection: false, thumbnail: { bg: "#56CCF2", initials: "AH" }, diagnosis: "none" },
  { campaign_id: "cmp-1008", ad_name: "Iklan Produk - Peralatan Dapur Set", ad_type: "product", status: "paused", dailyImpressionBase: 16000, ctrBase: 1.4, cpcBase: 1100, roasBase: 1.4, bidding_mode: "gmv_max_roas", stage: 2, daily_budget: 350000, target_roas_min: 1.5, target_roas_max: 1.5, startDaysAgo: 45, endDaysAgo: null, roas_protection: true, thumbnail: { bg: "#9B9B9B", initials: "PD" }, diagnosis: "needs_attention" },
  { campaign_id: "cmp-1009", ad_name: "Iklan Toko - Koleksi Baru", ad_type: "shop", status: "ended", dailyImpressionBase: 6000, ctrBase: 1.3, cpcBase: 750, roasBase: 2.9, bidding_mode: "manual", stage: 2, daily_budget: 250000, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 90, endDaysAgo: 5, roas_protection: false, thumbnail: { bg: "#D9534F", initials: "KB" }, diagnosis: "none" },
  { campaign_id: "cmp-1010", ad_name: "Iklan Produk - Mainan Edukasi Anak", ad_type: "product", status: "ended", dailyImpressionBase: 13000, ctrBase: 1.7, cpcBase: 650, roasBase: 3.2, bidding_mode: "manual", stage: 1, daily_budget: 300000, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 90, endDaysAgo: 5, roas_protection: false, thumbnail: { bg: "#F8C471", initials: "ME" }, diagnosis: "none" },
  { campaign_id: "cmp-1011", ad_name: "Iklan Produk - Jam Tangan Wanita", ad_type: "product", status: "deleted", dailyImpressionBase: 10000, ctrBase: 1.6, cpcBase: 900, roasBase: 4.9, bidding_mode: "manual", stage: 2, daily_budget: 0, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 120, endDaysAgo: 10, roas_protection: false, thumbnail: { bg: "#C0392B", initials: "JT" }, diagnosis: "none" },
  { campaign_id: "cmp-1012", ad_name: "Iklan Toko - Gratis Ongkir", ad_type: "shop", status: "ongoing", dailyImpressionBase: 40000, ctrBase: 1.2, cpcBase: 550, roasBase: 1.2, bidding_mode: "gmv_max_auto", stage: 2, daily_budget: 0, target_roas_min: 0, target_roas_max: 0, startDaysAgo: 60, endDaysAgo: null, roas_protection: true, thumbnail: { bg: "#27AE60", initials: "GO" }, diagnosis: "needs_attention" },
];

// mock: replace in phase 4 — per-campaign metadata (bidding, budget, ROAS targets, diagnosis)
export const shopeeAdCampaigns: ShopeeAdCampaign[] = CAMPAIGN_SEEDS.map((seed) => ({
  campaign_id: seed.campaign_id,
  ad_name: seed.ad_name,
  ad_type: seed.ad_type,
  status: seed.status,
  bidding_mode: seed.bidding_mode,
  stage: seed.stage,
  daily_budget: seed.daily_budget,
  target_roas_min: seed.target_roas_min,
  target_roas_max: seed.target_roas_max,
  start_date: dateNDaysAgo(seed.startDaysAgo),
  end_date: seed.endDaysAgo === null ? "" : dateNDaysAgo(seed.endDaysAgo),
  roas_protection: seed.roas_protection,
  thumbnail: seed.thumbnail,
  diagnosis: seed.diagnosis,
}));

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
      // No rows outside the campaign's own period: scheduled campaigns have no
      // history yet, ended ones stop at end_date.
      if (dayOffset > seed.startDaysAgo) continue;
      if (seed.endDaysAgo !== null && dayOffset < seed.endDaysAgo) continue;
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

      const add_to_cart = Math.round(clicks * (0.08 + rand() * 0.07)); // ~8-15% of clicks

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
        add_to_cart,
      });
    }
  });

  return rows;
}

// mock: replace in phase 4 — 12 campaigns x 30 days = 360 rows
export const shopeeAdsDaily: ShopeeAdDailyPerformance[] = buildRows();

export interface ShopeeAdHourlyPerformance {
  campaign_id: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  impression: number;
  clicks: number;
  expense: number; // IDR
  broad_gmv: number; // IDR
  broad_order: number;
}

// Base 24h shape: low 1-6 (dawn), peaks 11-13 (lunch) and 19-22 (evening browse).
const HOUR_PROFILE = [
  3, 1, 1, 1, 1, 1, 2, 4, 6, 7, 8, 10, 11, 10, 7, 6, 6, 7, 9, 11, 12, 11, 9, 5,
];

// ponytail: weekday tilt is a flat multiplier on the two peak windows (weekend
// evening browsing up, weekday lunch-break spike up) rather than a full 7x24
// table — good enough for mock shape; revisit if a real weekday effect is needed.
function hourWeight(weekday: number, hour: number): number {
  const isWeekend = weekday === 0 || weekday === 6; // Date#getDay(): 0=Sun..6=Sat
  let w = HOUR_PROFILE[hour];
  if (hour >= 11 && hour <= 13) w *= isWeekend ? 0.85 : 1.1;
  if (hour >= 19 && hour <= 22) w *= isWeekend ? 1.2 : 1.0;
  return w;
}

// Conversion is better in the evening and at lunch, worse at night, so GMV is
// split with a different shape than spend and hourly ROAS actually varies.
function convWeight(weekday: number, hour: number): number {
  let m = 0.6;
  if (hour >= 10 && hour <= 14) m = 1.05;
  if (hour >= 18 && hour <= 22) m = 1.35;
  if (hour >= 1 && hour <= 6) m = 0.35;
  if (weekday === 0 || weekday === 6) m *= hour >= 18 ? 1.1 : 0.95;
  return hourWeight(weekday, hour) * m;
}

// Largest-remainder split: integer buckets proportional to weights that sum
// exactly to `total` (so hourly rows always reconcile to the daily row).
function splitByWeights(total: number, weights: number[]): number[] {
  const sumW = weights.reduce((a, b) => a + b, 0);
  if (sumW <= 0 || total === 0) return weights.map(() => 0);

  const raw = weights.map((w) => (total * w) / sumW);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((a, b) => a + b, 0);

  const order = raw
    .map((v, i) => ({ i, frac: v - floors[i] }))
    .sort((a, b) => b.frac - a.frac);

  const result = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) {
    result[order[k].i] += 1;
  }
  return result;
}

function buildHourlyRows(): ShopeeAdHourlyPerformance[] {
  const rows: ShopeeAdHourlyPerformance[] = [];

  for (const day of shopeeAdsDaily) {
    const weekday = new Date(day.date).getDay();
    const weights = Array.from({ length: 24 }, (_, hour) => hourWeight(weekday, hour));

    const impressionByHour = splitByWeights(day.impression, weights);
    const clicksByHour = splitByWeights(day.clicks, weights);
    const expenseByHour = splitByWeights(day.expense, weights);
    const convWeights = Array.from({ length: 24 }, (_, hour) => convWeight(weekday, hour));
    const gmvByHour = splitByWeights(day.broad_gmv, convWeights);
    const orderByHour = splitByWeights(day.broad_order, convWeights);

    for (let hour = 0; hour < 24; hour++) {
      rows.push({
        campaign_id: day.campaign_id,
        date: day.date,
        hour,
        impression: impressionByHour[hour],
        clicks: clicksByHour[hour],
        expense: expenseByHour[hour],
        broad_gmv: gmvByHour[hour],
        broad_order: orderByHour[hour],
      });
    }
  }

  return rows;
}

// mock: replace in phase 4 — 24h split of each shopeeAdsDaily row, weekday×hour weighted
export const shopeeAdsHourly: ShopeeAdHourlyPerformance[] = buildHourlyRows();

export interface ShopeeMonthlyBudget {
  month: string; // YYYY-MM
  budget: number; // IDR
}

// mock: replace in phase 4 — budget sized so this month's actual spend lands ~85% used
export const shopeeMonthlyBudget: ShopeeMonthlyBudget = (() => {
  const month = new Date().toISOString().slice(0, 7);
  const monthExpense = shopeeAdsDaily
    .filter((r) => r.date.startsWith(month))
    .reduce((sum, r) => sum + r.expense, 0);
  return { month, budget: Math.round(monthExpense * 1.15) };
})();
