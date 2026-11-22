import { Fragment } from 'react'
import { Stars } from './art.jsx'
import './ComicPage.css'

function Lines({ lines }) {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ))
}

function Caption({ caption }) {
  const [x, y, w, h] = caption.box
  const style = {
    '--cx': x, '--cy': y, '--cw': w, '--ch': h, '--fs': caption.size,
    '--caption-bg': caption.background, '--caption-fg': caption.color,
  }
  return (
    <p className={`panel-caption${caption.after ? ' panel-caption-after' : ''}`} style={style}>
      {caption.text}
    </p>
  )
}

function Bubble({ line }) {
  const { top, right, bottom, left, width } = line.place
  const style = { '--top': top, '--right': right, '--bottom': bottom, '--left': left, '--bubble-width': width }
  const kind = line.kind === 'thought' ? 'thought' : `speech tail-${line.tail || 'down-left'}`
  return (
    <p className={`bubble ${kind}`} style={style}>
      <span className="visually-hidden">{line.speaker}{line.kind === 'thought' ? ' thinks' : ' says'}: </span>
      <Lines lines={line.lines} />
    </p>
  )
}

function ComicPanel({ panel, number, total }) {
  const Art = panel.art
  const before = panel.captions.filter(c => !c.after)
  const after = panel.captions.filter(c => c.after)
  return (
    <figure
      className={`panel${panel.wide ? ' panel-wide' : ''}`}
      style={{ '--w': panel.width, '--h': panel.height }}
    >
      <figcaption className="visually-hidden">Panel {number} of {total}. {panel.scene}</figcaption>
      {before.map((c, i) => <Caption key={i} caption={c} />)}
      <div className="panel-art"><Art /></div>
      {after.map((c, i) => <Caption key={i} caption={c} />)}
      {panel.dialogue.length > 0 && (
        <div className="panel-dialogue">
          {panel.dialogue.map((line, i) => <Bubble key={i} line={line} />)}
        </div>
      )}
    </figure>
  )
}

function Ending() {
  return (
    <div className="tbc-panel">
      <svg className="tbc-stars" viewBox="0 0 820 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <Stars n={80} seed={99} />
      </svg>
      <h2 className="tbc-title">It was all a dream.</h2>
      <div className="tbc-copy">
        <p>
          Pagaia-Man fell asleep before hitting deploy.<br />
          The cat deleted 847 lines of code and felt no remorse.<br />
          The stars kept shining — blissfully unaware of the npm dependency tree.
        </p>
        <p className="tbc-quote">
          "Some revolutions start with a paddle.<br />
          Some start with a cat sitting on a keyboard.<br />
          Either way... the sky is still out there."
        </p>
        <p className="tbc-note">pagaia.xyz — coming soon. probably. if the cat cooperates.</p>
      </div>
      <svg className="tbc-mark" viewBox="0 0 120 30" aria-hidden="true" focusable="false">
        <path d="M4 15 L18 7 L24 15 L18 23 Z" fill="#f5e642" opacity="0.7" />
        <rect x="24" y="13" width="72" height="4" rx="2" fill="#f5e642" opacity="0.5" />
        <path d="M116 15 L102 7 L96 15 L102 23 Z" fill="#f5e642" opacity="0.7" />
        <g transform="translate(50,2) scale(0.35)">
          <circle cx="38" cy="32" r="20" fill="#f5e642" opacity="0.6" />
          <polygon points="22,18 16,4 30,16" fill="#f5e642" opacity="0.6" />
          <polygon points="54,18 60,4 46,16" fill="#f5e642" opacity="0.6" />
          <ellipse cx="38" cy="58" rx="26" ry="22" fill="#f5e642" opacity="0.6" />
          <path d="M62,68 Q85,45 80,22 Q76,8 68,18" fill="none" stroke="#f5e642" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        </g>
      </svg>
    </div>
  )
}

function Transcript({ episode }) {
  return (
    <details className="transcript" id="text-version">
      <summary>Read this episode as text</summary>
      <ol>
        {episode.panels.map((panel, i) => (
          <li key={i}>
            <p className="transcript-scene"><span className="transcript-label">Panel {i + 1}.</span> {panel.scene}</p>
            {panel.captions.filter(c => !c.after).map((c, j) => <p key={`c${j}`} className="transcript-caption">{c.text}</p>)}
            {panel.dialogue.map((line, j) => (
              <p key={`d${j}`}>
                <span className="transcript-label">{line.speaker}{line.kind === 'thought' ? ' (thinking)' : ''}:</span>{' '}
                {line.lines.map((l, k) => <Fragment key={k}>{k > 0 && ' '}{l}</Fragment>)}
              </p>
            ))}
            {panel.captions.filter(c => c.after).map((c, j) => <p key={`a${j}`} className="transcript-caption">{c.text}</p>)}
          </li>
        ))}
      </ol>
      <p>It was all a dream. Pagaia-Man fell asleep before hitting deploy, and the cat deleted 847 lines of code.</p>
    </details>
  )
}

export default function ComicPage({ episode }) {
  const total = episode.panels.length
  return (
    <article className="comic-section" id={`episode-${episode.number}`} aria-labelledby="episode-title">
      <header className="comic-cover">
        <p className="comic-publisher" aria-hidden="true">★ Pagaia Comics ★</p>
        <h1 className="comic-title" id="episode-title">
          Pagaia-Man <span className="visually-hidden">#{episode.number}: {episode.title}</span>
        </h1>
        <p className="comic-subtitle">Origin Story — "{episode.title}"</p>
        <ul className="comic-meta" aria-label="Issue details">
          <li>Issue #{episode.number}</li>
          <li>1984 · Sci-fi / Action</li>
          <li>$0.75</li>
          <li>Approved by the Code Authority</li>
        </ul>
      </header>

      <Transcript episode={episode} />

      <div className="comic-grid">
        {episode.panels.map((panel, i) => (
          <ComicPanel key={i} panel={panel} number={i + 1} total={total} />
        ))}
        <Ending />
      </div>
    </article>
  )
}
