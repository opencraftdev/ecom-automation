// Single fetch layer over mock Shopee ads data (D-20260916-4). Swap to Edge Functions
// in phase 4 by changing only this file's data source.
// mock: replace in phase 4
import { useQuery } from '@tanstack/react-query'
import { differenceInCalendarDays, format as formatDate, getISODay, isWithinInterval, parseISO, subDays } from 'date-fns'
import {
  shopeeAdCampaigns,
  shopeeAdsDaily as dailyPerformance,
  shopeeAdsHourly,
  shopeeMonthlyBudget,
  type ShopeeAdCampaign,
  type ShopeeAdDailyPerformance as DailyPerformance,
} from '@/mocks/shopee-ads'

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
  impressions: number
  clicks: number
  ctr: number
  cpc: number
  roasDelta: number
  spendDelta: number
  revenueDelta: number
  ordersDelta: number
  impressionsDelta: number
  clicksDelta: number
  ctrDelta: number
  cpcDelta: number
}

export interface SpendByTypeSummary {
  spend: number
  gmv: number
  roas: number
}

export interface SpendByType {
  product: SpendByTypeSummary
  shop: SpendByTypeSummary
  total: SpendByTypeSummary
}

export interface HourCell {
  weekday: number // 0 = Monday .. 6 = Sunday
  hour: number // 0-23
  roas: number
  spend: number
}

export interface BestHours {
  cells: HourCell[]
  best: Array<Pick<HourCell, 'weekday' | 'hour' | 'roas'>>
}

export interface BudgetSummary {
  month: string
  budget: number
  spent: number
  remaining: number
  usedFraction: number
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

export interface PerformanceMetrics {
  impressions: number
  clicks: number
  ctr: number
  orders: number
  itemsSold: number
  gmv: number
  expense: number
  roas: number
  profit: number // gmv - expense (gross ad profit)
}

export interface Performance {
  metrics: PerformanceMetrics
  deltas: Record<keyof PerformanceMetrics, number>
}

export interface HourlyPoint {
  hour: number
  label: string
  impressions: number
  clicks: number
  itemsSold: number
  gmv: number
  expense: number
}

export type AdVerdict = 'scale_up' | 'hold' | 'scale_down' | 'fix_listing'

export interface AdListRow extends ShopeeAdCampaign {
  clicks: number
  clicksDelta: number | null
  addToCart: number
  addToCartDelta: number | null
  expense: number
  expenseDelta: number | null
  gmv: number
  gmvDelta: number | null
  roas: number
  roasDelta: number | null
  profit: number
  ctr: number
  verdict: AdVerdict
  verdictReason: string
}

export interface AdListParams {
  range: DateRange
  tab: 'all' | 'action' | 'healthy' // action = scale_down|fix_listing, healthy = scale_up|hold
  status: 'all' | DailyPerformance['status']
  search: string
  adType: 'all' | DailyPerformance['ad_type']
  diagnosis: 'all' | 'good' | 'needs_attention'
  page: number
  pageSize: number
}

export interface AdListResult {
  rows: AdListRow[]
  total: number
  page: number
  pageSize: number
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
    impression,
    clicks,
    roas: expense > 0 ? gmv / expense : 0,
    ctr: impression > 0 ? clicks / impression : 0,
    cpc: clicks > 0 ? expense / clicks : 0,
  }
}

const delta = (current: number, previous: number) => (previous > 0 ? (current - previous) / previous : 0)
const deltaOrNull = (current: number, previous: number) => (previous > 0 ? (current - previous) / previous : null)

