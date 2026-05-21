import React, { useEffect, useRef, useState } from 'react'

// Fades + slides children up when they scroll into view.
export default function Reveal({ children, style }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    // Safety: never leave content hidden if the observer doesn't fire.
    const fallback = setTimeout(() => setShown(true), 1600)
    return () => { io.disconnect(); clearTimeout(fallback) }
  }, [])
  return (
    <div ref={ref} className={`reveal${shown ? ' in' : ''}`} style={style}>
      {children}
    </div>
  )
}
