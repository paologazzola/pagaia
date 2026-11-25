import PaddleLogo from './PaddleLogo.jsx'
import { SECTIONS } from './sections.js'

// Shared footer. Only real destinations are links; sections that do not exist
// yet (Game, RSS, Contact) or are hidden are muted text, never dead links.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-wrap">
        <div className="foot-brand">
          <a className="foot-logo" href="/" aria-label="pagaia home">
            <PaddleLogo size={28} />
            <span>pagaia</span>
          </a>
          <p className="foot-tag">Told with heart and rigour. Paddle through the noise.</p>
        </div>
        <div className="foot-col">
          <h2>Sections</h2>
          <ul>
            <li><a href="/manifesto/">Manifesto</a></li>
            <li>{SECTIONS.security ? <a href="/security/">Security</a> : <span className="foot-muted">Security · soon</span>}</li>
            <li>{SECTIONS.game ? <a href="/game/">Game</a> : <span className="foot-muted">Game · soon</span>}</li>
          </ul>
        </div>
        {SECTIONS.security && (
          <div className="foot-col">
            <h2>Security</h2>
            <ul>
              <li><a href="/security/">Latest notes</a></li>
              <li><a href="/security/#selection">How we select</a></li>
              <li><a href="/security/#sources">Sources</a></li>
            </ul>
          </div>
        )}
        <div className="foot-col">
          <h2>About</h2>
          <ul>
            <li><a href="/manifesto/">What is Pagaia</a></li>
            <li><span className="foot-muted">Contact · soon</span></li>
            <li><span className="foot-muted">RSS · soon</span></li>
          </ul>
        </div>
      </div>
      <div className="foot-bar">
        <span>© {new Date().getFullYear()} pagaia.xyz</span>
        <span>made with ink</span>
      </div>
    </footer>
  )
}
