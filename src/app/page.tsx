import { Hero } from '@/components/Hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShieldCheck, Truck, Palette } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      
      {/* Features Section */}
      <section className="bg-secondary/30 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Palette className="h-6 w-6 text-primary" />}
              title="Diseños Únicos"
              description="Cofias y ambos con estampados exclusivos que no encontrarás en otro lugar."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-6 w-6 text-primary" />}
              title="Calidad Médica"
              description="Telas resistentes, antibacteriales y de fácil lavado para tu día a día."
            />
            <FeatureCard 
              icon={<Heart className="h-6 w-6 text-primary" />}
              title="Hecho con Amor"
              description="Atención al detalle en cada costura y terminación de nuestras prendas."
            />
            <FeatureCard 
              icon={<Truck className="h-6 w-6 text-primary" />}
              title="Envíos a todo el país"
              description="Recibe tus productos Medcel en la puerta de tu casa o consultorio."
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Nuestras Categorías</h2>
            <p className="mt-4 text-lg text-muted-foreground">Encuentra el estilo que mejor te representa.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/productos?categoria=ambos" className="group relative overflow-hidden rounded-3xl h-[400px]">
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent text-white">
                <Badge className="mb-4 bg-accent text-accent-foreground border-none">Lo más buscado</Badge>
                <h3 className="text-3xl font-bold">Ambos Médicos</h3>
                <p className="mt-2 text-white/80">Confort y elegancia en cada turno.</p>
              </div>
            </Link>
            
            <Link href="/productos?categoria=cofias" className="group relative overflow-hidden rounded-3xl h-[400px]">
              <div className="absolute inset-0 bg-secondary group-hover:bg-secondary/80 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent text-white">
                <Badge className="mb-4 bg-primary text-primary-foreground border-none">Personalizables</Badge>
                <h3 className="text-3xl font-bold">Cofias con Diseño</h3>
                <p className="mt-2 text-white/80">Dale color a tu uniforme de trabajo.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold sm:text-4xl text-foreground">Destacados de la Temporada</h2>
              <p className="mt-4 text-lg text-muted-foreground">Calidad que se siente, diseño que se nota.</p>
            </div>
            <Button variant="outline" className="rounded-full border-2">Ver todos los productos</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard 
              name="Ambo Essential Teal"
              category="Ambos"
              price="$45.000"
              color="bg-primary"
              label="Bestseller"
            />
            <ProductCard 
              name="Cofia Floral Soft Pink"
              category="Cofias"
              price="$8.500"
              color="bg-secondary"
            />
            <ProductCard 
              name="Ambo Night Blue"
              category="Ambos"
              price="$48.000"
              color="bg-slate-800"
              label="Nuevo"
            />
            <ProductCard 
              name="Cofia Honey Yellow"
              category="Cofias"
              price="$8.500"
              color="bg-accent"
            />
          </div>
        </div>
      </section>

      {/* Newsletter/CTA */}
      <section className="bg-primary text-primary-foreground py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">¿Buscas un diseño personalizado?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Podemos bordar tu nombre, logo de clínica o crear un patrón exclusivo para tu equipo.
          </p>
          <Button size="lg" variant="secondary" className="rounded-full px-10 h-14 text-lg font-bold">
            Hablar con un asesor
          </Button>
        </div>
      </section>

      {/* Footer Placeholder */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold tracking-tighter text-primary">
            MED<span className="text-accent">CEL</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/nosotros" className="hover:text-primary">Nosotros</Link>
            <Link href="/contacto" className="hover:text-primary">Contacto</Link>
            <Link href="/terminos" className="hover:text-primary">Términos</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Medcel. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none bg-transparent shadow-none text-center group">
      <CardContent className="pt-6">
        <div className="mb-4 inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-primary/10 transition-transform group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProductCard({ name, category, price, color, label }: { name: string, category: string, price: string, color: string, label?: string }) {
  return (
    <div className="group space-y-4">
      <div className={`relative aspect-[3/4] overflow-hidden rounded-3xl ${color} flex items-center justify-center`}>
        {label && (
          <Badge className="absolute top-4 left-4 bg-white text-black hover:bg-white/90 border-none shadow-sm">
            {label}
          </Badge>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/10 flex items-center justify-center">
          <Button variant="secondary" className="rounded-full shadow-lg">Ver Detalles</Button>
        </div>
        {/* Placeholder for product shadow/depth */}
        <div className="w-1/2 h-2/3 bg-white/10 rounded-2xl border border-white/20 blur-sm transform group-hover:scale-110 transition-transform" />
      </div>
      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{category}</p>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{name}</h3>
          </div>
          <p className="font-bold text-lg">{price}</p>
        </div>
      </div>
    </div>
  );
}
