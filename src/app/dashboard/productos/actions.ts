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
  const catParam = formData.get('categoria_id') as string;
  const categoria_id = !catParam || catParam === 'none' ? null : catParam;
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
  const talles = formData.getAll('talles[]') as string[];
  const stocks = formData.getAll('stocks[]') as string[];

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
    stock: stocks.reduce((acc, current) => acc + parseInt(current || '0', 10), 0),
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

  // 4. Insert variantes (Talles y cant)
  if (talles.length > 0) {
    const pVariantes = talles.map((talle, i) => ({
      producto_id,
      talle: talle || 'Único',
      stock: parseInt(stocks[i] || '0', 10)
    }));
    await supabase.from('producto_variantes').insert(pVariantes);
  }

  revalidatePath('/dashboard/productos');
  revalidatePath('/productos');

  redirect('/dashboard/productos');
}

export async function updateProduct(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const id = formData.get('id') as string;
  const nombre = formData.get('nombre') as string;
  const descripcion = formData.get('descripcion') as string;
  const catParam = formData.get('categoria_id') as string;
  const categoria_id = !catParam || catParam === 'none' ? null : catParam;
  const precio_ars = formData.get('precio_ars')
    ? parseFloat(formData.get('precio_ars') as string)
    : null;
  const precio_usd = formData.get('precio_usd')
    ? parseFloat(formData.get('precio_usd') as string)
    : null;
  const estado = formData.get('estado') as string;

  // Extract photo URLs and tags
  const etiquetas = formData.getAll('etiquetas[]') as string[];
  const fotosUrls = formData.getAll('fotos[]') as string[];

  if (!id || !nombre || (!precio_ars && !precio_usd)) {
    return { error: 'Nombre y al menos un precio son requeridos.' };
  }

  const payload = {
    nombre,
    descripcion,
    categoria_id,
    precio_ars,
    precio_usd,
    estado,
  };

  // 1. Update product
  const { error: prodErr } = await supabase
    .from('productos')
    .update(payload)
    .eq('id', id);

  if (prodErr) {
    return { error: prodErr?.message || 'Error updating product' };
  }

  // 2. Update tags (delete old, insert new)
  await supabase.from('productos_etiquetas').delete().eq('producto_id', id);
  if (etiquetas.length > 0) {
    const pEtiquetas = etiquetas.map((etiqueta_id) => ({
      producto_id: id,
      etiqueta_id,
    }));
    await supabase.from('productos_etiquetas').insert(pEtiquetas);
  }

  // 3. Update photos (delete old, insert new)
  await supabase.from('producto_fotos').delete().eq('producto_id', id);
  if (fotosUrls.length > 0) {
    const pFotos = fotosUrls.map((url, i) => ({
      producto_id: id,
      url,
      orden: i,
    }));
    await supabase.from('producto_fotos').insert(pFotos);
  }

  revalidatePath('/dashboard/productos');
  revalidatePath('/productos');

  redirect('/dashboard/productos');
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  // Check if product is linked to any transaction
  const { count } = await supabase
    .from('transacciones')
    .select('id', { count: 'exact', head: true })
    .eq('producto_id', id);

  if (count && count > 0) {
    return {
      error:
        'No se puede eliminar porque tiene transacciones asociadas. Cambia su estado a Reservado en su edición.',
    };
  }

  // Delete tags and photos first relying on CASCADE or manual if no CASCADE
  const { error } = await supabase.from('productos').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/productos');
  revalidatePath('/productos');
  return { success: true };
}
