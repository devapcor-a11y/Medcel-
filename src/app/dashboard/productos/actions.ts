'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const nombre = formData.get('nombre') as string;
  const descripcion = formData.get('descripcion') as string;
  const categoria_id = (formData.get('categoria_id') as string) || null;
  const precio_ars = formData.get('precio_ars')
    ? parseFloat(formData.get('precio_ars') as string)
    : null;
  const precio_usd = formData.get('precio_usd')
    ? parseFloat(formData.get('precio_usd') as string)
    : null;
  const estado = formData.get('estado') as string;

  // Extract photo URLs and tags (these need to be processed on client first and passed as strings)
  const etiquetas = formData.getAll('etiquetas[]') as string[];
  const fotosUrls = formData.getAll('fotos[]') as string[];

  if (!nombre || (!precio_ars && !precio_usd)) {
    return { error: 'Nombre y al menos un precio son requeridos.' };
  }

  // 1. Insert product
  const payload = {
    nombre,
    descripcion,
    categoria_id,
    precio_ars,
    precio_usd,
    estado,
    created_by: user.id,
  };

  const { data: prodData, error: prodErr } = await supabase
    .from('productos')
    .insert([payload])
    .select('id')
    .single();

  if (prodErr || !prodData) {
    return { error: prodErr?.message || 'Error creating product' };
  }

  const producto_id = prodData.id;

  // 2. Insert tags
  if (etiquetas.length > 0) {
    const pEtiquetas = etiquetas.map((id) => ({
      producto_id,
      etiqueta_id: id,
    }));
    await supabase.from('productos_etiquetas').insert(pEtiquetas);
  }

  // 3. Insert photos
  if (fotosUrls.length > 0) {
    const pFotos = fotosUrls.map((url, i) => ({ producto_id, url, orden: i }));
    await supabase.from('producto_fotos').insert(pFotos);
  }

  revalidatePath('/dashboard/productos');
  revalidatePath('/catalogo');

  redirect('/dashboard/productos');
}
