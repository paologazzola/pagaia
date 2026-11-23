# pagaia

Public portal for [pagaia.xyz](https://pagaia.xyz), built with React and Vite. It contains the landing page, the Pagaia-Man origin comic, which serves as the manifesto, and the security notes.

## Security notes

The security section is generated at build time by scripts/security-pages.mjs from the JSON files in content/security, one per article. Those files come from the private editorial back office, only for revisions Paolo approved and queued for publication. Each holds the approved Markdown, its rendered HTML and the content digest; the build stops if the content does not match the digest or if the HTML contains anything executable. The generated pages under security/ are plain HTML and are not committed.

## Local development

Use a Node.js version supported by the locked Vite release and npm. Run:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173). Changes reload automatically.

## Production build

Run `npm run build` to generate optimized static files in dist/. Use `npm run preview` for a local preview.

## Deployment

Upload dist/ to the chosen static host when deployment has been requested. Depending on the hosting setup, use Netlify CLI (`netlify deploy --prod --dir dist`), Vercel CLI (`vercel --prod`) or rsync to a web server (`rsync -avz dist/ user@server:/var/www/pagaia.xyz/`).
