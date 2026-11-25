// Progress lives only in this browser's localStorage, one entry per puzzle id.
// Every access is wrapped: with storage blocked or full the game still works,
// it just forgets on reload.

const PREFIX = 'pagaia.pisolini.'
const SAVE_VERSION = 1

function store() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function get(key) {
  try {
    return store()?.getItem(PREFIX + key) ?? null
  } catch {
    return null
  }
}

function set(key, value) {
  try {
    store()?.setItem(PREFIX + key, value)
  } catch {
    // Storage unavailable or full: progress is kept for this visit only.
  }
}

function remove(key) {
  try {
    store()?.removeItem(PREFIX + key)
  } catch {
    // Nothing to do.
  }
}

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

// Lists the keys of every Pisolini save (not the preferences).
function saveKeys() {
  const s = store()
  const keys = []
  if (!s) return keys
  for (let k = 0; k < s.length; k++) {
    const key = s.key(k)
    if (key && key.startsWith(`${PREFIX}save.`)) keys.push(key)
  }
  return keys
}

// Removes saves last written more than 30 days ago, going by the date stored
// in the save itself, and saves that cannot be read at all. The unreadable save
// of `keepId` stays, so loadProgress can tell the player about it.
export function pruneOld(now = Date.now(), keepId = null) {
  try {
    const s = store()
    for (const key of saveKeys()) {
      let at = NaN
      try {
        at = JSON.parse(s.getItem(key)).at
      } catch {
        // Unreadable: pruned below.
      }
      if (!Number.isFinite(at) && key === `${PREFIX}save.${keepId}`) continue
      if (!Number.isFinite(at) || now - at > MAX_AGE_MS) s.removeItem(key)
    }
  } catch {
    // Nothing to do.
  }
}

// Returns { state } for a valid save, { corrupt: true } for an unreadable one
// or one made for another layout (it is removed so the puzzle starts fresh),
// or {} when there is none. `fingerprint` identifies the layout (see
// layoutFingerprint in engine.js). Old saves are pruned first.
export function loadProgress(id, cellCount, fingerprint, now = Date.now()) {
  pruneOld(now, id)
  const raw = get(`save.${id}`)
  if (raw == null) return {}
  try {
    const s = JSON.parse(raw)
    const ok =
      s && s.v === SAVE_VERSION &&
      s.fp === fingerprint &&
      typeof s.marks === 'string' && s.marks.length === cellCount && /^[012]*$/.test(s.marks) &&
      Number.isFinite(s.seconds) && s.seconds >= 0 &&
      Number.isInteger(s.hints) && s.hints >= 0 &&
      typeof s.solved === 'boolean'
    if (!ok) throw new Error('bad save')
    return { state: { marks: Array.from(s.marks, Number), seconds: Math.floor(s.seconds), hints: s.hints, solved: s.solved } }
  } catch {
    remove(`save.${id}`)
    return { corrupt: true }
  }
}

export function saveProgress(id, { marks, seconds, hints, solved }, fingerprint, now = Date.now()) {
  set(`save.${id}`, JSON.stringify({ v: SAVE_VERSION, fp: fingerprint, at: now, marks: marks.join(''), seconds, hints, solved }))
}

export function clearProgress(id) {
  remove(`save.${id}`)
}

export function isSolvedSaved(id) {
  try {
    return JSON.parse(get(`save.${id}`) || 'null')?.solved === true
  } catch {
    return false
  }
}

// Removes every Pisolini entry, the recovery action for odd saves. Other keys
// of the site are left alone.
export function clearAll() {
  try {
    const s = store()
    if (!s) return
    const keys = []
    for (let k = 0; k < s.length; k++) {
      const key = s.key(k)
      if (key && key.startsWith(PREFIX)) keys.push(key)
    }
    for (const key of keys) s.removeItem(key)
  } catch {
    // Nothing to do.
  }
}

export function getPref(name, fallback) {
  const v = get(`pref.${name}`)
  return v == null ? fallback : v === '1'
}

export function setPref(name, on) {
  set(`pref.${name}`, on ? '1' : '0')
}
