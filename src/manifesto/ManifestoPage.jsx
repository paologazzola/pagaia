import SiteHeader from '../shared/SiteHeader.jsx'
import ComicPage from './ComicPage.jsx'
import { episodes } from './episodes/origin.jsx'
import './ManifestoPage.css'

export default function ManifestoPage() {
  const [current] = episodes
  return (
    <>
      <SiteHeader current="manifesto" />
      <main id="main">
        <nav className="chapter-index" aria-labelledby="chapters-title">
          <p className="chapter-index-label" id="chapters-title">Chapters</p>
          <ol>
            {episodes.map(e => (
              <li key={e.id}>
                <a href={`#episode-${e.number}`} aria-current={e === current ? 'true' : undefined}>
                  #{e.number} {e.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <ComicPage episode={current} />
      </main>
      <footer className="site-footer">
        <a href="/">pagaia.xyz</a> · the manifesto, one chapter at a time
      </footer>
    </>
  )
}
