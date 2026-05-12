import React from 'react'

const s = {
  card: {
    background: 'var(--color-bg)',
    border: '0.5px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.25rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '.4px',
    marginBottom: 12,
  },
  metric: {
    background: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-md)',
    padding: 12,
  },
  metricLabel: { fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 3 },
  metricValue: { fontSize: 20, fontWeight: 500 },
  metricSub: { fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 },
  alert: { padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 10, lineHeight: 1.5 },
  badge: { display: 'inline-block', padding: '2px 7px', borderRadius: 6, fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap' },
  btn: {
    padding: '7px 14px',
    border: '0.5px solid var(--color-border-md)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  btnPrimary: { background: '#185FA5', color: '#fff', borderColor: '#185FA5' },
  btnDanger: { background: 'none', color: '#A32D2D', borderColor: '#F09595' },
  btnSuccess: { background: 'none', color: '#0F6E56', borderColor: '#5DCAA5' },
}

export const Card = ({ children, style }) => (
  <div style={{ ...s.card, ...style }}>{children}</div>
)

export const CardTitle = ({ children }) => (
  <div style={s.cardTitle}>{children}</div>
)

export const Metric = ({ label, value, sub, color }) => (
  <div style={s.metric}>
    <div style={s.metricLabel}>{label}</div>
    <div style={{ ...s.metricValue, color: color || 'var(--color-text)' }}>{value}</div>
    {sub && <div style={s.metricSub}>{sub}</div>}
  </div>
)

export const Alert = ({ type = 'info', children }) => {
  const colors = {
    success: { bg: 'var(--color-success-bg)', color: '#085041', border: '#5DCAA5' },
    warning: { bg: 'var(--color-warning-bg)', color: '#633806', border: '#FAC775' },
    danger:  { bg: 'var(--color-danger-bg)',  color: '#791F1F', border: '#F09595' },
    info:    { bg: 'var(--color-info-bg)',    color: '#0C447C', border: '#85B7EB' },
  }
  const c = colors[type] || colors.info
  return (
    <div style={{ ...s.alert, background: c.bg, color: c.color, border: `0.5px solid ${c.border}` }}>
      {children}
    </div>
  )
}

export const Badge = ({ children, type = 'default' }) => {
  const colors = {
    ingreso:      { bg: '#E1F5EE', color: '#085041' },
    gasto:        { bg: '#FCEBEB', color: '#791F1F' },
    efectivo:     { bg: '#E6F1FB', color: '#0C447C' },
    transferencia:{ bg: '#EAF3DE', color: '#27500A' },
    tarjeta:      { bg: '#EEEDFE', color: '#3C3489' },
    cheque:       { bg: '#FAEEDA', color: '#633806' },
    cc:           { bg: '#FBEAF0', color: '#72243E' },
    pendiente:    { bg: '#FAEEDA', color: '#633806' },
    pagado:       { bg: '#E1F5EE', color: '#085041' },
    vencido:      { bg: '#FCEBEB', color: '#791F1F' },
    cat:          { bg: '#E6F1FB', color: '#0C447C' },
    prov:         { bg: '#EEEDFE', color: '#3C3489' },
    default:      { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' },
  }
  const c = colors[type] || colors.default
  return (
    <span style={{ ...s.badge, background: c.bg, color: c.color }}>
      {children}
    </span>
  )
}

export const Btn = ({ children, variant = 'default', size = 'md', onClick, style, type = 'button' }) => {
  const variants = {
    default: {},
    primary: s.btnPrimary,
    danger:  s.btnDanger,
    success: s.btnSuccess,
  }
  const sizes = {
    sm: { padding: '3px 8px', fontSize: 11, borderRadius: 6 },
    md: {},
  }
  return (
    <button
      type={type}
      onClick={onClick}
      style={{ ...s.btn, ...variants[variant], ...sizes[size], ...style }}
    >
      {children}
    </button>
  )
}

export const FormRow = ({ children, style }) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8, flexWrap: 'wrap', ...style }}>
    {children}
  </div>
)

export const FormGroup = ({ label, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0, ...style }}>
    {label && <label style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</label>}
    {children}
  </div>
)

export const Empty = ({ children }) => (
  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
    {children}
  </div>
)

export const Sep = () => (
  <div style={{ height: '0.5px', background: 'var(--color-border)', margin: '12px 0' }} />
)

export const Grid = ({ cols = 2, children, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 10, marginBottom: '1rem', ...style }}>
    {children}
  </div>
)

export const TableWrapper = ({ children }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
      {children}
    </table>
  </div>
)

export const Th = ({ children, style }) => (
  <th style={{ textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)', padding: '6px 8px', borderBottom: '0.5px solid var(--color-border)', whiteSpace: 'nowrap', ...style }}>
    {children}
  </th>
)

export const Td = ({ children, style }) => (
  <td style={{ padding: '7px 8px', borderBottom: '0.5px solid var(--color-border)', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle', ...style }}>
    {children}
  </td>
)
