import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { fmt, fmtDate, today, diffDias } from '../utils/helpers'
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
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: '1rem' }}>Cobros pendientes</h1>

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
  const { data, addProveedor, marcarProveedorPagado } = useData()
  const [form, setForm] = useState({ nombre: '', monto: '', tipo: 'efectivo', description: '', fecha: today(), vence: '', cuotas: '', cuota_monto: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const agregar = async () => {
    if (!form.monto) return alert('Ingresá el monto')
    const payload = { ...form, monto: +form.monto, cuotas: +form.cuotas || 1, cuota_monto: +form.cuota_monto || 0, pagado: false }
    if (!payload.vence) payload.vence = null
    await addProveedor(payload)
    setForm({ nombre: '', monto: '', tipo: 'efectivo', description: '', fecha: today(), vence: '', cuotas: '', cuota_monto: '' })
  }

  const pend = data.proveedores.filter(p => !p.pagado).sort((a, b) => a.vence.localeCompare(b.vence))
  const totalDeuda = pend.reduce((s, p) => s + p.monto, 0)
  const venc30 = pend.filter(p => { const d = diffDias(p.vence); return d !== null && d <= 30 }).reduce((s, p) => s + p.monto, 0)
  const tipoLabel = { efectivo: 'Efectivo', transferencia: 'Transferencia', cheque: 'Cheque dif.', cuotas: 'Cuotas' }

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: '1rem' }}>Proveedores</h1>
      <Card>
        <CardTitle>Registrar deuda con proveedor</CardTitle>
        <FormRow>
          <FormGroup label="Proveedor"><input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Distribuidora Rosario" /></FormGroup>
          <FormGroup label="Monto total ($)" style={{ maxWidth: 130 }}><input type="number" value={form.monto} onChange={e => set('monto', e.target.value)} /></FormGroup>
          <FormGroup label="Forma de pago" style={{ maxWidth: 130 }}>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque diferido</option>
              <option value="cuotas">Cuotas</option>
            </select>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Descripción"><input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Remeras verano x50" /></FormGroup>
          <FormGroup label="Fecha de compra" style={{ maxWidth: 140 }}><input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} /></FormGroup>
          <FormGroup label="Fecha de vencimiento" style={{ maxWidth: 140 }}><input type="date" value={form.vence} onChange={e => set('vence', e.target.value)} /></FormGroup>
        </FormRow>
        {form.tipo === 'cuotas' && (
          <FormRow>
            <FormGroup label="Cant. cuotas" style={{ maxWidth: 120 }}><input type="number" value={form.cuotas} onChange={e => set('cuotas', e.target.value)} placeholder="3" /></FormGroup>
            <FormGroup label="Monto por cuota ($)" style={{ maxWidth: 160 }}><input type="number" value={form.cuota_monto} onChange={e => set('cuota_monto', e.target.value)} /></FormGroup>
          </FormRow>
        )}
        <Btn variant="primary" onClick={agregar}><i className="ti ti-plus" aria-hidden="true" /> Registrar deuda</Btn>
      </Card>

      <Grid cols={2}>
        <Metric label="Deuda total pendiente" value={fmt(totalDeuda)} color="#A32D2D" />
        <Metric label="Vence en próximos 30 días" value={fmt(venc30)} color="#BA7517" />
      </Grid>

      {pend.length ? (
        <Card style={{ padding: 0, overflow: 'auto' }}>
          <TableWrapper>
            <thead><tr>
              <Th>Proveedor</Th><Th>Descripción</Th><Th>Tipo pago</Th>
              <Th style={{ textAlign: 'right' }}>Monto</Th><Th>Vence</Th><Th />
            </tr></thead>
            <tbody>{pend.map(p => {
              const dias = diffDias(p.vence)
              return (
                <tr key={p.id}>
                  <Td style={{ fontWeight: 500 }}>{p.nombre}</Td>
                  <Td style={{ color: 'var(--color-text-secondary)' }}>{p.description || '—'}</Td>
                  <Td>{p.tipo === 'cuotas' ? `${p.cuotas} cuotas` : tipoLabel[p.tipo]}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 500, color: '#A32D2D' }}>{fmt(p.monto)}</Td>
                  <Td>{dias !== null
                    ? <Badge type={dias < 0 ? 'vencido' : dias <= 7 ? 'pendiente' : 'default'}>
                        {dias < 0 ? `Vencido ${Math.abs(dias)}d` : dias === 0 ? 'Hoy' : `En ${dias}d`} ({fmtDate(p.vence)})
                      </Badge>
                    : '—'}
                  </Td>
                  <Td><Btn variant="success" size="sm" onClick={() => marcarProveedorPagado(p.id)}>
                    <i className="ti ti-check" aria-hidden="true" /> Pagado
                  </Btn></Td>
                </tr>
              )
            })}</tbody>
          </TableWrapper>
        </Card>
      ) : <Card><Empty>Sin deudas pendientes con proveedores</Empty></Card>}
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
