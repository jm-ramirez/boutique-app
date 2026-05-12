import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  movimientosService,
  clientesService,
  movCCService,
  chequesService,
  tarjetasService,
  proveedoresService,
  productosService,
  movStockService,
} from '../lib/db'

const DataContext = createContext(null)

const EMPTY = {
  movimientos: [],
  clientes: [],
  movCC: {},
  cheques: [],
  tarjetas: [],
  proveedores: [],
  productos: [],
  movStock: [],
}

export function DataProvider({ children }) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [movimientos, clientes, movCCArray, cheques, tarjetas, proveedores, productos, movStock] =
        await Promise.all([
          movimientosService.getAll(),
          clientesService.getAll(),
          movCCService.getAll(),
          chequesService.getAll(),
          tarjetasService.getAll(),
          proveedoresService.getAll(),
          productosService.getAll(),
          movStockService.getAll(),
        ])

      // Agrupar movCC por cliente
      const movCC = {}
      movCCArray.forEach(mov => {
        if (!movCC[mov.cliente_id]) movCC[mov.cliente_id] = []
        movCC[mov.cliente_id].push(mov)
      })

      setData({ movimientos, clientes, movCC, cheques, tarjetas, proveedores, productos, movStock })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const addMovimiento = async (item) => {
    const saved = await movimientosService.add(item)
    setData(d => ({ ...d, movimientos: [saved, ...d.movimientos] }))
  }
  const removeMovimiento = async (id) => {
    await movimientosService.remove(id)
    setData(d => ({ ...d, movimientos: d.movimientos.filter(m => m.id !== id) }))
  }

  const addCliente = async (cliente) => {
    const saved = await clientesService.add(cliente)
    setData(d => ({ ...d, clientes: [...d.clientes, saved], movCC: { ...d.movCC, [saved.id]: [] } }))
  }
  const removeCliente = async (id) => {
    await clientesService.remove(id)
    const { [id]: _, ...rest } = data.movCC
    setData(d => ({ ...d, clientes: d.clientes.filter(c => c.id !== id), movCC: rest }))
  }
  const addMovCC = async (clienteId, mov) => {
    const saved = await movCCService.add(clienteId, mov)
    setData(d => ({
      ...d,
      movCC: { ...d.movCC, [clienteId]: [...(d.movCC[clienteId] || []), saved] },
    }))

    if (mov.tipo === 'abono') {
      await addMovimiento({
        tipo: 'ingreso',
        cat: 'venta-local',
        monto: mov.monto,
        description: mov.description || 'Abono cuenta corriente',
        metodo: 'cuenta-corriente',
        fecha: mov.fecha,
      })
    }
  }

  const addCheque = async (item) => {
    const saved = await chequesService.add(item)
    setData(d => ({ ...d, cheques: [...d.cheques, saved] }))
  }
  const marcarChequeCobrado = async (id) => {
    await chequesService.marcarCobrado(id)
    setData(d => ({ ...d, cheques: d.cheques.map(c => c.id === id ? { ...c, cobrado: true } : c) }))
  }

  const addTarjeta = async (item) => {
    const saved = await tarjetasService.add(item)
    setData(d => ({ ...d, tarjetas: [...d.tarjetas, saved] }))
  }
  const marcarTarjetaAcreditada = async (id) => {
    await tarjetasService.marcarAcreditado(id)
    setData(d => ({ ...d, tarjetas: d.tarjetas.map(t => t.id === id ? { ...t, acreditado: true } : t) }))
  }

  const addProveedor = async (item) => {
    const saved = await proveedoresService.add(item)
    setData(d => ({ ...d, proveedores: [...d.proveedores, saved] }))
  }
  const marcarProveedorPagado = async (id) => {
    await proveedoresService.marcarPagado(id)
    setData(d => ({ ...d, proveedores: d.proveedores.map(p => p.id === id ? { ...p, pagado: true } : p) }))
  }

  const addProducto = async (producto) => {
    const saved = await productosService.add(producto)
    setData(d => ({ ...d, productos: [...d.productos, saved] }))
  }
  const removeProducto = async (id) => {
    await productosService.remove(id)
    setData(d => ({ ...d, productos: d.productos.filter(p => p.id !== id) }))
  }
  const updateVariante = async (productoId, varianteId, cantidad) => {
    await productosService.updateVariante(varianteId, cantidad)
    setData(d => ({
      ...d,
      productos: d.productos.map(p =>
        p.id === productoId
          ? { ...p, variantes: p.variantes.map(v => v.id === varianteId ? { ...v, cantidad } : v) }
          : p
      ),
    }))
  }
  const addMovStock = async (mov) => {
    const saved = await movStockService.add(mov)
    setData(d => ({ ...d, movStock: [saved, ...d.movStock] }))
  }

  return (
    <DataContext.Provider value={{
      data, loading, error, reload: loadAll,
      addMovimiento, removeMovimiento,
      addCliente, removeCliente, addMovCC,
      addCheque, marcarChequeCobrado,
      addTarjeta, marcarTarjetaAcreditada,
      addProveedor, marcarProveedorPagado,
      addProducto, removeProducto, updateVariante, addMovStock,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
