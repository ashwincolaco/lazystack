import React, { useState } from 'react'
import L from '../data/landscape_data.json'

const C = { blue: '#2563eb', green: '#10b981', grey: '#cbd5e1', slate: '#475569', line: '#e2e8f0', red: '#ef4444' }

const short = (m) => m.replace('efficientnet_', 'effnet-').replace('mobilenet_v2', 'mobilenet').replace('resnet', 'rn')

export default function TrajectoryLandscape() {
  const [hover, setHover] = useState(-1)
  const trajs = L.dominant_trajectories
  const rows = [...trajs.map((t) => ({ label: t.path.slice(0, 3).map(short).join(' → ') + ' → …', cov: t.coverage, dom: true })),
                { label: 'all other paths', cov: L.tail_coverage, dom: false }]
  const dom = trajs.reduce((a, t) => a + t.coverage, 0)
  const dist = L.exit_depth_distribution
  const ks = Object.keys(dist).map(Number).sort((a, b) => a - b)
  const maxV = Math.max(...ks.map((k) => dist[k]))
  const meanDepth = ks.reduce((a, k) => a + k * dist[k], 0) / 100

  return (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 980, margin: '0 auto' }}>
      {/* trajectory coverage */}
      <div className="card" style={{ flex: '1 1 420px', minWidth: 320 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.blue, marginBottom: 6 }}>① Few trajectories → linear training</div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{trajs.length} trajectories cover {dom}% of samples</div>
        <div style={{ color: C.slate, fontSize: 13, marginBottom: 14 }}>out of 2⁶ = 64 possible paths, so we train substackers for a handful of paths, not all combinations</div>
        {rows.map((r, i) => (
          <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, cursor: 'default' }}>
            <div className="mono" style={{ width: 168, fontSize: 11.5, color: C.slate, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
            <div style={{ flex: 1, height: 22, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ width: `${r.cov / 0.4}%`, height: '100%', background: r.dom ? C.blue : C.grey,
                opacity: hover === -1 || hover === i ? 1 : 0.5, transition: 'opacity .15s, width .5s' }} />
            </div>
            <div style={{ width: 34, fontSize: 13, fontWeight: 600 }}>{r.cov}%</div>
          </div>
        ))}
      </div>

      {/* exit depth distribution */}
      <div className="card" style={{ flex: '1 1 360px', minWidth: 300 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.green, marginBottom: 6 }}>② Shallow exits → big speedup</div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Most samples exit after 2–3 models</div>
        <div style={{ color: C.slate, fontSize: 13, marginBottom: 14 }}>how many models run before the substacker is confident (full ensemble = 6)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 150, paddingLeft: 6 }}>
          {ks.map((k) => (
            <div key={k} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.slate }}>{dist[k]}%</div>
              <div title={`${dist[k]}% exit after ${k} models`}
                style={{ height: `${(dist[k] / maxV) * 110}px`, background: k < L.n_models ? C.green : C.grey, borderRadius: '5px 5px 0 0', transition: 'height .5s' }} />
              <div style={{ fontSize: 12, marginTop: 4 }}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', color: C.red, fontSize: 12.5, marginTop: 8 }}>mean {meanDepth.toFixed(1)} models / input</div>
      </div>
    </div>
  )
}
