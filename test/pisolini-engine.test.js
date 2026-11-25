// Tests for the Pisolini engine. Run with `npm test` (node:test, no browser).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CAT, CROSS, EMPTY, FALLBACKS, SIZES,
  applyDeduction, conflicts, dailyId, emptyMarks, fallback, generate, generateN, hashString, hint,
  isContiguous, isSolved, layoutFingerprint, logicSolve, mulberry32, nextDeduction, parseId, randomId, revealOne, solve,
} from '../src/game/pisolini/engine.js'
import { logicSolveV1 } from '../src/game/pisolini/v1.js'

const SAMPLE = Number(process.env.PISOLINI_SAMPLE || 200)

// A compact fingerprint of a layout: the cushion of every cell, row by row.
const layout = p => Array.from(p.regions, g => String.fromCharCode(65 + g)).join('')

// Checks every structural property of a puzzle and its stored solution.
function assertValid(p) {
  const { n, regions, solution } = p
  assert.equal(regions.length, n * n)
  assert.equal(new Set(regions).size, n, 'n cushions')
  for (let g = 0; g < n; g++) assert.ok(isContiguous(n, regions, g), `cushion ${g} contiguous in ${p.id}`)
  // One cat per row (by construction), per column and per cushion, none touching.
  assert.equal(new Set(solution).size, n, 'one cat per column')
  assert.equal(new Set(solution.map((c, r) => regions[r * n + c])).size, n, 'one cat per cushion')
  for (let r = 1; r < n; r++) assert.ok(Math.abs(solution[r] - solution[r - 1]) > 1, 'cats do not touch')
  const sols = solve(n, regions, 2)
  assert.equal(sols.length, 1, `unique solution for ${p.id}`)
  assert.deepEqual(sols[0], solution)
}

// Every placement must be a solution cell, every cross a non-solution cell.
function assertSound(p, d, where) {
  for (const i of d.place) assert.ok(p.solutionCells.has(i), `${where}: ${d.rule} places a wrong cat`)
  for (const i of d.cross) assert.ok(!p.solutionCells.has(i), `${where}: ${d.rule} crosses a cat's cell`)
}

// A random state consistent with the solution: some correct cats and crosses.
function partialState(p, rng) {
  const marks = emptyMarks(p)
  for (let i = 0; i < marks.length; i++) {
    const x = rng()
    if (p.solutionCells.has(i)) { if (x < 0.3) marks[i] = CAT }
    else if (x < 0.35) marks[i] = CROSS
  }
  return marks
}

