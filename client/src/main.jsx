import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config'
import { injectSpeedInsights } from '@vercel/speed-insights'

// Inject Vercel Speed Insights
injectSpeedInsights()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)