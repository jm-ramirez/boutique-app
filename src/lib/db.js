import { supabase } from './supabase'

// Movimientos (ingresos/gastos)
export const movimientosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('movimientos')
      .select('*')
      .order('fecha', { ascending: false })
    if (error) throw error
    return data || []
  },
  async add(item) {
    const { data, error } = await supabase
      .from('movimientos')
      .insert([item])
      .select()
    if (error) throw error
    return data[0]
  },
  async remove(id) {
    const { error } = await supabase
      .from('movimientos')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}

// Clientes
export const clientesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data || []
  },
  async add(cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
    if (error) throw error
    return data[0]
  },
  async remove(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}

// Movimientos de Cuenta Corriente
export const movCCService = {
  async getAll() {
    const { data, error } = await supabase
      .from('mov_cc')
      .select('*')
      .order('fecha', { ascending: false })
    if (error) throw error
    return data || []
  },
  async add(clienteId, mov) {
    const { data, error } = await supabase
      .from('mov_cc')
      .insert([{ ...mov, cliente_id: clienteId }])
      .select()
    if (error) throw error
    return data[0]
  },
}

// Cheques
export const chequesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('cheques')
      .select('*')
      .order('fecha', { ascending: false })
    if (error) throw error
    return data || []
  },
  async add(item) {
    const { data, error } = await supabase
      .from('cheques')
      .insert([item])
      .select()
    if (error) throw error
    return data[0]
  },
  async marcarCobrado(id) {
    const { error } = await supabase
      .from('cheques')
      .update({ cobrado: true })
      .eq('id', id)
    if (error) throw error
  },
}

// Tarjetas
export const tarjetasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tarjetas')
      .select('*')
      .order('fecha', { ascending: false })
    if (error) throw error
    return data || []
  },
  async add(item) {
    const { data, error } = await supabase
      .from('tarjetas')
      .insert([item])
      .select()
    if (error) throw error
    return data[0]
  },
  async marcarAcreditado(id) {
    const { error } = await supabase
      .from('tarjetas')
      .update({ acreditado: true })
      .eq('id', id)
    if (error) throw error
  },
}

// Proveedores
export const proveedoresService = {
  async getAll() {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('nombre')
    if (error) throw error
    return data || []
  },
  async add(item) {
    const { data, error } = await supabase
      .from('proveedores')
      .insert([item])
      .select()
    if (error) throw error
    return data[0]
  },
  async marcarPagado(id) {
    const { error } = await supabase
      .from('proveedores')
      .update({ pagado: true })
      .eq('id', id)
    if (error) throw error
  },
}

// Productos
export const productosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('productos')
      .select('*, variantes(*)')
      .order('nombre')
    if (error) throw error
    return data || []
  },
  async add(producto) {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
    if (error) throw error
    return data[0]
  },
  async remove(id) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
  async updateVariante(varianteId, cantidad) {
    const { error } = await supabase
      .from('variantes')
      .update({ cantidad })
      .eq('id', varianteId)
    if (error) throw error
  },
}

// Movimientos de Stock
export const movStockService = {
  async getAll() {
    const { data, error } = await supabase
      .from('mov_stock')
      .select('*')
      .order('fecha', { ascending: false })
    if (error) throw error
    return data || []
  },
  async add(mov) {
    const { data, error } = await supabase
      .from('mov_stock')
      .insert([mov])
      .select()
    if (error) throw error
    return data[0]
  },
}
