# pagaia

Public portal for [pagaia.xyz](https://pagaia.xyz), built with React and Vite. It contains the landing page, the Pagaia-Man origin comic, which serves as the manifesto, and the security notes.

## Security notes

The security section is generated at build time by scripts/security-pages.mjs from the JSON files in content/security, one per article. Those files come from the private editorial back office, only for revisions Paolo approved and queued for publication. Each holds the approved Markdown, its rendered HTML and the content digest; the build stops if the content does not match the digest or if the HTML contains anything executable. The generated pages under security/ are plain HTML and are not committed.

## Game

The game section (/game/) holds Pisolini, a daily logic puzzle. Its generator, solver and hint engine live in src/game/pisolini/engine.js, a plain module with no framework or browser dependency. A puzzle id such as `v1-20261125-m` names the generator version and the seed, so a link with `?p=<id>` always reproduces the same puzzle. Progress is kept only in the browser's localStorage. The page is built only when `VITE_GAME` is set (see below). Run the engine tests with:

```bash
npm test
```

## Local development

Use a Node.js version supported by the locked Vite release and npm. Run:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173). Changes reload automatically.

### Enabled areas and full preview

Which areas are public is set at build time (see `src/shared/sections.js`). By default only
the manifesto is shown; the security section is hidden and the game is announced as "soon"
(work in progress). `VITE_SECURITY=true` and `VITE_GAME=true` enable them. To preview the
whole site, security and game included, with the real content in `content/security/`:

```bash
npm run dev:full       # hot-reloading preview with every area enabled
npm run preview:full   # production-like build and preview, every area enabled
```

Both are served from the development VM. To view them from the workstation over the VPN,
forward the port with SSH and open the local address, for example:

```bash
ssh -L 4173:localhost:4173 pagaia-dev-vpn   # then open http://localhost:4173 (preview:full)
ssh -L 5173:localhost:5173 pagaia-dev-vpn   # then open http://localhost:5173 (dev:full)
```

## Production build

Run `npm run build` to generate optimized static files in dist/. Use `npm run preview` for a local preview.

## Deployment

Upload dist/ to the chosen static host when deployment has been requested. Depending on the hosting setup, use Netlify CLI (`netlify deploy --prod --dir dist`), Vercel CLI (`vercel --prod`) or rsync to a web server (`rsync -avz dist/ user@server:/var/www/pagaia.xyz/`).
