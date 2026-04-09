import { Navbar } from '@/components/Navbar';
import { Heart, Shield, Sparkles } from 'lucide-react';

export default function NosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-black mb-6">Sobre Medcel</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Nacimos para transformar el uniforme médico en una prenda de diseño, comodidad y expresión personal.
            </p>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Nuestra Historia</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Medcel comenzó con una idea simple: los profesionales de la salud pasan la mayor parte de su día en uniformes que suelen ser genéricos e incómodos. Quisimos cambiar eso.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Combinamos textiles de alta tecnología con diseños modernos y estampados vibrantes. Hoy, vestimos a cientos de profesionales que eligen destacar y sentirse bien mientras cuidan a los demás.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
               <div className="p-6 bg-secondary/30 rounded-3xl flex gap-4 items-center">
                  <Heart className="h-10 w-10 text-primary" />
                  <div>
                    <h4 className="font-bold">Pasión por el Detalle</h4>
                    <p className="text-sm text-muted-foreground">Cada costura está pensada para resistir el ritmo del hospital.</p>
                  </div>
               </div>
               <div className="p-6 bg-accent/10 rounded-3xl flex gap-4 items-center">
                  <Shield className="h-10 w-10 text-accent-foreground" />
                  <div>
                    <h4 className="font-bold">Calidad Certificada</h4>
                    <p className="text-sm text-muted-foreground">Usamos telas que no destiñen y son fáciles de lavar.</p>
                  </div>
               </div>
               <div className="p-6 bg-primary/10 rounded-3xl flex gap-4 items-center">
                  <Sparkles className="h-10 w-10 text-primary" />
                  <div>
                    <h4 className="font-bold">Diseño Argentino</h4>
                    <p className="text-sm text-muted-foreground">Orgullosamente fabricado por manos locales con visión global.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
