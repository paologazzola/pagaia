// Tests for Pisolini's saved progress, with a fake localStorage (no browser).
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { clearAll, clearProgress, getPref, isSolvedSaved, loadProgress, pruneOld, saveProgress, setPref } from '../src/game/pisolini/storage.js'

const PREFIX = 'pagaia.pisolini.'
const DAY = 24 * 60 * 60 * 1000

function fakeStorage({ failSet = false, failGet = false } = {}) {
  const map = new Map()
  return {
    map,
    get length() { return map.size },
    key: k => [...map.keys()][k] ?? null,
    getItem(k) { if (failGet) throw new Error('blocked'); return map.has(k) ? map.get(k) : null },
    setItem(k, v) { if (failSet) throw new Error('quota'); map.set(k, String(v)) },
    removeItem(k) { map.delete(k) },
  }
}

let ls
beforeEach(() => {
  ls = fakeStorage()
  globalThis.window = { localStorage: ls }
})

const ID = 'v1-20261125-s'
const FP = 'abc123'
const state = { marks: [0, 1, 2, 0, 0, 0, 0, 0, 0], seconds: 42, hints: 1, solved: false }
const NOW = Date.UTC(2026, 10, 25)
const put = (obj, id = ID) => ls.setItem(`${PREFIX}save.${id}`, typeof obj === 'string' ? obj : JSON.stringify(obj))
const good = { v: 1, fp: FP, at: NOW, marks: '012000000', seconds: 42, hints: 1, solved: false }

test('a saved game loads back', () => {
  saveProgress(ID, state, FP, NOW)
  assert.deepEqual(loadProgress(ID, 9, FP, NOW), { state })
})

test('no save gives an empty result', () => {
  assert.deepEqual(loadProgress(ID, 9, FP, NOW), {})
})

test('bad JSON is corrupt and removed', () => {
  put('{not json')
  assert.deepEqual(loadProgress(ID, 9, FP, NOW), { corrupt: true })
  assert.equal(ls.map.size, 0)
})

test('wrong version, wrong length, invalid characters and bad numbers are corrupt', () => {
  const cases = [
    { ...good, v: 2 },
    { ...good, marks: '01200' },
    { ...good, marks: '0120000003' },
    { ...good, marks: '01200000x' },
    { ...good, seconds: -1 },
    { ...good, hints: 1.5 },
    { ...good, solved: 'yes' },
    null,
  ]
  for (const c of cases) {
    put(c)
    assert.deepEqual(loadProgress(ID, 9, FP, NOW), { corrupt: true }, JSON.stringify(c))
    assert.equal(ls.getItem(`${PREFIX}save.${ID}`), null, 'removed')
  }
})

test('a save made for another layout is corrupt', () => {
  put(good)
  assert.deepEqual(loadProgress(ID, 9, 'other', NOW), { corrupt: true })
  assert.equal(ls.map.size, 0)
  put({ ...good, fp: undefined })
  assert.deepEqual(loadProgress(ID, 9, FP, NOW), { corrupt: true })
})

test('a failing setItem does not throw', () => {
  globalThis.window = { localStorage: fakeStorage({ failSet: true }) }
  assert.doesNotThrow(() => saveProgress(ID, state, FP, NOW))
  assert.doesNotThrow(() => setPref('timer', false))
  assert.deepEqual(loadProgress(ID, 9, FP, NOW), {})
})

test('blocked or missing storage is harmless', () => {
  globalThis.window = { localStorage: fakeStorage({ failGet: true }) }
  assert.deepEqual(loadProgress(ID, 9, FP, NOW), {})
  assert.equal(isSolvedSaved(ID), false)
  assert.equal(getPref('timer', true), true)
  delete globalThis.window
  assert.deepEqual(loadProgress(ID, 9, FP, NOW), {})
  assert.doesNotThrow(() => { saveProgress(ID, state, FP, NOW); clearAll(); clearProgress(ID) })
})

test('clearAll removes only pagaia.pisolini.* keys', () => {
  saveProgress(ID, state, FP, NOW)
  setPref('timer', true)
  ls.setItem('pagaia.other', 'keep')
  ls.setItem('unrelated', 'keep')
  clearAll()
  assert.deepEqual([...ls.map.keys()].sort(), ['pagaia.other', 'unrelated'])
})

test('saves older than 30 days are pruned on load, by stored date', () => {
  put({ ...good, at: NOW - 31 * DAY }, 'v1-20261001-s')
  put({ ...good, at: NOW - 29 * DAY }, 'v1-20261002-s')
  put('garbage', 'v1-20261003-s')
  put({ ...good, at: undefined }, 'v1-20261004-s')
  setPref('timer', false)
  assert.equal(loadProgress('v1-20261002-s', 9, FP, NOW).state.seconds, 42)
  assert.deepEqual([...ls.map.keys()].sort(), [`${PREFIX}pref.timer`, `${PREFIX}save.v1-20261002-s`])
  pruneOld(NOW + 40 * DAY)
  assert.deepEqual([...ls.map.keys()], [`${PREFIX}pref.timer`])
})

test('solved saves are reported for the size pills', () => {
  saveProgress(ID, { ...state, solved: true }, FP, NOW)
  assert.equal(isSolvedSaved(ID), true)
  assert.equal(isSolvedSaved('v1-20261126-s'), false)
})
