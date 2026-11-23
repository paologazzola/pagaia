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

// Category keys mirror the editorial category vocabulary. The back office
// assigns them; the site maps only the known keys to labels and ignores
// anything else, so an unexpected value can never reach the page.
const CATEGORIES = {
  'remote-code-execution': 'Remote code execution',
  'command-injection': 'Command injection',
  'code-injection': 'Code injection',
  'sql-injection': 'SQL injection',
  xss: 'Cross-site scripting',
  xxe: 'XML external entity',
  deserialization: 'Insecure deserialization',
  'path-traversal': 'Path traversal',
  'file-upload': 'Unrestricted file upload',
  'auth-bypass': 'Authentication bypass',
  'access-control': 'Broken access control',
  ssrf: 'Server-side request forgery',
  csrf: 'Cross-site request forgery',
  'memory-safety': 'Memory safety',
  'race-condition': 'Race condition',
  dos: 'Denial of service',
  'info-disclosure': 'Information disclosure',
  crypto: 'Cryptographic weakness',
  'hardcoded-credentials': 'Hard-coded credentials',
  other: 'Other',
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
  if (/<(script|iframe|object|embed|style|form|img|svg)\b|<[^>]*\son\w+\s*=|(href|src)\s*=\s*["']?\s*(javascript|data|vbscript):/i.test(a.body_html)) {
    throw new Error(`${file}: body contains executable or embedded content`)
  }
}

function header() {
  return `<a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="site-brand" href="/">pagaia.xyz</a>
      <nav class="site-nav" aria-label="Main">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/manifesto/">Manifesto</a></li>
          <li><a href="/security/" aria-current="page">Security</a></li>
        </ul>
      </nav>
    </header>`
}

function page({ title, description, body }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${esc(description)}" />
    <title>${esc(title)}</title>
    <script type="module" src="/src/security/main.js"></script>
  </head>
  <body>
    ${header()}
    <main id="main" class="sec">
${body}
    </main>
    <footer class="site-footer"><a href="/security/">Security</a> · <a href="/">pagaia.xyz</a></footer>
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
          <p class="sec-meta">${esc(a.cve)} · ${esc(a.vendor)} ${esc(a.product)}${a.score ? ` · CVSS ${esc(a.score)}` : ''}</p>
          <p class="sec-meta">${badges(a)} <span>Updated <time datetime="${day(a.updated)}">${day(a.updated)}</time></span></p>
        </li>`).join('\n')
  return page({
    title: 'Security · pagaia.xyz',
    description: 'Critical vulnerabilities with affected versions, fixes and dated sources, reviewed before publication.',
    body: `      <h1>Security</h1>
      <p class="sec-intro">Critical vulnerabilities, scored above 8 or exploited in the wild, with affected versions, fixes and dated sources. Each note is reviewed before publication and updated when vendors ship fixes.</p>
${filterBar(articles)}
      <p class="sec-empty" data-empty hidden>No notes in this category.</p>
      ${articles.length ? `<ul class="sec-list">\n${items}\n      </ul>` : '<p class="sec-empty">No notes published yet.</p>'}`,
  })
}

function articlePage(a) {
  return page({
    title: `${a.title} · Security · pagaia.xyz`,
    description: plainImpact(a.body_md) || `${a.cve} in ${a.vendor} ${a.product}`,
    body: `      <p class="sec-back"><a href="/security/">← All notes</a></p>
      <article class="sec-article">
        <h1>${esc(a.title)}</h1>
        <p class="sec-meta">${badges(a)}</p>
        ${catKeys(a).length ? `<p class="sec-cats">${catKeys(a).map(k => `<a class="sec-cat" href="/security/#${k}">${esc(CATEGORIES[k])}</a>`).join(' ')}</p>` : ''}
        <dl class="sec-facts">
          <dt>CVE</dt><dd>${esc(a.cve)}</dd>
          <dt>Product</dt><dd>${esc(a.vendor)} ${esc(a.product)}</dd>
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
