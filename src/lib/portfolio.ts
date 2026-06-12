import { Position, Portfolio } from '@/types'
import { getSector } from './prices'

export function buildPortfolio(positions: Position[]): Portfolio {
  const totalValue = positions.reduce((s, p) => s + p.value, 0)
  const totalCost = positions.reduce((s, p) => s + p.avgCost * p.shares, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  return {
    positions,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPct,
    lastRefreshed: new Date().toISOString(),
  }
}

export function mergePositionsWithPrices(
  positions: Omit<Position, 'value' | 'gainLoss' | 'gainLossPct'>[],
  prices: { ticker: string; price: number }[]
): Position[] {
  const priceMap = new Map(prices.map((p) => [p.ticker.toUpperCase(), p.price]))
  return positions.map((pos) => {
    const price = priceMap.get(pos.ticker.toUpperCase()) ?? pos.currentPrice
    const value = price * pos.shares
    const cost = pos.avgCost * pos.shares
    const gainLoss = value - cost
    const gainLossPct = cost > 0 ? (gainLoss / cost) * 100 : 0
    return {
      ...pos,
      currentPrice: price,
      value,
      gainLoss,
      gainLossPct,
      sector: pos.sector ?? getSector(pos.ticker),
    }
  })
}

export function concentrationRisk(positions: Position[]): {
  ticker: string
  pct: number
}[] {
  const total = positions.reduce((s, p) => s + p.value, 0)
  if (total === 0) return []
  return positions
    .map((p) => ({ ticker: p.ticker, pct: (p.value / total) * 100 }))
    .sort((a, b) => b.pct - a.pct)
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}
