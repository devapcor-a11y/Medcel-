import { createClient } from '@/utils/supabase/server';
import { fetchExchangeRate, formatArs, formatUsd } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Instagram,
  ImageOff,
  ArrowLeft,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ProductImageGallery } from '@/components/catalogo/ProductImageGallery';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('productos')
    .select('nombre, descripcion, producto_fotos(url)')
    .eq('id', params.id)
    .single();

  if (!product) return { title: 'Producto no encontrado' };

  const mainImage = product.producto_fotos?.[0]?.url || '/opengraph-image.png';

  return {
    title: product.nombre,
    description: product.descripcion || 'Mira este producto en nuestro catálogo.',
    openGraph: {
      title: product.nombre,
      description:
        product.descripcion || 'Mira este producto en nuestro catálogo.',
      images: [
        {
          url: mainImage,
          width: 500,
          height: 500,
          alt: product.nombre,
        },
      ],
    },
  };
}

export default async function DetalleProductoPublicoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const exchangeRate = await fetchExchangeRate('blue');

  // Fetch configs
  const { data: configs } = await supabase.from('configuracion').select('*');
  const configMap: Record<string, string> = {};
  configs?.forEach((c) => {
    let val = c.valor;
    if (typeof val === 'string' && val.startsWith('"')) {
      val = JSON.parse(val);
    }
    configMap[c.clave] = val;
  });

  const nombreTienda = configMap['nombre_tienda'] || 'Medcel';
  const rawWaConfig = configMap['contacto_whatsapp'] || '5491100000000';
  const rawIgConfig = configMap['contacto_instagram'] || ''; // username e.g. "mi_tienda"

  // Check valid UUID to avoid postgres crash
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    notFound();
  }

  // Fetch Main Product
  const { data: product } = await supabase
    .from('productos')
    .select(
      `
      *,
      categorias ( id, nombre, slug ),
      producto_fotos ( id, url, orden ),
      producto_variantes ( id, talle, stock ),
      productos_etiquetas (
        etiquetas ( id, nombre, slug, color )
      )
    `
    )
    .eq('id', params.id)
    .single();

  if (!product || product.estado !== 'disponible') {
    notFound();
  }

  const fotos = product.producto_fotos || [];
  const mainImage = fotos.length > 0 ? fotos[0].url : null;
  const etiquetas =
    product.productos_etiquetas?.map((pe: any) => pe.etiquetas) || [];

  const precioArs =
    product.precio_ars || (product.precio_usd || 0) * exchangeRate.venta;
  const precioUsd =
    product.precio_usd || (product.precio_ars || 0) / exchangeRate.venta;

  const waLink = `https://wa.me/${rawWaConfig.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola! Me interesa el producto: ${product.nombre}`)}`;
  // Fallback to profile if direct doesn't work for web, but usually ig.me/m/username or instagram.com/username works
  const igLink = rawIgConfig.includes('instagram.com')
    ? rawIgConfig
    : `https://instagram.com/${rawIgConfig.replace('@', '')}`;

  // Fetch Related Products
  let relatedProducts: any[] = [];
  if (product.categoria_id) {
    const { data: rel } = await supabase
      .from('productos')
      .select(
        `
         *,
         categorias ( nombre ),
         producto_fotos ( url )
       `
      )
      .eq('categoria_id', product.categoria_id)
      .eq('estado', 'disponible')
      .neq('id', product.id)
      .order('fecha_carga', { ascending: false })
      .limit(4);
    relatedProducts = rel || [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header duplicated from catalog page for continuity */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/productos"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary transition-opacity hover:opacity-80"
          >
            {nombreTienda}
          </Link>
          <div className="hidden text-xs font-medium text-muted-foreground sm:block">
            Cotización: 1 USD = {formatArs(exchangeRate.venta)}
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Link
          href={`/productos${product.categorias?.slug ? `?categoria=${product.categorias.slug}` : ''}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        {/* Main Product Layout */}
        <div className="grid w-full gap-6 md:grid-cols-2 lg:gap-12">
          {/* Image Gallery area */}
          <div className="w-full min-w-0">
            <ProductImageGallery
              fotos={fotos}
              etiquetas={etiquetas}
              nombre={product.nombre}
            />
          </div>

          {/* Product Info area */}
          <div className="flex w-full min-w-0 flex-col">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <span>{product.categorias?.nombre || 'Sin categoría'}</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground/80 lowercase">{product.sexo}</span>
            </div>
            <h1 className="mb-6 break-words text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {product.nombre}
            </h1>

            <div className="mb-6 flex flex-col gap-2 overflow-hidden rounded-xl border bg-card/40 p-4 shadow-sm md:p-6">
              <div className="text-3xl font-black text-foreground md:text-4xl">
                {formatArs(precioArs)}
              </div>
              <div className="break-words text-base font-medium text-muted-foreground md:text-lg">
                o {formatUsd(precioUsd)}
              </div>
            </div>

            {product.producto_variantes && product.producto_variantes.length > 0 && (
              <div className="mb-6">
                 <h3 className="mb-3 font-semibold text-foreground">Talles disponibles</h3>
                 <div className="flex flex-wrap gap-2">
                    {product.producto_variantes.map((v: any) => (
                      <Badge 
                        key={v.id} 
                        variant={v.stock > 0 ? "outline" : "secondary"}
                        className={`text-sm py-1.5 px-3 border-border ${v.stock <= 0 ? 'opacity-50 line-through' : 'font-medium'}`}
                      >
                        {v.talle}
                      </Badge>
                    ))}
                 </div>
              </div>
            )}

            <div className="prose prose-sm md:prose-base dark:prose-invert mb-10 text-muted-foreground">
              <h3 className="mb-2 font-semibold text-foreground">
                Descripción del producto
              </h3>
              {product.descripcion ? (
                <div className="whitespace-pre-wrap break-words">
                  {product.descripcion}
                </div>
              ) : (
                <p className="italic opacity-70">
                  Este producto no tiene descripción adicional.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-auto flex flex-col gap-3">
              <Button
                asChild
                size="lg"
                className="w-full bg-[#25D366] py-6 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-1 hover:bg-[#20bd5a]"
              >
                <Link href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Consultar por WhatsApp
                </Link>
              </Button>
              {rawIgConfig && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-pink-500/30 py-6 text-base font-semibold text-pink-600 transition-all hover:-translate-y-1 hover:bg-pink-50 hover:text-pink-700"
                >
                  <Link href={igLink} target="_blank" rel="noopener noreferrer">
                    <Instagram className="mr-2 h-5 w-5" />
                    Enviar mensaje directo por Instagram
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-border pt-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">
              También te podría interesar...
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {relatedProducts.map((rel) => {
                const thumb = rel.producto_fotos?.[0]?.url;
                const relPrecArs =
                  rel.precio_ars || (rel.precio_usd || 0) * exchangeRate.venta;
                const relPrecUsd =
                  rel.precio_usd || (rel.precio_ars || 0) / exchangeRate.venta;

                return (
                  <Card
                    key={rel.id}
                    className="flex h-full flex-col overflow-hidden border-border/50 transition-shadow hover:shadow-md"
                  >
                    <Link
                      href={`/catalogo/${rel.id}`}
                      className="group relative flex flex-1 flex-col focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-muted/30">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={rel.nombre}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <ImageOff className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <CardContent className="flex flex-1 flex-col p-4">
                        <div className="mb-1 text-xs text-primary">
                          {rel.categorias?.nombre || 'General'}
                        </div>
                        <h3 className="mb-2 line-clamp-2 break-words text-sm font-semibold transition-colors group-hover:text-primary">
                          {rel.nombre}
                        </h3>
                        <div className="mt-auto font-bold">
                          {formatArs(relPrecArs)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          o {formatUsd(relPrecUsd)}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} {nombreTienda}. Todos los derechos
          reservados.
        </div>
      </footer>
    </div>
  );
}
