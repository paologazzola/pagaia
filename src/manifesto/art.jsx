/* Panel artwork for Pagaia-Man #1. Text that readers need (captions and dialogue)
   lives in episodes/origin.jsx; the drawings below stay decorative. */

/* ── Reusable SVG defs (Ben-Day dots, speed lines) ──────── */
function SvgDefs() {
  return (
    <defs>
      <pattern id="bd-blue" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="2.2" fill="#4a9eff" opacity="0.35" />
      </pattern>
      <pattern id="bd-red" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="2.2" fill="#e63946" opacity="0.3" />
      </pattern>
      <pattern id="bd-yellow" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="2.2" fill="#f5e642" opacity="0.4" />
      </pattern>
      <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
      </pattern>
    </defs>
  )
}

/* ── Nerd hero character ── */
// pose: 'sit' | 'stand' | 'run' | 'point' | 'fist'
// hero: false = programmer hoodie, true = superhero cape
function Hero({ x = 0, y = 0, scale = 1, hero = false, pose = 'stand', flipped = false }) {
  const tx = flipped ? `translate(${x},${y}) scale(${-scale},${scale}) translate(-60,0)` : `translate(${x},${y}) scale(${scale})`
  const skin = '#f4c07a'
  const suit = hero ? '#1a5fb4' : '#3d5a80'
  const cape = '#e63946'

  return (
    <g transform={tx}>
      {/* Cape back (hero only) */}
      {hero && pose !== 'sit' && (
        <path d="M22 38 L0 90 L18 78 L20 95 L35 75" fill={cape} stroke="#000" strokeWidth="2.5" />
      )}

      {/* Torso */}
      {pose === 'sit'
        ? <rect x="20" y="50" width="40" height="38" rx="6" fill={suit} stroke="#000" strokeWidth="2.5" />
        : <rect x="18" y="45" width="44" height="42" rx="7" fill={suit} stroke="#000" strokeWidth="2.5" />
      }

      {/* Paddle symbol on chest (hero only) */}
      {hero && (
        <g>
          <ellipse cx="40" cy="60" rx="7" ry="3" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <rect x="38.5" y="60" width="3" height="12" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <ellipse cx="40" cy="72" rx="7" ry="3" fill="#fff" stroke="#000" strokeWidth="1.5" />
        </g>
      )}

      {/* Head */}
      <ellipse cx="40" cy="32" rx="22" ry="20" fill={skin} stroke="#000" strokeWidth="3" />

      {/* Hair (messy) */}
      <path d="M20 26 Q22 10 30 14 Q40 6 50 14 Q58 10 60 26" fill="#2d1b00" stroke="#000" strokeWidth="2" />

      {/* Glasses */}
      <rect x="24" y="28" width="13" height="9" rx="3" fill="white" stroke="#000" strokeWidth="2" />
      <rect x="43" y="28" width="13" height="9" rx="3" fill="white" stroke="#000" strokeWidth="2" />
      <line x1="37" y1="32" x2="43" y2="32" stroke="#000" strokeWidth="1.5" />
      <line x1="18" y1="31" x2="24" y2="31" stroke="#000" strokeWidth="1.5" />
      <line x1="56" y1="31" x2="62" y2="31" stroke="#000" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="30" cy="32" r="2.5" fill="#333" />
      <circle cx="49" cy="32" r="2.5" fill="#333" />
      {/* Highlights on glasses */}
      <circle cx="26" cy="30" r="1" fill="white" opacity="0.7" />
      <circle cx="45" cy="30" r="1" fill="white" opacity="0.7" />

      {/* Mouth */}
      {pose === 'sit'
        ? <path d="M32 42 Q40 39 48 42" fill="none" stroke="#000" strokeWidth="2" />
        : <path d="M30 42 Q40 48 50 42" fill="none" stroke="#000" strokeWidth="2.5" />
      }

      {/* Arms */}
      {pose === 'sit' && (
        <>
          <rect x="0" y="52" width="22" height="12" rx="6" fill={suit} stroke="#000" strokeWidth="2" />
          <rect x="58" y="52" width="22" height="12" rx="6" fill={suit} stroke="#000" strokeWidth="2" />
          {/* Hands on desk */}
          <ellipse cx="8" cy="61" rx="9" ry="7" fill={skin} stroke="#000" strokeWidth="2" />
          <ellipse cx="72" cy="61" rx="9" ry="7" fill={skin} stroke="#000" strokeWidth="2" />
        </>
      )}
      {pose === 'stand' && (
        <>
          <rect x="4" y="47" width="16" height="32" rx="7" fill={suit} stroke="#000" strokeWidth="2" />
          <rect x="60" y="47" width="16" height="32" rx="7" fill={suit} stroke="#000" strokeWidth="2" />
          <ellipse cx="10" cy="80" rx="9" ry="8" fill={skin} stroke="#000" strokeWidth="2" />
          <ellipse cx="70" cy="80" rx="9" ry="8" fill={skin} stroke="#000" strokeWidth="2" />
        </>
      )}
      {pose === 'fist' && (
        <>
          {/* Left arm down */}
          <rect x="4" y="47" width="16" height="32" rx="7" fill={suit} stroke="#000" strokeWidth="2" />
          {/* Right arm raised */}
          <rect x="60" y="20" width="16" height="30" rx="7" fill={suit} stroke="#000" strokeWidth="2" transform="rotate(20,68,35)" />
          <ellipse cx="10" cy="80" rx="9" ry="8" fill={skin} stroke="#000" strokeWidth="2" />
          {/* Fist up */}
          <rect x="68" y="10" width="14" height="12" rx="4" fill={skin} stroke="#000" strokeWidth="2" transform="rotate(20,75,16)" />
        </>
      )}
      {pose === 'point' && (
        <>
          <rect x="4" y="47" width="16" height="32" rx="7" fill={suit} stroke="#000" strokeWidth="2" />
          {/* Right arm pointing */}
          <rect x="58" y="44" width="30" height="12" rx="6" fill={suit} stroke="#000" strokeWidth="2" />
          <ellipse cx="10" cy="80" rx="9" ry="8" fill={skin} stroke="#000" strokeWidth="2" />
          {/* pointing finger */}
          <ellipse cx="91" cy="50" rx="5" ry="7" fill={skin} stroke="#000" strokeWidth="2" transform="rotate(-15,91,50)" />
        </>
      )}
      {pose === 'run' && (
        <>
          <rect x="4" y="40" width="16" height="28" rx="7" fill={suit} stroke="#000" strokeWidth="2" transform="rotate(-20,12,54)" />
          <rect x="60" y="40" width="16" height="28" rx="7" fill={suit} stroke="#000" strokeWidth="2" transform="rotate(20,68,54)" />
          <ellipse cx="6" cy="64" rx="9" ry="7" fill={skin} stroke="#000" strokeWidth="2" />
          <ellipse cx="74" cy="64" rx="9" ry="7" fill={skin} stroke="#000" strokeWidth="2" />
        </>
      )}

      {/* Legs */}
      {pose !== 'sit' && (
        <>
          <rect x="23" y="84" width="16" height="34" rx="7" fill={hero ? '#1a5fb4' : '#2b3a50'} stroke="#000" strokeWidth="2.5"
            transform={pose === 'run' ? 'rotate(-15,31,101)' : ''} />
          <rect x="41" y="84" width="16" height="34" rx="7" fill={hero ? '#1a5fb4' : '#2b3a50'} stroke="#000" strokeWidth="2.5"
            transform={pose === 'run' ? 'rotate(15,49,101)' : ''} />
          {/* Boots */}
          <rect x="20" y="112" width="20" height="12" rx="4" fill={hero ? cape : '#111'} stroke="#000" strokeWidth="2" />
          <rect x="40" y="112" width="20" height="12" rx="4" fill={hero ? cape : '#111'} stroke="#000" strokeWidth="2" />
        </>
      )}
    </g>
  )
}

