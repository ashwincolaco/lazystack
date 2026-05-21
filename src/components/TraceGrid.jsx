import React, { useState } from 'react'
import T from '../data/traces.json'

const C = { blue: '#2563eb', green: '#10b981', red: '#ef4444', grey: '#cbd5e1', ink: '#0f172a', slate: '#475569', line: '#e2e8f0', amber: '#f59e0b' }
const methodColor = { LazyStack: C.blue, ABC: '#8b5cf6', 'Cost-Cascade': C.amber }
const short = (m) => m.replace('efficientnet_', 'effnet-').replace('mobilenet_v2', 'mobilenet').replace('resnet', 'rn').replace('_base', '').replace('_small', '-sm')

function MethodCell({ method, trace, active }) {
  return (
    <div style={{ flex: 1, padding: '10px 12px', borderLeft: `1px solid ${C.line}`, opacity: active ? 1 : 0.92 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: methodColor[method] }} />
        <span style={{ fontWeight: 700, fontSize: 13 }}>{method}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
          background: trace.correct ? '#d1fae5' : '#fee2e2', color: trace.correct ? '#059669' : '#b91c1c' }}>
          {trace.correct ? '✓ correct' : '✗ wrong'}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        {trace.steps.map(([m, pred, wrong], i) => (
          <React.Fragment key={i}>
            <div title={`${m} → ${pred}`} style={{
              border: `1.3px solid ${wrong ? C.red : methodColor[method]}`,
              background: wrong ? '#fef2f2' : `${methodColor[method]}14`,
              borderRadius: 7, padding: '3px 7px', fontSize: 11, lineHeight: 1.2, textAlign: 'center', minWidth: 56,
            }}>
              <div style={{ fontWeight: 600, color: C.ink }}>{short(m)}</div>
              <div style={{ color: wrong ? C.red : C.slate, fontWeight: wrong ? 700 : 500 }}>{pred}</div>
            </div>
            {i < trace.steps.length - 1 && <span style={{ color: C.grey, fontSize: 12 }}>→</span>}
          </React.Fragment>
        ))}
        <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 700, color: trace.correct ? C.green : C.red }}>exit</span>
      </div>
      <div style={{ fontSize: 11.5, color: C.slate, fontStyle: 'italic' }}>{trace.why}</div>
      <div style={{ fontSize: 11.5, color: C.ink, marginTop: 4 }}>
        <b>{trace.steps.length}</b> model{trace.steps.length > 1 ? 's' : ''} · <b className="mono">{trace.cost}</b> ms
      </div>
    </div>
  )
}

export default function TraceGrid() {
  const [open, setOpen] = useState(T.rows[1].id) // start with the hard image expanded
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {T.rows.map((row) => {
        const isOpen = open === row.id
        return (
          <div key={row.id} className="card" style={{ padding: 0, marginBottom: 14, overflow: 'hidden' }}>
            {/* input header (click to expand) */}
            <button onClick={() => setOpen(isOpen ? null : row.id)} style={{
              width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', background: isOpen ? '#f8fafc' : '#fff',
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.slate, textTransform: 'uppercase', letterSpacing: '.04em', background: '#eef2ff', padding: '2px 8px', borderRadius: 6 }}>{row.dataset}</span>
              {row.image && <img src={row.image} alt={row.true} style={{ width: 38, height: 38, borderRadius: 7, objectFit: 'cover', border: `1px solid ${C.line}` }} />}
              <span style={{ fontSize: 14, color: C.ink }}>{row.prompt}</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: C.slate }}>true: <b>{row.true}</b></span>
              <span style={{ color: C.grey, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>▸</span>
            </button>
            {isOpen && (
              <div style={{ display: 'flex', flexWrap: 'wrap', borderTop: `1px solid ${C.line}` }}>
                {T.methods.map((m) => (
                  <div key={m} style={{ flex: '1 1 250px', minWidth: 230 }}>
                    <MethodCell method={m} trace={row[m]} active={m === 'LazyStack'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
        Click any input to compare how each method routes it. Wrong predictions are shown in red.
      </p>
    </div>
  )
}
