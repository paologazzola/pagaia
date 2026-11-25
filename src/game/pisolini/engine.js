// Pisolini: puzzle generator, solver and hint engine.
//
// Pure JavaScript with no framework or browser dependency, so it runs the same
// in the page, in a worker and under node:test.
//
// The puzzle: an N x N grid split into N contiguous cushions (regions). Place N
// cats so that every row, every column and every cushion holds exactly one cat
// and no two cats touch, diagonals included.
//
// A puzzle is defined by the generator version and an id. The id is also the
// seed: v1-YYYYMMDD-s|m|l for the daily puzzle, v1-<random>-s|m|l for free
// play. Changing the algorithm means adding a new version, never changing v1,
// so that saved progress and shared links keep working.

import { MAX_ATTEMPTS, MAX_REFINE_STEPS, logicSolveV1 } from './v1.js'

export const GENERATOR_VERSION = 'v1'

// Size letters used in ids. 8 x 8 is supported by the engine but not offered.
export const SIZES = { s: 5, m: 7, l: 9 }
export const SIZE_NAMES = { s: 'Small', m: 'Medium', l: 'Large' }

// Cushion colour names, by region index. The page maps the same index to a
// colour and a pattern, so names, colours and patterns always agree.
export const CUSHIONS = ['coral', 'honey', 'sage', 'lavender', 'sky', 'peach', 'mint', 'lemon', 'stone']

// The generation budget and the acceptance solver live in v1.js (frozen). The
// hint engine below can change freely; the puzzles for existing ids cannot.

// Seeded randomness -----------------------------------------------------------

// xmur3: hashes a string into a 32-bit seed.
export function hashString(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^ (h >>> 16)) >>> 0
}

// mulberry32: small, fast, good enough for shuffling a puzzle.
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const randInt = (rng, n) => Math.floor(rng() * n)

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Ids ---------------------------------------------------------------------------

const ID_RE = /^v1-([0-9a-z]{4,16})-([sml])$/

// A daily key is a real calendar date, YYYYMMDD. Any other eight digits are
// just a free-play seed.
function validDate(key) {
  if (!/^\d{8}$/.test(key)) return false
  const y = Number(key.slice(0, 4)), mo = Number(key.slice(4, 6)), d = Number(key.slice(6, 8))
  if (y < 2000) return false
  const t = new Date(Date.UTC(y, mo - 1, d))
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d
}

export function parseId(id) {
  const m = ID_RE.exec(String(id || ''))
  if (!m) return null
  const daily = validDate(m[1]) ? m[1] : null
  return { id: m[0], version: 'v1', key: m[1], size: m[2], n: SIZES[m[2]], daily }
}