// Equal-length window immediately preceding `range`, for period-over-period deltas.
function previousRange(range: DateRange): DateRange {
  const length = differenceInCalendarDays(range.to, range.from) + 1
  const to = subDays(range.from, 1)
  const from = subDays(to, length - 1)
  return { from, to }
}

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
    impressions: current.impression,
    clicks: current.clicks,
    ctr: current.ctr,
    cpc: current.cpc,
    roasDelta: delta(currentWeek.roas, previousWeek.roas),
    spendDelta: delta(currentWeek.expense, previousWeek.expense),
    revenueDelta: delta(currentWeek.gmv, previousWeek.gmv),
    ordersDelta: delta(currentWeek.orders, previousWeek.orders),
    impressionsDelta: delta(currentWeek.impression, previousWeek.impression),
    clicksDelta: delta(currentWeek.clicks, previousWeek.clicks),
    ctrDelta: delta(currentWeek.ctr, previousWeek.ctr),
    cpcDelta: delta(currentWeek.cpc, previousWeek.cpc),
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

function computeSpendByType(range: DateRange): SpendByType {
  const rows = inRange(dailyPerformance, range)
  const byType = (type: DailyPerformance['ad_type']): SpendByTypeSummary => {
    const agg = aggregate(rows.filter((r) => r.ad_type === type))
    return { spend: agg.expense, gmv: agg.gmv, roas: agg.roas }
  }
  const total = aggregate(rows)
  return {
    product: byType('product'),
    shop: byType('shop'),
    total: { spend: total.expense, gmv: total.gmv, roas: total.roas },
  }
}

// Weekday x hour ROAS heatmap over shopeeAdsHourly, always the full 7x24 grid
// (cells with no matching rows in range come back as roas 0 / spend 0).
function computeBestHours(range: DateRange): BestHours {
  const cellMap = new Map<string, { spend: number; gmv: number }>()
  for (let weekday = 0; weekday < 7; weekday++) {
    for (let hour = 0; hour < 24; hour++) {
      cellMap.set(`${weekday}-${hour}`, { spend: 0, gmv: 0 })
    }
  }

  for (const row of shopeeAdsHourly) {
    const day = parseISO(row.date)
    if (!isWithinInterval(day, { start: range.from, end: range.to })) continue
    const weekday = getISODay(day) - 1 // Mon=1..Sun=7 -> Mon=0..Sun=6
    const cell = cellMap.get(`${weekday}-${row.hour}`)!
    cell.spend += row.expense
    cell.gmv += row.broad_gmv
  }

  const cells: HourCell[] = Array.from(cellMap.entries()).map(([key, { spend, gmv }]) => {
    const [weekday, hour] = key.split('-').map(Number)
    return { weekday, hour, roas: spend > 0 ? gmv / spend : 0, spend }
  })

  const best = [...cells]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 3)
    .map(({ weekday, hour, roas }) => ({ weekday, hour, roas }))

  return { cells, best }
}

function computeTopCampaigns(range: DateRange, limit: number): CampaignSummary[] {
  return computeCampaigns(range)
    .filter((c) => c.spend > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, limit)
}

function computeBudget(): BudgetSummary {
  const { month, budget } = shopeeMonthlyBudget
  const spent = sum(dailyPerformance.filter((r) => r.date.startsWith(month)).map((r) => r.expense))
  const remaining = budget - spent
  return { month, budget, spent, remaining, usedFraction: budget > 0 ? spent / budget : 0 }
}

function computePerformance(range: DateRange): Performance {
  const toMetrics = (agg: ReturnType<typeof aggregate>): PerformanceMetrics => ({
    impressions: agg.impression,
    clicks: agg.clicks,
    ctr: agg.ctr,
    orders: agg.orders,
    itemsSold: Math.round(agg.orders * 1.15),
    gmv: agg.gmv,
    expense: agg.expense,
    roas: agg.roas,
    profit: agg.gmv - agg.expense,
  })

  const metrics = toMetrics(aggregate(inRange(dailyPerformance, range)))
  const previous = toMetrics(aggregate(inRange(dailyPerformance, previousRange(range))))

  const deltas = Object.fromEntries(
    (Object.keys(metrics) as Array<keyof PerformanceMetrics>).map((key) => [key, delta(metrics[key], previous[key])]),
  ) as Record<keyof PerformanceMetrics, number>

  return { metrics, deltas }
}

