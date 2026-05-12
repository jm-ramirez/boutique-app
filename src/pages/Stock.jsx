import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { fmt, fmtDate, today, TALLES, CATEGORIAS_ROPA } from '../utils/helpers'
import { Card, CardTitle, Metric, Btn, FormRow, FormGroup, Badge, Grid, TableWrapper, Th, Td, Empty, Sep } from '../components/UI'

function ColorDot({ hex, size = 12 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: hex || '#888', display: 'inline-block', border: '0.5px solid var(--color-border-md)', flexShrink: 0 }} />
}

function Tag({ children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-secondary)', margin: 2 }}>{children}</span>
}

export default function Stock() {
  const { data, addProducto, removeProducto, updateVariante, addMovStock } = useData()
  const [view, setView] = useState('lista') // lista | nuevo | movimiento | resumen
  const [buscar, setBuscar] = useState('')
  const [filtCat, setFiltCat] = useState('')
  const [filtProv, setFiltProv] = useState('')
  const [filtEstado, setFiltEstado] = useState('')

  // Nuevo producto state
  const [npForm, setNpForm] = useState({ nombre: '', cat: 'Remera', proveedor: '', costo: '', venta: '' })
  const [tallesSel, setTallesSel] = useState([])
  const [coloresSel, setColoresSel] = useState([])
  const [colorInput, setColorInput] = useState('')
  const [colorHex, setColorHex] = useState('#185FA5')
  const [variantes, setVariantes] = useState({})

  // Movimiento state
  const [msForm, setMsForm] = useState({ prodId: '', tipo: 'venta', talle: '', color: '', cantidad: 1, fecha: today(), nota: '' })
  const setMs = (k, v) => setMsForm(f => ({ ...f, [k]: v }))

  const setNp = (k, v) => setNpForm(f => ({ ...f, [k]: v }))

  const toggleTalle = (t) => {
    setTallesSel(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const addColor = () => {
    if (!colorInput.trim()) return
    if (coloresSel.find(c => c.nombre.toLowerCase() === colorInput.toLowerCase())) return
    setColoresSel(prev => [...prev, { nombre: colorInput, hex: colorHex }])
    setColorInput('')
  }
  const removeColor = (nombre) => setColoresSel(prev => prev.filter(c => c.nombre !== nombre))

  const setVariante = (talle, color, val) => {
    setVariantes(prev => ({ ...prev, [`${talle}||${color}`]: +val || 0 }))
  }

  const margen = npForm.costo && npForm.venta
    ? Math.round((+npForm.venta - +npForm.costo) / +npForm.venta * 100) : null

  const guardarProducto = async () => {
    if (!npForm.nombre.trim()) return alert('Ingresá el nombre')
    if (!tallesSel.length || !coloresSel.length) return alert('Seleccioná al menos un talle y un color')
    const vars = []
    tallesSel.forEach(t => coloresSel.forEach(c => {
      vars.push({ talle: t, color: c.nombre, hex: c.hex, cantidad: variantes[`${t}||${c.nombre}`] || 0 })
    }))
    const nuevo = { ...npForm, costo: +npForm.costo || 0, venta: +npForm.venta || 0, variantes: vars, id: 'p' + Date.now(), creado: today() }
    await addProducto(nuevo)
    setNpForm({ nombre: '', cat: 'Remera', proveedor: '', costo: '', venta: '' })
    setTallesSel([]); setColoresSel([]); setVariantes({})
    alert('Producto guardado.')
    setView('lista')
  }

  const borrarProducto = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await removeProducto(id)
  }

  const registrarMov = async () => {
    const prod = data.productos.find(p => p.id === msForm.prodId)
    if (!prod) return alert('Seleccioná un producto')
    if (!msForm.talle || !msForm.color) return alert('Seleccioná talle y color')
    if (!msForm.cantidad || +msForm.cantidad <= 0) return alert('Cantidad inválida')
    const varIdx = prod.variantes.findIndex(v => v.talle === msForm.talle && v.color === msForm.color)
    if (varIdx < 0) return alert('Variante no encontrada')
    const qty = +msForm.cantidad
    const newVariantes = [...prod.variantes]
    if (msForm.tipo === 'venta' || msForm.tipo === 'ajuste') {
      if (newVariantes[varIdx].cantidad < qty) return alert(`Stock insuficiente. Hay ${newVariantes[varIdx].cantidad} unidades.`)
      newVariantes[varIdx] = { ...newVariantes[varIdx], cantidad: newVariantes[varIdx].cantidad - qty }
    } else {
      newVariantes[varIdx] = { ...newVariantes[varIdx], cantidad: newVariantes[varIdx].cantidad + qty }
    }
    await updateVariante(msForm.prodId, prod.variantes[varIdx].id, newVariantes[varIdx].cantidad)
    const hex = prod.variantes[varIdx].hex
    const payload = { ...msForm, hex, id: 'm' + Date.now(), cantidad: qty, prod_id: msForm.prodId }
    if (!payload.fecha) payload.fecha = null
    await addMovStock(payload)
    setMsForm(f => ({ ...f, cantidad: 1, nota: '' }))
    alert('Movimiento registrado.')
  }

  const proveedores = [...new Set(data.productos.map(p => p.proveedor).filter(Boolean))]
  let prods = data.productos.filter(p => {
    const total = p.variantes.reduce((s, v) => s + v.cantidad, 0)
    if (buscar && !p.nombre.toLowerCase().includes(buscar.toLowerCase())) return false
    if (filtCat && p.cat !== filtCat) return false
    if (filtProv && p.proveedor !== filtProv) return false
    if (filtEstado === 'ok' && total === 0) return false
    if (filtEstado === 'out' && total > 0) return false
    return true
  })

  const prodActual = data.productos.find(p => p.id === msForm.prodId)
  const tallesDisp  = prodActual ? [...new Set(prodActual.variantes.map(v => v.talle))] : []
  const coloresDisp = prodActual ? [...new Set(prodActual.variantes.map(v => v.color))] : []

  // Resumen stats
  const totalUnid = data.productos.reduce((s, p) => s + p.variantes.reduce((ss, v) => ss + v.cantidad, 0), 0)
  const totalCosto = data.productos.reduce((s, p) => s + p.variantes.reduce((ss, v) => ss + v.cantidad * p.costo, 0), 0)
  const totalVenta = data.productos.reduce((s, p) => s + p.variantes.reduce((ss, v) => ss + v.cantidad * p.venta, 0), 0)
  const sinStock = data.productos.filter(p => p.variantes.reduce((s, v) => s + v.cantidad, 0) === 0)

  const navBtns = [
    { id: 'lista', label: 'Stock', icon: 'ti-shirt' },
    { id: 'nuevo', label: 'Nuevo producto', icon: 'ti-plus' },
    { id: 'movimiento', label: 'Movimientos', icon: 'ti-arrows-exchange' },
    { id: 'resumen', label: 'Resumen', icon: 'ti-chart-bar' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '0.5px solid var(--color-border)', overflowX: 'auto' }}>
        {navBtns.map(b => (
          <button key={b.id} onClick={() => setView(b.id)} style={{ padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', color: view === b.id ? 'var(--color-text)' : 'var(--color-text-secondary)', borderBottom: view === b.id ? '2px solid #185FA5' : '2px solid transparent', marginBottom: -1, fontWeight: view === b.id ? 500 : 400, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className={`ti ${b.icon}`} aria-hidden="true" />{b.label}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {view === 'lista' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input type="text" value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="Buscar..." style={{ maxWidth: 180, fontSize: 12 }} />
            <select value={filtCat} onChange={e => setFiltCat(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
              <option value="">Todas las categorías</option>
              {CATEGORIAS_ROPA.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filtProv} onChange={e => setFiltProv(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
              <option value="">Todos los proveedores</option>
              {proveedores.map(p => <option key={p}>{p}</option>)}
            </select>
            <select value={filtEstado} onChange={e => setFiltEstado(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
              <option value="">Todos</option>
              <option value="ok">Con stock</option>
              <option value="out">Sin stock</option>
            </select>
          </div>
          {prods.length ? prods.map(p => {
            const total = p.variantes.reduce((s, v) => s + v.cantidad, 0)
            const talles  = [...new Set(p.variantes.map(v => v.talle))]
            const colores = [...new Set(p.variantes.map(v => v.color))]
            const hexMap  = {}; p.variantes.forEach(v => hexMap[v.color] = v.hex)
            const mg = p.costo && p.venta ? Math.round((p.venta - p.costo) / p.venta * 100) : null
            return (
              <div key={p.id} style={{ border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: 10, background: 'var(--color-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{p.nombre}</div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <Badge type="cat">{p.cat}</Badge>
                      {p.proveedor && <Badge type="prov">{p.proveedor}</Badge>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 500, fontSize: 16, color: total === 0 ? '#A32D2D' : total < 3 ? '#BA7517' : '#0F6E56' }}>{total} unid.</div>
                    {p.venta > 0 && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Venta: {fmt(p.venta)}</div>}
                    {mg !== null && <div style={{ fontSize: 11, color: mg >= 50 ? '#0F6E56' : mg >= 30 ? '#BA7517' : '#A32D2D' }}>Margen: {mg}%</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                  <span>Talles: {talles.map(t => <Tag key={t}>{t}</Tag>)}</span>
                  <span>Colores: {colores.map(c => <Tag key={c}><ColorDot hex={hexMap[c]} />{c}</Tag>)}</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: 12, minWidth: 100 + colores.length * 80 }}>
                    <thead><tr>
                      <th style={{ padding: '4px 8px', textAlign: 'left', fontSize: 10, color: 'var(--color-text-secondary)', borderBottom: '0.5px solid var(--color-border)' }}>Talle</th>
                      {colores.map(c => <th key={c} style={{ padding: '4px 8px', fontSize: 10, color: 'var(--color-text-secondary)', borderBottom: '0.5px solid var(--color-border)' }}><ColorDot hex={hexMap[c]} /> {c}</th>)}
                      <th style={{ padding: '4px 8px', textAlign: 'right', fontSize: 10, color: 'var(--color-text-secondary)', borderBottom: '0.5px solid var(--color-border)' }}>Total</th>
                    </tr></thead>
                    <tbody>{talles.map(t => {
                      const rowTotal = p.variantes.filter(v => v.talle === t).reduce((s, v) => s + v.cantidad, 0)
                      return (
                        <tr key={t}>
                          <td style={{ padding: '5px 8px', fontWeight: 500, borderBottom: '0.5px solid var(--color-border)' }}>{t}</td>
                          {colores.map(c => {
                            const v = p.variantes.find(vv => vv.talle === t && vv.color === c)
                            const q = v ? v.cantidad : 0
                            return <td key={c} style={{ padding: '5px 8px', textAlign: 'center', borderBottom: '0.5px solid var(--color-border)', color: q === 0 ? '#A32D2D' : q < 3 ? '#BA7517' : 'var(--color-text)', fontWeight: 500 }}>{q}</td>
                          })}
                          <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 500, borderBottom: '0.5px solid var(--color-border)' }}>{rowTotal}</td>
                        </tr>
                      )
                    })}</tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <Btn size="sm" variant="success" onClick={() => { setMsForm(f => ({ ...f, prodId: p.id, tipo: 'venta', talle: '', color: '' })); setView('movimiento') }}>
                    <i className="ti ti-minus" aria-hidden="true" /> Registrar venta
                  </Btn>
                  <Btn size="sm" variant="default" onClick={() => { setMsForm(f => ({ ...f, prodId: p.id, tipo: 'ingreso-stock', talle: '', color: '' })); setView('movimiento') }}>
                    <i className="ti ti-plus" aria-hidden="true" /> Sumar stock
                  </Btn>
                  <Btn size="sm" variant="danger" onClick={() => borrarProducto(p.id)}>
                    <i className="ti ti-trash" aria-hidden="true" />
                  </Btn>
                </div>
              </div>
            )
          }) : <Card><Empty>{data.productos.length ? 'No hay productos que coincidan con el filtro.' : 'Sin productos. Agregá el primero.'}</Empty></Card>}
        </>
      )}

      {/* NUEVO PRODUCTO */}
      {view === 'nuevo' && (
        <Card>
          <CardTitle>Agregar nuevo producto</CardTitle>
          <FormRow>
            <FormGroup label="Nombre del producto">
              <input type="text" value={npForm.nombre} onChange={e => setNp('nombre', e.target.value)} placeholder="Ej: Remera básica manga corta" />
            </FormGroup>
            <FormGroup label="Categoría" style={{ maxWidth: 140 }}>
              <select value={npForm.cat} onChange={e => setNp('cat', e.target.value)}>
                {CATEGORIAS_ROPA.map(c => <option key={c}>{c}</option>)}
              </select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Proveedor">
              <input type="text" value={npForm.proveedor} onChange={e => setNp('proveedor', e.target.value)} placeholder="Ej: Distribuidora Rosario" list="provs" />
              <datalist id="provs">{proveedores.map(p => <option key={p} value={p} />)}</datalist>
            </FormGroup>
            <FormGroup label="Precio de costo ($)" style={{ maxWidth: 150 }}>
              <input type="number" value={npForm.costo} onChange={e => setNp('costo', e.target.value)} placeholder="0" min="0" />
            </FormGroup>
            <FormGroup label="Precio de venta ($)" style={{ maxWidth: 150 }}>
              <input type="number" value={npForm.venta} onChange={e => setNp('venta', e.target.value)} placeholder="0" min="0" />
            </FormGroup>
          </FormRow>
          {margen !== null && (
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
              Margen: <strong style={{ color: margen >= 50 ? '#0F6E56' : margen >= 30 ? '#BA7517' : '#A32D2D' }}>{margen}%</strong>
              {' '} — ganás <strong style={{ color: margen >= 50 ? '#0F6E56' : margen >= 30 ? '#BA7517' : '#A32D2D' }}>{fmt(+npForm.venta - +npForm.costo)}</strong> por unidad
            </div>
          )}
          <Sep />
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Talles disponibles</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {TALLES.map(t => (
              <button key={t} onClick={() => toggleTalle(t)} style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '0.5px solid var(--color-border-md)', cursor: 'pointer', background: tallesSel.includes(t) ? '#185FA5' : 'var(--color-bg)', color: tallesSel.includes(t) ? '#fff' : 'var(--color-text)' }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Colores</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <input type="text" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} placeholder="Ej: Azul marino" style={{ maxWidth: 160 }} />
            <input type="color" value={colorHex} onChange={e => setColorHex(e.target.value)} style={{ width: 34, height: 34, padding: 2, borderRadius: 6, cursor: 'pointer', border: '0.5px solid var(--color-border-md)' }} />
            <Btn size="sm" onClick={addColor}><i className="ti ti-plus" aria-hidden="true" /> Agregar</Btn>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 16 }}>
            {coloresSel.map(c => (
              <span key={c.nombre} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border)', fontSize: 11, margin: 2 }}>
                <ColorDot hex={c.hex} /> {c.nombre}
                <span onClick={() => removeColor(c.nombre)} style={{ cursor: 'pointer', color: 'var(--color-text-tertiary)', marginLeft: 2 }}>×</span>
              </span>
            ))}
          </div>
          {tallesSel.length > 0 && coloresSel.length > 0 && (
            <>
              <Sep />
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 10 }}>Cantidad por variante</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
                  <thead><tr>
                    <th style={{ padding: '4px 8px', fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'left', borderBottom: '0.5px solid var(--color-border)' }}>Talle</th>
                    {coloresSel.map(c => <th key={c.nombre} style={{ padding: '4px 8px', fontSize: 10, color: 'var(--color-text-secondary)', borderBottom: '0.5px solid var(--color-border)' }}><ColorDot hex={c.hex} /> {c.nombre}</th>)}
                  </tr></thead>
                  <tbody>{tallesSel.map(t => (
                    <tr key={t}>
                      <td style={{ padding: '5px 8px', fontWeight: 500, borderBottom: '0.5px solid var(--color-border)' }}>{t}</td>
                      {coloresSel.map(c => (
                        <td key={c.nombre} style={{ padding: '4px 8px', borderBottom: '0.5px solid var(--color-border)' }}>
                          <input type="number" min="0" value={variantes[`${t}||${c.nombre}`] || 0} onChange={e => setVariante(t, c.nombre, e.target.value)} style={{ width: 60, textAlign: 'center', padding: '4px 6px', fontSize: 12 }} />
                        </td>
                      ))}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}
          <Btn variant="primary" onClick={guardarProducto}><i className="ti ti-device-floppy" aria-hidden="true" /> Guardar producto</Btn>
        </Card>
      )}

      {/* MOVIMIENTOS */}
      {view === 'movimiento' && (
        <>
          <Card>
            <CardTitle>Registrar movimiento de stock</CardTitle>
            <FormRow>
              <FormGroup label="Producto">
                <select value={msForm.prodId} onChange={e => setMs('prodId', e.target.value)}>
                  <option value="">Seleccioná un producto</option>
                  {data.productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Tipo" style={{ maxWidth: 140 }}>
                <select value={msForm.tipo} onChange={e => setMs('tipo', e.target.value)}>
                  <option value="venta">Venta</option>
                  <option value="ingreso-stock">Ingreso stock</option>
                  <option value="devolucion">Devolución</option>
                  <option value="ajuste">Ajuste manual</option>
                </select>
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup label="Talle" style={{ maxWidth: 130 }}>
                <select value={msForm.talle} onChange={e => setMs('talle', e.target.value)}>
                  <option value="">—</option>
                  {tallesDisp.map(t => <option key={t}>{t}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Color" style={{ maxWidth: 130 }}>
                <select value={msForm.color} onChange={e => setMs('color', e.target.value)}>
                  <option value="">—</option>
                  {coloresDisp.map(c => <option key={c}>{c}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Cantidad" style={{ maxWidth: 90 }}>
                <input type="number" value={msForm.cantidad} min="1" onChange={e => setMs('cantidad', e.target.value)} />
              </FormGroup>
              <FormGroup label="Fecha" style={{ maxWidth: 135 }}>
                <input type="date" value={msForm.fecha} onChange={e => setMs('fecha', e.target.value)} />
              </FormGroup>
            </FormRow>
            <FormGroup label="Nota (opcional)" style={{ marginBottom: 12 }}>
              <input type="text" value={msForm.nota} onChange={e => setMs('nota', e.target.value)} placeholder="Ej: Venta a María / Devolución por talle" />
            </FormGroup>
            <Btn variant="primary" onClick={registrarMov}><i className="ti ti-check" aria-hidden="true" /> Registrar</Btn>
          </Card>

          <Card style={{ padding: 0, overflow: 'auto' }}>
            <TableWrapper>
              <thead><tr>
                <Th style={{ width: 80 }}>Fecha</Th>
                <Th style={{ width: 85 }}>Tipo</Th>
                <Th>Producto</Th>
                <Th style={{ width: 55 }}>Talle</Th>
                <Th style={{ width: 90 }}>Color</Th>
                <Th style={{ width: 55, textAlign: 'right' }}>Cant.</Th>
                <Th>Nota</Th>
              </tr></thead>
              <tbody>
                {[...data.movStock].sort((a, b) => b.fecha.localeCompare(a.fecha)).map(m => {
                  const prod = data.productos.find(p => p.id === m.prod_id)
                  const tipoLabel = { venta: 'Venta', 'ingreso-stock': 'Ingreso', devolucion: 'Devolución', ajuste: 'Ajuste' }
                  return (
                    <tr key={m.id}>
                      <Td>{fmtDate(m.fecha)}</Td>
                      <Td><Badge type={m.tipo === 'venta' ? 'gasto' : 'ingreso'}>{tipoLabel[m.tipo] || m.tipo}</Badge></Td>
                      <Td>{prod ? prod.nombre : '(eliminado)'}</Td>
                      <Td style={{ textAlign: 'center' }}>{m.talle || '—'}</Td>
                      <Td><ColorDot hex={m.hex} /> {m.color || '—'}</Td>
                      <Td style={{ textAlign: 'right', fontWeight: 500, color: m.tipo === 'venta' ? '#A32D2D' : '#0F6E56' }}>
                        {m.tipo === 'venta' ? '-' : '+'}{m.cantidad}
                      </Td>
                      <Td style={{ color: 'var(--color-text-secondary)' }}>{m.nota || '—'}</Td>
                    </tr>
                  )
                })}
                {!data.movStock.length && <tr><td colSpan={7}><Empty>Sin movimientos registrados</Empty></td></tr>}
              </tbody>
            </TableWrapper>
          </Card>
        </>
      )}

      {/* RESUMEN */}
      {view === 'resumen' && (
        <>
          <Grid cols={4} style={{ gap: 8 }}>
            <Metric label="Total productos" value={data.productos.length} />
            <Metric label="Unidades en stock" value={totalUnid} />
            <Metric label="Valor a costo" value={fmt(totalCosto)} />
            <Metric label="Valor a precio venta" value={fmt(totalVenta)} color="#0F6E56" />
          </Grid>
          <Grid cols={2}>
            <Card>
              <CardTitle>Valor por categoría</CardTitle>
              {(() => {
                const cats = {}
                data.productos.forEach(p => {
                  if (!cats[p.cat]) cats[p.cat] = { unid: 0, valor: 0 }
                  p.variantes.forEach(v => { cats[p.cat].unid += v.cantidad; cats[p.cat].valor += v.cantidad * p.venta })
                })
                const maxVal = Math.max(...Object.values(cats).map(c => c.valor), 1)
                return Object.entries(cats).sort((a, b) => b[1].valor - a[1].valor).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span>{k} <span style={{ color: 'var(--color-text-tertiary)' }}>({v.unid} u.)</span></span>
                      <span style={{ fontWeight: 500 }}>{fmt(v.valor)}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.round(v.valor / maxVal * 100)}%`, background: '#185FA5', borderRadius: 3 }} />
                    </div>
                  </div>
                ))
              })()}
            </Card>
            <Card>
              <CardTitle>Top productos por unidades</CardTitle>
              {[...data.productos].sort((a, b) => b.variantes.reduce((s, v) => s + v.cantidad, 0) - a.variantes.reduce((s, v) => s + v.cantidad, 0)).slice(0, 6).map(p => {
                const u = p.variantes.reduce((s, v) => s + v.cantidad, 0)
                return (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid var(--color-border)', fontSize: 12 }}>
                    <span>{p.nombre}</span>
                    <Badge type={u === 0 ? 'vencido' : u < 5 ? 'pendiente' : 'pagado'}>{u} u.</Badge>
                  </div>
                )
              })}
              {!data.productos.length && <Empty>Sin productos</Empty>}
            </Card>
          </Grid>
          <Card>
            <CardTitle>Productos sin stock</CardTitle>
            {sinStock.length ? sinStock.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid var(--color-border)', fontSize: 12 }}>
                <span>{p.nombre} <Badge type="cat">{p.cat}</Badge></span>
                <span style={{ color: 'var(--color-text-tertiary)' }}>{p.proveedor || '—'}</span>
              </div>
            )) : <div style={{ fontSize: 12, color: '#0F6E56', padding: '8px 0' }}>Todos los productos tienen stock disponible.</div>}
          </Card>
        </>
      )}
    </div>
  )
}
