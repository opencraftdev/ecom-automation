import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const SPLASH_MIN_MS = 700
const bootedAt = performance.now()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade the static splash out once React has painted, but keep it up for a
// minimum so it reads as a deliberate intro instead of a flicker.
const splash = document.getElementById('splash')
if (splash) {
  const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - bootedAt))
  window.setTimeout(() => {
    splash.classList.add('splash--out')
    splash.addEventListener('transitionend', () => splash.remove(), { once: true })
  }, wait)
}