function computeHourlySeries(range: DateRange): HourlyPoint[] {
  const orders = new Array(24).fill(0)
  const points: HourlyPoint[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    impressions: 0,
    clicks: 0,
    itemsSold: 0,
    gmv: 0,
    expense: 0,
  }))

  for (const row of shopeeAdsHourly) {
    if (!isWithinInterval(parseISO(row.date), { start: range.from, end: range.to })) continue
    const point = points[row.hour]
    point.impressions += row.impression
    point.clicks += row.clicks
    point.gmv += row.broad_gmv
    point.expense += row.expense
    orders[row.hour] += row.broad_order
  }
  points.forEach((point, hour) => {
    point.itemsSold = Math.round(orders[hour] * 1.15)
  })

  return points
}

const AD_LIST_STATUS_ORDER: Record<DailyPerformance['status'], number> = {
  ongoing: 0,
  scheduled: 1,
  paused: 2,
  ended: 3,
  deleted: 4,
}

function campaignRangeAgg(campaignId: string, range: DateRange) {
  const rows = inRange(dailyPerformance, range).filter((r) => r.campaign_id === campaignId)
  const clicks = sum(rows.map((r) => r.clicks))
  const impression = sum(rows.map((r) => r.impression))
  const addToCart = sum(rows.map((r) => r.add_to_cart))
  const expense = sum(rows.map((r) => r.expense))
  const gmv = sum(rows.map((r) => r.broad_gmv))
  return { clicks, addToCart, expense, gmv, roas: expense > 0 ? gmv / expense : 0, ctr: impression > 0 ? clicks / impression : 0 }
}

// F2.2 verdict rules (phase-1 plan): applied per campaign over the selected range.
function verdictFor(agg: ReturnType<typeof campaignRangeAgg>, spendMedian: number): { verdict: AdVerdict; verdictReason: string } {
  if (agg.expense === 0) return { verdict: 'hold', verdictReason: 'Belum ada pengeluaran pada periode ini.' }
  if (agg.roas < 1.5 && agg.expense > spendMedian)
    return { verdict: 'scale_down', verdictReason: `ROAS ${agg.roas.toFixed(1).replace('.', ',')}x dengan biaya di atas median. Turunkan modal atau jeda.` }
  if (agg.ctr < 0.008)
    return { verdict: 'fix_listing', verdictReason: `CTR ${(agg.ctr * 100).toFixed(2).replace('.', ',')}% rendah. Perbaiki foto, judul, atau harga.` }
  if (agg.roas > 4)
    return { verdict: 'scale_up', verdictReason: `ROAS ${agg.roas.toFixed(1).replace('.', ',')}x. Tambah modal untuk mengejar volume.` }
  return { verdict: 'hold', verdictReason: 'Performa stabil. Pertahankan pengaturan saat ini.' }
}

function computeAdList(params: AdListParams): AdListResult {
  const { range, tab, status, search, adType, diagnosis, page, pageSize } = params
  const prev = previousRange(range)
  const searchLower = search.trim().toLowerCase()

  let campaigns = [...shopeeAdCampaigns]
  if (status !== 'all') campaigns = campaigns.filter((c) => c.status === status)
  if (adType !== 'all') campaigns = campaigns.filter((c) => c.ad_type === adType)
  if (diagnosis !== 'all') campaigns = campaigns.filter((c) => c.diagnosis === diagnosis)
  if (searchLower) campaigns = campaigns.filter((c) => c.ad_name.toLowerCase().includes(searchLower))

  const spendMedian = median(shopeeAdCampaigns.map((c) => campaignRangeAgg(c.campaign_id, range).expense).filter((e) => e > 0))
  let rows: AdListRow[] = campaigns.map((c) => {
    const current = campaignRangeAgg(c.campaign_id, range)
    const previousAgg = campaignRangeAgg(c.campaign_id, prev)
    return {
      ...c,
      clicks: current.clicks,
      clicksDelta: deltaOrNull(current.clicks, previousAgg.clicks),
      addToCart: current.addToCart,
      addToCartDelta: deltaOrNull(current.addToCart, previousAgg.addToCart),
      expense: current.expense,
      expenseDelta: deltaOrNull(current.expense, previousAgg.expense),
      gmv: current.gmv,
      gmvDelta: deltaOrNull(current.gmv, previousAgg.gmv),
      roas: current.roas,
      roasDelta: deltaOrNull(current.roas, previousAgg.roas),
      profit: current.gmv - current.expense,
      ctr: current.ctr,
      ...verdictFor(current, spendMedian),
    }
  })
  if (tab === 'action') rows = rows.filter((r) => r.verdict === 'scale_down' || r.verdict === 'fix_listing')
  if (tab === 'healthy') rows = rows.filter((r) => r.verdict === 'scale_up' || r.verdict === 'hold')

  rows.sort((a, b) => {
    const statusDiff = AD_LIST_STATUS_ORDER[a.status] - AD_LIST_STATUS_ORDER[b.status]
    return statusDiff !== 0 ? statusDiff : b.expense - a.expense
  })

  const total = rows.length
  const start = (page - 1) * pageSize
  return { rows: rows.slice(start, start + pageSize), total, page, pageSize }
}

