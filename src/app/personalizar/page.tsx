import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Palette, Scissors, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PersonalizarPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden bg-primary/5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.05)_0%,transparent_50%)]" />
          <div className="container mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6">
              Tu Estilo, <span className="text-primary text-glow">Tu Profesionalismo</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Creamos uniformes únicos adaptados a tu identidad. Desde bordados personalizados hasta diseños exclusivos para clínicas y equipos médicos.
            </p>
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1 bg-[#25D366] hover:bg-[#20bd5a] text-white">
              <MessageCircle className="mr-2 h-5 w-5" />
              Solicitar Presupuesto por WhatsApp
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-8 text-center">
                  <div className="mb-6 inline-flex p-4 rounded-3xl bg-primary/10 text-primary">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Bordados de Autor</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Añadimos tu nombre, especialidad o logo con hilos de alta resistencia y terminación premium.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-8 text-center">
                  <div className="mb-6 inline-flex p-4 rounded-3xl bg-accent/10 text-accent-foreground">
                    <Palette className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Colores Exclusivos</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Elige combinaciones de colores que representen tu marca personal o institucional.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-8 text-center">
                  <div className="mb-6 inline-flex p-4 rounded-3xl bg-secondary/10 text-primary">
                    <Scissors className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Corte a Medida</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Ajustamos talles o creamos moldería especial para equipos que buscan la perfección en el calce.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-secondary/30 border-y border-border/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">¿Trabajas en una clínica o consultorio?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Hacemos uniformes corporativos con descuentos por cantidad. Unificamos la imagen de tu equipo con la calidad de Medcel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="rounded-full border-2 border-primary text-primary hover:bg-primary/5">
                <Link href="/contacto">Contactar Ventas Mayoristas</Link>
              </Button>
              <Button asChild className="rounded-full bg-primary text-primary-foreground">
                <Link href="/productos">Ver Catálogo Base</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/50 bg-card">
        <div className="container mx-auto px-4 text-center">
           <p className="text-sm text-muted-foreground">© 2026 Medcel. Diseños que inspiran confianza.</p>
        </div>
      </footer>
    </div>
  );
}
