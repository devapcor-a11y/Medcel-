import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, DollarSign, CalendarRange } from 'lucide-react';
import Link from 'next/link';

export default function ReportesIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <BarChart className="h-8 w-8 text-primary" />
          Reportes del Sistema
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seleccione el reporte que desea visualizar para analizar las finanzas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm transition-colors hover:border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarRange className="h-5 w-5 text-primary" />
              Finanzas a Fecha
            </CardTitle>
            <CardDescription>
              Analice la rentabilidad y balaces acotados por un rango de fechas
              custom, categorizando ingresos, egresos, y ganancias por producto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/reportes/finanzas">Abrir Reporte</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
