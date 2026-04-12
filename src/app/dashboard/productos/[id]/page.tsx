import { createClient } from '@/utils/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil } from 'lucide-react';
import { formatUsd, formatArs, fetchExchangeRate } from '@/utils/currency';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ProductoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const exchangeRate = await fetchExchangeRate('blue');

  const { data: product } = await supabase
    .from('productos')
    .select('*, categorias(nombre), producto_variantes(talle, stock)')
    .eq('id', params.id)
    .single();

  if (!product) {
    notFound();
  }

  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*, caja:centro_de_costos_id(nombre)')
    .eq('producto_id', params.id)
    .order('fecha', { ascending: false });

  const historial = transacciones || [];
  const compras = historial.filter((t) => t.tipo === 'compra');
  const ventas = historial.filter((t) => t.tipo === 'venta');

  let totalComprasUsd = 0;
  let totalVentasUsd = 0;

  compras.forEach((c) => {
    const rate = c.cotizacion_usd || exchangeRate.venta;
    totalComprasUsd += c.moneda === 'USD' ? c.monto : c.monto / rate;
  });

  ventas.forEach((v) => {
    const rate = v.cotizacion_usd || exchangeRate.venta;
    totalVentasUsd += v.moneda === 'USD' ? v.monto : v.monto / rate;
  });

  const balanceProductoUsd = totalVentasUsd - totalComprasUsd;

  // Helpers
  const renderTable = (txs: typeof historial) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Caja</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Monto (USD)</TableHead>
            <TableHead className="text-right">
              Aprox. ARS (al momento)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {txs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No hay movimientos registrados de este tipo para el producto.
              </TableCell>
            </TableRow>
          ) : (
            txs.map((t) => {
              // Use stored cotizacion_usd if available to be accurate at that exact time, else fallback to current
              // (which is ok for recent ones but wrong for old ones. New transactions will bring it).
              const storedRate = t.cotizacion_usd || exchangeRate.venta;

              const usdVal =
                t.moneda === 'USD' ? t.monto : t.monto / storedRate;
              const arsVal =
                t.moneda === 'ARS' ? t.monto : t.monto * storedRate;

              return (
                <TableRow key={t.id}>
                  <TableCell>
                    {new Date(t.fecha).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{t.caja?.nombre || '-'}</TableCell>
                  <TableCell>{t.descripcion || '-'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatUsd(usdVal)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    Eq. {formatArs(arsVal)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/productos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {product.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">
            Detalle e historial completo del producto
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={`/dashboard/productos/editar/${product.id}`}>
            <Pencil className="mr-2 h-4 w-4" /> Editar Producto
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 text-sm text-muted-foreground">
            <CardTitle className="text-base font-medium text-foreground">
              Precio Ref. (USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.precio_usd ? formatUsd(product.precio_usd) : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-sm text-muted-foreground">
            <CardTitle className="text-base font-medium text-foreground">
              Estado y Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold">Total: {product.stock} un.</span>
                <Badge variant="outline">{product.estado}</Badge>
              </div>
              
              {product.producto_variantes && product.producto_variantes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                   {product.producto_variantes.map((v: any, i: number) => (
                     <Badge key={i} variant={v.stock > 0 ? 'secondary' : 'destructive'} className="font-mono">
                        Talle {v.talle}: {v.stock}
                     </Badge>
                   ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Sin detalle de talles.</div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-sm text-muted-foreground">
            <CardTitle className="text-base font-medium text-foreground">
              Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-medium">
              {product.categorias?.nombre || '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-sm text-muted-foreground">
            <CardTitle className="text-base font-medium text-foreground">
              Agregado el
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {new Date(product.fecha_carga).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="pb-2 text-sm text-muted-foreground">
          <CardTitle className="text-base font-bold text-primary">
            Balance del Producto (Ganancia/Pérdida)
          </CardTitle>
          <CardDescription>
            Suma total de {ventas.length} ventas - {compras.length} compras en
            valores dolarizados o equivalentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col space-y-1 text-sm">
              <span className="text-muted-foreground">
                Total Ventas (Ingresos):{' '}
                <strong className="text-green-600">
                  {formatUsd(totalVentasUsd)}
                </strong>
              </span>
              <span className="text-muted-foreground">
                Total Compras (Inversión):{' '}
                <strong className="text-destructive">
                  {formatUsd(totalComprasUsd)}
                </strong>
              </span>
            </div>
            <div
              className={`text-3xl font-bold ${balanceProductoUsd > 0 ? 'text-green-600' : balanceProductoUsd < 0 ? 'text-destructive' : 'text-foreground'}`}
            >
              {balanceProductoUsd > 0 ? '+' : ''}
              {formatUsd(balanceProductoUsd)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial Financiero del Producto</CardTitle>
          <CardDescription>
            Rendimiento detallado cruzado con tu sistema de cajas y
            transacciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ventas" className="w-full">
            <TabsList className="mb-4 grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="ventas">
                Ventas Registradas ({ventas.length})
              </TabsTrigger>
              <TabsTrigger value="compras">
                Compras Registradas ({compras.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ventas">{renderTable(ventas)}</TabsContent>
            <TabsContent value="compras">{renderTable(compras)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
