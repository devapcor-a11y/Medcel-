'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { fetchExchangeRate, getActiveExchangeRate } from '@/utils/currency';

export async function createTransaction(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const tipo = formData.get('tipo') as string;
  const monto = parseFloat(formData.get('monto') as string);
  const moneda = formData.get('moneda') as string;
  const centro_de_costos_id = formData.get('centro_de_costos_id') as string;
  const descripcion = formData.get('descripcion') as string;
  const productoIdRaw = formData.get('producto_id') as string;
  const producto_id =
    !productoIdRaw || productoIdRaw === 'none' ? null : productoIdRaw;
  const destinoIdRaw = formData.get('centro_destino_id') as string;
  const centro_destino_id =
    !destinoIdRaw || destinoIdRaw === 'none' ? null : destinoIdRaw;

  if (!tipo || !monto || !moneda || !centro_de_costos_id) {
    console.error('Faltan campos requeridos');
    return;
  }

  const ignorar_balance = formData.get('ignorar_balance') === 'on';

  const payload = {
    tipo,
    monto,
    moneda,
    centro_de_costos_id,
    centro_destino_id,
    descripcion,
    producto_id,
    ignorar_balance: tipo === 'gasto' ? ignorar_balance : false,
    cotizacion_usd: (await getActiveExchangeRate(supabase)).venta,
    registrada_por: user.id,
  };

  const { error } = await supabase.from('transacciones').insert([payload]);

  if (error) {
    console.error(error.message);
    return;
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finanzas');
  if (producto_id) revalidatePath('/productos');

  redirect('/dashboard/finanzas');
}

export async function deleteTransaction(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  // Recupera la transacción para saber si afecta stock
  const { data: t } = await supabase
    .from('transacciones')
    .select('*')
    .eq('id', id)
    .single();
  if (!t) return { error: 'No se encontró la transacción' };

  // Ejecutar eliminación
  const { error } = await supabase.from('transacciones').delete().eq('id', id);
  if (error) return { error: error.message };

  // Reversar stock
  if (t.producto_id) {
    const { data: prod } = await supabase
      .from('productos')
      .select('stock, estado')
      .eq('id', t.producto_id)
      .single();

    if (prod) {
      if (t.tipo === 'venta') {
        await supabase
          .from('productos')
          .update({ stock: prod.stock + 1, estado: 'disponible' })
          .eq('id', t.producto_id);
      } else if (t.tipo === 'compra') {
        const stockActual = prod.stock;
        const newStock = Math.max(0, stockActual - 1);
        let newEstado = prod.estado;
        if (newStock === 0) newEstado = 'vendido';
        await supabase
          .from('productos')
          .update({ stock: newStock, estado: newEstado })
          .eq('id', t.producto_id);
      }
    }
    revalidatePath('/productos');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finanzas');
  return { success: true };
}

export async function updateTransaction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const id = formData.get('transaction_id') as string;
  const tipo = formData.get('tipo') as string;
  const monto = parseFloat(formData.get('monto') as string);
  const moneda = formData.get('moneda') as string;
  const centro_de_costos_id = formData.get('centro_de_costos_id') as string;
  const descripcion = formData.get('descripcion') as string;

  const destinoIdRaw = formData.get('centro_destino_id') as string;
  const centro_destino_id =
    tipo === 'transferencia'
      ? !destinoIdRaw || destinoIdRaw === 'none'
        ? null
        : destinoIdRaw
      : null;

  if (!id || !tipo || !monto || !moneda || !centro_de_costos_id) {
    console.error('Faltan campos requeridos en actualización');
    return;
  }

  // Recupera la transacción original para comparar cambios que afecten stock
  const { data: oldTx } = await supabase
    .from('transacciones')
    .select('*')
    .eq('id', id)
    .single();

  if (!oldTx) {
    console.error('No se encontró la transacción original');
    return;
  }

  const ignorar_balance = formData.get('ignorar_balance') === 'on';

  const payload = {
    tipo,
    monto,
    moneda,
    centro_de_costos_id,
    centro_destino_id,
    descripcion,
    ignorar_balance: tipo === 'gasto' ? ignorar_balance : false,
  };

  const { error } = await supabase
    .from('transacciones')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error(error.message);
    return;
  }

  // Reconciliar stock si el tipo de movimiento cambió y está asociado a un producto
  if (oldTx.producto_id && oldTx.tipo !== tipo) {
    const { data: prod } = await supabase
      .from('productos')
      .select('stock, estado')
      .eq('id', oldTx.producto_id)
      .single();

    if (prod) {
      let stockChange = 0;

      // Reversar efecto del tipo de transacción anterior
      if (oldTx.tipo === 'venta') stockChange += 1;
      else if (oldTx.tipo === 'compra') stockChange -= 1;

      // Aplicar efecto del nuevo tipo de transacción
      if (tipo === 'venta') stockChange -= 1;
      else if (tipo === 'compra') stockChange += 1;

      if (stockChange !== 0) {
        const newStock = Math.max(0, prod.stock + stockChange);
        let newEstado = prod.estado;

        if (newStock === 0) newEstado = 'vendido';
        else if (newStock > 0 && prod.estado === 'vendido') {
          newEstado = 'disponible';
        }

        await supabase
          .from('productos')
          .update({ stock: newStock, estado: newEstado })
          .eq('id', oldTx.producto_id);
      }
    }
  }

  // Reload cache globally
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finanzas');
  revalidatePath('/productos');

  redirect('/dashboard/finanzas');
}
