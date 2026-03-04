import { createClient } from '@/utils/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditarUsuarioModal } from './EditarUsuarioModal';
import { NuevoUsuarioModal } from './NuevoUsuarioModal';

export default async function UsuariosPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, centros_de_costos(nombre)')
    .order('created_at', { ascending: false });

  const { data: centros } = await supabase
    .from('centros_de_costos')
    .select('*')
    .order('nombre');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona los usuarios de la plataforma y asigna sus cajas o centros
            de costo.
          </p>
        </div>
        <NuevoUsuarioModal centros={centros || []} />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Lista de Usuarios
          </CardTitle>
          <CardDescription>
            Existen {profiles?.length || 0} usuarios registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Caja / Centro de Costos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles && profiles.length > 0 ? (
                  profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.email}
                      </TableCell>
                      <TableCell>{profile.nombre || 'Sin nombre'}</TableCell>
                      <TableCell>
                        {/* @ts-ignore */}
                        {profile.centros_de_costos?.nombre || 'Ninguna'}
                      </TableCell>
                      <TableCell className="text-right">
                        <EditarUsuarioModal
                          usuario={profile}
                          centros={centros || []}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No hay usuarios registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