// Regression set: these layouts are part of generator v1 and must never change,
// or saved progress and shared links for those ids would break. Values are
// hashString of the layout fingerprint. If this test fails, do not update the
// values: the change is wrong for v1 (see the note at the top of v1.js) and
// belongs in a new generator version.
const REGRESSION = {
  'v1-20261125-s': 1580692627,
  'v1-20261125-m': 1317228662,
  'v1-20261125-l': 1126060476,
  'v1-20270101-s': 399664013,
  'v1-20270101-m': 2000650069,
  'v1-20270101-l': 3795132269,
  'v1-a1b2c3d4-s': 409098937,
  'v1-q9w8e7r6-m': 838260852,
  'v1-zzzzzzzz-l': 442389664,
  'v1-20261201-s': 3268580008,
  'v1-20261202-s': 2691101904,
  'v1-20261203-s': 4008841670,
  'v1-20261204-s': 692307526,
  'v1-20261205-s': 390301634,
  'v1-20261206-s': 1286128634,
  'v1-20261207-s': 3994412377,
  'v1-20261208-s': 2796108639,
  'v1-20261209-s': 2457448469,
  'v1-20261210-s': 1139499556,
  'v1-pin011-s': 2674001316,
  'v1-pin012-s': 839661185,
  'v1-pin013-s': 3471509068,
  'v1-pin014-s': 1379319916,
  'v1-pin015-s': 3503270081,
  'v1-pin016-s': 1798416323,
  'v1-pin017-s': 1130309196,
  'v1-pin018-s': 3032434583,
  'v1-pin019-s': 2310337679,
  'v1-pin020-s': 123015447,
  'v1-pin021-s': 1617292094,
  'v1-pin022-s': 4260613720,
  'v1-pin023-s': 4274470815,
  'v1-pin024-s': 1258296400,
  'v1-pin025-s': 2455177846,
  'v1-pin026-s': 2859370209,
  'v1-pin027-s': 2093908567,
  'v1-pin028-s': 1109080608,
  'v1-pin029-s': 3917475112,
  'v1-pin030-s': 3524461134,
  'v1-20261201-m': 3246290111,
  'v1-20261202-m': 504489041,
  'v1-20261203-m': 3855654627,
  'v1-20261204-m': 3488323210,
  'v1-20261205-m': 2476296803,
  'v1-20261206-m': 1282430056,
  'v1-20261207-m': 1311587745,
  'v1-20261208-m': 2102904306,
  'v1-20261209-m': 3414170911,
  'v1-20261210-m': 3973485162,
  'v1-pin011-m': 3944754345,
  'v1-pin012-m': 3131023612,
  'v1-pin013-m': 3950007924,
  'v1-pin014-m': 1441956172,
  'v1-pin015-m': 679776892,
  'v1-pin016-m': 3112120380,
  'v1-pin017-m': 1192237996,
  'v1-pin018-m': 2563890478,
  'v1-pin019-m': 731523142,
  'v1-pin020-m': 2433064274,
  'v1-pin021-m': 3982320249,
  'v1-pin022-m': 3141504991,
  'v1-pin023-m': 3436138849,
  'v1-pin024-m': 2484250935,
  'v1-pin025-m': 2508468613,
  'v1-pin026-m': 3963876700,
  'v1-pin027-m': 2990069189,
  'v1-pin028-m': 2869450606,
  'v1-pin029-m': 376728637,
  'v1-pin030-m': 3161899422,
  'v1-20261201-l': 748338138,
  'v1-20261202-l': 1793422113,
  'v1-20261203-l': 3993068012,
  'v1-20261204-l': 3538371933,
  'v1-20261205-l': 3878344340,
  'v1-20261206-l': 3560978263,
  'v1-20261207-l': 3914306504,
  'v1-20261208-l': 864622209,
  'v1-20261209-l': 783485727,
  'v1-20261210-l': 1427678500,
  'v1-pin011-l': 2421639260,
  'v1-pin012-l': 4118835417,
  'v1-pin013-l': 2156623603,
  'v1-pin014-l': 3131649954,
  'v1-pin015-l': 547336200,
  'v1-pin016-l': 3513344321,
  'v1-pin017-l': 660094127,
  'v1-pin018-l': 2153771850,
  'v1-pin019-l': 624683706,
  'v1-pin020-l': 2520901835,
  'v1-pin021-l': 2426499014,
  'v1-pin022-l': 1922107293,
  'v1-pin023-l': 1358104784,
  'v1-pin024-l': 3625817028,
  'v1-pin025-l': 975355780,
  'v1-pin026-l': 1158528044,
  'v1-pin027-l': 2307328691,
  'v1-pin028-l': 205343571,
  'v1-pin029-l': 1793894674,
  'v1-pin030-l': 1761556004
}

test('ids parse, and daily ids follow the local date', () => {
  assert.deepEqual(parseId('v1-20261125-m'), { id: 'v1-20261125-m', version: 'v1', key: '20261125', size: 'm', n: 7, daily: '20261125' })
  assert.equal(parseId('v1-k3x9q2ab-l').daily, null)
  for (const bad of ['', 'v2-20261125-m', 'v1-20261125-x', 'v1-ABC-s', 'v1-abc-s', 'v1-20261125-m ', null]) assert.equal(parseId(bad), null)
  assert.equal(dailyId('s', new Date(2026, 10, 5, 23, 59)), 'v1-20261105-s')
  const rng = mulberry32(7)
  for (let k = 0; k < 50; k++) {
    const id = randomId('m', rng)
    const info = parseId(id)
    assert.ok(info && !info.daily, id)
  }
})

