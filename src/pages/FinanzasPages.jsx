import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { fmt, fmtDate, today, diffDias, METODOS_PAGO } from '../utils/helpers'
import { Card, CardTitle, Metric, Btn, FormRow, FormGroup, Badge, Grid, TableWrapper, Th, Td, Empty } from '../components/UI'

export function Cobros() {
  const { data, addCheque, addTarjeta, marcarChequeCobrado, marcarTarjetaAcreditada } = useData()
  const [chForm, setChForm] = useState({ de: '', monto: '', num: '', banco: '', fecha: today(), description: '' })
  const [tcForm, setTcForm] = useState({ description: '', monto: '', tipo: 'Visa', fecha: today() })

  const setCh = (k, v) => setChForm(f => ({ ...f, [k]: v }))
  const setTc = (k, v) => setTcForm(f => ({ ...f, [k]: v }))

  const anadirCheque = async () => {
    if (!chForm.monto) return alert('Ingresá el monto')
    const payload = { ...chForm, monto: +chForm.monto, cobrado: false }
    if (!payload.fecha) payload.fecha = null
    await addCheque(payload)
    setChForm({ de: '', monto: '', num: '', banco: '', fecha: today(), description: '' })
  }
  const anadirTC = async () => {
    if (!tcForm.monto) return alert('Ingresá el monto')
    const payload = { ...tcForm, monto: +tcForm.monto, acreditado: false }
    if (!payload.fecha) payload.fecha = null
    await addTarjeta(payload)
    setTcForm({ description: '', monto: '', tipo: 'Visa', fecha: today() })
  }

  const pendChq = data.cheques.filter(c => !c.cobrado)
  const pendTC  = data.tarjetas.filter(t => !t.acreditado)
  const totalPend = pendChq.reduce((s, c) => s + c.monto, 0) + pendTC.reduce((s, t) => s + t.monto, 0)

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: '0.5rem' }}>Cobros pendientes</h1>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Al marcar un cheque como cobrado o una tarjeta como acreditada, se registra automáticamente el ingreso en Ingresos/Gastos.
      </div>

      <Card>
        <CardTitle>Registrar cheque a cobrar</CardTitle>
        <FormRow>
          <FormGroup label="De quién"><input type="text" value={chForm.de} onChange={e => setCh('de', e.target.value)} placeholder="Cliente o nombre" /></FormGroup>
          <FormGroup label="Monto ($)" style={{ maxWidth: 120 }}><input type="number" value={chForm.monto} onChange={e => setCh('monto', e.target.value)} /></FormGroup>
          <FormGroup label="N° cheque" style={{ maxWidth: 120 }}><input type="text" value={chForm.num} onChange={e => setCh('num', e.target.value)} /></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Banco"><input type="text" value={chForm.banco} onChange={e => setCh('banco', e.target.value)} placeholder="Banco Nación" /></FormGroup>
          <FormGroup label="Fecha de acreditación" style={{ maxWidth: 160 }}><input type="date" value={chForm.fecha} onChange={e => setCh('fecha', e.target.value)} /></FormGroup>
          <FormGroup label="Descripción"><input type="text" value={chForm.description} onChange={e => setCh('description', e.target.value)} /></FormGroup>
        </FormRow>
        <Btn variant="primary" onClick={anadirCheque}><i className="ti ti-plus" aria-hidden="true" /> Registrar cheque</Btn>
      </Card>

      <Card>
        <CardTitle>Registrar pago con tarjeta de crédito</CardTitle>
        <FormRow>
          <FormGroup label="Concepto"><input type="text" value={tcForm.description} onChange={e => setTc('description', e.target.value)} placeholder="Ej: Venta remeras x3" /></FormGroup>
          <FormGroup label="Monto ($)" style={{ maxWidth: 120 }}><input type="number" value={tcForm.monto} onChange={e => setTc('monto', e.target.value)} /></FormGroup>
          <FormGroup label="Tarjeta" style={{ maxWidth: 120 }}>
            <select value={tcForm.tipo} onChange={e => setTc('tipo', e.target.value)}>
              {['Visa','Mastercard','Naranja','Cabal','Otra'].map(t => <option key={t}>{t}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Fecha de acreditación" style={{ maxWidth: 160 }}><input type="date" value={tcForm.fecha} onChange={e => setTc('fecha', e.target.value)} /></FormGroup>
        </FormRow>
        <Btn variant="primary" onClick={anadirTC}><i className="ti ti-plus" aria-hidden="true" /> Registrar tarjeta</Btn>
      </Card>

      <Grid cols={2}>
        <Metric label="Total pendiente de acreditar" value={fmt(totalPend)} color={totalPend > 0 ? '#BA7517' : undefined} sub="cheques + tarjetas" />
        <Metric label="Cheques pendientes" value={pendChq.length} />
      </Grid>

      {pendChq.length > 0 && (
        <Card style={{ padding: 0, overflow: 'auto' }}>
          <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Cheques</div>
          <TableWrapper>
            <thead><tr>
              <Th>De</Th><Th>N° cheque</Th><Th>Banco</Th>
              <Th style={{ textAlign: 'right' }}>Monto</Th><Th>Acredita</Th><Th />
            </tr></thead>
            <tbody>{pendChq.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(c => {
              const dias = diffDias(c.fecha)
              return (
                <tr key={c.id}>
                  <Td>{c.de || '—'}</Td><Td>{c.num || '—'}</Td>
                  <Td style={{ color: 'var(--color-text-secondary)' }}>{c.banco || '—'}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 500 }}>{fmt(c.monto)}</Td>
                  <Td><Badge type={dias < 0 ? 'vencido' : dias <= 3 ? 'pendiente' : 'cheque'}>
                    {dias < 0 ? `Vencido ${Math.abs(dias)}d` : dias === 0 ? 'Hoy' : `En ${dias}d`} ({fmtDate(c.fecha)})
                  </Badge></Td>
                  <Td><Btn variant="success" size="sm" onClick={() => marcarChequeCobrado(c.id)}>
                    <i className="ti ti-check" aria-hidden="true" /> Cobrado
                  </Btn></Td>
                </tr>
              )
            })}</tbody>
          </TableWrapper>
        </Card>
      )}

      {pendTC.length > 0 && (
        <Card style={{ padding: 0, overflow: 'auto' }}>
          <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Tarjetas</div>
          <TableWrapper>
            <thead><tr>
              <Th>Concepto</Th><Th>Tarjeta</Th>
              <Th style={{ textAlign: 'right' }}>Monto</Th><Th>Acredita</Th><Th />
            </tr></thead>
            <tbody>{pendTC.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(t => {
              const dias = diffDias(t.fecha)
              return (
                <tr key={t.id}>
                  <Td>{t.desc || '—'}</Td>
                  <Td><Badge type="tarjeta">{t.tipo}</Badge></Td>
                  <Td style={{ textAlign: 'right', fontWeight: 500 }}>{fmt(t.monto)}</Td>
                  <Td><Badge type={dias < 0 ? 'vencido' : dias <= 3 ? 'pendiente' : 'default'}>
                    {dias < 0 ? `Vencido ${Math.abs(dias)}d` : dias === 0 ? 'Hoy' : `En ${dias}d`} ({fmtDate(t.fecha)})
                  </Badge></Td>
                  <Td><Btn variant="success" size="sm" onClick={() => marcarTarjetaAcreditada(t.id)}>
                    <i className="ti ti-check" aria-hidden="true" /> Acreditado
                  </Btn></Td>
                </tr>
              )
            })}</tbody>
          </TableWrapper>
        </Card>
      )}

      {!pendChq.length && !pendTC.length && <Card><Empty>No hay cobros pendientes. ¡Todo acreditado!</Empty></Card>}
    </div>
  )
}