/* ── Monitor component ── */
function Monitor({ x, y, w = 100, h = 75, screenColor = '#0a0a1a', children }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill="#444" stroke="#000" strokeWidth="3" />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 15} fill={screenColor} />
      {/* stand */}
      <rect x={x + w / 2 - 6} y={y + h} width="12" height="8" fill="#333" stroke="#000" strokeWidth="2" />
      <rect x={x + w / 2 - 16} y={y + h + 8} width="32" height="5" rx="2" fill="#333" stroke="#000" strokeWidth="2" />
      {children}
    </g>
  )
}

/* ── Speed lines (action background) ── */
function SpeedLines({ cx, cy, n = 20, r1 = 20, r2 = 300, color = '#000', opacity = 0.12 }) {
  const lines = []
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2
    const x1 = cx + Math.cos(angle) * r1
    const y1 = cy + Math.sin(angle) * r1
    const x2 = cx + Math.cos(angle) * r2
    const y2 = cy + Math.sin(angle) * r2
    lines.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" opacity={opacity} />)
  }
  return <g>{lines}</g>
}

/* ─────────────────────────────────────────────────────────
   PANELS
───────────────────────────────────────────────────────── */

export function Panel1Art() {
  return (
    <svg viewBox="0 0 560 310" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      {/* Dark room */}
      <rect width="560" height="310" fill="#12192e" />
      <rect width="560" height="310" fill="url(#bd-blue)" />
      {/* Floor / desk shadow */}
      <rect x="0" y="230" width="560" height="80" fill="#0a1020" />
      {/* Desk – full width */}
      <rect x="10" y="220" width="540" height="16" rx="4" fill="#5c3d2e" stroke="#000" strokeWidth="3" />
      <rect x="10" y="234" width="540" height="60" fill="#3d2112" stroke="#000" strokeWidth="2" />

      {/* ── Monitors: LEFT side (x=15..395) ── */}
      <Monitor x={15} y={118} w={118} h={98} screenColor="#200a0a">
        <text x="74" y="155" textAnchor="middle" fill="#ff4444" fontSize="11" fontWeight="bold" fontFamily="monospace">ERROR 500</text>
        <text x="74" y="170" textAnchor="middle" fill="#ff6666" fontSize="8" fontFamily="monospace">Internal Server Error</text>
        <text x="74" y="183" textAnchor="middle" fill="#ff3333" fontSize="9" fontFamily="monospace">:(</text>
      </Monitor>

      <Monitor x={143} y={100} w={148} h={116} screenColor="#0a1a0a">
        <text x="150" y="124" fill="#00ff41" fontSize="7.5" fontFamily="monospace">$ git push origin main</text>
        <text x="150" y="137" fill="#ff4444" fontSize="7.5" fontFamily="monospace">FATAL: segfault</text>
        <text x="150" y="150" fill="#ffff00" fontSize="7.5" fontFamily="monospace">ERROR: null ptr deref</text>
        <text x="150" y="163" fill="#ff4444" fontSize="7.5" fontFamily="monospace">Build failed. 42 errors.</text>
        <text x="150" y="176" fill="#ff4444" fontSize="7.5" fontFamily="monospace">ABORT ABORT ABORT</text>
        <text x="150" y="189" fill="#00ff41" fontSize="7.5" fontFamily="monospace">▮</text>
      </Monitor>

      <Monitor x={301} y={120} w={115} h={95} screenColor="#1a1000">
        <text x="358" y="156" textAnchor="middle" fill="#ff8800" fontSize="14" fontWeight="bold" fontFamily="monospace">404</text>
        <text x="358" y="172" textAnchor="middle" fill="#ff8800" fontSize="8" fontFamily="monospace">Not Found</text>
        <text x="358" y="185" textAnchor="middle" fill="#ff6600" fontSize="8" fontFamily="monospace">¯\_(ツ)_/¯</text>
      </Monitor>

      {/* Coffee cup (between monitors and hero) */}
      <rect x="425" y="202" width="20" height="26" rx="3" fill="#6b4c11" stroke="#000" strokeWidth="2" />
      <rect x="423" y="200" width="24" height="5" rx="3" fill="#8a6320" stroke="#000" strokeWidth="1.5" />
      <path d="M429 198 Q431 192 429 187" fill="none" stroke="#bbb" strokeWidth="1.5" />
      <path d="M435 198 Q437 192 435 187" fill="none" stroke="#bbb" strokeWidth="1.5" />
      {/* tipped over cup */}
      <g transform="translate(508,210) rotate(100)">
        <rect x="-8" y="-12" width="16" height="22" rx="3" fill="#6b4c11" stroke="#000" strokeWidth="2" />
      </g>
      <ellipse cx="500" cy="220" rx="10" ry="4" fill="#3d1a00" opacity="0.5" />

      {/* ── Hero: RIGHT side, flipped (looks LEFT toward monitors) ── */}
      <Hero x={435} y={108} scale={0.82} hero={false} pose="sit" flipped={true} />

      {/* Green monitor glow on hero's face */}
      <ellipse cx="465" cy="178" rx="16" ry="7" fill="#00ff41" opacity="0.1" />
    </svg>
  )
}

export function Panel2Art() {
  return (
    <svg viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      {/* Flash background */}
      <rect width="260" height="280" fill="#fff" />
      <SpeedLines cx={130} cy={140} n={28} r1={10} r2={300} color="#f5e642" opacity={0.8} />
      <SpeedLines cx={130} cy={140} n={14} r1={15} r2={300} color="#000" opacity={0.06} />
      {/* Inner glow */}
      <circle cx="130" cy="140" r="80" fill="#f5e642" opacity="0.5" />
      <circle cx="130" cy="140" r="45" fill="#fff" opacity="0.8" />

      {/* Character shocked */}
      <Hero x={80} y={100} scale={0.9} hero={false} pose="stand" />
      {/* Shock lines around head */}
      <line x1="148" y1="110" x2="170" y2="95" stroke="#f5e642" strokeWidth="3" />
      <line x1="152" y1="120" x2="178" y2="118" stroke="#f5e642" strokeWidth="3" />
      <line x1="148" y1="130" x2="170" y2="142" stroke="#f5e642" strokeWidth="3" />
      <line x1="85" y1="110" x2="63" y2="95" stroke="#f5e642" strokeWidth="3" />
      <line x1="80" y1="122" x2="55" y2="120" stroke="#f5e642" strokeWidth="3" />

      {/* Light bulb idea */}
      <ellipse cx="195" cy="55" rx="22" ry="25" fill="#f5e642" stroke="#000" strokeWidth="3" />
      <rect x="188" y="76" width="14" height="8" rx="2" fill="#ddd" stroke="#000" strokeWidth="2" />
      <line x1="195" y1="30" x2="195" y2="22" stroke="#f5e642" strokeWidth="2" />
      <line x1="218" y1="40" x2="226" y2="34" stroke="#f5e642" strokeWidth="2" />
      <line x1="172" y1="40" x2="164" y2="34" stroke="#f5e642" strokeWidth="2" />

      {/* SFX */}
      <text x="50" y="80" fill="#e63946" fontSize="32" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="2" paintOrder="stroke">ZAP!</text>
    </svg>
  )
}

export function Panel3Art() {
  return (
    <svg viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      <rect width="260" height="280" fill="#e8f0ff" />
      <rect width="260" height="280" fill="url(#bd-blue)" />
      <SpeedLines cx={130} cy={160} n={24} r1={30} r2={320} color="#1a5fb4" opacity={0.1} />

      {/* Hero transformation */}
      <Hero x={94} y={110} scale={1.04} hero={true} pose="fist" />

      {/* Glow around paddle symbol */}
      <ellipse cx="138" cy="210" rx="22" ry="22" fill="#f5e642" opacity="0.28" />

      {/* Whoosh */}
      <path d="M16 212 Q82 190 126 210 Q84 232 16 212" fill="#4a9eff" opacity="0.28" stroke="#4a9eff" strokeWidth="2" />
      <path d="M252 184 Q190 164 144 184 Q192 202 252 184" fill="#e63946" opacity="0.28" stroke="#e63946" strokeWidth="2" />

      <text x="20" y="60" fill="#f5e642" fontSize="22" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="2" paintOrder="stroke" transform="rotate(-8,20,60)">WHOOOOSH!</text>
    </svg>
  )
}

export function Panel4Art() {
  return (
    <svg viewBox="0 0 560 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      <rect width="560" height="260" fill="#0a1020" />
      <rect width="560" height="260" fill="url(#bd-blue)" />

      {/* Desk */}
      <rect x="0" y="200" width="560" height="60" fill="#3d2112" stroke="#000" strokeWidth="3" />
      <rect x="0" y="196" width="560" height="10" fill="#5c3d2e" stroke="#000" strokeWidth="2" />

      {/* ── Hero: LEFT side, flipped (looks RIGHT toward monitors) ── */}
      <Hero x={18} y={90} scale={0.88} hero={true} pose="sit" flipped={true} />

      {/* SFX above hero */}
      <text x="22" y="68" fill="#f5e642" fontSize="24" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="2" paintOrder="stroke" transform="rotate(-6,22,68)">CLACK!</text>

      {/* ── Monitors: RIGHT side ── */}
      <Monitor x={115} y={85} w={148} h={110} screenColor="#0a1a0a">
        <text x="122" y="108" fill="#00ff41" fontSize="7.5" fontFamily="monospace">const pagaia = {`{`}</text>
        <text x="122" y="121" fill="#00ff41" fontSize="7.5" fontFamily="monospace">  name: 'pagaia.xyz',</text>
        <text x="122" y="134" fill="#00ff41" fontSize="7.5" fontFamily="monospace">  mission: 'change world',</text>
        <text x="122" y="147" fill="#00ff41" fontSize="7.5" fontFamily="monospace">  power: Infinity</text>
        <text x="122" y="160" fill="#00ff41" fontSize="7.5" fontFamily="monospace">{`}`}</text>
        <text x="122" y="173" fill="#00ff41" fontSize="7.5" fontFamily="monospace">▮</text>
      </Monitor>

      <Monitor x={273} y={65} w={165} h={130} screenColor="#0a0a1a">
        <text x="280" y="91" fill="#4a9eff" fontSize="7.5" fontFamily="monospace">// PAGAIA CORE ENGINE</text>
        <text x="280" y="105" fill="#f5e642" fontSize="7.5" fontFamily="monospace">function paddle(world) {`{`}</text>
        <text x="280" y="119" fill="#fff" fontSize="7.5" fontFamily="monospace">  return world.transform(</text>
        <text x="280" y="133" fill="#fff" fontSize="7.5" fontFamily="monospace">    (chaos) =&gt; order</text>
        <text x="280" y="147" fill="#f5e642" fontSize="7.5" fontFamily="monospace">  );</text>
        <text x="280" y="161" fill="#f5e642" fontSize="7.5" fontFamily="monospace">{`}`}</text>
        <text x="280" y="175" fill="#00ff41" fontSize="7.5" fontFamily="monospace">✓ Build successful!</text>
      </Monitor>

      <Monitor x={448} y={85} w={100} h={110} screenColor="#1a0a1a">
        <text x="455" y="108" fill="#ff88ff" fontSize="7.5" fontFamily="monospace">pagaia.xyz</text>
        <text x="455" y="121" fill="#fff" fontSize="7.5" fontFamily="monospace">Loading...</text>
        <rect x="455" y="130" width="85" height="7" fill="#333" rx="3" />
        <rect x="455" y="130" width="57" height="7" fill="#f5e642" rx="3" />
        <text x="455" y="148" fill="#aaa" fontSize="7" fontFamily="monospace">78%...</text>
        <text x="455" y="161" fill="#00ff41" fontSize="7.5" fontFamily="monospace">npm run build</text>
        <text x="455" y="174" fill="#00ff41" fontSize="7.5" fontFamily="monospace">▮</text>
      </Monitor>

      {/* TAK TAK SFX over monitors */}
      <text x="390" y="55" fill="#fff" fontSize="20" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="2" paintOrder="stroke" transform="rotate(4,390,55)">TAK TAK!</text>

      {/* Pizza box (far right on desk) */}
      <rect x="460" y="186" width="48" height="10" rx="2" fill="#e8a832" stroke="#000" strokeWidth="2" />
      <rect x="463" y="183" width="42" height="8" rx="2" fill="#f5c842" stroke="#000" strokeWidth="1.5" />
    </svg>
  )
}

export function Panel5Art() {
  return (
    <svg viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      <rect width="260" height="280" fill="#2a0a0a" />
      <rect width="260" height="280" fill="url(#bd-red)" />
      <SpeedLines cx={130} cy={150} n={20} r1={20} r2={300} color="#e63946" opacity={0.15} />

      {/* Bug monsters (error creatures) */}
      {/* Bug 1 – top left */}
      <g transform="translate(18,46)">
        <ellipse cx="35" cy="30" rx="30" ry="22" fill="#e63946" stroke="#000" strokeWidth="2.5" />
        <text x="35" y="40" textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
          <tspan x="35">NULL</tspan>
          <tspan x="35" dy="10">PTR</tspan>
        </text>
        {/* legs */}
        <line x1="10" y1="45" x2="0" y2="62" stroke="#000" strokeWidth="2.5" />
        <line x1="25" y1="48" x2="18" y2="66" stroke="#000" strokeWidth="2.5" />
        <line x1="45" y1="48" x2="48" y2="66" stroke="#000" strokeWidth="2.5" />
        <line x1="58" y1="45" x2="68" y2="62" stroke="#000" strokeWidth="2.5" />
        {/* antennae */}
        <line x1="22" y1="12" x2="12" y2="0" stroke="#000" strokeWidth="2" />
        <line x1="48" y1="12" x2="58" y2="0" stroke="#000" strokeWidth="2" />
        <circle cx="12" cy="0" r="3" fill="#e63946" stroke="#000" strokeWidth="1.5" />
        <circle cx="58" cy="0" r="3" fill="#e63946" stroke="#000" strokeWidth="1.5" />
        {/* angry eyes */}
        <circle cx="24" cy="20" r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <circle cx="46" cy="20" r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <circle cx="26" cy="20" r="2.5" fill="#000" />
        <circle cx="48" cy="20" r="2.5" fill="#000" />
      </g>

      {/* Bug 2 – top right */}
      <g transform="translate(150,38)">
        <ellipse cx="40" cy="28" rx="35" ry="20" fill="#ff8800" stroke="#000" strokeWidth="2.5" />
        <text x="40" y="42" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="bold" fontFamily="monospace">SEGFAULT</text>
        <line x1="12" y1="42" x2="2" y2="58" stroke="#000" strokeWidth="2.5" />
        <line x1="28" y1="46" x2="22" y2="64" stroke="#000" strokeWidth="2.5" />
        <line x1="52" y1="46" x2="56" y2="64" stroke="#000" strokeWidth="2.5" />
        <line x1="66" y1="42" x2="76" y2="58" stroke="#000" strokeWidth="2.5" />
        <line x1="20" y1="12" x2="10" y2="2" stroke="#000" strokeWidth="2" />
        <line x1="58" y1="12" x2="68" y2="2" stroke="#000" strokeWidth="2" />
        <circle cx="10" cy="2" r="3" fill="#ff8800" stroke="#000" strokeWidth="1.5" />
        <circle cx="68" cy="2" r="3" fill="#ff8800" stroke="#000" strokeWidth="1.5" />
        <circle cx="28" cy="18" r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <circle cx="52" cy="18" r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
        <circle cx="30" cy="18" r="2.5" fill="#000" />
        <circle cx="54" cy="18" r="2.5" fill="#000" />
      </g>

      {/* Hero fighting – karate pose */}
      <Hero x={68} y={120} scale={1.0} hero={true} pose="run" />

      {/* Punch lines */}
      <line x1="150" y1="165" x2="195" y2="148" stroke="#f5e642" strokeWidth="3" strokeDasharray="6 3" />

      {/* CRASH SFX */}
      <text x="30" y="260" fill="#f5e642" fontSize="38" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="2.5" paintOrder="stroke" transform="rotate(-6,30,260)">CRASH!</text>
    </svg>
  )
}

export function Panel6Art() {
  return (
    <svg viewBox="0 0 560 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      <rect width="560" height="300" fill="#0a1a0a" />
      <rect width="560" height="300" fill="url(#bd-yellow)" />
      <SpeedLines cx={280} cy={155} n={28} r1={35} r2={400} color="#f5e642" opacity={0.18} />

      {/* Big glowing pagaia symbol in center-left */}
      <circle cx="270" cy="158" r="80" fill="#f5e642" opacity="0.12" />
      <circle cx="270" cy="158" r="52" fill="#f5e642" opacity="0.22" />
      {/* Paddle shape – big version */}
      <ellipse cx="270" cy="122" rx="25" ry="11" fill="#f5e642" stroke="#000" strokeWidth="3" />
      <rect x="267" y="130" width="7" height="46" fill="#f5e642" stroke="#000" strokeWidth="3" />
      <ellipse cx="270" cy="182" rx="25" ry="11" fill="#f5e642" stroke="#000" strokeWidth="3" />
      <rect x="266" y="147" width="10" height="4" rx="2" fill="#000" opacity="0.4" />
      <rect x="266" y="155" width="10" height="4" rx="2" fill="#000" opacity="0.4" />
      <circle cx="270" cy="155" r="64" fill="none" stroke="#f5e642" strokeWidth="2" opacity="0.35" />

      {/* Hero pointing at the symbol */}
      <Hero x={62} y={95} scale={1.05} hero={true} pose="point" flipped={true} />

      {/* Monitor showing pagaia.xyz */}
      <Monitor x={360} y={65} w={180} h={165} screenColor="#0a1a0a">
        <text x="368" y="90" fill="#f5e642" fontSize="11" fontFamily="monospace" fontWeight="bold">pagaia.xyz</text>
        <ellipse cx="430" cy="110" rx="12" ry="5" fill="#f5e642" />
        <rect x="427.5" y="113" width="5" height="18" fill="#f5e642" />
        <ellipse cx="430" cy="133" rx="12" ry="5" fill="#f5e642" />
        <text x="368" y="158" fill="#00ff41" fontSize="8.5" fontFamily="monospace">✓ Build successful</text>
        <text x="368" y="170" fill="#00ff41" fontSize="8.5" fontFamily="monospace">✓ Tests passed</text>
        <text x="368" y="182" fill="#f5e642" fontSize="8.5" fontFamily="monospace">Ready to deploy!</text>
        <text x="368" y="196" fill="#aaa" fontSize="7.5" fontFamily="monospace">Press ENTER to launch...</text>
      </Monitor>

      {/* EUREKA SFX */}
      <text x="32" y="72" fill="#f5e642" fontSize="36" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="2.5" paintOrder="stroke" transform="rotate(-8,32,72)">EUREKA!</text>
    </svg>
  )
}

export function Panel7Art() {
  return (
    <svg viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      <rect width="260" height="280" fill="#1a0a2e" />
      <rect width="260" height="280" fill="url(#bd-blue)" />
      <SpeedLines cx={130} cy={200} n={18} r1={15} r2={300} color="#f5e642" opacity={0.2} />

      {/* Desk */}
      <rect x="0" y="220" width="260" height="60" fill="#3d2112" stroke="#000" strokeWidth="3" />

      {/* Close-up: finger over ENTER key */}
      {/* Hand / forearm */}
      <rect x="60" y="160" width="140" height="30" rx="15" fill="#3d5a80" stroke="#000" strokeWidth="2.5" />
      <ellipse cx="130" cy="163" rx="60" ry="18" fill="#f4c07a" stroke="#000" strokeWidth="2.5" />
      {/* Fingers */}
      <rect x="65" y="145" width="18" height="26" rx="9" fill="#f4c07a" stroke="#000" strokeWidth="2" />
      <rect x="88" y="138" width="18" height="32" rx="9" fill="#f4c07a" stroke="#000" strokeWidth="2" />
      <rect x="112" y="132" width="18" height="36" rx="9" fill="#f4c07a" stroke="#000" strokeWidth="2" />
      <rect x="136" y="138" width="18" height="30" rx="9" fill="#f4c07a" stroke="#000" strokeWidth="2" />
      <rect x="158" y="148" width="18" height="22" rx="9" fill="#f4c07a" stroke="#000" strokeWidth="2" />
      {/* Index finger pointing down to ENTER */}
      <rect x="109" y="115" width="20" height="42" rx="10" fill="#f4c07a" stroke="#000" strokeWidth="2.5" />
      <ellipse cx="119" cy="113" rx="10" ry="8" fill="#f4c07a" stroke="#000" strokeWidth="2" />

      {/* Keyboard */}
      <rect x="30" y="200" width="200" height="16" rx="4" fill="#222" stroke="#000" strokeWidth="2.5" />
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <rect key={i} x={35 + i * 16} y={202} width="13" height="11" rx="2" fill="#333" stroke="#555" strokeWidth="1" />
      ))}
      {/* ENTER key */}
      <rect x="155" y="199" width="68" height="13" rx="3" fill="#e63946" stroke="#000" strokeWidth="2.5" />
      <text x="189" y="209" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="monospace">ENTER</text>

      {/* BOOM SFX */}
      <text x="18" y="108" fill="#e63946" fontSize="44" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="3" paintOrder="stroke" transform="rotate(-10,20,95)">DEPLOY!</text>
      {/* Star burst */}
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return <line key={i} x1={132 + Math.cos(a) * 13} y1={60 + Math.sin(a) * 13}
          x2={132 + Math.cos(a) * 24} y2={60 + Math.sin(a) * 24}
          stroke="#f5e642" strokeWidth="3" />
      })}
      <circle cx="132" cy="60" r="11" fill="#f5e642" stroke="#000" strokeWidth="2" />
      <text x="132" y="65" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold" fontFamily="monospace">!</text>

    </svg>
  )
}

