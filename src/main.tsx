
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const url = new URL(window.location.href)

if (url.searchParams.has('utm_source')) {
  url.searchParams.delete('utm_source')

  window.history.replaceState(
    window.history.state,
    '',
    url.pathname + url.search + url.hash
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
