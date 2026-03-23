# pagaia-website

Landing page di [pagaia.xyz](https://pagaia.xyz) — React + Vite, tema "under construction".

## Requisiti

- Node.js >= 18
- npm >= 9

## Sviluppo locale

```bash
npm install
npm run dev
```

Il dev server parte su `http://localhost:5173` con hot reload.

## Build per produzione

```bash
npm run build
```

Genera la cartella `dist/` con i file statici ottimizzati, pronti per il deploy.

Per anteprima locale del build:

```bash
npm run preview
```

## Deploy

Carica il contenuto della cartella `dist/` sul tuo hosting statico preferito.

Con Netlify CLI:

```bash
netlify deploy --prod --dir dist
```

Con Vercel CLI:

```bash
vercel --prod
```

Con rsync su un server nginx/Apache:

```bash
rsync -avz dist/ user@server:/var/www/pagaia.xyz/
```
