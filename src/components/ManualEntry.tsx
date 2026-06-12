'use client'

import { useState } from 'react'

interface FormState {
  ticker: string
  shares: string
  avgCost: string
}

interface Props {
  onAdd: (ticker: string, shares: number, avgCost: number) => void
  onCancel: () => void
}

export default function ManualEntry({ onAdd, onCancel }: Props) {
  const [form, setForm] = useState<FormState>({ ticker: '', shares: '', avgCost: '' })
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ticker = form.ticker.trim().toUpperCase()
    const shares = parseFloat(form.shares)
    const avgCost = parseFloat(form.avgCost)

    if (!ticker) return setError('Ticker is required')
    if (isNaN(shares) || shares <= 0) return setError('Enter a valid number of shares')
    if (isNaN(avgCost) || avgCost <= 0) return setError('Enter a valid average cost')

    setError(null)
    onAdd(ticker, shares, avgCost)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3">
        <Field
          label="Ticker"
          placeholder="e.g. NVDA"
          value={form.ticker}
          onChange={(v) => setForm((f) => ({ ...f, ticker: v }))}
          className="uppercase"
        />
        <Field
          label="Shares"
          placeholder="e.g. 0.17393"
          value={form.shares}
          onChange={(v) => setForm((f) => ({ ...f, shares: v }))}
          inputMode="decimal"
        />
        <Field
          label="Avg Cost per Share ($)"
          placeholder="e.g. 114.99"
          value={form.avgCost}
          onChange={(v) => setForm((f) => ({ ...f, avgCost: v }))}
          inputMode="decimal"
        />
      </div>

      {error && <p className="text-accent-red text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-surface-border text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-accent-blue text-white font-semibold hover:bg-accent-blue/90 transition-colors"
        >
          Add Position
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  inputMode,
  className,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  className?: string
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <input
        type="text"
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-accent-blue/60 transition-colors ${className ?? ''}`}
      />
    </div>
  )
}