// The daily id follows the visitor's local calendar date.
export function dailyId(size, date = new Date()) {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${GENERATOR_VERSION}-${y}${mo}${d}-${size}`
}

// A free-play id. `random` defaults to Math.random; tests pass a seeded one.
export function randomId(size, random = Math.random) {
  let key = ''
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789'
  // Start with a letter so a free-play id can never look like a date.
  key += abc[Math.floor(random() * 26)]
  for (let i = 0; i < 7; i++) key += abc[Math.floor(random() * abc.length)]
  return `${GENERATOR_VERSION}-${key}-${size}`
}

// Geometry ----------------------------------------------------------------------

const rowOf = (n, i) => Math.floor(i / n)
const colOf = (n, i) => i % n

// Cells a cat at index i rules out: its row, column, cushion and the eight
// neighbours. The cell itself is not included.
function attackedBy(p, i) {
  const { n, regions } = p
  const r = rowOf(n, i), c = colOf(n, i), g = regions[i]
  const out = []
  for (let j = 0; j < n * n; j++) {
    if (j === i) continue
    const rj = rowOf(n, j), cj = colOf(n, j)
    if (rj === r || cj === c || regions[j] === g || (Math.abs(rj - r) <= 1 && Math.abs(cj - c) <= 1)) out.push(j)
  }
  return out
}

function touches(n, a, b) {
  return Math.abs(rowOf(n, a) - rowOf(n, b)) <= 1 && Math.abs(colOf(n, a) - colOf(n, b)) <= 1
}

// Whether the cells of region g form one orthogonally connected piece.
export function isContiguous(n, regions, g) {
  const cells = []
  for (let i = 0; i < n * n; i++) if (regions[i] === g) cells.push(i)
  if (cells.length === 0) return false
  const seen = new Set([cells[0]])
  const stack = [cells[0]]
  while (stack.length) {
    const i = stack.pop()
    const r = rowOf(n, i), c = colOf(n, i)
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc
      if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue
      const j = rr * n + cc
      if (regions[j] === g && !seen.has(j)) { seen.add(j); stack.push(j) }
    }
  }
  return seen.size === cells.length
}

// Solver ------------------------------------------------------------------------

// Counts solutions by backtracking row by row with bit masks, and stops as
// soon as `limit` solutions are found. Returns them as arrays of columns by row.
export function solve(n, regions, limit = 2) {
  const sols = []
  const cols = new Array(n)
  // For pruning: regions that still have a cell in rows r..n-1.
  const regionRows = new Array(n + 1).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let m = regionRows[r + 1]
    for (let c = 0; c < n; c++) m |= 1 << regions[r * n + c]
    regionRows[r] = m
  }
  const full = (1 << n) - 1
  const rec = (r, colMask, regMask, prev) => {
    if (r === n) {
      sols.push(cols.slice())
      return sols.length >= limit
    }
    // Every region still unused must have a cell somewhere below.
    if (((full & ~regMask) & ~regionRows[r]) !== 0) return false
    for (let c = 0; c < n; c++) {
      if ((colMask >> c) & 1) continue
      if (c >= prev - 1 && c <= prev + 1) continue
      const g = regions[r * n + c]
      if ((regMask >> g) & 1) continue
      cols[r] = c
      if (rec(r + 1, colMask | (1 << c), regMask | (1 << g), c)) return true
    }
    return false
  }
  rec(0, 0, 0, -5)
  return sols
}

// Generator ---------------------------------------------------------------------

// One cat per row and column, none touching, in random order.
function randomPlacement(n, rng) {
  const cols = new Array(n)
  const used = new Array(n).fill(false)
  const rec = r => {
    if (r === n) return true
    for (const c of shuffle([...Array(n).keys()], rng)) {
      if (used[c] || (r > 0 && Math.abs(cols[r - 1] - c) <= 1)) continue
      used[c] = true
      cols[r] = c
      if (rec(r + 1)) return true
      used[c] = false
    }
    return false
  }
  rec(0)
  return cols
}

// Grows one region from each cat until the grid is covered. Each step picks a
// region (half the time uniformly, half the time by frontier size, so shapes
// vary between compact and sprawling) and gives it one free neighbouring cell.
function growRegions(n, cats, rng) {
  const regions = new Int8Array(n * n).fill(-1)
  cats.forEach((c, r) => { regions[r * n + c] = r })
  let left = n * n - n
  while (left > 0) {
    const frontier = []
    const byRegion = Array.from({ length: n }, () => [])
    for (let i = 0; i < n * n; i++) {
      if (regions[i] !== -1) continue
      const r = rowOf(n, i), c = colOf(n, i)
      const owners = new Set()
      if (r > 0 && regions[i - n] !== -1) owners.add(regions[i - n])
      if (r < n - 1 && regions[i + n] !== -1) owners.add(regions[i + n])
      if (c > 0 && regions[i - 1] !== -1) owners.add(regions[i - 1])
      if (c < n - 1 && regions[i + 1] !== -1) owners.add(regions[i + 1])
      for (const g of owners) { frontier.push([i, g]); byRegion[g].push(i) }
    }
    let cell, g
    if (rng() < 0.5) {
      const open = byRegion.map((cells, k) => (cells.length ? k : -1)).filter(k => k >= 0)
      g = open[randInt(rng, open.length)]
      cell = byRegion[g][randInt(rng, byRegion[g].length)]
    } else {
      ;[cell, g] = frontier[randInt(rng, frontier.length)]
    }
    regions[cell] = g
    left--
  }
  return regions
}

// Removes a competing solution: a cell where the other solution puts a cat
// (and ours does not) moves to a neighbouring cushion. That cushion then holds
// two of the other solution's cats, so that solution is gone, while ours still
// holds. The donor cushion must stay connected.
function refine(n, regions, cats, alt, rng) {
  const rows = shuffle([...Array(n).keys()].filter(r => alt[r] !== cats[r]), rng)
  for (const r of rows) {
    const i = r * n + alt[r]
    const g = regions[i]
    const c = alt[r]
    const nbrs = []
    if (r > 0) nbrs.push(i - n)
    if (r < n - 1) nbrs.push(i + n)
    if (c > 0) nbrs.push(i - 1)
    if (c < n - 1) nbrs.push(i + 1)
    for (const j of shuffle(nbrs, rng)) {
      const h = regions[j]
      if (h === g) continue
      regions[i] = h
      if (isContiguous(n, regions, g)) return true
      regions[i] = g
    }
  }
  return false
}

// Renumbers regions in reading order of their first cell, so colours are
// assigned predictably (the top-left cushion is always coral).
function normalise(n, regions) {
  const map = new Map()
  const out = new Int8Array(n * n)
  for (let i = 0; i < n * n; i++) {
    if (!map.has(regions[i])) map.set(regions[i], map.size)
    out[i] = map.get(regions[i])
  }
  return out
}

function makePuzzle(id, n, regions, solution, source) {
  const p = { id, n, regions, solution, source }
  p.units = buildUnits(p)
  p.solutionCells = new Set(solution.map((c, r) => r * n + c))
  return p
}

// A short hash of the layout, stored with each save so that progress is never
// applied to a different layout (for instance after a generator change).
export function layoutFingerprint(p) {
  return hashString(Array.from(p.regions, g => String.fromCharCode(65 + g)).join('')).toString(36)
}

// Generates the puzzle for an id. Same id, same puzzle, on any device.
export function generate(id, stats) {
  const info = parseId(id)
  if (!info) throw new Error(`invalid puzzle id: ${id}`)
  return generateN(info.id, info.n, stats)
}

// Exposed separately so tests and tools can try other sizes (such as 8).
export function generateN(id, n, stats) {
  const rng = mulberry32(hashString(id))
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const cats = randomPlacement(n, rng)
    const regions = growRegions(n, cats, rng)
    let sols = solve(n, regions, 2)
    for (let step = 0; sols.length > 1 && step < MAX_REFINE_STEPS; step++) {
      const alt = sols.find(s => s.some((c, r) => c !== cats[r]))
      if (!refine(n, regions, cats, alt, rng)) break
      sols = solve(n, regions, 2)
    }
    if (sols.length !== 1) continue
    const p = makePuzzle(id, n, normalise(n, regions), sols[0], 'generated')
    // Frozen acceptance rules (v1.js), not the hint engine: see the note there.
    if (!logicSolveV1(n, p.regions, p.solution)) continue
    if (stats) stats.attempts = attempt
    return p
  }
  if (stats) stats.attempts = MAX_ATTEMPTS
  return fallback(id, n)
}

// Prevalidated layouts, used only if generation runs out of attempts. Each row
// string lists the cushion letter of every cell; tests check that each one is
// contiguous, has exactly one solution and is solvable by the hint rules.
export const FALLBACKS = {
  5: ['AABBB', 'CAADB', 'CCDDB', 'CCCDD', 'EEDDD'],
  7: ['AAAABCC', 'AAAABDC', 'BAAABDC', 'BBBBBDC', 'EEFBFDC', 'EFFFFCC', 'EFFFGGG'],
  8: ['AAAABBBC', 'AADBBBBB', 'AADBBBBB', 'ADDBBEEE', 'DDDFGGEE', 'HDDGGGEE', 'HDHHHEEE', 'HHHHHHEE'],
  9: ['AAAABBBBB', 'AAABBBBBB', 'AAABBBBCB', 'AADDDCCCC', 'EFDDDGGCC', 'EEEGGGCCC', 'EEEEGGGGC', 'EHEEEIIIC', 'EHHEIIIII'],
}

export function fallback(id, n) {
  const rows = FALLBACKS[n]
  if (!rows || !rows.length) throw new Error(`no fallback layout for size ${n}`)
  const regions = normalise(n, Int8Array.from(rows.join(''), ch => ch.charCodeAt(0) - 65))
  const sols = solve(n, regions, 2)
  return makePuzzle(id, n, regions, sols[0], 'fallback')
}

// Rows, columns and cushions, each a list of cell indices.
function buildUnits(p) {
  const { n, regions } = p
  const rows = [], cols = [], cushions = []
  for (let k = 0; k < n; k++) { rows.push([]); cols.push([]); cushions.push([]) }
  for (let i = 0; i < n * n; i++) {
    rows[rowOf(n, i)].push(i)
    cols[colOf(n, i)].push(i)
    cushions[regions[i]].push(i)
  }
  return { rows, cols, cushions }
}

// Board state -------------------------------------------------------------------

export const EMPTY = 0
export const CROSS = 1
export const CAT = 2

export function emptyMarks(p) {
  return new Array(p.n * p.n).fill(EMPTY)
}

export const cellName = (p, i) => `row ${rowOf(p.n, i) + 1}, column ${colOf(p.n, i) + 1}`
export const cushionName = (p, g) => CUSHIONS[g] ?? `cushion ${g + 1}`

// Cats that disturb each other: same row, column or cushion, or touching.
export function conflicts(p, marks) {
  const cats = []
  for (let i = 0; i < marks.length; i++) if (marks[i] === CAT) cats.push(i)
  const bad = new Set()
  const pairs = []
  for (let a = 0; a < cats.length; a++) {
    for (let b = a + 1; b < cats.length; b++) {
      const x = cats[a], y = cats[b]
      if (rowOf(p.n, x) === rowOf(p.n, y) || colOf(p.n, x) === colOf(p.n, y) ||
          p.regions[x] === p.regions[y] || touches(p.n, x, y)) {
        bad.add(x); bad.add(y); pairs.push([x, y])
      }
    }
  }
  return { cells: bad, pairs }
}

export function isSolved(p, marks) {
  let count = 0
  for (let i = 0; i < marks.length; i++) {
    if (marks[i] === CAT) {
      if (!p.solutionCells.has(i)) return false
      count++
    }
  }
  return count === p.n
}

// Hint engine -------------------------------------------------------------------

// The engine reasons on the visible marks plus what placed cats already rule
// out. A cell is "open" when it is unmarked and no placed cat rules it out.
function analyse(p, marks) {
  const { n } = p
  const ruled = new Uint8Array(n * n) // ruled out by a placed cat
  const cats = []
  for (let i = 0; i < n * n; i++) {
    if (marks[i] === CAT) {
      cats.push(i)
      for (const j of attackedBy(p, i)) ruled[j] = 1
    }
  }
  const open = i => marks[i] === EMPTY && !ruled[i]
  const units = []
  const add = (kind, k, cells) => {
    const hasCat = cells.some(i => marks[i] === CAT)
    units.push({ kind, k, cells, hasCat, open: hasCat ? [] : cells.filter(open) })
  }
  p.units.cushions.forEach((cells, k) => add('cushion', k, cells))
  p.units.rows.forEach((cells, k) => add('row', k, cells))
  p.units.cols.forEach((cells, k) => add('column', k, cells))
  return { ruled, cats, open, units }
}

const unitName = (p, u) => (u.kind === 'cushion' ? `${cushionName(p, u.k)} cushion` : `${u.kind} ${u.k + 1}`)
const theUnit = (p, u) => (u.kind === 'cushion' ? `the ${unitName(p, u)}` : unitName(p, u))
const capitalise = s => s[0].toUpperCase() + s.slice(1)
const list = items => (items.length <= 2 ? items.join(' and ') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`)
const plural = (k, one, many) => (k === 1 ? one : many)

