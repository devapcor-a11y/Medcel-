'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function updateUsuario(formData: FormData) {
  const supabase = createClient();
  const id = formData.get('id') as string;
  const nombre = formData.get('nombre') as string;
  const centro_de_costos_id = formData.get('centro_de_costos_id') as string;

  const newPassword = formData.get('password') as string;

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

  if (newPassword && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const rawSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
    const { error: passError } = await rawSupabase.auth.admin.updateUserById(
      id,
      {
        password: newPassword,
      }
    );
    if (passError) {
      console.error('Error actualizando contraseña', passError);
    }
  }

  revalidatePath('/dashboard/usuarios');
}

export async function createUsuario(formData: FormData) {
  const ssrSupabase = createClient();
  const rawSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nombre = formData.get('nombre') as string;
  const centro_de_costos_id = formData.get('centro_de_costos_id') as string;

  let authId: string | undefined;

  // Intentar crear mediante API de Admin si está la Service Role Key,
  // sino mediante signUp tradicional.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data, error } = await rawSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error('Error creando usuario via Admin API:', error);
      return { error: error.message };
    }
    authId = data.user.id;
  } else {
    const { data, error } = await rawSupabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error('Error registrando usuario:', error);
      return { error: error.message };
    }
    authId = data.user?.id;
  }

  if (!authId) {
    return {
      error:
        'No se pudo generar el usuario. Es posible que el correo ya esté en uso o que las confirmaciones por email estén activadas en Supabase impidiendo el registro directo.',
    };
  }

  const updateData: any = { nombre };
  if (centro_de_costos_id && centro_de_costos_id !== 'null') {
    updateData.centro_de_costos_id = centro_de_costos_id;
  }

  // Pequeño delay ampliado para permitir que el trigger en BD cree el profile
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { error: profileError } = await ssrSupabase
    .from('profiles')
    .update(updateData)
    .eq('id', authId);

  if (profileError) {
    console.error(
      'Error actualizando el perfil del nuevo usuario:',
      profileError
    );
  }

  revalidatePath('/dashboard/usuarios');
  return { success: true };
}
