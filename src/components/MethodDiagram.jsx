import React from 'react'

const steps = [
  { n: '1', title: 'Trajectory discovery', tag: 'offline · MDP', color: '#6366f1',
    body: 'An MDP with accuracy–latency rewards is solved by value iteration on validation data, revealing 3–8 high-coverage model orderings — including counterintuitive ones.' },
  { n: '2', title: 'Prefix meta-learning', tag: 'offline · substackers', color: '#2563eb',
    body: 'A lightweight substacker is trained for every prefix of each discovered trajectory, aggregating partial predictions into calibrated probabilities — linear, not 2ᵏ.' },
  { n: '3', title: 'Progressive inference', tag: 'online · early exit', color: '#10b981',
    body: 'At test time, models run along the policy; after each, the substacker aggregates and the cascade exits as soon as confidence exceeds θ. Black-box: probabilities only.' },
]

export default function MethodDiagram() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 980, margin: '0 auto' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="card" style={{ flex: '1 1 250px', minWidth: 240, borderTop: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: 999, background: s.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>{s.n}</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{s.title}</span>
            </div>
            <div style={{ color: s.color, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>{s.tag}</div>
            <div style={{ color: '#475569', fontSize: 14.5 }}>{s.body}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ alignSelf: 'center', color: '#94a3b8', fontSize: 24, fontWeight: 700 }}>→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
