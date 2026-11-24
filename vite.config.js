import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { generateSecurityPages } from './scripts/security-pages.mjs'

// One HTML entry per section, so every route is a real file that survives a direct refresh
// on any static host.
const page = path => fileURLToPath(new URL(path, import.meta.url))
const root = fileURLToPath(new URL('.', import.meta.url))

// Areas are toggled at build time (see src/shared/sections.js). The security
// section is built only when VITE_SECURITY is set; otherwise its pages are not
// generated and any earlier output is removed, so production can hide it.
const securityOn = /^(true|1)$/i.test(process.env.VITE_SECURITY || '')
const security = securityOn
  ? generateSecurityPages(root)
  : (rmSync(fileURLToPath(new URL('./security', import.meta.url)), { recursive: true, force: true }), {})

// The home shows the latest security notes. Their summary (card fields only, no
// article body) is injected at build time, and only when the section is enabled,
// so the hidden section's content never reaches the public home bundle.
function latestNotes() {
  if (!securityOn) return []
  const dir = join(root, 'content', 'security')
  const files = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.json')) : []
  return files
    .map(f => JSON.parse(readFileSync(join(dir, f), 'utf8')))
    .map(a => ({
      slug: a.slug, cve: a.cve, title: a.title, vendor: a.vendor, product: a.product,
      score: a.score ?? null, patch_status: a.patch_status, exploited: !!a.exploited,
      updated: a.updated || a.approved_at || '',
    }))
    .sort((x, y) => String(y.updated).localeCompare(String(x.updated)))
    .slice(0, 2)
}

// The security section's URLs, when it is enabled, for the sitemap.
function securityUrls() {
  if (!securityOn) return []
  const dir = join(root, 'content', 'security')
  const files = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.json')) : []
  const slugs = files.map(f => f.replace(/\.json$/, '')).filter(s => /^cve-\d{4}-\d{4,}$/.test(s))
  return ['/security/', ...slugs.map(s => `/security/${s}/`)]
}

// Writes dist/sitemap.xml after the build, listing only the enabled areas.
function sitemapPlugin() {
  return {
    name: 'pagaia-sitemap',
    closeBundle() {
      const base = 'https://pagaia.xyz'
      const today = new Date().toISOString().slice(0, 10)
      const urls = ['/', '/manifesto/', ...securityUrls()]
      const xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map(u => `  <url><loc>${base}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
        '\n</urlset>\n'
      writeFileSync(join(root, 'dist', 'sitemap.xml'), xml)
    },
  }
}

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  define: {
    __LATEST_NOTES__: JSON.stringify(latestNotes()),
  },
  build: {
    rollupOptions: {
      input: {
        home: page('./index.html'),
        manifesto: page('./manifesto/index.html'),
        ...security,
      },
    },
  },
})
