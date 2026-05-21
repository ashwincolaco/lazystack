import React, { useState } from 'react'
import L from '../data/landscape_data.json'

const C = { blue: '#2563eb', green: '#10b981', grey: '#cbd5e1', ink: '#0f172a', slate: '#475569', line: '#e2e8f0', band: '#bfdbfe' }
const short = (m) => m.replace('efficientnet_', 'effnet-').replace('mobilenet_v2', 'mobilenet').replace('resnet', 'rn')

export default function TrajectorySankey() {
  const [hi, setHi] = useState(-1) // highlighted exit depth
  const path = L.dominant_trajectories[0].path // representative model order
  const dist = L.exit_depth_distribution     // {2:41,3:28,...}
  const W = 940, H = 320, top = 60, nodeY = top, laneH = 120
  const n = path.length
  const colW = (W - 120) / n
  const x = (i) => 80 + i * colW + colW / 2

  // remaining fraction entering each node (min 2 models before any exit)
  let remaining = 100
  const enter = [], exitAt = []
  for (let k = 1; k <= n; k++) {
    enter.push(remaining)
    const e = dist[k] || 0
    exitAt.push(e)
    remaining -= e
  }
  const maxBand = 100
  const bandH = (pct) => Math.max(2, (pct / maxBand) * laneH)

  return (
    <div className="card" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
        {/* input label */}
        <text x={30} y={nodeY + 6} fontSize="11" fill={C.slate}>inputs</text>
        <text x={30} y={nodeY + 20} fontSize="11" fill={C.slate}>100%</text>

        {/* running bands between nodes */}
        {path.map((m, i) => {
          const pct = enter[i]
          const h = bandH(pct)
          const x0 = i === 0 ? 70 : x(i - 1)
          const w = x(i) - x0
          const active = hi === -1 || hi >= i + 1
          return (
            <rect key={`band${i}`} x={x0} y={nodeY - h / 2} width={w} height={h} fill={C.band}
              opacity={active ? 0.8 : 0.25} />
          )
        })}

        {/* nodes + exit drop-offs */}
        {path.map((m, i) => {
          const e = exitAt[i]
          const showExit = e > 0
          return (
            <g key={m}>
              {/* node */}
              <rect x={x(i) - 34} y={nodeY - 16} width={68} height={32} rx={7}
                fill={C.blue} opacity={hi === -1 || hi >= i + 1 ? 1 : 0.4} />
              <text x={x(i)} y={nodeY + 4} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#fff">{short(m)}</text>
              <text x={x(i)} y={nodeY - 24} textAnchor="middle" fontSize="9" fill={C.slate}>M{i + 1}</text>

              {/* exit branch downward */}
              {showExit && (
                <g onMouseEnter={() => setHi(i + 1)} onMouseLeave={() => setHi(-1)} style={{ cursor: 'default' }}>
                  <rect x={x(i) - bandH(e) / 2} y={nodeY + 18} width={bandH(e)} height={70 + i * 10}
                    fill={C.green} opacity={hi === -1 || hi === i + 1 ? 0.85 : 0.3} rx={2} />
                  <circle cx={x(i)} cy={nodeY + 92 + i * 10} r={13} fill={C.green} />
                  <text x={x(i)} y={nodeY + 96 + i * 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">✓</text>
                  <text x={x(i)} y={nodeY + 118 + i * 10} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.green}>{e}%</text>
                  <text x={x(i)} y={nodeY + 131 + i * 10} textAnchor="middle" fontSize="9" fill={C.slate}>exit @ {i + 1}</text>
                </g>
              )}
              {/* animated flow dot */}
              {i < n - 1 && (
                <circle r={3} fill={C.ink} opacity={0.5}>
                  <animateMotion dur={`${2 + i * 0.3}s`} repeatCount="indefinite"
                    path={`M ${x(i)} ${nodeY} L ${x(i + 1)} ${nodeY}`} begin={`${i * 0.4}s`} />
                </circle>
              )}
            </g>
          )
        })}
      </svg>
      <p style={{ textAlign: 'center', color: C.slate, fontSize: 13, marginTop: 6 }}>
        {L.dominant_trajectories.length} trajectories cover {L.dominant_trajectories.reduce((a, t) => a + t.coverage, 0)}% of inputs ·
        most exit after 2–3 models · hover an exit to highlight. <span style={{ color: '#94a3b8' }}>(CIFAR-100, illustrative)</span>
      </p>
    </div>
  )
}
