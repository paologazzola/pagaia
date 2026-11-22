import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/jetbrains-mono/latin-300.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '../shared/base.css'
import Home from './Home.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
