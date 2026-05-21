import React from 'react'
import Icon from './components/Icon'
import Reveal from './components/Reveal'
import NavBar from './components/NavBar'
import HeroDemo from './components/HeroDemo'
import MethodDiagram from './components/MethodDiagram'
import TrajectoryLandscape from './components/TrajectoryLandscape'
import TraceGrid from './components/TraceGrid'
import Playground from './components/Playground'
import TrajectorySankey from './components/TrajectorySankey'
import OrderingToggle from './components/OrderingToggle'

const PAPER_URL = 'https://icml.cc/virtual/2026/poster/63422'
const CODE_URL = 'https://anonymous.4open.science/r/lazystack-5DC4/'

const AUTHORS = [
  'Ashwin Colaço', 'Sharad Mehrotra', 'Michael De Lucia', 'Kevin Hamlen',
  'Murat Kantarcioglu', 'Latifur Khan', 'Ananthram Swami', 'Bhavani Thuraisingham', 'Unnat Jain',
]

const Head = ({ eyebrow, title, sub }) => (
  <div className="section-head">
    <span className="eyebrow">{eyebrow}</span>
    <h2 className="section-title">{title}</h2>
    {sub && <p className="section-sub">{sub}</p>}
  </div>
)

export default function App() {
  return (
    <>
      <NavBar paperUrl={PAPER_URL} />
      {/* HERO */}
      <header className="hero" id="top">
        <div className="blob b1" /><div className="blob b2" />
        <div className="wrap">
          <span className="eyebrow">ICML 2026</span>
          <h1>Unifying <span className="gradient-text">Stacking</span> and <span className="gradient-text">Cascading</span><br />for Efficient Ensemble Inference</h1>
          <div className="authors">
            {AUTHORS.map((a, i) => (
              <span key={a}><a href={PAPER_URL}>{a}</a>{i < AUTHORS.length - 1 ? ', ' : ''}</span>
            ))}
          </div>
          {/* TODO(affiliations): ICML page lists no affiliations; institutions below are the collaborating labs — confirm. */}
          <div className="affil">University of California, Irvine · University of Texas at Dallas · DEVCOM Army Research Laboratory</div>
          <div className="btns">
            <a className="btn primary" href={PAPER_URL}><Icon name="paper" /> Paper</a>
            <a className="btn ghost" href={CODE_URL}><Icon name="code" /> Code</a>
            <a className="btn ghost" href="#bibtex"><Icon name="quote" /> BibTeX</a>
          </div>
        </div>
      </header>

      {/* ANIMATED HERO DEMO */}
      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <HeroDemo />
          <p className="tagline" style={{ marginTop: 30 }}>
            Ensemble-quality predictions at <span className="hl">cascade-level cost</span> — up to{' '}
            <span className="hl">38× speedup</span> at <span className="hl">97%+ accuracy retention</span>.
          </p>
        </div>
      </section>

      {/* ABSTRACT */}
      <section className="section-soft" id="abstract">
        <div className="wrap">
          <Reveal>
            <Head eyebrow="Abstract" title="Ensemble accuracy, cascade cost" />
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
          </Reveal>
        </div>
      </section>

      {/* PLAYGROUND */}
      <section id="demo">
        <div className="wrap">
          <Reveal>
            <Head eyebrow="Interactive" title="Tune the accuracy–speed tradeoff"
              sub="Drag the exit threshold θ and cost-weight α and watch LazyStack move along its Pareto frontier — it dominates ABC at every operating point." />
            <Playground />
          </Reveal>
        </div>
      </section>

      {/* ORDERING */}
      <section>
        <div className="wrap">
          <Reveal>
            <Head eyebrow="Interactive" title="Why the ordering is counterintuitive"
              sub="Starting with a pricier model can be cheaper overall. Toggle the two orderings." />
            <OrderingToggle />
          </Reveal>
        </div>
      </section>

      {/* TRACE GRID */}
      <section className="section-soft">
        <div className="wrap">
          <Reveal>
            <Head eyebrow="Qualitative" title="Case by case: LazyStack vs. cascade baselines"
              sub="The same inputs, routed by each method. Baselines exit early-and-wrong or run nearly everything; LazyStack stacks just enough to correct, then exits." />
            <TraceGrid />
          </Reveal>
        </div>
      </section>

      {/* METHOD */}
      <section id="method">
        <div className="wrap">
          <Reveal>
            <Head eyebrow="Method" title="How LazyStack works" sub="Two offline components, one online inference loop." />
            <MethodDiagram />
          </Reveal>
        </div>
      </section>

      {/* WHY IT SCALES */}
      <section className="section-soft" id="scale">
        <div className="wrap">
          <Reveal>
            <Head eyebrow="Analysis" title="Why it scales: trajectory concentration"
              sub="Despite 2ᵏ possible execution paths, a handful of trajectories dominate, and most inputs exit after just two or three models." />
            <TrajectorySankey />
            <div style={{ height: 28 }} />
            <TrajectoryLandscape />
          </Reveal>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results">
        <div className="wrap">
          <Reveal>
            <Head eyebrow="Results" title="Results at a glance" />
            <div className="stats">
              <div className="stat"><div className="num">38×</div><div className="lbl">speedup on NSL-KDD (vs full ensemble)</div></div>
              <div className="stat"><div className="num">97%+</div><div className="lbl">accuracy retention across 8 benchmarks</div></div>
              <div className="stat"><div className="num">3–8</div><div className="lbl">trajectories cover 95%+ of inputs</div></div>
            </div>
            <p className="prose" style={{ marginTop: 30, fontSize: 16 }}>
              LazyStack achieves the highest accuracy among efficient methods on MMLU, ARC-Challenge, and HEADLINES;
              on NSL-KDD it is 7× faster than ABC while also more accurate; and it matches or exceeds the white-box
              Gatekeeper baseline using probability outputs only.
            </p>
          </Reveal>
        </div>
      </section>

      {/* BIBTEX */}
      <section className="section-soft" id="bibtex">
        <div className="wrap">
          <Reveal>
            <Head eyebrow="Cite" title="BibTeX" />
            <pre className="bibtex">{`@inproceedings{colaco2026lazystack,
  title     = {Unifying Stacking and Cascading for Efficient Ensemble Inference},
  author    = {Cola\\c{c}o, Ashwin and Mehrotra, Sharad and De Lucia, Michael and
               Hamlen, Kevin and Kantarcioglu, Murat and Khan, Latifur and
               Swami, Ananthram and Thuraisingham, Bhavani and Jain, Unnat},
  booktitle = {International Conference on Machine Learning (ICML)},
  year      = {2026}
}`}</pre>
          </Reveal>
        </div>
      </section>

      <footer>
        LazyStack · ICML 2026 · built with React + Vite.
      </footer>
    </>
  )
}
