import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import SiteHeader from '../shared/SiteHeader.jsx'
import SiteFooter from '../shared/SiteFooter.jsx'
import SleepingCat from './SleepingCat.jsx'
import {
  CAT, CROSS, EMPTY, SIZE_NAMES, SIZES,
  cellName, conflicts, cushionName, dailyId, emptyMarks, generate, hint as findHint, isSolved, layoutFingerprint, parseId, randomId, revealOne,
} from './pisolini/engine.js'
import * as storage from './pisolini/storage.js'
import './game.css'

const WORDS = { 5: 'five', 7: 'seven', 8: 'eight', 9: 'nine' }
const capital = s => s[0].toUpperCase() + s.slice(1)
const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const duration = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const HISTORY_LIMIT = 300

// The puzzle comes from ?p= when it holds a valid id, otherwise today's medium.
function idFromUrl() {
  try {
    const info = parseId(new URLSearchParams(window.location.search).get('p'))
    if (info) return info.id
  } catch {
    // Fall through to the daily puzzle.
  }
  return dailyId('m')
}

function dateLabel(yyyymmdd) {
  const d = new Date(Number(yyyymmdd.slice(0, 4)), Number(yyyymmdd.slice(4, 6)) - 1, Number(yyyymmdd.slice(6, 8)))
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function GamePage() {
  const [id, setId] = useState(idFromUrl)

  // Keep the address shareable: the same link reproduces the same puzzle.
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.get('p') !== id) {
        url.searchParams.set('p', id)
        window.history.replaceState(null, '', url)
      }
    } catch {
      // Address bar updates are a convenience only.
    }
  }, [id])

  return (
    <>
      <SiteHeader current="game" />
      <main id="main" className="pz-main">
        <Game key={id} id={id} onSwitch={setId} />
      </main>
      <SiteFooter />
    </>
  )
}

function freshState(p, notice = null) {
  return { marks: emptyMarks(p), history: [], seconds: 0, hints: 0, solved: false, hint: null, notice, said: null }
}

// Whether the board has been touched: nothing is saved before that.
const touched = s => s.seconds > 0 || s.hints > 0 || s.marks.some(m => m !== EMPTY)

function initState(p) {
  const saved = storage.loadProgress(p.id, p.n * p.n, layoutFingerprint(p))
  // Solved is recomputed from the board; the stored flag is only a hint for the size pills.
  if (saved.state) return { ...saved.state, solved: isSolved(p, saved.state.marks), history: [], hint: null, notice: null, said: null }
  return freshState(p, saved.corrupt ? 'The saved progress for this puzzle could not be read, so it starts fresh.' : null)
}

function withMarks(state, p, marks) {
  const history = [...state.history, state.marks].slice(-HISTORY_LIMIT)
  return { ...state, marks, history, hint: null, notice: null, said: null, solved: isSolved(p, marks) }
}

function reducer(state, a) {
  const { p } = a
  switch (a.type) {
    case 'set': {
      if (state.solved || state.marks[a.i] === a.v) return state
      const marks = state.marks.slice()
      marks[a.i] = a.v
      const where = cellName(p, a.i)
      const said = a.v === CROSS ? `Crossed out ${where}.` : a.v === EMPTY ? `Cleared ${where}.` : null
      return { ...withMarks(state, p, marks), said }
    }
    case 'undo': {
      if (!state.history.length || (state.solved && !state.history.at(-1).restart)) return state
      // An entry is the earlier marks, or, for a restart, the whole earlier game.
      const e = state.history.at(-1)
      const back = Array.isArray(e) ? { marks: e } : e
      return {
        ...state, ...back, restart: undefined,
        history: state.history.slice(0, -1), hint: null, notice: null, said: null,
        solved: isSolved(p, back.marks),
      }
    }
    case 'restart': {
      // Undo brings the game back, including its clock and hint count.
      if (!touched(state)) return state
      const keep = { restart: true, marks: state.marks, seconds: state.seconds, hints: state.hints }
      return { ...freshState(p), history: [...state.history, keep].slice(-HISTORY_LIMIT) }
    }
    case 'fresh':
      return freshState(p)
    case 'hint': {
      if (state.solved) return state
      return { ...state, hints: state.hints + 1, hint: findHint(p, state.marks), notice: null }
    }
    case 'reveal': {
      if (state.solved) return state
      const i = revealOne(p, state.marks)
      if (i < 0) return state
      const marks = state.marks.slice()
      marks[i] = CAT
      return { ...withMarks(state, p, marks), hints: state.hints + 1 }
    }
    case 'tick':
      return state.solved ? state : { ...state, seconds: state.seconds + 1 }
    default:
      return state
  }
}

