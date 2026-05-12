import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { fmt, fmtDate, filterByPeriod, diffDias } from '../utils/helpers'
import { Card, CardTitle, Metric, Alert, Badge, Grid, Empty } from '../components/UI'

export default function Resumen() {
  const { data } = useData()
  const [period, setPeriod] = useState('mes')

  const movF = filterByPeriod(data.movimientos, 'fecha', period)
  const ingF = movF.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
  const gasF = movF.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
  const gananF = ingF - gasF

  const ccTotal = Object.values(data.movCC).flat()
    .reduce((s, m) => m.tipo === 'cargo' ? s + m.monto : s - m.monto, 0)

  const ccVencida = Object.values(data.movCC).flat()
    .filter(m => m.tipo === 'cargo' && m.vence && diffDias(m.vence) < 0)
    .reduce((s, m) => s + m.monto, 0)

  const chqVenc = data.cheques.filter(c => !c.cobrado && c.fecha && diffDias(c.fecha) <= 3)
  const pvVenc  = data.proveedores.filter(p => !p.pagado && p.vence && diffDias(p.vence) <= 7)

  const alertas = []
  if (ccVencida > 0)
    alertas.push({ type: 'danger', txt: `Cuentas corrientes vencidas: ${fmt(ccVencida)} sin cobrar. Contactar clientes.` })
  if (chqVenc.length)
    alertas.push({ type: 'warning', txt: `${chqVenc.length} cheque${chqVenc.length > 1 ? 's' : ''} por acreditar en los próximos 3 días.` })
  if (pvVenc.length)
    alertas.push({ type: 'danger', txt: `${pvVenc.length} pago${pvVenc.length > 1 ? 's' : ''} a proveedor vencen en 7 días: ${fmt(pvVenc.reduce((s, p) => s + p.monto, 0))}` })
  if (gananF < 0)
    alertas.push({ type: 'danger', txt: 'El período está en rojo. Los gastos superan los ingresos.' })
  if (!alertas.length)
    alertas.push({ type: 'success', txt: 'Todo en orden. Sin alertas críticas.' })

  const pendientes = [
    ...data.cheques.filter(c => !c.cobrado && c.fecha && diffDias(c.fecha) <= 7)
      .map(c => ({ tipo: 'Cheque a cobrar', desc: c.de || '—', monto: c.monto, dias: diffDias(c.fecha), badge: 'cheque' })),
    ...data.proveedores.filter(p => !p.pagado && p.vence && diffDias(p.vence) <= 14)
      .map(p => ({ tipo: 'Pago proveedor', desc: p.nombre, monto: p.monto, dias: diffDias(p.vence), badge: 'gasto' })),
  ].sort((a, b) => a.dias - b.dias)

  const ultimos = [...data.movimientos]
    .sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Panel general</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="todo">Todo</option>
        </select>
      </div>

      <Grid cols={4} style={{ gap: 8 }}>
        <Metric label="Ingresos" value={fmt(ingF)} color={ingF > 0 ? '#0F6E56' : undefined} />
        <Metric label="Gastos" value={fmt(gasF)} color={gasF > 0 ? '#A32D2D' : undefined} />
        <Metric label="Resultado" value={fmt(gananF)} color={gananF >= 0 ? '#0F6E56' : '#A32D2D'} />
        <Metric label="Ctas. ctes. por cobrar" value={fmt(ccTotal)} color={ccTotal > 0 ? '#BA7517' : undefined} />
      </Grid>

      <Grid cols={2}>
        <Card>
          <CardTitle>Alertas y diagnóstico</CardTitle>
          {alertas.map((a, i) => <Alert key={i} type={a.type}>{a.txt}</Alert>)}
        </Card>
        <Card>
          <CardTitle>Vencimientos próximos</CardTitle>
          {pendientes.length ? pendientes.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid var(--color-border)', fontSize: 12 }}>
              <div>
                <Badge type={p.badge} style={{ marginRight: 6 }}>{p.tipo}</Badge>
                {p.desc}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 500 }}>{fmt(p.monto)}</div>
                <div style={{ fontSize: 10, color: p.dias < 0 ? '#A32D2D' : '#BA7517' }}>
                  {p.dias < 0 ? 'Vencido' : `En ${p.dias}d`}
                </div>
              </div>
            </div>
          )) : <Empty>Sin vencimientos próximos</Empty>}
        </Card>
      </Grid>

      <Card>
        <CardTitle>Últimos movimientos</CardTitle>
        {ultimos.length ? ultimos.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid var(--color-border)', fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--color-text-tertiary)' }}>{fmtDate(m.fecha)}</span>
              <Badge type={m.metodo}>{m.metodo}</Badge>
              <span>{m.desc || m.cat || '—'}</span>
            </div>
            <span style={{ fontWeight: 500, color: m.tipo === 'ingreso' ? '#0F6E56' : '#A32D2D' }}>
              {m.tipo === 'ingreso' ? '+' : '-'}{fmt(m.monto)}
            </span>
          </div>
        )) : <Empty>Sin movimientos aún</Empty>}
      </Card>
    </div>
  )
}
