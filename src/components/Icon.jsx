import React from 'react'

// Crisp inline SVG icons (stroke-based, currentColor) — replaces emoji.
const paths = {
  paper: <><path d="M6 2h7l5 5v15a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V2z" /><path d="M13 2v5h5" /><path d="M9 13h6M9 17h6" /></>,
  code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
  quote: <><path d="M7 7H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3l3-3V9a2 2 0 0 0-2-2z" /><path d="M19 7h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3l3-3V9a2 2 0 0 0-2-2z" /></>,
  play: <polygon points="6 4 20 12 6 20 6 4" />,
  pause: <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>,
  step: <><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></>,
  reset: <><polyline points="1 4 1 10 7 10" /><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" /></>,
  replay: <><polyline points="23 4 23 10 17 10" /><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  text: <><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></>,
  bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
}

export default function Icon({ name, size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
