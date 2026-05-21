import React, { useEffect, useRef, useState } from 'react'

const C = { indigo: '#4f46e5', green: '#059669', amber: '#d97706', ink: '#0b1220', slate: '#51607a', line: '#e6e9f2', grey: '#cbd5e1', mute: '#8a97ad' }

// Curated counterintuitive-ordering cases. Costs (ms) from models/model_registry.py.
const EX = {
  'CIFAR-100': {
    input: 'a sunflower image',
    cheap: [['mobilenet_v2', 3, 0.52], ['resnet18', 6, 0.61], ['resnet50', 14, 0.70], ['efficientnet_b0', 16, 0.79], ['resnet101', 28, 0.87]],
    mdp:   [['resnet50', 14, 0.73], ['mobilenet_v2', 3, 0.91]],
    why: 'The MDP starts with resnet50 (14 ms), not the cheapest model — its higher confidence triggers an earlier overall exit.',
  },
  'NSL-KDD': {
    input: 'a network traffic flow',
    cheap: [['logistic', 0.8, 0.46], ['decision_tree', 1.2, 0.55], ['mlp', 8.7, 0.64], ['random_forest', 12.5, 0.73], ['svm', 45.2, 0.88]],
    mdp:   [['lightgbm', 14.7, 0.74], ['catboost', 21.5, 0.93]],
    why: 'The cheap models are unreliable here, so cheapest-first burns four of them before escalating to an expensive SVM. The MDP leads with LightGBM (14.7 ms) and exits in two.',
  },
  'MMLU': {
    input: 'a multiple-choice question',
    cheap: [['electra_small', 15, 0.60], ['albert_base', 20, 0.72], ['distilbert', 25, 0.87]],
    mdp:   [['albert_base', 20, 0.75], ['electra_small', 15, 0.91]],
    why: 'The MDP leads with albert_base (20 ms) rather than the cheaper electra_small (15 ms), reaching confidence one model sooner.',
  },
}
const sum = (steps) => steps.reduce((a, s) => a + s[1], 0)

function Column({ title, accent, steps, step, winner, badge }) {
  const revealed = Math.min(step, steps.length)
  const exited = step >= steps.length
  const cost = steps.slice(0, revealed).reduce((a, s) => a + s[1], 0)
  return (
    <div style={{ flex: '1 1 240px', minWidth: 230, border: `1.5px solid ${winner ? accent : C.line}`, borderRadius: 14, padding: 16, background: winner ? '#f7f8ff' : '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: accent }} />
        <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
        {winner && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: accent, background: '#eef2ff', padding: '2px 8px', borderRadius: 999 }}>{badge}</span>}
      </div>

      {/* vertical cascade */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map(([m, c, conf], i) => {
          const on = i < revealed
          const isExit = exited && i === steps.length - 1
          return (
            <div key={i} className={on ? 'pop-in' : ''} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 11px', borderRadius: 9, transition: 'all .35s',
              border: `1px solid ${isExit ? C.green : on ? accent : C.line}`,
              background: isExit ? '#ecfdf5' : on ? `${accent}0e` : '#fff', opacity: on ? 1 : 0.4,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.mute, width: 18 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 650, fontSize: 13, color: C.ink }}>{m.replace(/_/g, ' ')}</div>
                <div style={{ height: 4, background: '#eef1f7', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: on ? `${conf * 100}%` : '0%', background: isExit ? C.green : accent, transition: 'width .4s' }} />
                </div>
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: C.slate, width: 44, textAlign: 'right' }}>{c} ms</span>
              {isExit && <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>✓</span>}
            </div>
          )
        })}
        {!exited && revealed > 0 && <div style={{ textAlign: 'center', color: C.mute, fontSize: 12 }}>running…</div>}
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12.5, color: C.slate }}>{steps.length} models</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: winner ? accent : C.ink }}>{sum(steps).toFixed(1)} ms</span>
      </div>
    </div>
  )
}

export default function OrderingToggle() {
  const [ds, setDs] = useState('NSL-KDD')
  const [step, setStep] = useState(0)
  const timer = useRef(null)
  const e = EX[ds]
  const maxLen = Math.max(e.cheap.length, e.mdp.length)
  const faster = (sum(e.cheap) / sum(e.mdp)).toFixed(1)

  useEffect(() => {
    setStep(0)
    let i = 0
    timer.current = setInterval(() => { i += 1; setStep(i); if (i > maxLen) clearInterval(timer.current) }, 850)
    return () => clearInterval(timer.current)
  }, [ds])

  return (
    <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div className="toggle">
          {Object.keys(EX).map((k) => (
            <button key={k} className={ds === k ? 'active' : ''} onClick={() => setDs(k)}>{k}</button>
          ))}
        </div>
        <span style={{ fontSize: 13.5, color: C.slate }}>Input: <b style={{ color: C.ink }}>{e.input}</b></span>
        <button className="pill-btn" onClick={() => setStep(0)}>↻ Replay</button>
      </div>

      {/* side-by-side cascades */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Column title="Cheapest-first" accent={C.amber} steps={e.cheap} step={step} />
        <div style={{ alignSelf: 'center', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.indigo }}>{faster}×</div>
          <div style={{ fontSize: 11, color: C.slate }}>cheaper</div>
        </div>
        <Column title="MDP ordering" accent={C.indigo} steps={e.mdp} step={step} winner badge={`${faster}× cheaper`} />
      </div>

      <p style={{ textAlign: 'center', color: C.slate, fontSize: 13, marginTop: 16 }}>{e.why}</p>
    </div>
  )
}
