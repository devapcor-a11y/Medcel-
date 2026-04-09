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
  formatArs,
  formatUsd,
} from '@/utils/currency';
import { ArrowRightLeft, DollarSign, Store, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createClient();
  const exchangeRate = await getActiveExchangeRate(supabase);

  // Fetch balances, stats, etc
  // To avoid breaking without seeds, using defensive fetching
  const { data: centros_de_costos } = await supabase
    .from('centros_de_costos')
    .select('*');
  const { data: transacciones } = await supabase
    .from('transacciones')
    .select('*, productos(nombre, categorias(nombre))')
    .order('fecha', { ascending: true }); // Fetch Ascending for FIFO calculations
  const { count: productos_count } = await supabase
    .from('productos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'disponible');

  const cajas = centros_de_costos || [];
  const trans = transacciones || [];
  const transDesc = [...trans].reverse(); // Recientes in Descending
  const recientes = transDesc.slice(0, 5);

  // Sesterce / Tricount logic
  const aportes: Record<string, number> = {};
  cajas.forEach((c) => (aportes[c.id] = 0));

  trans.forEach((t) => {
    // Fallback to current rate only if not historically saved
    const storedRate = t.cotizacion_usd || exchangeRate.venta;
    const montoUsd = t.moneda === 'ARS' ? t.monto / storedRate : t.monto;

    if (t.tipo === 'compra' || t.tipo === 'gasto') {
      if (aportes[t.centro_de_costos_id] !== undefined) {
        aportes[t.centro_de_costos_id] += montoUsd;
      }
    } else if (t.tipo === 'venta') {
      if (aportes[t.centro_de_costos_id] !== undefined) {
        aportes[t.centro_de_costos_id] -= montoUsd;
      }
    } else if (t.tipo === 'transferencia') {
      if (aportes[t.centro_de_costos_id] !== undefined) {
        aportes[t.centro_de_costos_id] += montoUsd; // remitente
      }
      if (t.centro_destino_id && aportes[t.centro_destino_id] !== undefined) {
        aportes[t.centro_destino_id] -= montoUsd; // destinatario
      }
    }
  });

  const totalAportes = Object.values(aportes).reduce(
    (acc, val) => acc + val,
    0
  );
  const cuota = cajas.length > 0 ? totalAportes / cajas.length : 0;

  const balances = cajas.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    netoHistorico: aportes[c.id],
    balance: aportes[c.id] - cuota, // positivo = le deben, negativo = debe
  }));

  // Debt matching
  let debtors = balances
    .filter((b) => b.balance < -1)
    .sort((a, b) => a.balance - b.balance);
  let creditors = balances
    .filter((b) => b.balance > 1)
    .sort((a, b) => b.balance - a.balance);
  const deudasPendientes: string[] = [];

  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

    if (amount > 1) {
      deudasPendientes.push(
        `${debtor.nombre} le debe ${formatUsd(amount)} a ${creditor.nombre}`
      );
    }
    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 1) d++;
    if (creditor.balance < 1) c++;
  }

  // Profit calculations (Rentabilidad) - Always in USD equivalent for stable metric
  let totalIngresosUsd = 0;
  let totalEgresosUsd = 0;

  // FIFO Queue per product: { product_id: number[] (prices in USD) }
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
    // Current tx value in USD based on exact moment if saved
    const storedRate = t.cotizacion_usd || exchangeRate.venta;
    const valueUsd = t.moneda === 'USD' ? t.monto : t.monto / storedRate;

    if (t.tipo === 'venta') totalIngresosUsd += valueUsd;
    if (t.tipo === 'compra' || (t.tipo === 'gasto' && !t.ignorar_balance)) totalEgresosUsd += valueUsd;

    // Unitary Profit FIFO logic (Only applies if transaction has a linked product)
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
        // Add cost to the queue
        productFifo[t.producto_id].push(valueUsd);
      } else if (t.tipo === 'venta') {
        // Match against oldest cost
        const acquiredCost = productFifo[t.producto_id].shift() || 0;
        // Profit = Sale Price - Acquired Cost
        const profit = valueUsd - acquiredCost;
        productProfits[t.producto_id].utilidadUsd += profit;

        // Category grouping logic
        // @ts-ignore
        const catName = t.productos?.categorias?.nombre || 'Sin Categoría';
        if (!categoryProfits[catName]) {
          categoryProfits[catName] = { nombre: catName, utilidadUsd: 0 };
        }
        categoryProfits[catName].utilidadUsd += profit;
      }
    }
  });

  const rentabilidadNetaUsd = totalIngresosUsd - totalEgresosUsd;
  const profitableProducts = Object.values(productProfits).sort(
    (a, b) => b.utilidadUsd - a.utilidadUsd
  );
  const profitableCategories = Object.values(categoryProfits).sort(
    (a, b) => b.utilidadUsd - a.utilidadUsd
  );

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
        {cajas.map((caja) => {
          const stats = balances.find((b) => b.id === caja.id);
          const cajaBalance = stats ? -stats.netoHistorico : 0;
          return (
            <Card key={caja.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Caja: {caja.nombre}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatUsd(cajaBalance)}
                </div>
                <p className="pt-1 text-xs text-muted-foreground">
                  Eq. ARS: {formatArs(cajaBalance * exchangeRate.venta)}
                </p>
              </CardContent>
            </Card>
          );
        })}

        <Card className="border-primary/20 bg-primary/5 shadow-sm lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-primary">
              Balance de Socios
            </CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {deudasPendientes.length === 0 ? (
              <>
                <div className="text-xl font-bold tracking-tight text-foreground">
                  Están equilibrados
                </div>
                <p className="pt-1 text-xs text-muted-foreground">
                  No hay deudas pendientes entre cajas
                </p>
              </>
            ) : (
              <div className="space-y-2">
                {deudasPendientes.map((deuda, i) => (
                  <div
                    key={i}
                    className="text-sm font-medium leading-none text-foreground"
                  >
                    • {deuda}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 shadow-sm md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos 5 movimientos financieros</CardDescription>
          </CardHeader>
          <CardContent>
            {recientes.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
                <Activity className="mb-2 h-8 w-8 text-muted-foreground/30" />
                No hay transacciones registradas
              </div>
            ) : (
              <div className="space-y-4">
                {recientes.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4">
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate text-sm font-medium" title={t.descripcion || t.tipo}>
                        {t.descripcion || t.tipo}
                      </span>
                      <span className="truncate text-xs capitalize text-muted-foreground">
                        {t.tipo} - {new Date(t.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`flex-shrink-0 whitespace-nowrap text-sm font-bold ${t.tipo === 'venta' ? 'text-green-600' : t.tipo === 'gasto' || t.tipo === 'compra' ? 'text-destructive' : 'text-primary'}`}
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

        <Card className="col-span-1 shadow-sm md:col-span-2 lg:col-span-3">
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
              <Link href="/productos">Ir al Catálogo Público</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Rentabilidad General</CardTitle>
            <CardDescription>
              Balance total (Ventas - Costos/Compras) calculado en USD
              equivalentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ingresos (Ventas)</span>
              <span className="font-semibold text-green-600">
                {formatUsd(totalIngresosUsd)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Egresos (Compras + Gastos)
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
              Margen de ganancia histórico emparejando compras y ventas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profitableProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay historial de ventas de productos registrados.
              </p>
            ) : (
              <div className="max-h-[200px] space-y-3 overflow-y-auto pr-2">
                {profitableProducts.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 gap-4"
                  >
                    <span className="truncate text-sm font-medium flex-1 min-w-0" title={p.nombre}>
                      {p.nombre}
                    </span>
                    <span
                      className={`whitespace-nowrap text-sm font-bold flex-shrink-0 ${p.utilidadUsd >= 0 ? 'text-green-600' : 'text-destructive'}`}
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
              Margen de ganancia directo desde ramas de catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profitableCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay historial de ventas categorizadas registradas.
              </p>
            ) : (
              <div className="max-h-[200px] space-y-3 overflow-y-auto pr-2">
                {profitableCategories.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 gap-4"
                  >
                    <span className="truncate text-sm font-medium flex-1 min-w-0" title={p.nombre}>
                      {p.nombre}
                    </span>
                    <span
                      className={`whitespace-nowrap text-sm font-bold flex-shrink-0 ${p.utilidadUsd >= 0 ? 'text-green-600' : 'text-destructive'}`}
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
    </div>
  );
}
