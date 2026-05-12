# Boutique — Sistema de gestión

Sistema de gestión completo para boutique de ropa. Desarrollado con React + Vite.

## Funcionalidades

- **Resumen** — panel general con alertas automáticas y diagnóstico del negocio
- **Ingresos/Gastos** — registro de movimientos con forma de pago (efectivo, transferencia, tarjeta, cheque, cuenta corriente)
- **Cuentas corrientes** — ficha por cliente con historial, saldos y fechas de vencimiento
- **Cobros** — cheques a cobrar y pagos con tarjeta pendientes de acreditación
- **Proveedores** — deudas por compra de mercadería con vencimientos y formas de pago
- **Stock** — inventario por prenda, talle y color con proveedor de origen y márgenes
- **Retiro** — análisis profundo con 5 condiciones para determinar si se puede retirar dinero

## Instalación

```bash
npm install
npm run dev
```

## Tecnologías

- React 18
- React Router v6
- Vite
- localStorage para persistencia de datos

## Estructura del proyecto

```
src/
  components/
    Navbar.jsx       # Barra de navegación
    UI.jsx           # Componentes reutilizables (Card, Badge, Btn, etc.)
  context/
    DataContext.jsx  # Estado global con persistencia en localStorage
  pages/
    Resumen.jsx
    Movimientos.jsx
    CuentasCorrientes.jsx
    FinanzasPages.jsx  # Cobros, Proveedores, Retiro
    Stock.jsx
  utils/
    helpers.js       # Funciones utilitarias y constantes
  App.jsx
  main.jsx
  index.css
```
