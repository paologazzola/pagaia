// Generates the static pages of the security section from the approved
// articles in content/security/*.json, which the editorial back office
// exports. Every page is plain HTML written at build time, so it works
// without JavaScript and survives a direct refresh on any static host.
// The build fails if an article does not match the digest that Paolo
// approved, or if its HTML contains anything executable.
import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SLUG = /^cve-\d{4}-\d{4,}$/
const REQUIRED = ['slug', 'cve', 'title', 'revision', 'digest', 'body_md', 'body_html', 'patch_status', 'approved_at']

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const day = iso => (iso || '').slice(0, 10)

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

// Joins the non-empty parts with a middle dot, so a missing vendor or product
// never leaves a dangling separator.
const joinMeta = parts => parts.map(x => String(x ?? '').trim()).filter(Boolean).join(' · ')

// Category keys mirror the editorial vocabulary (editorial/internal/category):
// programming languages, then one area. The back office assigns them; the site
// maps only the known keys to labels and ignores anything else, so an
// unexpected value can never reach the page.
const CATEGORIES = {
  php: 'PHP',
  javascript: 'JavaScript / Node.js',
  python: 'Python',
  java: 'Java',
  dotnet: '.NET',
  go: 'Go',
  ruby: 'Ruby',
  rust: 'Rust',
  os: 'Operating systems',
  network: 'Networking & servers',
  software: 'Software',
}
const CAT_ORDER = Object.keys(CATEGORIES)

// catKeys returns an article's known category keys, in display order.
function catKeys(a) {
  const set = new Set(Array.isArray(a.categories) ? a.categories : [])
  return CAT_ORDER.filter(k => set.has(k))
}

function status(a) {
  const fix = { patched: ['fixed', 'Fix available'], unpatched: ['open', 'No official fix yet'], withdrawn: ['withdrawn', 'Record withdrawn'] }[a.patch_status] || ['open', 'Status unknown']
  return fix
}

