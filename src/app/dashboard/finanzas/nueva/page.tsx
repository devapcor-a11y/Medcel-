import { createClient } from '@/utils/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTransaction } from '@/app/dashboard/finanzas/actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NuevaTransaccionPage() {
  const supabase = createClient();

  // Fetch Cajas mapping
  const { data: cajas } = await supabase
    .from('centros_de_costos')
    .select('id, nombre');

  // Fetch available products to link a transaction
  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, precio_ars, precio_usd')
    .eq('estado', 'disponible')
    .order('nombre');

  if (!cajas || cajas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="mb-2 text-xl font-bold">
          No tienes cajas configuradas.
        </h2>
        <p className="mb-4 text-muted-foreground">
          Debes agregar Cajas / Centros de Costos en la base de datos o desde
          Configuración antes de registrar movimientos.
        </p>
        <Button asChild>
          <Link href="/dashboard/configuracion">Ir a Configuración</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/finanzas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nueva Transacción
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registrar un ingreso, gasto o venta de producto.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <form action={createTransaction}>
          <CardHeader>
            <CardTitle>Detalles del Movimiento</CardTitle>
            <CardDescription>
              Completa los campos con cuidado. Una vez registrado, podrás verlo
              en el historial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Movimiento</Label>
                <Select name="tipo" defaultValue="venta" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venta">Venta (Ingreso)</SelectItem>
                    <SelectItem value="compra">Compra (Egreso)</SelectItem>
                    <SelectItem value="gasto">
                      Gasto / Operativo (Egreso)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="centro_de_costos_id">Caja Afectada</Label>
                <Select
                  name="centro_de_costos_id"
                  required
                  defaultValue={cajas[0]?.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Caja" />
                  </SelectTrigger>
                  <SelectContent>
                    {cajas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto numérico</Label>
                <Input
                  name="monto"
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda de Pago</Label>
                <Select name="moneda" defaultValue="ARS" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="producto_id">Producto Asociado (Opcional)</Label>
              <Select name="producto_id">
                <SelectTrigger>
                  <SelectValue placeholder="Elegir producto..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="">Ninguno</SelectItem>
                  {productos?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Si relacionas una venta a un producto, éste cambiará a estado
                'vendido' automáticamente.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción / Notas</Label>
              <Input
                name="descripcion"
                id="descripcion"
                placeholder="Ej: Venta auricular bluetooth a Juan"
              />
            </div>

            <Button type="submit" className="mt-6 w-full">
              Confirmar Transacción
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
