import './site.css'
import PaddleLogo from './PaddleLogo.jsx'
import { SECTIONS } from './sections.js'

// Navigation follows the enabled areas. A hidden section leaves no link.
const NAV = [
  SECTIONS.manifesto && { href: '/manifesto/', label: 'Manifesto', id: 'manifesto' },
  SECTIONS.security && { href: '/security/', label: 'Security', id: 'security' },
  { label: 'Game', id: 'game', soon: true },
].filter(Boolean)

export default function SiteHeader({ current }) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <p className="site-wip" role="note">Work in progress — the site is taking shape.</p>
      <header className="site-header">
        <a className="site-brand" href="/" aria-label="pagaia home">
          <PaddleLogo size={32} />
          <span className="site-wordmark">pagaia</span>
        </a>
        {/* A short, always-visible nav. On narrow screens it simply wraps. */}
        <nav className="site-nav" aria-label="Main">
          <ul>
            {NAV.map(s =>
              s.soon ? (
                <li key={s.id}>
                  <span className="nav-soon">{s.label}<span className="soon-tag">soon</span></span>
                </li>
              ) : (
                <li key={s.id}>
                  <a href={s.href} aria-current={s.id === current ? 'page' : undefined}>{s.label}</a>
                </li>
              ),
            )}
          </ul>
        </nav>
      </header>
    </>
  )
}
