import React from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',             icon: 'ti-chart-bar',      label: 'Resumen'         },
  { to: '/movimientos',  icon: 'ti-list',            label: 'Ingresos/Gastos' },
  { to: '/cc',           icon: 'ti-users',           label: 'Ctas. corrientes'},
  { to: '/cobros',       icon: 'ti-credit-card',     label: 'Cobros'          },
  { to: '/proveedores',  icon: 'ti-truck',           label: 'Proveedores'     },
  { to: '/stock',        icon: 'ti-shirt',           label: 'Stock'           },
  { to: '/retiro',       icon: 'ti-wallet',          label: 'Retiro'          },
]

export default function Navbar() {
  return (
    <nav style={{
      background: 'var(--color-bg)',
      borderBottom: '0.5px solid var(--color-border)',
      padding: '0 1rem',
      display: 'flex',
      gap: 2,
      overflowX: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 16, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          <i className="ti ti-hanger" aria-hidden="true" style={{ marginRight: 6 }} />
          La doncella
        </span>
      </div>
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          style={({ isActive }) => ({
            padding: '10px 12px',
            fontSize: 13,
            color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
            borderBottom: isActive ? '2px solid #185FA5' : '2px solid transparent',
            whiteSpace: 'nowrap',
            fontWeight: isActive ? 500 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            textDecoration: 'none',
            flexShrink: 0,
          })}
        >
          <i className={`ti ${l.icon}`} aria-hidden="true" />
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
