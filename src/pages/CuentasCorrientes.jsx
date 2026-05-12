import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { fmt, fmtDate, today, diffDias } from '../utils/helpers'
import { Card, CardTitle, Metric, Btn, FormRow, FormGroup, Badge, Grid, TableWrapper, Th, Td, Empty } from '../components/UI'

export default function CuentasCorrientes() {
  const { data, addCliente, removeCliente, addMovCC } = useData()
  const [clienteForm, setClienteForm] = useState({ nombre: '', tel: '' })
  const [activeId, setActiveId] = useState(null)
  const [movForm, setMovForm] = useState({ tipo: 'cargo', monto: '', description: '', fecha: today(), vence: '' })

  const setMov = (k, v) => setMovForm(f => ({ ...f, [k]: v }))

  const agregarCliente = async () => {
    if (!clienteForm.nombre.trim()) return alert('Ingresá un nombre')
    const id = 'cl' + Date.now()
    await addCliente({ id, ...clienteForm })
    setClienteForm({ nombre: '', tel: '' })
  }

  const agregarMovCC = async () => {
    if (!movForm.monto || +movForm.monto <= 0) return alert('Ingresá un monto')
    const payload = { ...movForm, monto: +movForm.monto }
    if (!payload.vence) payload.vence = null
    await addMovCC(activeId, payload)
    setMovForm(f => ({ ...f, monto: '', description: '', vence: '' }))
  }

  const borrarCliente = async (id) => {
    if (!confirm('¿Eliminar este cliente y todos sus movimientos?')) return
    await removeCliente(id)
    if (activeId === id) setActiveId(null)
  }

  if (activeId) {
    const cl = data.clientes.find(c => c.id === activeId)
    const movs = (data.movCC[activeId] || []).slice().sort((a, b) => a.fecha.localeCompare(b.fecha))
    let saldo = 0
    const rows = movs.map(m => {
      saldo += m.tipo === 'cargo' ? m.monto : -m.monto
      const dias = diffDias(m.vence)
      return { ...m, saldoAcum: saldo, dias }
    })
    const deuda = rows.length ? rows[rows.length - 1].saldoAcum : 0
    const totalCargos  = movs.filter(m => m.tipo === 'cargo').reduce((s, m) => s + m.monto, 0)
    const totalAbonos  = movs.filter(m => m.tipo === 'abono').reduce((s, m) => s + m.monto, 0)

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Btn size="sm" onClick={() => setActiveId(null)}><i className="ti ti-arrow-back" aria-hidden="true" /> Volver</Btn>
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>{cl?.nombre}</h1>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Los cargos aumentan la deuda del cliente. Los abonos se registran también como ingreso en Ingresos/Gastos con método "Cuenta corriente".
        </div>
        <Grid cols={3}>
          <Metric label="Saldo actual" value={fmt(Math.abs(deuda))} sub={deuda > 0 ? 'debe' : 'sin deuda'} color={deuda > 0 ? '#A32D2D' : '#0F6E56'} />
          <Metric label="Total compras" value={fmt(totalCargos)} />
          <Metric label="Total abonado" value={fmt(totalAbonos)} color="#0F6E56" />
        </Grid>

        <Card>
          <CardTitle>Registrar movimiento</CardTitle>
          <FormRow>
            <FormGroup label="Tipo" style={{ maxWidth: 130 }}>
              <select value={movForm.tipo} onChange={e => setMov('tipo', e.target.value)}>
                <option value="cargo">Cargo (venta)</option>
                <option value="abono">Abono (pago)</option>
              </select>
            </FormGroup>
            <FormGroup label="Monto ($)" style={{ maxWidth: 130 }}>
              <input type="number" value={movForm.monto} min="0" onChange={e => setMov('monto', e.target.value)} placeholder="0" />
            </FormGroup>
            <FormGroup label="Descripción">
              <input type="text" value={movForm.description} onChange={e => setMov('description', e.target.value)} placeholder="Ej: Remera azul / Pago parcial" />
            </FormGroup>
            <FormGroup label="Fecha" style={{ maxWidth: 135 }}>
              <input type="date" value={movForm.fecha} onChange={e => setMov('fecha', e.target.value)} />
            </FormGroup>
          </FormRow>
          {movForm.tipo === 'cargo' && (
            <FormRow>
              <FormGroup label="Fecha límite de pago (opcional)" style={{ maxWidth: 220 }}>
                <input type="date" value={movForm.vence} onChange={e => setMov('vence', e.target.value)} />
              </FormGroup>
            </FormRow>
          )}
          <Btn variant="primary" onClick={agregarMovCC}>
            <i className="ti ti-plus" aria-hidden="true" /> Registrar
          </Btn>
        </Card>

        <Card style={{ padding: 0, overflow: 'auto' }}>
          <TableWrapper>
            <thead>
              <tr>
                <Th style={{ width: 80 }}>Fecha</Th>
                <Th style={{ width: 75 }}>Tipo</Th>
                <Th>Descripción</Th>
                <Th style={{ width: 110 }}>Vence</Th>
                <Th style={{ width: 85, textAlign: 'right' }}>Monto</Th>
                <Th style={{ width: 85, textAlign: 'right' }}>Saldo</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map(m => (
                <tr key={m.id}>
                  <Td>{fmtDate(m.fecha)}</Td>
                  <Td><Badge type={m.tipo === 'cargo' ? 'gasto' : 'ingreso'}>{m.tipo === 'cargo' ? 'Cargo' : 'Abono'}</Badge></Td>
                  <Td style={{ color: 'var(--color-text-secondary)' }}>{m.description || '—'}</Td>
                  <Td>
                    {m.tipo === 'cargo' && m.vence
                      ? <Badge type={m.dias < 0 ? 'vencido' : m.dias <= 7 ? 'pendiente' : 'default'}>
                          {m.dias < 0 ? `Vencido ${Math.abs(m.dias)}d` : m.dias === 0 ? 'Hoy' : fmtDate(m.vence)}
                        </Badge>
                      : '—'}
                  </Td>
                  <Td style={{ textAlign: 'right', fontWeight: 500, color: m.tipo === 'cargo' ? '#A32D2D' : '#0F6E56' }}>
                    {m.tipo === 'cargo' ? '+' : '-'}{fmt(m.monto)}
                  </Td>
                  <Td style={{ textAlign: 'right', fontWeight: 500, color: m.saldoAcum > 0 ? '#A32D2D' : '#0F6E56' }}>
                    {fmt(m.saldoAcum)}
                  </Td>
                </tr>
              )) : <tr><td colSpan={6}><Empty>Sin movimientos aún</Empty></td></tr>}
            </tbody>
          </TableWrapper>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: '0.5rem' }}>Cuentas corrientes</h1>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
        Para cargar un cargo o un abono, primero agregá el cliente y luego abrí su cuenta corriente.
      </div>
      <Card>
        <CardTitle>Agregar cliente</CardTitle>
        <FormRow>
          <FormGroup label="Nombre del cliente">
            <input type="text" value={clienteForm.nombre} onChange={e => setClienteForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: María González" />
          </FormGroup>
          <FormGroup label="Teléfono (opcional)" style={{ maxWidth: 160 }}>
            <input type="text" value={clienteForm.tel} onChange={e => setClienteForm(f => ({ ...f, tel: e.target.value }))} placeholder="11 1234-5678" />
          </FormGroup>
          <Btn variant="primary" onClick={agregarCliente} style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
            <i className="ti ti-plus" aria-hidden="true" /> Agregar
          </Btn>
        </FormRow>
      </Card>

      {data.clientes.length ? data.clientes.map(cl => {
        const movs = data.movCC[cl.id] || []
        const saldo = movs.reduce((s, m) => m.tipo === 'cargo' ? s + m.monto : s - m.monto, 0)
        const vencidas = movs.filter(m => m.tipo === 'cargo' && m.vence && diffDias(m.vence) < 0).length
        return (
          <Card key={cl.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{cl.nombre}</div>
                {cl.tel && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{cl.tel}</div>}
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 140 }}>
                <span style={{ fontWeight: 500, fontSize: 16, color: saldo > 0 ? '#A32D2D' : '#0F6E56' }}>{fmt(Math.abs(saldo))}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{saldo > 0 ? 'debe' : 'sin deuda'}</span>
                {vencidas > 0 && <Badge type="vencido">{vencidas} cuota{vencidas > 1 ? 's' : ''} vencida{vencidas > 1 ? 's' : ''}</Badge>}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn size="sm" variant="success" onClick={() => setActiveId(cl.id)}>
                  <i className="ti ti-list-check" aria-hidden="true" /> Cuenta corriente
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => borrarCliente(cl.id)}>
                  <i className="ti ti-trash" aria-hidden="true" /> Eliminar
                </Btn>
              </div>
            </div>
          </Card>
        )
      }) : <Card><Empty>No hay clientes con cuenta corriente. Agregá el primero arriba.</Empty></Card>}
    </div>
  )
}
