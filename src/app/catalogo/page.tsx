import { createClient } from '@/utils/supabase/server';
import {
  fetchExchangeRate,
  getActiveExchangeRate,
  formatArs,
  formatUsd,
} from '@/utils/currency';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ImageOff, Store } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ExchangeRate {
  venta: number;
}

interface Product {
  id: string;
  nombre: string;
  precio_ars?: number | null;
  precio_usd?: number | null;
  categorias?: { nombre: string } | null;
  producto_fotos?: { url: string }[];
  productos_etiquetas?: { etiquetas: { id: string; nombre: string } }[];
}

// Simple helper component for displaying individual products in the grid
function ProductCard({
  producto,
  exchangeRate,
  config,
}: {
  producto: Product;
  exchangeRate: ExchangeRate;
  config: Record<string, string>;
}) {
  const fotos = producto.producto_fotos || [];
  const thumbnail = fotos.length > 0 ? fotos[0].url : null;
  const etiquetas =
    producto.productos_etiquetas?.map((pe) => pe.etiquetas) || [];

  // Resolve prices (we ensure at least one exists via DB constraint)
  const precioArs =
    producto.precio_ars || (producto.precio_usd || 0) * exchangeRate.venta;
  const precioUsd =
    producto.precio_usd || (producto.precio_ars || 0) / exchangeRate.venta;

  // Parse contact number safely
  const rawContact = config['contacto_whatsapp'] || '5491100000000';
  const waLink = `https://wa.me/${rawContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola! Me interesa el producto: ${producto.nombre}`)}`;

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 transition-shadow duration-200 hover:shadow-md">
      <Link
        href={`/catalogo/${producto.id}`}
        className="relative block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-muted/30">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={`Imagen del producto: ${producto.nombre}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <ImageOff className="h-10 w-10 text-muted-foreground/30" />
          )}

          {etiquetas.length > 0 && (
            <div className="absolute left-2 top-2 flex max-w-[90%] flex-wrap gap-1">
              {etiquetas.map((etiq: any) => (
                <Badge
                  key={etiq.id}
                  variant="secondary"
                  className="border-transparent bg-background/80 text-xs shadow-sm backdrop-blur-sm"
                >
                  {etiq.nombre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>

      <CardContent className="flex w-full min-w-0 flex-1 flex-col p-4">
        <Link
          href={`/catalogo/${producto.id}`}
          className="group block focus:outline-none"
        >
          <div className="mb-1 line-clamp-1 break-words text-xs font-medium text-primary group-hover:underline">
            {producto.categorias?.nombre || 'Sin Categoria'}
          </div>
          <h3 className="mb-2 line-clamp-2 break-words text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {producto.nombre}
          </h3>
        </Link>

        <div className="mt-auto flex flex-col gap-1 pt-2">
          <div className="text-lg font-bold text-foreground">
            {formatArs(precioArs)}
          </div>
          <div className="text-xs font-medium text-muted-foreground">
            o {formatUsd(precioUsd)}
          </div>

          <Button
            asChild
            size="sm"
            className="mt-4 w-full border-transparent bg-green-600 text-white hover:bg-green-700"
          >
            <Link
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Consultar por ${producto.nombre} en WhatsApp`}
            >
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Consultar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { categoria?: string; query?: string };
}) {
  const supabase = createClient();
  const exchangeRate = await getActiveExchangeRate(supabase);

  // Fetch configs
  const { data: configs } = await supabase.from('configuracion').select('*');
  const configMap: Record<string, string> = {};
  configs?.forEach((c) => {
    // We stored JSONB, so it might be wrapped in quotes
    let val = c.valor;
    if (typeof val === 'string' && val.startsWith('"')) {
      val = JSON.parse(val);
    }
    configMap[c.clave] = val;
  });

  const nombreTienda = configMap['nombre_tienda'] || 'DigiBrain';

  // Build query
  let supabaseQuery = supabase
    .from('productos')
    .select(
      `
      *,
      categorias ( id, nombre, slug ),
      producto_fotos ( id, url, orden ),
      productos_etiquetas (
        etiquetas ( id, nombre, slug, color )
      )
    `
    )
    .eq('estado', 'disponible')
    .order('fecha_carga', { ascending: false });

  if (searchParams.categoria) {
    // First find category id by slug
    const { data: cat } = await supabase
      .from('categorias')
      .select('id')
      .eq('slug', searchParams.categoria)
      .single();
    if (cat?.id) {
      supabaseQuery = supabaseQuery.eq('categoria_id', cat.id);
    }
  }

  if (searchParams.query) {
    supabaseQuery = supabaseQuery.ilike('nombre', `%${searchParams.query}%`);
  }

  const { data: productos, error } = await supabaseQuery;
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/catalogo"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary transition-opacity hover:opacity-80"
          >
            {/* Filtro CSS para convertir cualquier ícono oscuro/negro a un color Naranja/Primario de la marca */}
            <img
              src="/favicon.ico"
              alt="Logo"
              className="h-6 w-6 object-contain"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(58%) sepia(87%) saturate(3015%) hue-rotate(345deg) brightness(101%) contrast(100%)',
              }}
            />
            {nombreTienda}
          </Link>
          <div className="hidden text-xs font-medium text-muted-foreground sm:block">
            Cotización: 1 USD = {formatArs(exchangeRate.venta)}
          </div>
        </div>
      </header>

      <main className="container relative mx-auto flex flex-1 flex-col gap-6 px-4 py-8 md:flex-row">
        {/* Categories Horizontal Scroll (Mobile) / Sidebar (Desktop) */}
        <aside className="w-full flex-shrink-0 md:w-64">
          <div>
            <h3 className="mb-3 hidden font-semibold text-foreground md:block">
              Categorías
            </h3>
            <ul className="scrollbar-none flex flex-row gap-2 overflow-x-auto pb-2 md:max-h-[60vh] md:flex-col md:space-y-1.5 md:overflow-y-auto md:pr-2">
              <li className="flex-shrink-0">
                <Link
                  href="/catalogo"
                  className={`block rounded-md px-4 py-2 text-sm transition-colors md:px-3 md:py-1.5 ${!searchParams.categoria ? 'bg-primary/10 font-medium text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                >
                  Todas
                </Link>
              </li>
              {categorias?.map((cat) => (
                <li key={cat.id} className="flex-shrink-0">
                  <Link
                    href={`/catalogo?categoria=${cat.slug}`}
                    className={`block rounded-md px-4 py-2 text-sm transition-colors md:px-3 md:py-1.5 ${searchParams.categoria === cat.slug ? 'bg-primary/10 font-medium text-primary' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                  >
                    {cat.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 border-b border-border/50 pb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {searchParams.categoria
                ? categorias?.find((c) => c.slug === searchParams.categoria)
                    ?.nombre || 'Catálogo'
                : 'Todos los productos'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {productos?.length || 0} productos encontrados
            </p>
          </div>

          {!productos || productos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Store className="mb-4 h-12 w-12 text-muted-foreground/20" />
              <h3 className="text-lg font-medium text-foreground">
                No encontramos productos.
              </h3>
              <p className="mt-1 max-w-sm text-muted-foreground">
                No hay productos disponibles en esta categoría o los resultados
                de tu búsqueda están vacíos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {productos.map((prod) => (
                <ProductCard
                  key={prod.id}
                  producto={prod}
                  exchangeRate={exchangeRate}
                  config={configMap}
                />
              ))}
            </div>
          )}
        </div>
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
