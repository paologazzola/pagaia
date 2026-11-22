import './site.css'

const SECTIONS = [
  { href: '/', label: 'Home', id: 'home' },
  { href: '/manifesto/', label: 'Manifesto', id: 'manifesto' },
]

export default function SiteHeader({ current }) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="site-brand" href="/">pagaia.xyz</a>
        <nav className="site-nav" aria-label="Main">
          <ul>
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a href={s.href} aria-current={s.id === current ? 'page' : undefined}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  )
}
