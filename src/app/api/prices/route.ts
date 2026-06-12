import { NextRequest, NextResponse } from 'next/server'
import { fetchPrices } from '@/lib/prices'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tickersParam = searchParams.get('tickers') ?? ''
  const tickers = tickersParam
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)

  if (tickers.length === 0) {
    return NextResponse.json({ prices: [] })
  }

  const prices = await fetchPrices(tickers)
  return NextResponse.json({ prices }, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
