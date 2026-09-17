// Single fetch layer over mock Shopee ads data (D-20260916-4). Swap to Edge Functions
// in phase 4 by changing only this file's data source.
// mock: replace in phase 4
import { useQuery } from '@tanstack/react-query'
import { format as formatDate, isWithinInterval, parseISO, subDays } from 'date-fns'
import { shopeeAdsDaily as dailyPerformance, type ShopeeAdDailyPerformance as DailyPerformance } from '@/mocks/shopee-ads'

export interface DateRange {
  from: Date
  to: Date
}

export type Granularity = 'day' | 'month' | 'year'

export interface AdsSummary {
  roas: number
  spend: number
  revenue: number
  orders: number
  roasDelta: number
  spendDelta: number
  revenueDelta: number
  ordersDelta: number
}

export interface DailyPoint {
  date: string
  roas: number
  expense: number
  gmv: number
}

export interface CampaignSummary {
  campaignId: string
  adName: string
  adType: DailyPerformance['ad_type']
  status: DailyPerformance['status']
  spend: number
  gmv: number
  orders: number
  roas: number
  ctr: number
  cpc: number
}

const sum = (nums: number[]) => nums.reduce((a, b) => a + b, 0)

const inRange = (rows: DailyPerformance[], range: DateRange) =>
  rows.filter((r) => isWithinInterval(parseISO(r.date), { start: range.from, end: range.to }))

function aggregate(rows: DailyPerformance[]) {
  const expense = sum(rows.map((r) => r.expense))
  const gmv = sum(rows.map((r) => r.broad_gmv))
  const orders = sum(rows.map((r) => r.broad_order))
  const impression = sum(rows.map((r) => r.impression))
  const clicks = sum(rows.map((r) => r.clicks))
  return {
    expense,
    gmv,
    orders,
    roas: expense > 0 ? gmv / expense : 0,
    ctr: impression > 0 ? clicks / impression : 0,
    cpc: clicks > 0 ? expense / clicks : 0,
  }
}

const delta = (current: number, previous: number) => (previous > 0 ? (current - previous) / previous : 0)

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function computeSummary(range: DateRange): AdsSummary {
  const current = aggregate(inRange(dailyPerformance, range))

  const currentWeekStart = subDays(range.to, 6)
  const currentWeek = aggregate(inRange(dailyPerformance, { from: currentWeekStart, to: range.to }))

  const previousWeekEnd = subDays(currentWeekStart, 1)
  const previousWeekStart = subDays(previousWeekEnd, 6)
  const previousWeek = aggregate(inRange(dailyPerformance, { from: previousWeekStart, to: previousWeekEnd }))

  return {
    roas: current.roas,
    spend: current.expense,
    revenue: current.gmv,
    orders: current.orders,
    roasDelta: delta(currentWeek.roas, previousWeek.roas),
    spendDelta: delta(currentWeek.expense, previousWeek.expense),
    revenueDelta: delta(currentWeek.gmv, previousWeek.gmv),
    ordersDelta: delta(currentWeek.orders, previousWeek.orders),
  }
}

const bucketPattern: Record<Granularity, string> = {
  day: 'yyyy-MM-dd',
  month: 'yyyy-MM',
  year: 'yyyy',
}

function computeDaily(range: DateRange, granularity: Granularity): DailyPoint[] {
  const buckets = new Map<string, DailyPerformance[]>()
  for (const row of inRange(dailyPerformance, range)) {
    const key = formatDate(parseISO(row.date), bucketPattern[granularity])
    const list = buckets.get(key) ?? []
    list.push(row)
    buckets.set(key, list)
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, rows]) => {
      const agg = aggregate(rows)
      return { date, roas: agg.roas, expense: agg.expense, gmv: agg.gmv }
    })
}

function computeCampaigns(range: DateRange): CampaignSummary[] {
  const byCampaign = new Map<string, DailyPerformance[]>()
  for (const row of inRange(dailyPerformance, range)) {
    const list = byCampaign.get(row.campaign_id) ?? []
    list.push(row)
    byCampaign.set(row.campaign_id, list)
  }
  return Array.from(byCampaign.entries()).map(([campaignId, rows]) => {
    const latest = rows.reduce((a, b) => (a.date > b.date ? a : b))
    const agg = aggregate(rows)
    return {
      campaignId,
      adName: latest.ad_name,
      adType: latest.ad_type,
      status: latest.status,
      spend: agg.expense,
      gmv: agg.gmv,
      orders: agg.orders,
      roas: agg.roas,
      ctr: agg.ctr,
      cpc: agg.cpc,
    }
  })
}

// F1.4: money-losing campaigns = ROAS < 1.5 and spend above the median spend.
function computeAttention(range: DateRange): CampaignSummary[] {
  const campaigns = computeCampaigns(range)
  const spendMedian = median(campaigns.map((c) => c.spend))
  return campaigns
    .filter((c) => c.roas < 1.5 && c.spend > spendMedian)
    .sort((a, b) => (b.spend - b.gmv) - (a.spend - a.gmv))
    .slice(0, 3)
}

const rangeKey = (range: DateRange) => [range.from.toISOString(), range.to.toISOString()]

export function useAdsSummary(range: DateRange) {
  return useQuery({
    queryKey: ['ads-summary', ...rangeKey(range)],
    queryFn: () => computeSummary(range),
  })
}

export function useAdsDaily(range: DateRange, granularity: Granularity = 'day') {
  return useQuery({
    queryKey: ['ads-daily', ...rangeKey(range), granularity],
    queryFn: () => computeDaily(range, granularity),
  })
}

export function useCampaigns(range: DateRange) {
  return useQuery({
    queryKey: ['ads-campaigns', ...rangeKey(range)],
    queryFn: () => computeCampaigns(range),
  })
}

export function useAttention(range: DateRange) {
  return useQuery({
    queryKey: ['ads-attention', ...rangeKey(range)],
    queryFn: () => computeAttention(range),
  })
}
