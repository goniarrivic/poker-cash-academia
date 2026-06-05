import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../grinders-manual.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
