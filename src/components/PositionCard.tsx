'use client'

import { Position } from '@/types'

interface Props {
  position: Position
  portfolioPct: number
  onAnalyze: (position: Position) => void
  onDelete: (id: string) => void
}

export default function PositionCard({ position: p, portfolioPct, onAnalyze, onDelete }: Props) {
  const isGain = p.gainLoss >= 0
  const isHighConcentration = portfolioPct >= 25

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono tracking-wide">{p.ticker}</span>
            {isHighConcentration && (
              <span className="text-xs bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30 rounded px-1.5 py-0.5">
                {portfolioPct.toFixed(0)}% conc.
              </span>
            )}
          </div>
          {p.sector && (
            <span className="text-xs text-gray-500">{p.sector}</span>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">${p.value.toFixed(2)}</div>
          <div
            className={`text-sm font-mono ${isGain ? 'text-accent-green' : 'text-accent-red'}`}
          >
            {isGain ? '+' : ''}
            {p.gainLossPct.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-500 mb-0.5">Shares</div>
          <div className="font-mono">{p.shares.toFixed(5)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Avg Cost</div>
          <div className="font-mono">${p.avgCost.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Price</div>
          <div className="font-mono">${p.currentPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onAnalyze(p)}
          className="flex-1 text-xs bg-surface-elevated border border-surface-border rounded-lg py-2 px-3 text-gray-300 hover:text-white hover:border-accent-blue/50 transition-colors"
        >
          Analysis Brief
        </button>
        <button
          onClick={() => onDelete(p.id)}
          className="text-xs bg-surface-elevated border border-surface-border rounded-lg py-2 px-3 text-gray-500 hover:text-accent-red hover:border-accent-red/30 transition-colors"
          aria-label="Remove position"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
