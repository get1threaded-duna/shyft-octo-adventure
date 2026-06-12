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
    <div className="bg-surface-card rounded-2xl px-4 py-4 flex flex-col gap-4">
      {/* Top row: ticker + value */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[19px] font-bold tracking-tight">{p.ticker}</span>
            {isHighConcentration && (
              <span className="text-[11px] bg-accent-yellow/15 text-accent-yellow rounded-md px-1.5 py-0.5 font-medium">
                {portfolioPct.toFixed(0)}%
              </span>
            )}
          </div>
          {p.sector && (
            <span className="text-[13px] text-gray-500">{p.sector}</span>
          )}
        </div>
        <div className="text-right flex flex-col gap-1">
          <div className="text-[19px] font-bold tabular-nums">${p.value.toFixed(2)}</div>
          <span
            className={`text-[13px] font-semibold px-2 py-0.5 rounded-md self-end ${
              isGain
                ? 'bg-accent-green/15 text-accent-green'
                : 'bg-accent-red/15 text-accent-red'
            }`}
          >
            {isGain ? '+' : ''}
            {p.gainLossPct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Shares" value={p.shares.toFixed(5)} />
        <MiniStat label="Avg Cost" value={`$${p.avgCost.toFixed(2)}`} />
        <MiniStat label="Price" value={`$${p.currentPrice.toFixed(2)}`} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onAnalyze(p)}
          className="flex-1 text-[14px] font-medium bg-surface-elevated rounded-xl py-2.5 text-accent-blue hover:opacity-80 transition-opacity"
        >
          Analysis Brief
        </button>
        <button
          onClick={() => onDelete(p.id)}
          className="text-[14px] bg-surface-elevated rounded-xl py-2.5 px-4 text-gray-600 hover:text-accent-red transition-colors"
          aria-label="Remove position"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-elevated rounded-xl px-3 py-2">
      <div className="text-[11px] text-gray-600 mb-0.5">{label}</div>
      <div className="text-[13px] font-mono font-medium text-gray-200">{value}</div>
    </div>
  )
}
