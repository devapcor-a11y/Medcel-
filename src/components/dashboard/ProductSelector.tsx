'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';

export function ProductSelector({
  productos: initialProductos,
  categorias = [],
  etiquetas = [],
}: {
  productos: any[];
  categorias?: any[];
  etiquetas?: any[];
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('none');
  const [productosList, setProductosList] = React.useState(initialProductos);

  // Dialog State
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newProdName, setNewProdName] = React.useState('');
  const [newProdPriceUsd, setNewProdPriceUsd] = React.useState('');
  const [newProdPriceArs, setNewProdPriceArs] = React.useState('');
  const [newProdCat, setNewProdCat] = React.useState('none');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);

  const toggleTag = (id: string) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter((t) => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  // Hidden input for the FormData
  const selectedProduct = productosList.find((p) => p.id === value);

  const handleCreateProduct = async () => {
    if (!newProdName || (!newProdPriceUsd && !newProdPriceArs)) {
      return toast.error('Completar nombre y al menos un precio');
    }

    setIsCreating(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('productos')
      .insert({
        nombre: newProdName,
        precio_usd: newProdPriceUsd ? parseFloat(newProdPriceUsd) : null,
        precio_ars: newProdPriceArs ? parseFloat(newProdPriceArs) : null,
        categoria_id: newProdCat !== 'none' ? newProdCat : null,
        estado: 'disponible',
        created_by: user?.id,
      })
      .select()
      .single();

    if (error || !data) {
      toast.error('Error al crear producto');
      setIsCreating(false);
      return;
    }

    if (selectedTags.length > 0) {
      const tagsToInsert = selectedTags.map((etiqueta_id) => ({
        producto_id: data.id,
        etiqueta_id,
      }));
      await supabase.from('productos_etiquetas').insert(tagsToInsert);
    }

    toast.success('Producto creado y seleccionado');
    setProductosList((prev) => [...prev, data]);
    setValue(data.id);
    setDialogOpen(false);
    setNewProdName('');
    setNewProdPriceUsd('');
    setNewProdPriceArs('');
    setNewProdCat('none');
    setSelectedTags([]);
    setIsCreating(false);
    setOpen(false); // Close combobox if it was open
  };

  return (
    <>
      <input type="hidden" name="producto_id" value={value} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {value === 'none'
              ? 'Ninguno seleccionado...'
              : selectedProduct?.nombre || 'Producto seleccionado...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar producto..." />
            <CommandList>
              <CommandEmpty className="p-2 text-center text-sm">
                No se encontraron productos.
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="none"
                  onSelect={() => {
                    setValue('none');
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === 'none' ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  Ninguno (Sin Asociar)
                </CommandItem>
                {productosList.map((producto) => (
                  <CommandItem
                    key={producto.id}
                    value={producto.id}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? 'none' : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === producto.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {producto.nombre}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  setDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear nuevo producto
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alta de Producto Rápida</DialogTitle>
            <DialogDescription>
              Crea un producto rápidamente para asociarlo a esta transacción.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Producto</Label>
              <Input
                placeholder="Ej. Mouse Inalámbrico"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio Venta (ARS $)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newProdPriceArs}
                  onChange={(e) => setNewProdPriceArs(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio Venta (USD)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newProdPriceUsd}
                  onChange={(e) => setNewProdPriceUsd(e.target.value)}
                />
              </div>
            </div>
            {categorias.length > 0 && (
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newProdCat}
                  onChange={(e) => setNewProdCat(e.target.value)}
                >
                  <option value="none">Sin Categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {etiquetas.length > 0 && (
              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex flex-wrap gap-2">
                  {etiquetas.map((e) => (
                    <Badge
                      key={e.id}
                      variant={
                        selectedTags.includes(e.id) ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTag(e.id)}
                    >
                      {e.nombre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={isCreating} onClick={handleCreateProduct}>
              Guardar y Seleccionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