export function Panel8Art() {
  return (
    <svg viewBox="0 0 560 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      <rect width="560" height="280" fill="#0a1a2e" />
      <rect width="560" height="280" fill="url(#bd-blue)" />

      {/* Globe */}
      <circle cx="280" cy="150" r="105" fill="#1a5fb4" stroke="#000" strokeWidth="4" opacity="0.9" />
      <circle cx="280" cy="150" r="105" fill="none" stroke="#4a9eff" strokeWidth="1" opacity="0.4" />
      {/* Continents (simplified) */}
      {/* Europe/Africa */}
      <path d="M265 85 Q275 80 280 90 Q285 100 278 115 Q275 130 270 140 Q265 155 260 165 Q255 175 258 185 Q250 165 252 140 Q255 120 260 105 Z"
        fill="#2dc653" stroke="#000" strokeWidth="1.5" opacity="0.9" />
      {/* Americas */}
      <path d="M215 100 Q225 95 230 108 Q235 118 232 130 Q230 145 225 160 Q220 175 215 185 Q210 165 212 145 Q214 125 215 110 Z"
        fill="#2dc653" stroke="#000" strokeWidth="1.5" opacity="0.9" />
      {/* Asia */}
      <path d="M295 88 Q315 83 325 95 Q335 105 330 120 Q325 135 315 140 Q305 142 295 135 Q285 125 290 108 Z"
        fill="#2dc653" stroke="#000" strokeWidth="1.5" opacity="0.9" />

      {/* Connection lines to pagaia.xyz */}
      {[
        [222, 135], [275, 95], [318, 118], [240, 175], [310, 160], [185, 120]
      ].map(([px, py], i) => (
        <g key={i}>
          <line x1={px} y1={py} x2="280" y2="150" stroke="#f5e642" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.7" />
          <circle cx={px} cy={py} r="6" fill="#e63946" stroke="#000" strokeWidth="1.5" />
        </g>
      ))}

      {/* Center pagaia logo on globe */}
      <circle cx="280" cy="150" r="20" fill="#f5e642" stroke="#000" strokeWidth="2.5" />
      <ellipse cx="280" cy="140" rx="7" ry="3.5" fill="#000" />
      <rect x="277.5" y="141" width="5" height="16" fill="#000" />
      <ellipse cx="280" cy="159" rx="7" ry="3.5" fill="#000" />

      {/* People around the globe (simple figures) */}
      {[
        [60, 80], [480, 60], [70, 200], [490, 190], [160, 40], [390, 40]
      ].map(([px, py], i) => (
        <g key={i} transform={`translate(${px},${py}) scale(0.35)`}>
          <circle cx="40" cy="20" r="16" fill="#f4c07a" stroke="#000" strokeWidth="2.5" />
          <rect x="26" y="34" width="28" height="30" rx="5" fill={i % 2 === 0 ? '#e63946' : '#1a5fb4'} stroke="#000" strokeWidth="2" />
          {/* Excited lines */}
          <line x1="60" y1="18" x2="72" y2="10" stroke="#f5e642" strokeWidth="2" />
          <line x1="62" y1="24" x2="76" y2="22" stroke="#f5e642" strokeWidth="2" />
        </g>
      ))}

      {/* BOOM text */}
      <text x="15" y="80" fill="#f5e642" fontSize="32" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="2" paintOrder="stroke" transform="rotate(-5,15,80)">WOW!</text>
      <text x="430" y="260" fill="#fff" fontSize="28" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="2" paintOrder="stroke" transform="rotate(5,430,260)">AMAZING!</text>

    </svg>
  )
}

