import SiteHeader from '../shared/SiteHeader.jsx'
import SiteFooter from '../shared/SiteFooter.jsx'
import { SECTIONS } from '../shared/sections.js'
import './Home.css'

// The latest security notes (summary fields only) are injected by the build,
// and only when the security section is enabled — see latestNotes() in
// vite.config.js — so hidden-section content never ships in the public bundle.
const notes = __LATEST_NOTES__

const day = iso => String(iso || '').slice(0, 10)

// Vendor and product often repeat (e.g. "UnrealIRCd UnrealIRCd"); show them once.
const who = (vendor, product) => {
  const v = String(vendor || '').trim()
  const p = String(product || '').trim()
  if (!v) return p
  if (!p) return v
  if (p.toLowerCase().includes(v.toLowerCase())) return p
  if (v.toLowerCase().includes(p.toLowerCase())) return v
  return `${v} · ${p}`
}

export default function Home() {
  return (
    <>
      <SiteHeader current="home" />
      <main id="main">
        <section className="hero">
          <div className="wrap">
            <p className="kicker">Pagaia-Man was here</p>
            {SECTIONS.security ? (
              <>
                <h1 className="hero-title">Security notes, told like a <em>story.</em></h1>
                <p className="hero-sub">
                  Critical vulnerabilities, explained with heart and rigour. A comic to open it,
                  dated field notes to prove it, puzzles to end the day.
                </p>
              </>
            ) : (
              <>
                <h1 className="hero-title">A paddle for rough <em>digital waters.</em></h1>
                <p className="hero-sub">
                  It begins with a comic. Dated security notes and account-free puzzles
                  are on the way.
                </p>
              </>
            )}
            <a className="btn-rose" href="/manifesto/">Start with the comic <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section className="band">
          <div className="wrap">
            <h2 className="eyebrow">// Explore</h2>
            <div className="cards">
              <a className="card" href="/manifesto/">
                <span className="card-em" aria-hidden="true">📖</span>
                <h3>Manifesto</h3>
                <p>Pagaia-Man #1 — black ink, a touch of red, the reason for all of this.</p>
                <span className="card-go">Read the comic →</span>
              </a>
              {SECTIONS.security ? (
                <a className="card" href="/security/">
                  <span className="card-em" aria-hidden="true">🛡️</span>
                  <h3>Security</h3>
                  <p>Dated notes on critical CVEs: what is exposed, what to do, and the sources.</p>
                  <span className="card-go">Browse notes →</span>
                </a>
              ) : (
                <div className="card card-soon" aria-disabled="true">
                  <span className="card-em" aria-hidden="true">🛡️</span>
                  <h3>Security <span className="soon-tag">soon</span></h3>
                  <p>Dated notes on critical CVEs: what is exposed, what to do, and the sources.</p>
                  <span className="card-go card-go-muted">coming soon</span>
                </div>
              )}
              {SECTIONS.game ? (
                <a className="card" href="/game/">
                  <span className="card-em" aria-hidden="true">🧩</span>
                  <h3>Game</h3>
                  <p>A daily logic puzzle about sleepy cats. No account, no guessing.</p>
                  <span className="card-go">Play today's puzzle →</span>
                </a>
              ) : (
                <div className="card card-soon" aria-disabled="true">
                  <span className="card-em" aria-hidden="true">🧩</span>
                  <h3>Game <span className="soon-tag">soon</span></h3>
                  <p>Account-free logic puzzles from a seed. Fair, reproducible, quiet.</p>
                  <span className="card-go card-go-muted">coming soon</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {SECTIONS.security && notes.length > 0 && (
          <section className="band">
            <div className="wrap">
              <h2 className="eyebrow">// Latest security notes</h2>
              <div className="notes">
                {notes.map(n => (
                  <a className="note" key={n.slug} href={`/security/${n.slug}/`}>
                    <div className="note-top">
                      {n.exploited && <span className="chip chip-red">Actively exploited</span>}
                      {n.patch_status === 'patched' && <span className="chip chip-green">Fix available</span>}
                      {n.score != null && <span className="note-score">{n.score}</span>}
                    </div>
                    <p className="note-cve">{[n.cve, who(n.vendor, n.product)].filter(Boolean).join(' · ')}</p>
                    <h3 className="note-title">{n.title}</h3>
                    <p className="note-meta">Updated {day(n.updated || n.approved_at)}</p>
                  </a>
                ))}
              </div>
              <p className="notes-more"><a href="/security/">All security notes →</a></p>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
