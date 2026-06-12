export interface Position {
  id: string
  ticker: string
  shares: number
  avgCost: number
  currentPrice: number
  value: number
  gainLoss: number
  gainLossPct: number
  sector?: string
}

export interface ParsedPosition {
  ticker: string
  shares: number
  avgCost: number
  currentPrice?: number
  confidence: 'high' | 'medium' | 'low'
}

export interface Portfolio {
  positions: Position[]
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPct: number
  lastRefreshed: string
}

export interface AnalysisBrief {
  ticker: string
  headline: string
  valuation: string
  volatility: string
  recentDrivers: string
  concentrationNote?: string
  footer: string
}

export interface PriceData {
  ticker: string
  price: number
  change: number
  changePct: number
}
