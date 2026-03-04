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
import NuevaTransaccionForm from '@/components/dashboard/NuevaTransaccionForm';

export default async function NuevaTransaccionPage() {
  const supabase = createClient();

  // Fetch Cajas mapping
  const { data: cajas } = await supabase
    .from('centros_de_costos')
    .select('id, nombre');

  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, precio_ars, precio_usd')
    .eq('estado', 'disponible')
    .order('nombre');

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre')
    .order('nombre');

  const { data: etiquetas } = await supabase
    .from('etiquetas')
    .select('id, nombre')
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
        <NuevaTransaccionForm
          cajas={cajas}
          productos={productos || []}
          categorias={categorias || []}
          etiquetas={etiquetas || []}
        />
      </Card>
    </div>
  );
}
