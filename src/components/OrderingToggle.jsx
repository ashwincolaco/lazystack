import React, { useEffect, useRef, useState } from 'react'

const THETA = 0.85
const C = { indigo: '#4f46e5', green: '#059669', amber: '#d97706', ink: '#0b1220', slate: '#51607a', line: '#e6e9f2', grey: '#cbd5e1', red: '#dc2626', mute: '#8a97ad' }

// Curated counterintuitive-ordering cases. Costs (ms) from models/model_registry.py.
// Each: cheapest-first cascade vs the MDP ordering (which starts with a pricier model).
const EX = {
  'CIFAR-100': {
    input: 'a sunflower image',
    'Cheapest-first': { steps: [['mobilenet_v2', 3, 0.52], ['resnet18', 6, 0.61], ['resnet50', 14, 0.70], ['efficientnet_b0', 16, 0.79], ['resnet101', 28, 0.87]] },
    'MDP ordering':   { steps: [['resnet50', 14, 0.73], ['mobilenet_v2', 3, 0.91]] },
    why: 'The MDP starts with resnet50 (14 ms), not the cheapest model — its higher confidence triggers an earlier overall exit.',
  },
  'NSL-KDD': {
    input: 'a network traffic flow',
    'Cheapest-first': { steps: [['logistic', 0.8, 0.46], ['decision_tree', 1.2, 0.55], ['mlp', 8.7, 0.64], ['random_forest', 12.5, 0.73], ['svm', 45.2, 0.88]] },
    'MDP ordering':   { steps: [['lightgbm', 14.7, 0.74], ['catboost', 21.5, 0.93]] },
    why: 'The MDP prefers LightGBM (14.7 ms) over the far cheaper Logistic Regression (0.8 ms). The cheap models are unreliable here, so cheapest-first burns four of them before escalating to an expensive SVM — LightGBM lets the MDP exit in two.',
  },
  'MMLU': {
    input: 'a multiple-choice question',
    'Cheapest-first': { steps: [['electra_small', 15, 0.60], ['albert_base', 20, 0.72], ['distilbert', 25, 0.87]] },
    'MDP ordering':   { steps: [['albert_base', 20, 0.75], ['electra_small', 15, 0.91]] },
    why: 'The MDP leads with albert_base (20 ms) rather than the cheaper electra_small (15 ms), reaching confidence one model sooner.',
  },
}
const total = (ds, mode) => EX[ds][mode].steps.reduce((a, s) => a + s[1], 0)

export default function OrderingToggle() {
  const [ds, setDs] = useState('NSL-KDD')
  const [mode, setMode] = useState('MDP ordering')
  const [step, setStep] = useState(0)
  const timer = useRef(null)
  const steps = EX[ds][mode].steps

  useEffect(() => {
    setStep(0)
    let i = 0
    timer.current = setInterval(() => { i += 1; setStep(i); if (i >= steps.length) clearInterval(timer.current) }, 850)
    return () => clearInterval(timer.current)
  }, [ds, mode])

  const done = step >= steps.length
  const cheap = total(ds, 'Cheapest-first'), mdp = total(ds, 'MDP ordering')
  const faster = (cheap / mdp).toFixed(1)

  return (
    <div className="card" style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* dataset tabs */}
      <div className="controls" style={{ marginTop: 0, marginBottom: 14 }}>
        <div className="toggle">
          {Object.keys(EX).map((k) => (
            <button key={k} className={ds === k ? 'active' : ''} onClick={() => setDs(k)}>{k}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, color: C.slate }}>Input: <b style={{ color: C.ink }}>{EX[ds].input}</b></span>
        <div className="toggle">
          {['Cheapest-first', 'MDP ordering'].map((k) => (
            <button key={k} className={mode === k ? 'active' : ''} onClick={() => setMode(k)}>{k}</button>
          ))}
        </div>
      </div>

      {/* model chain */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', minHeight: 74, margin: '14px 0 6px' }}>
        {steps.map(([m, c, conf], i) => {
          const on = i < step
          const isExit = done && i === steps.length - 1
          return (
            <React.Fragment key={i}>
              <div className={on ? 'pop-in' : ''} style={{
                borderRadius: 10, padding: '8px 11px', textAlign: 'center', minWidth: 86, transition: 'all .4s',
                border: `1.5px solid ${isExit ? C.green : on ? C.indigo : C.line}`,
                background: isExit ? '#ecfdf5' : on ? C.indigo : '#fff', color: isExit ? C.green : on ? '#fff' : C.mute, opacity: on ? 1 : 0.5,
              }}>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>{m.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: 10.5, opacity: 0.85 }}>{c} ms</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 3, minHeight: 15 }}>{on ? `conf ${conf.toFixed(2)}` : ''}</div>
              </div>
              {i < steps.length - 1 && <span style={{ color: C.grey }}>→</span>}
            </React.Fragment>
          )
        })}
        {done && <span style={{ marginLeft: 4, fontSize: 12.5, fontWeight: 700, color: C.green }}>exit ✓</span>}
      </div>

      {/* comparison */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
        {['Cheapest-first', 'MDP ordering'].map((k) => {
          const active = k === mode, t = total(ds, k)
          return (
            <button key={k} onClick={() => setMode(k)} style={{
              cursor: 'pointer', textAlign: 'center', padding: '12px 20px', borderRadius: 12,
              border: `1.5px solid ${active ? C.indigo : C.line}`, background: active ? '#eef2ff' : '#fff',
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.slate }}>{k}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: active ? C.indigo : C.ink }}>{t.toFixed(1)} ms</div>
              <div style={{ fontSize: 12, color: C.slate }}>{EX[ds][k].steps.length} models{k === 'MDP ordering' ? ` · ${faster}× cheaper` : ''}</div>
            </button>
          )
        })}
      </div>

      <p style={{ textAlign: 'center', color: C.slate, fontSize: 13, marginTop: 16 }}>{EX[ds].why}</p>
    </div>
  )
}