/* ── Cat SVG helper ── */
function Cat({ x = 0, y = 0, scale = 1, smug = true }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* Body */}
      <ellipse cx="38" cy="58" rx="26" ry="22" fill="#e8a832" stroke="#000" strokeWidth="2.5" />
      {/* Head */}
      <circle cx="38" cy="32" r="20" fill="#e8a832" stroke="#000" strokeWidth="2.5" />
      {/* Ears */}
      <polygon points="22,18 16,4 30,16" fill="#e8a832" stroke="#000" strokeWidth="2" />
      <polygon points="54,18 60,4 46,16" fill="#e8a832" stroke="#000" strokeWidth="2" />
      <polygon points="23,17 18,8 29,16" fill="#ff9999" />
      <polygon points="53,17 58,8 47,16" fill="#ff9999" />
      {/* Eyes – smug half-closed */}
      {smug
        ? <>
            <path d="M26,29 Q30,26 34,29" fill="none" stroke="#000" strokeWidth="2.5" />
            <path d="M42,29 Q46,26 50,29" fill="none" stroke="#000" strokeWidth="2.5" />
          </>
        : <>
            <circle cx="30" cy="30" r="4" fill="#5a3a00" />
            <circle cx="46" cy="30" r="4" fill="#5a3a00" />
            <circle cx="31" cy="29" r="1.5" fill="#fff" />
            <circle cx="47" cy="29" r="1.5" fill="#fff" />
          </>
      }
      {/* Nose */}
      <polygon points="38,34 36,36 40,36" fill="#ff6699" />
      {/* Mouth */}
      <path d="M36,36 Q38,39 40,36" fill="none" stroke="#000" strokeWidth="1.5" />
      {/* Whiskers */}
      <line x1="18" y1="33" x2="32" y2="35" stroke="#000" strokeWidth="1.2" />
      <line x1="18" y1="37" x2="32" y2="37" stroke="#000" strokeWidth="1.2" />
      <line x1="44" y1="35" x2="58" y2="33" stroke="#000" strokeWidth="1.2" />
      <line x1="44" y1="37" x2="58" y2="37" stroke="#000" strokeWidth="1.2" />
      {/* Tail */}
      <path d="M62,68 Q85,45 80,22 Q76,8 68,18" fill="none" stroke="#e8a832" strokeWidth="6" strokeLinecap="round" />
      <path d="M62,68 Q85,45 80,22 Q76,8 68,18" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
      {/* Belly stripe */}
      <ellipse cx="38" cy="60" rx="12" ry="10" fill="#f5c860" stroke="none" opacity="0.6" />
    </g>
  )
}

