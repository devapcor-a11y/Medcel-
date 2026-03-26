import { createClient } from '@/utils/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  fetchExchangeRate,
  getActiveExchangeRate,
  formatUsd,
} from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BarChart as BarChartIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: { desde?: string; hasta?: string };
}) {
  const supabase = createClient();
  const exchangeRate = await getActiveExchangeRate(supabase);

  // Process dates
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (searchParams.desde) {
    fromDate = new Date(searchParams.desde + 'T00:00:00');
  }
  if (searchParams.hasta) {
    toDate = new Date(searchParams.hasta + 'T23:59:59');
  }

  // Fetch all transactions to calculate FIFO accurately
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*, productos(nombre, categorias(nombre))')
    .order('fecha', { ascending: true });

  const trans = transacciones || [];

  // Profit calculations
  let totalIngresosUsd = 0;
  let totalEgresosUsd = 0;
  const transactionsInRange: any[] = [];

  const productFifo: Record<string, number[]> = {};
  const productProfits: Record<
    string,
    { nombre: string; utilidadUsd: number }
  > = {};
  const categoryProfits: Record<
    string,
    { nombre: string; utilidadUsd: number }
  > = {};

  trans.forEach((t) => {
    const txDate = new Date(t.fecha);
    const isWithinRange =
      (!fromDate || txDate >= fromDate) && (!toDate || txDate <= toDate);

    const storedRate = t.cotizacion_usd || exchangeRate.venta;
    const valueUsd = t.moneda === 'USD' ? t.monto : t.monto / storedRate;

    // Ingresos and Egresos sums ONLY for the range
    if (isWithinRange) {
      transactionsInRange.push(t);
      if (t.tipo === 'venta') totalIngresosUsd += valueUsd;
      if (t.tipo === 'compra' || (t.tipo === 'gasto' && !t.ignorar_balance))
        totalEgresosUsd += valueUsd;
    }

    // Unitary Profit FIFO logic
    if (t.producto_id) {
      if (!productFifo[t.producto_id]) productFifo[t.producto_id] = [];
      if (!productProfits[t.producto_id]) {
        productProfits[t.producto_id] = {
          // @ts-ignore
          nombre: t.productos?.nombre || 'Producto sin nombre',
          utilidadUsd: 0,
        };
      }

      if (t.tipo === 'compra') {
        productFifo[t.producto_id].push(valueUsd);
      } else if (t.tipo === 'venta') {
        const acquiredCost = productFifo[t.producto_id].shift() || 0;
        const profit = valueUsd - acquiredCost;

        // ONLY record the profit if the sale happened in this range
        if (isWithinRange) {
          productProfits[t.producto_id].utilidadUsd += profit;

          // @ts-ignore
          const catName = t.productos?.categorias?.nombre || 'Sin Categoría';
          if (!categoryProfits[catName]) {
            categoryProfits[catName] = { nombre: catName, utilidadUsd: 0 };
          }
          categoryProfits[catName].utilidadUsd += profit;
        }
      }
    }
  });

  const rentabilidadNetaUsd = totalIngresosUsd - totalEgresosUsd;

  // Clean up products/categories with 0 profit in this range (to not clutter the UI)
  const profitableProducts = Object.values(productProfits)
    .filter((p) => Math.abs(p.utilidadUsd) > 0.01)
    .sort((a, b) => b.utilidadUsd - a.utilidadUsd);

  const profitableCategories = Object.values(categoryProfits)
    .filter((c) => Math.abs(c.utilidadUsd) > 0.01)
    .sort((a, b) => b.utilidadUsd - a.utilidadUsd);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/reportes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
            <BarChartIcon className="h-8 w-8 text-primary" />
            Reportes de Finanzas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rentabilidades desglosadas por intervalos de fecha personalizados.
          </p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-bold text-primary">
            Selector de Intervalo
          </CardTitle>
          <CardDescription>
            Si se dejan vacíos abarcará todo tu historial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col items-end gap-4 sm:flex-row">
            <div className="w-full flex-1 space-y-2">
              <Label htmlFor="desde">Desde la fecha:</Label>
              <Input
                type="date"
                id="desde"
                name="desde"
                defaultValue={searchParams.desde || ''}
              />
            </div>
            <div className="w-full flex-1 space-y-2">
              <Label htmlFor="hasta">Hasta la fecha:</Label>
              <Input
                type="date"
                id="hasta"
                name="hasta"
                defaultValue={searchParams.hasta || ''}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Generar Reporte
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Rentabilidad General</CardTitle>
            <CardDescription>
              Balance total para la fecha seleccionada. (Ventas - Costos)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Ingresos (Ventas ratificadas)
              </span>
              <span className="font-semibold text-green-600">
                {formatUsd(totalIngresosUsd)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Egresos (Surtidos y Gastos)
              </span>
              <span className="font-semibold text-destructive">
                {formatUsd(totalEgresosUsd)}
              </span>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  Beneficio Neto
                </span>
                <span
                  className={`text-xl font-bold ${rentabilidadNetaUsd >= 0 ? 'text-green-600' : 'text-destructive'}`}
                >
                  {rentabilidadNetaUsd > 0 ? '+' : ''}
                  {formatUsd(rentabilidadNetaUsd)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Rentabilidad por Producto (FIFO)</CardTitle>
            <CardDescription>
              Comportamiento del catálogo en las fechas{' '}
              {searchParams.desde || 'el principio'} -{' '}
              {searchParams.hasta || 'hoy'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profitableProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay rentabilidades directas generadas en este intervalo.
              </p>
            ) : (
              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                {profitableProducts.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-medium">{p.nombre}</span>
                    <span
                      className={`text-sm font-bold ${p.utilidadUsd >= 0 ? 'text-green-600' : 'text-destructive'}`}
                    >
                      {p.utilidadUsd >= 0 ? '+' : ''}
                      {formatUsd(p.utilidadUsd)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Rentabilidad por Categoría (FIFO)</CardTitle>
            <CardDescription>
              Margen de ganancias agrupadas por ramificaciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profitableCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay movimientos con categorías asignadas en el intervalo.
              </p>
            ) : (
              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                {profitableCategories.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-medium">{p.nombre}</span>
                    <span
                      className={`text-sm font-bold ${p.utilidadUsd >= 0 ? 'text-green-600' : 'text-destructive'}`}
                    >
                      {p.utilidadUsd >= 0 ? '+' : ''}
                      {formatUsd(p.utilidadUsd)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Detalle de Transacciones del Período</CardTitle>
          <CardDescription>
            Lista cronológica de los movimientos que componen este reporte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción / Ref</TableHead>
                  <TableHead className="text-right">
                    Monto Procesado (USD)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsInRange.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No hay transacciones en las fechas seleccionadas.
                    </TableCell>
                  </TableRow>
                ) : (
                  // Reversed to show the newest transactions on top
                  [...transactionsInRange].reverse().map((t) => {
                    const storedRate = t.cotizacion_usd || exchangeRate.venta;
                    const usdVal =
                      t.moneda === 'USD' ? t.monto : t.monto / storedRate;

                    return (
                      <TableRow key={t.id}>
                        <TableCell>
                          {new Date(t.fecha).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              t.tipo === 'venta'
                                ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-950/20'
                                : t.tipo === 'gasto' || t.tipo === 'compra'
                                  ? 'border-destructive bg-destructive/10 text-destructive'
                                  : 'border-primary bg-primary/10 text-primary'
                            }
                          >
                            {t.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{t.descripcion || '-'}</span>
                            {t.productos?.nombre && (
                              <span className="text-xs text-muted-foreground">
                                Prod: {t.productos.nombre}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatUsd(usdVal)}
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