// Rule 1: a cushion, row or column with a single open cell. Cushions first,
// since they are the easiest to spot.
function ruleSingle(p, a) {
  for (const u of a.units) {
    if (u.hasCat || u.open.length !== 1) continue
    const i = u.open[0]
    const ruledByCats = u.cells.some(j => a.ruled[j])
    const text =
      u.cells.length === 1
        ? `The ${unitName(p, u)} is a single cell, ${cellName(p, i)}, so its cat can only sleep there, in the dashed cell.`
        : `Every cell of ${theUnit(p, u)} is crossed out${ruledByCats ? ' or ruled out by a sleeping cat' : ''} ` +
          `except one: ${cellName(p, i)}. Its cat can only sleep there, in the dashed cell.`
    return {
      rule: 'single',
      place: [i],
      cross: [],
      cells: [i],
      area: [],
      text: capitalise(text),
    }
  }
  return null
}
// Rule 2: unmarked cells that a placed cat already rules out.
function ruleNeighbours(p, marks, a) {
  for (const c of a.cats) {
    const cells = attackedBy(p, c).filter(j => marks[j] === EMPTY)
    if (!cells.length) continue
    const near = cells.some(j => touches(p.n, c, j) && rowOf(p.n, j) !== rowOf(p.n, c) && colOf(p.n, j) !== colOf(p.n, c))
    return {
      rule: 'neighbours',
      place: [],
      cross: cells,
      cells,
      area: [],
      text:
        `The cat at ${cellName(p, c)} needs its row, its column and its ${cushionName(p, p.regions[c])} cushion to itself` +
        `${near ? ', and no cat may touch it, not even at the corners' : ''}. ` +
        `Cross out the ${plural(cells.length, 'dashed cell', `${cells.length} dashed cells`)}.`,
    }
  }
  return null
}

