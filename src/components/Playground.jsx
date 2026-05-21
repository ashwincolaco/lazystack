import React, { useMemo, useState } from 'react'
import P from '../data/pareto.json'

const C = { blue: '#2563eb', green: '#10b981', red: '#ef4444', amber: '#f59e0b', violet: '#8b5cf6', ink: '#0f172a', slate: '#475569', line: '#e2e8f0', grey: '#cbd5e1' }
const lerp = (a, b, t) => a + (b - a) * t
const loglerp = (a, b, t) => Math.exp(lerp(Math.log(a), Math.log(b), t))
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// operating point as a function of exit threshold θ and cost-weight α
function operating(d, theta, alpha) {
  let speed, acc
  if (theta >= 0.85) {
    const t = (theta - 0.85) / (0.99 - 0.85)
    speed = loglerp(d.lazySpeed, 1, t)
    acc = lerp(d.lazyAcc, d.fullAcc, t)
  } else {
    const t = (0.85 - theta) / (0.85 - 0.5)
    speed = loglerp(d.lazySpeed, d.maxSpeed, t)
    acc = lerp(d.lazyAcc, d.accFloor, t)
  }
  speed = clamp(speed * (1 + (alpha - 0.2) * 0.6), 1, d.maxSpeed * 1.05)
  acc = clamp(acc - (alpha - 0.2) * 2.0, d.accFloor - 0.6, d.fullAcc)
  return { speed, acc }
}

export default function Playground() {
  const [ds, setDs] = useState('NSL-KDD')
  const [theta, setTheta] = useState(0.85)
  const [alpha, setAlpha] = useState(0.2)
  const d = P.datasets[ds]

  const W = 460, H = 300, pad = 46
  const xmin = 1, xmax = d.maxSpeed * 1.05
  const ymin = d.accFloor - 1, ymax = d.fullAcc + 1
  const sx = (s) => pad + (Math.log(clamp(s, xmin, xmax)) - Math.log(xmin)) / (Math.log(xmax) - Math.log(xmin)) * (W - pad - 16)
  const sy = (a) => H - pad - (a - ymin) / (ymax - ymin) * (H - pad - 16)

  const curve = useMemo(() => {
    const pts = []
    for (let th = 0.99; th >= 0.5; th -= 0.01) { const o = operating(d, th, alpha); pts.push(`${sx(o.speed).toFixed(1)},${sy(o.acc).toFixed(1)}`) }
    return pts.join(' ')
  }, [ds, alpha])

  const op = operating(d, theta, alpha)
  const retention = (op.acc / d.fullAcc) * 100
  const ticks = ds === 'NSL-KDD' ? [1, 5, 10, 20, 40, 65] : ds === 'MMLU' ? [1, 2, 4, 8, 17] : [1, 1.5, 2, 2.5, 3.7]

  return (
    <div className="card" style={{ maxWidth: 940, margin: '0 auto' }}>
      <div className="controls" style={{ marginTop: 0, marginBottom: 16 }}>
        <div className="toggle">
          {Object.keys(P.datasets).map((k) => (
            <button key={k} className={ds === k ? 'active' : ''} onClick={() => setDs(k)}>{k}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pareto plot */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 460, maxWidth: '100%' }}>
          <line x1={pad} y1={H - pad} x2={W - 16} y2={H - pad} stroke={C.line} />
          <line x1={pad} y1={16} x2={pad} y2={H - pad} stroke={C.line} />
          {ticks.map((t) => (
            <g key={t}><line x1={sx(t)} y1={H - pad} x2={sx(t)} y2={H - pad + 4} stroke={C.grey} />
              <text x={sx(t)} y={H - pad + 15} fontSize="9" fill={C.slate} textAnchor="middle">{t}×</text></g>
          ))}
          {[ymin + 1, (ymin + ymax) / 2, ymax - 1].map((a) => (
            <g key={a}><text x={pad - 6} y={sy(a) + 3} fontSize="9" fill={C.slate} textAnchor="end">{a.toFixed(0)}</text></g>
          ))}
          <text x={(W + pad) / 2} y={H - 6} fontSize="10" fill={C.slate} textAnchor="middle">speedup (log)</text>
          <text x={14} y={H / 2} fontSize="10" fill={C.slate} textAnchor="middle" transform={`rotate(-90 14 ${H / 2})`}>accuracy %</text>

          {/* LazyStack frontier */}
          <polyline points={curve} fill="none" stroke={C.blue} strokeWidth={2.4} />
          {/* full ensemble + ABC markers */}
          <circle cx={sx(1)} cy={sy(d.fullAcc)} r={5} fill="#fff" stroke={C.slate} strokeWidth={2} />
          <text x={sx(1) + 8} y={sy(d.fullAcc) - 6} fontSize="9.5" fill={C.slate}>full ensemble</text>
          <circle cx={sx(d.abc.speed)} cy={sy(d.abc.acc)} r={5} fill={C.violet} />
          <text x={sx(d.abc.speed) + 8} y={sy(d.abc.acc) + 12} fontSize="9.5" fill={C.violet}>ABC</text>
          {/* live operating dot */}
          <circle cx={sx(op.speed)} cy={sy(op.acc)} r={8} fill={retention >= 97 ? C.green : C.blue} stroke="#fff" strokeWidth={2} />
        </svg>

        {/* readouts + sliders */}
        <div style={{ minWidth: 260, flex: '1 1 260px' }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            <Readout label="speedup" value={`${op.speed.toFixed(1)}×`} color={C.blue} />
            <Readout label="accuracy" value={`${op.acc.toFixed(1)}%`} color={C.ink} />
            <Readout label="retention" value={`${retention.toFixed(1)}%`} color={retention >= 97 ? C.green : C.amber} />
          </div>
          <Slider label="exit threshold θ" value={theta} min={0.5} max={0.99} step={0.01} onChange={setTheta}
            hint={theta >= 0.85 ? 'higher θ → run more models, more accurate, slower' : 'lower θ → exit sooner, faster, slightly less accurate'} />
          <Slider label="cost weight α" value={alpha} min={0.05} max={0.5} step={0.01} onChange={setAlpha}
            hint="higher α → MDP favors earlier exits (more speedup, slight accuracy cost)" />
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
            LazyStack traces a frontier (blue) that dominates ABC (purple): at matched accuracy it is faster, and at matched speed it is more accurate.
          </p>
        </div>
      </div>
    </div>
  )
}

function Readout({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    </div>
  )
}
function Slider({ label, value, min, max, step, onChange, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        <span>{label}</span><span className="mono" style={{ color: '#2563eb' }}>{value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#2563eb' }} />
      <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{hint}</div>
    </div>
  )
}
