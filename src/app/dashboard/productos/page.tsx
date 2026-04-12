import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';
import { Plus } from 'lucide-react';
import { getActiveExchangeRate } from '@/utils/currency';
import Link from 'next/link';
import { ProductsDataTable } from '@/components/dashboard/ProductsDataTable';

export default async function ProductosMasterPage() {
  const supabase = createClient();
  const exchangeRate = await getActiveExchangeRate(supabase);

  const { data: productos } = await supabase
    .from('productos')
    .select(
      `
      *,
      categorias(nombre),
      producto_fotos(url),
      transacciones(id),
      producto_variantes(id, talle, stock)
    `
    )
    .order('fecha_carga', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de productos y catálogo principal.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Listado de Productos</CardTitle>
          <CardDescription>
            Manejo de stock y visibilidad del catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsDataTable
            data={productos || []}
            exchangeRate={exchangeRate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