export function Proveedores() {
  const { data, addProveedor, removeProveedor, marcarProveedorPagado, addMovimiento } = useData()

  const [provNombres, setProvNombres] = useState(() => {
    try { return JSON.parse(localStorage.getItem('boutique_prov_nombres') || '[]') } catch { return [] }
  })
  const [activeProveedor, setActiveProveedor] = useState(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [tab, setTab] = useState('deuda')
  const [deudaForm, setDeudaForm] = useState({ monto: '', tipo: 'efectivo', description: '', fecha: today(), vence: '' })
  const [pagoForm, setPagoForm] = useState({ monto: '', metodo: 'efectivo', description: '', fecha: today() })
  const setDeuda = (k, v) => setDeudaForm(f => ({ ...f, [k]: v }))
  const setPago = (k, v) => setPagoForm(f => ({ ...f, [k]: v }))

  const tipoLabel = { efectivo: 'Efectivo', transferencia: 'Transferencia', cheque: 'Cheque dif.', cuotas: 'Cuotas', pago: 'Pago' }

  const nombresEnData = [...new Set(data.proveedores.map(p => p.nombre?.trim()).filter(Boolean))]
  const todosNombres = [...new Set([...provNombres, ...nombresEnData])].sort()

  const saveNombres = (nombres) => {
    setProvNombres(nombres)
    localStorage.setItem('boutique_prov_nombres', JSON.stringify(nombres))
  }

  const agregarProveedor = () => {
    const nombre = nuevoNombre.trim()
    if (!nombre) return alert('Ingresá un nombre')
    if (todosNombres.map(n => n.toLowerCase()).includes(nombre.toLowerCase())) return alert('Ya existe ese proveedor')
    saveNombres([...provNombres, nombre])
    setNuevoNombre('')
  }

  const eliminarProveedor = async (nombre) => {
    if (!confirm(`¿Eliminar "${nombre}" y todos sus movimientos?`)) return
    await removeProveedor(nombre)
    saveNombres(provNombres.filter(n => n !== nombre))
    if (activeProveedor === nombre) setActiveProveedor(null)
  }

  const buildStats = (nombre) => {
    const rows = data.proveedores.filter(p => (p.nombre || '').trim() === nombre)
    const facturas = rows.filter(p => p.tipo !== 'pago')
    const pendientes = facturas.filter(f => !f.pagado)
    const deudaPendiente = pendientes.reduce((s, f) => s + f.monto, 0)
    const vencidas = pendientes.filter(f => f.vence && diffDias(f.vence) < 0).length
    return { nombre, rows, facturas, pendientes, deudaPendiente, vencidas }
  }

  const proveedoresList = todosNombres.map(buildStats)
  const totalDeuda = proveedoresList.reduce((s, p) => s + p.deudaPendiente, 0)
  const totalVencidas = proveedoresList.reduce((s, p) => s + p.vencidas, 0)

  const registrarDeuda = async () => {
    if (!deudaForm.monto || +deudaForm.monto <= 0) return alert('Ingresá un monto')
    await addProveedor({
      nombre: activeProveedor,
      monto: +deudaForm.monto,
      tipo: deudaForm.tipo,
      description: deudaForm.description,
      fecha: deudaForm.fecha,
      vence: deudaForm.vence || null,
      pagado: false,
    })
    setDeudaForm({ monto: '', tipo: 'efectivo', description: '', fecha: today(), vence: '' })
  }

  const registrarPago = async () => {
    if (!pagoForm.monto || +pagoForm.monto <= 0) return alert('Ingresá un monto')
    await addProveedor({
      nombre: activeProveedor,
      monto: +pagoForm.monto,
      tipo: 'pago',
      description: pagoForm.description || 'Pago proveedor',
      fecha: pagoForm.fecha,
      vence: null,
      pagado: true,
    })
    await addMovimiento({
      tipo: 'gasto',
      cat: 'mercaderia',
      monto: +pagoForm.monto,
      description: `Pago a ${activeProveedor}${pagoForm.description ? ' - ' + pagoForm.description : ''}`,
      metodo: pagoForm.metodo,
      fecha: pagoForm.fecha,
    })
    setPagoForm({ monto: '', metodo: 'efectivo', description: '', fecha: today() })
  }

  if (activeProveedor) {
    const stats = buildStats(activeProveedor)
    const timeline = [...stats.rows].sort((a, b) => b.fecha.localeCompare(a.fecha))

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Btn size="sm" onClick={() => setActiveProveedor(null)}><i className="ti ti-arrow-back" aria-hidden="true" /> Volver</Btn>
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>{activeProveedor}</h1>
        </div>

        <Grid cols={3}>
          <Metric label="Saldo pendiente" value={fmt(stats.deudaPendiente)} color={stats.deudaPendiente > 0 ? '#A32D2D' : '#0F6E56'} sub={stats.deudaPendiente > 0 ? 'a pagar' : 'sin deuda'} />
          <Metric label="Facturas pendientes" value={stats.pendientes.length} />
          <Metric label="Vencidas" value={stats.vencidas} color={stats.vencidas > 0 ? '#A32D2D' : undefined} />
        </Grid>

        <Card>
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
            <Btn
              variant={tab === 'deuda' ? 'primary' : 'default'}
              size="sm"
              onClick={() => setTab('deuda')}
            >
              <i className="ti ti-plus" aria-hidden="true" /> Nueva deuda / factura
            </Btn>
            <Btn
              variant={tab === 'pago' ? 'success' : 'default'}
              size="sm"
              onClick={() => setTab('pago')}
            >
              <i className="ti ti-cash" aria-hidden="true" /> Registrar pago
            </Btn>
          </div>

          {tab === 'deuda' && (
            <>
              <CardTitle>Nueva deuda / factura</CardTitle>
              <FormRow>
                <FormGroup label="Monto ($)" style={{ maxWidth: 130 }}>
                  <input type="number" value={deudaForm.monto} onChange={e => setDeuda('monto', e.target.value)} placeholder="0" />
                </FormGroup>
                <FormGroup label="Forma de pago" style={{ maxWidth: 150 }}>
                  <select value={deudaForm.tipo} onChange={e => setDeuda('tipo', e.target.value)}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque diferido</option>
                    <option value="cuotas">Cuotas</option>
                  </select>
                </FormGroup>
                <FormGroup label="Descripción">
                  <input type="text" value={deudaForm.description} onChange={e => setDeuda('description', e.target.value)} placeholder="Ej: Remeras verano x50" />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup label="Fecha de compra" style={{ maxWidth: 140 }}>
                  <input type="date" value={deudaForm.fecha} onChange={e => setDeuda('fecha', e.target.value)} />
                </FormGroup>
                <FormGroup label="Fecha de vencimiento" style={{ maxWidth: 140 }}>
                  <input type="date" value={deudaForm.vence} onChange={e => setDeuda('vence', e.target.value)} />
                </FormGroup>
              </FormRow>
              <Btn variant="primary" onClick={registrarDeuda}>
                <i className="ti ti-plus" aria-hidden="true" /> Registrar deuda
              </Btn>
            </>
          )}

          {tab === 'pago' && (
            <>
              <CardTitle>Registrar pago</CardTitle>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                El pago se registrará automáticamente como gasto en Ingresos/Gastos.
              </div>
              <FormRow>
                <FormGroup label="Monto ($)" style={{ maxWidth: 130 }}>
                  <input type="number" value={pagoForm.monto} onChange={e => setPago('monto', e.target.value)} placeholder="0" />
                </FormGroup>
                <FormGroup label="Medio de pago" style={{ maxWidth: 150 }}>
                  <select value={pagoForm.metodo} onChange={e => setPago('metodo', e.target.value)}>
                    {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Descripción">
                  <input type="text" value={pagoForm.description} onChange={e => setPago('description', e.target.value)} placeholder="Ej: Pago factura / Anticipo" />
                </FormGroup>
                <FormGroup label="Fecha" style={{ maxWidth: 140 }}>
                  <input type="date" value={pagoForm.fecha} onChange={e => setPago('fecha', e.target.value)} />
                </FormGroup>
              </FormRow>
              <Btn variant="success" onClick={registrarPago}>
                <i className="ti ti-check" aria-hidden="true" /> Registrar pago
              </Btn>
            </>
          )}
        </Card>

        {stats.pendientes.length > 0 && (
          <Card style={{ padding: 0, overflow: 'auto' }}>
            <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
              Facturas pendientes
            </div>
            <TableWrapper>
              <thead><tr>
                <Th>Fecha</Th><Th>Descripción</Th><Th>Forma</Th>
                <Th style={{ textAlign: 'right' }}>Monto</Th><Th>Vence</Th><Th />
              </tr></thead>
              <tbody>{stats.pendientes.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(p => {
                const dias = diffDias(p.vence)
                return (
                  <tr key={p.id}>
                    <Td>{fmtDate(p.fecha)}</Td>
                    <Td style={{ color: 'var(--color-text-secondary)' }}>{p.description || '—'}</Td>
                    <Td>{tipoLabel[p.tipo] || p.tipo}</Td>
                    <Td style={{ textAlign: 'right', fontWeight: 500, color: '#A32D2D' }}>{fmt(p.monto)}</Td>
                    <Td>
                      {p.vence
                        ? <Badge type={dias < 0 ? 'vencido' : dias <= 7 ? 'pendiente' : 'default'}>
                            {dias < 0 ? `Vencido ${Math.abs(dias)}d` : dias === 0 ? 'Hoy' : fmtDate(p.vence)}
                          </Badge>
                        : '—'}
                    </Td>
                    <Td>
                      <Btn variant="success" size="sm" onClick={() => marcarProveedorPagado(p.id)}>
                        <i className="ti ti-check" aria-hidden="true" /> Pagar
                      </Btn>
                    </Td>
                  </tr>
                )
              })}</tbody>
            </TableWrapper>
          </Card>
        )}

        <Card style={{ padding: 0, overflow: 'auto' }}>
          <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
            Historial completo
          </div>
          <TableWrapper>
            <thead><tr>
              <Th>Fecha</Th><Th>Tipo</Th><Th>Descripción</Th>
              <Th style={{ textAlign: 'right' }}>Monto</Th><Th>Estado</Th>
            </tr></thead>
            <tbody>
              {timeline.length ? timeline.map(p => (
                <tr key={p.id}>
                  <Td>{fmtDate(p.fecha)}</Td>
                  <Td><Badge type={p.tipo === 'pago' ? 'ingreso' : 'gasto'}>{p.tipo === 'pago' ? 'Pago' : 'Deuda'}</Badge></Td>
                  <Td style={{ color: 'var(--color-text-secondary)' }}>{p.description || '—'}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 500, color: p.tipo === 'pago' ? '#0F6E56' : '#A32D2D' }}>
                    {p.tipo === 'pago' ? '-' : '+'}{fmt(p.monto)}
                  </Td>
                  <Td>
                    {p.pagado || p.tipo === 'pago'
                      ? <Badge type="pagado">Pagado</Badge>
                      : <Badge type="pendiente">Pendiente</Badge>}
                  </Td>
                </tr>
              )) : <tr><td colSpan={5}><Empty>Sin movimientos</Empty></td></tr>}
            </tbody>
          </TableWrapper>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: '0.5rem' }}>Proveedores</h1>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Administrá las facturas y pagos de cada proveedor.
      </div>

      <Grid cols={2} style={{ gap: 8 }}>
        <Metric label="Deuda total pendiente" value={fmt(totalDeuda)} color={totalDeuda > 0 ? '#A32D2D' : '#0F6E56'} sub={totalDeuda > 0 ? 'a pagar' : 'sin deuda'} />
        <Metric label="Facturas vencidas" value={totalVencidas} color={totalVencidas > 0 ? '#A32D2D' : undefined} />
      </Grid>

      <Card>
        <CardTitle>Agregar proveedor</CardTitle>
        <FormRow>
          <FormGroup label="Nombre del proveedor">
            <input
              type="text"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarProveedor()}
              placeholder="Ej: Distribuidora Rosario"
            />
          </FormGroup>
          <Btn variant="primary" onClick={agregarProveedor} style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
            <i className="ti ti-plus" aria-hidden="true" /> Agregar
          </Btn>
        </FormRow>
      </Card>

      {proveedoresList.length ? proveedoresList.map(p => (
        <Card key={p.nombre}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{p.nombre}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                {p.pendientes.length} factura{p.pendientes.length !== 1 ? 's' : ''} pendiente{p.pendientes.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontWeight: 500, fontSize: 16, color: p.deudaPendiente > 0 ? '#A32D2D' : '#0F6E56' }}>
                {fmt(p.deudaPendiente)}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                {p.deudaPendiente > 0 ? 'a pagar' : 'sin deuda'}
              </span>
              {p.vencidas > 0 && <Badge type="vencido">{p.vencidas} vencida{p.vencidas !== 1 ? 's' : ''}</Badge>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn size="sm" variant="success" onClick={() => { setActiveProveedor(p.nombre); setTab('deuda') }}>
                <i className="ti ti-list-check" aria-hidden="true" /> Cuenta corriente
              </Btn>
              <Btn size="sm" variant="danger" onClick={() => eliminarProveedor(p.nombre)}>
                <i className="ti ti-trash" aria-hidden="true" /> Eliminar
              </Btn>
            </div>
          </div>
        </Card>
      )) : <Card><Empty>No hay proveedores. Agregá el primero arriba.</Empty></Card>}
    </div>
  )
}