// Rule 3: a cushion whose open cells all lie in one row (or column) owns that
// line, so the line's other open cells are empty. And the reverse: a row (or
// column) whose open cells all lie in one cushion owns that cushion.
function ruleConfined(p, a) {
  const { n } = p
  const lineCells = (kind, k) => (kind === 'row' ? p.units.rows[k] : p.units.cols[k])
  const coord = (kind, i) => (kind === 'row' ? rowOf(n, i) : colOf(n, i))
  for (const u of a.units) {
    if (u.kind !== 'cushion' || u.hasCat || u.open.length < 2) continue
    for (const kind of ['row', 'column']) {
      const ks = new Set(u.open.map(i => coord(kind, i)))
      if (ks.size !== 1) continue
      const k = [...ks][0]
      const cross = lineCells(kind, k).filter(i => a.open(i) && p.regions[i] !== u.k)
      if (!cross.length) continue
      return {
        rule: 'cushion-in-line',
        place: [],
        cross,
        cells: cross,
        area: u.open,
        text:
          `The ${unitName(p, u)} can only use ${kind} ${k + 1}, so its cat will sleep there. ` +
          `No other cat fits in that ${kind}: cross out the ${plural(cross.length, 'dashed cell', 'dashed cells')}.`,
      }
    }
  }
  for (const u of a.units) {
    if (u.kind === 'cushion' || u.hasCat || u.open.length < 2) continue
    const gs = new Set(u.open.map(i => p.regions[i]))
    if (gs.size !== 1) continue
    const g = [...gs][0]
    const cross = p.units.cushions[g].filter(i => a.open(i) && coord(u.kind, i) !== u.k)
    if (!cross.length) continue
    return {
      rule: 'line-in-cushion',
      place: [],
      cross,
      cells: cross,
      area: u.open,
      text:
        `Every open cell of ${unitName(p, u)} is on the ${cushionName(p, g)} cushion, so that cushion's cat ` +
        `must sleep in ${unitName(p, u)}. Cross out the rest of the ${cushionName(p, g)} cushion, in the dashed cells.`,
    }
  }
  return null
}

