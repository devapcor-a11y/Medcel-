'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addCategory(formData: FormData) {
  const supabase = createClient();
  const nombre = formData.get('nombre') as string;
  if (!nombre) return;

  const slug = nombre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const { error } = await supabase
    .from('categorias')
    .insert([{ nombre, slug }]);

  if (error) return;

  revalidatePath('/dashboard/configuracion');
  revalidatePath('/productos');
}

export async function addTag(formData: FormData) {
  const supabase = createClient();
  const nombre = formData.get('nombre') as string;
  const color = (formData.get('color') as string) || '#e2e8f0';

  if (!nombre) return;
  const slug = nombre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const { error } = await supabase
    .from('etiquetas')
    .insert([{ nombre, slug, color }]);

  if (error) return;

  revalidatePath('/dashboard/configuracion');
  revalidatePath('/productos');
}

export async function updateStoreSettings(formData: FormData) {
  const supabase = createClient();

  const settings = [
    {
      clave: 'nombre_tienda',
      valor: JSON.stringify(formData.get('nombre_tienda')),
    },
    {
      clave: 'contacto_whatsapp',
      valor: JSON.stringify(formData.get('contacto_whatsapp')),
    },
    {
      clave: 'contacto_instagram',
      valor: JSON.stringify(formData.get('contacto_instagram')),
    },
    {
      clave: 'tipo_cambio_preferido',
      valor: JSON.stringify(formData.get('tipo_cambio_preferido')),
    },
  ];

  for (const setting of settings) {
    if (setting.valor && setting.valor !== 'null') {
      await supabase
        .from('configuracion')
        .upsert(setting, { onConflict: 'clave' });
    }
  }

  revalidatePath('/', 'layout');
}

export async function addCentroCostos(formData: FormData) {
  const supabase = createClient();
  const nombre = formData.get('nombre') as string;

  if (!nombre) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('centros_de_costos')
    .insert([{ nombre, usuario_id: user.id }]);

  if (error) {
    console.error('Error adding centro:', error);
    return;
  }

  revalidatePath('/dashboard/configuracion');
  revalidatePath('/dashboard/finanzas');
}
