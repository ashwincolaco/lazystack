import React from 'react'
import LazyStackTeaser from './components/LazyStackTeaser'
import CascadeDemo from './components/CascadeDemo'
import MethodDiagram from './components/MethodDiagram'
import TrajectoryLandscape from './components/TrajectoryLandscape'
import TraceGrid from './components/TraceGrid'
import Playground from './components/Playground'
import TrajectorySankey from './components/TrajectorySankey'
import OrderingToggle from './components/OrderingToggle'

const PAPER_URL = 'https://icml.cc/virtual/2026/poster/63422'
const CODE_URL = 'https://anonymous.4open.science/r/lazystack-5DC4/'

// Author list from the ICML 2026 poster page (icml.cc/virtual/2026/poster/63422).
const AUTHORS = [
  'Ashwin Colaço', 'Sharad Mehrotra', 'Michael De Lucia', 'Kevin Hamlen',
  'Murat Kantarcioglu', 'Latifur Khan', 'Ananthram Swami', 'Bhavani Thuraisingham', 'Unnat Jain',
]

export default function App() {
  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <h1>Unifying <span className="accent">Stacking</span> and <span className="accent">Cascading</span><br />for Efficient Ensemble Inference</h1>
          <div className="authors">
            {AUTHORS.map((a, i) => (
              <span key={a}><a href={PAPER_URL}>{a}</a>{i < AUTHORS.length - 1 ? ', ' : ''}</span>
            ))}
          </div>
          {/* TODO(affiliations): ICML page lists no affiliations; institutions below are the collaborating labs — confirm/refine. */}
          <div className="affil">University of California, Irvine · University of Texas at Dallas · DEVCOM Army Research Laboratory</div>
          <div className="venue">ICML 2026</div>
          <div className="btns">
            <a className="btn" href={PAPER_URL}><span>📄</span> Paper</a>
            <a className="btn ghost" href={CODE_URL}><span>💻</span> Code</a>
            <a className="btn ghost" href="#bibtex"><span>❝</span> BibTeX</a>
          </div>
        </div>
      </header>

      {/* TEASER */}
      <section>
        <div className="wrap">
          <LazyStackTeaser />
          <p className="tagline" style={{ marginTop: 28 }}>
            Ensemble-quality predictions at <span className="hl">cascade-level cost</span> — up to{' '}
            <span className="hl">38× speedup</span> at <span className="hl">97%+ accuracy retention</span>.
          </p>
        </div>
      </section>

      {/* ABSTRACT */}
      <section className="section-soft">
        <div className="wrap">
          <h2 className="section-title">Abstract</h2>
          <p className="prose">
            We introduce <b>LazyStack</b>, a method for efficient model ensemble inference. The core idea is intuitive:
            after each model executes, we check whether accumulated evidence is sufficient to exit confidently. Sometimes
            one model suffices; other times we aggregate predictions from several models via trained meta-learners before
            reaching confidence. Two insights make this work. First, most inputs follow only <b>3 to 8 execution
            trajectories</b>, reducing the training problem from exponential to linear. Second, we formulate trajectory
            selection as an <b>MDP</b> and use value iteration to compute the optimal routing policy, which reveals
            counterintuitive model orderings — on intrusion detection, starting with a moderately expensive model
            outperforms starting with the cheapest, because its higher confidence enables earlier overall exit. Across
            vision, text, tabular, and LLM tasks, we achieve up to <b>38× speedup at 97%+ accuracy retention</b>.
          </p>
        </div>
      </section>

      {/* INTERACTIVE: PLAYGROUND */}
      <section>
        <div className="wrap">
          <h2 className="section-title">Tune the accuracy–speed tradeoff</h2>
          <p className="section-sub">
            Drag the exit threshold θ and cost-weight α and watch LazyStack move along its Pareto frontier — it dominates ABC at every operating point.
          </p>
          <Playground />
        </div>
      </section>

      {/* INTERACTIVE: CASCADE DEMO */}
      <section className="section-soft">
        <div className="wrap">
          <h2 className="section-title">Watch it run, on one input</h2>
          <p className="section-sub">
            Models execute one at a time along the MDP trajectory. A substacker aggregates predictions after each step;
            the cascade <b>exits early</b> once confidence crosses θ = 0.85 — often before a single model alone would even be correct.
          </p>
          <CascadeDemo />
        </div>
      </section>

      {/* INTERACTIVE: COUNTERINTUITIVE ORDERING */}
      <section>
        <div className="wrap">
          <h2 className="section-title">Why the ordering is counterintuitive</h2>
          <p className="section-sub">Starting with a pricier model can be cheaper overall. Toggle the two orderings.</p>
          <OrderingToggle />
        </div>
      </section>

      {/* INTERACTIVE: TRACE GRID (qualitative insight) */}
      <section className="section-soft">
        <div className="wrap">
          <h2 className="section-title">Case by case: LazyStack vs. cascade baselines</h2>
          <p className="section-sub">
            The same inputs, routed by each method. Baselines exit early-and-wrong or run nearly everything; LazyStack
            stacks just enough to correct, then exits.
          </p>
          <TraceGrid />
        </div>
      </section>

      {/* METHOD */}
      <section>
        <div className="wrap">
          <h2 className="section-title">How LazyStack works</h2>
          <p className="section-sub">Two offline components, one online inference loop.</p>
          <MethodDiagram />
        </div>
      </section>

      {/* INTERACTIVE: TRAJECTORY FLOW + landscape */}
      <section className="section-soft">
        <div className="wrap">
          <h2 className="section-title">Why it scales: trajectory concentration</h2>
          <p className="section-sub">
            Despite 2ᵏ possible execution paths, a handful of trajectories dominate, and most inputs exit after just two or three models.
          </p>
          <TrajectorySankey />
          <div style={{ height: 28 }} />
          <TrajectoryLandscape />
        </div>
      </section>

      {/* RESULTS */}
      <section>
        <div className="wrap">
          <h2 className="section-title">Results at a glance</h2>
          <div className="stats">
            <div className="stat"><div className="num">38×</div><div className="lbl">speedup on NSL-KDD (vs full ensemble)</div></div>
            <div className="stat"><div className="num">97%+</div><div className="lbl">accuracy retention across 8 benchmarks</div></div>
            <div className="stat"><div className="num">3–8</div><div className="lbl">trajectories cover 95%+ of inputs</div></div>
          </div>
          <p className="prose" style={{ marginTop: 28, fontSize: 16 }}>
            LazyStack achieves the highest accuracy among efficient methods on MMLU, ARC-Challenge, and HEADLINES;
            on NSL-KDD it is 7× faster than ABC while also more accurate; and it matches or exceeds the white-box
            Gatekeeper baseline using probability outputs only.
          </p>
        </div>
      </section>

      {/* BIBTEX */}
      <section className="section-soft" id="bibtex">
        <div className="wrap">
          <h2 className="section-title">BibTeX</h2>
          <pre className="bibtex">{`@inproceedings{colaco2026lazystack,
  title     = {Unifying Stacking and Cascading for Efficient Ensemble Inference},
  author    = {Cola\\c{c}o, Ashwin and Mehrotra, Sharad and De Lucia, Michael and
               Hamlen, Kevin and Kantarcioglu, Murat and Khan, Latifur and
               Swami, Ananthram and Thuraisingham, Bhavani and Jain, Unnat},
  booktitle = {International Conference on Machine Learning (ICML)},
  year      = {2026}
}`}</pre>
        </div>
      </section>

      <footer>
        LazyStack · ICML 2026 · built with React + Vite, inspired by the NOMAD and Nerfies project pages.
      </footer>
    </>
  )
}
