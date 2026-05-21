import React from 'react'

// Hand-built SVG teaser contrasting the full stacker (run every model) with
// LazyStack (MDP trajectory + early exit). Mirrors the academic-infographic style.
const col = {
  ink: '#0f172a', slate: '#475569', mute: '#94a3b8', line: '#cbd5e1',
  blue: '#2563eb', green: '#10b981', red: '#ef4444', amber: '#f59e0b',
  indigo: '#6366f1', blueSoft: '#eef2ff', greenSoft: '#d1fae5', redSoft: '#fef2f2',
}

const Arrow = ({ x1, y1, x2, y2, color = col.slate, dashed }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), hl = 7
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.8} strokeDasharray={dashed ? '5,4' : 'none'} />
      <polygon fill={color} points={`${x2},${y2} ${x2 - hl * Math.cos(a - 0.4)},${y2 - hl * Math.sin(a - 0.4)} ${x2 - hl * Math.cos(a + 0.4)},${y2 - hl * Math.sin(a + 0.4)}`} />
    </g>
  )
}

const Box = ({ x, y, w, h, label, cost, fill, stroke, faded, dark }) => (
  <g opacity={faded ? 0.4 : 1}>
    <rect x={x} y={y} width={w} height={h} rx={7} fill={fill} stroke={stroke} strokeWidth={1.5} />
    <text x={x + w / 2} y={y + h / 2 - (cost ? 4 : -3)} textAnchor="middle" fontSize="12" fontWeight="600" fill={dark ? '#fff' : col.ink} fontFamily="Inter, sans-serif">{label}</text>
    {cost && <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" fontSize="10" fill={dark ? '#e2e8f0' : col.slate} fontFamily="Inter, sans-serif">{cost}</text>}
  </g>
)

export default function LazyStackTeaser() {
  const w = 960, h = 408
  const models = [
    ['mobilenet', '3 ms'], ['resnet18', '6 ms'], ['resnet50', '14 ms'],
    ['effnet-b0', '16 ms'], ['resnet101', '28 ms'], ['effnet-b3', '38 ms'],
  ]
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: 980, display: 'block', margin: '0 auto' }} xmlns="http://www.w3.org/2000/svg">
      {/* ---------------- LEFT: full stacker ---------------- */}
      <rect x={16} y={40} width={300} height={356} rx={12} fill={col.redSoft} stroke="#fecaca" strokeWidth={1} />
      <text x={166} y={66} textAnchor="middle" fontSize="14" fontWeight="700" fill={col.red} fontFamily="Inter, sans-serif">Full Stacker</text>
      <text x={166} y={84} textAnchor="middle" fontSize="11" fill={col.slate} fontFamily="Inter, sans-serif">run every model on every input</text>
      <Box x={116} y={98} w={100} h={26} label="input" fill="#fff" stroke={col.line} />
      {models.map((m, i) => (
        <g key={m[0]}>
          <Arrow x1={166} y1={124 + i * 38} x2={166} y2={132 + i * 38} color="#f87171" />
          <Box x={86} y={132 + i * 38} w={160} h={28} label={m[0]} cost={m[1]} fill="#fee2e2" stroke="#f87171" />
        </g>
      ))}
      <text x={166} y={378} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={col.red} fontFamily="Inter, sans-serif">105 ms · 1× · full accuracy</text>

      {/* center vs */}
      <text x={345} y={205} textAnchor="middle" fontSize="15" fontWeight="800" fill={col.mute} fontFamily="Inter, sans-serif">vs</text>

      {/* ---------------- RIGHT: LazyStack ---------------- */}
      <rect x={374} y={40} width={570} height={356} rx={12} fill={col.blueSoft} stroke="#c7d2fe" strokeWidth={1} />
      <text x={659} y={66} textAnchor="middle" fontSize="14" fontWeight="700" fill={col.blue} fontFamily="Inter, sans-serif">LazyStack</text>
      <text x={659} y={84} textAnchor="middle" fontSize="11" fill={col.slate} fontFamily="Inter, sans-serif">MDP-discovered trajectory + early exit via prefix substackers</text>

      <Box x={394} y={150} w={70} h={40} label="input" fill="#fff" stroke={col.line} />
      <Arrow x1={464} y1={170} x2={500} y2={170} color={col.slate} />

      {/* trajectory: resnet50 -> mobilenet -> [substacker] -> exit */}
      <Box x={500} y={150} w={92} h={40} label="resnet50" cost="14 ms" fill={col.blue} stroke={col.blue} dark />
      <Arrow x1={592} y1={170} x2={620} y2={170} color={col.slate} />
      <Box x={620} y={150} w={92} h={40} label="mobilenet" cost="3 ms" fill={col.blue} stroke={col.blue} dark />
      <Arrow x1={712} y1={170} x2={740} y2={170} color={col.slate} />

      {/* substacker + confidence gate */}
      <rect x={740} y={146} width={96} height={48} rx={8} fill="#f5f3ff" stroke={col.indigo} strokeWidth={1.5} />
      <text x={788} y={166} textAnchor="middle" fontSize="11" fontWeight="600" fill={col.indigo} fontFamily="Inter, sans-serif">substacker</text>
      <text x={788} y={181} textAnchor="middle" fontSize="9.5" fill={col.slate} fontFamily="Inter, sans-serif">conf 0.91 &gt; θ</text>

      <Arrow x1={836} y1={170} x2={868} y2={170} color={col.green} />
      <rect x={868} y={150} width={74} height={40} rx={8} fill={col.greenSoft} stroke={col.green} strokeWidth={1.5} />
      <text x={905} y={167} textAnchor="middle" fontSize="11" fontWeight="700" fill="#059669" fontFamily="Inter, sans-serif">exit ✓</text>
      <text x={905} y={181} textAnchor="middle" fontSize="9" fill="#059669" fontFamily="Inter, sans-serif">prediction</text>

      {/* skipped models, faded */}
      <text x={659} y={232} textAnchor="middle" fontSize="10.5" fill={col.mute} fontFamily="Inter, sans-serif">remaining models never run on this input:</text>
      {['effnet-b0', 'resnet101', 'effnet-b3'].map((m, i) => (
        <Box key={m} x={500 + i * 100} y={244} w={90} h={26} label={m} fill="#fff" stroke={col.line} faded />
      ))}

      {/* counterintuitive ordering note */}
      <text x={659} y={300} textAnchor="middle" fontSize="11" fill={col.slate} fontFamily="Inter, sans-serif">MDP starts with the moderately-priced resnet50, not the cheapest model —</text>
      <text x={659} y={316} textAnchor="middle" fontSize="11" fill={col.slate} fontFamily="Inter, sans-serif">its higher confidence triggers an earlier overall exit.</text>
      <text x={659} y={348} textAnchor="middle" fontSize="12" fontWeight="700" fill={col.green} fontFamily="Inter, sans-serif">17 ms · ~6× faster · ensemble-quality prediction</text>
    </svg>
  )
}
