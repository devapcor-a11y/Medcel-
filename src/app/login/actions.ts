'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function login(formData: FormData) {
  const supabase = createClient();

  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  let email = identifier;

  // Si no parece un correo electronico, buscar el correo por el nombre en perfiles
  if (!identifier.includes('@')) {
    const rawSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile } = await rawSupabase
      .from('profiles')
      .select('email')
      .ilike('nombre', identifier)
      .single();

    if (profile && profile.email) {
      email = profile.email;
    } else {
      redirect('/login?error=Usuario no encontrado');
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect('/login?error=Credenciales inválidas');
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
