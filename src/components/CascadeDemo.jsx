import React, { useEffect, useRef, useState } from 'react'
import data from '../data/case_studies.json'
import Icon from './Icon'

const THETA = data.theta // 0.85
const STEP_MS = 1500

const C = {
  blue: '#2563eb', green: '#10b981', red: '#ef4444',
  grey: '#cbd5e1', ink: '#0f172a', slate: '#475569', line: '#e2e8f0',
}

// hard sample (index 1) shows correction + early exit
const sampleFor = (mod) => data[mod].samples[1]

export default function CascadeDemo() {
  const [mod, setMod] = useState('image')
  const [step, setStep] = useState(0)      // number of models revealed (0..steps.length)
  const [playing, setPlaying] = useState(true)
  const timer = useRef(null)

  const sample = sampleFor(mod)
  const steps = sample.steps
  const costs = data[mod].costs_ms
  const fullCost = data[mod].full_ensemble_cost_ms
  const executed = steps.map((s) => s.model)
  const ordered = [...executed, ...Object.keys(costs).filter((m) => !executed.includes(m))]

  // animation driver
  useEffect(() => {
    if (!playing) return
    if (step >= steps.length) { setPlaying(false); return }
    timer.current = setTimeout(() => setStep((s) => s + 1), step === 0 ? 600 : STEP_MS)
    return () => clearTimeout(timer.current)
  }, [playing, step, steps.length])

  const reset = (m) => { setMod(m); setStep(0); setPlaying(true) }

  const shown = steps.slice(0, step)
  const last = shown[shown.length - 1]
  const conf = last ? last.confidence : 0
  const exited = step >= steps.length
  const execCost = shown.reduce((a, s) => a + s.cost_ms, 0)
  const speedup = execCost ? (fullCost / execCost).toFixed(1) : '—'

  return (
    <div className="card" style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* modality toggle */}
      <div className="controls" style={{ marginTop: 0, marginBottom: 18 }}>
        <div className="toggle">
          <button className={mod === 'image' ? 'active' : ''} onClick={() => reset('image')}><Icon name="image" /> Image · CIFAR-100</button>
          <button className={mod === 'text' ? 'active' : ''} onClick={() => reset('text')}><Icon name="text" /> Text · MMLU</button>
        </div>
      </div>

      {/* prompt */}
      <div style={{ minHeight: 64, marginBottom: 14, color: C.ink, fontSize: 15 }}>
        {mod === 'text' ? (
          <div>
            <b>Q.</b> {sample.question}
            <div style={{ marginTop: 6, color: C.slate, fontSize: 14 }}>
              {Object.entries(sample.choices).map(([k, v]) => (
                <span key={k} style={{ marginRight: 16 }}>({k}) {v}</span>
              ))}
            </div>
            <div style={{ color: C.mute, fontSize: 13 }}>Correct answer: ({sample.answer})</div>
          </div>
        ) : (
          <div>
            <b>Input image:</b> a <i>{sample.true_label}</i>{' '}
            <span style={{ color: C.slate, fontSize: 13 }}>(easily confused with a tiger)</span>
          </div>
        )}
      </div>

      {/* model cards */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
        {ordered.map((m) => {
          const idx = executed.indexOf(m)
          const isShown = idx > -1 && idx < step
          const isExit = exited && idx === executed.length - 1
          const sObj = steps[idx]
          return (
            <div key={m} style={{
              flex: '1 1 0', minWidth: 96, borderRadius: 10, padding: '10px 6px', textAlign: 'center',
              border: `1.5px solid ${isExit ? C.green : isShown ? C.blue : C.line}`,
              background: isExit ? C.green : isShown ? C.blue : '#fff',
              color: isShown || isExit ? '#fff' : C.mute,
              opacity: isShown || isExit ? 1 : 0.5,
              transition: 'all .45s ease', transform: isShown ? 'translateY(0)' : 'translateY(2px)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.1 }}>{m.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>{costs[m]} ms</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, minHeight: 16,
                color: isShown && sObj?.wrong ? '#fecaca' : 'inherit' }}>
                {isShown ? (mod === 'text' ? `(${sObj.pred})` : sObj.pred) : ' '}
              </div>
            </div>
          )
        })}
      </div>

      {/* confidence gauge */}
      <ConfGauge conf={conf} exited={exited} />

      {/* status + cost meter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
        <div style={{ fontWeight: 600, color: C.ink, minHeight: 24 }}>
          {!last ? 'Running the cascade…'
            : last.wrong ? <span><span style={{ color: C.red }}>{last.model.replace(/_/g, ' ')} alone is wrong</span> — confidence {conf.toFixed(2)}, continue</span>
            : exited ? <span style={{ color: C.green }}>✓ Exited after {steps.length} models — {execCost} / {fullCost} ms ({speedup}× faster)</span>
            : <span>Stacking corrects the prediction — confidence {conf.toFixed(2)}, continue</span>}
        </div>
        <CostMeter execCost={execCost} fullCost={fullCost} />
      </div>

      {/* controls */}
      <div className="controls">
        <button className="pill-btn" onClick={() => { setStep(0); setPlaying(false) }}><Icon name="reset" /> Reset</button>
        <button className="pill-btn primary" onClick={() => (exited ? reset(mod) : setPlaying((p) => !p))}>
          {exited ? <><Icon name="replay" /> Replay</> : playing ? <><Icon name="pause" /> Pause</> : <><Icon name="play" /> Play</>}
        </button>
        <button className="pill-btn" onClick={() => { setPlaying(false); setStep((s) => Math.min(s + 1, steps.length)) }}>Step <Icon name="step" /></button>
      </div>

      <p style={{ textAlign: 'center', color: C.mute, fontSize: 12, marginTop: 10 }}>
        Model names and per-model costs are from the released code; per-step confidences illustrate the method's behavior.
      </p>
    </div>
  )
}

function ConfGauge({ conf, exited }) {
  const pct = Math.round(conf * 100)
  const over = conf >= THETA
  return (
    <div style={{ position: 'relative', marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.slate, marginBottom: 4 }}>
        <span>substacker confidence</span>
        <span className="mono">{conf ? conf.toFixed(2) : '0.00'}</span>
      </div>
      <div style={{ height: 30, background: '#f1f5f9', borderRadius: 8, border: `1px solid ${C.line}`, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 8,
          background: over ? `linear-gradient(90deg,#34d399,${C.green})` : `linear-gradient(90deg,#60a5fa,${C.blue})`,
          transition: 'width .6s cubic-bezier(.22,1,.36,1), background .4s ease',
        }} />
        {/* threshold marker at 85% */}
        <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${THETA * 100}%`, borderLeft: `2px dashed ${C.green}` }} />
      </div>
      <div style={{ position: 'absolute', left: `${THETA * 100}%`, transform: 'translateX(-50%)', fontSize: 11, color: C.green, marginTop: 3 }}>
        exit θ = {THETA}
      </div>
    </div>
  )
}

function CostMeter({ execCost, fullCost }) {
  const pct = Math.round((execCost / fullCost) * 100)
  return (
    <div style={{ minWidth: 200 }}>
      <div style={{ fontSize: 12, color: C.slate, marginBottom: 4, textAlign: 'right' }}>
        compute used: <span className="mono">{execCost}</span> / {fullCost} ms
      </div>
      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 6, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: C.amber, transition: 'width .6s ease' }} />
      </div>
    </div>
  )
}
