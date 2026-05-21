import React, { useEffect, useRef, useState } from 'react'
import data from '../data/hero_examples.json'

const THETA = data.theta
const STEP_MS = 1050
const HOLD_MS = 2400
const C = { indigo: '#4f46e5', green: '#059669', red: '#dc2626', ink: '#0b1220', slate: '#51607a', line: '#e6e9f2', mute: '#8a97ad' }

export default function HeroDemo() {
  const [pi, setPi] = useState(0)
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const t = useRef(null)

  const ex = data.examples[pi]
  const steps = ex.steps
  const executed = steps.map((s) => s[0])
  const ordered = [...executed, ...Object.keys(ex.costs).filter((m) => !executed.includes(m))]

  useEffect(() => {
    if (paused) return
    if (step < steps.length) t.current = setTimeout(() => setStep((s) => s + 1), step === 0 ? 650 : STEP_MS)
    else t.current = setTimeout(() => { setPi((p) => (p + 1) % data.examples.length); setStep(0) }, HOLD_MS)
    return () => clearTimeout(t.current)
  }, [step, pi, paused, steps.length])

  const jump = (i) => { clearTimeout(t.current); setPi(i); setStep(0); setPaused(false) }
  const shown = steps.slice(0, step)
  const last = shown[shown.length - 1]
  const conf = last ? last[2] : 0
  const exited = step >= steps.length
  const execCost = shown.reduce((a, s) => a + ex.costs[s[0]], 0)
  const speedup = execCost ? (ex.full_cost / execCost).toFixed(1) : '—'
  const pct = Math.round(conf * 100)

  return (
    <div className="card hoverable" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 26px' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div key={pi} className="fade-swap">
        {/* input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: C.indigo, background: '#eef2ff', padding: '4px 9px', borderRadius: 6 }}>{ex.dataset}</span>
          {ex.domain === 'image' && <img src={ex.image} alt={ex.label} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', imageRendering: 'pixelated', border: `1px solid ${C.line}` }} />}
          {ex.domain === 'tabular' && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.slate, background: '#f6f8fc', border: `1px solid ${C.line}`, borderRadius: 6, padding: '4px 8px' }}>proto=tcp · flag=S0 · 247 conn</span>}
          <span style={{ color: C.ink, fontSize: 15, flex: 1, minWidth: 180 }}>
            {ex.domain === 'text' ? ex.question : ex.domain === 'image' ? <>an image of a <i>{ex.label}</i> <span style={{ color: C.mute, fontSize: 13 }}>({ex.note})</span></> : ex.label}
          </span>
          <span style={{ fontSize: 13, color: C.slate }}>truth: <b style={{ color: C.ink }}>{ex.domain === 'text' ? ex.answer : ex.label.replace('a network flow resembling a ', '')}</b></span>
        </div>
        {ex.domain === 'text' && (
          <div style={{ marginTop: -8, marginBottom: 14, color: C.slate, fontSize: 13.5 }}>
            {Object.entries(ex.choices).map(([k, v]) => <span key={k} style={{ marginRight: 14 }}>({k}) {v}</span>)}
          </div>
        )}

        {/* model chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {ordered.map((m) => {
            const idx = executed.indexOf(m)
            const on = idx > -1 && idx < step
            const isExit = exited && idx === executed.length - 1
            const s = steps[idx]
            return (
              <div key={m} className={on ? 'pop-in' : ''} style={{
                flex: '1 1 0', minWidth: 90, borderRadius: 10, padding: '9px 6px', textAlign: 'center', transition: 'all .4s',
                border: `1.5px solid ${isExit ? C.green : on ? C.indigo : C.line}`,
                background: isExit ? '#ecfdf5' : on ? C.indigo : '#fff', color: isExit ? C.green : on ? '#fff' : C.mute, opacity: on || isExit ? 1 : 0.5,
              }}>
                <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.1 }}>{m.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: 10.5, opacity: 0.82 }}>{ex.costs[m]} ms</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 5, minHeight: 16, color: on && s?.[3] ? '#fecaca' : 'inherit' }}>{on ? (ex.domain === 'text' ? `(${s[1]})` : s[1]) : ''}</div>
              </div>
            )
          })}
        </div>

        {/* confidence gauge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.slate, marginBottom: 5 }}>
          <span title="A substacker is a small learned model that combines the predictions seen so far into one calibrated confidence." style={{ borderBottom: `1px dotted ${C.mute}`, cursor: 'help' }}>substacker confidence</span>
          <span className="mono">{conf ? conf.toFixed(2) : '0.00'}</span>
        </div>
        <div style={{ position: 'relative', height: 26, background: '#f1f4fa', borderRadius: 7, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 7, background: conf >= THETA ? `linear-gradient(90deg,#34d399,${C.green})` : `linear-gradient(90deg,#818cf8,${C.indigo})`, transition: 'width .55s cubic-bezier(.22,1,.36,1), background .3s' }} />
          <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${THETA * 100}%`, borderLeft: `2px dashed ${C.green}` }} />
        </div>
        <div style={{ position: 'relative', height: 16 }}>
          <span style={{ position: 'absolute', left: `${THETA * 100}%`, transform: 'translateX(-50%)', fontSize: 11, color: C.green }}>exit threshold θ = {THETA}</span>
        </div>

        {/* status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 8, minHeight: 26 }}>
          <div style={{ fontWeight: 600, color: C.ink, fontSize: 14.5 }}>
            {!last ? 'Running the cascade…'
              : last[3] ? <span><span style={{ color: C.red }}>{last[0].replace(/_/g, ' ')} alone is wrong</span> — keep stacking</span>
              : exited ? <span className="pulse-exit" style={{ color: C.green, display: 'inline-block', padding: '2px 8px', borderRadius: 8 }}>✓ Confident — exit after {steps.length} models</span>
              : <span>stacking corrects the prediction — continue</span>}
          </div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: exited ? C.green : C.slate }}>
            {execCost.toFixed(execCost % 1 ? 1 : 0)} / {ex.full_cost} ms {exited && `· ${speedup}× faster`}
          </div>
        </div>
      </div>

      <div className="dots">
        {data.examples.map((e, i) => (
          <button key={i} className={i === pi ? 'on' : ''} onClick={() => jump(i)} aria-label={e.dataset} />
        ))}
      </div>
    </div>
  )
}
