import React from 'react'
import LazyStackTeaser from './components/LazyStackTeaser'
import CascadeDemo from './components/CascadeDemo'
import MethodDiagram from './components/MethodDiagram'
import TrajectoryLandscape from './components/TrajectoryLandscape'

export default function App() {
  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <h1>Unifying <span className="accent">Stacking</span> and <span className="accent">Cascading</span><br />for Efficient Ensemble Inference</h1>
          {/* TODO(authors): confirm/complete the author list and affiliations. */}
          <div className="authors">
            <a href="#">Ashwin Gerard Colaco</a>, <a href="#">Unnat Jain</a>, <a href="#">Sharad Mehrotra</a>
          </div>
          <div className="affil">University of California, Irvine</div>
          <div className="venue">ICML 2026</div>
          <div className="btns">
            <a className="btn" href="#"><span>📄</span> Paper</a>
            <a className="btn ghost" href="https://anonymous.4open.science/r/lazystack-5DC4/"><span>💻</span> Code</a>
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

      {/* INTERACTIVE DEMO */}
      <section>
        <div className="wrap">
          <h2 className="section-title">Watch it run, on one input</h2>
          <p className="section-sub">
            Models execute one at a time along the MDP trajectory. A substacker aggregates predictions after each step;
            the cascade <b>exits early</b> once confidence crosses θ = 0.85 — often before a single model alone would even be correct.
          </p>
          <CascadeDemo />
        </div>
      </section>

      {/* METHOD */}
      <section className="section-soft">
        <div className="wrap">
          <h2 className="section-title">How LazyStack works</h2>
          <p className="section-sub">Two offline components, one online inference loop.</p>
          <MethodDiagram />
        </div>
      </section>

      {/* WHY IT SCALES */}
      <section>
        <div className="wrap">
          <h2 className="section-title">Why it scales</h2>
          <p className="section-sub">
            Despite 2ᵏ possible execution paths, a handful of trajectories dominate, and most inputs exit after just two or three models.
          </p>
          <TrajectoryLandscape />
        </div>
      </section>

      {/* QUALITATIVE FIGURE */}
      <section className="section-soft">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <h2 className="section-title">Stacking corrects, cascading exits early</h2>
          <img className="fig" src="./figures/case_study_centerpiece.png" alt="LazyStack case studies on an image and a text input" />
          <p className="fig-cap">
            On a hard input, the first model alone is wrong; stacking successive predictions corrects it,
            and the cascade exits once confident — without running the full ensemble.
          </p>
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
  author    = {Colaco, Ashwin Gerard and Jain, Unnat and Mehrotra, Sharad},
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
