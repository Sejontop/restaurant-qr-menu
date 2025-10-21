import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import MenuPage from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Routes>
      {/*/m/table-1 */}
      <Route path="/m/:slug" element={<MenuPage />} />
    </Routes>
  </StrictMode>,
)