test('the PRNG is deterministic', () => {
  const a = mulberry32(hashString('v1-20261125-m'))
  const b = mulberry32(hashString('v1-20261125-m'))
  for (let k = 0; k < 100; k++) assert.equal(a(), b())
})

test('regression ids produce the recorded unique layouts', () => {
  for (const id of Object.keys(REGRESSION)) {
    const p = generate(id)
    assert.equal(p.n, SIZES[id.at(-1)])
    assert.equal(p.source, 'generated', id)
    assertValid(p)
    assert.equal(hashString(layout(p)), REGRESSION[id], `layout of ${id} changed`)
    assert.ok(logicSolveV1(p.n, p.regions, p.solution), `${id} is accepted by the frozen v1 rules`)
  }
  // At least 30 pinned ids per size.
  for (const s of Object.keys(SIZES)) assert.ok(Object.keys(REGRESSION).filter(id => id.endsWith(`-${s}`)).length >= 30, s)
})

test('the layout fingerprint follows the layout', () => {
  const a = generate('v1-20261125-m'), b = generate('v1-20261126-m')
  assert.equal(layoutFingerprint(a), layoutFingerprint(generate('v1-20261125-m')))
  assert.notEqual(layoutFingerprint(a), layoutFingerprint(b))
  assert.match(layoutFingerprint(a), /^[0-9a-z]+$/)
})

test('daily dates must be real calendar dates', () => {
  assert.equal(parseId('v1-20240229-s').daily, '20240229')
  for (const bad of ['20230229', '20261301', '20261132', '20260000', '99999999', '00000101']) {
    const info = parseId(`v1-${bad}-s`)
    assert.ok(info, `${bad} is still a valid free-play seed`)
    assert.equal(info.daily, null, bad)
  }
})

test('the pigeonhole hint says where the open cells lie', () => {
  const rng = mulberry32(5)
  for (let k = 0; k < 80; k++) {
    const p = generate(randomId('lms'[k % 3], rng))
    let marks = emptyMarks(p)
    while (!isSolved(p, marks)) {
      const d = nextDeduction(p, marks)
      if (d.rule === 'pigeonhole' && /^The open cells of the .+ cushions lie in (rows|columns) /.test(d.text)) return
      marks = applyDeduction(marks, d)
    }
  }
  assert.fail('no cushion-first pigeonhole hint met')
})

test('same id, same puzzle', () => {
  for (const s of Object.keys(SIZES)) {
    const id = `v1-repeat01-${s}`
    const a = generate(id), b = generate(id)
    assert.equal(layout(a), layout(b))
    assert.deepEqual(a.solution, b.solution)
  }
})

for (const s of Object.keys(SIZES)) {
  test(`random sample of ${SAMPLE} ${s} puzzles: unique, contiguous, logic-solvable, sound hints, timing`, t => {
    const times = []
    let fallbacks = 0
    const rng = mulberry32(hashString(`sample-${s}`))
    for (let k = 0; k < SAMPLE; k++) {
      const id = randomId(s, rng)
      const t0 = performance.now()
      const p = generate(id)
      times.push(performance.now() - t0)
      if (p.source !== 'generated') fallbacks++
      assertValid(p)
      // The rules alone solve it from an empty board, every step sound.
      let marks = emptyMarks(p)
      for (let step = 0; !isSolved(p, marks); step++) {
        assert.ok(step < 4 * p.n * p.n, `${id}: logic solve did not finish`)
        const d = nextDeduction(p, marks)
        assert.ok(d, `${id}: logic solve got stuck`)
        assertSound(p, d, id)
        marks = applyDeduction(marks, d)
      }
      // Hints from a random correct partial state are sound too.
      const partial = partialState(p, rng)
      const h = hint(p, partial)
      if (h.rule !== 'none') assertSound(p, h, `${id} partial`)
      assert.ok(!['conflict', 'mistake'].includes(h.rule), `${id}: correct marks reported as a mistake`)
    }
    times.sort((x, y) => x - y)
    const avg = times.reduce((x, y) => x + y, 0) / times.length
    const p95 = times[Math.floor(times.length * 0.95)]
    const max = times.at(-1)
    t.diagnostic(`${s} (${SIZES[s]}x${SIZES[s]}): avg ${avg.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms, max ${max.toFixed(1)} ms, fallbacks ${fallbacks}`)
    assert.equal(fallbacks, 0, 'no fallback needed in the sample')
    // Timing depends on the machine, so it only fails the run when asked to (PISOLINI_PERF=1).
    if (process.env.PISOLINI_PERF === '1') assert.ok(p95 < 100, `p95 generation time ${p95.toFixed(1)} ms is under 100 ms`)
    else if (p95 >= 100) t.diagnostic('p95 is above 100 ms (set PISOLINI_PERF=1 to enforce it)')
  })
}

