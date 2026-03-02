import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import NuevoProductoForm from '@/components/dashboard/NuevoProductoForm';

export default async function Page() {
  const supabase = createClient();
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre')
    .order('nombre');
  const { data: etiquetas } = await supabase
    .from('etiquetas')
    .select('id, nombre')
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
            Crear Producto
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            El producto se listará en el catálogo web si se marca como
            Disponible.
          </p>
        </div>
      </div>

      <NuevoProductoForm
        categorias={categorias || []}
        etiquetas={etiquetas || []}
      />
    </div>
  );
}