// Rule 4: a cat in this cell would rule out every open cell of some other
// cushion, row or column, leaving it with nowhere to sleep.
function ruleWouldEmpty(p, a) {
  const { n } = p
  for (let i = 0; i < n * n; i++) {
    if (!a.open(i)) continue
    const hit = new Set(attackedBy(p, i))
    for (const u of a.units) {
      if (u.hasCat || u.cells.includes(i) || !u.open.length) continue
      if (!u.open.every(j => hit.has(j))) continue
      return {
        rule: 'would-empty',
        place: [],
        cross: [i],
        cells: [i],
        area: u.open,
        text:
          `A cat at ${cellName(p, i)} would rule out every open cell of ${theUnit(p, u)} ` +
          `(ringed), leaving no bed there. Cross out the dashed cell.`,
      }
    }
  }
  return null
}

function* subsets(items, k, start = 0, acc = []) {
  if (acc.length === k) { yield acc.slice(); return }
  for (let x = start; x < items.length; x++) {
    acc.push(items[x])
    yield* subsets(items, k, x + 1, acc)
    acc.pop()
  }
}

// Rule 5: k cushions whose open cells fit in exactly k rows (or columns) use
// up those lines; other cells in them are empty. Also k rows (or columns)
// whose open cells fit in k cushions use up those cushions.
function rulePigeonhole(p, a, maxK = 3) {
  const { n } = p
  const coord = (kind, i) => (kind === 'row' ? rowOf(n, i) : colOf(n, i))
  const free = kind => a.units.filter(u => u.kind === kind && !u.hasCat && u.open.length)
  for (let k = 2; k <= maxK; k++) {
    for (const kind of ['row', 'column']) {
      const cushions = free('cushion')
      for (const set of subsets(cushions, k)) {
        const lines = new Set()
        for (const u of set) for (const i of u.open) lines.add(coord(kind, i))
        if (lines.size !== k) continue
        const gs = new Set(set.map(u => u.k))
        const cross = []
        for (let i = 0; i < n * n; i++) if (a.open(i) && lines.has(coord(kind, i)) && !gs.has(p.regions[i])) cross.push(i)
        if (!cross.length) continue
        const names = set.map(u => cushionName(p, u.k))
        const ls = [...lines].sort((x, y) => x - y).map(x => x + 1)
        return {
          rule: 'pigeonhole',
          place: [],
          cross,
          cells: cross,
          area: set.flatMap(u => u.open),
          text:
            `The open cells of the ${list(names)} cushions lie in ${kind}s ${list(ls.map(String))}. ` +
            `${k === 2 ? 'Both' : `All ${k}`} of those ${kind}s go to their cats, so cross out the dashed cells.`,
        }
      }
      for (const set of subsets(free(kind), k)) {
        const gs = new Set()
        for (const u of set) for (const i of u.open) gs.add(p.regions[i])
        if (gs.size !== k) continue
        const lines = new Set(set.map(u => u.k))
        const cross = []
        for (let i = 0; i < n * n; i++) if (a.open(i) && gs.has(p.regions[i]) && !lines.has(coord(kind, i))) cross.push(i)
        if (!cross.length) continue
        const names = [...gs].map(g => cushionName(p, g))
        const ls = [...lines].sort((x, y) => x - y).map(x => x + 1)
        return {
          rule: 'pigeonhole',
          place: [],
          cross,
          cells: cross,
          area: set.flatMap(u => u.open),
          text:
            `${kind[0].toUpperCase()}${kind.slice(1)}s ${list(ls.map(String))} only have open cells on the ` +
            `${list(names)} cushions, so those cushions' cats sleep in these ${kind}s. ` +
            `Cross out the dashed cells, elsewhere on those cushions.`,
        }
      }
    }
  }
  return null
}

