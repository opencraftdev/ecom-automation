// id-ID display formatters. Spec (docs/plan/phase-1-ui-demo.md):
// Rupiah "Rp 21.234.740" (no decimals) · ROAS "3,2x" (1 decimal) · Percent "1,02%" (2 decimals, fraction input).

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const roasFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const percentFormatter = new Intl.NumberFormat('id-ID', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value)
}

export function formatRoas(value: number): string {
  return `${roasFormatter.format(value)}x`
}

/** value is a ratio (0.0102 -> "1,02%"), matching Intl's percent style. */
export function formatPercent(value: number): string {
  return percentFormatter.format(value)
}
