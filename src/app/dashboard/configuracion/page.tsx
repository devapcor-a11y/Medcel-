import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/utils/supabase/server';
import {
  addCategory,
  addTag,
  updateStoreSettings,
  addCentroCostos,
} from './actions';
import { Tags, FolderOpen, Store, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function ConfiguracionPage() {
  const supabase = createClient();

  // Fetch configurations
  const { data: configs } = await supabase.from('configuracion').select('*');
  const configMap: Record<string, string> = {};
  configs?.forEach((c) => {
    let val = c.valor;
    if (typeof val === 'string' && val.startsWith('"')) {
      val = JSON.parse(val);
    }
    configMap[c.clave] = val;
  });

  // Fetch catalogs
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre');
  const { data: etiquetas } = await supabase
    .from('etiquetas')
    .select('*')
    .order('nombre');
  const { data: centros } = await supabase
    .from('centros_de_costos')
    .select('*')
    .order('nombre');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajustes de la tienda, catálogo y preferencias de uso.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Store Profile */}
        <Card className="shadow-sm">
          <form action={updateStoreSettings}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" /> Perfil de la Tienda
              </CardTitle>
              <CardDescription>
                Información pública visible en el catálogo web.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_tienda">Nombre de la Tienda</Label>
                <Input
                  name="nombre_tienda"
                  id="nombre_tienda"
                  defaultValue={configMap['nombre_tienda'] || 'DigiBrain'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto_whatsapp">WhatsApp (Catálogo)</Label>
                <Input
                  name="contacto_whatsapp"
                  id="contacto_whatsapp"
                  defaultValue={configMap['contacto_whatsapp'] || ''}
                  placeholder="+5491100000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto_instagram">Instagram</Label>
                <Input
                  name="contacto_instagram"
                  id="contacto_instagram"
                  defaultValue={configMap['contacto_instagram'] || ''}
                  placeholder="@mitienda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_cambio_preferido">Cotización a usar</Label>
                <Select
                  name="tipo_cambio_preferido"
                  defaultValue={configMap['tipo_cambio_preferido'] || 'blue'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Dólar Blue</SelectItem>
                    <SelectItem value="oficial">Dólar Oficial</SelectItem>
                    <SelectItem value="mep">Dólar MEP</SelectItem>
                    <SelectItem value="cripto">Dólar Cripto (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="mt-4 w-full">
                Guardar Perfil
              </Button>
            </CardContent>
          </form>
        </Card>

        <div className="space-y-6">
          {/* Categories */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" /> Categorías
              </CardTitle>
              <CardDescription>
                Para clasificar productos en el catálogo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {categorias?.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    Sin categorías
                  </span>
                )}
                {categorias?.map((c) => (
                  <Badge key={c.id} variant="secondary">
                    {c.nombre}
                  </Badge>
                ))}
              </div>
              <form action={addCategory} className="flex gap-2">
                <Input
                  name="nombre"
                  placeholder="Nueva categoría..."
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  Agregar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" /> Etiquetas
              </CardTitle>
              <CardDescription>
                Multi-etiquetas para filtros (Ej: Usado, Oferta).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {etiquetas?.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    Sin etiquetas
                  </span>
                )}
                {etiquetas?.map((e) => (
                  <span
                    key={e.id}
                    className="rounded-md border border-border bg-muted px-2 py-1 text-xs"
                    style={{ borderLeftColor: e.color, borderLeftWidth: '3px' }}
                  >
                    {e.nombre}
                  </span>
                ))}
              </div>
              <form action={addTag} className="flex items-center gap-2">
                <Input
                  name="nombre"
                  placeholder="Nombre..."
                  required
                  className="flex-1"
                />
                <Input
                  name="color"
                  type="color"
                  defaultValue="#ED6D24"
                  className="h-10 w-12 cursor-pointer p-1"
                />
                <Button type="submit" variant="secondary">
                  Agregar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Centros de Costos */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Cajas / Centros de Costo
              </CardTitle>
              <CardDescription>
                Cajas o cuentas donde se registra el dinero (Ej: Efectivo,
                Banco, MercadoPago).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {centros?.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    Sin cajas
                  </span>
                )}
                {centros?.map((c) => (
                  <Badge
                    key={c.id}
                    variant="outline"
                    className="border-primary/50 text-foreground"
                  >
                    {c.nombre}
                  </Badge>
                ))}
              </div>
              <form action={addCentroCostos} className="flex gap-2">
                <Input
                  name="nombre"
                  placeholder="Nueva caja..."
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  Agregar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
