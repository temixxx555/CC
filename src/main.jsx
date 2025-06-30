import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'



ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> 
    <BrowserRouter>
    <ScrollToTop />
    {/* ScrollToTop component to reset scroll position on route change */}
    <App />
    </BrowserRouter>
  // {/* </React.StrictMode>, */}
)