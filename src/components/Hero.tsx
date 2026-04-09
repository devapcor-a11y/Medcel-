'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 lg:py-32">
      {/* Background patterns */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--secondary)_0%,transparent_100%)] opacity-20" />
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Diseños que inspiran confianza</span>
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl xl:text-7xl">
              Tu esencia en cada <span className="text-primary italic">detalle médico</span>.
            </h1>
            
            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              Ambos y cofias de alta calidad con diseños personalizados que reflejan tu profesionalismo y personalidad. Comodidad que te acompaña en cada guardia.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Link href="/productos">
                  Explorar Colección <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-2 px-8 text-base transition-all hover:bg-secondary hover:text-secondary-foreground">
                <Link href="/personalizar">
                  Personalizar mi Cofia
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">500+</span>
                <span className="text-sm text-muted-foreground">Diseños Únicos</span>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">100%</span>
                <span className="text-sm text-muted-foreground">Calidad Premium</span>
              </div>
            </div>
          </div>
          
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/20 via-secondary/40 to-accent/20 blur-2xl" />
            <div className="relative h-full overflow-hidden rounded-3xl border bg-card/50 backdrop-blur-sm">
              {/* Image Placeholder */}
              <div className="flex h-full items-center justify-center p-12">
                <div className="grid grid-cols-2 gap-4 h-full w-full">
                  <div className="rounded-2xl bg-primary/20 flex flex-col items-center justify-center p-6 text-primary">
                    <span className="text-xl font-bold mb-2">Ambos</span>
                    <div className="w-16 h-1 w-full bg-primary/30 rounded-full" />
                  </div>
                  <div className="rounded-2xl bg-accent/20 flex flex-col items-center justify-center p-6 text-accent-foreground">
                    <span className="text-xl font-bold mb-2">Cofias</span>
                    <div className="w-16 h-1 w-full bg-accent/30 rounded-full" />
                  </div>
                  <div className="col-span-2 rounded-2xl bg-secondary flex flex-col items-center justify-center p-6 text-secondary-foreground">
                    <span className="text-2xl font-bold mb-2">Personalizados</span>
                    <p className="text-center text-sm">Tu nombre o logo aquí</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -bottom-6 -left-6 rounded-2xl border bg-background p-4 shadow-xl animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Diseño Nuevo</span>
                  <span className="text-xs text-muted-foreground">Disponible ahora</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
