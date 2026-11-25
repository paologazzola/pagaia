// The security pages are static HTML; this entry brings their styles and
// adds a live category filter on the index.
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-700.css'
import '@fontsource/fraunces/latin-600.css'
import '@fontsource/fraunces/latin-600-italic.css'
import '@fontsource/fraunces/latin-800.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '../shared/base.css'
import '../shared/site.css'
import './security.css'

// Live category filter for the security index. It only hides the notes that
// do not match the category in the URL hash (e.g. /security/#xss) and marks
// the active filter. Without JavaScript every note stays visible and the
// filter links behave as plain anchors, so nothing is lost.
const list = document.querySelector('.sec-list')
const filters = document.querySelector('.sec-filters')
if (list && filters) {
  const items = [...list.children]
  const links = [...filters.querySelectorAll('.sec-filter')]
  const empty = document.querySelector('[data-empty]')
  const known = new Set(links.map(l => l.dataset.cat).filter(Boolean))

  const apply = () => {
    const key = decodeURIComponent(location.hash.slice(1))
    const active = known.has(key) ? key : ''
    let shown = 0
    for (const li of items) {
      const cats = (li.dataset.cat || '').split(' ').filter(Boolean)
      const match = !active || cats.includes(active)
      li.hidden = !match
      if (match) shown++
    }
    if (empty) empty.hidden = shown > 0
    for (const l of links) {
      const on = (l.dataset.cat || '') === active
      l.classList.toggle('is-active', on)
      if (on) l.setAttribute('aria-current', 'true')
      else l.removeAttribute('aria-current')
    }
  }
  addEventListener('hashchange', apply)
  apply()
}

// Copy-link control on note pages. Without JavaScript the address stays
// visible as selectable text; here it is replaced by a button.
const copy = document.querySelector('[data-copy]')
if (copy) {
  const btn = copy.querySelector('.sec-copy-btn')
  const status = copy.querySelector('.sec-copy-status')
  const text = copy.querySelector('.sec-copy-url')
  const url = copy.dataset.copy
  let timer
  const say = msg => {
    status.textContent = msg
    clearTimeout(timer)
    timer = setTimeout(() => { status.textContent = '' }, 2500)
  }
  if (btn && status && navigator.clipboard?.writeText) {
    btn.hidden = false
    text.hidden = true
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url)
        say('Copied')
      } catch {
        btn.hidden = true
        text.hidden = false
        say('Copy failed: select the address instead')
      }
    })
  }
}
