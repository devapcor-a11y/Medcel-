import { Hero } from '@/components/Hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShieldCheck, Truck, Palette, ImageOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { fetchExchangeRate, formatArs } from '@/utils/currency';

export default async function Home() {
  const supabase = createClient();
  const exchangeRate = await fetchExchangeRate('blue');

  const { data: destacados } = await supabase
    .from('productos')
    .select(`
       *,
       categorias ( nombre ),
       producto_fotos ( url )
    `)
    .eq('estado', 'disponible')
    .eq('destacado', true)
    .order('fecha_carga', { ascending: false })
    .limit(4);

  const finalDestacados = destacados || [];
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
              <Image 
                src="https://ednfywcgvrolnqulwwco.supabase.co/storage/v1/object/public/public_assets/productos/AmbosMedicosHeroPagina.png" 
                alt="Ambos Médicos" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                <Badge className="mb-4 bg-accent text-accent-foreground border-none">Lo más buscado</Badge>
                <h3 className="text-3xl font-bold">Ambos Médicos</h3>
                <p className="mt-2 text-white/80">Confort y elegancia en cada turno.</p>
              </div>
            </Link>
            
            <Link href="/productos?categoria=cofias" className="group relative overflow-hidden rounded-3xl h-[400px]">
              <Image 
                src="https://ednfywcgvrolnqulwwco.supabase.co/storage/v1/object/public/public_assets/productos/medcel_ambos34.png" 
                alt="Cofias con Diseño" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
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
            <Button variant="outline" className="rounded-full border-2" asChild>
               <Link href="/productos">Ver todos los productos</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {finalDestacados.length > 0 ? (
              finalDestacados.map((prod: any) => {
                 const thumb = prod.producto_fotos?.[0]?.url;
                 const finalPrice = formatArs(prod.precio_ars || (prod.precio_usd || 0) * exchangeRate.venta);
                 return (
                   <ProductCard 
                     key={prod.id}
                     id={prod.id}
                     name={prod.nombre}
                     category={prod.categorias?.nombre || 'General'}
                     price={finalPrice}
                     imageUrl={thumb}
                     label={prod.destacado ? "Destacado" : undefined}
                   />
                 )
              })
            ) : (
               <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center text-muted-foreground py-12 border rounded-xl bg-muted/10">
                 No hay productos destacados por el momento.
               </div>
            )}
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

function ProductCard({ id, name, category, price, imageUrl, label }: { id: string, name: string, category: string, price: string, imageUrl?: string, label?: string }) {
  return (
    <Link href={`/productos/${id}`} className="group space-y-4 cursor-pointer block rounded-3xl outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
      <div className={`relative aspect-[3/4] overflow-hidden rounded-3xl bg-muted/30 flex items-center justify-center border border-border/50`}>
        {imageUrl ? (
           <Image src={imageUrl} alt={name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
           <ImageOff className="h-10 w-10 text-muted-foreground/30" />
        )}
        
        {label && (
          <Badge className="absolute top-4 left-4 bg-white text-black hover:bg-white/90 border-none shadow-sm z-10 font-semibold">
            {label}
          </Badge>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/20 flex items-center justify-center z-10 backdrop-blur-[2px]">
          <Button variant="secondary" className="rounded-full shadow-lg font-bold pointer-events-none">Ver Detalles</Button>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <p className="text-sm text-primary font-semibold mb-1 uppercase tracking-wider">{category}</p>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">{name}</h3>
          </div>
          <p className="font-extrabold text-lg text-foreground whitespace-nowrap">{price}</p>
        </div>
      </div>
    </Link>
  );
}
