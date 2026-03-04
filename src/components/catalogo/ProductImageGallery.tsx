'use client';

import * as React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ImageOff } from 'lucide-react';

export function ProductImageGallery({
  fotos,
  etiquetas,
  nombre,
}: {
  fotos: any[];
  etiquetas: any[];
  nombre: string;
}) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(
    fotos.length > 0 ? fotos[0].url : null
  );

  return (
    <div className="flex w-full flex-col gap-4 overflow-hidden">
      {/* Visualizador Grande */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border/50 bg-muted/20">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={nombre}
            fill
            className="object-contain"
            priority
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/30">
            <ImageOff className="mb-2 h-16 w-16" />
            <span>Sin imagen</span>
          </div>
        )}

        {/* Etiquetas flotando */}
        {etiquetas.length > 0 && (
          <div className="absolute left-3 top-3 flex max-w-[90%] flex-wrap gap-2">
            {etiquetas.map((etiq: any) => (
              <Badge
                key={etiq.id}
                variant="secondary"
                className="border-transparent bg-background/90 text-sm shadow-sm backdrop-blur-md"
              >
                {etiq.nombre}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Tira inferior scrolleable de miniaturas */}
      {fotos.length > 1 && (
        <div className="scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/50 flex gap-2 overflow-x-auto pb-2">
          {fotos.map((foto: any) => {
            const isSelected = selectedImage === foto.url;
            return (
              <div
                key={foto.id}
                onClick={() => setSelectedImage(foto.url)}
                className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2 outline-none transition-all duration-200 hover:opacity-80 active:scale-95 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 ring-offset-1'
                    : 'border-transparent'
                }`}
              >
                <Image
                  src={foto.url}
                  alt={`Miniatura ${nombre}`}
                  fill
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