// The next logical step from the current marks, in order of simplicity, or
// null when none of the rules applies. Assumes the marks are correct; use
// hint() for user-facing advice, which checks that first.
export function nextDeduction(p, marks) {
  const a = analyse(p, marks)
  return (
    ruleSingle(p, a) ||
    ruleNeighbours(p, marks, a) ||
    ruleConfined(p, a) ||
    ruleWouldEmpty(p, a) ||
    rulePigeonhole(p, a)
  )
}

export function applyDeduction(marks, d) {
  const out = marks.slice()
  for (const i of d.cross) if (out[i] === EMPTY) out[i] = CROSS
  for (const i of d.place) out[i] = CAT
  return out
}

// Solves from the given marks with the hint rules only. Every generated puzzle
// can be finished this way (the tests check it), but acceptance is decided by
// the frozen logicSolveV1 in v1.js, not by this function.
export function logicSolve(p, marks = emptyMarks(p), maxSteps = 4 * p.n * p.n) {
  const steps = []
  let m = marks
  for (let s = 0; s < maxSteps; s++) {
    if (isSolved(p, m)) return { solved: true, steps, marks: m }
    const d = nextDeduction(p, m)
    if (!d) break
    steps.push(d.rule)
    m = applyDeduction(m, d)
  }
  return { solved: isSolved(p, m), steps, marks: m }
}

