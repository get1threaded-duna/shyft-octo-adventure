'use client'

import { useRef, useState } from 'react'
import { ParsedPosition } from '@/types'
import ManualEntry from './ManualEntry'

type Mode = 'choose' | 'uploading' | 'confirm' | 'manual'

interface Props {
  onConfirm: (positions: { ticker: string; shares: number; avgCost: number; currentPrice?: number }[]) => void
  onClose: () => void
}

export default function AddSnapshot({ onConfirm, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('choose')
  const [parsed, setParsed] = useState<ParsedPosition[]>([])
  const [edits, setEdits] = useState<ParsedPosition[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setMode('uploading')
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/parse-screenshot', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const positions: ParsedPosition[] = data.positions
      setParsed(positions)
      setEdits(positions.map((p) => ({ ...p })))
      setMode('confirm')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
      setMode('choose')
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function updateEdit(idx: number, field: keyof ParsedPosition, value: string | number) {
    setEdits((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  function handleConfirm() {
    const valid = edits.filter((p) => p.ticker && p.shares > 0 && p.avgCost > 0)
    onConfirm(valid)
  }

  function handleManualAdd(ticker: string, shares: number, avgCost: number) {
    onConfirm([{ ticker, shares, avgCost }])
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-card border-b border-surface-border px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Positions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-5">
          {mode === 'choose' && (
            <div className="flex flex-col gap-4">
              {error && (
                <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-3 text-accent-red text-sm">
                  {error}
                </div>
              )}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-surface-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent-blue/50 hover:bg-surface-elevated/50 transition-all"
              >
                <div className="text-4xl mb-3">📸</div>
                <div className="text-white font-medium mb-1">Upload Screenshot</div>
                <div className="text-gray-500 text-sm">
                  Drop a Cash App investing screenshot here, or tap to choose
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
              </div>
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-gray-600 text-xs">or</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>
              <button
                onClick={() => setMode('manual')}
                className="w-full py-3 rounded-xl border border-surface-border text-gray-300 hover:text-white hover:border-accent-blue/40 transition-colors text-sm"
              >
                Enter manually
              </button>
            </div>
          )}

          {mode === 'uploading' && (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-10 h-10 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
              <span className="text-gray-400">Parsing screenshot…</span>
            </div>
          )}

          {mode === 'confirm' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-400">
                Claude found {edits.length} position{edits.length !== 1 ? 's' : ''}. Review and
                edit before adding.
              </p>
              {edits.map((p, i) => (
                <div
                  key={i}
                  className="bg-surface-elevated border border-surface-border rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{p.ticker}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        p.confidence === 'high'
                          ? 'bg-accent-green/15 text-accent-green'
                          : p.confidence === 'medium'
                          ? 'bg-accent-yellow/15 text-accent-yellow'
                          : 'bg-accent-red/15 text-accent-red'
                      }`}
                    >
                      {p.confidence} confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <EditField
                      label="Shares"
                      value={String(p.shares)}
                      onChange={(v) => updateEdit(i, 'shares', parseFloat(v) || 0)}
                    />
                    <EditField
                      label="Avg Cost ($)"
                      value={String(p.avgCost)}
                      onChange={(v) => updateEdit(i, 'avgCost', parseFloat(v) || 0)}
                    />
                  </div>
                </div>
              ))}
              {edits.length === 0 && (
                <p className="text-gray-500 text-sm">No positions were detected.</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMode('choose')}
                  className="flex-1 py-3 rounded-xl border border-surface-border text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={edits.length === 0}
                  className="flex-1 py-3 rounded-xl bg-accent-blue text-white font-semibold disabled:opacity-40 hover:bg-accent-blue/90 transition-colors"
                >
                  Add {edits.length} Position{edits.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {mode === 'manual' && (
            <ManualEntry onAdd={handleManualAdd} onCancel={() => setMode('choose')} />
          )}
        </div>
      </div>
    </div>
  )
}

function EditField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-accent-blue/60 transition-colors"
      />
    </div>
  )
}
