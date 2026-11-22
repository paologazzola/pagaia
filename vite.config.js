import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One HTML entry per section, so every route is a real file that survives a direct refresh
// on any static host.
const page = path => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: page('./index.html'),
        manifesto: page('./manifesto/index.html'),
      },
    },
  },
})
