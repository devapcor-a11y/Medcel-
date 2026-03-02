import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/utils/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { formatArs } from '@/utils/currency';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProductosMasterPage() {
  const supabase = createClient();

  const { data: productos } = await supabase
    .from('productos')
    .select(
      `
      *,
      categorias(nombre),
      producto_fotos(url)
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
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Img</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Precio ARS</TableHead>
                  <TableHead className="text-right">Precio USD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!productos || productos.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No hay productos en inventario.
                    </TableCell>
                  </TableRow>
                ) : (
                  productos.map((prod) => {
                    const thumbnail = prod.producto_fotos?.[0]?.url;
                    return (
                      <TableRow key={prod.id}>
                        <TableCell>
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={prod.nombre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="line-clamp-2 max-w-[200px] font-medium">
                          {prod.nombre}
                        </TableCell>
                        <TableCell>{prod.categorias?.nombre || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              prod.estado === 'disponible'
                                ? 'border-primary bg-primary/10 text-primary'
                                : prod.estado === 'vendido'
                                  ? 'border-destructive bg-destructive/10 text-destructive'
                                  : 'border-yellow-500 bg-yellow-50 text-yellow-600'
                            }
                          >
                            {prod.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {prod.precio_ars ? formatArs(prod.precio_ars) : '-'}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {prod.precio_usd ? `U$S ${prod.precio_usd}` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
