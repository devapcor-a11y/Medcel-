import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          DigiBrain <span className="text-primary">PYME</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Plataforma de gestión integral para venta de tecnología. Maneja
          inventario, ventas, y balances entre socios de manera simple y
          eficiente.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/login">
              Ingresar al Panel <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full bg-card px-8 text-card-foreground"
          >
            <Link href="/catalogo">Ver Catálogo Público</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
