import React, { useEffect, useRef, useState } from 'react'
import data from '../data/case_studies.json'

const THETA = data.theta
const STEP_MS = 1050
const HOLD_MS = 2300

const C = { indigo: '#4f46e5', blue: '#2563eb', green: '#059669', red: '#dc2626', ink: '#0b1220', slate: '#51607a', line: '#e6e9f2', mute: '#8a97ad' }

// flatten the case studies into a playlist the hero cycles through
const PLAYLIST = [
  { mod: 'image', i: 1 }, // leopard (correction)
  { mod: 'text', i: 1 },  // econ MMLU (correction)
  { mod: 'image', i: 0 }, // sunflower (easy exit)
  { mod: 'text', i: 0 },  // photosynthesis (easy exit)
]

export default function HeroDemo() {
  const [pi, setPi] = useState(0)        // playlist index
  const [step, setStep] = useState(0)    // models revealed
  const [paused, setPaused] = useState(false)
  const t = useRef(null)

  const { mod, i } = PLAYLIST[pi]
  const sample = data[mod].samples[i]
  const steps = sample.steps
  const costs = data[mod].costs_ms
  const fullCost = data[mod].full_ensemble_cost_ms
  const executed = steps.map((s) => s.model)
  const ordered = [...executed, ...Object.keys(costs).filter((m) => !executed.includes(m))]

  useEffect(() => {
    if (paused) return
    if (step < steps.length) {
      t.current = setTimeout(() => setStep((s) => s + 1), step === 0 ? 650 : STEP_MS)
    } else {
      t.current = setTimeout(() => { setPi((p) => (p + 1) % PLAYLIST.length); setStep(0) }, HOLD_MS)
    }
    return () => clearTimeout(t.current)
  }, [step, pi, paused, steps.length])

  const jump = (idx) => { clearTimeout(t.current); setPi(idx); setStep(0); setPaused(false) }

  const shown = steps.slice(0, step)
  const last = shown[shown.length - 1]
  const conf = last ? last.confidence : 0
  const exited = step >= steps.length
  const execCost = shown.reduce((a, s) => a + s.cost_ms, 0)
  const speedup = execCost ? (fullCost / execCost).toFixed(1) : '—'
  const pct = Math.round(conf * 100)

  return (
    <div className="card hoverable" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 26px' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div key={pi} className="fade-swap">
        {/* prompt line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, minHeight: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.indigo, background: '#eef2ff', padding: '3px 9px', borderRadius: 6 }}>
            {data[mod].dataset}
          </span>
          <span style={{ color: C.ink, fontSize: 15 }}>
            {mod === 'text' ? sample.question : <>a <i>{sample.true_label}</i></>}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: C.slate }}>
            answer: <b style={{ color: C.ink }}>{mod === 'text' ? sample.answer : sample.true_label}</b>
          </span>
        </div>

        {/* model chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {ordered.map((m) => {
            const idx = executed.indexOf(m)
            const on = idx > -1 && idx < step
            const isExit = exited && idx === executed.length - 1
            const s = steps[idx]
            return (
              <div key={m} className={on ? 'pop-in' : ''} style={{
                flex: '1 1 0', minWidth: 92, borderRadius: 10, padding: '9px 6px', textAlign: 'center', transition: 'all .4s',
                border: `1.5px solid ${isExit ? C.green : on ? C.indigo : C.line}`,
                background: isExit ? '#ecfdf5' : on ? C.indigo : '#fff',
                color: isExit ? C.green : on ? '#fff' : C.mute, opacity: on || isExit ? 1 : 0.55,
              }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.1 }}>{m.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: 10.5, opacity: 0.82 }}>{costs[m]} ms</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 5, minHeight: 16, color: on && s?.wrong ? '#fecaca' : 'inherit' }}>
                  {on ? (mod === 'text' ? `(${s.pred})` : s.pred) : ''}
                </div>
              </div>
            )
          })}
        </div>

        {/* confidence gauge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.slate, marginBottom: 5 }}>
          <span>substacker confidence</span><span className="mono">{conf ? conf.toFixed(2) : '0.00'}</span>
        </div>
        <div style={{ position: 'relative', height: 26, background: '#f1f4fa', borderRadius: 7, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 7,
            background: conf >= THETA ? `linear-gradient(90deg,#34d399,${C.green})` : `linear-gradient(90deg,#818cf8,${C.indigo})`,
            transition: 'width .55s cubic-bezier(.22,1,.36,1), background .3s' }} />
          <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${THETA * 100}%`, borderLeft: `2px dashed ${C.green}` }} />
        </div>
        <div style={{ position: 'relative', height: 16 }}>
          <span style={{ position: 'absolute', left: `${THETA * 100}%`, transform: 'translateX(-50%)', fontSize: 11, color: C.green }}>exit θ = {THETA}</span>
        </div>

        {/* status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 8, minHeight: 26 }}>
          <div style={{ fontWeight: 600, color: C.ink, fontSize: 14.5 }}>
            {!last ? 'Running the cascade…'
              : last.wrong ? <span><span style={{ color: C.red }}>{last.model.replace(/_/g, ' ')} alone is wrong</span> — keep stacking</span>
              : exited ? <span className="pulse-exit" style={{ color: C.green, display: 'inline-block', padding: '2px 8px', borderRadius: 8 }}>✓ Exited after {steps.length} models</span>
              : <span>stacking corrects the prediction — continue</span>}
          </div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: exited ? C.green : C.slate }}>
            {execCost} / {fullCost} ms {exited && `· ${speedup}× faster`}
          </div>
        </div>
      </div>

      {/* carousel dots */}
      <div className="dots">
        {PLAYLIST.map((_, idx) => (
          <button key={idx} className={idx === pi ? 'on' : ''} onClick={() => jump(idx)} aria-label={`example ${idx + 1}`} />
        ))}
      </div>
    </div>
  )
}
