// Pisolini generator v1: the acceptance rules. FROZEN.
//
// A puzzle id means "what generator v1 makes from this seed", forever: shared
// links and saved progress depend on it. The generator keeps a layout only if
// logicSolveV1 can solve it from an empty board within the budgets below, so
// this file defines which layouts v1 accepts. It is a frozen copy of the v1
// rule set, kept apart from the player-facing hint engine in engine.js so that
// the hints can be reworded, reordered or extended without changing any puzzle.
//
// Do not edit anything in this file (rules, their order, the budgets, the
// step cap). Any change, even a bug fix, can change which layout an id yields.
// To change the acceptance rules, add generator v2 with its own copy of this
// file and a new id prefix, and leave v1 as it is. test/pisolini-engine.test.js
// pins the layouts of many v1 ids and will fail if this file drifts.

// Generation budget. Attempts are counted, never timed, so a given id always
// produces the same puzzle on every device.
export const MAX_ATTEMPTS = 300
export const MAX_REFINE_STEPS = 60

const EMPTY = 0
const CROSS = 1
const CAT = 2

const rowOf = (n, i) => Math.floor(i / n)
const colOf = (n, i) => i % n
const touches = (n, a, b) => Math.abs(rowOf(n, a) - rowOf(n, b)) <= 1 && Math.abs(colOf(n, a) - colOf(n, b)) <= 1

// Cells a cat at i rules out: row, column, cushion and the eight neighbours.
function attackedBy(n, regions, i) {
  const r = rowOf(n, i), c = colOf(n, i), g = regions[i]
  const out = []
  for (let j = 0; j < n * n; j++) {
    if (j === i) continue
    const rj = rowOf(n, j), cj = colOf(n, j)
    if (rj === r || cj === c || regions[j] === g || (Math.abs(rj - r) <= 1 && Math.abs(cj - c) <= 1)) out.push(j)
  }
  return out
}

function solvedV1(n, solutionCells, marks) {
  let count = 0
  for (let i = 0; i < marks.length; i++) {
    if (marks[i] === CAT) {
      if (!solutionCells.has(i)) return false
      count++
    }
  }
  return count === n
}

function analyse(n, regions, marks) {
  const ruled = new Uint8Array(n * n)
  const cats = []
  for (let i = 0; i < n * n; i++) {
    if (marks[i] === CAT) {
      cats.push(i)
      for (const j of attackedBy(n, regions, i)) ruled[j] = 1
    }
  }
  const open = i => marks[i] === EMPTY && !ruled[i]
  const rows = [], cols = [], cushions = []
  for (let k = 0; k < n; k++) { rows.push([]); cols.push([]); cushions.push([]) }
  for (let i = 0; i < n * n; i++) {
    rows[rowOf(n, i)].push(i)
    cols[colOf(n, i)].push(i)
    cushions[regions[i]].push(i)
  }
  const units = []
  const add = (kind, k, cells) => {
    const hasCat = cells.some(i => marks[i] === CAT)
    units.push({ kind, k, cells, hasCat, open: hasCat ? [] : cells.filter(open) })
  }
  cushions.forEach((cells, k) => add('cushion', k, cells))
  rows.forEach((cells, k) => add('row', k, cells))
  cols.forEach((cells, k) => add('column', k, cells))
  return { ruled, cats, open, units, rows, cols, cushions }
}

function ruleSingle(a) {
  for (const u of a.units) {
    if (u.hasCat || u.open.length !== 1) continue
    return { place: [u.open[0]], cross: [] }
  }
  return null
}

function ruleNeighbours(n, regions, marks, a) {
  for (const c of a.cats) {
    const cells = attackedBy(n, regions, c).filter(j => marks[j] === EMPTY)
    if (cells.length) return { place: [], cross: cells }
  }
  return null
}

function ruleConfined(n, regions, a) {
  const lineCells = (kind, k) => (kind === 'row' ? a.rows[k] : a.cols[k])
  const coord = (kind, i) => (kind === 'row' ? rowOf(n, i) : colOf(n, i))
  for (const u of a.units) {
    if (u.kind !== 'cushion' || u.hasCat || u.open.length < 2) continue
    for (const kind of ['row', 'column']) {
      const ks = new Set(u.open.map(i => coord(kind, i)))
      if (ks.size !== 1) continue
      const k = [...ks][0]
      const cross = lineCells(kind, k).filter(i => a.open(i) && regions[i] !== u.k)
      if (cross.length) return { place: [], cross }
    }
  }
  for (const u of a.units) {
    if (u.kind === 'cushion' || u.hasCat || u.open.length < 2) continue
    const gs = new Set(u.open.map(i => regions[i]))
    if (gs.size !== 1) continue
    const g = [...gs][0]
    const cross = a.cushions[g].filter(i => a.open(i) && coord(u.kind, i) !== u.k)
    if (cross.length) return { place: [], cross }
  }
  return null
}

function ruleWouldEmpty(n, regions, a) {
  for (let i = 0; i < n * n; i++) {
    if (!a.open(i)) continue
    const hit = new Set(attackedBy(n, regions, i))
    for (const u of a.units) {
      if (u.hasCat || u.cells.includes(i) || !u.open.length) continue
      if (!u.open.every(j => hit.has(j))) continue
      return { place: [], cross: [i] }
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

function rulePigeonhole(n, regions, a, maxK = 3) {
  const coord = (kind, i) => (kind === 'row' ? rowOf(n, i) : colOf(n, i))
  const free = kind => a.units.filter(u => u.kind === kind && !u.hasCat && u.open.length)
  for (let k = 2; k <= maxK; k++) {
    for (const kind of ['row', 'column']) {
      for (const set of subsets(free('cushion'), k)) {
        const lines = new Set()
        for (const u of set) for (const i of u.open) lines.add(coord(kind, i))
        if (lines.size !== k) continue
        const gs = new Set(set.map(u => u.k))
        const cross = []
        for (let i = 0; i < n * n; i++) if (a.open(i) && lines.has(coord(kind, i)) && !gs.has(regions[i])) cross.push(i)
        if (cross.length) return { place: [], cross }
      }
      for (const set of subsets(free(kind), k)) {
        const gs = new Set()
        for (const u of set) for (const i of u.open) gs.add(regions[i])
        if (gs.size !== k) continue
        const lines = new Set(set.map(u => u.k))
        const cross = []
        for (let i = 0; i < n * n; i++) if (a.open(i) && gs.has(regions[i]) && !lines.has(coord(kind, i))) cross.push(i)
        if (cross.length) return { place: [], cross }
      }
    }
  }
  return null
}

function nextStepV1(n, regions, marks) {
  const a = analyse(n, regions, marks)
  return ruleSingle(a) || ruleNeighbours(n, regions, marks, a) || ruleConfined(n, regions, a) ||
    ruleWouldEmpty(n, regions, a) || rulePigeonhole(n, regions, a)
}

// True when the v1 rules alone solve the layout from an empty board, within
// 4 * n * n steps. `solution` is the unique solution, as a column per row.
export function logicSolveV1(n, regions, solution) {
  const solutionCells = new Set(solution.map((c, r) => r * n + c))
  let marks = new Array(n * n).fill(EMPTY)
  const maxSteps = 4 * n * n
  for (let s = 0; s < maxSteps; s++) {
    if (solvedV1(n, solutionCells, marks)) return true
    const d = nextStepV1(n, regions, marks)
    if (!d) break
    marks = marks.slice()
    for (const i of d.cross) if (marks[i] === EMPTY) marks[i] = CROSS
    for (const i of d.place) marks[i] = CAT
  }
  return solvedV1(n, solutionCells, marks)
}