const rangeKey = (range: DateRange) => [range.from.toISOString(), range.to.toISOString()]

// mock: replace in phase 4 — simulated network latency so skeletons and the
// global loading bar actually show; Edge Functions will supply real latency.
function withLatency<T>(compute: () => T): Promise<T> {
  const ms = 450 + Math.random() * 400
  return new Promise((resolve) => setTimeout(() => resolve(compute()), ms))
}

export function useAdsSummary(range: DateRange) {
  return useQuery({
    queryKey: ['ads-summary', ...rangeKey(range)],
    queryFn: () => withLatency(() => computeSummary(range)),
  })
}

export function useAdsDaily(range: DateRange, granularity: Granularity = 'day') {
  return useQuery({
    queryKey: ['ads-daily', ...rangeKey(range), granularity],
    queryFn: () => withLatency(() => computeDaily(range, granularity)),
  })
}

export function useCampaigns(range: DateRange) {
  return useQuery({
    queryKey: ['ads-campaigns', ...rangeKey(range)],
    queryFn: () => withLatency(() => computeCampaigns(range)),
  })
}

export function useAttention(range: DateRange) {
  return useQuery({
    queryKey: ['ads-attention', ...rangeKey(range)],
    queryFn: () => withLatency(() => computeAttention(range)),
  })
}

export function useSpendByType(range: DateRange) {
  return useQuery({
    queryKey: ['ads-spend-by-type', ...rangeKey(range)],
    queryFn: () => withLatency(() => computeSpendByType(range)),
  })
}

export function useBestHours(range: DateRange) {
  return useQuery({
    queryKey: ['ads-best-hours', ...rangeKey(range)],
    queryFn: () => withLatency(() => computeBestHours(range)),
  })
}

export function useTopCampaigns(range: DateRange, limit = 5) {
  return useQuery({
    queryKey: ['ads-top-campaigns', ...rangeKey(range), limit],
    queryFn: () => withLatency(() => computeTopCampaigns(range, limit)),
  })
}

export function useBudget() {
  return useQuery({
    queryKey: ['ads-budget'],
    queryFn: () => withLatency(() => computeBudget()),
  })
}

export function usePerformance(range: DateRange) {
  return useQuery({
    queryKey: ['ads-performance', ...rangeKey(range)],
    queryFn: () => withLatency(() => computePerformance(range)),
  })
}

export function useHourlySeries(range: DateRange) {
  return useQuery({
    queryKey: ['ads-hourly-series', ...rangeKey(range)],
    queryFn: () => withLatency(() => computeHourlySeries(range)),
  })
}

export function useAdList(params: AdListParams) {
  return useQuery({
    queryKey: [
      'ads-list',
      ...rangeKey(params.range),
      params.tab,
      params.status,
      params.search,
      params.adType,
      params.diagnosis,
      params.page,
      params.pageSize,
    ],
    queryFn: () => withLatency(() => computeAdList(params)),
  })
}
