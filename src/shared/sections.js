// Which site areas are enabled. Toggle at build time with environment variables,
// so production can hide a section while staging previews it:
//   VITE_SECURITY=true npm run build   # show the security section
//   VITE_GAME=true npm run build       # build and link the game (/game/)
// Default: only the manifesto is public; security is hidden (work in progress),
// and the game is announced as "soon".
// Accept the same values as vite.config.js and tools/release/publish.sh: true | 1
// (case-insensitive). Anything else means off.
const on = v => /^(true|1)$/i.test(String(v ?? ''))

export const SECTIONS = {
  manifesto: true,
  security: on(import.meta.env.VITE_SECURITY),
  game: on(import.meta.env.VITE_GAME),
}
