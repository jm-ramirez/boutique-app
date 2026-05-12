import React, { useState } from 'react'
import { useData } from '../context/DataContext'
import { fmt, fmtDate, today, METODOS_PAGO, CATEGORIAS_MOV } from '../utils/helpers'
import { Card, CardTitle, Btn, FormRow, FormGroup, Badge, TableWrapper, Th, Td, Empty } from '../components/UI'

const catLabel = Object.fromEntries(CATEGORIAS_MOV.map(c => [c.value, c.label]))
const metLabel = Object.fromEntries(METODOS_PAGO.map(m => [m.value, m.label]))

export default function Movimientos() {
  const { data, addMovimiento, removeMovimiento } = useData()
  const [form, setForm] = useState({
    tipo: 'ingreso', cat: 'venta-local', monto: '', description: '',
    metodo: 'efectivo', fecha: today(),
    cheque_num: '', cheque_banco: '', cheque_vence: '',
  })
  const [filtroTipo, setFiltroTipo] = useState('todo')
  const [filtroMet, setFiltroMet] = useState('todo')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const agregar = async () => {
    if (!form.monto || +form.monto <= 0) return alert('Ingresá un monto válido')
    const payload = { ...form, monto: +form.monto }
    // Convertir strings vacíos a null para campos de tipo date
    if (!payload.cheque_vence) payload.cheque_vence = null
    await addMovimiento(payload)
    setForm(f => ({ ...f, monto: '', description: '', cheque_num: '', cheque_banco: '', cheque_vence: '' }))
  }

  let movs = [...data.movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha))
  if (filtroTipo !== 'todo') movs = movs.filter(m => m.tipo === filtroTipo)
  if (filtroMet !== 'todo')  movs = movs.filter(m => m.metodo === filtroMet)

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: '1rem' }}>Ingresos y gastos</h1>

      <Card>
        <CardTitle>Registrar movimiento</CardTitle>
        <FormRow>
          <FormGroup label="Tipo" style={{ maxWidth: 120 }}>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </FormGroup>
          <FormGroup label="Categoría">
            <select value={form.cat} onChange={e => set('cat', e.target.value)}>
              {CATEGORIAS_MOV.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Monto ($)" style={{ maxWidth: 130 }}>
            <input type="number" value={form.monto} min="0" onChange={e => set('monto', e.target.value)} placeholder="0" />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Descripción">
            <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detalle opcional" />
          </FormGroup>
          <FormGroup label="Forma de cobro/pago" style={{ maxWidth: 160 }}>
            <select value={form.metodo} onChange={e => set('metodo', e.target.value)}>
              {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Fecha" style={{ maxWidth: 135 }}>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} />
          </FormGroup>
        </FormRow>
        {form.metodo === 'cheque' && (
          <FormRow>
            <FormGroup label="N° cheque">
              <input type="text" value={form.cheque_num} onChange={e => set('cheque_num', e.target.value)} placeholder="00001234" />
            </FormGroup>
            <FormGroup label="Banco">
              <input type="text" value={form.cheque_banco} onChange={e => set('cheque_banco', e.target.value)} placeholder="Banco Nación" />
            </FormGroup>
            <FormGroup label="Fecha de cobro">
              <input type="date" value={form.cheque_vence} onChange={e => set('cheque_vence', e.target.value)} />
            </FormGroup>
          </FormRow>
        )}
        <Btn variant="primary" onClick={agregar}>
          <i className="ti ti-plus" aria-hidden="true" /> Registrar
        </Btn>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
          <option value="todo">Todos</option>
          <option value="ingreso">Solo ingresos</option>
          <option value="gasto">Solo gastos</option>
        </select>
        <select value={filtroMet} onChange={e => setFiltroMet(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
          <option value="todo">Todos los medios</option>
          {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <Card style={{ padding: 0, overflow: 'auto' }}>
        <TableWrapper>
          <thead>
            <tr>
              <Th style={{ width: 80 }}>Fecha</Th>
              <Th style={{ width: 70 }}>Tipo</Th>
              <Th style={{ width: 130 }}>Categoría</Th>
              <Th style={{ width: 100 }}>Medio</Th>
              <Th>Descripción</Th>
              <Th style={{ width: 90, textAlign: 'right' }}>Monto</Th>
              <Th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {movs.length ? movs.map(m => (
              <tr key={m.id}>
                <Td>{fmtDate(m.fecha)}</Td>
                <Td><Badge type={m.tipo}>{m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}</Badge></Td>
                <Td>{catLabel[m.cat] || m.cat}</Td>
                <Td><Badge type={m.metodo}>{metLabel[m.metodo] || m.metodo}</Badge></Td>
                <Td style={{ color: 'var(--color-text-secondary)' }}>
                  {m.description || '—'}
                  {m.cheque_num ? ` | Cheque #${m.cheque_num}` : ''}
                  {m.cheque_vence ? ` | Cobra: ${fmtDate(m.cheque_vence)}` : ''}
                </Td>
                <Td style={{ textAlign: 'right', fontWeight: 500, color: m.tipo === 'ingreso' ? '#0F6E56' : '#A32D2D' }}>
                  {m.tipo === 'ingreso' ? '+' : '-'}{fmt(m.monto)}
                </Td>
                <Td>
                  <Btn variant="danger" size="sm" onClick={() => removeMovimiento(m.id)}>
                    <i className="ti ti-trash" aria-hidden="true" />
                  </Btn>
                </Td>
              </tr>
            )) : (
              <tr><td colSpan={7}><Empty>Sin movimientos registrados</Empty></td></tr>
            )}
          </tbody>
        </TableWrapper>
      </Card>
    </div>
  )
}
