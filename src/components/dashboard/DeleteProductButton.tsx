'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteProduct } from '@/app/dashboard/productos/actions';
import { toast } from 'sonner';

export default function DeleteProductButton({
  id,
  hasTransactions,
}: {
  id: string;
  hasTransactions: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={isPending || hasTransactions}
      title={
        hasTransactions
          ? 'No se puede eliminar porque tiene transacciones asociadas. Cambia su estado en edición.'
          : 'Eliminar permanente'
      }
      onClick={() => {
        if (
          !hasTransactions &&
          confirm(
            '¿Estás seguro de eliminar PERMANENTEMENTE este producto y todos sus metadatos (fotos/tags)?'
          )
        ) {
          startTransition(async () => {
            const result = await deleteProduct(id);
            if (result?.error) {
              toast.error(result.error);
            } else {
              toast.success('Producto eliminado con éxito');
            }
          });
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
