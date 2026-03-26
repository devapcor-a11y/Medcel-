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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateTransaction } from '@/app/dashboard/finanzas/actions';
import { ProductSelector } from './ProductSelector';

export default function EditarTransaccionForm({
  cajas,
  productos,
  transaccion,
}: {
  cajas: any[];
  productos: any[];
  transaccion: any;
}) {
  const [tipoMovimiento, setTipoMovimiento] = useState(transaccion.tipo);

  return (
    <form action={updateTransaction}>
      <input type="hidden" name="transaction_id" value={transaccion.id} />

      <CardHeader>
        <CardTitle>Editar Movimiento</CardTitle>
        <CardDescription>
          Modifica los valores de esta transacción. (Los ajustes de stock
          automáticos en productos ya vendidos o comprados pueden requerir
          intervención manual si cambias el tipo o producto).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Movimiento</Label>
            <Select
              name="tipo"
              defaultValue={transaccion.tipo}
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
              defaultValue={transaccion.centro_de_costos_id}
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
            <Select
              name="centro_destino_id"
              defaultValue={transaccion.centro_destino_id || 'none'}
            >
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monto">Monto numérico</Label>
            <Input
              name="monto"
              id="monto"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={transaccion.monto}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moneda">Moneda de Pago</Label>
            <Select name="moneda" defaultValue={transaccion.moneda} required>
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

        {tipoMovimiento === 'gasto' && (
          <div className="flex items-center space-x-2 rounded-md border p-4 shadow-sm">
            <Checkbox
              id="ignorar_balance"
              name="ignorar_balance"
              defaultChecked={transaccion.ignorar_balance}
            />
            <div className="space-y-1">
              <Label htmlFor="ignorar_balance" className="font-medium cursor-pointer">
                Ignorar en Rentabilidad
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Si activas esto, este gasto no restará en los cálculos de
                rentabilidad (dashboards y reportes).
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="producto_id">Producto Asociado (Opcional)</Label>
          <div className="pointer-events-none opacity-50">
            {/* The product selector is disabled in edition to avoid stock desynchronization errors. They should delete and recreate the transaction if they made a mistake on the product */}
            <Input
              value={transaccion.productos?.nombre || 'Ninguno'}
              readOnly
            />
            <input
              type="hidden"
              name="producto_id"
              value={transaccion.producto_id || 'none'}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Para cambiar el producto de una transacción es recomendable eliminar
            la operación y crearla de nuevo para mantener el stock exacto.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción / Notas</Label>
          <Input
            name="descripcion"
            id="descripcion"
            defaultValue={transaccion.descripcion || ''}
          />
        </div>

        <Button type="submit" className="mt-6 w-full">
          Guardar Cambios
        </Button>
      </CardContent>
    </form>
  );
}
