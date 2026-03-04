'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUsuario(formData: FormData) {
  const supabase = createClient();
  const id = formData.get('id') as string;
  const nombre = formData.get('nombre') as string;
  const centro_de_costos_id = formData.get('centro_de_costos_id') as string;

  const updateData: any = { nombre };
  if (centro_de_costos_id && centro_de_costos_id !== 'null') {
    updateData.centro_de_costos_id = centro_de_costos_id;
  } else {
    updateData.centro_de_costos_id = null;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating profile', error);
  }

  revalidatePath('/dashboard/usuarios');
}
