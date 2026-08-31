import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/common/Toast.jsx'
import './i18next.js'
import { HospitalProvider } from './components/context/HospitalContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HospitalProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HospitalProvider>
  </StrictMode>,
)
