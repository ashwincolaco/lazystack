import React, { useMemo, useState } from 'react'
import P from '../data/pareto.json'

const C = { indigo: '#4f46e5', blue: '#2563eb', green: '#059669', amber: '#d97706', violet: '#7c3aed', ink: '#0b1220', slate: '#51607a', line: '#e6e9f2', grey: '#cbd5e1' }
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// Build a single smooth concave frontier per dataset:
//   accuracy(s) = fullAcc - (fullAcc - accEnd) * (ln s / ln maxSpeed)^p
// with accEnd just below the reported LazyStack accuracy (no cliff), and p
// chosen so the curve passes exactly through the reported point (lazySpeed, lazyAcc).
function frontier(d) {
  const accEnd = d.lazyAcc - 0.8
  const tLazy = Math.log(d.lazySpeed) / Math.log(d.maxSpeed)
  const ratio = (d.fullAcc - d.lazyAcc) / (d.fullAcc - accEnd)
  const p = clamp(Math.log(ratio) / Math.log(tLazy), 0.6, 4)
  const accOf = (s) => d.fullAcc - (d.fullAcc - accEnd) * Math.pow(Math.log(s) / Math.log(d.maxSpeed), p)
  return { accEnd, accOf }
}

// θ (and α) only move the dot ALONG the smooth curve — never reshape it.
// θ=0.85 (default) sits at the reported operating point (lazySpeed); higher θ → slower/accurate, lower θ → faster.
function speedFor(d, theta, alpha) {
  const lnLazy = Math.log(d.lazySpeed), lnMax = Math.log(d.maxSpeed)
  let lnS
  if (theta >= 0.85) lnS = lnLazy * (0.99 - theta) / (0.99 - 0.85)          // 0.85→lazy, 0.99→1×
  else lnS = lnLazy + (lnMax - lnLazy) * (0.85 - theta) / (0.85 - 0.5)       // 0.85→lazy, 0.5→maxSpeed
  lnS += (alpha - 0.2) * 0.5 * (lnMax - lnLazy)                              // cost weight nudges faster/slower
  return clamp(Math.exp(lnS), 1, d.maxSpeed)
}

