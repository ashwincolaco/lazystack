import React, { useEffect, useState } from 'react'
import Icon from './Icon'

const LINKS = [
  ['abstract', 'Abstract'],
  ['demo', 'Demo'],
  ['method', 'Method'],
  ['scale', 'Why it scales'],
  ['results', 'Results'],
]

export default function NavBar({ paperUrl }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('abstract')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    LINKS.forEach(([id]) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="row">
        <a href="#top" className="brand"><span className="mark" /> LazyStack</a>
        <div className="links">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>{label}</a>
          ))}
          <a className="cta" href={paperUrl}><Icon name="paper" size={14} /> Paper</a>
        </div>
      </div>
    </nav>
  )
}
