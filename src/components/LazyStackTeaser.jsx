import React, { useEffect, useState } from 'react'

// Crisp HTML/CSS hero figure: full ensemble (run everything) vs LazyStack
// (short MDP trajectory + early exit). Material chips, animated cost bars.
const FULL = [
  ['mobilenet', 3], ['resnet18', 6], ['resnet50', 14], ['effnet-b0', 16], ['resnet101', 28], ['effnet-b3', 38],
]
const TRAJ = [['resnet50', 14], ['mobilenet', 3]]
const FULL_MS = 105, LAZY_MS = 17

const ink = '#0b1220', indigo = '#4f46e5', green = '#059669', slate = '#51607a', line = '#e6e9f2', mute = '#8a97ad'

function Chip({ name, cost, variant }) {
  const styles = {
    full:   { background: '#0b1220', color: '#fff', border: `1px solid #0b1220` },
    active: { background: indigo, color: '#fff', border: `1px solid ${indigo}`, boxShadow: '0 6px 16px -8px rgba(79,70,229,.7)' },
    skip:   { background: '#fff', color: mute, border: `1px dashed ${line}` },
  }[variant]
  return (
    <div style={{ ...styles, borderRadius: 9, padding: '7px 11px', textAlign: 'center', minWidth: 70, lineHeight: 1.15 }}>
      <div style={{ fontWeight: 700, fontSize: 12.5 }}>{name}</div>
      <div style={{ fontSize: 10.5, opacity: variant === 'skip' ? 1 : 0.82 }}>{cost} ms</div>
    </div>
  )
}
const Arrow = () => <span style={{ color: '#c2cadf', fontSize: 15, margin: '0 1px' }}>→</span>

export default function LazyStackTeaser() {
  const [grow, setGrow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setGrow(true), 250); return () => clearTimeout(t) }, [])

  const Row = ({ label, badge, badgeColor, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <div style={{ width: 104, flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: slate, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', flex: 1 }}>{children}</div>
      <div style={{ flexShrink: 0, fontWeight: 800, fontSize: 13.5, color: badgeColor }}>{badge}</div>
    </div>
  )

  return (
    <div className="card hoverable" style={{ maxWidth: 920, margin: '0 auto', padding: '26px 28px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* full ensemble */}
        <Row label="Full stacker" badge={`${FULL_MS} ms · 1×`} badgeColor={ink}>
          {FULL.map(([n, c], i) => <React.Fragment key={n}>{i > 0 && <Arrow />}<Chip name={n} cost={c} variant="full" /></React.Fragment>)}
        </Row>

        <div style={{ height: 1, background: line }} />

        {/* lazystack trajectory */}
        <Row label="LazyStack" badge={`${LAZY_MS} ms · 6× faster`} badgeColor={green}>
          {TRAJ.map(([n, c], i) => <React.Fragment key={n}>{i > 0 && <Arrow />}<Chip name={n} cost={c} variant="active" /></React.Fragment>)}
          <Arrow />
          <div style={{ background: '#ecfdf5', color: green, border: `1px solid #a7f3d0`, borderRadius: 9, padding: '7px 12px', fontWeight: 800, fontSize: 12.5 }}>exit ✓</div>
          <span style={{ marginLeft: 8, fontSize: 12.5, color: mute, fontStyle: 'italic' }}>+4 models never run</span>
        </Row>

        {/* cost comparison bars */}
        <div style={{ marginTop: 4 }}>
          {[['Full stacker', FULL_MS, '#cbd5e1', ink], ['LazyStack', LAZY_MS, indigo, indigo]].map(([lab, ms, col, txt]) => (
            <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 104, fontSize: 12, color: slate, textAlign: 'right' }}>{lab}</div>
              <div style={{ flex: 1, height: 16, background: '#f1f4fa', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: grow ? `${(ms / FULL_MS) * 100}%` : '0%', background: col, borderRadius: 6, transition: 'width .9s cubic-bezier(.22,1,.36,1)' }} />
              </div>
              <div className="mono" style={{ width: 52, fontSize: 12.5, fontWeight: 700, color: txt }}>{ms} ms</div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ margin: '18px 0 0', fontSize: 13, color: slate, textAlign: 'center' }}>
        The MDP starts with the moderately-priced <b style={{ color: ink }}>resnet50</b>, not the cheapest model — its higher confidence triggers an earlier overall exit.
      </p>
    </div>
  )
}
