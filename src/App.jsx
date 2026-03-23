import { useEffect, useRef } from 'react'
import './App.css'

function PaddleLogo() {
  return (
    <svg
      className="paddle-logo"
      viewBox="0 0 200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pagaia paddle logo"
    >
      {/* Left blade */}
      <path
        d="M8 40 L32 20 L44 40 L32 60 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Shaft */}
      <rect x="44" y="37" width="112" height="6" rx="3" fill="currentColor" opacity="0.7" />
      {/* Right blade */}
      <path
        d="M192 40 L168 20 L156 40 L168 60 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Grip rings */}
      <rect x="90" y="34" width="4" height="12" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="106" y="34" width="4" height="12" rx="2" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function GlitchText({ children }) {
  return (
    <span className="glitch" data-text={children}>
      {children}
    </span>
  )
}

export default function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLS = Math.floor(window.innerWidth / 20)
    const drops = Array.from({ length: COLS }, () => Math.random() * -50)
    const chars = '01アイウエオカキクケコサシスセソタチツテト'

    const draw = () => {
      ctx.fillStyle = 'rgba(8, 11, 18, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'rgba(64, 190, 220, 0.12)'
      ctx.font = '14px JetBrains Mono, monospace'

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(char, i * 20, y * 20)
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0
        else drops[i] += 0.5
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="container">
      <canvas ref={canvasRef} className="matrix-bg" />

      <div className="content">
        <div className="logo-wrapper">
          <PaddleLogo />
        </div>

        <div className="site-name">pagaia.xyz</div>

        <div className="divider">
          <span className="divider-line" />
          <span className="divider-icon">{'</>'}</span>
          <span className="divider-line" />
        </div>

        <h1 className="headline">
          <GlitchText>under construction</GlitchText>
        </h1>

        <p className="subtext">
          <span className="prompt">$</span>
          <span className="cmd"> building something</span>
          <span className="cursor" />
        </p>
      </div>

      <footer className="footer">
        <span>pagaia.xyz</span>
        <span className="sep">·</span>
        <span>{'// coming soon'}</span>
      </footer>
    </div>
  )
}
