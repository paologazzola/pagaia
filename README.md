# pagaia

Public portal for [pagaia.xyz](https://pagaia.xyz), built with React and Vite. It currently contains the landing page and the Pagaia-Man origin comic, which becomes the manifesto.

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
