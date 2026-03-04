import { createClient } from '@/utils/supabase/server';
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
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatArs, formatUsd } from '@/utils/currency';
import DeleteTransactionButton from '@/components/dashboard/DeleteTransactionButton';

export default async function FinanzasPage() {
  const supabase = createClient();

  // Fetch Transacciones
  const { data: transacciones, error } = await supabase
    .from('transacciones')
    .select(
      `
      *,
      caja:centro_de_costos_id(nombre),
      caja_destino:centro_destino_id(nombre),
      productos(nombre)
    `
    )
    .order('fecha', { ascending: false })
    .limit(50); // Simple pagination for now

  if (error) {
    console.error('Error fetching transactions:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Finanzas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registro global de movimientos, ventas y gastos.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/finanzas/nueva">
            <Plus className="mr-2 h-4 w-4" /> Nueva Transacción
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>
            Últimas 50 transacciones registradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Caja</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!transacciones || transacciones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No hay transacciones registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  transacciones.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
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
                      <TableCell>{t.caja?.nombre}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{t.descripcion || '-'}</span>
                          {t.productos?.nombre && (
                            <span className="line-clamp-1 text-xs text-muted-foreground">
                              Ref: {t.productos.nombre}
                            </span>
                          )}
                          {t.caja_destino && (
                            <span className="text-[10px] text-muted-foreground">
                              Destino: {t.caja_destino?.nombre}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {t.moneda === 'ARS'
                          ? formatArs(t.monto)
                          : formatUsd(t.monto)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/finanzas/editar/${t.id}`}>
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </Button>
                          <DeleteTransactionButton id={t.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