/* ── Stars helper ── */
export function Stars({ n = 40, seed = 1 }) {
  const stars = []
  let s = seed
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
  for (let i = 0; i < n; i++) {
    const x = rng() * 560
    const y = rng() * 200
    const r = rng() * 2 + 0.6
    const op = rng() * 0.5 + 0.5
    stars.push(<circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={op} />)
  }
  return <g>{stars}</g>
}

/* ── Panel 9 – It was all a dream (cat on keyboard) ── */
export function Panel9Art() {
  return (
    <svg viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      {/* Dark room */}
      <rect width="260" height="280" fill="#12192e" />
      <rect width="260" height="280" fill="url(#bd-blue)" />

      {/* Desk */}
      <rect x="0" y="210" width="260" height="70" fill="#3d2112" stroke="#000" strokeWidth="3" />
      <rect x="0" y="206" width="260" height="10" fill="#5c3d2e" stroke="#000" strokeWidth="2" />

      {/* Monitor – cat garbled the code */}
      <Monitor x={130} y={100} w={115} h={105} screenColor="#0a1a0a">
        <text x="138" y="125" fill="#00ff41" fontSize="7" fontFamily="monospace">pagaia.js saved!</text>
        <text x="138" y="140" fill="#ff4444" fontSize="7" fontFamily="monospace">aaaaaassssss</text>
        <text x="138" y="153" fill="#ff4444" fontSize="7" fontFamily="monospace">ffffffffffff</text>
        <text x="138" y="166" fill="#ff4444" fontSize="7" fontFamily="monospace">jjjjjjjjjjjj</text>
        <text x="138" y="179" fill="#ffff00" fontSize="7" fontFamily="monospace">847 lines deleted</text>
        <text x="138" y="192" fill="#ff4444" fontSize="7" fontFamily="monospace">git commit: "."</text>
      </Monitor>

      {/* Hero slumped – just head and arms visible above desk */}
      {/* Arms on desk */}
      <rect x="30" y="195" width="85" height="14" rx="7" fill="#3d5a80" stroke="#000" strokeWidth="2.5" />
      {/* Head resting on arms */}
      <ellipse cx="72" cy="188" rx="26" ry="22" fill="#f4c07a" stroke="#000" strokeWidth="3" />
      {/* Hair (flat/messy from sleeping) */}
      <path d="M48 180 Q52 165 62 170 Q72 162 82 170 Q90 165 96 180" fill="#2d1b00" stroke="#000" strokeWidth="2" />
      {/* Glasses (askew) */}
      <rect x="55" y="183" width="13" height="8" rx="3" fill="white" stroke="#000" strokeWidth="2" transform="rotate(-5,61,187)" />
      <rect x="72" y="183" width="13" height="8" rx="3" fill="white" stroke="#000" strokeWidth="2" transform="rotate(-5,78,187)" />
      {/* Eyes closed */}
      <path d="M57,186 Q61,189 65,186" fill="none" stroke="#000" strokeWidth="1.5" />
      <path d="M74,186 Q78,189 82,186" fill="none" stroke="#000" strokeWidth="1.5" />
      {/* ZZZ */}
      <text x="95" y="165" fill="#4a9eff" fontSize="13" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="1" paintOrder="stroke" opacity="0.9">Z</text>
      <text x="108" y="152" fill="#4a9eff" fontSize="17" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="1" paintOrder="stroke" opacity="0.7">Z</text>
      <text x="123" y="136" fill="#4a9eff" fontSize="22" fontWeight="900" fontFamily="Bangers, Impact, cursive"
        stroke="#000" strokeWidth="1.5" paintOrder="stroke" opacity="0.5">Z</text>
      {/* Drool */}
      <path d="M68 200 Q70 208 69 214" fill="none" stroke="#4a9eff" strokeWidth="2.5" opacity="0.5" />
      <circle cx="69" cy="216" r="3" fill="#4a9eff" opacity="0.4" />

      {/* Cat sitting on keyboard */}
      <Cat x={12} y={130} scale={0.75} smug={true} />

      {/* Keyboard under cat */}
      <rect x="15" y="198" width="95" height="12" rx="3" fill="#222" stroke="#000" strokeWidth="2" />
    </svg>
  )
}

