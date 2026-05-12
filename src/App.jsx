import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Navbar from './components/Navbar'
import Resumen from './pages/Resumen'
import Movimientos from './pages/Movimientos'
import CuentasCorrientes from './pages/CuentasCorrientes'
import { Cobros, Proveedores, Retiro } from './pages/FinanzasPages'
import Stock from './pages/Stock'

const layout = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}

const main = {
  flex: 1,
  maxWidth: 720,
  width: '100%',
  margin: '0 auto',
  padding: '1.5rem 1rem 3rem',
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <div style={layout}>
          <Navbar />
          <main style={main}>
            <Routes>
              <Route path="/"             element={<Resumen />} />
              <Route path="/movimientos"  element={<Movimientos />} />
              <Route path="/cc"           element={<CuentasCorrientes />} />
              <Route path="/cobros"       element={<Cobros />} />
              <Route path="/proveedores"  element={<Proveedores />} />
              <Route path="/stock"        element={<Stock />} />
              <Route path="/retiro"       element={<Retiro />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </DataProvider>
  )
}
