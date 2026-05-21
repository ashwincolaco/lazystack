import React, { useEffect, useRef, useState } from 'react'

const THETA = 0.85
const C = { blue: '#2563eb', green: '#10b981', amber: '#f59e0b', ink: '#0f172a', slate: '#475569', line: '#e2e8f0', grey: '#cbd5e1', red: '#ef4444' }

// Same CIFAR-100 input, two orderings (curated, costs from the codebase).
const ORDERINGS = {
  'Cheapest-first': {
    steps: [
      ['mobilenet_v2', 3, 0.52], ['resnet18', 6, 0.61], ['resnet50', 14, 0.70],
      ['efficientnet_b0', 16, 0.79], ['resnet101', 28, 0.87],
    ],
    note: 'Cheap models are individually unsure, so the cascade keeps going — five models before confidence crosses θ.',
  },
  'MDP ordering': {
    steps: [['resnet50', 14, 0.73], ['mobilenet_v2', 3, 0.91]],
    note: 'The MDP starts with the moderately-priced resnet50; its higher confidence lets the cascade exit after just two models.',
  },
}
const totalCost = (o) => ORDERINGS[o].steps.reduce((a, s) => a + s[1], 0)

export default function OrderingToggle() {
  const [mode, setMode] = useState('MDP ordering')
  const [step, setStep] = useState(0)
  const timer = useRef(null)
  const steps = ORDERINGS[mode].steps

  useEffect(() => {
    setStep(0)
    let i = 0
    timer.current = setInterval(() => { i += 1; setStep(i); if (i >= steps.length) clearInterval(timer.current) }, 900)
    return () => clearInterval(timer.current)
  }, [mode])

  const shown = steps.slice(0, step)
  const cost = shown.reduce((a, s) => a + s[1], 0)
  const done = step >= steps.length

  return (
    <div className="card" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="controls" style={{ marginTop: 0, marginBottom: 8 }}>
        <div className="toggle">
          {Object.keys(ORDERINGS).map((k) => (
            <button key={k} className={mode === k ? 'active' : ''} onClick={() => setMode(k)}>{k}</button>
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'center', color: C.slate, fontSize: 13, margin: '4px 0 16px' }}>
        Same input (a <i>sunflower</i>). {ORDERINGS[mode].note}
      </p>

      {/* model chain */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', minHeight: 70 }}>
        {steps.map(([m, c, conf], i) => {
          const on = i < step
          const isExit = done && i === steps.length - 1
          return (
            <React.Fragment key={i}>
              <div style={{
                borderRadius: 9, padding: '8px 10px', textAlign: 'center', minWidth: 84, transition: 'all .4s',
                border: `1.5px solid ${isExit ? C.green : on ? C.blue : C.line}`,
                background: isExit ? C.green : on ? C.blue : '#fff', color: on || isExit ? '#fff' : C.grey, opacity: on ? 1 : 0.5,
              }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>{m.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: 10.5, opacity: 0.85 }}>{c} ms</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{on ? conf.toFixed(2) : ''}</div>
              </div>
              {i < steps.length - 1 && <span style={{ color: C.grey }}>→</span>}
            </React.Fragment>
          )
        })}
      </div>

      {/* summary comparison */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
        {Object.keys(ORDERINGS).map((k) => {
          const active = k === mode
          return (
            <div key={k} style={{ textAlign: 'center', padding: '10px 18px', borderRadius: 12, border: `1.5px solid ${active ? C.blue : C.line}`, background: active ? '#eff6ff' : '#fff' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.slate }}>{k}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: active ? C.blue : C.ink }}>{totalCost(k)} ms</div>
              <div style={{ fontSize: 12, color: C.slate }}>{ORDERINGS[k].steps.length} models{k === 'MDP ordering' ? ` · ${(totalCost('Cheapest-first') / totalCost('MDP ordering')).toFixed(1)}× faster` : ''}</div>
            </div>
          )
        })}
      </div>
      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 12 }}>
        Starting with a more expensive model can lower <i>total</i> cost — the counterintuitive ordering the MDP discovers.
      </p>
    </div>
  )
}
