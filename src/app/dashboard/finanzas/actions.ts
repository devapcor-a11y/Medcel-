'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
  const producto_id = (formData.get('producto_id') as string) || null;

  if (!tipo || !monto || !moneda || !centro_de_costos_id) {
    console.error('Faltan campos requeridos');
    return;
  }

  const payload = {
    tipo,
    monto,
    moneda,
    centro_de_costos_id,
    descripcion,
    producto_id,
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