export function Retiro() {
  const { data } = useData()
  const [simMonto, setSimMonto] = useState('')

  const ingReal = data.movimientos.filter(m => m.tipo === 'ingreso' && ['efectivo', 'transferencia'].includes(m.metodo)).reduce((s, m) => s + m.monto, 0)
  const gasReal = data.movimientos.filter(m => m.tipo === 'gasto' && ['efectivo', 'transferencia'].includes(m.metodo)).reduce((s, m) => s + m.monto, 0)
  const abonosCC = Object.values(data.movCC).flat().filter(m => m.tipo === 'abono').reduce((s, m) => s + m.monto, 0)
  const saldoReal = ingReal - gasReal + abonosCC
  const pendChq = data.cheques.filter(c => !c.cobrado).reduce((s, c) => s + c.monto, 0)
  const pendTC  = data.tarjetas.filter(t => !t.acreditado).reduce((s, t) => s + t.monto, 0)
  const venc30Pv = data.proveedores.filter(p => !p.pagado && p.vence && diffDias(p.vence) <= 30).reduce((s, p) => s + p.monto, 0)
  const ccPorCobrar = Object.values(data.movCC).flat().reduce((s, m) => m.tipo === 'cargo' ? s + m.monto : s - m.monto, 0)
  const ccVencida = Object.values(data.movCC).flat().filter(m => m.tipo === 'cargo' && m.vence && diffDias(m.vence) < 0).reduce((s, m) => s + m.monto, 0)

  const now = new Date()
  const gastosMes = data.movimientos.filter(m => {
    const d = new Date(m.fecha + 'T00:00:00')
    return m.tipo === 'gasto' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, m) => s + m.monto, 0)

  const reservaGastos = gastosMes * 1.2
  const reservaTotal  = reservaGastos + venc30Pv
  const disponible    = Math.max(0, saldoReal - reservaTotal)
  const disponibleSeguro = Math.round(disponible * 0.4)

  const checks = [
    { ok: saldoReal > 0,                         txt: 'Saldo real (efectivo/transferencia) positivo',        val: fmt(saldoReal) },
    { ok: saldoReal > reservaGastos,              txt: 'Cubre gastos fijos estimados del próximo mes',       val: fmt(reservaGastos) },
    { ok: venc30Pv === 0,                         txt: 'Sin deudas de proveedores venciendo en 30 días',     val: venc30Pv > 0 ? fmt(venc30Pv) + ' a pagar' : 'OK' },
    { ok: ccVencida === 0,                        txt: 'Sin cuentas corrientes vencidas por cobrar',         val: ccVencida > 0 ? fmt(ccVencida) + ' vencidas' : 'OK' },
    { ok: pendChq + pendTC < saldoReal * 0.5,    txt: 'Cheques/tarjetas pendientes bajo control',           val: fmt(pendChq + pendTC) + ' pendiente' },
  ]
  const puntaje = checks.filter(c => c.ok).length
  const semaforo = puntaje >= 5
    ? { color: '#0F6E56', bg: 'var(--color-success-bg)', txt: 'Podés retirar con seguridad' }
    : puntaje >= 3
    ? { color: '#BA7517', bg: 'var(--color-warning-bg)', txt: 'Retirar con cuidado' }
    : { color: '#A32D2D', bg: 'var(--color-danger-bg)', txt: 'No retires aún' }

  const simNum = parseFloat(simMonto) || 0
  const simResta = disponibleSeguro - simNum
  const simOk = simNum > 0 && simNum <= disponibleSeguro && simResta >= disponibleSeguro * 0.3

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: '1rem' }}>Análisis de retiro</h1>

      <Card>
        <CardTitle>Estado financiero real</CardTitle>
        <Grid cols={4} style={{ gap: 8 }}>
          <Metric label="Saldo real (efectivo+transf.)" value={fmt(saldoReal)} color={saldoReal < 0 ? '#A32D2D' : '#0F6E56'} />
          <Metric label="Cheques + tarjetas pendientes" value={fmt(pendChq + pendTC)} color="#BA7517" sub="aún no acreditado" />
          <Metric label="Deuda proveedores (30d)" value={fmt(venc30Pv)} color="#A32D2D" />
          <Metric label="Ctas. ctes. por cobrar" value={fmt(ccPorCobrar)} color={ccPorCobrar > 0 ? '#BA7517' : undefined} />
        </Grid>

        <div style={{ background: semaforo.bg, borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 12, color: semaforo.color, fontWeight: 500, marginBottom: 4 }}>DIAGNÓSTICO DE RETIRO</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: semaforo.color }}>{semaforo.txt}</div>
          <div style={{ fontSize: 13, color: semaforo.color, marginTop: 6 }}>{puntaje}/5 condiciones cumplidas</div>
        </div>

        {checks.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--color-border)', fontSize: 13 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.ok ? '#1D9E75' : '#E24B4A', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{c.txt}</span>
            <span style={{ fontSize: 12, color: c.ok ? '#0F6E56' : '#A32D2D', fontWeight: 500 }}>{c.val}</span>
          </div>
        ))}

        <div style={{ height: '0.5px', background: 'var(--color-border)', margin: '12px 0' }} />
        <Grid cols={3} style={{ gap: 8, marginBottom: 0 }}>
          <Metric label="Reserva gastos (1.2x mes)" value={fmt(reservaGastos)} />
          <Metric label="Reserva proveedores" value={fmt(venc30Pv)} />
          <Metric label="Disponible para retirar (40%)" value={fmt(disponibleSeguro)} color="#0F6E56" />
        </Grid>
      </Card>

      <Card>
        <CardTitle>Simular retiro</CardTitle>
        <FormRow>
          <FormGroup label="Monto a retirar ($)" style={{ maxWidth: 200 }}>
            <input type="number" value={simMonto} onChange={e => setSimMonto(e.target.value)} placeholder="0" />
          </FormGroup>
        </FormRow>
        {simNum > 0 && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 13, background: simNum > disponibleSeguro ? 'var(--color-danger-bg)' : simResta < disponibleSeguro * 0.3 ? 'var(--color-warning-bg)' : 'var(--color-success-bg)', color: simNum > disponibleSeguro ? '#791F1F' : simResta < disponibleSeguro * 0.3 ? '#633806' : '#085041' }}>
            {simNum > disponibleSeguro
              ? `Ese monto supera el disponible seguro (${fmt(disponibleSeguro)}). No se recomienda.`
              : simResta < disponibleSeguro * 0.3
              ? `Podés retirarlo pero quedás muy ajustada. Quedarían ${fmt(simResta)} de margen.`
              : `Retiro seguro. Quedarían ${fmt(simResta)} de margen después del retiro.`}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Reglas de retiro seguro</CardTitle>
        {[
          { dot: '#1D9E75', txt: 'Retirar máximo el 40% del saldo real disponible en efectivo/transferencia' },
          { dot: '#1D9E75', txt: 'Siempre dejar cubiertos los gastos fijos del próximo mes antes de retirar' },
          { dot: '#BA7517', txt: 'Los cheques y tarjetas aún no acreditados NO cuentan como dinero disponible' },
          { dot: '#BA7517', txt: 'Las deudas de proveedores que vencen en 30 días deben estar reservadas' },
          { dot: '#A32D2D', txt: 'Si hay cuentas corrientes vencidas, no retirar hasta cobrar o tener el equivalente' },
          { dot: '#A32D2D', txt: 'Nunca retirar si el saldo disponible es menor a 1.5x los gastos fijos mensuales' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--color-border)', fontSize: 13 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.dot, flexShrink: 0 }} />
            <span>{r.txt}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