// User-facing hint. First separates the player's slips from the puzzle (the
// puzzle always has exactly one answer), then looks for one deduction. If no
// rule applies it says so and offers to show one cat.
export function hint(p, marks) {
  const clash = conflicts(p, marks)
  if (clash.pairs.length) {
    const [x, y] = clash.pairs[0]
    return {
      rule: 'conflict',
      place: [], cross: [],
      cells: [x, y],
      area: [],
      text:
        `The cats at ${cellName(p, x)} and ${cellName(p, y)} disturb each other: they share a row, a column ` +
        `or a cushion, or they touch. Move one of them; the puzzle itself is fine.`,
    }
  }
  const wrongCat = marks.findIndex((m, i) => m === CAT && !p.solutionCells.has(i))
  if (wrongCat >= 0) {
    return {
      rule: 'mistake',
      place: [], cross: [],
      cells: [wrongCat],
      area: [],
      text: `The cat at ${cellName(p, wrongCat)} fits the rules for now, but it is not where the answer puts it. Try moving it.`,
    }
  }
  const wrongCross = marks.findIndex((m, i) => m === CROSS && p.solutionCells.has(i))
  if (wrongCross >= 0) {
    return {
      rule: 'mistake',
      place: [], cross: [],
      cells: [wrongCross],
      area: [],
      text: `The cross at ${cellName(p, wrongCross)} is too hasty: a cat needs that cell. Clear it and look again.`,
    }
  }
  const d = nextDeduction(p, marks)
  if (d) return d
  return {
    rule: 'none',
    place: [], cross: [],
    cells: [],
    area: [],
    text: 'No simple deduction applies to the board as it stands. You can keep looking, or let me show you one cat.',
  }
}

// A correct cat for the "show one cat" fallback: the first row without one.
export function revealOne(p, marks) {
  for (let r = 0; r < p.n; r++) {
    const i = r * p.n + p.solution[r]
    if (marks[i] !== CAT) return i
  }
  return -1
}