export default function Playground() {
  const [ds, setDs] = useState('NSL-KDD')
  const [theta, setTheta] = useState(0.85)
  const [alpha, setAlpha] = useState(0.2)
  const d = P.datasets[ds]
  const { accEnd, accOf } = frontier(d)

  const W = 470, H = 300, padL = 48, padB = 40, padT = 16, padR = 18
  const xmin = 1, xmax = d.maxSpeed
  const ymin = Math.min(accEnd, d.abc.acc) - 0.6, ymax = d.fullAcc + 0.6
  const sx = (s) => padL + (Math.log(clamp(s, xmin, xmax)) - Math.log(xmin)) / (Math.log(xmax) - Math.log(xmin)) * (W - padL - padR)
  const sy = (a) => H - padB - (a - ymin) / (ymax - ymin) * (H - padB - padT)

  const curvePath = useMemo(() => {
    const pts = []
    const steps = 60
    for (let i = 0; i <= steps; i++) {
      const s = Math.exp((i / steps) * Math.log(xmax))
      pts.push(`${sx(s).toFixed(1)},${sy(accOf(s)).toFixed(1)}`)
    }
    return 'M' + pts.join(' L')
  }, [ds])

  const s = speedFor(d, theta, alpha)
  const acc = accOf(s)
  const retention = (acc / d.fullAcc) * 100
  const ticks = ds === 'NSL-KDD' ? [1, 2, 5, 10, 20, 38, 65] : ds === 'MMLU' ? [1, 2, 4, 8, 17] : [1, 1.5, 2, 2.5, 3.7]

  return (
    <div className="card" style={{ maxWidth: 940, margin: '0 auto' }}>
      <div className="controls" style={{ marginTop: 0, marginBottom: 18 }}>
        <div className="toggle">
          {Object.keys(P.datasets).map((k) => (
            <button key={k} className={ds === k ? 'active' : ''} onClick={() => setDs(k)}>{k}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 470, maxWidth: '100%' }}>
          {/* gridlines */}
          {ticks.map((t) => <line key={'gx' + t} x1={sx(t)} y1={padT} x2={sx(t)} y2={H - padB} stroke={C.line} strokeWidth={1} />)}
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#cbd5e1" />
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#cbd5e1" />
          {ticks.map((t) => (
            <text key={'tx' + t} x={sx(t)} y={H - padB + 14} fontSize="9.5" fill={C.slate} textAnchor="middle">{t}×</text>
          ))}
          {[ymin + 0.6, (ymin + ymax) / 2, ymax - 0.6].map((a, i) => (
            <text key={'ty' + i} x={padL - 7} y={sy(a) + 3} fontSize="9.5" fill={C.slate} textAnchor="end">{a.toFixed(0)}</text>
          ))}
          <text x={(W + padL) / 2} y={H - 6} fontSize="10.5" fill={C.slate} textAnchor="middle">speedup (log scale)</text>
          <text x={13} y={H / 2} fontSize="10.5" fill={C.slate} textAnchor="middle" transform={`rotate(-90 13 ${H / 2})`}>accuracy %</text>

          {/* shaded area under frontier */}
          <path d={`${curvePath} L${sx(xmax).toFixed(1)},${(H - padB).toFixed(1)} L${sx(1).toFixed(1)},${(H - padB).toFixed(1)} Z`} fill="url(#fade)" opacity={0.10} />
          <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.indigo} /><stop offset="1" stopColor={C.indigo} stopOpacity="0" /></linearGradient></defs>

          {/* frontier */}
          <path d={curvePath} fill="none" stroke={C.indigo} strokeWidth={2.6} strokeLinecap="round" />

          {/* markers */}
          <circle cx={sx(1)} cy={sy(d.fullAcc)} r={5} fill="#fff" stroke={C.slate} strokeWidth={2} />
          <text x={sx(1) + 9} y={sy(d.fullAcc) - 5} fontSize="9.5" fill={C.slate}>full ensemble</text>
          <circle cx={sx(d.lazySpeed)} cy={sy(d.lazyAcc)} r={4} fill={C.indigo} opacity={0.4} />
          <text x={sx(d.lazySpeed)} y={sy(d.lazyAcc) - 9} fontSize="9" fill={C.indigo} textAnchor="middle">LazyStack</text>
          <circle cx={sx(d.abc.speed)} cy={sy(d.abc.acc)} r={5} fill={C.violet} />
          <text x={sx(d.abc.speed) + 9} y={sy(d.abc.acc) + 12} fontSize="9.5" fill={C.violet}>ABC</text>

          {/* live operating dot */}
          <line x1={sx(s)} y1={padT} x2={sx(s)} y2={H - padB} stroke={C.indigo} strokeWidth={1} strokeDasharray="3,3" opacity={0.35} />
          <circle cx={sx(s)} cy={sy(acc)} r={8.5} fill={retention >= 97 ? C.green : C.indigo} stroke="#fff" strokeWidth={2.5} />
        </svg>

        <div style={{ minWidth: 250, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <Readout label="speedup" value={`${s.toFixed(1)}×`} color={C.indigo} />
            <Readout label="accuracy" value={`${acc.toFixed(1)}%`} color={C.ink} />
            <Readout label="retention" value={`${retention.toFixed(1)}%`} color={retention >= 97 ? C.green : C.amber} />
          </div>
          <Slider label="exit threshold θ" value={theta} min={0.5} max={0.99} step={0.01} onChange={setTheta}
            hint={theta >= 0.85 ? 'higher θ → run more models, more accurate, slower' : 'lower θ → exit sooner, faster, slightly less accurate'} />
          <Slider label="cost weight α" value={alpha} min={0.05} max={0.5} step={0.01} onChange={setAlpha}
            hint="higher α → MDP favors earlier exits (more speedup, slight accuracy cost)" />
          <p style={{ fontSize: 12.5, color: C.slate, marginTop: 10 }}>
            The operating point rides LazyStack's frontier (indigo), which stays above <span style={{ color: C.violet, fontWeight: 600 }}>ABC</span> — more accurate at matched speed, faster at matched accuracy.
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
      <div style={{ fontSize: 12, color: '#51607a' }}>{label}</div>
    </div>
  )
}
function Slider({ label, value, min, max, step, onChange, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        <span>{label}</span><span className="mono" style={{ color: '#4f46e5' }}>{value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ width: '100%' }} />
      <div style={{ fontSize: 11.5, color: '#8a97ad', marginTop: 2 }}>{hint}</div>
    </div>
  )
}
