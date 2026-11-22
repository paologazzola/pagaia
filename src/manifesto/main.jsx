import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/bangers/latin-400.css'
import '@fontsource/comic-neue/latin-700.css'
import '../shared/base.css'
import ManifestoPage from './ManifestoPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ManifestoPage />
  </StrictMode>,
)
