import { useEffect, useRef } from 'react'
import SiteHeader from '../shared/SiteHeader.jsx'
import './Home.css'

function PaddleLogo() {
  return (
    <svg className="paddle-logo" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M8 40 L32 20 L44 40 L32 60 Z" fill="currentColor" opacity="0.9" />
      <rect x="44" y="37" width="112" height="6" rx="3" fill="currentColor" opacity="0.7" />
      <path d="M192 40 L168 20 L156 40 L168 60 Z" fill="currentColor" opacity="0.9" />
      <rect x="90" y="34" width="4" height="12" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="106" y="34" width="4" height="12" rx="2" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

// Falling characters behind the page. Skipped when the reader prefers reduced motion.
function useMatrixRain(canvasRef) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let drops = []
    const chars = '01アイウエオカキクケコサシスセソタチツテト'

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drops = Array.from({ length: Math.floor(canvas.width / 20) }, () => Math.random() * -50)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.fillStyle = 'rgba(8, 11, 18, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(64, 190, 220, 0.12)'
      ctx.font = '14px JetBrains Mono, monospace'
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 20, y * 20)
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
  }, [canvasRef])
}

export default function Home() {
  const canvasRef = useRef(null)
  useMatrixRain(canvasRef)

  return (
    <div className="container">
      <canvas ref={canvasRef} className="matrix-bg" aria-hidden="true" />
      <SiteHeader current="home" />

      <main className="content" id="main">
        <div className="logo-wrapper">
          <PaddleLogo />
        </div>

        <p className="site-name">pagaia.xyz</p>

        <div className="divider" aria-hidden="true">
          <span className="divider-line" />
          <span className="divider-icon">{'</>'}</span>
          <span className="divider-line" />
        </div>

        <h1 className="headline">
          <span className="visually-hidden">Under construction</span>
          <span className="glitch" data-text="under construction" aria-hidden="true">under construction</span>
        </h1>

        <p className="subtext">
          <span className="prompt" aria-hidden="true">$</span>
          <span className="cmd">building something</span>
          <span className="cursor" aria-hidden="true" />
        </p>

        <a className="home-cta" href="/manifesto/">
          <span className="home-cta-kicker">Start here</span>
          <span className="home-cta-title">Read the manifesto: Pagaia-Man #1</span>
        </a>
      </main>

      <footer className="footer">
        <span>pagaia.xyz</span>
        <span className="sep" aria-hidden="true">·</span>
        <span>{'// coming soon'}</span>
      </footer>
    </div>
  )
}
