import { createClient } from '@/utils/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import EditarTransaccionForm from '@/components/dashboard/EditarTransaccionForm';

export default async function EditarTransaccionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { data: transaccion, error } = await supabase
    .from('transacciones')
    .select('*, productos(nombre)')
    .eq('id', params.id)
    .single();

  if (error || !transaccion) {
    console.error(error);
    notFound();
  }

  // Fetch Cajas mapping
  const { data: cajas } = await supabase
    .from('centros_de_costos')
    .select('id, nombre');

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
            Editar Transacción
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(transaccion.fecha).toLocaleString()}
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <EditarTransaccionForm
          cajas={cajas || []}
          productos={[]}
          transaccion={transaccion}
        />
      </Card>
    </div>
  );
}