/* ── Panel 10 – Stars and cat, the real world ── */
export function Panel10Art() {
  return (
    <svg viewBox="0 0 560 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <SvgDefs />
      {/* Night sky – dark blue gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#060d1f" />
          <stop offset="100%" stopColor="#0a1a3a" />
        </linearGradient>
        <linearGradient id="floor-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1008" />
          <stop offset="100%" stopColor="#0a0805" />
        </linearGradient>
      </defs>
      <rect width="560" height="280" fill="url(#sky)" />

      {/* Stars */}
      <Stars n={55} seed={42} />
      {/* Moon */}
      <circle cx="480" cy="55" r="28" fill="#f5e8c8" stroke="#e8d8a0" strokeWidth="2" />
      <circle cx="492" cy="48" r="24" fill="url(#sky)" /> {/* crescent */}
      {/* Moon glow */}
      <circle cx="480" cy="55" r="38" fill="#f5e8c8" opacity="0.07" />

      {/* Window frame */}
      <rect x="30" y="20" width="260" height="240" rx="4" fill="none" stroke="#5c3d2e" strokeWidth="10" />
      {/* Windowsill */}
      <rect x="20" y="255" width="280" height="16" rx="3" fill="#5c3d2e" stroke="#000" strokeWidth="2.5" />
      {/* Window cross bars */}
      <line x1="30" y1="135" x2="290" y2="135" stroke="#5c3d2e" strokeWidth="8" />
      <line x1="160" y1="20" x2="160" y2="260" stroke="#5c3d2e" strokeWidth="8" />
      {/* Window reflection / glass tint */}
      <rect x="35" y="25" width="120" height="107" fill="#4a9eff" opacity="0.04" />
      <rect x="165" y="25" width="120" height="107" fill="#4a9eff" opacity="0.04" />

      {/* Room floor/wall inside right half */}
      <rect x="295" y="0" width="265" height="280" fill="#12192e" />
      <rect x="295" y="200" width="265" height="80" fill="url(#floor-g)" stroke="#000" strokeWidth="2" />

      {/* Hero silhouette at window (right side) */}
      {/* Body */}
      <rect x="360" y="105" width="50" height="70" rx="10" fill="#1a1a2a" stroke="#000" strokeWidth="2.5" />
      {/* Head */}
      <ellipse cx="385" cy="88" rx="28" ry="26" fill="#1a1a2a" stroke="#000" strokeWidth="2.5" />
      {/* Messy hair */}
      <path d="M358 80 Q362 60 372 65 Q385 55 398 65 Q408 60 412 80" fill="#1a1a2a" stroke="#000" strokeWidth="2" />
      {/* Glasses glint */}
      <rect x="368" y="83" width="14" height="9" rx="3" fill="none" stroke="#4a9eff" strokeWidth="1.5" opacity="0.6" />
      <rect x="387" y="83" width="14" height="9" rx="3" fill="none" stroke="#4a9eff" strokeWidth="1.5" opacity="0.6" />
      <line x1="382" y1="87" x2="387" y2="87" stroke="#4a9eff" strokeWidth="1" opacity="0.6" />
      {/* Arms resting on windowsill */}
      <rect x="330" y="160" width="35" height="12" rx="6" fill="#1a1a2a" stroke="#000" strokeWidth="2" />
      <rect x="395" y="160" width="35" height="12" rx="6" fill="#1a1a2a" stroke="#000" strokeWidth="2" />
      {/* Legs */}
      <rect x="365" y="172" width="18" height="45" rx="8" fill="#1a1a2a" stroke="#000" strokeWidth="2" />
      <rect x="385" y="172" width="18" height="45" rx="8" fill="#1a1a2a" stroke="#000" strokeWidth="2" />

      {/* Cat sitting on windowsill next to hero */}
      <Cat x={295} y={140} scale={0.65} smug={false} />

      {/* Star reflection in glasses (light effect) */}
      <circle cx="372" cy="87" r="2" fill="#fff" opacity="0.5" />
      <circle cx="391" cy="87" r="2" fill="#fff" opacity="0.5" />

      {/* Thought bubble */}
      <circle cx="415" cy="58" r="4" fill="#fff" stroke="#000" strokeWidth="1.5" />
      <circle cx="426" cy="48" r="6" fill="#fff" stroke="#000" strokeWidth="1.5" />
      <circle cx="440" cy="40" r="8" fill="#fff" stroke="#000" strokeWidth="1.5" />
    </svg>
  )
}
