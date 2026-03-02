'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, UploadCloud, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export default function NuevoProductoForm({
  categorias,
  etiquetas,
}: {
  categorias: any[];
  etiquetas: any[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fotosUrls, setFotosUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter((t) => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `productos/${fileName}`;

      // This assumes you set up a storage bucket called 'public_assets' in Supabase
      // It will fail if the bucket is not created via SQL or dashboard manually.
      // We'll wrap this in try-catch and alert user
      const { error: uploadError } = await supabase.storage
        .from('public_assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error al subir', uploadError.message);
        alert(
          'Error al subir imagen. Verifique que creó el bucket "public_assets" en Supabase.'
        );
        return;
      }

      const { data } = supabase.storage
        .from('public_assets')
        .getPublicUrl(filePath);
      if (data?.publicUrl) {
        setFotosUrls([...fotosUrls, data.publicUrl]);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFoto = (index: number) => {
    setFotosUrls(fotosUrls.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-sm">
      <form
        action={async (formData) => {
          setIsSubmitting(true);
          // Append controlled arrays to formData
          selectedTags.forEach((id) => formData.append('etiquetas[]', id));
          fotosUrls.forEach((url) => formData.append('fotos[]', url));

          try {
            // Calls the server action dynamically
            const { createProduct } =
              await import('@/app/dashboard/productos/actions');
            await createProduct(formData);
          } catch (error) {
            console.error(error);
            setIsSubmitting(false);
          }
        }}
      >
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
          <CardDescription>
            Completa todos los campos necesarios para publicarlo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              name="nombre"
              id="nombre"
              required
              placeholder="Ej: Notebook Lenovo ThinkPad T14"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              name="descripcion"
              id="descripcion"
              rows={4}
              placeholder="Detalles de hardware, estado, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria_id">Categoría</Label>
              <Select name="categoria_id">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin Categoría</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select name="estado" defaultValue="disponible">
                <SelectTrigger>
                  <SelectValue placeholder="Estado actual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible (Web)</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                  <SelectItem value="reservado">
                    Reservado / En Pausa
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio_ars">Precio ARS ($)</Label>
              <Input
                name="precio_ars"
                id="precio_ars"
                type="number"
                step="1"
                min="0"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio_usd">Precio USD (U$S)</Label>
              <Input
                name="precio_usd"
                id="precio_usd"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <p className="col-span-2 mt-[-8px] text-xs text-muted-foreground">
              Debes completar al menos uno. El otro se calculará automáticamente
              en el catálogo usando la tasa de cambio vigente.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Etiquetas Adicionales</Label>
            <div className="flex min-h-12 flex-wrap gap-2 rounded-md border border-border bg-muted/20 p-3">
              {etiquetas.map((e) => (
                <Badge
                  key={e.id}
                  variant={selectedTags.includes(e.id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleTag(e.id)}
                >
                  {e.nombre}
                </Badge>
              ))}
              {etiquetas.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No hay etiquetas creadas en la configuración.
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fotografías</Label>
            <div className="flex flex-wrap items-center gap-4">
              {fotosUrls.map((url, i) => (
                <div
                  key={url}
                  className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={url}
                    alt="Foto"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFoto(i)}
                    className="absolute right-1 top-1 rounded-full bg-destructive/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <Label
                htmlFor="upload_foto"
                className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:bg-muted"
              >
                <UploadCloud className="mb-1 h-6 w-6" />
                <span className="px-1 text-center text-[10px] font-medium">
                  {uploading ? 'Subiendo...' : 'Agregar Foto'}
                </span>
                <Input
                  id="upload_foto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
            {isSubmitting ? 'Guardando...' : 'Crear Producto'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
