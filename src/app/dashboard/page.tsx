import { createClient } from '@/utils/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { fetchExchangeRate, formatArs, formatUsd } from '@/utils/currency';
import { ArrowRightLeft, DollarSign, Store, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createClient();
  const exchangeRate = await fetchExchangeRate('blue');

  // Fetch balances, stats, etc
  // To avoid breaking without seeds, using defensive fetching
  const { data: centros_de_costos } = await supabase
    .from('centros_de_costos')
    .select('*');
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(5);
  const { count: productos_count } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'disponible');

  // Basic mock calculations initially if no data
  const cajas = centros_de_costos || [];
  const trans = transacciones || [];

  // Calculate Tricount simple logic assuming 50/50 balance of total pool
  // Calculate raw balances in ARS (converting all USD inputs to ARS at current rate just for simplification of total equity)
  let totalPool = 0;
  const balancesPorCaja: Record<
    string,
    { id: string; nombre: string; ars: number }
  > = {};

  cajas.forEach((caja) => {
    balancesPorCaja[caja.id] = { id: caja.id, nombre: caja.nombre, ars: 0 };
  });

  // Since we don't have SQL aggregation implemented yet, let's just show an example
  // Normally you'd aggregate SUM(monto) by type and caja

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Resumen General
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cotización Dólar Blue: Compra: {formatArs(exchangeRate.compra)} /
          Venta: {formatArs(exchangeRate.venta)}
        </p>
      </div>

      {cajas.length === 0 ? (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="font-medium text-destructive">
              Aún no hay centros de costos creados. Ve a la Configuración y de
              la base de datos para seedear cajas.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cajas.map((caja) => (
          <Card key={caja.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Caja: {caja.nombre}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$0.00</div>
              <p className="pt-1 text-xs text-muted-foreground">
                Eq. USD: U$S 0.00
              </p>
            </CardContent>
          </Card>
        ))}

        <Card className="border-primary/20 bg-primary/5 shadow-sm lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-primary">
              Balance de Socios
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground">
              Están equilibrados
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              No hay deudas pendientes entre cajas
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 h-8 w-full text-xs"
            >
              Registrar Liquidación
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos 5 movimientos financieros</CardDescription>
          </CardHeader>
          <CardContent>
            {trans.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
                <Activity className="mb-2 h-8 w-8 text-muted-foreground/30" />
                No hay transacciones registradas
              </div>
            ) : (
              <div className="space-y-4">
                {trans.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {t.descripcion || t.tipo}
                      </span>
                      <span className="text-xs capitalize text-muted-foreground">
                        {t.tipo} - {new Date(t.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${t.tipo === 'venta' ? 'text-green-600' : t.tipo === 'gasto' || t.tipo === 'compra' ? 'text-destructive' : 'text-primary'}`}
                    >
                      {t.tipo === 'gasto' || t.tipo === 'compra' ? '-' : '+'}
                      {t.moneda === 'USD' ? 'u$s' : '$'} {t.monto}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Catálogo Público</CardTitle>
            <CardDescription>Resumen de inventario activo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-100 text-primary dark:bg-orange-950/20">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <span className="text-3xl font-bold">
                  {productos_count || 0}
                </span>
                <p className="text-sm text-muted-foreground">
                  Productos disponibles
                </p>
              </div>
            </div>
            <Button asChild className="mt-6 w-full" variant="secondary">
              <Link href="/catalogo">Ir al Catálogo Público</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
