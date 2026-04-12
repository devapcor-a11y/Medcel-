import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import EditarProductoForm from '@/components/dashboard/EditarProductoForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditarProductoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: producto } = await supabase
    .from('productos')
    .select(
      `
      *,
      productos_etiquetas(etiqueta_id),
      producto_fotos(url, orden),
      producto_variantes(id, talle, stock, color)
    `
    )
    .eq('id', params.id)
    .single();

  if (!producto) {
    redirect('/dashboard/productos');
  }

  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre');
  const { data: etiquetas } = await supabase
    .from('etiquetas')
    .select('*')
    .order('nombre');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Editar Producto
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Actualiza el inventario y detalles publicos online.
          </p>
        </div>
      </div>

      <EditarProductoForm
        producto={producto}
        categorias={categorias || []}
        etiquetas={etiquetas || []}
      />
    </div>
  );
}