function plainImpact(md) {
  const m = md.match(/\n## Impact\n\n([\s\S]*?)(\n## |$)/)
  const text = (m ? m[1] : '').replace(/\\([!-/:-@[-`{-~])/g, '$1').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 155 ? text.slice(0, 154) + '…' : text
}

function check(a, file) {
  for (const k of REQUIRED) if (a[k] === undefined || a[k] === '') throw new Error(`${file}: missing ${k}`)
  if (!SLUG.test(a.slug) || `${a.slug}.json` !== file) throw new Error(`${file}: unexpected slug ${a.slug}`)
  const digest = createHash('sha256').update(`${a.title}\n\n${a.body_md}`).digest('hex')
  if (digest !== a.digest) throw new Error(`${file}: content does not match the approved digest`)
  if (/<(script|iframe|object|embed|style|form|img|svg)\b|<[^>]*\son\w+\s*=|<[^>]*\s(href|src)\s*=\s*["']?\s*(javascript|data|vbscript):/i.test(a.body_html)) {
    throw new Error(`${file}: body contains executable or embedded content`)
  }
}

// The paddle mark, kept in sync with src/shared/PaddleLogo.jsx. Inlined because
// this generator runs in plain Node and cannot import the JSX component.
const LOGO = size =>
  `<svg class="paddle-logo" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">` +
  `<circle cx="20" cy="20" r="18" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5"/>` +
  `<path d="M20 5.5c5.5 3.4 8 7.6 8 12s-2.5 8.6-8 12c-5.5-3.4-8-7.6-8-12s2.5-8.6 8-12z" fill="none" stroke="var(--ink)" stroke-width="2.5"/>` +
  `<path d="M20 5.5c5.5 3.4 8 7.6 8 12 0 .9-.1 1.8-.3 2.7H20V5.5z" fill="var(--rose)"/>` +
  `<rect x="18.4" y="18" width="3.2" height="15" rx="1.6" fill="var(--ink)"/></svg>`

function header() {
  return `<a class="skip-link" href="#main">Skip to content</a>
    <p class="site-wip" role="note">Work in progress — the site is taking shape.</p>
    <header class="site-header">
      <a class="site-brand" href="/" aria-label="pagaia home">
        ${LOGO(32)}
        <span class="site-wordmark">pagaia</span>
      </a>
      <nav class="site-nav" aria-label="Main">
        <ul>
          <li><a href="/manifesto/">Manifesto</a></li>
          <li><a href="/security/" aria-current="page">Security</a></li>
          <li><span class="nav-soon">Game<span class="soon-tag">soon</span></span></li>
        </ul>
      </nav>
    </header>`
}

function footer() {
  return `<footer class="site-footer">
      <div class="foot-wrap">
        <div class="foot-brand">
          <a class="foot-logo" href="/" aria-label="pagaia home">${LOGO(28)}<span>pagaia</span></a>
          <p class="foot-tag">Told with heart and rigour. Paddle through the noise.</p>
        </div>
        <div class="foot-col"><h2>Sections</h2><ul>
          <li><a href="/manifesto/">Manifesto</a></li>
          <li><a href="/security/">Security</a></li>
          <li><span class="foot-muted">Game · soon</span></li>
        </ul></div>
        <div class="foot-col"><h2>Security</h2><ul>
          <li><a href="/security/">Latest notes</a></li>
          <li><a href="/security/#selection">How we select</a></li>
          <li><a href="/security/#sources">Sources</a></li>
        </ul></div>
        <div class="foot-col"><h2>About</h2><ul>
          <li><a href="/manifesto/">What is Pagaia</a></li>
          <li><span class="foot-muted">Contact · soon</span></li>
          <li><span class="foot-muted">RSS · soon</span></li>
        </ul></div>
      </div>
      <div class="foot-bar"><span>© ${new Date().getFullYear()} pagaia.xyz</span><span>made with ink</span></div>
    </footer>`
}

const SITE = 'https://pagaia.xyz'

function page({ title, description, body, path = '/' }) {
  const url = SITE + path
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#f4efe6" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Pagaia" />
    <meta property="og:locale" content="en" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${SITE}/og.png" />
    <script type="module" src="/src/security/main.js"></script>
  </head>
  <body>
    ${header()}
    <main id="main" class="sec">
${body}
    </main>
    ${footer()}
  </body>
</html>
`
}

function badges(a) {
  const [cls, label] = status(a)
  let out = ''
  if (a.exploited) out += `<span class="sec-badge exploited">Actively exploited</span> `
  out += `<span class="sec-badge ${cls}">${esc(label)}</span>`
  return out
}

// filterBar renders category filters for the categories present across the
// published articles, with a count each. The links degrade to hash anchors
// without JavaScript; main.js turns them into a live filter.
function filterBar(articles) {
  const counts = new Map()
  for (const a of articles) for (const k of catKeys(a)) counts.set(k, (counts.get(k) || 0) + 1)
  const present = CAT_ORDER.filter(k => counts.has(k))
  if (!present.length) return ''
  const chip = (href, key, label, n) =>
    `<li><a class="sec-filter" href="${href}" data-cat="${esc(key)}">${esc(label)} <span class="sec-filter-n">${n}</span></a></li>`
  const items = [chip('/security/', '', 'All', articles.length)]
    .concat(present.map(k => chip(`/security/#${k}`, k, CATEGORIES[k], counts.get(k))))
    .join('\n          ')
  return `      <nav class="sec-filters" aria-label="Filter by category">
        <ul>
          ${items}
        </ul>
      </nav>`
}

function indexPage(articles) {
  const items = articles.map(a => `        <li data-cat="${esc(catKeys(a).join(' '))}">
          <a class="sec-title" href="/security/${a.slug}/">${esc(a.title)}</a>
          <p class="sec-meta">${esc(joinMeta([a.cve, who(a.vendor, a.product), a.score ? `CVSS ${a.score}` : '']))}</p>
          <p class="sec-meta">${badges(a)} <span>Updated <time datetime="${day(a.updated)}">${day(a.updated)}</time></span></p>
        </li>`).join('\n')
  return page({
    title: 'Security · Pagaia',
    path: '/security/',
    description: 'Critical or actively exploited vulnerabilities with affected versions, fixes and dated sources, reviewed by a person before publication.',
    body: `      <h1>Security</h1>
      <p class="sec-intro">Critical or actively exploited vulnerabilities, with affected versions, fixes and dated sources. Each note is reviewed by a person before publication and updated when vendors ship fixes. <a href="#selection">How we select</a> and <a href="#sources">where the facts come from</a> are below.</p>
${filterBar(articles)}
      <p class="sec-empty" data-empty hidden>No notes in this category.</p>
      ${articles.length ? `<ul class="sec-list">\n${items}\n      </ul>` : '<p class="sec-empty">No notes published yet.</p>'}
      <section class="sec-about" id="selection" aria-labelledby="selection-h">
        <h2 id="selection-h">How we select</h2>
        <p>A vulnerability is considered for a note when it meets at least one of these conditions:</p>
        <ul>
          <li>it is critical, with a CVSS base score of 9.0 or higher;</li>
          <li>it is listed in CISA's Known Exploited Vulnerabilities (KEV) catalog, so it is already exploited in the wild;</li>
          <li>it has a CVSS base score of 8.0 or higher and EPSS from FIRST estimates at least a 30% probability that it will be exploited in the next 30 days.</li>
        </ul>
        <p>The scope is programming languages, software, operating systems and networking; industrial equipment, medical products, consumer devices and vehicles are left out. Not every candidate gets a note: the editor chooses which ones to write.</p>
        <p>Each note is written from public records, reviewed by a person before publication, dated, and revised when the source changes, for example when a vendor ships a fix.</p>
      </section>
      <section class="sec-about" id="sources" aria-labelledby="sources-h">
        <h2 id="sources-h">Sources</h2>
        <ul>
          <li>The CVE List published by the CVE Program (CVE JSON 5 records).</li>
          <li>The CISA Known Exploited Vulnerabilities catalog.</li>
          <li>EPSS, the Exploit Prediction Scoring System from FIRST.</li>
          <li>The vendor advisories referenced in each note.</li>
        </ul>
      </section>`,
  })
}

function articlePage(a) {
  return page({
    title: `${a.title} · Security · Pagaia`,
    path: `/security/${a.slug}/`,
    description: plainImpact(a.body_md) || (who(a.vendor, a.product) ? `${a.cve} in ${who(a.vendor, a.product)}` : a.cve),
    body: `      <p class="sec-back"><a href="/security/">← All notes</a></p>
      <article class="sec-article">
        <h1>${esc(a.title)}</h1>
        <p class="sec-meta">${badges(a)}</p>
        ${catKeys(a).length ? `<p class="sec-cats">${catKeys(a).map(k => `<a class="sec-cat" href="/security/#${k}">${esc(CATEGORIES[k])}</a>`).join(' ')}</p>` : ''}
        <dl class="sec-facts">
          <dt>CVE</dt><dd>${esc(a.cve)}</dd>
          ${who(a.vendor, a.product) ? `<dt>Product</dt><dd>${esc(who(a.vendor, a.product))}</dd>` : ''}
          ${a.score ? `<dt>CVSS</dt><dd>${esc(a.score)} (v${esc(a.cvss_version)})</dd>` : ''}
          ${a.exploited ? `<dt>Exploited since</dt><dd>${esc(a.exploited_since)} (CISA KEV)</dd>` : ''}
          <dt>Published</dt><dd><time datetime="${day(a.first_published)}">${day(a.first_published)}</time></dd>
          <dt>Updated</dt><dd><time datetime="${day(a.updated)}">${day(a.updated)}</time>, revision ${esc(a.revision)}</dd>
        </dl>
        <div class="sec-body">
${a.body_html}
        </div>
        <p class="sec-note">Written from the public records listed under Sources and reviewed before publication. Revision ${esc(a.revision)}, content digest <code>${esc(a.digest.slice(0, 16))}</code>.</p>
      </article>`,
  })
}

// Writes security/index.html and security/<slug>/index.html under root and
// returns the Vite inputs for them.
export function generateSecurityPages(root) {
  const src = join(root, 'content', 'security')
  const out = join(root, 'security')
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  const files = existsSync(src) ? readdirSync(src).filter(f => f.endsWith('.json')).sort() : []
  const articles = files.map(f => {
    const a = JSON.parse(readFileSync(join(src, f), 'utf8'))
    check(a, f)
    a.first_published ||= a.approved_at
    a.updated ||= a.approved_at
    return a
  })
  articles.sort((x, y) => (y.updated || '').localeCompare(x.updated || '') || x.slug.localeCompare(y.slug))
  const inputs = { security: join(out, 'index.html') }
  writeFileSync(inputs.security, indexPage(articles))
  for (const a of articles) {
    mkdirSync(join(out, a.slug), { recursive: true })
    const p = join(out, a.slug, 'index.html')
    writeFileSync(p, articlePage(a))
    inputs[`security-${a.slug}`] = p
  }
  return inputs
}