function Game({ id, onSwitch }) {
  const info = parseId(id)
  const p = useMemo(() => generate(id), [id])
  const { n } = p
  const [state, dispatch] = useReducer(reducer, p, initState)
  const [mode, setMode] = useState('x')
  const [focus, setFocus] = useState(0)
  const [showTimer, setShowTimer] = useState(() => storage.getPref('timer', true))
  const [, bump] = useReducer(x => x + 1, 0)
  const cellRefs = useRef([])
  const winRef = useRef(null)
  const act = (type, extra) => dispatch({ type, p, ...extra })

  const { marks, solved, hint } = state
  const cats = marks.filter(m => m === CAT).length
  const clash = useMemo(() => conflicts(p, marks).cells, [p, marks])
  const started = state.seconds > 0 || marks.some(m => m !== EMPTY)

  // Save after every change, from the first move on. Ticks are cheap enough to
  // save too. A board back at its start leaves no save behind.
  useEffect(() => {
    if (touched(state)) storage.saveProgress(id, state, layoutFingerprint(p))
    else storage.clearProgress(id)
  }, [id, state, p])

  // The clock runs from the first move while the page is visible.
  useEffect(() => {
    if (solved || !started) return undefined
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') dispatch({ type: 'tick', p })
    }, 1000)
    return () => clearInterval(t)
  }, [solved, started, p])

  // On a phone the win card sits below the board: bring it into view.
  // The win card's live region is inserted empty and filled a moment later, so
  // screen readers announce the text.
  const [winNote, setWinNote] = useState('')
  useEffect(() => {
    if (!solved) { setWinNote(''); return undefined }
    const t = setTimeout(() => setWinNote(
      `Solved in ${duration(state.seconds)} with ${state.hints === 0 ? 'no hints' : state.hints === 1 ? 'one hint' : `${state.hints} hints`}. All ${n} cats asleep.`,
    ), 150)
    return () => clearTimeout(t)
  }, [solved]) // eslint-disable-line react-hooks/exhaustive-deps

  const wasSolved = useRef(solved)
  useEffect(() => {
    if (solved && !wasSolved.current && winRef.current) {
      const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      winRef.current.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' })
    }
    wasSolved.current = solved
  }, [solved])

  // Page-wide shortcuts: H for a hint, U or Ctrl+Z to undo.
  useEffect(() => {
    const onKey = e => {
      const t = e.target
      if (e.altKey || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return
      const k = e.key.toLowerCase()
      if (e.repeat && (k === 'u' || k === 'h')) return
      if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) {
        e.preventDefault()
        dispatch({ type: 'undo', p })
      } else if (!e.ctrlKey && !e.metaKey && k === 'u') {
        dispatch({ type: 'undo', p })
      } else if (!e.ctrlKey && !e.metaKey && k === 'h') {
        dispatch({ type: 'hint', p })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [p])

  const set = (i, v) => act('set', { i, v })
  const cycle = i => {
    const m = marks[i]
    if (mode === 'x') set(i, m === EMPTY ? CROSS : m === CROSS ? CAT : EMPTY)
    else set(i, m === CAT ? EMPTY : CAT)
  }

  const moveFocus = i => {
    setFocus(i)
    cellRefs.current[i]?.focus()
  }

  const onCellKey = (e, i) => {
    const r = Math.floor(i / n), c = i % n
    const k = e.key
    const go = (rr, cc) => {
      e.preventDefault()
      moveFocus(Math.max(0, Math.min(n - 1, rr)) * n + Math.max(0, Math.min(n - 1, cc)))
    }
    if (k === 'ArrowUp') go(r - 1, c)
    else if (k === 'ArrowDown') go(r + 1, c)
    else if (k === 'ArrowLeft') go(r, c - 1)
    else if (k === 'ArrowRight') go(r, c + 1)
    else if (k === 'Home') go(r, 0)
    else if (k === 'End') go(r, n - 1)
    else if (e.ctrlKey || e.metaKey || e.altKey) return
    else if (k === 'x' || k === 'X') { e.preventDefault(); set(i, marks[i] === CROSS ? EMPTY : CROSS) }
    else if (k === 'c' || k === 'C') { e.preventDefault(); set(i, marks[i] === CAT ? EMPTY : CAT) }
    else if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); set(i, EMPTY) }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); cycle(i) }
  }

  const restart = () => act('restart')
  const clearSaved = () => {
    if (!window.confirm('Clear the saved progress of every Pisolini puzzle on this device?')) return
    storage.clearAll()
    act('fresh')
    bump()
  }
  const random = size => onSwitch(randomId(size))
  const today = size => onSwitch(dailyId(size))

  const hintCells = new Set(hint?.cells ?? [])
  const hintArea = new Set(hint?.area ?? [])
  const nextDaily = Object.keys(SIZES).find(s => s !== info.size && !storage.isSolvedSaved(dailyId(s)))
  const word = WORDS[n] ?? String(n)

  return (
    <>
      <p className="pz-kicker">
        {info.daily ? `Daily puzzle · ${dateLabel(info.daily)}` : `Free play · ${SIZE_NAMES[info.size]}`}
      </p>
      <h1 className="pz-title">
        Pisolini, <em>a nap for {word} cats.</em>
      </h1>
      <p className="pz-lede">
        Every cat wants a cushion of its own. Put one cat in each row, each column and each cushion, and never let two
        cats touch, not even at the corners.
      </p>

      <div className="pz-layout">
        <section aria-label="Puzzle">
          <div className="pz-sizes" role="group" aria-label="Today's puzzles by size">
            {Object.keys(SIZES).map(s => {
              const done = storage.isSolvedSaved(dailyId(s))
              const on = Boolean(info.daily) && info.size === s
              return (
                <button
                  key={s}
                  type="button"
                  className={`pz-pill${on ? ' on' : ''}`}
                  aria-pressed={on}
                  onClick={() => today(s)}
                >
                  {SIZE_NAMES[s]} {SIZES[s]}×{SIZES[s]}
                  {done && (
                    <>
                      <span className="done" aria-hidden="true"> ✓</span>
                      <span className="visually-hidden">, solved today</span>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          <div className="pz-boardwrap">
            <div className="pz-status">
              <span aria-live="polite">
                <b>{cats}</b> of {n} cats asleep
                {clash.size > 0 && <span className="pz-clash-note"> · two cats are disturbing each other</span>}
                {state.said && <span className="visually-hidden"> {state.said}</span>}
              </span>
              <span className="mono pz-meta">
                <button
                  type="button"
                  className="pz-timer"
                  onClick={() => { storage.setPref('timer', !showTimer); setShowTimer(!showTimer) }}
                  aria-label={showTimer ? `Time ${duration(state.seconds)}. Hide the timer` : 'Show the timer'}
                >
                  {showTimer ? clock(state.seconds) : '--:--'}
                </button>
                {' · '}seed {id}
              </span>
            </div>

            <p id="pz-help" className="visually-hidden">
              Use the arrow keys to move between cells. X crosses a cell out, C places a cat, Backspace clears,
              Enter cycles. H asks for a hint and U undoes.
            </p>
            <div
              className={`pz-board${solved ? ' solved' : ''}`}
              style={{ '--n': n }}
              role="grid"
              aria-label={`Puzzle board, ${n} by ${n}`}
              aria-describedby="pz-help"
            >
              {Array.from({ length: n }, (_, r) => (
                <div role="row" className="pz-row" key={r}>
                  {Array.from({ length: n }, (_, c) => {
                    const i = r * n + c
                    const g = p.regions[i]
                    const same = j => p.regions[j] === g
                    const cls = ['pz-cell', `p-${g}`]
                    if (r === 0 || !same(i - n)) cls.push('bt')
                    if (c === 0 || !same(i - 1)) cls.push('bl')
                    if (c === n - 1 || !same(i + 1)) cls.push('br')
                    if (r === n - 1 || !same(i + n)) cls.push('bb')
                    if (hintCells.has(i)) cls.push('hint')
                    else if (hintArea.has(i)) cls.push('hint-area')
                    if (clash.has(i)) cls.push('clash')
                    const m = marks[i]
                    const what = m === CAT ? 'cat' : m === CROSS ? 'crossed out' : 'empty'
                    const label =
                      `row ${r + 1}, column ${c + 1}, ${cushionName(p, g)} cushion, ${what}` +
                      (hintCells.has(i) ? ', hint' : '') +
                      (clash.has(i) ? ', disturbs another cat' : '')
                    return (
                      <div
                        key={c}
                        ref={el => { cellRefs.current[i] = el }}
                        role="gridcell"
                        className={cls.join(' ')}
                        tabIndex={i === focus ? 0 : -1}
                        aria-label={label}
                        aria-readonly={solved || undefined}
                        onClick={() => { setFocus(i); cycle(i) }}
                        onFocus={() => setFocus(i)}
                        onKeyDown={e => onCellKey(e, i)}
                      >
                        {m === CAT && <SleepingCat index={g} z={r % 3} />}
                        {m === CROSS && <span className="pz-x" aria-hidden="true">×</span>}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="pz-toolbar">
              <button type="button" className="pz-btn" onClick={() => act('undo')} disabled={solved || !state.history.length}>
                <span aria-hidden="true">↶</span> Undo
              </button>
              <button
                type="button"
                className="pz-btn"
                onClick={() => setMode(mode === 'x' ? 'cat' : 'x')}
                aria-label={`Mark mode: ${mode === 'x' ? 'cross first, then cat' : 'cat only'}. Switch`}
              >
                Mark mode: <b>{mode === 'x' ? '×' : 'cat'}</b>
              </button>
              <button type="button" className="pz-btn primary" onClick={() => act('hint')} disabled={solved}>
                <span aria-hidden="true">💡</span> Hint
              </button>
              <button type="button" className="pz-btn" onClick={restart}>
                Restart
              </button>
            </div>
            <div className="pz-legend">
              {mode === 'x' ? (
                <>
                  <span>Tap once: ×</span>
                  <span>Tap twice: cat</span>
                </>
              ) : (
                <>
                  <span>Tap: cat</span>
                  <span>Tap again: clear</span>
                </>
              )}
              <span>Keyboard: arrows, X, C</span>
            </div>
            <p className="pz-actions">
              <button type="button" className="pz-link" onClick={() => random(info.size)}>New random puzzle</button>
              {!info.daily && (
                <button type="button" className="pz-link" onClick={() => today(info.size)}>Today's puzzle</button>
              )}
              <button type="button" className="pz-link" onClick={clearSaved}>Clear saved progress</button>
            </p>
          </div>
        </section>

        <aside className="pz-side" aria-label="Hints and rules">
          {solved && (
            <div className="pz-card pz-win" ref={winRef}>
              <p className="visually-hidden" role="status">{winNote}</p>
              <div className="pz-win-cats" aria-hidden="true">
                {[0, 1, 2].map(k => (
                  <SleepingCat key={k} index={(p.regions[k * n + p.solution[k]] + k) % 9} z={k} className={`win-cat w${k}`} />
                ))}
              </div>
              <div>
                <h2>Purr-fect.</h2>
                <p className="small">
                  {SIZE_NAMES[info.size]} solved in {duration(state.seconds)} with{' '}
                  {state.hints === 0 ? 'no hints' : state.hints === 1 ? 'one hint' : `${state.hints} hints`}.{' '}
                  {capital(word)} cats are dreaming.
                </p>
                <p className="pz-win-actions">
                  {info.daily && nextDaily && (
                    <button type="button" className="pz-btn small" onClick={() => today(nextDaily)}>
                      Try {SIZE_NAMES[nextDaily]}
                    </button>
                  )}
                  <button type="button" className="pz-btn small" onClick={() => random(info.size)}>
                    Another puzzle
                  </button>
                </p>
              </div>
            </div>
          )}

          {!solved && (
            <div className={`pz-card pz-hint${hint ? ' active' : ''}`} aria-live="polite">
              <div className="k">{hint && ['conflict', 'mistake'].includes(hint.rule) ? 'Check' : 'Hint'}</div>
              {hint ? (
                <>
                  <p>{hint.text}</p>
                  {hint.rule === 'none' && (
                    <button type="button" className="pz-btn small" onClick={() => act('reveal')}>
                      Show one cat
                    </button>
                  )}
                </>
              ) : state.notice ? (
                <p>{state.notice}</p>
              ) : (
                <p>Stuck? Press Hint (or H) for one small deduction, explained, with its cells dashed on the board.</p>
              )}
            </div>
          )}

          <div className="pz-card pz-rules">
            <h2>How to play</h2>
            <ul>
              <li>One cat in every row and every column.</li>
              <li>One cat on every cushion colour.</li>
              <li>Cats don't touch, not even diagonally.</li>
              <li>
                Hints compare your marks with the one answer, so a Check can reveal where a cat must sleep.
              </li>
            </ul>
            <p className="small pz-note">
              Exactly one answer, no guessing. Progress stays on this device.
              <span className="pz-note-more"> Same date, same puzzle for everyone; share it with the link.</span>
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
