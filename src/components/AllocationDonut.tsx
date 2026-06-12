'use client'

import { Position } from '@/types'

const COLORS = [
  '#4a9eff',
  '#a855f7',
  '#00d97e',
  '#ffd32a',
  '#ff4757',
  '#00c8ff',
  '#ff7f50',
  '#7fff00',
]

interface Props {
  positions: Position[]
  size?: number
}

export default function AllocationDonut({ positions, size = 160 }: Props) {
  const total = positions.reduce((s, p) => s + p.value, 0)
  if (total === 0 || positions.length === 0) return null

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const innerR = size * 0.24
  const circumference = 2 * Math.PI * r
  const gap = 2

  let cumAngle = -90

  const segments = positions.map((pos, i) => {
    const pct = pos.value / total
    const angle = pct * 360
    const startAngle = cumAngle
    cumAngle += angle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = ((startAngle + angle - gap) * Math.PI) / 180

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    const xi1 = cx + innerR * Math.cos(startRad)
    const yi1 = cy + innerR * Math.sin(startRad)
    const xi2 = cx + innerR * Math.cos(endRad)
    const yi2 = cy + innerR * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      'Z',
    ].join(' ')

    return { d, color: COLORS[i % COLORS.length], ticker: pos.ticker, pct: pct * 100 }
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg) => (
          <path
            key={seg.ticker}
            d={seg.d}
            fill={seg.color}
            className="donut-segment"
          />
        ))}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="#e8e8f0"
          fontSize={size * 0.1}
          fontWeight="700"
        >
          {positions.length}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill="#888"
          fontSize={size * 0.07}
        >
          positions
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-2">
        {segments.map((seg, i) => (
          <div key={seg.ticker} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: seg.color }}
            />
            <span className="text-gray-300 font-mono">{seg.ticker}</span>
            <span className="text-gray-500">{seg.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