test('8x8 works internally', () => {
  const p = generateN('v1-eight001-m', 8)
  assertValid(p)
  assert.ok(logicSolve(p).solved)
})

test('fallback layouts are valid, unique and logic-solvable', () => {
  for (const n of Object.keys(FALLBACKS).map(Number)) {
    assert.equal(FALLBACKS[n].length, n)
    for (const row of FALLBACKS[n]) assert.equal(row.length, n)
    const p = fallback(`v1-fallback-${n}`, n)
    assert.equal(p.source, 'fallback')
    assertValid(p)
    assert.ok(logicSolve(p).solved, `fallback ${n} needs no guessing`)
  }
})

test('hints separate the player\'s slips from the puzzle', () => {
  const p = generate('v1-20261125-m')
  const { n, solution } = p
  // A wrong cat that conflicts with a right one.
  const marks = emptyMarks(p)
  const a = 0 * n + solution[0]
  marks[a] = CAT
  const b = 1 * n + solution[0] // same column
  marks[b] = CAT
  assert.equal(conflicts(p, marks).pairs.length, 1)
  let h = hint(p, marks)
  assert.equal(h.rule, 'conflict')
  assert.deepEqual(h.cells.sort(), [a, b].sort())
  // A wrong cat on its own.
  marks[b] = EMPTY
  const wrong = [...Array(n * n).keys()].find(i => !p.solutionCells.has(i) && conflicts(p, Object.assign(marks.slice(), { [i]: CAT })).pairs.length === 0)
  marks[wrong] = CAT
  h = hint(p, marks)
  assert.equal(h.rule, 'mistake')
  assert.deepEqual(h.cells, [wrong])
  // A cross on a cat's cell.
  marks[wrong] = EMPTY
  const cell = 3 * n + solution[3]
  marks[cell] = CROSS
  h = hint(p, marks)
  assert.equal(h.rule, 'mistake')
  assert.deepEqual(h.cells, [cell])
})

test('every hint rule type appears and has plain-English text', () => {
  const seen = new Map()
  const rng = mulberry32(99)
  for (let k = 0; k < 60; k++) {
    const p = generate(randomId('lms'[k % 3], rng))
    let marks = emptyMarks(p)
    while (!isSolved(p, marks)) {
      const d = nextDeduction(p, marks)
      if (!seen.has(d.rule)) seen.set(d.rule, d.text)
      marks = applyDeduction(marks, d)
    }
  }
  for (const rule of ['single', 'neighbours', 'cushion-in-line', 'line-in-cushion', 'would-empty', 'pigeonhole']) {
    assert.ok(seen.has(rule), `rule ${rule} used`)
    assert.match(seen.get(rule), /^[A-Z].+\.$/)
  }
})

test('show one cat reveals a correct, missing cat', () => {
  const p = generate('v1-20261125-l')
  const marks = emptyMarks(p)
  marks[p.solution[0]] = CAT
  const i = revealOne(p, marks)
  assert.ok(p.solutionCells.has(i))
  assert.notEqual(i, p.solution[0])
})
