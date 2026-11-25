// A curled cat seen from above: body, tail, head tucked in, closed eyes and a
// small "z". Furs vary by cushion; dark furs get light eyelids so they show.
export const FURS = [
  { fur: '#e8a832', belly: '#f5c860' }, // ginger
  { fur: '#8b8f98', belly: '#b9bcc3' }, // grey
  { fur: '#2b2725', belly: '#5a524c', dark: true }, // black
  { fur: '#f3efe6', belly: '#e6dccb' }, // white
  { fur: '#c97b3c', belly: '#e2a46a' }, // orange
  { fur: '#6e5a4a', belly: '#9a8370', dark: true }, // brown tabby
  { fur: '#d9c3a5', belly: '#efe2cc' }, // cream
  { fur: '#4a4f5c', belly: '#7a8091', dark: true }, // blue
  { fur: '#b0603a', belly: '#d68e66' }, // red
]

const INK = '#161310'

export default function SleepingCat({ index = 0, z = 0, className = 'cat' }) {
  const { fur, belly, dark } = FURS[index % FURS.length]
  const lid = dark ? '#f4efe6' : INK
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g className="cat-body">
        <ellipse cx="33" cy="38" rx="24" ry="18" fill={fur} stroke={INK} strokeWidth="2.4" />
        <path d="M12 44 Q8 58 26 56 Q44 55 52 47" fill="none" stroke={fur} strokeWidth="7" strokeLinecap="round" />
        <path d="M12 44 Q8 58 26 56 Q44 55 52 47" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="34" cy="40" rx="12" ry="8" fill={belly} opacity=".7" />
        <circle cx="22" cy="30" r="13" fill={fur} stroke={INK} strokeWidth="2.4" />
        <polygon points="12,22 9,10 19,18" fill={fur} stroke={INK} strokeWidth="2" />
        <polygon points="28,18 33,8 33,21" fill={fur} stroke={INK} strokeWidth="2" />
        <path d="M14 30 Q17 33 20 30" fill="none" stroke={lid} strokeWidth="2" strokeLinecap="round" />
        <path d="M24 30 Q27 33 30 30" fill="none" stroke={lid} strokeWidth="2" strokeLinecap="round" />
        <polygon points="22,34 20.6,35.6 23.4,35.6" fill="#e2503f" />
      </g>
      <text className="cat-z" x="44" y="16" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize={9 + z} fill="#6a6157">
        z
      </text>
    </svg>
  )
}
