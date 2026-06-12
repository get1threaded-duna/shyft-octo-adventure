'use client'

import { useEffect, useState } from 'react'
import { Position, AnalysisBrief } from '@/types'

interface Props {
  position: Position | null
  portfolioPct: number
  onClose: () => void
}

export default function AnalysisBriefModal({ position, portfolioPct, onClose }: Props) {
  const [brief, setBrief] = useState<AnalysisBrief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!position) {
      setBrief(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    setBrief(null)

    fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker: position.ticker,
        shares: position.shares,
        avgCost: position.avgCost,
        currentPrice: position.currentPrice,
        gainLossPct: position.gainLossPct,
        portfolioPct,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setBrief(data.brief)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [position, portfolioPct])

  if (!position) return null

  const isGain = position.gainLoss >= 0

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-card border-b border-surface-border px-5 py-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold font-mono">{position.ticker}</span>
            <span
              className={`ml-3 text-sm font-mono ${isGain ? 'text-accent-green' : 'text-accent-red'}`}
            >
              {isGain ? '+' : ''}
              {position.gainLossPct.toFixed(2)}%
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Generating analysis…</span>
            </div>
          )}

          {error && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-4 text-accent-red text-sm">
              {error}
            </div>
          )}

          {brief && (
            <>
              <p className="text-white leading-relaxed">{brief.headline}</p>

              <Section title="Valuation" content={brief.valuation} />
              <Section title="Volatility" content={brief.volatility} />
              <Section title="Recent Drivers" content={brief.recentDrivers} />
              {brief.concentrationNote && (
                <Section
                  title="Concentration Risk"
                  content={brief.concentrationNote}
                  highlight
                />
              )}

              <p className="text-xs text-gray-600 border-t border-surface-border pt-4">
                {brief.footer}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  content,
  highlight,
}: {
  title: string
  content: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        highlight
          ? 'bg-accent-yellow/10 border border-accent-yellow/25'
          : 'bg-surface-elevated border border-surface-border'
      }`}
    >
      <div
        className={`text-xs font-semibold uppercase tracking-widest mb-2 ${
          highlight ? 'text-accent-yellow' : 'text-gray-500'
        }`}
      >
        {title}
      </div>
      <p className="text-sm text-gray-200 leading-relaxed">{content}</p>
    </div>
  )
}
