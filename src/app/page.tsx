'use client'

import { useCallback, useEffect, useState } from 'react'
import { Position, Portfolio } from '@/types'
import { buildPortfolio, concentrationRisk, makeId, mergePositionsWithPrices } from '@/lib/portfolio'
import AllocationDonut from '@/components/AllocationDonut'
import PositionCard from '@/components/PositionCard'
import AddSnapshot from '@/components/AddSnapshot'
import AnalysisBriefModal from '@/components/AnalysisBriefModal'

const STORAGE_KEY = 'juggernaut_positions_v1'

type StoredPosition = Omit<Position, 'value' | 'gainLoss' | 'gainLossPct'>

function loadStoredPositions(): StoredPosition[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function savePositions(positions: StoredPosition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
}

export default function Home() {
  const [rawPositions, setRawPositions] = useState<StoredPosition[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [analyzePos, setAnalyzePos] = useState<Position | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadStoredPositions()
    setRawPositions(stored)
    setHydrated(true)
  }, [])

  const refreshPrices = useCallback(
    async (positions: StoredPosition[]) => {
      if (positions.length === 0) {
        setPortfolio(buildPortfolio([]))
        return
      }
      setRefreshing(true)
      try {
        const unique = Array.from(new Set(positions.map((p) => p.ticker)))
        const tickers = unique.join(',')
        const res = await fetch(`/api/prices?tickers=${tickers}`)
        const data = await res.json()
        const prices: { ticker: string; price: number }[] = data.prices ?? []
        const full = mergePositionsWithPrices(positions, prices)
        setPortfolio(buildPortfolio(full))
        setLastRefreshed(new Date().toLocaleTimeString())
      } catch {
        // Fallback: build portfolio using stored currentPrice
        const full = mergePositionsWithPrices(positions, [])
        setPortfolio(buildPortfolio(full))
      } finally {
        setRefreshing(false)
      }
    },
    []
  )

  // Fetch prices when positions change
  useEffect(() => {
    if (!hydrated) return
    refreshPrices(rawPositions)
  }, [rawPositions, hydrated, refreshPrices])

  function handleAddPositions(
    incoming: { ticker: string; shares: number; avgCost: number; currentPrice?: number }[]
  ) {
    const newRaw: StoredPosition[] = incoming.map((p) => ({
      id: makeId(),
      ticker: p.ticker.toUpperCase(),
      shares: p.shares,
      avgCost: p.avgCost,
      currentPrice: p.currentPrice ?? 0,
    }))
    const updated = [...rawPositions, ...newRaw]
    setRawPositions(updated)
    savePositions(updated)
    setShowAdd(false)
  }

  function handleDelete(id: string) {
    const updated = rawPositions.filter((p) => p.id !== id)
    setRawPositions(updated)
    savePositions(updated)
  }

  const positions = portfolio?.positions ?? []
  const concentrations = concentrationRisk(positions)
  const concentrationMap = new Map(concentrations.map((c) => [c.ticker, c.pct]))

  const topConc = concentrations[0]
  const showConcentrationAlert = topConc && topConc.pct >= 50

  const isGain = (portfolio?.totalGainLoss ?? 0) >= 0

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-surface-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">JUGGERNAUT</h1>
          <p className="text-xs text-gray-600">Portfolio Command Center</p>
        </div>
        <button
          onClick={() => refreshPrices(rawPositions)}
          disabled={refreshing}
          className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {refreshing ? (
            <span className="w-3 h-3 border border-accent-blue/40 border-t-accent-blue rounded-full animate-spin inline-block" />
          ) : (
            '↻'
          )}
          {lastRefreshed ?? 'Refresh'}
        </button>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* Portfolio Summary */}
        {portfolio && positions.length > 0 && (
          <section className="bg-surface-card border border-surface-border rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">
                  Total Value
                </div>
                <div className="text-4xl font-bold tabular-nums">
                  ${portfolio.totalValue.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold font-mono ${
                    isGain ? 'text-accent-green' : 'text-accent-red'
                  }`}
                >
                  {isGain ? '+' : ''}
                  {portfolio.totalGainLossPct.toFixed(1)}%
                </div>
                <div
                  className={`text-sm font-mono ${
                    isGain ? 'text-accent-green/70' : 'text-accent-red/70'
                  }`}
                >
                  {isGain ? '+' : ''}${portfolio.totalGainLoss.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Invested" value={`$${portfolio.totalCost.toFixed(2)}`} />
              <Stat label="Positions" value={String(positions.length)} />
            </div>

            {showConcentrationAlert && (
              <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-accent-yellow text-lg mt-0.5">⚠</span>
                <div>
                  <div className="text-accent-yellow text-sm font-semibold">
                    {topConc.pct.toFixed(0)}% in {topConc.ticker}
                  </div>
                  <div className="text-gray-400 text-xs mt-0.5">
                    High concentration. Tap position for context.
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Allocation Donut */}
        {positions.length > 0 && (
          <section className="bg-surface-card border border-surface-border rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Allocation</div>
            <AllocationDonut positions={positions} size={180} />
          </section>
        )}

        {/* Positions */}
        {positions.length > 0 && (
          <section>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Positions</div>
            <div className="flex flex-col gap-3">
              {positions.map((pos) => (
                <PositionCard
                  key={pos.id}
                  position={pos}
                  portfolioPct={concentrationMap.get(pos.ticker) ?? 0}
                  onAnalyze={setAnalyzePos}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {positions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="text-6xl">📊</div>
            <div>
              <div className="text-xl font-semibold mb-2">Your portfolio is empty</div>
              <div className="text-gray-500 text-sm max-w-xs">
                Add positions by uploading a screenshot or entering them manually.
              </div>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 px-6 py-3 bg-accent-blue rounded-xl text-white font-semibold hover:bg-accent-blue/90 transition-colors"
            >
              Add Snapshot
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
      {positions.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-accent-blue rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-accent-blue/90 active:scale-95 transition-all z-30"
          aria-label="Add position"
        >
          +
        </button>
      )}

      {/* Modals */}
      {showAdd && (
        <AddSnapshot onConfirm={handleAddPositions} onClose={() => setShowAdd(false)} />
      )}

      {analyzePos && (
        <AnalysisBriefModal
          position={analyzePos}
          portfolioPct={concentrationMap.get(analyzePos.ticker) ?? 0}
          onClose={() => setAnalyzePos(null)}
        />
      )}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-elevated rounded-xl px-3 py-2.5">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  )
}
