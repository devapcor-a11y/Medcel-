'use client';

import { useState } from 'react';
import {
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
import { createTransaction } from '@/app/dashboard/finanzas/actions';
import { ProductSelector } from './ProductSelector';

export default function NuevaTransaccionForm({
  cajas,
  productos,
  categorias,
  etiquetas,
}: {
  cajas: any[];
  productos: any[];
  categorias: any[];
  etiquetas: any[];
}) {
  const [tipoMovimiento, setTipoMovimiento] = useState('venta');

  return (
    <form action={createTransaction}>
      <CardHeader>
        <CardTitle>Detalles del Movimiento</CardTitle>
        <CardDescription>
          Completa los campos con cuidado. Una vez registrado, podrás verlo en
          el historial.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Movimiento</Label>
            <Select
              name="tipo"
              defaultValue="venta"
              required
              onValueChange={setTipoMovimiento}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venta">Venta (Ingreso)</SelectItem>
                <SelectItem value="compra">Compra (Egreso)</SelectItem>
                <SelectItem value="gasto">
                  Gasto / Operativo (Egreso)
                </SelectItem>
                <SelectItem value="transferencia">
                  Transferencia a otra caja
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="centro_de_costos_id">Caja Afectada (Origen)</Label>
            <Select
              name="centro_de_costos_id"
              required
              defaultValue={cajas[0]?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Caja" />
              </SelectTrigger>
              <SelectContent>
                {cajas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {tipoMovimiento === 'transferencia' && (
          <div className="space-y-2">
            <Label htmlFor="centro_destino_id">
              Caja Destino (Solo para Transferencias)
            </Label>
            <Select name="centro_destino_id">
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Caja Destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno / No Aplica</SelectItem>
                {cajas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="monto">Monto numérico</Label>
            <Input
              name="monto"
              id="monto"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moneda">Moneda de Pago</Label>
            <Select name="moneda" defaultValue="USD" required>
              <SelectTrigger>
                <SelectValue placeholder="Moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                <SelectItem value="USD">Dólares (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {tipoMovimiento !== 'transferencia' && (
          <div className="space-y-2">
            <Label htmlFor="producto_id">Producto Asociado</Label>
            <ProductSelector
              productos={productos}
              categorias={categorias}
              etiquetas={etiquetas}
            />
            <p className="text-[11px] text-muted-foreground">
              Si registras una venta, se restará stock. En compra, aumentará
              stock.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción / Notas</Label>
          <Input
            name="descripcion"
            id="descripcion"
            placeholder="Ej: Venta auricular bluetooth a Juan"
          />
        </div>

        <Button type="submit" className="mt-6 w-full">
          Confirmar Transacción
        </Button>
      </CardContent>
    </form>
  );
}
