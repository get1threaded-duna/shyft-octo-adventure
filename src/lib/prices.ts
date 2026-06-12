import { PriceData } from '@/types'

const SECTOR_MAP: Record<string, string> = {
  NVDA: 'Technology',
  VDE: 'Energy',
  XLK: 'Technology',
  AAPL: 'Technology',
  MSFT: 'Technology',
  GOOGL: 'Technology',
  AMZN: 'Consumer',
  META: 'Technology',
  TSLA: 'Consumer',
  SPY: 'Broad Market',
  QQQ: 'Technology',
  XLE: 'Energy',
  XLF: 'Financials',
  XLV: 'Healthcare',
  GLD: 'Commodities',
}

export function getSector(ticker: string): string {
  return SECTOR_MAP[ticker.toUpperCase()] ?? 'Other'
}

export async function fetchPrices(tickers: string[]): Promise<PriceData[]> {
  if (tickers.length === 0) return []

  const results: PriceData[] = []

  await Promise.allSettled(
    tickers.map(async (ticker) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 300 },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        const meta = json?.chart?.result?.[0]?.meta
        if (!meta) throw new Error('No meta')
        const price = meta.regularMarketPrice ?? meta.previousClose
        const prevClose = meta.previousClose ?? price
        const change = price - prevClose
        const changePct = prevClose ? (change / prevClose) * 100 : 0
        results.push({ ticker: ticker.toUpperCase(), price, change, changePct })
      } catch {
        // silently skip failed tickers — UI handles missing prices
      }
    })
  )

  return results
}
