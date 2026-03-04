'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createUsuario } from './actions';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function NuevoUsuarioModal({ centros }: { centros: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Agregar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form
          action={async (formData) => {
            setLoading(true);
            try {
              const result = await createUsuario(formData);
              if (result?.error) {
                toast.error('Error al crear usuario', {
                  description: result.error,
                });
              } else {
                toast.success('Usuario creado', {
                  description:
                    'El nuevo usuario ha sido añadido y podrá iniciar sesión.',
                });
                setOpen(false);
              }
            } catch (err) {
              toast.error('Error inesperado');
            } finally {
              setLoading(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Añade un usuario para otorgarle acceso a la plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="******"
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Opcional"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="centro" className="text-right">
                Caja
              </Label>
              <div className="col-span-3">
                <Select name="centro_de_costos_id" defaultValue="null">
                  <SelectTrigger id="centro">
                    <SelectValue placeholder="Seleccionar caja (Opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">
                      Ninguna (Solo visualiza)
                    </SelectItem>
                    {centros.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
