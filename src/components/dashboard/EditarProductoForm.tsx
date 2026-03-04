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
import { updateProduct } from '@/app/dashboard/productos/actions';

export default function EditarProductoForm({
  producto,
  categorias,
  etiquetas,
}: {
  producto: any;
  categorias: any[];
  etiquetas: any[];
}) {
  const supabase = createClient();
  const router = useRouter();

  // Initialize with product's existing data
  const initialTags =
    producto.productos_etiquetas?.map((pe: any) => pe.etiqueta_id) || [];
  const initialFotos =
    producto.producto_fotos
      ?.sort((a: any, b: any) => a.orden - b.orden)
      .map((f: any) => f.url) || [];

  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [fotosUrls, setFotosUrls] = useState<string[]>(initialFotos);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriaId, setCategoriaId] = useState<string>(
    producto.categoria_id || 'none'
  );
  const [estado, setEstado] = useState<string>(producto.estado || 'disponible');
  const [isDragging, setIsDragging] = useState(false);

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter((t) => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  const processFiles = async (files: File[]) => {
    try {
      setUploading(true);
      if (!files || files.length === 0) return;

      const newUrls: string[] = [];

      await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `productos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('public_assets')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error al subir', uploadError.message);
            alert(
              `Error al subir imagen ${file.name} (${uploadError.message})`
            );
            return;
          }

          const { data } = supabase.storage
            .from('public_assets')
            .getPublicUrl(filePath);

          if (data?.publicUrl) {
            newUrls.push(data.publicUrl);
          }
        })
      );

      if (newUrls.length > 0) {
        setFotosUrls((prev) => [...prev, ...newUrls]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFoto = (index: number) => {
    setFotosUrls(fotosUrls.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-sm">
      <form
        action={async (formData) => {
          setIsSubmitting(true);
          // Append ID and controlled arrays to formData
          formData.append('id', producto.id);
          selectedTags.forEach((id) => formData.append('etiquetas[]', id));
          fotosUrls.forEach((url) => formData.append('fotos[]', url));

          // Call the server action and capture possible validation errors
          const response = await updateProduct(formData);
          if (response?.error) {
            alert(response.error);
            setIsSubmitting(false);
          }
          // The form will unmount automatically if it redirects successfully.
        }}
      >
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
          <CardDescription>
            Modifica la información y atributos del producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              name="nombre"
              id="nombre"
              required
              defaultValue={producto.nombre}
              placeholder="Ej: Notebook Lenovo ThinkPad T14"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              name="descripcion"
              id="descripcion"
              rows={4}
              defaultValue={producto.descripcion || ''}
              placeholder="Detalles de hardware, estado, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria_id">Categoría</Label>
              <input type="hidden" name="categoria_id" value={categoriaId} />
              <Select value={categoriaId} onValueChange={setCategoriaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin Categoría</SelectItem>
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
              <input type="hidden" name="estado" value={estado} />
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado actual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible (Web)</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                  <SelectItem value="reservado">
                    Oculto / En Pausa (Forzar Baja Web)
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
                defaultValue={producto.precio_ars || ''}
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
                defaultValue={producto.precio_usd || ''}
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
                    alt={`Vista previa de la foto ${i + 1}`}
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

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative flex min-h-[6rem] min-w-[6rem] flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Label
                  htmlFor="upload_foto"
                  className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-4"
                >
                  <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-center text-xs font-medium">
                    {uploading
                      ? 'Subiendo...'
                      : 'Arrastra imágenes o haz click'}
                  </span>
                  <Input
                    id="upload_foto"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </Label>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
            {isSubmitting ? 'Guardando cambios...' : 'Guardar Cambios'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
