export const fmt = (n) =>
  '$' + Math.round(n).toLocaleString('es-AR')

export const fmtDate = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y.slice(2)}`
}

export const today = () => new Date().toISOString().split('T')[0]

export const diffDias = (d) => {
  if (!d) return null
  return Math.round((new Date(d) - new Date()) / (1000 * 60 * 60 * 24))
}

export const filterByPeriod = (arr, campo, period) => {
  const now = new Date()
  return arr.filter(m => {
    const d = new Date(m[campo] + 'T00:00:00')
    if (period === 'semana') {
      const mon = new Date(now)
      mon.setDate(now.getDate() - ((now.getDay() || 7) - 1))
      mon.setHours(0, 0, 0, 0)
      return d >= mon
    }
    if (period === 'mes')
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  })
}

export const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único', '34', '36', '38', '40', '42', '44']

export const CATEGORIAS_ROPA = [
  'Remera', 'Vestido', 'Pantalón', 'Pollera',
  'Campera', 'Blusa', 'Short', 'Accesorio', 'Otro',
]

export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta de crédito' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'cuenta-corriente', label: 'Cuenta corriente' },
]

export const CATEGORIAS_MOV = [
  { value: 'venta-local', label: 'Venta local' },
  { value: 'venta-ig', label: 'Venta Instagram/WhatsApp' },
  { value: 'venta-reventa', label: 'Venta reventa' },
  { value: 'mercaderia', label: 'Compra mercadería' },
  { value: 'sueldo', label: 'Sueldo empleada' },
  { value: 'servicio', label: 'Servicios (luz, internet)' },
  { value: 'otro-ing', label: 'Otro ingreso' },
  { value: 'otro-gas', label: 'Otro gasto' },
]
