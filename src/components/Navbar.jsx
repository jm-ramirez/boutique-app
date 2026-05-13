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
      alignItems: 'center',
      gap: 2,
      overflowX: 'auto',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginRight: 12,
        flexShrink: 0,
        padding: '12px 0',
      }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: '#185FA5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <i className="ti ti-hanger" aria-hidden="true" style={{ color: '#fff', fontSize: 14 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
          La Doncella
        </span>
      </div>

      <div style={{ width: '0.5px', height: 20, background: 'var(--color-border)', marginRight: 10, flexShrink: 0 }} />

      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          style={({ isActive }) => ({
            padding: '5px 10px',
            margin: '7px 1px',
            fontSize: 12.5,
            color: isActive ? '#185FA5' : 'var(--color-text-secondary)',
            background: isActive ? '#EBF3FC' : 'transparent',
            borderRadius: 7,
            whiteSpace: 'nowrap',
            fontWeight: isActive ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'background 0.15s, color 0.15s',
          })}
        >
          <i className={`ti ${l.icon}`} aria-hidden="true" />
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
