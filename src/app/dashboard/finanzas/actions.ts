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

  const payload = {
    tipo,
    monto,
    moneda,
    centro_de_costos_id,
    centro_destino_id,
    descripcion,
    producto_id,
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
  if (producto_id) revalidatePath('/catalogo');

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
      .select('stock')
      .eq('id', t.producto_id)
      .single();

    if (prod) {
      if (t.tipo === 'venta') {
        await supabase
          .from('productos')
          .update({ stock: prod.stock + 1, estado: 'disponible' })
          .eq('id', t.producto_id);
      } else if (t.tipo === 'compra') {
        await supabase
          .from('productos')
          .update({ stock: Math.max(0, prod.stock - 1) })
          .eq('id', t.producto_id);
      }
    }
    revalidatePath('/catalogo');
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

  const payload = {
    tipo,
    monto,
    moneda,
    centro_de_costos_id,
    centro_destino_id,
    descripcion,
  };

  const { error } = await supabase
    .from('transacciones')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error(error.message);
    return;
  }

  // Reload cache globally
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finanzas');
  revalidatePath('/catalogo');

  redirect('/dashboard/finanzas');
}
